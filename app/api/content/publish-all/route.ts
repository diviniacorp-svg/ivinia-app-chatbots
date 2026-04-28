import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase'
import { publishPost } from '@/agents/instagram/publisher'

export const dynamic = 'force-dynamic'
export const maxDuration = 300

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const db = createAdminClient()
  const today = new Date().toISOString().split('T')[0]

  const { data: posts } = await db
    .from('content_calendar')
    .select('id, titulo, caption, hashtags, imagen_url, prompt_imagen')
    .eq('status', 'listo')
    .eq('plataforma', 'instagram')
    .lte('fecha', today)
    .order('fecha', { ascending: true })

  if (!posts?.length) {
    return NextResponse.json({ ok: true, message: 'No hay posts listos' })
  }

  const results = []

  for (const post of posts) {
    if (!post.imagen_url) {
      results.push({ titulo: post.titulo, ok: false, reason: 'sin imagen' })
      continue
    }

    const hashtags = post.hashtags?.split(' ').filter(Boolean) ?? ['#divinia', '#turnero', '#sanluis']

    const result = await publishPost({
      id: post.id,
      caption: post.caption || post.titulo,
      hashtags,
      imageUrl: post.imagen_url,
      rubro: 'general',
      postType: 'educativo',
      format: 'post',
      status: 'scheduled',
    })

    if (result.success) {
      await db.from('content_calendar').update({
        status: 'publicado',
        ig_media_id: result.igMediaId,
        published_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }).eq('id', post.id)
    }

    results.push({ titulo: post.titulo, ok: result.success, ig_media_id: result.igMediaId, error: result.error })

    if (result.success) await new Promise(r => setTimeout(r, 3000))
  }

  return NextResponse.json({ ok: true, results })
}
