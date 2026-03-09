import OpenAI from 'openai'

const openrouter = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY || '',
  baseURL: 'https://openrouter.ai/api/v1',
  defaultHeaders: {
    'HTTP-Referer': 'https://divinia.vercel.app',
    'X-Title': 'DIVINIA Chatbots',
  },
})

// Modelo gratuito para chatbots
export const CHATBOT_MODEL = 'meta-llama/llama-3.1-8b-instruct:free'
// Modelo para outreach (también gratuito)
export const OUTREACH_MODEL = 'meta-llama/llama-3.1-8b-instruct:free'

export async function generateChatbotResponse(
  systemPrompt: string,
  conversationHistory: { role: 'user' | 'assistant'; content: string }[],
  userMessage: string
): Promise<string> {
  const response = await openrouter.chat.completions.create({
    model: CHATBOT_MODEL,
    max_tokens: 500,
    messages: [
      { role: 'system', content: systemPrompt },
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
- Firma: "Joaco de DIVINIA | WhatsApp: +54 9 [completar] | divinia.ar"

Respondé SOLO con JSON en este formato exacto:
{"subject": "...", "body": "..."}`

  const response = await openrouter.chat.completions.create({
    model: OUTREACH_MODEL,
    max_tokens: 800,
    messages: [{ role: 'user', content: prompt }],
  })

  const text = response.choices[0]?.message?.content || ''
  const json = JSON.parse(text)
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

  const response = await openrouter.chat.completions.create({
    model: CHATBOT_MODEL,
    max_tokens: 300,
    messages: [{ role: 'user', content: prompt }],
  })

  return response.choices[0]?.message?.content || `Hola! Soy Joaco de DIVINIA. Vi ${params.companyName} y me surgió una idea para que recepten más consultas automáticamente. ¿Tenés 5 minutos para contarte?`
}
