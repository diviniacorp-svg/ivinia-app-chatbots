import { NextRequest, NextResponse } from 'next/server'
import { planMonth, planWeek } from '@/agents/instagram/content-planner'
import type { MarketResearch } from '@/agents/instagram/types'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const { month, rubro, research, weekNumber } = await req.json()

    if (!month) {
      return NextResponse.json({ error: 'month es requerido (formato: "2025-04")' }, { status: 400 })
    }

    if (weekNumber) {
      // Planificación semanal
      const posts = await planWeek(weekNumber, month)
      return NextResponse.json({ posts })
    }

    // Planificación mensual
    const calendar = await planMonth(month, research as MarketResearch | undefined, rubro)
    return NextResponse.json({ calendar })
  } catch (error) {
    console.error('[Instagram Plan] Error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error interno' },
      { status: 500 }
    )
  }
}
