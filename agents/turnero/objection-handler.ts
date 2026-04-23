import Anthropic from '@anthropic-ai/sdk'
import type { TurneroLead, ObjectionResponse } from './types'

let _client: Anthropic | null = null
function getClient(): Anthropic {
  if (!_client) _client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })
  return _client
}

const COMMON_OBJECTIONS = [
  'es muy caro',
  'mis clientes no usan esto',
  'no sé usarlo',
  'tengo que pensarlo',
  'ya tengo algo',
  'no tengo tiempo',
  'no me interesa',
  'después te llamo',
]

export async function handleObjection(
  objection: string,
  lead: TurneroLead
): Promise<ObjectionResponse> {
  const prompt = `Sos el mejor vendedor de DIVINIA. Un prospecto te dijo esto durante la demo del Turnero.

Prospecto: ${lead.company_name} (${lead.rubro}, ${lead.city || 'San Luis'})
Objeción: "${objection}"

Devolvé JSON:
{
  "objection": "${objection}",
  "response": "respuesta personalizada en 2-3 oraciones (argentina, directa, sin presión)",
  "follow_up_question": "pregunta para mantener la conversación viva y entender mejor la objeción",
  "close_attempt": "frase de cierre suave para intentar avanzar después de manejar la objeción"
}

Principios:
- Nunca discutas. Validá primero ("Entiendo perfectamente...")
- Usá ejemplos concretos del rubro si podés
- El cierre debe ser sin presión ("¿querés que te muestre...?" no "¿entonces lo comprás?")
- Español argentino. Solo el JSON.`

  const msg = await getClient().messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 500,
    messages: [{ role: 'user', content: prompt }],
  })

  const text = (msg.content[0] as { type: string; text: string }).text.trim()
  return JSON.parse(text.replace(/```json\n?|\n?```/g, ''))
}

export async function handleMultipleObjections(
  objections: string[],
  lead: TurneroLead
): Promise<ObjectionResponse[]> {
  return Promise.all(objections.map(o => handleObjection(o, lead)))
}

export { COMMON_OBJECTIONS }
