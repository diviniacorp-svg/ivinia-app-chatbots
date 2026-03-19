import { createAdminClient } from '@/lib/supabase'
import type { AgentName, AgentResult } from './types'

export abstract class BaseAgent {
  protected name: AgentName
  protected runId: string | null = null

  constructor(name: AgentName) {
    this.name = name
  }

  async logStart(): Promise<string> {
    const db = createAdminClient()
    const { data } = await db
      .from('agent_runs')
      .insert({ agent_name: this.name, status: 'running', started_at: new Date().toISOString() })
      .select('id')
      .single()
    this.runId = data?.id ?? null
    return this.runId ?? ''
  }

  async logProgress(taskName: string, data?: unknown): Promise<void> {
    if (!this.runId) return
    await createAdminClient().from('agent_tasks').insert({
      run_id: this.runId,
      task_name: taskName,
      status: 'running',
      data: data ?? null,
    })
  }

  async logComplete(result: unknown): Promise<void> {
    if (!this.runId) return
    await createAdminClient()
      .from('agent_runs')
      .update({ status: 'completed', completed_at: new Date().toISOString(), result })
      .eq('id', this.runId)
  }

  async logError(error: string): Promise<void> {
    if (!this.runId) return
    await createAdminClient()
      .from('agent_runs')
      .update({ status: 'error', completed_at: new Date().toISOString(), error })
      .eq('id', this.runId)
  }

  abstract run(params?: unknown): Promise<AgentResult>
}
