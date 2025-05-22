import { PricingPlans } from "../components/pricing-plans"
import { Metadata } from "next"
import { Navbar } from "@/components/navbar"

export const metadata: Metadata = {
  title: "Precios | MiTurno",
  description: "Elige el plan que mejor se adapte a tus necesidades. Desde el plan gratuito hasta el plan Pro con todas las funcionalidades.",
  keywords: ["precios", "planes", "suscripción", "turnos", "servicios"],
}

const faqs = [
  {
    question: "¿Cómo funciona el sistema de precios?",
    answer: "Ofrecemos dos planes: Free y Premium. El plan Free es gratuito y te permite gestionar hasta 10 turnos (pendientes y confirmados), 3 servicios y 1 miembro del equipo. El plan Premium por $1 te da acceso ilimitado a turnos, servicios y miembros del equipo."
  },
  {
    question: "¿Puedo cambiar de plan en cualquier momento?",
    answer: "Sí, puedes cambiar de plan en cualquier momento. Si cambias al plan gratuito, mantendrás tus datos pero con las limitaciones del plan. Si actualizas al plan Premium, tendrás acceso inmediato a todas las funcionalidades ilimitadas."
  },
  {
    question: "¿Qué métodos de pago aceptan?",
    answer: "Aceptamos todas las tarjetas de crédito y débito a través de MercadoPago, así como transferencias bancarias y billeteras virtuales."
  },
  {
    question: "¿Qué sucede si excedo los límites del plan gratuito?",
    answer: "Si excedes los límites del plan gratuito, podrás seguir utilizando las funcionalidades básicas hasta el límite establecido. Te notificaremos cuando te acerques al límite para que puedas considerar actualizar al plan Premium."
  },
  {
    question: "¿Puedo cancelar mi suscripción Premium?",
    answer: "Sí, puedes cancelar tu suscripción Premium en cualquier momento. Al cancelar, volverás automáticamente al plan gratuito con sus respectivas limitaciones."
  },
  {
    question: "¿El pago del plan Premium es único o recurrente?",
    answer: "El pago del plan Premium es único por $1. No hay pagos recurrentes ni suscripciones mensuales."
  }
]

export default async function PricingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2 mb-6">
                <h1 
                  className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none"
                  id="pricing-title"
                >
                  Precios
                </h1>
                <p 
                  className="mx-auto max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400"
                  aria-describedby="pricing-title"
                >
                  Elige el plan que mejor se adapte a tus necesidades. Desde el plan gratuito hasta el plan Pro con todas las funcionalidades.
                </p>
              </div>
            </div>
            <div className="mx-auto max-w-5xl">
              <PricingPlans />
            </div>
          </div>
        </section>
        <section 
          className="w-full py-12 md:py-24 lg:py-32 bg-gray-100 dark:bg-gray-800"
          aria-labelledby="faq-title"
        >
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 
                  className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl"
                  id="faq-title"
                >
                  Preguntas Frecuentes
                </h2>
                <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400">
                  Encuentra respuestas a las preguntas más comunes sobre nuestros planes y precios.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-2 lg:gap-12 mt-8">
              {faqs.map((faq, index) => (
                <div 
                  key={index}
                  className="flex flex-col justify-center space-y-2"
                  role="article"
                >
                  <h3 
                    className="text-xl font-bold"
                    id={`faq-question-${index}`}
                  >
                    {faq.question}
                  </h3>
                  <p 
                    className="text-gray-500 dark:text-gray-400"
                    aria-labelledby={`faq-question-${index}`}
                  >
                    {faq.answer}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
