import { Navbar } from "@/components/navbar"

import { createServerSupabaseClient } from "@/lib/supabase/server"

export default async function PrivacyPage() {
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
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl">Política de Privacidad</h1>
              <p className="mt-4 text-gray-500 dark:text-gray-400">Última actualización: 1 de abril de 2025</p>
            </div>

            <div className="prose prose-blue max-w-none dark:prose-invert">
              <h2>1. Introducción</h2>
              <p>
                En MiTurno.app ("nosotros", "nuestro", o "la Plataforma"), valoramos su privacidad y nos comprometemos a
                proteger sus datos personales. Esta Política de Privacidad describe cómo recopilamos, utilizamos y
                compartimos su información cuando utiliza nuestra plataforma.
              </p>

              <h2>2. Información que Recopilamos</h2>
              <p>Podemos recopilar los siguientes tipos de información:</p>
              <ul>
                <li>
                  <strong>Información de registro:</strong> Cuando crea una cuenta, recopilamos su nombre, dirección de
                  correo electrónico, nombre de usuario y contraseña.
                </li>
                <li>
                  <strong>Información de perfil:</strong> Puede proporcionar información adicional como título de
                  perfil, descripción, imágenes y detalles de servicios.
                </li>
                <li>
                  <strong>Información de uso:</strong> Recopilamos información sobre cómo interactúa con nuestra
                  plataforma, incluyendo las páginas que visita y las acciones que realiza.
                </li>
                <li>
                  <strong>Información de dispositivo:</strong> Podemos recopilar información sobre su dispositivo, como
                  dirección IP, tipo de navegador, sistema operativo y configuración de idioma.
                </li>
              </ul>

              <h2>3. Cómo Utilizamos su Información</h2>
              <p>Utilizamos la información recopilada para:</p>
              <ul>
                <li>Proporcionar, mantener y mejorar nuestra plataforma.</li>
                <li>Procesar y gestionar las reservas de turnos.</li>
                <li>
                  Comunicarnos con usted, incluyendo enviar notificaciones relacionadas con su cuenta o servicios.
                </li>
                <li>Personalizar su experiencia en nuestra plataforma.</li>
                <li>Analizar tendencias de uso y mejorar nuestros servicios.</li>
                <li>Detectar, prevenir y abordar problemas técnicos o de seguridad.</li>
              </ul>

              <h2>4. Compartir su Información</h2>
              <p>Podemos compartir su información en las siguientes circunstancias:</p>
              <ul>
                <li>
                  <strong>Con otros usuarios:</strong> Su información de perfil y servicios se comparte públicamente con
                  otros usuarios de la plataforma.
                </li>
                <li>
                  <strong>Con proveedores de servicios:</strong> Trabajamos con terceros que nos ayudan a operar,
                  proporcionar, mejorar, integrar, personalizar y promocionar nuestra plataforma.
                </li>
                <li>
                  <strong>Por razones legales:</strong> Podemos divulgar su información si creemos de buena fe que es
                  necesario para cumplir con una obligación legal, proteger nuestros derechos o los derechos de otros, o
                  investigar posibles violaciones de nuestros términos.
                </li>
              </ul>

              <h2>5. Seguridad de los Datos</h2>
              <p>
                Implementamos medidas de seguridad diseñadas para proteger su información personal contra acceso no
                autorizado, alteración, divulgación o destrucción. Sin embargo, ningún método de transmisión por
                Internet o método de almacenamiento electrónico es 100% seguro.
              </p>

              <h2>6. Sus Derechos</h2>
              <p>
                Dependiendo de su ubicación, puede tener ciertos derechos relacionados con sus datos personales, como:
              </p>
              <ul>
                <li>Acceder a los datos personales que tenemos sobre usted.</li>
                <li>Corregir datos inexactos o incompletos.</li>
                <li>Eliminar sus datos personales.</li>
                <li>Restringir u oponerse al procesamiento de sus datos.</li>
                <li>Solicitar la portabilidad de sus datos.</li>
              </ul>

              <h2>7. Cambios a esta Política</h2>
              <p>
                Podemos actualizar nuestra Política de Privacidad de vez en cuando. Le notificaremos cualquier cambio
                publicando la nueva Política de Privacidad en esta página y, si los cambios son significativos, le
                proporcionaremos un aviso más prominente.
              </p>

              <h2>8. Contacto</h2>
              <p>
                Si tiene alguna pregunta sobre esta Política de Privacidad, por favor contáctenos a través de
                info@miturno.app.
              </p>
            </div>
          </div>
        </div>
      </main>
   
    </div>
  )
}
