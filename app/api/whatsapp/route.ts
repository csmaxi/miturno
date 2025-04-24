import { type NextRequest, NextResponse } from "next/server"
import twilio from "twilio"

// Inicializar el cliente de Twilio con las credenciales
const accountSid = process.env.TWILIO_ACCOUNT_SID
const authToken = process.env.TWILIO_AUTH_TOKEN
const twilioWhatsAppNumber = process.env.TWILIO_WHATSAPP_NUMBER

// Crear el cliente solo si las credenciales están disponibles
const client = accountSid && authToken ? twilio(accountSid, authToken) : null

/**
 * Asegura que el número de teléfono tenga el formato internacional correcto
 */
function formatPhoneNumber(phoneNumber: string): string {
  // Eliminar espacios, guiones y paréntesis
  let formatted = phoneNumber.replace(/[\s\-()]/g, "")

  // Asegurarse de que comience con +
  if (!formatted.startsWith("+")) {
    formatted = "+" + formatted
  }

  return formatted
}

export async function POST(request: NextRequest) {
  try {
    // Obtener los datos del cuerpo de la solicitud
    const { phoneNumber, message } = await request.json()

    // Verificar que se proporcionaron los datos necesarios
    if (!phoneNumber || !message) {
      return NextResponse.json({ success: false, error: "Se requiere número de teléfono y mensaje" }, { status: 400 })
    }

    // Verificar que el cliente de Twilio esté inicializado
    if (!client || !twilioWhatsAppNumber) {
      console.error("Error: Credenciales de Twilio no configuradas")
      return NextResponse.json({ success: false, error: "Credenciales de Twilio no configuradas" }, { status: 500 })
    }

    // Asegurarse de que el número tenga el formato correcto
    const formattedNumber = formatPhoneNumber(phoneNumber)

    // Enviar el mensaje a través de Twilio
    const response = await client.messages.create({
      body: message,
      from: `whatsapp:${twilioWhatsAppNumber}`,
      to: `whatsapp:${formattedNumber}`,
    })

    console.log(`Mensaje de WhatsApp enviado con éxito. SID: ${response.sid}`)

    return NextResponse.json({
      success: true,
      messageId: response.sid,
    })
  } catch (error: any) {
    console.error("Error al enviar mensaje de WhatsApp:", error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Error desconocido al enviar el mensaje",
      },
      { status: 500 },
    )
  }
}
