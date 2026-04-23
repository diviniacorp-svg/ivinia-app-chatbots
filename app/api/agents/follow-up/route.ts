import { NextRequest, NextResponse } from 'next/server'
import { generateFollowUp } from '@/agents/comercial/follow-up'
import { createAdminClient } from '@/lib/supabase'
import type { Lead } from '@/agents/comercial/types'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { lead_id, company_name, rubro, city, phone, stage, dias_sin_respuesta, contexto } = body

    if (!company_name || !rubro) {
      return NextResponse.json({ error: 'company_name y rubro son requeridos' }, { status: 400 })
    }

    const lead: Lead = {
      id: lead_id,
      company_name,
      rubro,
      city,
      phone,
      stage: stage || 'propuesta_enviada',
      score: 0,
      source: 'manual',
    }

    const result = await generateFollowUp(lead, dias_sin_respuesta || 2, contexto)

    // Log en agent_runs (non-blocking)
    if (lead_id) {
      const db = createAdminClient()
      Promise.resolve(
        db.from('agent_runs').insert({
          agent: 'follow-up', department: 'clientes',
          action: `Follow-up para ${company_name} (${dias_sin_respuesta || 2} días sin respuesta)`,
          status: 'success',
          metadata: { lead_id, tono: result.tono },
        })
      ).catch(() => {})
    }

    return NextResponse.json({ ok: true, ...result })
  } catch (err) {
    console.error('[follow-up]', err)
    return NextResponse.json({ error: 'Error generando follow-up' }, { status: 500 })
  }
}
