"use client"
import { Button } from "@/components/ui/button"
import { CheckCircle } from "lucide-react"
import Link from "next/link"
import { Navbar } from "@/components/navbar"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useToast } from "@/hooks/use-toast"

export default function PaymentSuccessPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const supabase = createClientComponentClient()
  const [isChecking, setIsChecking] = useState(true)
  const [retryCount, setRetryCount] = useState(0)
  const MAX_RETRIES = 3

  useEffect(() => {
    const checkSubscriptionStatus = async () => {
      try {
        // Verificar si tenemos los parámetros necesarios de MercadoPago
        const preferenceId = searchParams.get('preference-id')
        const paymentId = searchParams.get('payment_id')
        
        if (!preferenceId && !paymentId) {
          console.log('No payment parameters found, redirecting to dashboard')
          router.push('/dashboard')
          return
        }

        const { data: { session } } = await supabase.auth.getSession()
        
        if (!session) {
          console.log('No session found, redirecting to login')
          router.push("/login")
          return
        }

        // Verificar si el usuario ya es premium
        const { data: userData, error: userError } = await supabase
          .from("users")
          .select("id, subscription_plan")
          .eq("id", session.user.id)
          .single()

        if (userError) {
          console.error("Error checking user plan:", userError)
          
          // Si es un error de permisos y no hemos excedido los reintentos
          if (userError.code === 'PGRST204' && retryCount < MAX_RETRIES) {
            setRetryCount(prev => prev + 1)
            // Esperar un momento antes de reintentar
            setTimeout(checkSubscriptionStatus, 2000)
            return
          }

          toast({
            title: "Error",
            description: "Hubo un error al verificar tu plan. Por favor, contacta a soporte.",
            variant: "destructive",
          })
          return
        }

        // Si el usuario ya es premium, redirigir
        if (userData?.subscription_plan === "premium") {
          toast({
            title: "¡Plan Premium activo!",
            description: "Tu plan premium ya está activo.",
          })
          router.push("/dashboard")
          return
        }

        // Si no es premium, esperar un momento y verificar nuevamente
        setTimeout(async () => {
          try {
            const { data: updatedUserData, error: updateError } = await supabase
              .from("users")
              .select("id, subscription_plan")
              .eq("id", session.user.id)
              .single()

            if (updateError) {
              console.error("Error checking updated plan:", updateError)
              toast({
                title: "Error",
                description: "Hubo un error al verificar tu plan. Por favor, contacta a soporte.",
                variant: "destructive",
              })
              return
            }

            if (updatedUserData?.subscription_plan === "premium") {
              toast({
                title: "¡Plan Premium activo!",
                description: "Tu plan premium ha sido activado correctamente.",
              })
              router.push("/dashboard")
            } else {
              // Intentar verificar el estado del pago con MercadoPago
              try {
                const response = await fetch(`/api/check-payment-status?payment_id=${paymentId}`)
                const data = await response.json()
                
                if (data.status === 'approved') {
                  toast({
                    title: "¡Plan Premium activo!",
                    description: "Tu plan premium ha sido activado correctamente.",
                  })
                  router.push("/dashboard")
                } else {
                  toast({
                    title: "Procesando pago",
                    description: "Tu pago está siendo procesado. Te redirigiremos automáticamente cuando se complete.",
                  })
                  // Esperar un poco más y verificar una última vez
                  setTimeout(async () => {
                    const { data: finalUserData, error: finalError } = await supabase
                      .from("users")
                      .select("id, subscription_plan")
                      .eq("id", session.user.id)
                      .single()

                    if (finalError) {
                      console.error("Error checking final plan:", finalError)
                      toast({
                        title: "Error",
                        description: "Hubo un error al verificar tu plan. Por favor, contacta a soporte.",
                        variant: "destructive",
                      })
                      return
                    }

                    if (finalUserData?.subscription_plan === "premium") {
                      toast({
                        title: "¡Plan Premium activo!",
                        description: "Tu plan premium ha sido activado correctamente.",
                      })
                      router.push("/dashboard")
                    } else {
                      toast({
                        title: "Error",
                        description: "No se pudo activar tu plan. Por favor, contacta a soporte.",
                        variant: "destructive",
                      })
                      router.push("/dashboard")
                    }
                  }, 5000)
                }
              } catch (error) {
                console.error("Error checking payment status:", error)
                toast({
                  title: "Error",
                  description: "Hubo un error al verificar el estado del pago. Por favor, contacta a soporte.",
                  variant: "destructive",
                })
              }
            }
          } catch (error) {
            console.error("Error in payment verification:", error)
            toast({
              title: "Error",
              description: "Hubo un error al verificar tu pago. Por favor, contacta a soporte.",
              variant: "destructive",
            })
          }
        }, 2000)

      } catch (error) {
        console.error("Error checking subscription status:", error)
        toast({
          title: "Error",
          description: "Hubo un error al verificar tu plan. Por favor, contacta a soporte.",
          variant: "destructive",
        })
      } finally {
        setIsChecking(false)
      }
    }

    checkSubscriptionStatus()
  }, [router, supabase, toast, retryCount, searchParams])

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md space-y-8 text-center">
          <div className="flex justify-center">
            <CheckCircle className="h-16 w-16 text-green-500" />
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-bold">¡Pago Exitoso!</h1>
            <p className="text-gray-500">
              {isChecking 
                ? "Estamos procesando tu pago. Por favor, espera un momento..."
                : "Tu suscripción ha sido activada correctamente. Ya puedes comenzar a usar todas las funcionalidades."}
            </p>
          </div>
          <div className="space-y-4">
            <Button asChild className="w-full">
              <Link href="/dashboard">
                Ir al Dashboard
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
} 