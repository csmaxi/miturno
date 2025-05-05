"use client"

import { useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { CheckCircle, XCircle, Clock } from "lucide-react"
import Link from "next/link"

export default function SubscriptionStatusPage({
  searchParams,
}: {
  searchParams: { status?: string }
}) {
  const router = useRouter()
  const { toast } = useToast()
  const status = searchParams.status

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

  if (status === "success") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4">
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
    )
  }

  if (status === "failure") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4">
        <div className="w-full max-w-md space-y-8 text-center">
          <div className="flex justify-center">
            <XCircle className="h-16 w-16 text-red-500" />
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-bold">Pago Fallido</h1>
            <p className="text-gray-500">
              Hubo un problema al procesar tu pago. Por favor, intenta nuevamente o contacta a soporte si el problema persiste.
            </p>
          </div>
          <div className="space-y-4">
            <Button asChild className="w-full">
              <Link href="/pricing">
                Intentar Nuevamente
              </Link>
            </Button>
            <Button variant="outline" asChild className="w-full">
              <Link href="/dashboard">
                Volver al Dashboard
              </Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (status === "pending") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4">
        <div className="w-full max-w-md space-y-8 text-center">
          <div className="flex justify-center">
            <Clock className="h-16 w-16 text-yellow-500" />
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-bold">Pago en Proceso</h1>
            <p className="text-gray-500">
              Tu pago está siendo procesado. Te notificaremos cuando se complete la transacción.
            </p>
          </div>
          <div className="space-y-4">
            <Button asChild className="w-full">
              <Link href="/dashboard">
                Ir al Dashboard
              </Link>
            </Button>
            <p className="text-sm text-gray-500">
              Si tienes alguna duda, no dudes en contactar a soporte.
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Estado por defecto o inválido
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8 text-center">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Estado de Suscripción</h1>
          <p className="text-gray-500">
            No se pudo determinar el estado de tu suscripción.
          </p>
        </div>
        <div className="space-y-4">
          <Button asChild className="w-full">
            <Link href="/dashboard">
              Volver al Dashboard
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
} 