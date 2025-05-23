"use client"
import { Button } from "@/components/ui/button"
import { CheckCircle } from "lucide-react"
import Link from "next/link"
import { Navbar } from "@/components/navbar"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"

export default function PaymentSuccessPage() {
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClientComponentClient()

  useEffect(() => {
    const handlePaymentSuccess = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        
        if (!session) {
          router.push("/login")
          return
        }

        // Actualizar el plan del usuario a premium
        const { error: updateError } = await supabase
          .from("users")
          .update({ subscription_plan: "premium" })
          .eq("id", session.user.id)

        if (updateError) {
          console.error("Error updating subscription plan:", updateError)
          toast({
            title: "Error",
            description: "Hubo un error al actualizar tu plan. Por favor, contacta a soporte.",
            variant: "destructive",
          })
          return
        }

        // Refrescar la sesión para que se actualice el plan
        await supabase.auth.refreshSession()

        toast({
          title: "¡Plan actualizado!",
          description: "Tu plan ha sido actualizado correctamente.",
        })

        // Redirigir al dashboard después de un breve delay
        setTimeout(() => {
          router.push("/dashboard")
        }, 2000)
      } catch (error) {
        console.error("Error handling payment success:", error)
        toast({
          title: "Error",
          description: "Hubo un error al procesar tu pago. Por favor, contacta a soporte.",
          variant: "destructive",
        })
      }
    }

    handlePaymentSuccess()
  }, [router, supabase, toast])

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
              Tu suscripción ha sido activada correctamente. Ya puedes comenzar a usar todas las funcionalidades.
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