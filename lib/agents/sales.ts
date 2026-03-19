import { createAdminClient } from '@/lib/supabase'
import { generateOutreachEmail } from '@/lib/claude'
import { sendOutreachEmail } from '@/lib/resend'
import { BaseAgent } from './base-agent'
import type { AgentResult } from './types'

export class SalesAgent extends BaseAgent {
  constructor() { super('sales') }

  async run(params: { limit?: number } = {}): Promise<AgentResult> {
    await this.logStart()
    try {
      const db = createAdminClient()
      const { data: leads } = await db
        .from('leads')
        .select('*')
        .eq('status', 'new')
        .eq('outreach_sent', false)
        .neq('email', '')
        .limit(params.limit ?? 5)

      if (!leads?.length) {
        await this.logComplete({ sent: 0 })
        return { success: true, message: 'No hay leads nuevos con email para contactar.', data: { sent: 0 } }
      }

      await this.logProgress('sending_emails', { total: leads.length })
      let sent = 0
      for (const lead of leads) {
        try {
          const { subject, body } = await generateOutreachEmail({
            companyName: lead.company_name,
            rubro: lead.rubro,
            city: lead.city,
            website: lead.website,
            contactName: lead.contact_name,
          })
          await sendOutreachEmail({ to: lead.email, subject, body })
          await db.from('leads').update({
            outreach_sent: true,
            status: 'contacted',
            notes: `Email enviado el ${new Date().toLocaleDateString('es-AR')}`,
          }).eq('id', lead.id)
          sent++
        } catch {
          // Continuar con el siguiente lead
        }
      }

      const result = { sent, total: leads.length }
      await this.logComplete(result)
      return {
        success: true,
        message: `Envié emails a ${sent} de ${leads.length} leads.`,
        data: result,
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error desconocido'
      await this.logError(msg)
      return { success: false, message: `Error en campaña de ventas: ${msg}` }
    }
  }
}
