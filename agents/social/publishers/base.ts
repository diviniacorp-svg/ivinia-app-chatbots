// ============================================================
// DIVINIA Social Agency — Publisher Registry
// Lazy-loads each platform publisher on demand
// ============================================================

import type { BasePublisher, Platform } from '../types'

export async function getPublisher(platform: Platform): Promise<BasePublisher> {
  switch (platform) {
    case 'instagram': {
      const { InstagramPublisher } = await import('./instagram')
      return new InstagramPublisher()
    }
    case 'tiktok': {
      const { TikTokPublisher } = await import('./tiktok')
      return new TikTokPublisher()
    }
    case 'linkedin': {
      const { LinkedInPublisher } = await import('./linkedin')
      return new LinkedInPublisher()
    }
    default:
      throw new Error(`Publisher para ${platform} no implementado aún. Plataformas disponibles: instagram, tiktok, linkedin`)
  }
}
