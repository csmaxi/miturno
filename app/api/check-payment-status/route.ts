import { NextResponse } from 'next/server'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { headers } from 'next/headers'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const paymentId = searchParams.get('payment_id')

    if (!paymentId) {
      return NextResponse.json(
        { error: 'Payment ID is required' },
        { status: 400 }
      )
    }

    // Obtener el token de MercadoPago desde las variables de entorno
    const mpAccessToken = process.env.MERCADOPAGO_ACCESS_TOKEN

    if (!mpAccessToken) {
      console.error('MercadoPago access token not found')
      return NextResponse.json(
        { error: 'Payment service configuration error' },
        { status: 500 }
      )
    }

    // Verificar el estado del pago con MercadoPago
    const response = await fetch(
      `https://api.mercadopago.com/v1/payments/${paymentId}`,
      {
        headers: {
          'Authorization': `Bearer ${mpAccessToken}`,
          'Content-Type': 'application/json',
        },
      }
    )

    if (!response.ok) {
      console.error('Error checking payment status:', await response.text())
      return NextResponse.json(
        { error: 'Error checking payment status' },
        { status: response.status }
      )
    }

    const paymentData = await response.json()

    // Si el pago está aprobado, actualizar el plan del usuario
    if (paymentData.status === 'approved') {
      const supabase = createClientComponentClient()
      const headersList = headers()
      const authorization = headersList.get('authorization')

      if (!authorization) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        )
      }

      // Obtener el ID del usuario del token
      const { data: { user }, error: userError } = await supabase.auth.getUser()

      if (userError || !user) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 401 }
        )
      }

      // Actualizar el plan del usuario
      const { error: updateError } = await supabase
        .from('users')
        .update({ subscription_plan: 'premium' })
        .eq('id', user.id)

      if (updateError) {
        console.error('Error updating user plan:', updateError)
        return NextResponse.json(
          { error: 'Error updating user plan' },
          { status: 500 }
        )
      }
    }

    return NextResponse.json({
      status: paymentData.status,
      payment_id: paymentId,
    })
  } catch (error) {
    console.error('Error in check-payment-status:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 