import { NextRequest, NextResponse } from 'next/server'
import { calificarLead } from '@/lib/anthropic'
import { createAdminClient } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  const t0 = Date.now()
  try {
    const body = await req.json()
    const { lead_id, company_name, rubro, city, phone, email, website, instagram, notes } = body

    if (!company_name || !rubro || !city) {
      return NextResponse.json({ error: 'Faltan datos del lead' }, { status: 400 })
    }

    const result = await calificarLead({ company_name, rubro, city, phone, email, website, instagram, notes })

    const db = createAdminClient()
    // Actualizar el lead en Supabase si tiene ID
    if (lead_id) {
      await db.from('leads').update({
        score: result.score,
        notes: `[IA] ${result.razon}\n\nDolor: ${result.dolor_principal}\n\nPróxima acción: ${result.proxima_accion}${notes ? `\n\n---\n${notes}` : ''}`,
        updated_at: new Date().toISOString(),
      }).eq('id', lead_id)
    }

    Promise.resolve(db.from('agent_runs').insert({
      agent: 'calificador-leads', department: 'clientes',
      action: `Calificó ${company_name} (${rubro}) → score ${result.score}`,
      status: 'success', duration_ms: Date.now() - t0,
      metadata: { score: result.score, lead_id },
    })).catch(() => {})

    return NextResponse.json({ ok: true, ...result })
  } catch (err) {
    console.error('[qualify]', err)
    return NextResponse.json({ error: 'Error del agente calificador' }, { status: 500 })
  }
}
