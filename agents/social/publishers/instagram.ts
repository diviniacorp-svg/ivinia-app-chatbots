// ============================================================
// DIVINIA Social Agency — Instagram Publisher
// Multi-client wrapper; all media must be on Supabase Storage
// ============================================================

import type { BasePublisher, SocialPost, PlatformCredentials, PublishResult, CarouselItem, PostMetrics, AccountMetrics } from '../types'

const IG_API_VERSION = 'v21.0'
const BASE = `https://graph.instagram.com/${IG_API_VERSION}`

export class InstagramPublisher implements BasePublisher {
  readonly platform = 'instagram' as const

  async publish(post: SocialPost, creds: PlatformCredentials): Promise<PublishResult> {
    const { accessToken: tok, accountId: acc } = creds

    try {
      const caption = `${post.caption}\n\n${post.hashtags}`
      const mediaUrl = post.videoUrl || post.imagenUrl

      if (!mediaUrl) return { success: false, platform: 'instagram', error: 'Sin URL de media' }

      const isVideo = /\.(mp4|mov)$/i.test(mediaUrl)

      if (post.carouselItems && post.carouselItems.length >= 2) {
        return this.publishCarousel(post.carouselItems, caption, creds)
      }

      let containerId: string
      if (isVideo) {
        containerId = await this.createReelContainer(acc, tok, mediaUrl, caption, post.coverUrl)
        await this.waitForProcessing(containerId, tok)
      } else {
        containerId = await this.createImageContainer(acc, tok, mediaUrl, caption)
        await delay(2000)
      }

      const platformPostId = await this.publishContainer(acc, tok, containerId)
      return { success: true, platform: 'instagram', platformPostId }
    } catch (err) {
      return {
        success: false,
        platform: 'instagram',
        error: err instanceof Error ? err.message : 'Error desconocido',
      }
    }
  }

  async publishCarousel(
    items: CarouselItem[],
    caption: string,
    creds: PlatformCredentials
  ): Promise<PublishResult> {
    const { accessToken: tok, accountId: acc } = creds
    try {
      const itemIds: string[] = []
      for (const item of items) {
        const id = await this.createImageContainer(acc, tok, item.url, '', true)
        itemIds.push(id)
        await delay(1000)
      }

      const res = await apiFetch(`${BASE}/${acc}/media`, 'POST', tok, {
        media_type: 'CAROUSEL',
        children: itemIds.join(','),
        caption,
      })

      await delay(2000)
      const platformPostId = await this.publishContainer(acc, tok, res.id as string)
      return { success: true, platform: 'instagram', platformPostId }
    } catch (err) {
      return { success: false, platform: 'instagram', error: err instanceof Error ? err.message : 'Error carrusel' }
    }
  }

  async getPostMetrics(platformPostId: string, creds: PlatformCredentials): Promise<PostMetrics> {
    const { accessToken: tok } = creds
    const fields = 'likes,comments,shares,saved,reach,impressions,plays'
    const data = await apiFetch(`${BASE}/${platformPostId}/insights?metric=${fields}`, 'GET', tok)
    const map: Record<string, number> = {}
    for (const item of (data.data as { name: string; values?: { value: number }[]; value?: number }[]) || []) {
      map[item.name] = item.values?.[0]?.value ?? item.value ?? 0
    }
    return {
      postId: '',
      platform: 'instagram',
      platformPostId,
      fetchedAt: new Date(),
      likes: map.likes ?? 0,
      comments: map.comments ?? 0,
      shares: map.shares ?? 0,
      saves: map.saved ?? 0,
      reach: map.reach ?? 0,
      impressions: map.impressions ?? 0,
      plays: map.plays,
    }
  }

  async getAccountMetrics(
    creds: PlatformCredentials,
    period: 'day' | 'week' | 'month'
  ): Promise<AccountMetrics> {
    const { accessToken: tok, accountId: acc } = creds
    const fields = 'impressions,reach,follower_count,profile_views'
    const data = await apiFetch(
      `${BASE}/${acc}/insights?metric=${fields}&period=${period === 'month' ? 'month' : period === 'week' ? 'week' : 'day'}`,
      'GET', tok
    )
    const map: Record<string, number> = {}
    for (const item of (data.data as { name: string; values?: { value: number }[] }[]) || []) {
      map[item.name] = item.values?.[0]?.value ?? 0
    }
    return {
      platform: 'instagram',
      socialClientId: '',
      period,
      followers: map.follower_count ?? 0,
      followersGrowth: 0,
      totalReach: map.reach ?? 0,
      totalImpressions: map.impressions ?? 0,
      avgEngagementRate: 0,
      topPosts: [],
      fetchedAt: new Date(),
    }
  }

  private async createImageContainer(
    acc: string, tok: string, imageUrl: string, caption: string, isCarousel = false
  ): Promise<string> {
    const body: Record<string, string> = { image_url: imageUrl, caption, access_token: tok }
    if (isCarousel) body.is_carousel_item = 'true'
    const data = await apiFetch(`${BASE}/${acc}/media`, 'POST', tok, body)
    return data.id as string
  }

  private async createReelContainer(
    acc: string, tok: string, videoUrl: string, caption: string, coverUrl?: string
  ): Promise<string> {
    const body: Record<string, string> = {
      media_type: 'REELS',
      video_url: videoUrl,
      caption,
      access_token: tok,
    }
    if (coverUrl) body.cover_url = coverUrl
    const data = await apiFetch(`${BASE}/${acc}/media`, 'POST', tok, body)
    return data.id as string
  }

  private async waitForProcessing(containerId: string, tok: string): Promise<void> {
    for (let i = 0; i < 24; i++) {
      await delay(5000)
      const data = await apiFetch(`${BASE}/${containerId}?fields=status_code,status`, 'GET', tok)
      if (data.status_code === 'FINISHED') return
      if (data.status_code === 'ERROR') {
        throw new Error(`Instagram rechazó el video: ${String(data.status) ?? 'sin detalle'}`)
      }
    }
    throw new Error('Timeout procesando video en Instagram (>2 min)')
  }

  private async publishContainer(acc: string, tok: string, creationId: string): Promise<string> {
    const data = await apiFetch(`${BASE}/${acc}/media_publish`, 'POST', tok, {
      creation_id: creationId,
      access_token: tok,
    })
    return data.id as string
  }
}

async function apiFetch(
  url: string,
  method: 'GET' | 'POST',
  tok: string,
  body?: Record<string, string>
): Promise<Record<string, unknown>> {
  const init: RequestInit = { method }
  if (method === 'POST' && body) {
    const params = new URLSearchParams({ ...body, access_token: tok })
    init.body = params
  }
  const fullUrl = method === 'GET' && !url.includes('access_token')
    ? `${url}${url.includes('?') ? '&' : '?'}access_token=${tok}`
    : url

  const res = await fetch(fullUrl, init)
  const data = await res.json() as Record<string, unknown>
  if (!res.ok || (data as { error?: { message: string } }).error) {
    const msg = (data as { error?: { message: string } }).error?.message ?? `HTTP ${res.status}`
    throw new Error(msg)
  }
  return data
}

const delay = (ms: number) => new Promise(r => setTimeout(r, ms))
