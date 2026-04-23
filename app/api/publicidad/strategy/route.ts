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
    const { client_name, rubro, objective, budget_monthly_ars, city, platform, notas } = await request.json()

    if (!client_name || !rubro || !objective) {
      return NextResponse.json({ error: 'client_name, rubro y objective son requeridos' }, { status: 400 })
    }

    const platformLabel: Record<string, string> = {
      meta: 'Meta Ads (Facebook + Instagram)',
      google: 'Google Ads (Search + Display)',
      instagram: 'Instagram Ads',
      tiktok: 'TikTok Ads',
    }

    const objectiveLabel: Record<string, string> = {
      leads: 'generación de leads',
      conversions: 'conversiones / ventas',
      awareness: 'reconocimiento de marca',
      traffic: 'tráfico al sitio web',
      engagement: 'interacción con la marca',
    }

    const system = `Sos el Estratega de Publicidad Digital de DIVINIA, agencia de marketing IA para PYMEs argentinas.
Tu trabajo es diseñar estrategias de ads que generen resultados reales con presupuestos ajustados.
Conocés bien el mercado argentino, los rubros locales y cómo invertir en publicidad siendo inteligente.
Siempre respondés en español argentino. Respondés SOLO con JSON válido, sin markdown.`

    const user = `Diseñá una estrategia de publicidad digital completa para:

Cliente: ${client_name}
Rubro: ${rubro}
Ciudad: ${city || 'San Luis, Argentina'}
Plataforma: ${platformLabel[platform] || platform}
Objetivo: ${objectiveLabel[objective] || objective}
Presupuesto mensual: ${budget_monthly_ars ? `$${Number(budget_monthly_ars).toLocaleString('es-AR')} ARS` : 'a definir'}
${notas ? `Notas adicionales: ${notas}` : ''}

Devolvé JSON con esta estructura:
{
  "resumen": "descripción de la estrategia en 2 oraciones",
  "audiencia_primaria": {
    "edad": "rango de edad",
    "genero": "hombres / mujeres / todos",
    "intereses": ["interés 1", "interés 2", "interés 3"],
    "comportamientos": ["comportamiento 1", "comportamiento 2"],
    "ubicacion": "descripción geográfica del targeting"
  },
  "audiencia_secundaria": {
    "descripcion": "audiencia de remarketing o lookalike",
    "tipo": "remarketing | lookalike | custom"
  },
  "estructura_campana": [
    {
      "nombre": "nombre del conjunto de anuncios",
      "objetivo_especifico": "qué logra esta parte",
      "presupuesto_porcentaje": 40,
      "formato": "imagen | video | carrusel | story | reels",
      "duracion_dias": 30
    }
  ],
  "kpis_objetivo": {
    "cpc_esperado_ars": número estimado,
    "cpl_esperado_ars": número estimado,
    "ctr_esperado_porcentaje": número,
    "leads_estimados_mes": número,
    "roas_esperado": número
  },
  "calendario": [
    { "semana": 1, "accion": "qué hacer la primera semana" },
    { "semana": 2, "accion": "qué hacer la segunda semana" },
    { "semana": 3, "accion": "ajustes basados en datos" },
    { "semana": 4, "accion": "optimización y escala" }
  ],
  "recomendaciones_creativas": ["recomendación visual 1", "recomendación visual 2", "recomendación visual 3"],
  "errores_comunes": ["error a evitar 1", "error a evitar 2"],
  "mensaje_wa_cliente": "mensaje de WhatsApp para presentarle la estrategia al cliente (argentino, corto, genera confianza)"
}`

    const msg = await getClient().messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 2000,
      system,
      messages: [{ role: 'user', content: user }],
    })

    const raw = (msg.content[0] as { type: string; text: string }).text
    const json = JSON.parse(raw.match(/\{[\s\S]*\}/)?.[0] ?? raw)
    return NextResponse.json({ ok: true, strategy: json })
  } catch (error) {
    console.error('Strategy error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error al generar estrategia' },
      { status: 500 }
    )
  }
}
