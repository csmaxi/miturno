import { useEffect, useState } from "react"
import { createClientSupabaseClient } from "@/lib/supabase/client"

export type SubscriptionPlan = "free" | "basic" | "pro"

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
    appointments: 15,
    services: 3,
    teamMembers: 1
  },
  basic: {
    appointments: 30,
    services: 5,
    teamMembers: 3
  },
  pro: {
    appointments: Infinity,
    services: Infinity,
    teamMembers: Infinity
  }
}

export function useSubscription() {
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchSubscription() {
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
          setSubscription({
            plan: data.plan as SubscriptionPlan,
            status: data.status as "active" | "inactive" | "cancelled",
            currentPeriodStart: data.current_period_start,
            currentPeriodEnd: data.current_period_end,
            limits: PLAN_LIMITS[data.plan as SubscriptionPlan]
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
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchSubscription()
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
    getRemainingLimit
  }
} 