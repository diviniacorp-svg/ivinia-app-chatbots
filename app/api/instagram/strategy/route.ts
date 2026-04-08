// ============================================================
// DIVINIA — API Route: Instagram Strategy Director
// Endpoints del orquestador estratégico de Instagram
// ============================================================

import { NextRequest, NextResponse } from 'next/server'
import {
  runWeeklyStrategy,
  analyzePerformance,
  generateContentBrief,
  decideBestPostTime,
  generateMonthlyReport,
  orchestrateFullPipeline,
} from '@/agents/instagram/strategy-director'
import type { InstagramPost, PostMetrics } from '@/agents/instagram/types'

export const dynamic = 'force-dynamic'

// ============================================================
// GET /api/instagram/strategy
// Devuelve el mejor horario para publicar ahora mismo
// ============================================================

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const contentType = searchParams.get('contentType') ?? undefined

    const recommendation = await decideBestPostTime(contentType)

    return NextResponse.json({ recommendation })
  } catch (error) {
    console.error('[Instagram Strategy - GET] Error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error interno al calcular horario' },
      { status: 500 }
    )
  }
}

// ============================================================
// POST /api/instagram/strategy
// Acciones estratégicas: weekly, brief, pipeline, report, performance
// ============================================================

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { action } = body

    if (!action) {
      return NextResponse.json(
        { error: 'El campo "action" es requerido. Opciones: weekly | brief | pipeline | report | performance' },
        { status: 400 }
      )
    }

    // --------------------------------------------------------
    // action: "weekly" → runWeeklyStrategy
    // Body: { action: "weekly", weekNumber?: number, month?: string }
    // --------------------------------------------------------
    if (action === 'weekly') {
      const { weekNumber, month } = body as {
        action: string
        weekNumber?: number
        month?: string
      }

      const plan = await runWeeklyStrategy(weekNumber, month)

      return NextResponse.json({
        success: true,
        action: 'weekly',
        plan,
      })
    }

    // --------------------------------------------------------
    // action: "brief" → generateContentBrief
    // Body: { action: "brief", rubro: string, objective: string }
    // --------------------------------------------------------
    if (action === 'brief') {
      const { rubro, objective } = body as {
        action: string
        rubro?: string
        objective?: string
      }

      if (!rubro || !objective) {
        return NextResponse.json(
          { error: 'Para action "brief" se requieren: rubro y objective' },
          { status: 400 }
        )
      }

      const brief = await generateContentBrief(rubro, objective)

      return NextResponse.json({
        success: true,
        action: 'brief',
        brief,
      })
    }

    // --------------------------------------------------------
    // action: "pipeline" → orchestrateFullPipeline
    // Body: { action: "pipeline", brief: string }
    // --------------------------------------------------------
    if (action === 'pipeline') {
      const { brief } = body as {
        action: string
        brief?: string
      }

      if (!brief) {
        return NextResponse.json(
          { error: 'Para action "pipeline" se requiere: brief (string con la descripción del post)' },
          { status: 400 }
        )
      }

      const output = await orchestrateFullPipeline(brief)

      return NextResponse.json({
        success: true,
        action: 'pipeline',
        output,
      })
    }

    // --------------------------------------------------------
    // action: "report" → generateMonthlyReport
    // Body: { action: "report", metrics: PostMetrics[], month?: string }
    // --------------------------------------------------------
    if (action === 'report') {
      const { metrics, month } = body as {
        action: string
        metrics?: PostMetrics[]
        month?: string
      }

      if (!metrics || !Array.isArray(metrics)) {
        return NextResponse.json(
          { error: 'Para action "report" se requiere: metrics (array de PostMetrics)' },
          { status: 400 }
        )
      }

      const report = await generateMonthlyReport(metrics, month)

      return NextResponse.json({
        success: true,
        action: 'report',
        report,
      })
    }

    // --------------------------------------------------------
    // action: "performance" → analyzePerformance
    // Body: { action: "performance", posts: InstagramPost[] }
    // --------------------------------------------------------
    if (action === 'performance') {
      const { posts } = body as {
        action: string
        posts?: InstagramPost[]
      }

      if (!posts || !Array.isArray(posts)) {
        return NextResponse.json(
          { error: 'Para action "performance" se requiere: posts (array de InstagramPost con metrics)' },
          { status: 400 }
        )
      }

      const insights = await analyzePerformance(posts)

      return NextResponse.json({
        success: true,
        action: 'performance',
        insights,
      })
    }

    // --------------------------------------------------------
    // Acción no reconocida
    // --------------------------------------------------------
    return NextResponse.json(
      {
        error: `Acción "${action}" no reconocida.`,
        availableActions: ['weekly', 'brief', 'pipeline', 'report', 'performance'],
      },
      { status: 400 }
    )
  } catch (error) {
    console.error('[Instagram Strategy - POST] Error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error interno del Strategy Director' },
      { status: 500 }
    )
  }
}
