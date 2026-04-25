import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase'
import Anthropic from '@anthropic-ai/sdk'

export const dynamic = 'force-dynamic'

let _anthropic: Anthropic | null = null
function getAnthropic() {
  if (!_anthropic) _anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  return _anthropic
}

// GET /api/content/calendar?client_id=xxx&mes=2026-04
export async function GET(req: NextRequest) {
  const client_id = req.nextUrl.searchParams.get('client_id')
  const mes = req.nextUrl.searchParams.get('mes') // YYYY-MM
  const db = createAdminClient()

  const query = db
    .from('content_calendar')
    .select('*')
    .order('fecha', { ascending: true })

  if (client_id) query.eq('client_id', client_id)
  if (mes) {
    const start = `${mes}-01`
    const end = `${mes}-31`
    query.gte('fecha', start).lte('fecha', end)
  }

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ posts: data })
}

// POST /api/content/calendar — crear post o generar batch con IA
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { accion } = body

    const db = createAdminClient()

    if (accion === 'generar-mes') {
      // Generar un mes completo de contenido con IA
      const { client_id, mes, rubro, tono, productos } = body
      if (!mes || !rubro) {
        return NextResponse.json({ error: 'mes y rubro requeridos' }, { status: 400 })
      }

      const prompt = `Generá un plan de contenido para Instagram para un negocio de rubro "${rubro}" en Argentina.
Mes: ${mes}
Tono: ${tono || 'profesional y cercano'}
Productos/servicios a destacar: ${productos || rubro}

Generá exactamente 12 posts distribuidos en el mes. Para cada post incluí:
- fecha (formato YYYY-MM-DD, distribuidos en el mes)
- tipo: post | reel | carrusel | story
- pilar: problema | demo | resultado | educacion | behind | cta
- titulo: título del post (máx 60 chars)
- caption: caption completo listo para publicar, en español argentino (vos/tenés/sos), max 300 chars
- hashtags: string con hashtags separados por espacio, máx 15
- prompt_imagen: prompt en inglés para generar la imagen con IA (Freepik/DALL-E), descriptivo y visual

Respondé SOLO con un array JSON válido. Sin texto extra.`

      const resp = await getAnthropic().messages.create({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 4000,
        messages: [{ role: 'user', content: prompt }],
      })

      const raw = resp.content[0].type === 'text' ? resp.content[0].text : ''
      let posts: Record<string, unknown>[]
      try {
        const match = raw.match(/\[[\s\S]*\]/)
        posts = JSON.parse(match?.[0] || '[]')
      } catch {
        return NextResponse.json({ error: 'Error parseando respuesta IA' }, { status: 500 })
      }

      const rows = posts.map(p => ({
        client_id: client_id || null,
        fecha: p.fecha,
        tipo: p.tipo || 'post',
        plataforma: 'instagram',
        status: 'borrador',
        titulo: p.titulo,
        caption: p.caption,
        hashtags: p.hashtags,
        prompt_imagen: p.prompt_imagen,
        pilar: p.pilar,
        generado_por: 'ia',
        objetivo: p.pilar,
      }))

      const { data, error } = await db
        .from('content_calendar')
        .insert(rows)
        .select('id, fecha, tipo, titulo, status')

      if (error) throw error

      return NextResponse.json({ ok: true, posts: data, total: data.length })
    }

    // Crear post individual
    const {
      client_id, fecha, tipo, plataforma, titulo, caption,
      hashtags, imagen_url, prompt_imagen, pilar, notas,
    } = body

    if (!fecha || !tipo) {
      return NextResponse.json({ error: 'fecha y tipo requeridos' }, { status: 400 })
    }

    const { data, error } = await db
      .from('content_calendar')
      .insert({
        client_id: client_id || null,
        fecha,
        tipo,
        plataforma: plataforma || 'instagram',
        status: 'borrador',
        titulo,
        caption,
        hashtags,
        imagen_url,
        prompt_imagen,
        pilar,
        notas,
        generado_por: 'manual',
        objetivo: pilar,
      })
      .select('*')
      .single()

    if (error) throw error
    return NextResponse.json({ ok: true, post: data })
  } catch (err) {
    console.error('[content/calendar POST]', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Error' },
      { status: 500 }
    )
  }
}

// PATCH /api/content/calendar — actualizar estado o contenido de un post
export async function PATCH(req: NextRequest) {
  try {
    const { id, ...updates } = await req.json()
    if (!id) return NextResponse.json({ error: 'id requerido' }, { status: 400 })

    const db = createAdminClient()
    const { data, error } = await db
      .from('content_calendar')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select('*')
      .single()

    if (error) throw error
    return NextResponse.json({ ok: true, post: data })
  } catch (err) {
    return NextResponse.json({ error: 'Error al actualizar' }, { status: 500 })
  }
}

// DELETE /api/content/calendar?id=xxx
export async function DELETE(req: NextRequest) {
  const id = req.nextUrl.searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'id requerido' }, { status: 400 })

  const db = createAdminClient()
  const { error } = await db.from('content_calendar').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
