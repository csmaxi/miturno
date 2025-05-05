"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Check } from "lucide-react"
import { createClientSupabaseClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"

const PLANS = [
  {
    name: "Free",
    price: 0,
    features: [
      "15 turnos por mes",
      "3 servicios",
      "1 miembro del equipo",
      "Notificaciones por WhatsApp",
      "Calendario básico"
    ],
    limits: {
      appointments: 15,
      services: 3,
      teamMembers: 1
    }
  },
  {
    name: "Basic",
    price: 1,
    features: [
      "30 turnos por mes",
      "5 servicios",
      "2 miembros del equipo",
      "Notificaciones por WhatsApp",
      "Calendario avanzado",
      "Estadísticas básicas"
    ],
    limits: {
      appointments: 30,
      services: 5,
      teamMembers: 2
    }
  },
  {
    name: "Pro",
    price: 2,
    features: [
      "Turnos ilimitados",
      "Servicios ilimitados",
      "Miembros del equipo ilimitados",
      "Notificaciones por WhatsApp",
      "Calendario premium",
      "Estadísticas avanzadas",
      "Soporte prioritario"
    ],
    limits: {
      appointments: Infinity,
      services: Infinity,
      teamMembers: Infinity
    }
  }
]

export function PricingDialog() {
  const { toast } = useToast()
  const [loading, setLoading] = useState<string | null>(null)

  const handleSubscribe = async (plan: string, price: number) => {
    if (price === 0) {
      toast({
        title: "Plan Gratuito",
        description: "El plan gratuito está activo por defecto.",
      })
      return
    }

    setLoading(plan)
    try {
      const supabase = createClientSupabaseClient()
      const { data: { session } } = await supabase.auth.getSession()

      if (!session) {
        toast({
          title: "Error",
          description: "Debes iniciar sesión para suscribirte",
          variant: "destructive",
        })
        return
      }

      // Crear preferencia de pago en MercadoPago
      const response = await fetch("/api/create-payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          plan,
          price,
          userId: session.user.id,
        }),
      })

      if (!response.ok) throw new Error("Error al crear el pago")

      const { init_point } = await response.json()

      // Redirigir a MercadoPago
      window.location.href = init_point
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "No se pudo procesar la suscripción",
        variant: "destructive",
      })
    } finally {
      setLoading(null)
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost">Precios</Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle className="text-2xl text-center">Planes y Precios</DialogTitle>
        </DialogHeader>
        <div className="grid gap-6 md:grid-cols-3 mt-4">
          {PLANS.map((plan) => (
            <Card key={plan.name} className="flex flex-col">
              <CardHeader>
                <CardTitle>{plan.name}</CardTitle>
                <CardDescription>
                  {plan.price === 0 ? "Gratis" : `$${plan.price.toLocaleString('es-AR')}/mes`}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                <ul className="space-y-2">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-primary" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button
                  className="w-full"
                  onClick={() => handleSubscribe(plan.name.toLowerCase(), plan.price)}
                  disabled={loading === plan.name.toLowerCase()}
                >
                  {loading === plan.name.toLowerCase()
                    ? "Procesando..."
                    : plan.price === 0
                    ? "Plan Actual"
                    : "Suscribirse"}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
} 