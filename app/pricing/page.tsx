import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Check } from "lucide-react"
import Link from "next/link"
import { createServerSupabaseClient } from "@/lib/supabase/server"

export default async function PricingPage() {
  const supabase = createServerSupabaseClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar user={session?.user} />
      <main className="flex-1">
        <div className="container px-4 py-12 md:px-6">
          <div className="mx-auto max-w-4xl space-y-8">
            <div className="text-center space-y-4">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Planes y Precios</h1>
              <p className="text-gray-500 md:text-xl dark:text-gray-400 max-w-2xl mx-auto">
                Elige el plan que mejor se adapte a tus necesidades
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-1">
              <Card className="flex flex-col">
                <CardHeader>
                  <CardTitle className="text-2xl">Plan Básico</CardTitle>
                  <CardDescription>Todo lo que necesitas para gestionar tus turnos</CardDescription>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">$5,000</span>
                    <span className="text-muted-foreground ml-2">/ mes</span>
                  </div>
                </CardHeader>
                <CardContent className="flex-1">
                  <ul className="space-y-3">
                    <li className="flex items-center">
                      <Check className="h-5 w-5 text-primary mr-2" />
                      <span>URL personalizada (miturno.app/tunombre)</span>
                    </li>
                    <li className="flex items-center">
                      <Check className="h-5 w-5 text-primary mr-2" />
                      <span>Gestión ilimitada de servicios</span>
                    </li>
                    <li className="flex items-center">
                      <Check className="h-5 w-5 text-primary mr-2" />
                      <span>Gestión de equipo</span>
                    </li>
                    <li className="flex items-center">
                      <Check className="h-5 w-5 text-primary mr-2" />
                      <span>Configuración de disponibilidad</span>
                    </li>
                    <li className="flex items-center">
                      <Check className="h-5 w-5 text-primary mr-2" />
                      <span>Notificaciones por WhatsApp</span>
                    </li>
                    <li className="flex items-center">
                      <Check className="h-5 w-5 text-primary mr-2" />
                      <span>Sistema de reseñas</span>
                    </li>
                    <li className="flex items-center">
                      <Check className="h-5 w-5 text-primary mr-2" />
                      <span>Soporte por email</span>
                    </li>
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button asChild className="w-full">
                    <Link href="/checkout">Suscribirse</Link>
                  </Button>
                </CardFooter>
              </Card>
            </div>

            <div className="text-center space-y-4 pt-8">
              <h2 className="text-2xl font-bold">Preguntas frecuentes</h2>
              <div className="grid gap-4 md:grid-cols-2 text-left">
                <div className="space-y-2">
                  <h3 className="font-medium">¿Puedo cancelar en cualquier momento?</h3>
                  <p className="text-sm text-muted-foreground">
                    Sí, puedes cancelar tu suscripción en cualquier momento desde tu panel de control.
                  </p>
                </div>
                <div className="space-y-2">
                  <h3 className="font-medium">¿Qué métodos de pago aceptan?</h3>
                  <p className="text-sm text-muted-foreground">Actualmente aceptamos pagos a través de MercadoPago.</p>
                </div>
                <div className="space-y-2">
                  <h3 className="font-medium">¿Ofrecen algún descuento?</h3>
                  <p className="text-sm text-muted-foreground">
                    Ofrecemos descuentos para suscripciones anuales. Contáctanos para más información.
                  </p>
                </div>
                <div className="space-y-2">
                  <h3 className="font-medium">¿Qué pasa si necesito ayuda?</h3>
                  <p className="text-sm text-muted-foreground">
                    Nuestro equipo de soporte está disponible por email en info@miturno.app.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
