import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase'
import { publishToAllPlatforms } from '@/agents/social/publisher'
import type { SocialPost } from '@/agents/social/types'

export const dynamic = 'force-dynamic'
export const maxDuration = 300

export async function POST(req: NextRequest) {
  const { postId, platforms } = await req.json()
  if (!postId) return NextResponse.json({ error: 'postId requerido' }, { status: 400 })

  const db = createAdminClient()
  const { data: post } = await db
    .from('content_calendar')
    .select('*')
    .eq('id', postId)
    .single()

  if (!post) return NextResponse.json({ error: 'Post no encontrado' }, { status: 404 })

  const socialClientId = post.social_client_id
  if (!socialClientId) return NextResponse.json({ error: 'Post sin social_client_id — asignar cliente primero' }, { status: 400 })

  const targetPlatforms = platforms ?? [post.plataforma ?? 'instagram']
  const hashtags = Array.isArray(post.hashtags)
    ? post.hashtags.join(' ')
    : (post.hashtags ?? '')

  const socialPost: SocialPost = {
    id: post.id,
    socialClientId,
    fecha: post.fecha,
    platforms: targetPlatforms,
    plataforma: post.plataforma ?? 'instagram',
    tipo: post.tipo ?? 'post',
    pilar: post.pilar ?? 'educativo',
    titulo: post.titulo,
    caption: post.caption ?? post.titulo ?? '',
    hashtags,
    imagenUrl: post.imagen_url,
    videoUrl: post.video_url ?? (post.imagen_url?.match(/\.(mp4|mov)$/i) ? post.imagen_url : undefined),
    coverUrl: post.cover_url,
    audioUrl: post.audio_url,
    status: 'listo',
    generadoPor: post.generado_por ?? 'manual',
  }

  const result = await publishToAllPlatforms(socialPost)
  return NextResponse.json({ ok: result.successCount > 0, result })
}
