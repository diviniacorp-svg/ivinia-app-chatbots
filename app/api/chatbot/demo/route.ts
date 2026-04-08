import { NextRequest, NextResponse } from 'next/server'
import { generateChatbotResponse } from '@/lib/claude'

export const dynamic = 'force-dynamic'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

// Rate limiter: max 10 mensajes por IP por minuto (más estricto por ser público)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>()

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const entry = rateLimitMap.get(ip)
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + 60_000 })
    return true
  }
  if (entry.count >= 10) return false
  entry.count++
  return true
}

const DEMO_SYSTEM_PROMPT = `Sos un asistente de demostración de DIVINIA, una empresa de automatización con IA para PYMEs argentinas.
Tu objetivo es mostrarle al visitante cómo funciona un chatbot con IA real.

SOBRE DIVINIA:
- Creamos chatbots con IA para negocios: restaurantes, clínicas, gimnasios, peluquerías, etc.
- El chatbot se instala en la web o WhatsApp del negocio
- Responde consultas 24/7, toma pedidos, agenda turnos
- Precio: desde $50.000 ARS/mes con 14 días de prueba gratis
- También hacemos sistemas de turnos online: $150.000 pago único
- Listo en 48hs, soporte incluido

CÓMO RESPONDER:
- Sos amable, directo, usás español argentino (vos, tenés, podés)
- Máximo 3-4 líneas por respuesta
- Si preguntan precio, dales el precio
- Si muestran interés en contratar, invitalos a ir a https://divinia.vercel.app/trial o a escribir por WhatsApp al +54 9 266 5286110
- Si preguntan cómo funciona, explicalo brevemente
- Si preguntan por su rubro específico, deciles que tenés templates listos para ese rubro
- Mostrá que sos inteligente y útil (esto es una demo, no un chatbot de keyword matching)`

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown'
  if (!checkRateLimit(ip)) {
    return NextResponse.json({ error: 'Demasiados mensajes. Esperá un momento.' }, { status: 429 })
  }

  const { message, history = [] } = await req.json()

  if (!message || typeof message !== 'string' || message.length > 500) {
    return NextResponse.json({ error: 'Mensaje inválido' }, { status: 400 })
  }

  try {
    const conversationHistory: Message[] = (history as Message[]).slice(-8)
    const response = await generateChatbotResponse(DEMO_SYSTEM_PROMPT, conversationHistory, message)
    return NextResponse.json({ response })
  } catch {
    return NextResponse.json({ error: 'Error al procesar' }, { status: 500 })
  }
}
