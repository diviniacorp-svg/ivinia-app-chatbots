import { createAdminClient } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const db = createAdminClient()
    const today = new Date().toISOString().split('T')[0]
    const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString()

    const [
      leadsResult,
      clientsResult,
      subsResult,
      bookingsResult,
      contentResult,
      agentResult,
    ] = await Promise.all([
      db.from('leads').select('id, status, score, created_at'),
      db.from('clients').select('id, status, mrr, plan, created_at'),
      db.from('subscriptions').select('id, estado, monto_ars'),
      db.from('bookings').select('id, created_at, status').gte('created_at', today + 'T00:00:00'),
      db.from('content_calendar').select('id, status, fecha').gte('fecha', today),
      db.from('agent_runs').select('id, status, created_at').gte('created_at', weekAgo),
    ])

    const leads = leadsResult.data ?? []
    const clients = clientsResult.data ?? []
    const subs = subsResult.data ?? []
    const bookings = bookingsResult.data ?? []
    const content = contentResult.data ?? []
    const agentRuns = agentResult.data ?? []

    // Lead metrics
    const leads_nuevos = leads.filter(l => l.created_at >= weekAgo).length
    const leads_activos = leads.filter(l => !['closed', 'lost', 'perdido'].includes(l.status)).length
    const leads_calientes = leads.filter(l => (l.score || 0) >= 70 && !['closed', 'lost'].includes(l.status)).length

    // Client metrics
    const clientes_activos = clients.filter(c => c.status === 'active').length
    const en_trial = clients.filter(c => c.status === 'trial').length

    // MRR: suma de MRR de clientes activos + suscripciones activas
    const mrr_clientes = clients
      .filter(c => c.status === 'active')
      .reduce((s, c) => s + (c.mrr || 0), 0)
    const mrr_subs = subs
      .filter(s => s.estado === 'active' || s.estado === 'authorized')
      .reduce((s, sub) => s + (sub.monto_ars || 0), 0)
    const mrr_actual = mrr_clientes + mrr_subs

    // Bookings hoy
    const reservas_hoy = bookings.filter(b => b.status !== 'cancelled').length

    // Contenido pendiente hoy/mañana
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    const tomorrowStr = tomorrow.toISOString().split('T')[0]
    const contenido_pendiente = content.filter(c =>
      c.status === 'borrador' && (c.fecha === today || c.fecha === tomorrowStr)
    ).length

    // Agentes — errores esta semana
    const agent_errors = agentRuns.filter(r => r.status === 'error').length
    const agent_runs_week = agentRuns.length

    return NextResponse.json({
      leads_nuevos,
      leads_activos,
      leads_calientes,
      clientes_activos,
      en_trial,
      mrr_actual,
      reservas_hoy,
      contenido_pendiente,
      agent_runs_week,
      agent_errors,
      updated_at: new Date().toISOString(),
    })
  } catch (e) {
    console.error('[ceo-metrics]', e)
    return NextResponse.json({
      leads_nuevos: 0, leads_activos: 0, leads_calientes: 0,
      clientes_activos: 0, en_trial: 0, mrr_actual: 0,
      reservas_hoy: 0, contenido_pendiente: 0,
      agent_runs_week: 0, agent_errors: 0,
    })
  }
}
