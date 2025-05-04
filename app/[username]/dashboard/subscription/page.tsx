import { createServerSupabaseClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { SubscriptionPlans } from "../../components/subscription-plans"

export default async function SubscriptionPage() {
  const supabase = await createServerSupabaseClient()

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/login")
  }

  const { data: userData } = await supabase
    .from("users")
    .select("subscription_plan")
    .eq("id", session.user.id)
    .single()

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Planes de Suscripción</h1>
        <p className="text-muted-foreground mt-2">
          Elige el plan que mejor se adapte a tus necesidades
        </p>
      </div>
      <SubscriptionPlans
        userId={session.user.id}
        currentPlan={userData?.subscription_plan || "free"}
        onPlanChange={() => {}}
      />
    </div>
  )
} 