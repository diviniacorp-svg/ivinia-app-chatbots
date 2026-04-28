// ============================================================
// DIVINIA Social Agency — TikTok Publisher
// TikTok Content Posting API v2
// Docs: https://developers.tiktok.com/doc/content-posting-api-reference-direct-post
// ============================================================

import type { BasePublisher, SocialPost, PlatformCredentials, PublishResult } from '../types'

const BASE = 'https://open.tiktokapis.com/v2'

export class TikTokPublisher implements BasePublisher {
  readonly platform = 'tiktok' as const

  async publish(post: SocialPost, creds: PlatformCredentials): Promise<PublishResult> {
    const { accessToken: tok } = creds
    const mediaUrl = post.videoUrl || post.imagenUrl

    if (!mediaUrl) return { success: false, platform: 'tiktok', error: 'Sin URL de media' }

    try {
      const isVideo = /\.(mp4|mov)$/i.test(mediaUrl)

      if (isVideo) {
        return await this.publishVideo(tok, mediaUrl, post.caption, post.hashtags)
      } else {
        return await this.publishPhotoPost(tok, [mediaUrl], post.caption, post.hashtags)
      }
    } catch (err) {
      return {
        success: false,
        platform: 'tiktok',
        error: err instanceof Error ? err.message : 'Error TikTok',
      }
    }
  }

  private async publishVideo(
    tok: string,
    videoUrl: string,
    caption: string,
    hashtags: string
  ): Promise<PublishResult> {
    const fullCaption = `${caption} ${hashtags}`.trim()

    const res = await fetch(`${BASE}/post/publish/video/init/`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${tok}`,
        'Content-Type': 'application/json; charset=UTF-8',
      },
      body: JSON.stringify({
        post_info: {
          title: fullCaption.slice(0, 150),
          privacy_level: 'PUBLIC_TO_EVERYONE',
          disable_duet: false,
          disable_comment: false,
          disable_stitch: false,
        },
        source_info: {
          source: 'PULL_FROM_URL',
          video_url: videoUrl,
        },
      }),
    })

    const data = await res.json() as {
      data?: { publish_id?: string }
      error?: { code: string; message: string }
    }

    if (!res.ok || data.error?.code !== 'ok') {
      throw new Error(data.error?.message ?? `TikTok API error ${res.status}`)
    }

    return {
      success: true,
      platform: 'tiktok',
      platformPostId: data.data?.publish_id,
    }
  }

  private async publishPhotoPost(
    tok: string,
    imageUrls: string[],
    caption: string,
    hashtags: string
  ): Promise<PublishResult> {
    const fullCaption = `${caption} ${hashtags}`.trim()

    const res = await fetch(`${BASE}/post/publish/content/init/`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${tok}`,
        'Content-Type': 'application/json; charset=UTF-8',
      },
      body: JSON.stringify({
        post_info: {
          title: fullCaption.slice(0, 150),
          privacy_level: 'PUBLIC_TO_EVERYONE',
          auto_add_music: true,
        },
        source_info: {
          source: 'PULL_FROM_URL',
          photo_images: imageUrls,
          photo_cover_index: 0,
        },
        post_mode: 'DIRECT_POST',
        media_type: 'PHOTO',
      }),
    })

    const data = await res.json() as {
      data?: { publish_id?: string }
      error?: { code: string; message: string }
    }

    if (!res.ok || data.error?.code !== 'ok') {
      throw new Error(data.error?.message ?? `TikTok API error ${res.status}`)
    }

    return {
      success: true,
      platform: 'tiktok',
      platformPostId: data.data?.publish_id,
    }
  }
}
