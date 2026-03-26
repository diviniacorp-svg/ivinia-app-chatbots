import { createAdminClient } from '@/lib/supabase'
import { BaseAgent } from './base-agent'
import type { AgentResult } from './types'

export class ReporterAgent extends BaseAgent {
  constructor() { super('reporter') }

  async run(): Promise<AgentResult> {
    await this.logStart()
    try {
      const db = createAdminClient()
      const today = new Date().toISOString().split('T')[0]
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

      const [
        { data: clients },
        { data: leads },
        { data: configs },
        { data: recentAppointments },
      ] = await Promise.all([
        db.from('clients').select('status, plan, trial_end, created_at'),
        db.from('leads').select('status, outreach_sent, created_at, score'),
        db.from('booking_configs').select('is_active, client_id'),
        db.from('appointments').select('status, created_at').gte('created_at', weekAgo),
      ])

      // Clients breakdown
      const totalClients = clients?.length ?? 0
      const activeClients = clients?.filter(c => c.status === 'active').length ?? 0
      const trialClients = clients?.filter(c => c.status === 'trial').length ?? 0
      const expiringIn3 = clients?.filter(c => {
        if (c.status !== 'trial' || !c.trial_end) return false
        const daysLeft = Math.ceil((new Date(c.trial_end).getTime() - Date.now()) / 86400000)
        return daysLeft >= 0 && daysLeft <= 3
      }).length ?? 0

      // Leads breakdown
      const totalLeads = leads?.length ?? 0
      const newLeads = leads?.filter(l => l.status === 'new').length ?? 0
      const contactedLeads = leads?.filter(l => l.outreach_sent).length ?? 0
      const highScoreLeads = leads?.filter(l => (l.score ?? 0) >= 70).length ?? 0
      const newThisWeek = leads?.filter(l => l.created_at >= weekAgo).length ?? 0

      // Turnos
      const activeTurnos = configs?.filter(c => c.is_active).length ?? 0
      const appointmentsThisWeek = recentAppointments?.length ?? 0
      const pendingAppts = recentAppointments?.filter(a => a.status === 'pending').length ?? 0

      const report = {
        clients: { total: totalClients, active: activeClients, trial: trialClients, expiring_soon: expiringIn3 },
        leads: { total: totalLeads, new: newLeads, contacted: contactedLeads, high_score: highScoreLeads, new_this_week: newThisWeek },
        turnos: { active_configs: activeTurnos, appointments_this_week: appointmentsThisWeek, pending: pendingAppts },
        generated_at: today,
      }

      await this.logComplete(report)

      const summary = [
        `📊 **REPORTE DIVINIA — ${today}**`,
        ``,
        `👥 **Clientes:** ${totalClients} total · ${activeClients} activos · ${trialClients} en trial`,
        expiringIn3 > 0 ? `⚠️ ${expiringIn3} trial(s) vencen en 3 días` : `✅ Sin trials urgentes`,
        ``,
        `🎯 **Leads:** ${totalLeads} total · ${newLeads} sin contactar · ${contactedLeads} contactados`,
        `📈 ${highScoreLeads} leads con score ≥ 70 · ${newThisWeek} nuevos esta semana`,
        ``,
        `📅 **Turnos:** ${activeTurnos} sistemas activos · ${appointmentsThisWeek} turnos esta semana`,
        pendingAppts > 0 ? `⏳ ${pendingAppts} solicitudes pendientes de aprobar` : ``,
      ].filter(Boolean).join('\n')

      return { success: true, message: summary, data: report }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error desconocido'
      await this.logError(msg)
      return { success: false, message: `Error generando reporte: ${msg}` }
    }
  }
}
