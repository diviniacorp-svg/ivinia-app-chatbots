// ============================================================
// DIVINIA — Instagram Agent System — Tipos compartidos
// ============================================================

export type PostType = 'educativo' | 'demo' | 'testimonial' | 'oferta' | 'entretenimiento'
export type PostFormat = 'post' | 'reel' | 'story' | 'carrusel'
export type LeadStage = 'initial_contact' | 'qualification' | 'demo_sent' | 'proposal_sent' | 'negotiation' | 'closed' | 'lost'
export type Rubro = 'peluqueria' | 'estetica' | 'clinica' | 'consultorio' | 'veterinaria' | 'taller' | 'odontologia' | 'gimnasio' | 'farmacia' | 'general'

export interface InstagramPost {
  id?: string
  caption: string
  hashtags: string[]
  imageUrl?: string
  canvaDesignId?: string
  scheduledAt?: Date
  publishedAt?: Date
  rubro: Rubro | 'general'
  postType: PostType
  format: PostFormat
  status: 'draft' | 'scheduled' | 'published' | 'failed'
  igMediaId?: string
  metrics?: PostMetrics
}

export interface PostMetrics {
  likes: number
  comments: number
  shares: number
  saves: number
  reach: number
  impressions: number
}

export interface ContentCalendar {
  month: string // "2025-04"
  posts: CalendarEntry[]
}

export interface CalendarEntry {
  dayOfMonth: number
  dayOfWeek: string
  postType: PostType
  format: PostFormat
  rubro: Rubro | 'general'
  idea: string
  captionDraft: string
  hashtags: string[]
  canvaPrompt: string
  scheduledTime: string // "10:00"
  priority: 'alta' | 'media' | 'baja'
}

export interface InstagramLead {
  username: string
  message: string
  rubro?: Rubro
  score: number // 0-100
  stage: LeadStage
  detectedNeeds: string[]
  proposedPlan?: 'basico' | 'pro' | 'premium'
  proposedPrice?: number
  notes: string
  firstContactAt: Date
  lastMessageAt: Date
}

export interface Competitor {
  username: string
  estimatedFollowers: string
  avgLikes: string
  contentTypes: string[]
  postingFrequency: string
  strengths: string[]
  weaknesses: string[]
  topHashtags: string[]
}

export interface MarketResearch {
  analyzedAt: Date
  rubro: string
  competitors: Competitor[]
  trends: string[]
  bestHashtags: string[]
  bestPostTimes: string[]
  contentIdeas: string[]
  audienceInsights: string[]
  opportunities: string[]
}

export interface CaptionVariants {
  A: string
  B: string
  C: string
  hashtags: string[]
  canvaPrompt: string
}

// Precios del catálogo
export const PRICING = {
  basico: {
    name: 'Sistema de Turnos Básico',
    price: 150000,
    description: 'Agenda online 24hs + confirmaciones automáticas por WhatsApp',
    deliveryDays: 2,
  },
  pro: {
    name: 'Sistema de Turnos Pro',
    price: 250000,
    description: 'Todo el básico + recordatorios + gestión de múltiples profesionales + métricas',
    deliveryDays: 7,
  },
  premium: {
    name: 'Sistema Turnos + Chatbot IA',
    price: 350000,
    description: 'Todo el pro + chatbot IA integrado para atender consultas automáticamente',
    deliveryDays: 10,
  },
} as const
