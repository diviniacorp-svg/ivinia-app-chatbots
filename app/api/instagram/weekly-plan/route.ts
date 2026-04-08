import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import { generateFullWeekPlan } from '@/agents/content/content-pipeline'
import type { WeeklyInput } from '@/agents/content/content-pipeline'

export const dynamic = 'force-dynamic'

const PLANS_DIR = path.join(process.cwd(), 'content', 'plans')

function ensurePlansDir() {
  if (!fs.existsSync(PLANS_DIR)) {
    fs.mkdirSync(PLANS_DIR, { recursive: true })
  }
}

function planPath(weekNumber: number) {
  return path.join(PLANS_DIR, `week-${weekNumber}.json`)
}

function readCachedPlan(weekNumber: number) {
  const filePath = planPath(weekNumber)
  if (!fs.existsSync(filePath)) return null
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'))
}

function writePlan(weekNumber: number, plan: object) {
  ensurePlansDir()
  fs.writeFileSync(planPath(weekNumber), JSON.stringify(plan, null, 2), 'utf-8')
}

// GET /api/instagram/weekly-plan?week=1
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const weekParam = searchParams.get('week')

    if (!weekParam) {
      return NextResponse.json({ error: 'Parámetro "week" es requerido' }, { status: 400 })
    }

    const weekNumber = parseInt(weekParam, 10)
    if (isNaN(weekNumber) || weekNumber < 1) {
      return NextResponse.json({ error: '"week" debe ser un número entero positivo' }, { status: 400 })
    }

    const cached = readCachedPlan(weekNumber)
    if (cached) {
      return NextResponse.json({ plan: cached, cached: true })
    }

    // No existe en caché — generar con defaults conservadores
    const input: WeeklyInput = {
      weekNumber,
      salesGoal: 2,
    }

    const plan = await generateFullWeekPlan(input)
    writePlan(weekNumber, plan)

    return NextResponse.json({ plan, cached: false })
  } catch (error) {
    console.error('[Weekly Plan GET] Error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error interno' },
      { status: 500 }
    )
  }
}

// POST /api/instagram/weekly-plan
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { weekNumber, salesGoal, focusRubro, previousWeekPerformance } = body

    if (!weekNumber || typeof weekNumber !== 'number') {
      return NextResponse.json({ error: '"weekNumber" es requerido y debe ser un número' }, { status: 400 })
    }

    if (!salesGoal || typeof salesGoal !== 'number' || salesGoal < 1) {
      return NextResponse.json({ error: '"salesGoal" es requerido y debe ser un número mayor a 0' }, { status: 400 })
    }

    const input: WeeklyInput = {
      weekNumber,
      salesGoal,
      focusRubro,
      previousWeekPerformance,
    }

    const plan = await generateFullWeekPlan(input)
    writePlan(weekNumber, plan)

    return NextResponse.json({ plan })
  } catch (error) {
    console.error('[Weekly Plan POST] Error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error interno' },
      { status: 500 }
    )
  }
}
