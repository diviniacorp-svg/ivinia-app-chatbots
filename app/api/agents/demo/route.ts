import { NextRequest, NextResponse } from 'next/server'
import { getDemoRecommendation } from '@/agents/turnero/demo-advisor'
import { createAdminClient } from '@/lib/supabase'
import type { RubroTurnero } from '@/agents/turnero/types'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { lead_id, company_name, rubro, city, nota } = body

    if (!company_name || !rubro) {
      return NextResponse.json({ error: 'company_name y rubro son requeridos' }, { status: 400 })
    }

    const result = await getDemoRecommendation({
      company_name,
      rubro: rubro as RubroTurnero,
      city,
      nota,
    })

    if (lead_id) {
      const db = createAdminClient()
      Promise.resolve(
        db.from('agent_runs').insert({
          agent: 'demo-advisor', department: 'clientes',
          action: `Demo advisor para ${company_name} (${rubro})`,
          status: 'success',
          metadata: { lead_id, demo_url: result.demo_url },
        })
      ).catch(() => {})
    }

    return NextResponse.json({ ok: true, ...result })
  } catch (err) {
    console.error('[demo]', err)
    return NextResponse.json({ error: 'Error generando recomendación de demo' }, { status: 500 })
  }
}
