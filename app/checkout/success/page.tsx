"use client"

import { useCallback, Suspense, lazy } from "react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { createClientSupabaseClient } from "@/lib/supabase/client"
import { useSupabaseQuery } from '@/lib/hooks/use-supabase-query'
import { Navbar } from "@/components/navbar"

// Lazy load components that are not needed immediately
const Card = lazy(() => import("@/components/ui/card").then(mod => ({ default: mod.Card })))
const CardHeader = lazy(() => import("@/components/ui/card").then(mod => ({ default: mod.CardHeader })))
const CardContent = lazy(() => import("@/components/ui/card").then(mod => ({ default: mod.CardContent })))
const CardTitle = lazy(() => import("@/components/ui/card").then(mod => ({ default: mod.CardTitle })))
const CardDescription = lazy(() => import("@/components/ui/card").then(mod => ({ default: mod.CardDescription })))
const CheckCircle = lazy(() => import("lucide-react").then(mod => ({ default: mod.CheckCircle })))

interface UserData {
  id: string
  username: string
  trial_activated: boolean
  trial_end_date?: string
}

// Componente de carga optimizado
const LoadingSpinner = () => (
  <div className="flex min-h-screen flex-col">
    <div className="h-16 bg-background" />
    <main className="flex-1 flex items-center justify-center">
      <div className="text-center">
        <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <div className="text-muted-foreground">Cargando...</div>
      </div>
    </main>
  </div>
)

// Componente de tarjeta optimizado
const SuccessCard = ({ userData }: { userData: UserData | null }) => (
  <Card>
    <CardHeader className="text-center">
      <div className="flex justify-center mb-4">
        <CheckCircle className="h-16 w-16 text-green-500" />
      </div>
      <CardTitle className="text-2xl">¡Pago exitoso!</CardTitle>
      <CardDescription>
        {userData?.trial_activated
          ? "Tu período de prueba gratuito ha sido activado."
          : "Tu suscripción ha sido activada correctamente."}
      </CardDescription>
    </CardHeader>
    <CardContent className="space-y-6">
      <div className="bg-muted p-4 rounded-lg">
        <h3 className="font-medium mb-2">Detalles de tu plan</h3>
        <p className="text-sm mb-1">
          <span className="font-medium">Plan:</span> Plan Básico
        </p>
        <p className="text-sm mb-1">
          <span className="font-medium">Estado:</span>{" "}
          {userData?.trial_activated ? "Período de prueba (30 días)" : "Activo"}
        </p>
        {userData?.trial_activated && userData?.trial_end_date && (
          <p className="text-sm">
            <span className="font-medium">Finaliza el:</span>{" "}
            {new Date(userData.trial_end_date).toLocaleDateString()}
          </p>
        )}
      </div>

      <div className="text-center space-y-4">
        <p className="text-sm text-muted-foreground">
          {userData?.trial_activated
            ? "Durante tu período de prueba gratuito, podrás disfrutar de todas las funcionalidades de MiTurno. Al finalizar, se te cobrará automáticamente $5,000 por mes."
            : "Tu página ahora está activa y puedes comenzar a recibir reservas."}
        </p>
        <div className="flex flex-col space-y-2">
          <Button asChild>
            <Link href="/dashboard">Ir a mi Dashboard</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href={`/${userData?.username}`} target="_blank">
              Ver mi página pública
            </Link>
          </Button>
        </div>
      </div>
    </CardContent>
  </Card>
)

export default function CheckoutSuccessPage() {
  const supabase = createClientSupabaseClient()
  
  const queryFn = useCallback(async () => {
    const { data: authData } = await supabase.auth.getUser()
    if (!authData.user) return null
    
    const { data } = await supabase
      .from("users")
      .select("*")
      .eq("id", authData.user.id)
      .single()
    
    return data
  }, [supabase])
  
  const { data: userData, isLoading } = useSupabaseQuery<UserData>({
    queryKey: 'user-data',
    queryFn,
    staleTime: 1000 * 60 * 30 // 30 minutos
  })

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <div className="container px-4 py-12 md:px-6">
          <div className="mx-auto max-w-md space-y-8">
            {isLoading ? (
              <div className="h-64 bg-muted animate-pulse rounded-lg" />
            ) : (
              <Suspense fallback={<div className="h-64 bg-muted animate-pulse rounded-lg" />}>
                <SuccessCard userData={userData} />
              </Suspense>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
