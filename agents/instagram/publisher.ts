// ============================================================
// DIVINIA — Publisher Agent
// Publica y programa contenido en Instagram via Graph API
// ============================================================

import type { InstagramPost, PostMetrics } from './types'

const IG_API_VERSION = 'v21.0'
const IG_API_BASE = `https://graph.facebook.com/${IG_API_VERSION}`

interface PublishResult {
  success: boolean
  igMediaId?: string
  error?: string
}

interface ScheduleResult {
  success: boolean
  scheduledMediaId?: string
  error?: string
}

function getCredentials() {
  const accessToken = process.env.INSTAGRAM_ACCESS_TOKEN
  const accountId = process.env.INSTAGRAM_ACCOUNT_ID
  if (!accessToken || !accountId) {
    throw new Error('Faltan credenciales de Instagram: INSTAGRAM_ACCESS_TOKEN y INSTAGRAM_ACCOUNT_ID')
  }
  return { accessToken, accountId }
}

// Crear un media container (paso 1 de la publicación)
async function createMediaContainer(
  accountId: string,
  accessToken: string,
  imageUrl: string,
  caption: string,
  isCarousel: boolean = false
): Promise<string> {
  const params = new URLSearchParams({
    image_url: imageUrl,
    caption,
    access_token: accessToken,
  })

  if (isCarousel) {
    params.set('is_carousel_item', 'true')
  }

  const response = await fetch(`${IG_API_BASE}/${accountId}/media`, {
    method: 'POST',
    body: params,
  })

  const data = await response.json()

  if (!response.ok || data.error) {
    throw new Error(data.error?.message || `Error creando container: ${response.status}`)
  }

  return data.id as string
}

// Publicar el container (paso 2)
async function publishMediaContainer(
  accountId: string,
  accessToken: string,
  creationId: string
): Promise<string> {
  const response = await fetch(`${IG_API_BASE}/${accountId}/media_publish`, {
    method: 'POST',
    body: new URLSearchParams({
      creation_id: creationId,
      access_token: accessToken,
    }),
  })

  const data = await response.json()

  if (!response.ok || data.error) {
    throw new Error(data.error?.message || `Error publicando: ${response.status}`)
  }

  return data.id as string
}

async function createReelContainer(
  accountId: string,
  accessToken: string,
  videoUrl: string,
  caption: string,
): Promise<string> {
  const params = new URLSearchParams({
    media_type: 'REELS',
    video_url: videoUrl,
    caption,
    access_token: accessToken,
  })

  const response = await fetch(`${IG_API_BASE}/${accountId}/media`, {
    method: 'POST',
    body: params,
  })

  const data = await response.json()
  if (!response.ok || data.error) {
    throw new Error(data.error?.message || `Error creando reel container: ${response.status}`)
  }
  return data.id as string
}

async function waitForVideoProcessing(containerId: string, accessToken: string): Promise<void> {
  for (let i = 0; i < 20; i++) {
    await new Promise(r => setTimeout(r, 5000))
    const res = await fetch(`${IG_API_BASE}/${containerId}?fields=status_code&access_token=${accessToken}`)
    const data = await res.json()
    if (data.status_code === 'FINISHED') return
    if (data.status_code === 'ERROR') throw new Error('Error procesando video en Instagram')
  }
  throw new Error('Timeout esperando procesamiento del video')
}

export async function publishPost(post: InstagramPost): Promise<PublishResult> {
  try {
    const { accessToken, accountId } = getCredentials()

    if (!post.imageUrl) {
      return { success: false, error: 'El post no tiene imagen o video (imageUrl requerido)' }
    }

    const caption = `${post.caption}\n\n${post.hashtags.join(' ')}`
    const isVideo = post.imageUrl.endsWith('.mp4') || post.imageUrl.endsWith('.mov')

    let containerId: string

    if (isVideo) {
      containerId = await createReelContainer(accountId, accessToken, post.imageUrl, caption)
      await waitForVideoProcessing(containerId, accessToken)
    } else {
      containerId = await createMediaContainer(accountId, accessToken, post.imageUrl, caption)
      await new Promise(r => setTimeout(r, 2000))
    }

    const igMediaId = await publishMediaContainer(accountId, accessToken, containerId)
    return { success: true, igMediaId }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido al publicar',
    }
  }
}

