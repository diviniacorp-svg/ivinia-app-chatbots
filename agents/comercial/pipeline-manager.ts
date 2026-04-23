import Anthropic from '@anthropic-ai/sdk'
import type { Lead, LeadStage, PipelineHealth } from './types'
import { TURNERO_PLANS } from '@/lib/turnero-plans'

let _client: Anthropic | null = null
function getClient(): Anthropic {
  if (!_client) _client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })
  return _client
}

const PRECIO_DEFAULT = TURNERO_PLANS[0].precio  // $45.000

export function calcPipelineHealth(leads: Lead[]): PipelineHealth {
  const porEtapa = leads.reduce((acc, l) => {
    acc[l.stage] = (acc[l.stage] || 0) + 1
    return acc
  }, {} as Record<LeadStage, number>)

  const activos = leads.filter(l => l.stage !== 'cerrado' && l.stage !== 'perdido')
  const cerrados = leads.filter(l => l.stage === 'cerrado').length
  const calientes = leads.filter(l => l.score >= 70).length
  const mrrPotencial = activos.reduce((sum, l) => sum + PRECIO_DEFAULT, 0)

  const alertas: string[] = []
  if (calientes === 0) alertas.push('No hay leads calientes (score ≥ 70) — necesitás generar más demos')
  if (porEtapa['propuesta_enviada'] >= 3) alertas.push('Hay propuestas sin respuesta — hacer follow-up hoy')
  if (porEtapa['negociacion'] >= 1) alertas.push('Leads en negociación — priorizar cierre esta semana')

  return {
    total_leads: leads.length,
    por_etapa: porEtapa,
    score_promedio: leads.length ? Math.round(leads.reduce((s, l) => s + l.score, 0) / leads.length) : 0,
    leads_calientes: calientes,
    conversion_rate: leads.length ? Math.round((cerrados / leads.length) * 100) : 0,
    mrr_potencial: mrrPotencial,
    alertas,
    recomendaciones: [],
  }
}

export async function analyzePipeline(leads: Lead[]): Promise<PipelineHealth> {
  const health = calcPipelineHealth(leads)

  if (leads.length === 0) {
    health.recomendaciones = [
      'Salir a prospectar en persona hoy — visitar negocios de nails, estética o psicología',
      'Publicar en @autom_atia para atraer leads orgánicos',
      'Revisar Market San Luis para leads que se registraron',
    ]
    return health
  }

  const prompt = `Analizá este pipeline de ventas de DIVINIA y dá 3 recomendaciones concretas.

Estado del pipeline:
${JSON.stringify(health, null, 2)}

Leads con más urgencia:
${leads
  .filter(l => l.score >= 60)
  .slice(0, 5)
  .map(l => `- ${l.company_name} (${l.rubro}) score:${l.score} etapa:${l.stage}`)
  .join('\n')}

Devolvé JSON:
{
  "recomendaciones": [
    "acción concreta 1 para esta semana",
    "acción concreta 2",
    "acción concreta 3"
  ]
}

Recomendaciones deben ser específicas (mencionar nombre de lead si aplica) y accionables. Solo el JSON.`

  const msg = await getClient().messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 400,
    messages: [{ role: 'user', content: prompt }],
  })

  const text = (msg.content[0] as { type: string; text: string }).text.trim()
  const parsed = JSON.parse(text.replace(/```json\n?|\n?```/g, ''))
  health.recomendaciones = parsed.recomendaciones
  return health
}

export function getNextAction(lead: Lead): string {
  const actions: Record<LeadStage, string> = {
    nuevo: `Calificar y mandar mensaje WA de apertura a ${lead.company_name}`,
    contactado: `Agendar demo del Turnero para ${lead.company_name}`,
    demo_enviada: `Seguimiento: "¿Qué te pareció la demo?" — 2 días post-envío`,
    propuesta_enviada: `Follow-up de propuesta a ${lead.company_name} — preguntar si tiene dudas`,
    negociacion: `Cerrar ${lead.company_name} — mandar link MP adelanto $${PRECIO_DEFAULT / 2 / 1000}k`,
    cerrado: `Activar Turnero para ${lead.company_name} — mandar accesos y QR`,
    perdido: `Reactivar en 30 días con nuevo ángulo`,
  }
  return actions[lead.stage] ?? 'Revisar manualmente'
}
