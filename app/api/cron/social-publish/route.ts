// Cron: runs at 9h, 12h, 19h ART on weekdays
// Publishes all posts due within the last 30 min
import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase'
import { publishToAllPlatforms } from '@/agents/social/publisher'
import type { SocialPost } from '@/agents/social/types'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

export async function GET(request: Request) {
  if (request.headers.get('authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const db = createAdminClient()
  const now = new Date()
  const windowStart = new Date(now.getTime() - 35 * 60 * 1000) // 35 min window

  // Posts scheduled within the window OR any listo post without publish_at
  const { data: posts } = await db
    .from('content_calendar')
    .select('*')
    .eq('status', 'listo')
    .not('social_client_id', 'is', null)
    .or(`publish_at.lte.${now.toISOString()},publish_at.is.null`)
    .order('publish_at', { ascending: true })
    .limit(10)

  if (!posts?.length) return NextResponse.json({ ok: true, message: 'Sin posts programados' })

  const results = []

  for (const post of posts) {
    const hashtags = Array.isArray(post.hashtags) ? post.hashtags.join(' ') : (post.hashtags ?? '')
    const platforms = post.plataforma ? [post.plataforma] : ['instagram']

    const socialPost: SocialPost = {
      id: post.id,
      socialClientId: post.social_client_id,
      fecha: post.fecha,
      platforms,
      plataforma: post.plataforma ?? 'instagram',
      tipo: post.tipo ?? 'post',
      pilar: post.pilar ?? 'educativo',
      titulo: post.titulo,
      caption: post.caption ?? post.titulo ?? '',
      hashtags,
      imagenUrl: post.imagen_url,
      videoUrl: post.video_url ?? (post.imagen_url?.match(/\.(mp4|mov)$/i) ? post.imagen_url : undefined),
      coverUrl: post.cover_url,
      status: 'listo',
      generadoPor: post.generado_por ?? 'manual',
    }

    const result = await publishToAllPlatforms(socialPost)
    results.push({ titulo: post.titulo, ...result })
  }

  return NextResponse.json({ ok: true, published: results.length, results })
}
