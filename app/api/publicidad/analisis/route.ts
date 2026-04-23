import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

export const dynamic = 'force-dynamic'

let _client: Anthropic | null = null
function getClient() {
  if (!_client) _client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })
  return _client
}

export async function POST(request: NextRequest) {
  try {
    const { campaign } = await request.json()
    if (!campaign) return NextResponse.json({ error: 'campaign requerida' }, { status: 400 })

    const system = `Sos el Analista de Performance de DIVINIA. Analizás campañas de publicidad digital y das recomendaciones accionables.
Sos directo: decís qué está bien, qué está mal y exactamente qué hacer.
Respondés SOLO con JSON válido, en español argentino.`

    const ctr = campaign.impressions > 0
      ? ((campaign.clicks / campaign.impressions) * 100).toFixed(2)
      : '0'
    const convRate = campaign.clicks > 0
      ? ((campaign.conversions / campaign.clicks) * 100).toFixed(2)
      : '0'

    const user = `Analizá esta campaña de publicidad digital:

Cliente: ${campaign.client_name} (${campaign.rubro || 'sin rubro'})
Plataforma: ${campaign.platform}
Objetivo: ${campaign.objective}
Estado: ${campaign.status}

MÉTRICAS:
- Presupuesto mensual: $${Number(campaign.budget_monthly_ars).toLocaleString('es-AR')} ARS
- Gastado: $${Number(campaign.budget_spent_ars).toLocaleString('es-AR')} ARS
- Impresiones: ${campaign.impressions.toLocaleString()}
- Clicks: ${campaign.clicks.toLocaleString()}
- CTR: ${ctr}%
- Leads: ${campaign.leads}
- Conversiones: ${campaign.conversions}
- Tasa de conversión: ${convRate}%
- CPC: $${Number(campaign.cpc_ars).toLocaleString('es-AR')} ARS
- CPL: $${Number(campaign.cpl_ars).toLocaleString('es-AR')} ARS
- ROAS: ${campaign.roas}x

Devolvé JSON:
{
  "score": número 0-100 (qué tan bien está la campaña),
  "estado_general": "excelente | bueno | regular | necesita_atencion | critico",
  "resumen": "1 oración del estado general",
  "fortalezas": ["qué está funcionando bien"],
  "problemas": ["qué está mal o podría mejorar"],
  "acciones_inmediatas": [
    { "prioridad": "alta | media", "accion": "qué hacer", "impacto_esperado": "qué mejora" }
  ],
  "proyeccion_30_dias": "si seguimos así o hacemos los cambios, qué esperamos en 30 días",
  "benchmark_rubro": "cómo comparan estas métricas vs lo normal para ${campaign.rubro || 'este rubro'} en Argentina"
}`

    const msg = await getClient().messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1000,
      system,
      messages: [{ role: 'user', content: user }],
    })

    const raw = (msg.content[0] as { type: string; text: string }).text
    const json = JSON.parse(raw.match(/\{[\s\S]*\}/)?.[0] ?? raw)
    return NextResponse.json({ ok: true, analisis: json })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error al analizar' },
      { status: 500 }
    )
  }
}
