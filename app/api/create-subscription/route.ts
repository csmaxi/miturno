import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { MercadoPagoConfig, Payment, MerchantOrder } from "mercadopago"

// Configurar MercadoPago
const client = new MercadoPagoConfig({ 
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN! 
})

export async function POST(request: Request) {
  try {
    const { payment_id, status, external_reference } = await request.json()

    // Verificar el pago en MercadoPago
    const payment = new Payment(client)
    const paymentInfo = await payment.get({ id: payment_id })

    if (paymentInfo.status !== "approved") {
      return NextResponse.json(
        { error: "El pago no fue aprobado" },
        { status: 400 }
      )
    }

    // Parsear la referencia externa
    const { userId, plan } = JSON.parse(external_reference)

    // Crear la suscripción en la base de datos
    const supabase = createServerSupabaseClient()
    const { error } = await supabase
      .from("subscriptions")
      .insert({
        user_id: userId,
        plan: plan.toLowerCase(),
        status: "active",
        mercadopago_subscription_id: payment_id,
        current_period_start: new Date().toISOString(),
        current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      })

    if (error) {
      console.error("Error creating subscription:", error)
      return NextResponse.json(
        { error: "Error al crear la suscripción" },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Error processing subscription:", error)
    return NextResponse.json(
      { error: error.message || "Error al procesar la suscripción" },
      { status: 500 }
    )
  }
}

// Webhook handler para MercadoPago
export async function PUT(request: Request) {
  try {
    const url = new URL(request.url)
    const topic = url.searchParams.get("topic")
    const id = url.searchParams.get("id")
    const type = url.searchParams.get("type")
    const dataId = url.searchParams.get("data.id")

    // Determinar el ID correcto basado en el tipo de notificación
    const paymentId = type === "payment" ? dataId : id

    if (!paymentId) {
      return NextResponse.json(
        { error: "ID no proporcionado" },
        { status: 400 }
      )
    }

    if (topic === "payment" || type === "payment") {
      try {
        const payment = new Payment(client)
        const paymentInfo = await payment.get({ id: paymentId })

        if (paymentInfo.status === "approved" && paymentInfo.external_reference) {
          const { userId, plan } = JSON.parse(paymentInfo.external_reference)

          const supabase = createServerSupabaseClient()
          const { error } = await supabase
            .from("subscriptions")
            .update({
              status: "active",
              current_period_start: new Date().toISOString(),
              current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            })
            .eq("user_id", userId)
            .eq("mercadopago_subscription_id", paymentId)

          if (error) {
            console.error("Error updating subscription:", error)
            return NextResponse.json(
              { error: "Error al actualizar la suscripción" },
              { status: 500 }
            )
          }
        }
      } catch (error) {
        console.error("Error processing payment webhook:", error)
        // Si falla el procesamiento del pago, intentamos con merchant_order
        if (topic === "merchant_order") {
          return handleMerchantOrder(id)
        }
        throw error
      }
    } else if (topic === "merchant_order") {
      return handleMerchantOrder(id)
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Error processing webhook:", error)
    return NextResponse.json(
      { error: error.message || "Error al procesar el webhook" },
      { status: 500 }
    )
  }
}

async function handleMerchantOrder(orderId: string | null) {
  if (!orderId) {
    return NextResponse.json(
      { error: "ID de orden no proporcionado" },
      { status: 400 }
    )
  }

  try {
    const merchantOrder = new MerchantOrder(client)
    const orderInfo = await merchantOrder.get({ merchantOrderId: orderId })

    if (orderInfo.status === "paid" && orderInfo.external_reference && orderInfo.payments && orderInfo.payments.length > 0) {
      const { userId, plan } = JSON.parse(orderInfo.external_reference)

      const supabase = createServerSupabaseClient()
      const { error } = await supabase
        .from("subscriptions")
        .update({
          status: "active",
          current_period_start: new Date().toISOString(),
          current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        })
        .eq("user_id", userId)
        .eq("mercadopago_subscription_id", orderInfo.payments[0].id)

      if (error) {
        console.error("Error updating subscription:", error)
        return NextResponse.json(
          { error: "Error al actualizar la suscripción" },
          { status: 500 }
        )
      }
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Error processing merchant order:", error)
    return NextResponse.json(
      { error: error.message || "Error al procesar la orden" },
      { status: 500 }
    )
  }
} 