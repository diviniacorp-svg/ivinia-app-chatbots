import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase'
import { generateChatbotResponse } from '@/lib/claude'
import { createHmac } from 'crypto'

export const dynamic = 'force-dynamic'

// Verificación de firma Twilio real
function validateTwilioSignature(request: NextRequest, body: string): boolean {
  const authToken = process.env.TWILIO_AUTH_TOKEN
  if (!authToken) return true // sin token → dev mode

  const twilioSignature = request.headers.get('x-twilio-signature')
  if (!twilioSignature) return false

  const url = process.env.NEXT_PUBLIC_APP_URL
    ? `${process.env.NEXT_PUBLIC_APP_URL}/api/whatsapp/webhook`
    : request.url

  // Parsear y ordenar params alfabéticamente (spec de Twilio)
  const params = Object.fromEntries(
    body.split('&').filter(Boolean).map(pair => {
      const eqIdx = pair.indexOf('=')
      const k = decodeURIComponent(pair.slice(0, eqIdx))
      const v = decodeURIComponent(pair.slice(eqIdx + 1).replace(/\+/g, ' '))
      return [k, v]
    })
  )
  const sortedKeys = Object.keys(params).sort()
  const dataToSign = url + sortedKeys.map(k => k + params[k]).join('')
  const expectedSig = createHmac('sha1', authToken).update(dataToSign, 'utf8').digest('base64')
  return expectedSig === twilioSignature
}

// Parsear form-urlencoded de Twilio
function parseFormBody(body: string): Record<string, string> {
  return Object.fromEntries(
    body.split('&').map(pair => {
      const [key, value] = pair.split('=')
      return [decodeURIComponent(key), decodeURIComponent(value.replace(/\+/g, ' '))]
    })
  )
}

// Generar respuesta TwiML
function twimlResponse(message: string): string {
  const escaped = message
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
  return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Message>${escaped}</Message>
</Response>`
}

export async function POST(request: NextRequest) {
  try {
    const bodyText = await request.text()
    const params = parseFormBody(bodyText)

    const from = params['From'] || '' // ej: "whatsapp:+5492661234567"
    const to = params['To'] || ''     // ej: "whatsapp:+14155238886" (sandbox) o número del cliente
    const message = params['Body'] || ''

    if (!message || !from) {
      return new NextResponse(twimlResponse('Error: mensaje vacío'), {
        headers: { 'Content-Type': 'text/xml' }
      })
    }

    const db = createAdminClient()

    // Buscar el cliente por su número de WhatsApp configurado
    // El número "to" es el número de WhatsApp del negocio
    const waNumber = to.replace('whatsapp:', '')

    const { data: client } = await db
      .from('clients')
      .select('chatbot_id, company_name, custom_config, status, trial_end')
      .eq('whatsapp_number', waNumber)
      .in('status', ['active', 'trial'])
      .maybeSingle()

    // Si no hay cliente por número, usar el chatbot de sandbox para testing
    let config: Record<string, string> = {}
    let systemPrompt = ''
    let companyName = ''

    if (!client) {
      // Modo sandbox: buscar por número de sandbox en env
      const sandboxNumber = process.env.TWILIO_WHATSAPP_SANDBOX_NUMBER || ''
      if (waNumber === sandboxNumber || !sandboxNumber) {
        // Usar chatbot de demo (divinia)
        const { data: demoClient } = await db
          .from('clients')
          .select('chatbot_id, company_name, custom_config, status')
          .eq('company_name', 'divinia')
          .maybeSingle()

        if (demoClient) {
          config = demoClient.custom_config as Record<string, string>
          companyName = demoClient.company_name
        }
      }

      if (!companyName) {
        return new NextResponse(
          twimlResponse('Este número no tiene un chatbot configurado. Contactá a DIVINIA para activarlo.'),
          { headers: { 'Content-Type': 'text/xml' } }
        )
      }
    } else {
      // Verificar trial
      if (client.status === 'trial' && client.trial_end) {
        if (new Date() > new Date(client.trial_end)) {
          return new NextResponse(
            twimlResponse('El período de prueba finalizó. Para continuar, contactá a tu proveedor de chatbot.'),
            { headers: { 'Content-Type': 'text/xml' } }
          )
        }
      }
      config = client.custom_config as Record<string, string>
      companyName = client.company_name
    }

    // Reemplazar placeholders
    const replacePlaceholders = (text: string) =>
      text.replace(/\{NOMBRE_NEGOCIO\}/g, companyName)
           .replace(/\{CIUDAD\}/g, config?.city || 'Argentina')
           .replace(/\{DIRECCION\}/g, config?.direccion || '')
           .replace(/\{HORARIO\}/g, config?.horario || '')
           .replace(/\{TELEFONO\}/g, config?.telefono || '')
           .replace(/\{EMAIL\}/g, config?.email || '')
           .replace(/\{WHATSAPP\}/g, waNumber)
           .replace(/\{[^}]+\}/g, '')

    const rawPrompt = (config?.system_prompt as string) ||
      `Sos el asistente de ${companyName}. Respondé con amabilidad y brevedad. Usá español argentino.`
    const prompt = replacePlaceholders(rawPrompt)

    // Recuperar historial de conversación (últimos 10 mensajes del from)
    const senderNumber = from.replace('whatsapp:', '')
    const { data: history } = await db
      .from('whatsapp_conversations')
      .select('role, content')
      .eq('phone', senderNumber)
      .eq('wa_number', waNumber)
      .order('created_at', { ascending: true })
      .limit(10)

    const conversationHistory = (history || []).map(h => ({
      role: h.role as 'user' | 'assistant',
      content: h.content
    }))

    // Generar respuesta con Claude
    const response = await generateChatbotResponse(prompt, conversationHistory, message)

    // Guardar el intercambio en historial
    await db.from('whatsapp_conversations').insert([
      { phone: senderNumber, wa_number: waNumber, role: 'user', content: message },
      { phone: senderNumber, wa_number: waNumber, role: 'assistant', content: response },
    ])

    // Registrar/actualizar lead en CRM (upsert por phone + wa_number)
    const totalMessages = conversationHistory.length + 1
    if (totalMessages === 1) {
      // Primera vez que escribe — crear lead
      await db.from('whatsapp_leads').insert({
        phone: senderNumber,
        wa_number: waNumber,
        company_name: companyName,
        summary: `Primer mensaje: "${message}"`,
        interested_in: '',
        status: 'nuevo'
      })
    } else if (totalMessages % 4 === 0) {
      // Cada 4 mensajes — actualizar resumen
      const recentMessages = [...conversationHistory.slice(-4), { role: 'user', content: message }]
        .map(m => `${m.role === 'user' ? 'Cliente' : 'Bot'}: ${m.content}`)
        .join('\n')
      await db.from('whatsapp_leads')
        .update({ summary: recentMessages, status: 'en_conversacion' })
        .eq('phone', senderNumber)
        .eq('wa_number', waNumber)
    }

    return new NextResponse(twimlResponse(response), {
      headers: { 'Content-Type': 'text/xml' }
    })

  } catch (error) {
    console.error('WhatsApp webhook error:', error)
    return new NextResponse(
      twimlResponse('Ups, tuve un problema. Intentá de nuevo en un momento.'),
      { headers: { 'Content-Type': 'text/xml' } }
    )
  }
}

// GET para verificación del webhook
export async function GET() {
  return NextResponse.json({ status: 'WhatsApp webhook activo', service: 'DIVINIA' })
}
