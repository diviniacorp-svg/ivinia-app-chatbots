import Anthropic from '@anthropic-ai/sdk'

function getAnthropic(): Anthropic {
  return new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY || '' })
}

// Haiku para chatbots (rápido y barato ~$0.001/1k tokens)
export const CHATBOT_MODEL = 'claude-haiku-4-5-20251001'
// Sonnet para outreach (mejor redacción)
export const OUTREACH_MODEL = 'claude-sonnet-4-6'

const GROUNDING_INSTRUCTION = `

REGLA CRÍTICA: Solo respondé con información que esté explícitamente en este prompt.
- Si no tenés el dato (precio, disponibilidad, horario, producto, etc.), decí "No tengo esa información, te recomiendo contactarnos directamente" y dá el teléfono o WhatsApp del negocio.
- NUNCA inventes precios, fechas, disponibilidad, nombres de productos ni ningún dato.
- NUNCA uses información de internet ni de tu entrenamiento sobre el negocio.
- Si la pregunta está fuera del rubro del negocio, redirigí amablemente al tema principal.`

export async function generateChatbotResponse(
  systemPrompt: string,
  conversationHistory: { role: 'user' | 'assistant'; content: string }[],
  userMessage: string
): Promise<string> {
  const response = await getAnthropic().messages.create({
    model: CHATBOT_MODEL,
    max_tokens: 500,
    system: systemPrompt + GROUNDING_INSTRUCTION,
    messages: [
      ...conversationHistory,
      { role: 'user', content: userMessage },
    ],
  })

  const block = response.content[0]
  return block?.type === 'text' ? block.text : 'No pude procesar tu consulta. Por favor contactanos directamente.'
}

export async function generateOutreachEmail(params: {
  companyName: string
  rubro: string
  city: string
  website?: string
  contactName?: string
}): Promise<{ subject: string; body: string }> {
  const prompt = `Generá un email de ventas en español argentino (usando "vos") para una PYME argentina.

Datos del prospecto:
- Empresa: ${params.companyName}
- Rubro: ${params.rubro}
- Ciudad: ${params.city}
${params.website ? `- Web: ${params.website}` : ''}
${params.contactName ? `- Contacto: ${params.contactName}` : ''}

El email es de DIVINIA, empresa de IA de San Luis Argentina.
Ofrecemos un chatbot con IA para su web que atiende clientes 24/7, responde consultas, agenda turnos/pedidos.
Incluye 14 días de prueba gratis.
Precio: desde $50.000 ARS/mes.

Reglas del email:
- Asunto: corto, que genere curiosidad, máximo 60 caracteres
- Cuerpo: 3-4 párrafos cortos, conversacional, no corporativo
- Mencioná un dolor específico del rubro (ej: restaurante = "perdés pedidos fuera de horario")
- CTA claro al final: "¿Probamos 14 días gratis?"
- Firma: "Joaco de DIVINIA | WhatsApp: +54 9 2665 28-6110 | divinia.vercel.app"

Respondé SOLO con JSON en este formato exacto:
{"subject": "...", "body": "..."}`

  const response = await getAnthropic().messages.create({
    model: OUTREACH_MODEL,
    max_tokens: 800,
    messages: [{ role: 'user', content: prompt }],
  })

  const block = response.content[0]
  const text = block?.type === 'text' ? block.text : ''
  const jsonMatch = text.match(/\{[\s\S]*\}/)
  const json = JSON.parse(jsonMatch?.[0] || text)
  return { subject: json.subject, body: json.body }
}

export async function generateWhatsAppMessage(params: {
  companyName: string
  rubro: string
  city: string
}): Promise<string> {
  const prompt = `Generá un mensaje de WhatsApp de ventas en español argentino (usando "vos") para una PYME.

Empresa: ${params.companyName} (${params.rubro}, ${params.city})
Somos DIVINIA, empresa de IA de San Luis, Argentina.
Ofrecemos chatbot con IA para atención 24/7, con 14 días de prueba gratis.

Reglas:
- Máximo 150 palabras
- Casual y directo, como si fuera un mensaje personal
- Mencioná un beneficio específico del rubro
- Terminá con pregunta abierta
- SIN emojis excesivos (máximo 2)

Devolvé SOLO el mensaje, sin comillas ni explicaciones.`

  const response = await getAnthropic().messages.create({
    model: CHATBOT_MODEL,
    max_tokens: 300,
    messages: [{ role: 'user', content: prompt }],
  })

  const block = response.content[0]
  return block?.type === 'text'
    ? block.text
    : `Hola! Soy Joaco de DIVINIA. Vi ${params.companyName} y me surgió una idea para que recepten más consultas automáticamente. ¿Tenés 5 minutos para contarte?`
}
