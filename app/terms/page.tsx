import { Navbar } from "@/components/navbar"

import { createServerSupabaseClient } from "@/lib/supabase/server"

export default async function TermsPage() {
  const supabase = createServerSupabaseClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar user={session?.user} />
      <main className="flex-1">
        <div className="container px-4 py-12 md:px-6">
          <div className="mx-auto max-w-3xl space-y-8">
            <div className="text-center">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl">Términos y Condiciones</h1>
              <p className="mt-4 text-gray-500 dark:text-gray-400">Última actualización: 1 de abril de 2025</p>
            </div>

            <div className="prose prose-blue max-w-none dark:prose-invert">
              <h2>1. Introducción</h2>
              <p>
                Bienvenido a MiTurno.app ("nosotros", "nuestro", o "la Plataforma"). Al acceder o utilizar nuestra
                plataforma, usted acepta estar sujeto a estos Términos y Condiciones y a nuestra Política de Privacidad.
                Si no está de acuerdo con alguno de estos términos, por favor no utilice nuestra plataforma.
              </p>

              <h2>2. Uso de la Plataforma</h2>
              <p>
                MiTurno.app es una plataforma que permite a los usuarios crear perfiles personalizados para ofrecer
                servicios y gestionar reservas de turnos. Al utilizar nuestra plataforma, usted se compromete a:
              </p>
              <ul>
                <li>Proporcionar información precisa y actualizada durante el proceso de registro.</li>
                <li>Mantener la confidencialidad de su contraseña y cuenta.</li>
                <li>No utilizar la plataforma para fines ilegales o no autorizados.</li>
                <li>No intentar dañar, sobrecargar o perjudicar el funcionamiento de la plataforma.</li>
              </ul>

              <h2>3. Cuentas de Usuario</h2>
              <p>
                Para utilizar ciertas funciones de nuestra plataforma, es necesario crear una cuenta. Usted es
                responsable de mantener la confidencialidad de su cuenta y contraseña, y de restringir el acceso a su
                computadora. Acepta asumir la responsabilidad de todas las actividades que ocurran bajo su cuenta o
                contraseña.
              </p>

              <h2>4. Contenido del Usuario</h2>
              <p>
                Al publicar contenido en nuestra plataforma, usted otorga a MiTurno.app una licencia mundial, no
                exclusiva, libre de regalías para usar, reproducir, modificar, adaptar, publicar, traducir, distribuir y
                mostrar dicho contenido. Usted declara y garantiza que:
              </p>
              <ul>
                <li>
                  Es propietario del contenido que publica o tiene el derecho de otorgar la licencia mencionada
                  anteriormente.
                </li>
                <li>
                  El contenido no infringe los derechos de terceros, incluidos los derechos de privacidad, publicidad,
                  derechos de autor, marcas registradas u otros derechos de propiedad intelectual.
                </li>
                <li>El contenido no contiene material difamatorio, calumnioso, ofensivo, indecente o ilegal.</li>
              </ul>

              <h2>5. Propiedad Intelectual</h2>
              <p>
                La plataforma y su contenido original, características y funcionalidad son propiedad de MiTurno.app y
                están protegidos por leyes internacionales de derechos de autor, marcas registradas, patentes, secretos
                comerciales y otros derechos de propiedad intelectual o derechos de propiedad.
              </p>

              <h2>6. Limitación de Responsabilidad</h2>
              <p>
                En ningún caso MiTurno.app, sus directores, empleados o agentes serán responsables por cualquier daño
                directo, indirecto, incidental, especial, punitivo o consecuente que surja de o en conexión con su uso
                de la plataforma.
              </p>

              <h2>7. Modificaciones</h2>
              <p>
                Nos reservamos el derecho, a nuestra sola discreción, de modificar o reemplazar estos Términos en
                cualquier momento. Si una revisión es material, intentaremos proporcionar un aviso con al menos 30 días
                de anticipación antes de que los nuevos términos entren en vigencia.
              </p>

              <h2>8. Ley Aplicable</h2>
              <p>
                Estos Términos se regirán e interpretarán de acuerdo con las leyes de Argentina, sin tener en cuenta sus
                disposiciones sobre conflictos de leyes.
              </p>

              <h2>9. Contacto</h2>
              <p>Si tiene alguna pregunta sobre estos Términos, por favor contáctenos a través de info@miturno.app.</p>
            </div>
          </div>
        </div>
      </main>
     
    </div>
  )
}
