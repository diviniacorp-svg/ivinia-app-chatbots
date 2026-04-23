import { NextRequest, NextResponse } from 'next/server'
import { scoreLead } from '@/agents/comercial/lead-scorer'
import { createAdminClient } from '@/lib/supabase'
import type { Lead } from '@/agents/comercial/types'

export async function POST(req: NextRequest) {
  const t0 = Date.now()
  try {
    const body = await req.json()
    const { lead_id, company_name, rubro, city, phone, email, website, instagram, notes } = body

    if (!company_name || !rubro) {
      return NextResponse.json({ error: 'Faltan datos del lead' }, { status: 400 })
    }

    const lead: Lead = {
      id: lead_id,
      company_name, rubro,
      city: city || 'San Luis',
      phone, email, website, instagram,
      notes, stage: 'nuevo', source: 'manual', score: 0,
    }

    // Scoring combinado: 60% IA (Claude Haiku) + 40% reglas locales por rubro/fuente
    const result = await scoreLead(lead)

    const db = createAdminClient()
    if (lead_id) {
      await db.from('leads').update({
        score: result.score,
        notes: `[IA ${result.nivel}] ${result.razones[0]}\n\nDolor: ${result.dolor_principal}\n\nPróxima acción: ${result.proxima_accion}${notes ? `\n\n---\n${notes}` : ''}`,
        updated_at: new Date().toISOString(),
      }).eq('id', lead_id)
    }

    Promise.resolve(db.from('agent_runs').insert({
      agent: 'calificador-leads', department: 'clientes',
      action: `Calificó ${company_name} (${rubro}) → score ${result.score} [${result.nivel}]`,
      status: 'success', duration_ms: Date.now() - t0,
      metadata: { score: result.score, nivel: result.nivel, lead_id },
    })).catch(() => {})

    return NextResponse.json({
      ok: true,
      score: result.score,
      nivel: result.nivel,
      razon: result.razones[0],
      dolor_principal: result.dolor_principal,
      servicio_recomendado: result.servicio_recomendado,
      precio_estimado: result.precio_estimado,
      proxima_accion: result.proxima_accion,
      mensaje_wa: result.mensaje_wa,
    })
  } catch (err) {
    console.error('[qualify]', err)
    return NextResponse.json({ error: 'Error del agente calificador' }, { status: 500 })
  }
}
