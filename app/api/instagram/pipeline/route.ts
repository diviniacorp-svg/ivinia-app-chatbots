// ============================================================
// POST /api/instagram/pipeline
// Ejecuta el pipeline completo: Estratega → Creador → Selector
//
// Body: { month: "2026-04", focusRubro?: string }
// Devuelve: PipelineResult con todos los posts aprobados
// ============================================================

import { NextRequest, NextResponse } from 'next/server'
import { runMonthlyPipeline, runSinglePostPipeline } from '@/agents/instagram/content-pipeline'
import type { CalendarEntry } from '@/agents/instagram/types'

export const dynamic = 'force-dynamic'
export const maxDuration = 300 // 5 min — el pipeline procesa ~20 posts

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { month, focusRubro, action, entry, existingCaptions } = body

    if (!month) {
      return NextResponse.json({ error: 'month es requerido (ej: "2026-04")' }, { status: 400 })
    }

    // Modo: regenerar un post individual
    if (action === 'single' && entry) {
      const result = await runSinglePostPipeline(entry as CalendarEntry, existingCaptions || [])
      return NextResponse.json({ post: result })
    }

    // Modo: pipeline completo del mes
    const result = await runMonthlyPipeline({
      month,
      focusRubro,
      onProgress: (_step, _current, _total) => {
        // Progress tracking — se puede conectar a Server-Sent Events en el futuro
      },
    })

    return NextResponse.json(result)

  } catch (err) {
    console.error('[Pipeline API]', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Error interno del pipeline' },
      { status: 500 }
    )
  }
}

// GET: estado del pipeline (por ahora devuelve info básica)
export async function GET() {
  return NextResponse.json({
    status: 'ready',
    description: 'Pipeline de contenido: Estratega → Creador → Selector',
    agents: ['content-planner', 'content-creator', 'content-selector'],
    estimatedTime: '3-5 minutos para 20 posts',
    endpoint: 'POST /api/instagram/pipeline',
    body: { month: 'string (ej: "2026-04")', focusRubro: 'string (opcional)' },
  })
}
