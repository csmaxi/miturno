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
    console.log("Webhook received - Full URL:", request.url)
    const url = new URL(request.url)
    const topic = url.searchParams.get("topic")
    const id = url.searchParams.get("id")
    const type = url.searchParams.get("type")
    const dataId = url.searchParams.get("data.id")

    console.log("Webhook parameters:", { topic, id, type, dataId })

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

        console.log("Payment info:", JSON.stringify(paymentInfo, null, 2))

        if (paymentInfo.status === "approved" && paymentInfo.external_reference) {
          const { userId, plan } = JSON.parse(paymentInfo.external_reference)
          console.log("Processing approved payment for user:", userId, "plan:", plan)

          const supabase = createServerSupabaseClient()
          
          // Actualizar la suscripción
          const { error: subscriptionError } = await supabase
            .from("subscriptions")
            .insert({
              user_id: userId,
              plan: "premium",
              status: "active",
              mercadopago_subscription_id: paymentId,
              current_period_start: new Date().toISOString(),
              current_period_end: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
            })

          if (subscriptionError) {
            console.error("Error creating subscription:", subscriptionError)
            return NextResponse.json(
              { error: "Error al crear la suscripción" },
              { status: 500 }
            )
          }

          // Actualizar el plan del usuario
          const { error: userError } = await supabase
            .from("users")
            .update({ subscription_plan: "premium" })
            .eq("id", userId)

          if (userError) {
            console.error("Error updating user plan:", userError)
            return NextResponse.json(
              { error: "Error al actualizar el plan del usuario" },
              { status: 500 }
            )
          }

          console.log("Subscription and user plan updated successfully")
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
    console.log("Processing merchant order:", orderId)
    const merchantOrder = new MerchantOrder(client)
    const orderInfo = await merchantOrder.get({ merchantOrderId: orderId })

    console.log("Merchant order info:", JSON.stringify(orderInfo, null, 2))

    if (orderInfo.status === "paid" && orderInfo.external_reference && orderInfo.payments && orderInfo.payments.length > 0) {
      const { userId, plan } = JSON.parse(orderInfo.external_reference)
      const paymentId = orderInfo.payments[0].id
      console.log("Processing paid order for user:", userId, "plan:", plan)

      const supabase = createServerSupabaseClient()
      
      // Actualizar la suscripción
      const { error: subscriptionError } = await supabase
        .from("subscriptions")
        .update({
          status: "active",
          current_period_start: new Date().toISOString(),
          current_period_end: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
        })
        .eq("user_id", userId)
        .eq("mercadopago_subscription_id", paymentId)

      if (subscriptionError) {
        console.error("Error updating subscription:", subscriptionError)
        return NextResponse.json(
          { error: "Error al actualizar la suscripción" },
          { status: 500 }
        )
      }

      // Actualizar el plan del usuario
      const { error: userError } = await supabase
        .from("users")
        .update({ subscription_plan: plan.toLowerCase() })
        .eq("id", userId)

      if (userError) {
        console.error("Error updating user plan:", userError)
        return NextResponse.json(
          { error: "Error al actualizar el plan del usuario" },
          { status: 500 }
        )
      }

      console.log("Subscription and user plan updated successfully from merchant order")
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