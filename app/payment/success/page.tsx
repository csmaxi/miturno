import { Button } from "@/components/ui/button"
import { CheckCircle } from "lucide-react"
import Link from "next/link"

export default function PaymentSuccessPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8 text-center">
        <div className="flex justify-center">
          <CheckCircle className="h-16 w-16 text-green-500" />
        </div>
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">¡Pago Exitoso!</h1>
          <p className="text-gray-500">
            Tu suscripción ha sido activada correctamente. Ya puedes comenzar a usar todas las funcionalidades.
          </p>
        </div>
        <div className="space-y-4">
          <Button asChild className="w-full">
            <Link href="/dashboard">
              Ir al Dashboard
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
} 