import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase'
import { publishPost } from '@/agents/instagram/publisher'
import type { InstagramPost } from '@/agents/instagram/types'

export const dynamic = 'force-dynamic'

// POST /api/content/publish — publica un post del calendario en Instagram
// Body: { post_id } o { caption, hashtags, image_url, platform? }
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const db = createAdminClient()

    let caption: string
    let hashtags: string[]
    let imageUrl: string | undefined
    let postId: string | undefined

    if (body.post_id) {
      // Publicar desde el calendario de contenido
      postId = body.post_id
      const { data: post, error } = await db
        .from('content_calendar')
        .select('*')
        .eq('id', postId)
        .single()

      if (error || !post) {
        return NextResponse.json({ error: 'Post no encontrado' }, { status: 404 })
      }

      if (post.status === 'publicado') {
        return NextResponse.json({ error: 'Este post ya fue publicado', ig_media_id: post.ig_media_id }, { status: 409 })
      }

      caption = post.caption || post.titulo || ''
      hashtags = post.hashtags ? post.hashtags.split(' ').filter(Boolean) : []
      // body.image_url sobreescribe lo que haya en la DB (útil cuando n8n genera la imagen)
      imageUrl = body.image_url || post.imagen_url || undefined

    } else {
      // Publicar post ad-hoc
      caption = body.caption
      hashtags = Array.isArray(body.hashtags)
        ? body.hashtags
        : (body.hashtags || '').split(' ').filter(Boolean)
      imageUrl = body.image_url
    }

    if (!caption) {
      return NextResponse.json({ error: 'caption requerido' }, { status: 400 })
    }

    // Verificar credenciales Instagram
    if (!process.env.INSTAGRAM_ACCESS_TOKEN || !process.env.INSTAGRAM_ACCOUNT_ID) {
      // Mock mode para dev — registra la intención pero no publica
      if (postId) {
        await db.from('content_calendar').update({
          status: 'programado',
          updated_at: new Date().toISOString(),
        }).eq('id', postId)
      }
      return NextResponse.json({
        ok: false,
        mock: true,
        message: 'INSTAGRAM_ACCESS_TOKEN no configurado. Post marcado como programado.',
        caption,
      })
    }

    const igPost: InstagramPost = {
      id: postId || `adhoc-${Date.now()}`,
      caption,
      hashtags,
      imageUrl,
      rubro: 'general',
      postType: 'educativo',
      format: 'post',
      status: 'scheduled',
    }

    const result = await publishPost(igPost)

    if (result.success && postId) {
      // Actualizar calendario con ID de publicación
      await db.from('content_calendar').update({
        status: 'publicado',
        ig_media_id: result.igMediaId,
        ig_permalink: result.igMediaId
          ? `https://www.instagram.com/p/${result.igMediaId}/`
          : null,
        imagen_url: imageUrl || null,
        published_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }).eq('id', postId)
    }

    return NextResponse.json({
      ok: result.success,
      ig_media_id: result.igMediaId,
      error: result.error,
    })

  } catch (err) {
    console.error('[content/publish]', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Error al publicar' },
      { status: 500 }
    )
  }
}
