import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { generateChatbotResponse } from '@/lib/claude'

export const dynamic = 'force-dynamic'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

// Rate limiter simple en memoria: max 20 mensajes por IP por minuto
const rateLimitMap = new Map<string, { count: number; resetAt: number }>()

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const entry = rateLimitMap.get(ip)
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + 60_000 })
    return true
  }
  if (entry.count >= 20) return false
  entry.count++
  return true
}

const MAX_SESSION_MESSAGES = 20

async function getSessionHistory(chatbotId: string, sessionId: string): Promise<Message[]> {
  if (!sessionId) return []
  const { data } = await supabaseAdmin
    .from('chat_sessions')
    .select('messages')
    .eq('chatbot_id', chatbotId)
    .eq('session_id', sessionId)
    .single()
  return (data?.messages as Message[]) || []
}

async function saveSessionHistory(chatbotId: string, sessionId: string, messages: Message[]) {
  const trimmed = messages.slice(-MAX_SESSION_MESSAGES)
  await supabaseAdmin
    .from('chat_sessions')
    .upsert(
      { chatbot_id: chatbotId, session_id: sessionId, messages: trimmed, updated_at: new Date().toISOString() },
      { onConflict: 'chatbot_id,session_id' }
    )
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown'
    if (!checkRateLimit(ip)) {
      return NextResponse.json({ error: 'Demasiadas solicitudes. Esperá un momento.' }, { status: 429 })
    }

    const { message, history = [], session_id } = await request.json()

    if (!message || typeof message !== 'string' || message.length > 2000) {
      return NextResponse.json({ error: 'message inválido' }, { status: 400 })
    }

    const chatbotId = params.id

    // Buscar el cliente y su config
    const { data: client, error } = await supabaseAdmin
      .from('clients')
      .select('custom_config, status, company_name, trial_end')
      .eq('chatbot_id', chatbotId)
      .single()

    if (error || !client) {
      return NextResponse.json({ error: 'Chatbot no encontrado' }, { status: 404 })
    }

    // Verificar si el chatbot está activo
    if (client.status === 'expired' || client.status === 'cancelled') {
      return NextResponse.json({
        response: 'Lo sentimos, este servicio no está disponible en este momento. Por favor contactá al negocio directamente.'
      })
    }

    // Verificar trial
    if (client.status === 'trial' && client.trial_end) {
      const trialEnd = new Date(client.trial_end)
      if (new Date() > trialEnd) {
        await supabaseAdmin
          .from('clients')
          .update({ status: 'expired' })
          .eq('chatbot_id', chatbotId)

        return NextResponse.json({
          response: 'El período de prueba ha finalizado. Para continuar usando el chatbot, por favor contactá al soporte.'
        })
      }
    }

    const config = client.custom_config as Record<string, unknown>
    const replacePlaceholders = (text: string) =>
      text.replace(/\{NOMBRE_NEGOCIO\}/g, client.company_name || '')
           .replace(/\{CIUDAD\}/g, (config?.city as string) || 'Argentina')
           .replace(/\{DIRECCION\}/g, (config?.direccion as string) || '')
           .replace(/\{HORARIO\}/g, (config?.horario as string) || '')
           .replace(/\{TELEFONO\}/g, (config?.telefono as string) || (config?.phone as string) || '')
           .replace(/\{EMAIL\}/g, (config?.email as string) || '')
           .replace(/\{WHATSAPP\}/g, (config?.whatsapp as string) || (config?.whatsapp_number as string) || '')
    const rawPrompt = (config?.system_prompt as string) || `Sos el asistente de ${client.company_name}. Respondé consultas con amabilidad y brevedad (máximo 3-4 líneas). Usá español argentino.`
    const systemPrompt = replacePlaceholders(rawPrompt)

    // Usar historia del servidor si hay session_id, sino fallback al cliente
    let conversationHistory: Message[]
    if (session_id) {
      conversationHistory = await getSessionHistory(chatbotId, session_id)
    } else {
      conversationHistory = (history as Message[]).slice(-10)
    }

    const response = await generateChatbotResponse(
      systemPrompt,
      conversationHistory,
      message
    )

    // Persistir historia en servidor si hay session_id
    if (session_id) {
      const updatedHistory: Message[] = [
        ...conversationHistory,
        { role: 'user', content: message },
        { role: 'assistant', content: response },
      ]
      saveSessionHistory(chatbotId, session_id, updatedHistory).catch(() => {})
    }

    return NextResponse.json({ response })
  } catch (error) {
    console.error('Chatbot error:', error)
    return NextResponse.json(
      { error: 'Error al procesar mensaje' },
      { status: 500 }
    )
  }
}

// GET devuelve el welcome message (para inicializar el widget)
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { data: client } = await supabaseAdmin
      .from('clients')
      .select('custom_config, company_name, status')
      .eq('chatbot_id', params.id)
      .single()

    if (!client) {
      return NextResponse.json({ error: 'Chatbot no encontrado' }, { status: 404 })
    }

    const config = client.custom_config as Record<string, unknown>
    const replacePlaceholders = (text: string) =>
      text.replace(/\{NOMBRE_NEGOCIO\}/g, client.company_name || '')
           .replace(/\{CIUDAD\}/g, (config?.city as string) || 'Argentina')
           .replace(/\{DIRECCION\}/g, (config?.direccion as string) || '')
           .replace(/\{HORARIO\}/g, (config?.horario as string) || '')
           .replace(/\{TELEFONO\}/g, (config?.telefono as string) || (config?.phone as string) || '')
           .replace(/\{EMAIL\}/g, (config?.email as string) || '')
           .replace(/\{WHATSAPP\}/g, (config?.whatsapp as string) || (config?.whatsapp_number as string) || '')
    const rawWelcome = (config?.welcome_message as string) || `¡Hola! Soy el asistente de ${client.company_name}. ¿En qué puedo ayudarte?`
    return NextResponse.json({
      welcome: replacePlaceholders(rawWelcome),
      color: config?.color || '#6366f1',
      company_name: client.company_name,
      active: client.status === 'active' || client.status === 'trial',
    })
  } catch {
    return NextResponse.json({ error: 'Error' }, { status: 500 })
  }
}
