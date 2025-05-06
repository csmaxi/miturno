import { Navbar } from "@/components/navbar"

import { Card, CardContent } from "@/components/ui/card"
import { Calendar, Users, Clock, Shield } from "lucide-react"
import { createServerSupabaseClient } from "@/lib/supabase/server"

export default async function AboutPage() {
  const supabase = createServerSupabaseClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar user={session?.user ?? null} />
      <main className="flex-1">
        <div className="container px-4 py-12 md:px-6">
          <div className="mx-auto max-w-4xl space-y-10">
            <div className="text-center space-y-4">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Acerca de MiTurno</h1>
              <p className="text-gray-500 md:text-xl dark:text-gray-400 max-w-2xl mx-auto">
                Simplificamos la gestión de turnos para profesionales y emprendedores, permitiéndoles enfocarse en lo
                que realmente importa.
              </p>
            </div>

            <div className="space-y-6">
              <h2 className="text-2xl font-bold">Nuestra misión</h2>
              <p className="text-muted-foreground">
                En MiTurno, nuestra misión es democratizar el acceso a herramientas de gestión de turnos para todos los
                profesionales y emprendedores, sin importar el tamaño de su negocio. Creemos que la tecnología debe ser
                accesible y fácil de usar, permitiendo a las personas enfocarse en brindar el mejor servicio a sus
                clientes.
              </p>
              <p className="text-muted-foreground">
                Desarrollamos MiTurno con la visión de crear una plataforma que no solo facilite la reserva de turnos,
                sino que también ayude a construir relaciones más sólidas entre profesionales y sus clientes, mejorando
                la experiencia para ambas partes.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardContent className="flex flex-col items-center text-center p-6">
                  <Calendar className="h-10 w-10 text-primary mb-4" />
                  <h3 className="text-lg font-medium mb-2">Gestión simple</h3>
                  <p className="text-sm text-muted-foreground">
                    Interfaz intuitiva que facilita la gestión de tu agenda y turnos.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="flex flex-col items-center text-center p-6">
                  <Users className="h-10 w-10 text-primary mb-4" />
                  <h3 className="text-lg font-medium mb-2">Para todos</h3>
                  <p className="text-sm text-muted-foreground">
                    Diseñado para profesionales independientes y equipos de trabajo.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="flex flex-col items-center text-center p-6">
                  <Clock className="h-10 w-10 text-primary mb-4" />
                  <h3 className="text-lg font-medium mb-2">Ahorra tiempo</h3>
                  <p className="text-sm text-muted-foreground">
                    Automatiza la reserva de turnos y reduce las tareas administrativas.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="flex flex-col items-center text-center p-6">
                  <Shield className="h-10 w-10 text-primary mb-4" />
                  <h3 className="text-lg font-medium mb-2">Seguro</h3>
                  <p className="text-sm text-muted-foreground">
                    Protegemos tus datos y los de tus clientes con los más altos estándares.
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <h2 className="text-2xl font-bold">Nuestro equipo</h2>
              <p className="text-muted-foreground">
                Somos un equipo apasionado de desarrolladores, diseñadores y emprendedores con experiencia en el
                desarrollo de soluciones tecnológicas para pequeñas y medianas empresas. Entendemos los desafíos que
                enfrentan los profesionales independientes y estamos comprometidos a crear herramientas que les
                faciliten el día a día.
              </p>
              <p className="text-muted-foreground">
                MiTurno nació de la necesidad que identificamos en el mercado: una plataforma simple pero potente que
                permitiera a cualquier persona gestionar sus turnos sin complicaciones. Desde entonces, hemos estado
                trabajando constantemente para mejorar y expandir nuestras funcionalidades, siempre escuchando el
                feedback de nuestros usuarios.
              </p>
            </div>

            <div className="space-y-6">
              <h2 className="text-2xl font-bold">Contacto</h2>
              <p className="text-muted-foreground">
                Si tienes alguna pregunta, sugerencia o simplemente quieres saludarnos, no dudes en contactarnos.
                Estamos siempre abiertos a escuchar a nuestra comunidad y mejorar nuestro servicio.
              </p>
              <p className="text-muted-foreground">
                Email: info@miturno.app
                <br />
                Teléfono: +54 11 1234-5678
              </p>
            </div>
          </div>
        </div>
      </main>
    
    </div>
  )
}
