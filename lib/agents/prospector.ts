import { createAdminClient } from '@/lib/supabase'
import { scrapeLeads } from '@/lib/apify'
import { BaseAgent } from './base-agent'
import type { AgentResult } from './types'

export interface ProspectorParams {
  rubro: string
  ciudad: string
  limit?: number
}

export class ProspectorAgent extends BaseAgent {
  constructor() { super('prospector') }

  async run(params: ProspectorParams = { rubro: 'negocios', ciudad: 'San Luis' }): Promise<AgentResult> {
    await this.logStart()
    try {
      await this.logProgress('scraping_leads', params)
      const leads = await scrapeLeads(params.rubro, params.ciudad, params.limit ?? 20)

      await this.logProgress('saving_leads', { count: leads.length })
      const db = createAdminClient()
      let saved = 0
      for (const lead of leads) {
        const { error } = await db.from('leads').upsert(
          { ...lead, status: 'new', source: 'apify', outreach_sent: false },
          { onConflict: 'company_name,city' }
        )
        if (!error) saved++
      }

      const result = { found: leads.length, saved, rubro: params.rubro, ciudad: params.ciudad }
      await this.logComplete(result)
      return {
        success: true,
        message: `Encontré ${leads.length} leads de ${params.rubro} en ${params.ciudad}. Guardé ${saved} nuevos.`,
        data: result,
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error desconocido'
      await this.logError(msg)
      return { success: false, message: `Error buscando leads: ${msg}` }
    }
  }
}