export async function publishCarousel(
  imageUrls: string[],
  caption: string,
  hashtags: string[]
): Promise<PublishResult> {
  try {
    const { accessToken, accountId } = getCredentials()

    if (imageUrls.length < 2 || imageUrls.length > 10) {
      return { success: false, error: 'El carrusel debe tener entre 2 y 10 imágenes' }
    }

    // Paso 1: crear container para cada imagen
    const itemIds: string[] = []
    for (const imageUrl of imageUrls) {
      const itemId = await createMediaContainer(accountId, accessToken, imageUrl, '', true)
      itemIds.push(itemId)
      await new Promise((resolve) => setTimeout(resolve, 1000))
    }

    // Paso 2: crear container del carrusel
    const fullCaption = `${caption}\n\n${hashtags.join(' ')}`
    const carouselResponse = await fetch(`${IG_API_BASE}/${accountId}/media`, {
      method: 'POST',
      body: new URLSearchParams({
        media_type: 'CAROUSEL',
        children: itemIds.join(','),
        caption: fullCaption,
        access_token: accessToken,
      }),
    })

    const carouselData = await carouselResponse.json()
    if (!carouselResponse.ok || carouselData.error) {
      throw new Error(carouselData.error?.message || 'Error creando carrusel')
    }

    // Paso 3: publicar
    await new Promise((resolve) => setTimeout(resolve, 2000))
    const igMediaId = await publishMediaContainer(accountId, accessToken, carouselData.id)

    return { success: true, igMediaId }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido en carrusel',
    }
  }
}

export async function getAccountInsights(period: 'day' | 'week' | 'month' = 'week'): Promise<PostMetrics> {
  try {
    const { accessToken, accountId } = getCredentials()

    const metrics = 'impressions,reach,profile_views,follower_count'
    const response = await fetch(
      `${IG_API_BASE}/${accountId}/insights?metric=${metrics}&period=${period}&access_token=${accessToken}`
    )

    const data = await response.json()

    if (!response.ok || data.error) {
      throw new Error(data.error?.message || 'Error obteniendo insights')
    }

    // Parsear métricas
    const metricsMap: Record<string, number> = {}
    for (const item of data.data || []) {
      metricsMap[item.name] = item.values?.[0]?.value || 0
    }

    return {
      likes: 0,
      comments: 0,
      shares: 0,
      saves: 0,
      reach: metricsMap.reach || 0,
      impressions: metricsMap.impressions || 0,
    }
  } catch {
    return { likes: 0, comments: 0, shares: 0, saves: 0, reach: 0, impressions: 0 }
  }
}

export async function getPostInsights(igMediaId: string): Promise<PostMetrics> {
  try {
    const { accessToken } = getCredentials()

    const metrics = 'likes,comments,shares,saved,reach,impressions'
    const response = await fetch(
      `${IG_API_BASE}/${igMediaId}/insights?metric=${metrics}&access_token=${accessToken}`
    )

    const data = await response.json()
    if (!response.ok || data.error) throw new Error(data.error?.message)

    const metricsMap: Record<string, number> = {}
    for (const item of data.data || []) {
      metricsMap[item.name] = item.values?.[0]?.value || 0
    }

    return {
      likes: metricsMap.likes || 0,
      comments: metricsMap.comments || 0,
      shares: metricsMap.shares || 0,
      saves: metricsMap.saved || 0,
      reach: metricsMap.reach || 0,
      impressions: metricsMap.impressions || 0,
    }
  } catch {
    return { likes: 0, comments: 0, shares: 0, saves: 0, reach: 0, impressions: 0 }
  }
}
