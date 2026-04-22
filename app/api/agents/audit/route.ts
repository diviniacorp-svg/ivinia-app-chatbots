import { NextRequest, NextResponse } from 'next/server'
import { auditarNegocio } from '@/lib/anthropic'
import { createAdminClient } from '@/lib/supabase'
import { sendAuditLeadNotification } from '@/lib/resend'

export async function POST(req: NextRequest) {
  const t0 = Date.now()
  try {
    const body = await req.json()
    const { company_name, rubro, city, website, instagram, facebook, google_maps, notas_adicionales, save_as_lead } = body

    if (!company_name || !rubro || !city) {
      return NextResponse.json({ error: 'Faltan datos del negocio' }, { status: 400 })
    }

    const result = await auditarNegocio({ company_name, rubro, city, website, instagram, facebook, google_maps, notas_adicionales })

    // Si save_as_lead=true, guardar como lead en Supabase + notificar a Joaco
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

      // Log de agent_run para NeuralGraph
      db.from('agent_runs').insert({
        agent: 'auditoria-digital', department: 'clientes',
        action: `Auditoría de ${company_name} (${rubro})`,
        status: 'success', duration_ms: Date.now() - t0,
        metadata: { score: result.score_general, rubro, city },
      }).then(() => {}).catch(() => {})

      // Notificación inmediata a Joaco por email
      sendAuditLeadNotification({
        company_name,
        rubro,
        city,
        score: result.score_general,
        resumen: result.resumen_ejecutivo,
        website: website || undefined,
        instagram: instagram || undefined,
        recomendaciones_top: result.recomendaciones
          .filter(r => r.prioridad === 'alta')
          .slice(0, 3)
          .map(r => r.accion),
      }).catch(() => {}) // fire-and-forget
    }

    return NextResponse.json({ ok: true, ...result })
  } catch (err) {
    console.error('[audit]', err)
    return NextResponse.json({ error: 'Error del agente de auditoría' }, { status: 500 })
  }
}
