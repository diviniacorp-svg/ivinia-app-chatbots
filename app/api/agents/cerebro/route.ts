import { NextRequest, NextResponse } from 'next/server'
import { CerebroAgent } from '@/lib/agents/cerebro'

export const dynamic = 'force-dynamic'
export const maxDuration = 120

// POST /api/agents/cerebro — activa el Cerebro CEO para el análisis diario
export async function POST(_req: NextRequest) {
  const startMs = Date.now()
  try {
    const cerebro = new CerebroAgent()
    const result = await cerebro.run()
    return NextResponse.json({
      ok: result.success,
      report: result.message,
      data: result.data,
      duration_ms: Date.now() - startMs,
    })
  } catch (err) {
    console.error('[cerebro]', err)
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : 'Error' },
      { status: 500 },
    )
  }
}

// GET — estado del agente (health check + último run)
export async function GET() {
  return NextResponse.json({
    agent: 'NUCLEUS Cerebro',
    model: 'claude-sonnet-4-6',
    tools: ['get_leads_stats', 'get_clients_stats', 'get_subscriptions_stats', 'get_agent_activity', 'get_pending_content', 'get_hot_leads_detail'],
    description: 'CEO autónomo de DIVINIA. Analiza estado y decide 3 prioridades del día.',
    trigger: 'POST /api/agents/cerebro',
  })
}
