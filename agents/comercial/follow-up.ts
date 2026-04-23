import Anthropic from '@anthropic-ai/sdk'
import type { Lead, FollowUpMessage } from './types'

let _client: Anthropic | null = null
function getClient(): Anthropic {
  if (!_client) _client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })
  return _client
}

export async function generateFollowUp(
  lead: Lead,
  diasSinRespuesta: number,
  contexto?: string   // ej: "vio la propuesta pero no respondió"
): Promise<FollowUpMessage> {
  const tono = diasSinRespuesta <= 2 ? 'amigable' : diasSinRespuesta <= 5 ? 'valor' : 'urgente'

  const prompt = `Generá un mensaje de seguimiento de WhatsApp para un prospecto que no respondió.

Prospecto: ${lead.company_name} (${lead.rubro}, ${lead.city || 'San Luis'})
Días sin respuesta: ${diasSinRespuesta}
Etapa actual: ${lead.stage}
${contexto ? `Contexto: ${contexto}` : ''}
Tono requerido: ${tono}

Reglas:
- Máximo 3 líneas
- Español argentino (vos/sos/tenés)
- No presionar. Aportar valor o generar curiosidad.
- Si es 'urgente': mencionar algo que puede estar perdiendo (turnos, clientes)
- Si es 'valor': compartir un dato o beneficio concreto
- Si es 'amigable': solo un "¿cómo seguiste?" con el contexto

Devolvé JSON:
{
  "canal": "whatsapp",
  "mensaje": "el mensaje listo para enviar",
  "tono": "${tono}",
  "dias_sin_respuesta": ${diasSinRespuesta}
}

Solo el JSON.`

  const msg = await getClient().messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 400,
    messages: [{ role: 'user', content: prompt }],
  })

  const text = (msg.content[0] as { type: string; text: string }).text.trim()
  return JSON.parse(text.replace(/```json\n?|\n?```/g, ''))
}

// Genera la secuencia completa de follow-ups para un lead
export async function generateFollowUpSequence(lead: Lead): Promise<FollowUpMessage[]> {
  const sequence = [
    { dias: 2, contexto: 'primer seguimiento post-demo' },
    { dias: 5, contexto: 'segundo seguimiento, aportar valor' },
    { dias: 10, contexto: 'último intento antes de marcar perdido' },
  ]
  return Promise.all(
    sequence.map(s => generateFollowUp(lead, s.dias, s.contexto))
  )
}
