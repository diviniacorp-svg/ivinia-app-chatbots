import Anthropic from '@anthropic-ai/sdk'
import { TURNERO_PLANS, formatPrecio } from '@/lib/turnero-plans'
import type { TurneroLead, ProposalContent, TurneroPlanId } from './types'

let _client: Anthropic | null = null
function getClient(): Anthropic {
  if (!_client) _client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })
  return _client
}

export async function writeProposal(
  lead: TurneroLead,
  planId: TurneroPlanId = 'unico'
): Promise<ProposalContent> {
  const plan = TURNERO_PLANS.find(p => p.id === planId) ?? TURNERO_PLANS[2]
  const precio = planId === 'anual' ? plan.precio * 12 : plan.precio
  const adelanto = Math.round(precio * 0.5)

  const prompt = `Sos el copywriter de ventas de DIVINIA Turnero. Generá el contenido de una propuesta comercial 1-pager.

Cliente:
- Negocio: ${lead.company_name}
- Rubro: ${lead.rubro}
- Ciudad: ${lead.city || 'San Luis'}
- Plan recomendado: ${plan.nombre} (${formatPrecio(precio)})
${lead.nota ? `- Contexto: ${lead.nota}` : ''}

Devolvé JSON:
{
  "headline": "título impactante de máximo 8 palabras (puede tener el nombre del negocio)",
  "subtitulo": "subtítulo de 1 línea que explica qué van a recibir",
  "problema": "descripción del dolor en 2 oraciones, como si el cliente lo dijera (primera persona)",
  "solucion": "qué hace el Turnero por este negocio específico en 2-3 oraciones",
  "que_incluye": ["item 1", "item 2", "item 3", "item 4", "item 5"],
  "resultado_esperado": "en 30 días vas a... (frase concreta con resultado medible)",
  "plan_recomendado": "${planId}",
  "precio_display": "${formatPrecio(precio)}",
  "precio_numerico": ${precio},
  "adelanto": ${adelanto},
  "cta_texto": "texto del botón de pago (ej: 'Empezar ahora — pagar adelanto')",
  "garantia": "frase corta que reduce el riesgo percibido del cliente",
  "mensaje_wa": "mensaje de WhatsApp listo para enviar junto al link de propuesta (informal, 2-3 líneas)"
}

Tono: argentino, directo, sin hype corporativo. Vos/sos/tenés. Solo el JSON.`

  const msg = await getClient().messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1200,
    messages: [{ role: 'user', content: prompt }],
  })

  const text = (msg.content[0] as { type: string; text: string }).text.trim()
  return JSON.parse(text.replace(/```json\n?|\n?```/g, ''))
}
