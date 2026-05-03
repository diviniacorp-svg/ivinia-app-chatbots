/**
 * POST /api/content-factory/generate-images
 * Genera imágenes con Freepik Mystic para posts que no tienen media_url.
 * Corre DESPUÉS de generar los posts de texto — es el segundo paso.
 *
 * Body: { client_id: string, post_ids?: string[] }
 * Si no se pasan post_ids, genera imágenes para todos los posts pending del mes actual.
 */

import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase'
import { generateImageMystic } from '@/lib/freepik'

export const dynamic = 'force-dynamic'
// Imágenes toman 60s c/u — necesitamos más tiempo
export const maxDuration = 300

interface Post {
  id: string
  visual_prompt: string
  tipo: string
  pilar: string
}

function buildFreepikPrompt(post: Post, businessName: string, rubro: string): string {
  const base = post.visual_prompt || `${rubro} negocio, contenido de Instagram profesional`

  // Prefijo para asegurar calidad fotográfica y estilo para redes sociales
  return `Professional social media photo for ${rubro} business "${businessName}". ${base}. High quality, clean background, Instagram style, well lit, modern aesthetic.`
}

const ASPECT_BY_TYPE: Record<string, 'square_1_1' | 'social_story_9_16' | 'widescreen_16_9'> = {
  reel: 'social_story_9_16',
  carrusel: 'square_1_1',
  post: 'square_1_1',
}

export async function POST(req: NextRequest) {
  try {
    const { client_id, post_ids } = await req.json()

    if (!client_id) {
      return NextResponse.json({ error: 'client_id requerido' }, { status: 400 })
    }

    const db = createAdminClient()

    // Obtener nombre y rubro del cliente
    const { data: client } = await db
      .from('clients')
      .select('business_name, rubro')
      .eq('id', client_id)
      .single()

    const businessName = client?.business_name ?? 'Negocio'
    const rubro = client?.rubro ?? 'servicios'

    // Obtener posts a procesar
    const mes = new Date().toLocaleDateString('es-AR', { month: 'long', year: 'numeric' })

    let query = db
      .from('social_posts')
      .select('id, visual_prompt, tipo, pilar')
      .eq('client_id', client_id)
      .is('media_url', null)

    if (post_ids?.length) {
      query = query.in('id', post_ids)
    } else {
      query = query.eq('mes', mes)
    }

    const { data: posts, error } = await query
    if (error) throw error
    if (!posts?.length) {
      return NextResponse.json({ ok: true, message: 'No hay posts sin imagen', updated: 0 })
    }

    // Generar imágenes secuencialmente para no saturar la API
    const results: Array<{ id: string; media_url: string | null; error?: string }> = []

    for (const post of posts as Post[]) {
      try {
        const prompt = buildFreepikPrompt(post, businessName, rubro)
        const aspectRatio = ASPECT_BY_TYPE[post.tipo] ?? 'square_1_1'

        const imageUrl = await generateImageMystic(prompt, {
          aspect_ratio: aspectRatio,
          model: 'flexible',
          resolution: '1k',
        })

        // Actualizar en Supabase
        await db
          .from('social_posts')
          .update({ media_url: imageUrl })
          .eq('id', post.id)

        results.push({ id: post.id, media_url: imageUrl })
      } catch (e) {
        const errMsg = e instanceof Error ? e.message : 'Error desconocido'
        results.push({ id: post.id, media_url: null, error: errMsg })
        console.error(`[generate-images] Error post ${post.id}:`, errMsg)
      }
    }

    const successful = results.filter(r => r.media_url !== null).length
    const failed = results.filter(r => r.error).length

    return NextResponse.json({
      ok: true,
      client_id,
      total: posts.length,
      successful,
      failed,
      results,
    })
  } catch (e) {
    console.error('[generate-images]', e)
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Error interno' },
      { status: 500 }
    )
  }
}
