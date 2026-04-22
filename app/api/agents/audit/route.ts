import { NextRequest, NextResponse } from 'next/server'
import { auditarNegocio } from '@/lib/anthropic'
import { createAdminClient } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { company_name, rubro, city, website, instagram, facebook, google_maps, notas_adicionales, save_as_lead } = body

    if (!company_name || !rubro || !city) {
      return NextResponse.json({ error: 'Faltan datos del negocio' }, { status: 400 })
    }

    const result = await auditarNegocio({ company_name, rubro, city, website, instagram, facebook, google_maps, notas_adicionales })

    // Si save_as_lead=true, guardar como lead en Supabase
    if (save_as_lead) {
      const db = createAdminClient()
      await db.from('leads').insert({
        company_name,
        rubro,
        city: city || 'San Luis',
        website: website || null,
        instagram: instagram || null,
        score: result.score_general,
        status: 'nuevo',
        notes: `[AUDITORÍA IA]\nScore general: ${result.score_general}/100\n\n${result.resumen_ejecutivo}\n\nPrioridad alta: ${result.recomendaciones.filter(r => r.prioridad === 'alta').map(r => r.accion).join(', ')}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
    }

    return NextResponse.json({ ok: true, ...result })
  } catch (err) {
    console.error('[audit]', err)
    return NextResponse.json({ error: 'Error del agente de auditoría' }, { status: 500 })
  }
}
