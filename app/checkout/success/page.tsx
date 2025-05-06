"use client"

import { useEffect, useState } from "react"
import { Navbar } from "@/components/navbar"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle } from "lucide-react"
import Link from "next/link"
import { createClientSupabaseClient } from "@/lib/supabase/client"

export default function CheckoutSuccessPage() {
  const [userData, setUserData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClientSupabaseClient()

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const { data: authData } = await supabase.auth.getUser()

        if (authData.user) {
          const { data } = await supabase.from("users").select("*").eq("id", authData.user.id).single()
          setUserData(data)
        }
      } catch (error) {
        console.error("Error fetching user data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchUserData()
  }, [])

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col">
        <Navbar user={null} />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">Cargando...</div>
        </main>
      
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar user={null} />
      <main className="flex-1">
        <div className="container px-4 py-12 md:px-6">
          <div className="mx-auto max-w-md space-y-8">
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
          </div>
        </div>
      </main>
     
    </div>
  )
}
