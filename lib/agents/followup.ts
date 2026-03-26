import { createAdminClient } from '@/lib/supabase'
import { BaseAgent } from './base-agent'
import type { AgentResult } from './types'

export class FollowUpAgent extends BaseAgent {
  constructor() { super('followup') }

  async run(): Promise<AgentResult> {
    await this.logStart()
    try {
      const db = createAdminClient()
      const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()

      // Leads contactados hace +3 días que siguen en status 'contacted' (no avanzaron)
      const { data: staleLeads } = await db
        .from('leads')
        .select('id, company_name, contact_name, rubro, city, email, phone')
        .eq('status', 'contacted')
        .eq('outreach_sent', true)
        .lt('updated_at', threeDaysAgo)
        .limit(10)

      if (!staleLeads?.length) {
        await this.logComplete({ pending_followups: 0 })
        return {
          success: true,
          message: 'No hay leads con seguimiento pendiente por ahora.',
          data: { pending_followups: 0 },
        }
      }

      // Armar lista con mensajes de seguimiento sugeridos
      const suggestions = staleLeads.map(lead => ({
        name: lead.company_name,
        contact: lead.contact_name || 'el encargado',
        rubro: lead.rubro,
        city: lead.city,
        email: lead.email,
        phone: lead.phone,
        wa_link: lead.phone
          ? `https://wa.me/${lead.phone.replace(/\D/g, '')}?text=${encodeURIComponent(`Hola ${lead.contact_name || ''}! Soy Joaco de DIVINIA. Te escribí hace unos días sobre el chatbot para ${lead.company_name}. ¿Pudiste verlo? Quedé a disposición.`)}`
          : null,
      }))

      const result = {
        pending_followups: staleLeads.length,
        leads: suggestions,
      }

      await this.logComplete(result)

      const lines = [
        `**Seguimiento:** ${staleLeads.length} lead(s) sin respuesta hace +3 días:\n`,
        ...suggestions.map((l, i) =>
          `${i + 1}. **${l.name}** (${l.rubro}, ${l.city})` +
          (l.email ? ` — ${l.email}` : '') +
          (l.wa_link ? `\n   📱 [Escribir por WA](${l.wa_link})` : '')
        ),
      ]

      return {
        success: true,
        message: lines.join('\n'),
        data: result,
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error desconocido'
      await this.logError(msg)
      return { success: false, message: `Error en seguimiento: ${msg}` }
    }
  }
}
