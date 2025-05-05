import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { MercadoPagoConfig, Payment, MerchantOrder } from "mercadopago"

// Configurar MercadoPago
const client = new MercadoPagoConfig({ 
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN! 
})

// Webhook handler para MercadoPago
export async function PUT(request: Request) {
  try {
    const url = new URL(request.url)
    const topic = url.searchParams.get("topic")
    const id = url.searchParams.get("id")
    const type = url.searchParams.get("type")
    const dataId = url.searchParams.get("data.id")

    console.log("Webhook received:", { topic, id, type, dataId })

    // Determinar el ID correcto basado en el tipo de notificación
    const paymentId = type === "payment" ? dataId : id

    if (!paymentId) {
      console.error("No payment ID provided in webhook")
      return NextResponse.json(
        { error: "ID no proporcionado" },
        { status: 400 }
      )
    }

    if (topic === "payment" || type === "payment") {
      try {
        const payment = new Payment(client)
        const paymentInfo = await payment.get({ id: paymentId })

        console.log("Payment info:", paymentInfo)

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
    console.error("No merchant order ID provided")
    return NextResponse.json(
      { error: "ID de orden no proporcionado" },
      { status: 400 }
    )
  }

  try {
    const merchantOrder = new MerchantOrder(client)
    const orderInfo = await merchantOrder.get({ merchantOrderId: orderId })

    console.log("Merchant order info:", orderInfo)

    if (orderInfo.status === "paid" && orderInfo.external_reference && orderInfo.payments && orderInfo.payments.length > 0) {
      const { userId, plan } = JSON.parse(orderInfo.external_reference)
      const paymentId = orderInfo.payments[0].id

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

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Error processing merchant order:", error)
    return NextResponse.json(
      { error: error.message || "Error al procesar la orden" },
      { status: 500 }
    )
  }
} 