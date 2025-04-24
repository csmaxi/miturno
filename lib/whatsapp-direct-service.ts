/**
 * Genera un enlace directo a WhatsApp para enviar un mensaje
 * @param phoneNumber - Número de teléfono del destinatario (formato internacional, ej: +5491123456789)
 * @param message - Contenido del mensaje
 * @returns URL para abrir WhatsApp con el mensaje predefinido
 */
export function generateWhatsAppLink(phoneNumber: string, message: string): string {
  if (!phoneNumber) return "#"

  // Asegurarse de que el número tenga el formato correcto
  const formattedNumber = formatPhoneNumber(phoneNumber)

  if (!formattedNumber) return "#"

  // Codificar el mensaje para URL
  const encodedMessage = encodeURIComponent(message || "")

  // Generar el enlace de WhatsApp
  return `https://wa.me/${formattedNumber}?text=${encodedMessage}`
}

/**
 * Asegura que el número de teléfono tenga el formato internacional correcto para enlaces de WhatsApp
 */
function formatPhoneNumber(phoneNumber: string): string {
  if (!phoneNumber) return ""

  // Eliminar espacios, guiones, paréntesis y el signo +
  const formatted = phoneNumber.replace(/[\s\-()+ ]/g, "")

  // Asegurarse de que no esté vacío
  if (formatted.length === 0) return ""

  return formatted
}

/**
 * Formatea un mensaje de notificación para el propietario cuando recibe una nueva reserva
 */
export function formatAppointmentNotificationForOwner(appointment: any, service: any, client: any) {
  const appointmentDate = new Date(appointment.appointment_date).toLocaleDateString("es-AR", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  return `🔔 *¡Nueva reserva recibida!*

*Cliente:* ${client.name}
*Email:* ${client.email}
*Teléfono:* ${client.phone || "No proporcionado"}
*Servicio:* ${service?.name || "No especificado"}
*Fecha:* ${appointmentDate}
*Hora:* ${appointment.start_time.substring(0, 5)} - ${appointment.end_time.substring(0, 5)}
${appointment.notes ? `\n*Notas:* ${appointment.notes}` : ""}

Para confirmar o cancelar este turno, ingresa a tu panel de MiTurno.`
}

/**
 * Formatea un mensaje de confirmación para el cliente cuando su reserva es confirmada
 */
export function formatAppointmentConfirmationForClient(appointment: any, service: any, owner: any) {
  const appointmentDate = new Date(appointment.appointment_date).toLocaleDateString("es-AR", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  return `✅ *¡Tu turno ha sido confirmado!*

*${owner.full_name}*
*Servicio:* ${service?.name || "No especificado"}
*Fecha:* ${appointmentDate}
*Hora:* ${appointment.start_time.substring(0, 5)} - ${appointment.end_time.substring(0, 5)}

Gracias por reservar con nosotros. Si necesitas cancelar o reprogramar, por favor contáctanos.

¡Te esperamos!`
}

/**
 * Formatea un mensaje de cancelación para el cliente cuando su reserva es cancelada
 */
export function formatAppointmentCancellationForClient(appointment: any, service: any, owner: any) {
  const appointmentDate = new Date(appointment.appointment_date).toLocaleDateString("es-AR", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  return `❌ *Tu turno ha sido cancelado*

*${owner.full_name}*
*Servicio:* ${service?.name || "No especificado"}
*Fecha:* ${appointmentDate}
*Hora:* ${appointment.start_time.substring(0, 5)} - ${appointment.end_time.substring(0, 5)}

Si deseas reprogramar, por favor visita nuestra página o contáctanos directamente.`
}

/**
 * Formatea un mensaje de recordatorio para el cliente un día antes de su cita
 */
export function formatAppointmentReminderForClient(appointment: any, service: any, owner: any) {
  const appointmentDate = new Date(appointment.appointment_date).toLocaleDateString("es-AR", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  return `🔔 *Recordatorio de turno - Mañana*

*${owner.full_name}*
*Servicio:* ${service?.name || "No especificado"}
*Fecha:* ${appointmentDate}
*Hora:* ${appointment.start_time.substring(0, 5)} - ${appointment.end_time.substring(0, 5)}

Te esperamos mañana. Si necesitas cancelar o reprogramar, por favor contáctanos lo antes posible.`
}

/**
 * Formatea un mensaje de notificación para el propietario cuando su período de prueba está por finalizar
 */
export function formatTrialEndingNotification(user: any) {
  const endDate = new Date(user.trial_end_date).toLocaleDateString("es-AR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  return `⏰ *Tu período de prueba está por finalizar*

Hola ${user.full_name},

Tu período de prueba gratuito de MiTurno finalizará el ${endDate}.

Para seguir disfrutando de todas las funcionalidades y continuar recibiendo reservas, activa tu suscripción mensual de $5,000.

Puedes hacerlo fácilmente desde tu panel de control en MiTurno.app.

¡Gracias por usar nuestro servicio!`
}

/**
 * Formatea un mensaje de notificación para el propietario cuando su período de prueba ha finalizado
 */
export function formatTrialEndedNotification(user: any) {
  return `🔔 *Tu período de prueba ha finalizado*

Hola ${user.full_name},

Tu período de prueba gratuito de MiTurno ha finalizado.

Para reactivar tu cuenta y seguir recibiendo reservas, activa tu suscripción mensual de $5,000.

Puedes hacerlo fácilmente desde tu panel de control en MiTurno.app.

¡Gracias por usar nuestro servicio!`
}
