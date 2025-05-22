"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { createClientSupabaseClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { Check } from "lucide-react"

const plans = [
  {
    name: "Free",
    price: 0,
    features: [
      "10 turnos (pendientes y confirmados)",
      "3 servicios",
      "1 miembro del equipo",
      "Calendario básico",
      "Notificaciones por email",
      "Estadísticas básicas"
    ],
    buttonText: "Plan actual",
    buttonVariant: "outline" as const,
    isCurrentPlan: true
  },
  {
    name: "Premium",
    price: 999,
    features: [
      "Turnos ilimitados",
      "Servicios ilimitados",
      "Miembros del equipo ilimitados",
      "Notificaciones por WhatsApp",
      "Calendario premium",
      "Estadísticas avanzadas",
      "Soporte prioritario"
    ],
    buttonText: "Actualizar plan",
    buttonVariant: "default" as const,
    isCurrentPlan: false
  }
]

interface SubscriptionPlansProps {
  userId: string
  currentPlan: string
  onPlanChange: (plan: string) => void
}

export function SubscriptionPlans({ userId, currentPlan, onPlanChange }: SubscriptionPlansProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState<string | null>(null)

  const handlePlanChange = async (plan: string) => {
    if (plan === currentPlan) return

    setLoading(plan)
    try {
      const supabase = createClientSupabaseClient()
      const { data: { session } } = await supabase.auth.getSession()

      if (!session) {
        toast({
          title: "Error",
          description: "Debes iniciar sesión para cambiar de plan",
          variant: "destructive",
        })
        return
      }

      if (plan === "free") {
        // Actualizar a plan gratuito
        const { error } = await supabase
          .from("subscriptions")
          .update({ plan: "free", status: "active" })
          .eq("user_id", userId)

        if (error) throw error

        toast({
          title: "Plan actualizado",
          description: "Has cambiado al plan gratuito",
        })
        onPlanChange("free")
      } else {
        // Crear preferencia de pago en MercadoPago
        const response = await fetch("/api/create-payment", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            plan: "premium",
            price: 1,
            userId: session.user.id,
          }),
        })

        if (!response.ok) throw new Error("Error al crear el pago")

        const { init_point } = await response.json()

        // Redirigir a MercadoPago
        window.location.href = init_point
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "No se pudo cambiar el plan",
        variant: "destructive",
      })
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {plans.map((plan) => (
        <Card key={plan.name} className={currentPlan === plan.name.toLowerCase() ? "border-primary" : ""}>
          <CardHeader>
            <CardTitle>{plan.name}</CardTitle>
            <CardDescription>
              {plan.price === 0 ? "Gratis" : `$${plan.price.toLocaleString('es-AR')}`}
            </CardDescription>
          </CardHeader>
          <CardContent>
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
              variant={currentPlan === plan.name.toLowerCase() ? "secondary" : "default"}
              onClick={() => handlePlanChange(plan.name.toLowerCase())}
              disabled={loading === plan.name.toLowerCase()}
            >
              {loading === plan.name.toLowerCase()
                ? "Actualizando..."
                : currentPlan === plan.name.toLowerCase()
                ? "Plan actual"
                : plan.price === 0
                ? "Cambiar a plan gratuito"
                : "Actualizar a Premium"}
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  )
} 