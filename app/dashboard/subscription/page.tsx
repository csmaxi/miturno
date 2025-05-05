"use client"

import { useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"

export default function SubscriptionStatusPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const status = searchParams.get("status")

  useEffect(() => {
    if (status === "success") {
      toast({
        title: "¡Suscripción exitosa!",
        description: "Tu suscripción ha sido activada correctamente.",
      })
      router.push("/dashboard")
    } else if (status === "failure") {
      toast({
        title: "Error en el pago",
        description: "No se pudo procesar el pago. Por favor, intenta nuevamente.",
        variant: "destructive",
      })
      router.push("/pricing")
    } else if (status === "pending") {
      toast({
        title: "Pago pendiente",
        description: "Tu pago está siendo procesado. Te notificaremos cuando se complete.",
      })
      router.push("/dashboard")
    }
  }, [status, router, toast])

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <Loader2 className="h-8 w-8 animate-spin mb-4" />
      <h1 className="text-2xl font-bold mb-2">Procesando tu suscripción</h1>
      <p className="text-muted-foreground">
        Por favor, espera mientras procesamos tu pago...
      </p>
    </div>
  )
} 