import { useState, useEffect } from "react"
import { createClientSupabaseClient } from "@/lib/supabase/client"

export type SubscriptionPlan = "free" | "premium"

export interface SubscriptionLimits {
  appointments: number
  services: number
  teamMembers: number
}

export interface Subscription {
  plan: SubscriptionPlan
  status: "active" | "inactive" | "cancelled"
  currentPeriodStart: string
  currentPeriodEnd: string
  limits: SubscriptionLimits
}

const PLAN_LIMITS: Record<SubscriptionPlan, SubscriptionLimits> = {
  free: {
    appointments: 10,
    services: 3,
    teamMembers: 1
  },
  premium: {
    appointments: Infinity,
    services: Infinity,
    teamMembers: Infinity
  }
}

export function useSubscription() {
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchSubscription = async () => {
    try {
      const supabase = createClientSupabaseClient()
      const { data: { session } } = await supabase.auth.getSession()

      if (!session) {
        setSubscription({
          plan: "free",
          status: "active",
          currentPeriodStart: new Date().toISOString(),
          currentPeriodEnd: new Date().toISOString(),
          limits: PLAN_LIMITS.free
        })
        return
      }

      // Primero verificar el plan en la tabla users
      const { data: userData } = await supabase
        .from("users")
        .select("subscription_plan")
        .eq("id", session.user.id)
        .single()

      if (userData?.subscription_plan) {
        const plan = userData.subscription_plan as SubscriptionPlan
        setSubscription({
          plan,
          status: "active",
          currentPeriodStart: new Date().toISOString(),
          currentPeriodEnd: new Date().toISOString(),
          limits: PLAN_LIMITS[plan]
        })
        return
      }

      // Si no hay plan en users, verificar en subscriptions
      const { data, error } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("user_id", session.user.id)
        .eq("status", "active")
        .order("created_at", { ascending: false })
        .limit(1)
        .single()

      if (error) {
        throw error
      }

      if (data) {
        const plan = data.plan as SubscriptionPlan
        setSubscription({
          plan,
          status: data.status as "active" | "inactive" | "cancelled",
          currentPeriodStart: data.current_period_start,
          currentPeriodEnd: data.current_period_end,
          limits: PLAN_LIMITS[plan]
        })
      } else {
        setSubscription({
          plan: "free",
          status: "active",
          currentPeriodStart: new Date().toISOString(),
          currentPeriodEnd: new Date().toISOString(),
          limits: PLAN_LIMITS.free
        })
      }
    } catch (error) {
      console.error("Error fetching subscription:", error)
      setError(error instanceof Error ? error.message : "Error al obtener la suscripción")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSubscription()

    // Suscribirse a cambios en la tabla users
    const supabase = createClientSupabaseClient()
    const channel = supabase
      .channel('subscription_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'users'
        },
        () => {
          fetchSubscription()
        }
      )
      .subscribe()

    return () => {
      channel.unsubscribe()
    }
  }, [])

  const checkLimit = (type: keyof SubscriptionLimits, currentCount: number) => {
    if (!subscription) return false
    return currentCount < subscription.limits[type]
  }

  const getRemainingLimit = (type: keyof SubscriptionLimits, currentCount: number) => {
    if (!subscription) return 0
    return Math.max(0, subscription.limits[type] - currentCount)
  }

  return {
    subscription,
    loading,
    error,
    checkLimit,
    getRemainingLimit,
    refetch: fetchSubscription
  }
} 