import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { MercadoPagoConfig, Payment, MerchantOrder } from "mercadopago"

// Configurar MercadoPago
const client = new MercadoPagoConfig({ 
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN! 
})

export async function POST(request: Request) {
  try {
    // Obtener parámetros de la URL
    const url = new URL(request.url)
    const topic = url.searchParams.get("topic")
    const id = url.searchParams.get("id")
    const type = url.searchParams.get("type")
    const dataId = url.searchParams.get("data.id")

    console.log("Webhook received:", { topic, id, type, dataId })

    // Determinar el ID correcto basado en el tipo de notificación
    const paymentId = type === "payment" ? dataId : id

    if (!paymentId) {
      console.error("No payment ID provided")
      return NextResponse.json(
        { error: "ID no proporcionado" },
        { status: 400 }
      )
    }

    // Verificar si la suscripción ya existe
    const supabase = createServerSupabaseClient()
    const { data: existingSubscription } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("mercadopago_subscription_id", paymentId)
      .single()

    if (existingSubscription) {
      console.log("Subscription already exists:", existingSubscription)
      return NextResponse.json({ success: true, message: "Subscription already exists" })
    }

    if (topic === "merchant_order") {
      if (!id) {
        console.error("No merchant order ID provided")
        return NextResponse.json(
          { error: "ID de orden no proporcionado" },
          { status: 400 }
        )
      }

      try {
        const merchantOrder = new MerchantOrder(client)
        const orderInfo = await merchantOrder.get({ merchantOrderId: id })

        console.log("Merchant order info:", orderInfo)

        if (orderInfo.status === "paid" && orderInfo.external_reference && orderInfo.payments && orderInfo.payments.length > 0) {
          const { userId, plan } = JSON.parse(orderInfo.external_reference)
          const paymentId = orderInfo.payments[0].id

          const { error } = await supabase
            .from("subscriptions")
            .insert({
              user_id: userId,
              plan: plan.toLowerCase(),
              status: "active",
              mercadopago_subscription_id: paymentId,
              current_period_start: new Date().toISOString(),
              current_period_end: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
            })

          if (error) {
            console.error("Error creating subscription from merchant order:", error)
            return NextResponse.json(
              { error: "Error al crear la suscripción" },
              { status: 500 }
            )
          }
        }
      } catch (error) {
        console.error("Error processing merchant order:", error)
        // Si falla el procesamiento de la orden, intentamos con el pago
        return handlePayment(paymentId)
      }
    } else {
      return handlePayment(paymentId)
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

async function handlePayment(paymentId: string) {
  try {
    const payment = new Payment(client)
    const paymentInfo = await payment.get({ id: paymentId })

    console.log("Payment info:", paymentInfo)

    if (paymentInfo.status !== "approved") {
      console.error("Payment not approved:", paymentInfo.status)
      return NextResponse.json(
        { error: "El pago no fue aprobado" },
        { status: 400 }
      )
    }

    if (!paymentInfo.external_reference) {
      console.error("No external reference found in payment")
      return NextResponse.json(
        { error: "Referencia externa no encontrada" },
        { status: 400 }
      )
    }

    // Parsear la referencia externa
    const { userId, plan } = JSON.parse(paymentInfo.external_reference)

    // Crear la suscripción en la base de datos
    const supabase = createServerSupabaseClient()
    const { error: subscriptionError } = await supabase
      .from("subscriptions")
      .insert({
        user_id: userId,
        plan: plan.toLowerCase(),
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
      .update({ subscription_plan: plan.toLowerCase() })
      .eq("id", userId)

    if (userError) {
      console.error("Error updating user plan:", userError)
      return NextResponse.json(
        { error: "Error al actualizar el plan del usuario" },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Error handling payment:", error)
    return NextResponse.json(
      { error: error.message || "Error al procesar el pago" },
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
              current_period_end: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
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
          current_period_end: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
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