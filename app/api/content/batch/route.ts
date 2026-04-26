/**
 * DIVINIA Content Batch — Anthropic Message Batches API
 * POST /api/content/batch → genera hasta 30 posts en paralelo al 50% del costo
 * GET  /api/content/batch?batch_id=xxx → status del batch + resultados
 *
 * Anthropic Batch API: procesa hasta 10k requests en ≤24h, 50% más barato.
 * Ideal para generar el calendario mensual completo de una sola vez.
 */

import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { supabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })

const BRAND_SYSTEM = `Sos el copywriter de DIVINIA, empresa de IA para PYMEs argentinas.

VOZ: Directa, cálida, sin corporativo. Español argentino (vos, sos, tenés).
TARGET: Dueños de negocios locales 30-55 años, San Luis → Argentina.
CUENTA: @autom_atia — Instagram.

PROHIBIDO: "soluciones", "innovador", "robusto", "plataforma", "revolucionario".

Devolvé SOLO JSON válido, sin markdown ni texto extra.`

interface PostRequest {
  tema: string
  tipo: 'post' | 'reel' | 'carrusel'
  objetivo: 'awareness' | 'consideracion' | 'conversion'
  fecha?: string
  angulo?: string
}

interface BatchPost extends PostRequest {
  custom_id: string
}

// Construye el prompt para cada post
function buildPrompt(post: BatchPost): string {
  return `Generá contenido para Instagram para DIVINIA.

TEMA: ${post.tema}
ÁNGULO: ${post.angulo || post.tema}
FORMATO: ${post.tipo} (${post.tipo === 'reel' ? 'guion 30-45 seg con instrucciones de edición' : post.tipo === 'carrusel' ? '5-7 slides, slide 1 = hook, último = CTA' : 'post estático, caption 300-500 chars'})
OBJETIVO: ${post.objetivo}

Devolvé exactamente este JSON:
{
  "titulo": "nombre interno del post, max 60 chars",
  "caption": "caption completo con emojis, saltos de línea naturales, hashtags al final separados por doble salto",
  "hashtags": ["hashtag1", "hashtag2"],
  "brief_visual": "brief para el diseñador: qué aparece en el diseño, texto, jerarquía, colores DIVINIA",
  "prompt_imagen": "prompt en inglés para Freepik Flux/Mystic: sujeto, estilo dark SaaS, iluminación, fondo negro #09090b, sin texto",
  "hook": "primera línea del caption — debe parar el scroll"
}`
}

// POST: crear batch de hasta 30 posts
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const posts: PostRequest[] = body.posts

    if (!Array.isArray(posts) || posts.length === 0) {
      return NextResponse.json({ error: 'posts[] requerido' }, { status: 400 })
    }

    if (posts.length > 30) {
      return NextResponse.json({ error: 'Máximo 30 posts por batch' }, { status: 400 })
    }

    // Construir requests para el Batch API
    const batchedPosts: BatchPost[] = posts.map((p, i) => ({
      ...p,
      custom_id: `post-${i}-${Date.now()}`,
    }))

    const requests = batchedPosts.map(post => ({
      custom_id: post.custom_id,
      params: {
        model: 'claude-haiku-4-5-20251001' as const,
        max_tokens: 800,
        system: BRAND_SYSTEM,
        messages: [{ role: 'user' as const, content: buildPrompt(post) }],
      },
    }))

    const batch = await anthropic.messages.batches.create({ requests })

    // Guardar en Supabase para tracking
    Promise.resolve(supabaseAdmin.from('content_batches').insert({
      batch_id: batch.id,
      status: batch.processing_status,
      total_posts: posts.length,
      posts_metadata: batchedPosts,
      created_at: new Date().toISOString(),
    })).catch(() => {
      // Tabla puede no existir aún — no bloquear
    })

    return NextResponse.json({
      ok: true,
      batch_id: batch.id,
      status: batch.processing_status,
      total: posts.length,
      poll_url: `/api/content/batch?batch_id=${batch.id}`,
      note: 'El batch procesa en background. Polleá poll_url hasta que status sea "ended".',
      expires_at: batch.expires_at,
    })

  } catch (err) {
    console.error('[content/batch POST]', err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}

// GET: status + resultados del batch
export async function GET(req: NextRequest) {
  const batchId = req.nextUrl.searchParams.get('batch_id')

  if (!batchId) {
    return NextResponse.json({
      api: 'DIVINIA Content Batch',
      uso: 'POST con { posts: [{ tema, tipo, objetivo, fecha?, angulo? }] }',
      maximo: '30 posts por batch',
      costo: '50% más barato que llamadas individuales',
    })
  }

  try {
    const batch = await anthropic.messages.batches.retrieve(batchId)

    if (batch.processing_status !== 'ended') {
      return NextResponse.json({
        batch_id: batchId,
        status: batch.processing_status,
        counts: batch.request_counts,
        message: 'Batch en progreso. Intentá de nuevo en unos minutos.',
      })
    }

    // Batch terminado — recuperar resultados
    const results: Array<{
      custom_id: string
      success: boolean
      content?: Record<string, unknown>
      error?: string
    }> = []

    for await (const result of await anthropic.messages.batches.results(batchId)) {
      if (result.result.type === 'succeeded') {
        const text = result.result.message.content[0].type === 'text'
          ? result.result.message.content[0].text
          : '{}'
        try {
          const parsed = JSON.parse(text.match(/\{[\s\S]*\}/)?.[0] || '{}')
          results.push({ custom_id: result.custom_id, success: true, content: parsed })
        } catch {
          results.push({ custom_id: result.custom_id, success: false, error: 'JSON parse error', content: { raw: text } })
        }
      } else if (result.result.type === 'errored') {
        results.push({
          custom_id: result.custom_id,
          success: false,
          error: result.result.error.type,
        })
      }
    }

    // Guardar posts en content_calendar si tienen fecha
    const saved: string[] = []
    for (const r of results) {
      if (!r.success || !r.content) continue
      const meta = (batch as unknown as { request_counts: Record<string, number> })

      // Intentar guardar en calendario
      const { error } = await supabaseAdmin.from('content_calendar').insert({
        titulo: (r.content.titulo as string) || r.custom_id,
        caption: r.content.caption as string,
        hashtags: Array.isArray(r.content.hashtags)
          ? (r.content.hashtags as string[]).join(' ')
          : r.content.hashtags as string,
        prompt_imagen: r.content.prompt_imagen as string,
        plataforma: 'instagram',
        tipo: 'post',
        status: 'listo',
        fecha: new Date().toISOString().split('T')[0],
      })

      if (!error) saved.push(r.custom_id)

      void meta // silence unused warning
    }

    return NextResponse.json({
      batch_id: batchId,
      status: 'ended',
      counts: batch.request_counts,
      results,
      saved_to_calendar: saved.length,
      total: results.length,
      succeeded: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length,
    })

  } catch (err) {
    console.error('[content/batch GET]', err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
