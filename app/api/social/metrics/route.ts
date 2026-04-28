import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase'
import { syncPostMetrics, getTopPosts, generateWeeklyReport } from '@/agents/social/analytics'
import type { SocialClient, Platform } from '@/agents/social/types'

export const dynamic = 'force-dynamic'
export const maxDuration = 120

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const socialClientId = searchParams.get('socialClientId')
  const platform = searchParams.get('platform') as Platform | null
  const action = searchParams.get('action') ?? 'top_posts'

  if (!socialClientId) return NextResponse.json({ error: 'socialClientId requerido' }, { status: 400 })

  const db = createAdminClient()

  if (action === 'top_posts' && platform) {
    const posts = await getTopPosts(socialClientId, platform, 10)
    return NextResponse.json({ posts })
  }

  if (action === 'weekly_report') {
    const { data: clientData } = await db.from('social_clients').select('*').eq('id', socialClientId).single()
    if (!clientData) return NextResponse.json({ error: 'Cliente no encontrado' }, { status: 404 })

    const client: SocialClient = {
      id: clientData.id,
      nombre: clientData.nombre,
      rubro: clientData.rubro,
      brandVoice: clientData.brand_voice,
      contentStrategy: clientData.content_strategy,
      isDivinia: clientData.is_divinia,
      isActive: clientData.is_active,
    }

    const platforms = (searchParams.get('platforms')?.split(',') ?? ['instagram']) as Platform[]
    const report = await generateWeeklyReport(client, platforms)
    return NextResponse.json({ report })
  }

  // Default: return last 30 days metrics summary
  const { data: metrics } = await db
    .from('post_metrics')
    .select('platform, reach, impressions, likes, comments, shares, saves, fetched_at')
    .in('post_id', await getPostIds(db, socialClientId))
    .order('fetched_at', { ascending: false })
    .limit(100)

  return NextResponse.json({ metrics: metrics ?? [] })
}

export async function POST(req: NextRequest) {
  const { socialClientId } = await req.json()
  if (!socialClientId) return NextResponse.json({ error: 'socialClientId requerido' }, { status: 400 })

  await syncPostMetrics(socialClientId)
  return NextResponse.json({ ok: true, message: 'Métricas sincronizadas' })
}

async function getPostIds(db: ReturnType<typeof createAdminClient>, socialClientId: string): Promise<string[]> {
  const { data } = await db
    .from('content_calendar')
    .select('id')
    .eq('social_client_id', socialClientId)
    .eq('status', 'publicado')
  return (data ?? []).map(p => p.id)
}
