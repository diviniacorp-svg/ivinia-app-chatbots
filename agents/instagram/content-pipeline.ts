// ============================================================
// DIVINIA — Content Pipeline
// Orquesta: Estratega → Creador → Selector
// Produce posts de alta calidad listos para publicar
// ============================================================

import Anthropic from '@anthropic-ai/sdk'
import { planMonth } from './content-planner'
import { generateCaptions } from './content-creator'
import { selectBestVariant } from './content-selector'
import type { CalendarEntry, ContentCalendar, Rubro } from './types'
import type { SelectionResult } from './content-selector'

export interface PipelinePost {
  entry: CalendarEntry
  selectionResult: SelectionResult
  finalCaption: string         // winner o improvedCaption si existía
  finalHashtags: string[]
  canvaPrompt: string
  qualityScore: number
  status: 'aprobado' | 'rechazado' | 'en_revision'
  rejectionReason?: string
}

export interface PipelineResult {
  month: string
  generatedAt: Date
  totalPosts: number
  approved: number
  rejected: number
  avgQualityScore: number
  posts: PipelinePost[]
  rejectedPosts: PipelinePost[]
  strategicSummary: string
}

export interface PipelineOptions {
  month: string               // "2026-04"
  focusRubro?: string
  postsPerWeek?: number       // default 5
  onProgress?: (step: string, current: number, total: number) => void
}

function getClient(): Anthropic {
  return new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
}

// Pipeline completo: planifica + crea + selecciona todo el mes
export async function runMonthlyPipeline(options: PipelineOptions): Promise<PipelineResult> {
  const { month, focusRubro, onProgress } = options
  const approvedCaptions: string[] = []

  // PASO 1 — Estratega: genera el calendario del mes
  onProgress?.('estratega', 0, 1)
  const calendar: ContentCalendar = await planMonth(month, undefined, focusRubro)
  onProgress?.('estratega', 1, 1)

  const posts: PipelinePost[] = []
  const rejectedPosts: PipelinePost[] = []
  const total = calendar.posts.length

  // PASO 2 + 3 — Para cada entrada: Creador → Selector
  for (let i = 0; i < calendar.posts.length; i++) {
    const entry = calendar.posts[i]
    onProgress?.(`post-${i + 1}`, i, total)

    try {
      // Creador: genera 3 variantes
      const variants = await generateCaptions(
        entry.idea,
        entry.rubro as Rubro | 'general',
        entry.postType,
        entry.format
      )

      // Selector: elige la mejor con control de calidad
      const selectionResult = await selectBestVariant(
        variants,
        entry,
        approvedCaptions
      )

      // Usa caption mejorado si existe, sino el ganador directo
      const finalCaption = selectionResult.improvedCaption || selectionResult.winnerCaption
      const qualityScore = selectionResult.evaluations
        .find(e => e.variant === selectionResult.winner)
        ?.criteria.totalScore ?? 0

      const pipelinePost: PipelinePost = {
        entry,
        selectionResult,
        finalCaption,
        finalHashtags: selectionResult.winnerHashtags,
        canvaPrompt: selectionResult.winnerCanvaPrompt,
        qualityScore,
        status: selectionResult.qualityApproved ? 'aprobado' : 'rechazado',
        rejectionReason: selectionResult.rejectionReason ?? undefined,
      }

      if (selectionResult.qualityApproved) {
        posts.push(pipelinePost)
        approvedCaptions.push(finalCaption)
      } else {
        rejectedPosts.push(pipelinePost)
      }

    } catch (err) {
      console.error(`Pipeline error en post ${i + 1}:`, err)
      // Si falla, agregamos un post en revisión con los datos básicos
      const fallbackPost: PipelinePost = {
        entry,
        selectionResult: {
          winner: 'A',
          winnerCaption: entry.captionDraft,
          winnerHashtags: entry.hashtags,
          winnerCanvaPrompt: entry.canvaPrompt,
          evaluations: [],
          selectionReasoning: 'Error en pipeline - caption del planificador usado como fallback',
          qualityApproved: false,
          rejectionReason: 'Error técnico en el pipeline',
        },
        finalCaption: entry.captionDraft,
        finalHashtags: entry.hashtags,
        canvaPrompt: entry.canvaPrompt,
        qualityScore: 0,
        status: 'en_revision',
        rejectionReason: `Error técnico: ${err instanceof Error ? err.message : 'desconocido'}`,
      }
      rejectedPosts.push(fallbackPost)
    }
  }

  // PASO 4 — Resumen estratégico
  const strategicSummary = await generateStrategicSummary(posts, month, getClient())

  const avgQualityScore = posts.length > 0
    ? posts.reduce((sum, p) => sum + p.qualityScore, 0) / posts.length
    : 0

  return {
    month,
    generatedAt: new Date(),
    totalPosts: calendar.posts.length,
    approved: posts.length,
    rejected: rejectedPosts.length,
    avgQualityScore: Math.round(avgQualityScore * 10) / 10,
    posts,
    rejectedPosts,
    strategicSummary,
  }
}

// Pipeline para un post individual (útil para regenerar posts rechazados)
export async function runSinglePostPipeline(
  entry: CalendarEntry,
  existingApprovedCaptions: string[] = []
): Promise<PipelinePost> {
  const variants = await generateCaptions(
    entry.idea,
    entry.rubro as Rubro | 'general',
    entry.postType,
    entry.format
  )

  const selectionResult = await selectBestVariant(variants, entry, existingApprovedCaptions)

  const finalCaption = selectionResult.improvedCaption || selectionResult.winnerCaption
  const qualityScore = selectionResult.evaluations
    .find(e => e.variant === selectionResult.winner)
    ?.criteria.totalScore ?? 0

  return {
    entry,
    selectionResult,
    finalCaption,
    finalHashtags: selectionResult.winnerHashtags,
    canvaPrompt: selectionResult.winnerCanvaPrompt,
    qualityScore,
    status: selectionResult.qualityApproved ? 'aprobado' : 'rechazado',
    rejectionReason: selectionResult.rejectionReason ?? undefined,
  }
}

async function generateStrategicSummary(
  posts: PipelinePost[],
  month: string,
  client: Anthropic
): Promise<string> {
  if (posts.length === 0) return 'No se generaron posts aprobados este mes.'

  const postSummaries = posts.slice(0, 10).map((p, i) =>
    `${i + 1}. [${p.entry.postType}/${p.entry.rubro}] ${p.entry.idea} (score: ${p.qualityScore})`
  ).join('\n')

  const response = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 300,
    messages: [{
      role: 'user',
      content: `Resumí en 2-3 oraciones la estrategia de contenido del mes ${month} de DIVINIA basándote en estos posts:\n${postSummaries}\n\nRespondé en español argentino.`
    }]
  })

  return response.content[0].type === 'text' ? response.content[0].text : ''
}
