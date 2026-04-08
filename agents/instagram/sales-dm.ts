// ============================================================
// DIVINIA — Sales DM Agent
// Califica leads, genera propuestas y cierra ventas via DM
// ============================================================

import Anthropic from '@anthropic-ai/sdk'
import type { InstagramLead, LeadStage, Rubro } from './types'
import { PRICING } from './types'

const SYSTEM_PROMPT = `Sos el Agente de Ventas de DIVINIA por Instagram DM.
DIVINIA es una empresa de San Luis, Argentina que vende sistemas de turnos con IA a PYMEs.

TU OBJETIVO: Convertir consultas de Instagram en clientes pagos.

PROCESO DE VENTA:
1. initial_contact: Respuesta amigable, descubrí el negocio del prospect
2. qualification: Preguntás sobre su situación actual con los turnos (cuántos/semana, cómo los gestionan ahora)
3. demo_sent: Enviás link a demo personalizada por su rubro
4. proposal_sent: Propuesta con precio específico en ARS
5. negotiation: Manejo de objeciones, opciones de pago
6. closed: Enviás link MercadoPago y confirmás inicio

PLANES:
- Básico ($150.000 ARS): agenda online 24hs + confirmaciones automáticas WhatsApp
- Pro ($250.000 ARS): básico + recordatorios + múltiples profesionales + métricas
- Premium ($350.000 ARS): pro + chatbot IA integrado

TONO:
- Cercano y profesional, como un asesor de confianza
- Español argentino (vos/sos/tenés)
- Respuestas cortas en DM (máx 150 palabras)
- Emoji moderado
- Nunca presionar agresivamente
- Siempre dar valor antes de pedir la venta

OBJECIONES COMUNES Y RESPUESTAS:
- "Muy caro": "Entiendo. ¿Cuánto vale para vos recuperar 2 horas al día? Con el plan básico son menos de $500/día."
- "No sé usarlo": "No te preocupes, nosotros lo configuramos todo. Vos solo empezás a recibir turnos."
- "Tengo que pensarlo": "Claro, no hay apuro. ¿Te puedo mandar un ejemplo de cómo quedaría para tu negocio?"
- "Ya tengo algo": "¿Qué usás ahora? A veces encontramos formas de mejorar lo que ya tenés."

CALIFICACIÓN (score 0-100):
- 80-100: Lead caliente (preguntó precio, dijo que necesita, tiene negocio establecido)
- 50-79: Lead tibio (interesado pero sin urgencia)
- 20-49: Lead frío (solo curiosidad, no tiene negocio claro)
- 0-19: No calificado`

function getClient(): Anthropic {
  return new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
}

export async function qualifyLead(
  message: string,
  username: string,
  conversationHistory?: string
): Promise<{ score: number; rubro: Rubro | 'general'; detectedNeeds: string[]; suggestedStage: LeadStage }> {
  const client = getClient()

  const prompt = `Analizá este mensaje de Instagram DM y calificá el lead.

Usuario: @${username}
Mensaje: "${message}"
${conversationHistory ? `Historial previo:\n${conversationHistory}` : ''}

Devolvé un JSON:
{
  "score": 0-100,
  "rubro": "peluqueria|estetica|clinica|consultorio|veterinaria|taller|odontologia|gimnasio|farmacia|general",
  "detectedNeeds": ["necesidad 1", "necesidad 2"],
  "suggestedStage": "initial_contact|qualification|demo_sent|proposal_sent|negotiation",
  "reasoning": "por qué este score"
}

Solo el JSON.`

  const response = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 400,
    messages: [{ role: 'user', content: prompt }],
    system: SYSTEM_PROMPT,
  })

  const text = response.content[0].type === 'text' ? response.content[0].text : ''
  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (!jsonMatch) return { score: 30, rubro: 'general', detectedNeeds: [], suggestedStage: 'initial_contact' }

  const data = JSON.parse(jsonMatch[0])
  return {
    score: data.score,
    rubro: data.rubro,
    detectedNeeds: data.detectedNeeds,
    suggestedStage: data.suggestedStage,
  }
}

export async function generateDMResponse(
  lead: InstagramLead,
  incomingMessage: string
): Promise<string> {
  const client = getClient()

  const plan = lead.proposedPlan ? PRICING[lead.proposedPlan] : null

  const prompt = `Generá una respuesta de DM para este lead.

Lead:
- Usuario: @${lead.username}
- Rubro: ${lead.rubro || 'desconocido'}
- Score: ${lead.score}/100
- Etapa actual: ${lead.stage}
- Necesidades detectadas: ${lead.detectedNeeds.join(', ') || 'ninguna aún'}
${plan ? `- Plan propuesto: ${plan.name} ($${plan.price.toLocaleString('es-AR')} ARS)` : ''}

Mensaje que recibí: "${incomingMessage}"

Generá la respuesta ideal para avanzar en el proceso de venta.
Máximo 150 palabras. Solo el texto del mensaje, sin comillas ni explicaciones.`

  const response = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 300,
    messages: [{ role: 'user', content: prompt }],
    system: SYSTEM_PROMPT,
  })

  return response.content[0].type === 'text' ? response.content[0].text.trim() : ''
}

export async function generateProposal(lead: InstagramLead): Promise<string> {
  const client = getClient()

  const recommendedPlan = lead.score >= 70 ? 'pro' : 'basico'
  const plan = PRICING[recommendedPlan]

  const prompt = `Generá una propuesta comercial completa para enviar por DM de Instagram.

Lead:
- Rubro: ${lead.rubro}
- Necesidades: ${lead.detectedNeeds.join(', ')}
- Score: ${lead.score}/100

Plan recomendado: ${plan.name}
Precio: $${plan.price.toLocaleString('es-AR')} ARS
Incluye: ${plan.description}
Entrega en: ${plan.deliveryDays} días

La propuesta debe:
1. Resumir lo que entendiste de su negocio (1-2 líneas)
2. Explicar qué incluye la solución para su rubro específico
3. Mostrar el precio claramente (incluyendo que existe plan básico si quieren empezar más chico)
4. Mencionar el trial de 14 días gratis
5. CTA claro: "¿Arrancamos con el trial gratuito?"

Máximo 200 palabras. Tono cercano, español argentino. Solo el texto.`

  const response = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 500,
    messages: [{ role: 'user', content: prompt }],
    system: SYSTEM_PROMPT,
  })

  return response.content[0].type === 'text' ? response.content[0].text.trim() : ''
}

export async function handleObjection(objection: string, lead: InstagramLead): Promise<string> {
  const client = getClient()

  const prompt = `Un lead tiene esta objeción para comprar el sistema de turnos de DIVINIA.

Objeción: "${objection}"
Rubro del lead: ${lead.rubro}
Score del lead: ${lead.score}/100

Generá una respuesta que:
1. Valide la preocupación del cliente (no la ignore)
2. Reencuadre la objeción positivamente
3. Dé un dato concreto o propuesta para superarla
4. Termine con una pregunta que mueva hacia el cierre

Máximo 100 palabras. Español argentino. Solo el texto de la respuesta.`

  const response = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 250,
    messages: [{ role: 'user', content: prompt }],
    system: SYSTEM_PROMPT,
  })

  return response.content[0].type === 'text' ? response.content[0].text.trim() : ''
}
