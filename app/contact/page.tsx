import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Mail, MessageSquare, Phone } from "lucide-react"
import { createServerSupabaseClient } from "@/lib/supabase/server"

export default async function ContactPage() {
  const supabase = createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar user={user} />
      <main className="flex-1">
        <div className="container px-4 py-12 md:px-6">
          <div className="mx-auto max-w-4xl space-y-6">
            <div className="text-center space-y-2">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Contacto</h1>
              <p className="text-gray-500 md:text-xl dark:text-gray-400">
                ¿Tienes alguna pregunta o sugerencia? Estamos aquí para ayudarte.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:gap-12">
              <Card>
                <CardHeader>
                  <CardTitle>Envíanos un mensaje</CardTitle>
                  <CardDescription>Completa el formulario y te responderemos a la brevedad.</CardDescription>
                </CardHeader>
                <CardContent>
                  <form className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nombre</Label>
                      <Input id="name" placeholder="Tu nombre" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" type="email" placeholder="tu@email.com" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="message">Mensaje</Label>
                      <Textarea id="message" placeholder="¿En qué podemos ayudarte?" rows={5} />
                    </div>
                    <Button type="submit" className="w-full">
                      Enviar mensaje
                    </Button>
                  </form>
                </CardContent>
              </Card>

              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Información de contacto</CardTitle>
                    <CardDescription>Otras formas de contactarnos.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-start space-x-4">
                      <Mail className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <h3 className="font-medium">Email</h3>
                        <p className="text-sm text-muted-foreground">info@miturno.app</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-4">
                      <Phone className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <h3 className="font-medium">Teléfono</h3>
                        <p className="text-sm text-muted-foreground">+54 11 1234-5678</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-4">
                      <MessageSquare className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <h3 className="font-medium">Redes sociales</h3>
                        <div className="text-sm text-muted-foreground space-y-1">
                          <p>Twitter: @miturno_app</p>
                          <p>Instagram: @miturno.app</p>
                          <p>Facebook: MiTurnoApp</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Preguntas frecuentes</CardTitle>
                    <CardDescription>Respuestas a las preguntas más comunes.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h3 className="font-medium">¿Cómo funciona MiTurno?</h3>
                      <p className="text-sm text-muted-foreground">
                        MiTurno te permite crear tu perfil personalizado para ofrecer tus servicios y que tus clientes
                        puedan reservar turnos en línea.
                      </p>
                    </div>
                    <div>
                      <h3 className="font-medium">¿Cuánto cuesta usar MiTurno?</h3>
                      <p className="text-sm text-muted-foreground">
                        Actualmente ofrecemos un plan gratuito con funcionalidades básicas. Próximamente tendremos
                        planes premium con características adicionales.
                      </p>
                    </div>
                    <div>
                      <h3 className="font-medium">¿Cómo puedo cambiar mi URL personalizada?</h3>
                      <p className="text-sm text-muted-foreground">
                        Puedes cambiar tu nombre de usuario en la sección de configuración de tu perfil, siempre que el
                        nuevo nombre esté disponible.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
