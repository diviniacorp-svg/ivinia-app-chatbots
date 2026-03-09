import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase'
import { generateChatbotResponse } from '@/lib/claude'

export const dynamic = 'force-dynamic'

// Verificación de firma Twilio (seguridad)
function validateTwilioSignature(request: NextRequest, body: string): boolean {
  // En dev o si no hay auth token configurado, permitir todo
  if (!process.env.TWILIO_AUTH_TOKEN) return true
  // TODO: implementar validación de firma X-Twilio-Signature
  return true
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
      .eq('status', 'active')
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
