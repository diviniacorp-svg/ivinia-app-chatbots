// ============================================================
// DIVINIA Social Agency — LinkedIn Publisher
// LinkedIn API v2 — UGC Posts for Organizations
// Docs: https://learn.microsoft.com/en-us/linkedin/marketing/community-management/shares/ugc-post-api
// ============================================================

import type { BasePublisher, SocialPost, PlatformCredentials, PublishResult } from '../types'

const BASE = 'https://api.linkedin.com/v2'

export class LinkedInPublisher implements BasePublisher {
  readonly platform = 'linkedin' as const

  async publish(post: SocialPost, creds: PlatformCredentials): Promise<PublishResult> {
    const { accessToken: tok, accountId } = creds
    const mediaUrl = post.videoUrl || post.imagenUrl

    try {
      const fullCaption = `${post.caption}\n\n${post.hashtags}`

      if (!mediaUrl) {
        // Text-only post
        return await this.publishText(tok, accountId, fullCaption)
      }

      const isVideo = /\.(mp4|mov)$/i.test(mediaUrl)
      if (isVideo) {
        return await this.publishVideo(tok, accountId, mediaUrl, fullCaption)
      } else {
        return await this.publishImage(tok, accountId, mediaUrl, fullCaption, post.titulo)
      }
    } catch (err) {
      return {
        success: false,
        platform: 'linkedin',
        error: err instanceof Error ? err.message : 'Error LinkedIn',
      }
    }
  }

  private async publishText(tok: string, orgId: string, text: string): Promise<PublishResult> {
    const body = {
      author: `urn:li:organization:${orgId}`,
      lifecycleState: 'PUBLISHED',
      specificContent: {
        'com.linkedin.ugc.ShareContent': {
          shareCommentary: { text },
          shareMediaCategory: 'NONE',
        },
      },
      visibility: { 'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC' },
    }

    const res = await fetch(`${BASE}/ugcPosts`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${tok}`, 'Content-Type': 'application/json', 'X-Restli-Protocol-Version': '2.0.0' },
      body: JSON.stringify(body),
    })

    const data = await res.json() as { id?: string; message?: string }
    if (!res.ok) throw new Error(data.message ?? `LinkedIn error ${res.status}`)
    return { success: true, platform: 'linkedin', platformPostId: data.id }
  }

  private async publishImage(
    tok: string, orgId: string, imageUrl: string, caption: string, title?: string
  ): Promise<PublishResult> {
    // Step 1: register image upload
    const uploadRes = await fetch(`${BASE}/assets?action=registerUpload`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${tok}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        registerUploadRequest: {
          owner: `urn:li:organization:${orgId}`,
          recipes: ['urn:li:digitalmediaRecipe:feedshare-image'],
          serviceRelationships: [{ identifier: 'urn:li:userGeneratedContent', relationshipType: 'OWNER' }],
        },
      }),
    })

    const uploadData = await uploadRes.json() as {
      value?: {
        uploadMechanism?: { 'com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest'?: { uploadUrl?: string } }
        asset?: string
      }
    }

    const uploadUrl = uploadData.value?.uploadMechanism?.['com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest']?.uploadUrl
    const assetUrn = uploadData.value?.asset

    if (!uploadUrl || !assetUrn) throw new Error('LinkedIn: no se pudo registrar el upload de imagen')

    // Step 2: upload binary from URL
    const imgRes = await fetch(imageUrl)
    const imgBytes = await imgRes.arrayBuffer()
    await fetch(uploadUrl, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${tok}` },
      body: imgBytes,
    })

    // Step 3: create post
    const body = {
      author: `urn:li:organization:${orgId}`,
      lifecycleState: 'PUBLISHED',
      specificContent: {
        'com.linkedin.ugc.ShareContent': {
          shareCommentary: { text: caption },
          shareMediaCategory: 'IMAGE',
          media: [{
            status: 'READY',
            description: { text: title ?? '' },
            media: assetUrn,
            title: { text: title ?? '' },
          }],
        },
      },
      visibility: { 'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC' },
    }

    const postRes = await fetch(`${BASE}/ugcPosts`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${tok}`, 'Content-Type': 'application/json', 'X-Restli-Protocol-Version': '2.0.0' },
      body: JSON.stringify(body),
    })

    const postData = await postRes.json() as { id?: string; message?: string }
    if (!postRes.ok) throw new Error(postData.message ?? `LinkedIn post error ${postRes.status}`)
    return { success: true, platform: 'linkedin', platformPostId: postData.id }
  }

  private async publishVideo(
    tok: string, orgId: string, videoUrl: string, caption: string
  ): Promise<PublishResult> {
    // LinkedIn video upload follows same register → upload → post flow
    // For now post as a link share pointing to the video URL
    const body = {
      author: `urn:li:organization:${orgId}`,
      lifecycleState: 'PUBLISHED',
      specificContent: {
        'com.linkedin.ugc.ShareContent': {
          shareCommentary: { text: caption },
          shareMediaCategory: 'ARTICLE',
          media: [{
            status: 'READY',
            originalUrl: videoUrl,
          }],
        },
      },
      visibility: { 'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC' },
    }

    const res = await fetch(`${BASE}/ugcPosts`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${tok}`, 'Content-Type': 'application/json', 'X-Restli-Protocol-Version': '2.0.0' },
      body: JSON.stringify(body),
    })

    const data = await res.json() as { id?: string; message?: string }
    if (!res.ok) throw new Error(data.message ?? `LinkedIn video error ${res.status}`)
    return { success: true, platform: 'linkedin', platformPostId: data.id }
  }
}
