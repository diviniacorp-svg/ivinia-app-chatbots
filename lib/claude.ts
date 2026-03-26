import OpenAI from 'openai'

function getOpenRouter(): OpenAI {
  return new OpenAI({
    apiKey: process.env.OPENROUTER_API_KEY || '',
    baseURL: 'https://openrouter.ai/api/v1',
    defaultHeaders: {
      'HTTP-Referer': 'https://divinia.vercel.app',
      'X-Title': 'DIVINIA Chatbots',
    },
  })
}

// Gemini Flash gratis — rápido y mucho mejor que el modelo anterior
export const CHATBOT_MODEL = 'google/gemini-2.0-flash-exp:free'
// Llama 3.3 70B gratis — excelente razonamiento para outreach
export const OUTREACH_MODEL = 'meta-llama/llama-3.3-70b-instruct:free'

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
  const response = await getOpenRouter().chat.completions.create({
    model: CHATBOT_MODEL,
    max_tokens: 500,
    messages: [
      { role: 'system', content: systemPrompt + GROUNDING_INSTRUCTION },
      ...conversationHistory,
      { role: 'user', content: userMessage },
    ],
  })

  return response.choices[0]?.message?.content || 'No pude procesar tu consulta. Por favor contactanos directamente.'
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

  const response = await getOpenRouter().chat.completions.create({
    model: OUTREACH_MODEL,
    max_tokens: 800,
    messages: [{ role: 'user', content: prompt }],
  })

  const text = response.choices[0]?.message?.content || ''
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

  const response = await getOpenRouter().chat.completions.create({
    model: CHATBOT_MODEL,
    max_tokens: 300,
    messages: [{ role: 'user', content: prompt }],
  })

  return response.choices[0]?.message?.content || `Hola! Soy Joaco de DIVINIA. Vi ${params.companyName} y me surgió una idea para que recepten más consultas automáticamente. ¿Tenés 5 minutos para contarte?`
}
