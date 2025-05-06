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
    answer: "Ofrecemos tres planes: Free, Basic y Pro. El plan Free es gratuito y te permite gestionar hasta 15 turnos por mes. El plan Basic incluye 30 turnos y más funcionalidades. El plan Pro ofrece turnos ilimitados y todas las características premium."
  },
  {
    question: "¿Puedo cambiar de plan en cualquier momento?",
    answer: "Sí, puedes cambiar de plan en cualquier momento. Los cambios se aplicarán inmediatamente y se ajustará el precio proporcionalmente."
  },
  {
    question: "¿Qué métodos de pago aceptan?",
    answer: "Aceptamos todas las tarjetas de crédito y débito a través de MercadoPago, así como transferencias bancarias y billeteras virtuales."
  },
  {
    question: "¿Hay un período de prueba?",
    answer: "Sí, ofrecemos un período de prueba de 14 días en el plan Basic y Pro para que puedas probar todas las funcionalidades antes de comprometerte."
  },
  {
    question: "¿Qué sucede si excedo los límites de mi plan?",
    answer: "Si excedes los límites de tu plan actual, podrás seguir utilizando las funcionalidades básicas. Te notificaremos cuando te acerques al límite para que puedas considerar actualizar tu plan."
  },
  {
    question: "¿Puedo cancelar mi suscripción?",
    answer: "Sí, puedes cancelar tu suscripción en cualquier momento. No hay penalizaciones por cancelación y podrás seguir utilizando tu plan hasta el final del período pagado."
  }
]

export default function PricingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar user={null} />
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
