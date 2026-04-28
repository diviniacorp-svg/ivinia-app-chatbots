import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase'
import { publishPost } from '@/agents/instagram/publisher'

export const dynamic = 'force-dynamic'
export const maxDuration = 300

async function generateFreepikImage(prompt: string): Promise<string | null> {
  const apiKey = process.env.FREEPIK_API_KEY
  if (!apiKey) return null
  try {
    const res = await fetch('https://api.freepik.com/v1/ai/text-to-image/mystic', {
      method: 'POST',
      headers: { 'X-Freepik-API-Key': apiKey, 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: `${prompt}, professional quality, Instagram post`, aspect_ratio: 'square_1_1', model: 'realism', resolution: '2k' }),
    })
    const data = await res.json()
    const taskId = data?.data?.task_id
    if (!taskId) return null
    await new Promise(r => setTimeout(r, 30000))
    const poll = await fetch(`https://api.freepik.com/v1/ai/text-to-image/mystic/${taskId}`, { headers: { 'X-Freepik-API-Key': apiKey } })
    const pollData = await poll.json()
    return pollData?.data?.generated?.[0] || null
  } catch { return null }
}

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const db = createAdminClient()

  const { data: posts } = await db
    .from('content_calendar')
    .select('id, titulo, caption, hashtags, imagen_url, prompt_imagen')
    .eq('status', 'listo')
    .eq('plataforma', 'instagram')
    .order('fecha', { ascending: true })

  if (!posts?.length) {
    return NextResponse.json({ ok: true, message: 'No hay posts listos' })
  }

  const results = []

  for (const post of posts) {
    let imageUrl = post.imagen_url

    if (!imageUrl && post.prompt_imagen) {
      imageUrl = await generateFreepikImage(post.prompt_imagen)
      if (imageUrl) {
        await db.from('content_calendar').update({ imagen_url: imageUrl }).eq('id', post.id)
      }
    }

    if (!imageUrl) {
      results.push({ titulo: post.titulo, ok: false, reason: 'sin imagen ni prompt' })
      continue
    }

    const hashtags = post.hashtags?.split(' ').filter(Boolean) ?? ['#divinia', '#turnero', '#sanluis']

    const result = await publishPost({
      id: post.id,
      caption: post.caption || post.titulo,
      hashtags,
      imageUrl,
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
