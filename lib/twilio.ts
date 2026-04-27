/**
 * DIVINIA — Twilio WhatsApp sender
 * Envío proactivo de mensajes de WhatsApp para follow-ups automáticos.
 * La recepción ya está en /api/whatsapp/webhook (TwiML).
 */

interface SendResult {
  success: boolean
  sid?: string
  error?: string
}

function getTwilioCredentials() {
  const accountSid = process.env.TWILIO_ACCOUNT_SID
  const authToken = process.env.TWILIO_AUTH_TOKEN
  const from = process.env.TWILIO_WHATSAPP_NUMBER || process.env.TWILIO_WHATSAPP_SANDBOX_NUMBER
  return { accountSid, authToken, from }
}

// Envía un mensaje de WhatsApp a través de Twilio
// to: número E.164 sin prefijo "whatsapp:" (ej: "+5492661234567")
export async function sendWhatsAppMessage(to: string, body: string): Promise<SendResult> {
  const { accountSid, authToken, from } = getTwilioCredentials()

  if (!accountSid || !authToken || !from) {
    console.warn('[Twilio] Credenciales no configuradas — mensaje simulado')
    return { success: true, sid: `mock-${Date.now()}` }
  }

  const toFormatted = to.startsWith('whatsapp:') ? to : `whatsapp:${to}`
  const fromFormatted = from.startsWith('whatsapp:') ? from : `whatsapp:${from}`

  try {
    const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`
    const params = new URLSearchParams({
      From: fromFormatted,
      To: toFormatted,
      Body: body,
    })

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString('base64')}`,
      },
      body: params.toString(),
    })

    const data = await res.json()

    if (!res.ok) {
      console.error('[Twilio] Error enviando WA:', data)
      return { success: false, error: data.message || `HTTP ${res.status}` }
    }

    return { success: true, sid: data.sid }
  } catch (err) {
    console.error('[Twilio] Error:', err)
    return { success: false, error: String(err) }
  }
}

// Envío masivo con rate limiting básico (1 mensaje cada 100ms)
export async function sendWhatsAppBulk(
  messages: Array<{ to: string; body: string }>
): Promise<SendResult[]> {
  const results: SendResult[] = []
  for (const msg of messages) {
    results.push(await sendWhatsAppMessage(msg.to, msg.body))
    await new Promise(r => setTimeout(r, 100))
  }
  return results
}

// Template: seguimiento 24hs después del primer contacto
export function buildFollowUpMessage(companyName: string, waLink: string): string {
  return `Hola 👋 Joaco de DIVINIA.

Ayer te contacté sobre automatizar ${companyName} con IA.

¿Pudiste revisar? Te puedo mostrar en 10 minutos cómo funciona para tu negocio específicamente.

Respondé este mensaje o escribime por acá: ${waLink}`
}

// Template: envío de propuesta
export function buildProposalMessage(companyName: string, proposalUrl: string): string {
  return `Hola, te mando la propuesta para ${companyName} 📋

Armé algo específico para tu negocio:
${proposalUrl}

Tiene precios, lo que incluye, y cómo funciona el setup. Cualquier duda me avisás.`
}

// Template: confirmación de turno (desde Turnero)
export function buildTurneroConfirmation(params: {
  clientName: string
  service: string
  date: string
  time: string
  businessName: string
  panelUrl: string
}): string {
  return `✅ *Turno confirmado*

📍 *${params.businessName}*
👤 ${params.clientName}
📅 ${params.date} a las ${params.time}
💼 ${params.service}

Para cancelar o reprogramar respondé este mensaje.`
}
