import Anthropic from '@anthropic-ai/sdk'
import type { TurneroLead, DemoRecommendation, RubroTurnero } from './types'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://divinia.vercel.app'

// Rubros con demo activa en /reservas
const DEMO_URLS: Record<RubroTurnero, string> = {
  peluqueria:    `${APP_URL}/reservas/peluqueria-demo`,
  nails:         `${APP_URL}/reservas/rufina-nails-demo`,
  estetica:      `${APP_URL}/reservas/estetica-demo`,
  spa:           `${APP_URL}/reservas/spa-demo`,
  clinica:       `${APP_URL}/reservas/clinica-demo`,
  odontologia:   `${APP_URL}/reservas/odontologia-demo`,
  psicologia:    `${APP_URL}/reservas/psicologia-demo`,
  veterinaria:   `${APP_URL}/reservas/veterinaria-demo`,
  gimnasio:      `${APP_URL}/reservas/gimnasio-demo`,
  restaurante:   `${APP_URL}/reservas/restaurante-demo`,
  hotel:         `${APP_URL}/reservas/cantera-boutique`,
  hosteria:      `${APP_URL}/reservas/hosteria-demo`,
  abogado:       `${APP_URL}/reservas/abogado-demo`,
  contabilidad:  `${APP_URL}/reservas/contabilidad-demo`,
  default:       `${APP_URL}/rubros`,
}

let _client: Anthropic | null = null
function getClient(): Anthropic {
  if (!_client) _client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })
  return _client
}

export async function getDemoRecommendation(lead: TurneroLead): Promise<DemoRecommendation> {
  const prompt = `Sos el asesor de ventas de DIVINIA Turnero. Analizá este prospecto y devolvé JSON.

Prospecto:
- Negocio: ${lead.company_name}
- Rubro: ${lead.rubro}
- Ciudad: ${lead.city || 'San Luis'}
${lead.nota ? `- Contexto: ${lead.nota}` : ''}

Devolvé JSON con exactamente estas claves:
{
  "rubro": "${lead.rubro}",
  "demo_url": "${DEMO_URLS[lead.rubro] || DEMO_URLS.default}",
  "pitch_opening": "frase de apertura de 1 oración para mostrar la demo (usá el nombre del negocio)",
  "pain_points": ["dolor 1 específico del rubro", "dolor 2", "dolor 3"],
  "killer_question": "la pregunta que hace que digan 'sí eso me pasa exactamente'",
  "upsell_hint": "qué producto de DIVINIA recomendarías en el mes 2 para este rubro y por qué"
}

Solo el JSON. Sin markdown.`

  const msg = await getClient().messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 600,
    messages: [{ role: 'user', content: prompt }],
  })

  const text = (msg.content[0] as { type: string; text: string }).text.trim()
  const json = JSON.parse(text.replace(/```json\n?|\n?```/g, ''))
  return { ...json, demo_url: DEMO_URLS[lead.rubro] || DEMO_URLS.default }
}
