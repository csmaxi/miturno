"use client"

import { useState, Suspense } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Check, Loader2 } from "lucide-react"
import { createClientSupabaseClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { motion } from "framer-motion"

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
      "3 miembros del equipo",
      "Notificaciones por WhatsApp",
      "Calendario avanzado",
      "Estadísticas básicas"
    ],
    limits: {
      appointments: 30,
      services: 5,
      teamMembers: 3
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

function PlanCard({ plan, onSubscribe, loading }: { 
  plan: typeof PLANS[0], 
  onSubscribe: (plan: string, price: number) => Promise<void>,
  loading: string | null 
}) {
  const isPopular = plan.name === "Basic"
  const isLoading = loading === plan.name.toLowerCase()

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card 
        className={`flex flex-col relative ${
          isPopular 
            ? "border-primary shadow-lg scale-105" 
            : "border-border"
        }`}
        role="article"
        aria-labelledby={`plan-${plan.name.toLowerCase()}-title`}
      >
        {isPopular && (
          <div 
            className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-medium"
            role="status"
            aria-label="Plan más popular"
          >
            Más Popular
          </div>
        )}
        <CardHeader>
          <CardTitle 
            id={`plan-${plan.name.toLowerCase()}-title`}
            className="text-2xl"
          >
            {plan.name}
          </CardTitle>
          <CardDescription className="text-lg">
            {plan.price === 0 ? (
              "Gratis"
            ) : (
              <>
                <span className="text-3xl font-bold">
                  ${plan.price.toLocaleString('es-AR')}
                </span>
                <span className="text-muted-foreground">/mes</span>
              </>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-grow">
          <ul className="space-y-3" role="list">
            {plan.features.map((feature) => (
              <li 
                key={feature} 
                className="flex items-center gap-2"
                role="listitem"
              >
                <Check 
                  className="h-5 w-5 text-primary shrink-0" 
                  aria-hidden="true"
                />
                <span className="text-sm">{feature}</span>
              </li>
            ))}
          </ul>
        </CardContent>
        <CardFooter>
          <Button
            className="w-full"
            variant={isPopular ? "default" : "outline"}
            onClick={() => onSubscribe(plan.name.toLowerCase(), plan.price)}
            disabled={isLoading}
            aria-label={`Suscribirse al plan ${plan.name}`}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Procesando...
              </>
            ) : plan.price === 0 ? (
              "Plan Actual"
            ) : (
              "Suscribirse"
            )}
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  )
}

export function PricingPlans() {
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

      if (!response.ok) {
        throw new Error("Error al crear el pago")
      }

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
    <div 
      className="grid gap-8 md:grid-cols-3 mt-4"
      role="region"
      aria-label="Planes de suscripción"
    >
      <Suspense fallback={
        <div className="col-span-3 flex justify-center items-center py-8">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      }>
        {PLANS.map((plan) => (
          <PlanCard
            key={plan.name}
            plan={plan}
            onSubscribe={handleSubscribe}
            loading={loading}
          />
        ))}
      </Suspense>
    </div>
  )
} 