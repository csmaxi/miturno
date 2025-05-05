import { NextResponse } from "next/server"
import { MercadoPagoConfig, Preference } from "mercadopago"

// Configurar MercadoPago
const client = new MercadoPagoConfig({ 
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN! 
})

export async function POST(request: Request) {
  try {
    const { plan, price, userId } = await request.json()
    console.log("Creating payment for:", { plan, price, userId })

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL
    console.log("Using base URL:", baseUrl)

    // Crear preferencia de pago
    const preference = new Preference(client)
    const result = await preference.create({
      body: {
        items: [
          {
            id: `plan-${plan.toLowerCase()}`,
            title: `Plan ${plan} - MiTurno`,
            unit_price: Number(price),
            quantity: 1,
            currency_id: "ARS"
          },
        ],
        back_urls: {
          success: `${baseUrl}/payment/success`,
          failure: `${baseUrl}/payment/failure`,
          pending: `${baseUrl}/payment/pending`,
        },
        auto_return: "approved",
        notification_url: `${baseUrl}/api/webhooks/mercadopago`,
        external_reference: JSON.stringify({
          userId,
          plan,
        }),
        payment_methods: {
          excluded_payment_types: [
            { id: "ticket" },
            { id: "atm" }
          ],
          installments: 1
        }
      }
    })

    console.log("Payment preference created:", result)

    return NextResponse.json({
      init_point: result.init_point,
    })
  } catch (error: any) {
    console.error("Error creating payment:", error)
    return NextResponse.json(
      { error: error.message || "Error al crear el pago" },
      { status: 500 }
    )
  }
} 