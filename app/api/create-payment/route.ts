import { NextResponse } from "next/server"
import { MercadoPagoConfig, Preference } from "mercadopago"

// Configurar MercadoPago
const client = new MercadoPagoConfig({ 
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN! 
})

export async function POST(request: Request) {
  try {
    const { plan, price, userId } = await request.json()

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
          },
        ],
        back_urls: {
          success: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/subscription?status=success`,
          failure: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/subscription?status=failure`,
          pending: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/subscription?status=pending`,
        },
        auto_return: "approved",
        external_reference: JSON.stringify({
          userId,
          plan,
        }),
      }
    })

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