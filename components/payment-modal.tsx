"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Loader2 } from "lucide-react"

interface PaymentModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  serviceName: string
  servicePrice: number
  onPaymentComplete: () => void
}

export function PaymentModal({ open, onOpenChange, serviceName, servicePrice, onPaymentComplete }: PaymentModalProps) {
  const [loading, setLoading] = useState(false)
  const depositAmount = Math.round(servicePrice * 0.2) // 20% del precio como seña

  const handlePayment = async () => {
    setLoading(true)

    try {
      // Simulamos el proceso de pago
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Pago exitoso
      onPaymentComplete()
      onOpenChange(false)
    } catch (error) {
      console.error("Error en el pago:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Pago de seña</DialogTitle>
          <DialogDescription>
            Para confirmar tu reserva, es necesario abonar una seña del 20% del valor del servicio.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="rounded-lg border p-4">
            <h3 className="font-medium mb-2">Detalles del servicio</h3>
            <p className="text-sm mb-1">{serviceName}</p>
            <p className="text-sm text-muted-foreground mb-4">Precio total: ${servicePrice.toFixed(2)}</p>

            <div className="flex justify-between font-medium">
              <span>Seña a abonar (20%):</span>
              <span>${depositAmount.toFixed(2)}</span>
            </div>
          </div>

          <div className="bg-muted p-4 rounded-lg">
            <p className="text-sm">
              El resto del pago (${(servicePrice - depositAmount).toFixed(2)}) deberá ser abonado al momento de recibir
              el servicio.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancelar
          </Button>
          <Button onClick={handlePayment} disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Procesando...
              </>
            ) : (
              `Pagar $${depositAmount.toFixed(2)} con MercadoPago`
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
