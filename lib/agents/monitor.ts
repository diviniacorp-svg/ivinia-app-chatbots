import { createAdminClient } from '@/lib/supabase'
import { BaseAgent } from './base-agent'
import type { AgentResult } from './types'

export class MonitorAgent extends BaseAgent {
  constructor() { super('monitor') }

  async run(): Promise<AgentResult> {
    await this.logStart()
    try {
      const db = createAdminClient()
      const now = new Date()
      const todayStr = now.toISOString().split('T')[0]
      const in3DaysStr = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

      const [{ data: expiringSoon }, { data: alreadyExpired }] = await Promise.all([
        db.from('clients')
          .select('id, company_name, contact_name, email, trial_end')
          .eq('status', 'trial')
          .gte('trial_end', todayStr)
          .lte('trial_end', in3DaysStr),
        db.from('clients')
          .select('id, company_name, contact_name, email, trial_end')
          .eq('status', 'trial')
          .lt('trial_end', todayStr),
      ])

      const result = {
        expiring_soon: expiringSoon?.length ?? 0,
        already_expired: alreadyExpired?.length ?? 0,
        expiring_list: expiringSoon?.map(c => ({ name: c.company_name, trial_end: c.trial_end })) ?? [],
        expired_list: alreadyExpired?.map(c => ({ name: c.company_name, trial_end: c.trial_end })) ?? [],
      }

      await this.logComplete(result)
      return {
        success: true,
        message: `${result.expiring_soon} trials vencen en 3 días. ${result.already_expired} ya vencieron y siguen activos.`,
        data: result,
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error desconocido'
      await this.logError(msg)
      return { success: false, message: `Error monitoreando: ${msg}` }
    }
  }
}
