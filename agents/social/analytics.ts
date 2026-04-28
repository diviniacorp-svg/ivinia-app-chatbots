// ============================================================
// DIVINIA Social Agency — Analytics Agent
// Fetches metrics from all platforms and generates reports
// ============================================================

import Anthropic from '@anthropic-ai/sdk'
import { createAdminClient } from '@/lib/supabase'
import { getCredentials } from './credentials'
import { getPublisher } from './publishers/base'
import type { SocialClient, Platform, WeeklyReport, PostMetrics } from './types'

let _client: Anthropic | null = null
function getClient() {
  if (!_client) _client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  return _client
}

export async function syncPostMetrics(socialClientId: string): Promise<void> {
  const db = createAdminClient()

  // Get posts published in last 30 days
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const { data: posts } = await db
    .from('content_calendar')
    .select('id, platform_post_ids, plataforma, ig_media_id')
    .eq('social_client_id', socialClientId)
    .eq('status', 'publicado')
    .gte('published_at', thirtyDaysAgo.toISOString())

  if (!posts?.length) return

  for (const post of posts) {
    const platformIds = (post.platform_post_ids ?? {}) as Record<string, string>

    // Add legacy ig_media_id if exists
    if (post.ig_media_id && !platformIds.instagram) {
      platformIds.instagram = post.ig_media_id
    }

    for (const [platform, platformPostId] of Object.entries(platformIds)) {
      try {
        const creds = await getCredentials(socialClientId, platform as Platform)
        const publisher = await getPublisher(platform as Platform)

        if (!publisher.getPostMetrics) continue

        const metrics = await publisher.getPostMetrics(platformPostId, creds)

        await db.from('post_metrics').upsert({
          post_id: post.id,
          platform,
          platform_post_id: platformPostId,
          fetched_at: new Date().toISOString(),
          likes: metrics.likes,
          comments: metrics.comments,
          shares: metrics.shares,
          saves: metrics.saves,
          reach: metrics.reach,
          impressions: metrics.impressions,
          plays: metrics.plays ?? 0,
          raw_response: {},
        }, { onConflict: 'post_id,platform' })
      } catch {
        // Silently skip if metrics fetch fails (token might have expired)
      }
    }
  }
}

export async function generateWeeklyReport(
  client: SocialClient,
  platforms: Platform[]
): Promise<WeeklyReport> {
  const db = createAdminClient()
  const claude = getClient()

  const weekStart = new Date()
  weekStart.setDate(weekStart.getDate() - 7)
  const weekEnd = new Date()

  // Fetch metrics for the week
  const { data: metrics } = await db
    .from('post_metrics')
    .select(`
      *,
      content_calendar!inner(titulo, pilar, plataforma, published_at, social_client_id)
    `)
    .eq('content_calendar.social_client_id', client.id)
    .gte('fetched_at', weekStart.toISOString())

  // Aggregate by platform
  const byPlatform: Record<string, {
    postsPublished: number
    totalReach: number
    totalImpressions: number
    totalEngagement: number
    followersEnd: number
  }> = {}

  for (const m of metrics ?? []) {
    if (!byPlatform[m.platform]) {
      byPlatform[m.platform] = { postsPublished: 0, totalReach: 0, totalImpressions: 0, totalEngagement: 0, followersEnd: 0 }
    }
    byPlatform[m.platform].postsPublished++
    byPlatform[m.platform].totalReach += m.reach ?? 0
    byPlatform[m.platform].totalImpressions += m.impressions ?? 0
    byPlatform[m.platform].totalEngagement += (m.likes ?? 0) + (m.comments ?? 0) + (m.shares ?? 0) + (m.saves ?? 0)
  }

  // Find top post
  const topMetric = (metrics ?? []).sort((a, b) => (b.reach ?? 0) - (a.reach ?? 0))[0]

  // Generate AI insights
  const metricsJson = JSON.stringify(byPlatform, null, 2)
  const insightsMsg = await claude.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 1000,
    messages: [{
      role: 'user',
      content: `Sos analista de redes sociales para ${client.nombre}.
Métricas de la semana:
${metricsJson}

Generá en español argentino:
1. 3 insights clave de lo que funcionó/no funcionó
2. 3 recomendaciones concretas para la próxima semana

JSON:
{
  "insights": ["insight 1", "insight 2", "insight 3"],
  "recommendations": ["rec 1", "rec 2", "rec 3"]
}`,
    }],
  })

  const insightsText = (insightsMsg.content[0] as { text: string }).text
  const insightsMatch = insightsText.match(/\{[\s\S]*\}/)
  const insights = insightsMatch
    ? JSON.parse(insightsMatch[0]) as { insights: string[]; recommendations: string[] }
    : { insights: [], recommendations: [] }

  return {
    socialClientId: client.id,
    weekEnding: weekEnd.toISOString().split('T')[0],
    generatedAt: new Date(),
    byPlatform: Object.fromEntries(
      Object.entries(byPlatform).map(([p, data]) => [p, {
        postsPublished: data.postsPublished,
        totalReach: data.totalReach,
        totalImpressions: data.totalImpressions,
        avgEngagementRate: data.totalReach > 0
          ? parseFloat(((data.totalEngagement / data.totalReach) * 100).toFixed(2))
          : 0,
        followersEnd: data.followersEnd,
        followersGrowth: 0,
      }])
    ) as WeeklyReport['byPlatform'],
    topPostId: topMetric?.post_id,
    insights: insights.insights,
    nextWeekRecommendations: insights.recommendations,
  }
}

export async function getTopPosts(
  socialClientId: string,
  platform: Platform,
  limit: number = 5
): Promise<PostMetrics[]> {
  const db = createAdminClient()

  const { data } = await db
    .from('post_metrics')
    .select(`*, content_calendar!inner(social_client_id)`)
    .eq('content_calendar.social_client_id', socialClientId)
    .eq('platform', platform)
    .order('reach', { ascending: false })
    .limit(limit)

  return (data ?? []).map(m => ({
    postId: m.post_id,
    platform: m.platform as Platform,
    platformPostId: m.platform_post_id,
    fetchedAt: new Date(m.fetched_at),
    likes: m.likes ?? 0,
    comments: m.comments ?? 0,
    shares: m.shares ?? 0,
    saves: m.saves ?? 0,
    reach: m.reach ?? 0,
    impressions: m.impressions ?? 0,
    plays: m.plays,
    engagementRate: m.reach > 0
      ? parseFloat((((m.likes + m.comments + m.shares + m.saves) / m.reach) * 100).toFixed(2))
      : 0,
  }))
}
