"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { createClientSupabaseClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { Check } from "lucide-react"

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
    price: 9.99,
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
    price: 19.99,
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

interface SubscriptionPlansProps {
  userId: string
  currentPlan: string
  onPlanChange: (plan: string) => void
}

export function SubscriptionPlans({ userId, currentPlan, onPlanChange }: SubscriptionPlansProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState<string | null>(null)

  const handlePlanChange = async (plan: string) => {
    setLoading(plan)
    try {
      const supabase = createClientSupabaseClient()
      
      const { error } = await supabase
        .from("users")
        .update({ subscription_plan: plan })
        .eq("id", userId)

      if (error) throw error

      onPlanChange(plan)
      toast({
        title: "Plan actualizado",
        description: `Tu plan ha sido actualizado a ${plan}.`,
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "No se pudo actualizar el plan",
        variant: "destructive",
      })
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="grid gap-6 md:grid-cols-3">
      {PLANS.map((plan) => (
        <Card key={plan.name} className={currentPlan === plan.name.toLowerCase() ? "border-primary" : ""}>
          <CardHeader>
            <CardTitle>{plan.name}</CardTitle>
            <CardDescription>
              {plan.price === 0 ? "Gratis" : `$${plan.price}/mes`}
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
                : "Cambiar plan"}
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  )
} 