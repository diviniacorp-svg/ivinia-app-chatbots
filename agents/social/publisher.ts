// ============================================================
// DIVINIA Social Agency — Multi-Platform Publisher Orchestrator
// Publishes a post to all configured platforms and updates DB
// ============================================================

import { createAdminClient } from '@/lib/supabase'
import { getCredentials } from './credentials'
import { getPublisher } from './publishers/base'
import type { SocialPost, MultiPublishResult } from './types'

export async function publishToAllPlatforms(post: SocialPost): Promise<MultiPublishResult> {
  const db = createAdminClient()
  const start = Date.now()
  const results = []

  for (const platform of post.platforms) {
    try {
      const credentials = await getCredentials(post.socialClientId, platform)
      const publisher = await getPublisher(platform)
      const result = await publisher.publish(post, credentials)
      results.push(result)

      if (result.success && result.platformPostId && post.id) {
        // Fetch current platform_post_ids and merge
        const { data: current } = await db
          .from('content_calendar')
          .select('platform_post_ids')
          .eq('id', post.id)
          .single()

        const ids = (current?.platform_post_ids ?? {}) as Record<string, string>
        ids[platform] = result.platformPostId

        await db.from('content_calendar').update({
          platform_post_ids: ids,
          published_at: new Date().toISOString(),
        }).eq('id', post.id)
      }
    } catch (err) {
      results.push({
        success: false,
        platform,
        error: err instanceof Error ? err.message : 'Error desconocido',
      })
    }
  }

  const successCount = results.filter(r => r.success).length
  const publishedPlatforms = results.filter(r => r.success).map(r => r.platform)
  const failedPlatforms = results.filter(r => !r.success).map(r => r.platform)

  if (post.id) {
    const newStatus = successCount > 0 ? 'publicado' : 'fallido'
    await db.from('content_calendar').update({
      status: newStatus,
      published_platforms: publishedPlatforms,
      failed_platforms: failedPlatforms,
      updated_at: new Date().toISOString(),
    }).eq('id', post.id)
  }

  // Log to social_agent_logs
  await db.from('social_agent_logs').insert({
    social_client_id: post.socialClientId,
    agent: 'publisher',
    action: 'publish_post',
    status: successCount > 0 ? 'ok' : 'error',
    payload: {
      post_id: post.id,
      titulo: post.titulo,
      platforms: post.platforms,
      results: results.map(r => ({ platform: r.platform, ok: r.success, error: r.error })),
    },
    duration_ms: Date.now() - start,
  })

  return {
    postId: post.id ?? '',
    results,
    successCount,
    failCount: results.length - successCount,
  }
}
