import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase'
import { publishPost } from '@/agents/instagram/publisher'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const db = createAdminClient()
  const today = new Date().toISOString().split('T')[0]

  const { data: post, error } = await db
    .from('content_calendar')
    .select('id, titulo, caption, hashtags, prompt_imagen, imagen_url, tipo')
    .eq('status', 'listo')
    .eq('plataforma', 'instagram')
    .lte('fecha', today)
    .order('fecha', { ascending: true })
    .limit(1)
    .single()

  if (error || !post) {
    return NextResponse.json({ ok: true, message: 'No hay posts listos para publicar' })
  }

  if (!post.imagen_url && post.prompt_imagen) {
    const imageUrl = await generateFreepikImage(post.prompt_imagen)
    if (imageUrl) {
      await db.from('content_calendar').update({ imagen_url: imageUrl }).eq('id', post.id)
      post.imagen_url = imageUrl
    }
  }

  if (!post.imagen_url) {
    return NextResponse.json({ ok: false, message: `Post "${post.titulo}" sin imagen — saltando` })
  }

  const hashtags = post.hashtags
    ? post.hashtags.split(' ').filter(Boolean)
    : ['#divinia', '#turneronline', '#sanluis', '#pymes']

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

  return NextResponse.json({
    ok: result.success,
    post: post.titulo,
    ig_media_id: result.igMediaId,
    error: result.error,
  })
}

async function generateFreepikImage(prompt: string): Promise<string | null> {
  const apiKey = process.env.FREEPIK_API_KEY
  if (!apiKey) return null

  try {
    const res = await fetch('https://api.freepik.com/v1/ai/mystic', {
      method: 'POST',
      headers: { 'X-Freepik-API-Key': apiKey, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt: `${prompt}, professional quality, Instagram post`,
        image: { size: '1:1' },
        styling: { style: 'photo' },
      }),
    })
    const data = await res.json()
    const taskId = data?.data?.task_id
    if (!taskId) return null

    await new Promise(r => setTimeout(r, 30000))

    const poll = await fetch(`https://api.freepik.com/v1/ai/mystic/${taskId}`, {
      headers: { 'X-Freepik-API-Key': apiKey },
    })
    const pollData = await poll.json()
    return pollData?.data?.generated?.[0]?.url || pollData?.data?.generated?.[0] || null
  } catch {
    return null
  }
}
