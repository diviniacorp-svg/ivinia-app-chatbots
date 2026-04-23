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
    const { client_name, rubro, objetivo, plataforma, producto, tono, audiencia } = await request.json()

    if (!client_name || !rubro) {
      return NextResponse.json({ error: 'client_name y rubro son requeridos' }, { status: 400 })
    }

    const system = `Sos el Copywriter de Ads de DIVINIA, especialista en publicidad digital para PYMEs argentinas.
Escribís copies de anuncios que convierten: directos, sin palabrería, con gancho real.
Conocés el tono argentino — hablás de "vos", usás lenguaje del rubro.
Respondés SOLO con JSON válido.`

    const user = `Escribí copies de anuncios para:
Cliente: ${client_name}
Rubro: ${rubro}
Plataforma: ${plataforma || 'Meta Ads (Facebook + Instagram)'}
Objetivo del anuncio: ${objetivo || 'conseguir leads'}
${producto ? `Producto/servicio específico: ${producto}` : ''}
${tono ? `Tono: ${tono}` : 'Tono: cercano y confiable, sin exceso de exclamaciones'}
${audiencia ? `Audiencia: ${audiencia}` : ''}

Generá 3 variantes de copy. Cada una con:
- Headline corto (≤ 40 caracteres) — gancho directo
- Texto principal (≤ 125 caracteres) — qué resuelve, por qué ahora
- Descripción (≤ 30 caracteres) — para el link/botón

Devolvé JSON:
{
  "variantes": [
    {
      "id": "A",
      "headline": "...",
      "texto_principal": "...",
      "descripcion": "...",
      "cta": "Reservar ahora | Consultar | Pedir turno | etc",
      "angulo": "qué enfoque usa esta variante (ej: urgencia, beneficio, social proof)"
    },
    { "id": "B", ... },
    { "id": "C", ... }
  ],
  "imagen_sugerida": "descripción de qué imagen/video usar",
  "notas_creativas": "tips para la creatividad visual (colores, formato, qué mostrar)",
  "test_ab": "cómo testear estas variantes: cuál lanzar primero y por qué"
}`

    const msg = await getClient().messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1200,
      system,
      messages: [{ role: 'user', content: user }],
    })

    const raw = (msg.content[0] as { type: string; text: string }).text
    const json = JSON.parse(raw.match(/\{[\s\S]*\}/)?.[0] ?? raw)
    return NextResponse.json({ ok: true, ...json })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error al generar copies' },
      { status: 500 }
    )
  }
}
