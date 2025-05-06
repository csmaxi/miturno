"use client"

import { useState } from "react"
import { Navbar } from "@/components/navbar"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"

export default function CheckoutPage() {
  const { toast } = useToast()
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleCheckout = async () => {
    setLoading(true)

    try {
      // Simulamos el proceso de pago
      await new Promise((resolve) => setTimeout(resolve, 2000))

      toast({
        title: "Pago procesado",
        description: "Tu suscripción ha sido activada correctamente.",
      })

      router.push("/checkout/success")
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Ocurrió un error al procesar el pago.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar user={null} />
      <main className="flex-1">
        <div className="container px-4 py-12 md:px-6">
          <div className="mx-auto max-w-md space-y-8">
            <div className="text-center space-y-2">
              <h1 className="text-3xl font-bold">Checkout</h1>
              <p className="text-muted-foreground">Completa tu suscripción al Plan Básico</p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Resumen de la compra</CardTitle>
                <CardDescription>Plan Básico - Suscripción mensual</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between py-2 border-b">
                  <span>Plan Básico</span>
                  <span>$5,000.00</span>
                </div>
                <div className="flex justify-between py-4 font-bold">
                  <span>Total</span>
                  <span>$5,000.00</span>
                </div>

                <div className="mt-6">
                  <div className="bg-muted p-4 rounded-lg mb-6">
                    <h3 className="font-medium mb-2">Pagar con MercadoPago</h3>
                    <p className="text-sm text-muted-foreground">
                      Serás redirigido a MercadoPago para completar tu pago de forma segura.
                    </p>
                  </div>

                  <Button className="w-full" onClick={handleCheckout} disabled={loading}>
                    {loading ? "Procesando..." : "Pagar con MercadoPago"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
   
    </div>
  )
}
