// ============================================================
// DIVINIA Social Media Agency OS — Shared Types
// ============================================================

export type Platform = 'instagram' | 'tiktok' | 'linkedin' | 'twitter' | 'youtube' | 'facebook'
export const ALL_PLATFORMS: Platform[] = ['instagram', 'tiktok', 'linkedin', 'twitter', 'youtube', 'facebook']

export type ContentPillar = 'educativo' | 'entretenimiento' | 'venta' | 'comunidad' | 'detras_escena'
export type PostFormat = 'post' | 'reel' | 'story' | 'carrusel' | 'video' | 'shorts'
export type PostStatus = 'borrador' | 'planificado' | 'en_produccion' | 'aprobado' | 'listo' | 'publicado' | 'cancelado' | 'fallido'

export interface PlatformCredentials {
  platform: Platform
  accessToken: string
  refreshToken?: string
  accountId: string
  accountUsername?: string
  extraConfig?: Record<string, string>
}

export interface SocialClient {
  id: string
  clientId?: string
  nombre: string
  rubro: string
  brandVoice: BrandVoice
  contentStrategy: ContentStrategy
  isDivinia: boolean
  isActive: boolean
}

export interface BrandVoice {
  tono: string
  idioma: string
  palabrasProhibidas: string[]
  palabrasClave: string[]
  emojiLevel: 'ninguno' | 'moderado' | 'alto'
  target: string
  propuestaValor: string
}

export interface ContentStrategy {
  mix: ContentMix
  postingTimes: Partial<Record<Platform, string>>
  hashtagSets: Partial<Record<Platform, string[]>>
}

export interface ContentMix {
  educativo: number
  entretenimiento: number
  venta: number
  comunidad: number
}

export interface SocialPost {
  id?: string
  socialClientId: string
  fecha: string
  publishAt?: Date
  platforms: Platform[]
  plataforma: Platform
  tipo: PostFormat
  pilar: ContentPillar
  titulo?: string
  caption: string
  hashtags: string
  hashtagsArray?: string[]
  imagenUrl?: string
  videoUrl?: string
  coverUrl?: string
  audioUrl?: string
  carouselItems?: CarouselItem[]
  promptImagen?: string
  remotionComposition?: string
  remotionProps?: Record<string, unknown>
  status: PostStatus
  platformPostIds?: Record<string, string>
  publishedPlatforms?: Platform[]
  failedPlatforms?: Platform[]
  scoreCalidad?: number
  generadoPor: 'ia' | 'manual' | 'pipeline'
}

export interface CarouselItem {
  url: string
  caption?: string
  order: number
}

export interface PublishResult {
  success: boolean
  platform: Platform
  platformPostId?: string
  permalink?: string
  error?: string
}

export interface MultiPublishResult {
  postId: string
  results: PublishResult[]
  successCount: number
  failCount: number
}

export interface PostMetrics {
  postId: string
  platform: Platform
  platformPostId?: string
  fetchedAt: Date
  likes: number
  comments: number
  shares: number
  saves: number
  reach: number
  impressions: number
  plays?: number
  avgWatchTimeSeconds?: number
  completionRate?: number
  engagementRate?: number
}

export interface AccountMetrics {
  platform: Platform
  socialClientId: string
  period: 'day' | 'week' | 'month'
  followers: number
  followersGrowth: number
  totalReach: number
  totalImpressions: number
  avgEngagementRate: number
  topPosts: PostMetrics[]
  fetchedAt: Date
}

export interface CalendarEntry {
  dayOfMonth: number
  dayOfWeek: string
  fecha: string
  platforms: Platform[]
  pilar: ContentPillar
  formato: PostFormat
  idea: string
  captionDraft: string
  hashtags: string[]
  remotionComposition?: string
  scheduledTime: string
  priority: 'alta' | 'media' | 'baja'
}

export interface MonthlyCalendarPlan {
  socialClientId: string
  month: string
  generatedAt: Date
  posts: CalendarEntry[]
  strategicSummary: string
  contentMix: ContentMix
}

export interface MultiPlatformCaption {
  platform: Platform
  caption: string
  hashtags: string[]
  hook: string
  cta: string
  characterCount: number
}

export interface CaptionPackage {
  idea: string
  pilar: ContentPillar
  captions: MultiPlatformCaption[]
  freepikPrompt: string
  remotionComposition?: string
  remotionProps?: Record<string, unknown>
}

export interface WeeklyReport {
  socialClientId: string
  weekEnding: string
  generatedAt: Date
  byPlatform: Partial<Record<Platform, PlatformWeekSummary>>
  topPostId?: string
  insights: string[]
  nextWeekRecommendations: string[]
}

export interface PlatformWeekSummary {
  postsPublished: number
  totalReach: number
  totalImpressions: number
  avgEngagementRate: number
  followersEnd: number
  followersGrowth: number
}

export interface BasePublisher {
  platform: Platform
  publish(post: SocialPost, credentials: PlatformCredentials): Promise<PublishResult>
  publishCarousel?(items: CarouselItem[], caption: string, credentials: PlatformCredentials): Promise<PublishResult>
  getPostMetrics?(platformPostId: string, credentials: PlatformCredentials): Promise<PostMetrics>
  getAccountMetrics?(credentials: PlatformCredentials, period: 'day' | 'week' | 'month'): Promise<AccountMetrics>
}
