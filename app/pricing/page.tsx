import { PricingPlans } from "../components/pricing-plans"

export default function PricingPage() {
  return (
    <div className="container py-16">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold mb-4">Planes y Precios</h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Elige el plan que mejor se adapte a tus necesidades. Todos los planes incluyen actualizaciones gratuitas y soporte técnico.
        </p>
      </div>

      <div className="max-w-6xl mx-auto">
        <PricingPlans />
      </div>

      <div className="mt-32">
        <h2 className="text-3xl font-bold text-center mb-12">Preguntas Frecuentes</h2>
        <div className="grid gap-12 md:grid-cols-2 max-w-4xl mx-auto">
          <div className="space-y-8">
            <div>
              <h3 className="text-xl font-semibold mb-3">¿Puedo cambiar de plan en cualquier momento?</h3>
              <p className="text-muted-foreground">
                Sí, puedes cambiar de plan en cualquier momento. El cambio se aplicará inmediatamente y se ajustará el precio proporcionalmente.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-3">¿Qué métodos de pago aceptan?</h3>
              <p className="text-muted-foreground">
                Aceptamos todos los métodos de pago disponibles en MercadoPago, incluyendo tarjetas de crédito, débito y transferencias.
              </p>
            </div>
          </div>
          <div className="space-y-8">
            <div>
              <h3 className="text-xl font-semibold mb-3">¿Puedo cancelar mi suscripción?</h3>
              <p className="text-muted-foreground">
                Sí, puedes cancelar tu suscripción en cualquier momento desde tu panel de control. No hay penalizaciones por cancelación.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-3">¿Qué sucede si excedo los límites de mi plan?</h3>
              <p className="text-muted-foreground">
                Si excedes los límites de tu plan actual, recibirás una notificación y tendrás la opción de actualizar a un plan superior.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
