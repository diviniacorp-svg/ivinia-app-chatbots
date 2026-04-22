import { createAdminClient } from '@/lib/supabase'
import AgentsToggleView from './_components/AgentsToggleView'
import type { AgentRun, ChatMessage } from '@/lib/agents/types'

export const dynamic = 'force-dynamic'

export default async function AgentsPage() {
  const db = createAdminClient()

  const [{ data: runs }, { data: chats }, { data: lastPlan }] = await Promise.all([
    db.from('agent_runs').select('*').order('created_at', { ascending: false }).limit(30),
    db.from('agent_chats').select('*').order('created_at', { ascending: true }).limit(60),
    db.from('agent_logs')
      .select('payload, created_at')
      .eq('agent', 'ceo-orchestrator')
      .order('created_at', { ascending: false })
      .limit(1),
  ])

  const dailyPlan = lastPlan?.[0]?.payload as {
    resumen?: string
    prioridad_joaco?: string
    alertas?: string[]
    metricas?: { leads_hoy: number; clientes_activos: number; reservas_hoy: number }
  } | null

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, height: 'calc(100vh - 3.5rem)', padding: 0 }}>

      {/* Header v2 */}
      <div style={{ padding: '20px 12px 0', flexShrink: 0 }}>
        <h1 style={{
          fontFamily: 'var(--f-display)',
          fontStyle: 'italic',
          fontWeight: 700,
          fontSize: 32,
          letterSpacing: '-0.03em',
          color: 'var(--ink)',
          lineHeight: 1,
          margin: 0,
        }}>
          Agentes
        </h1>
      </div>

      {/* Plan del CEO — solo si existe */}
      {dailyPlan?.resumen && (
        <div style={{
          margin: '0 12px',
          background: 'var(--paper)',
          border: '1px solid var(--line)',
          borderRadius: 12,
          padding: '12px 16px',
          flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
            <span style={{ fontSize: 20, flexShrink: 0 }}>🧠</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{
                fontFamily: 'var(--f-mono)',
                fontSize: 10,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: 'var(--muted)',
                marginBottom: 4,
              }}>Plan de hoy</p>
              <p style={{ color: 'var(--ink)', fontSize: 13, lineHeight: 1.5 }}>{dailyPlan.resumen}</p>
              {dailyPlan.prioridad_joaco && (
                <p style={{ color: 'var(--ink)', fontSize: 12, marginTop: 6, fontWeight: 600 }}>
                  🔴 Joaco: {dailyPlan.prioridad_joaco}
                </p>
              )}
            </div>
            {dailyPlan.metricas && (
              <div style={{ display: 'flex', gap: 16, flexShrink: 0, textAlign: 'center' }}>
                {[
                  { val: dailyPlan.metricas.leads_hoy, label: 'leads' },
                  { val: dailyPlan.metricas.clientes_activos, label: 'clientes' },
                  { val: dailyPlan.metricas.reservas_hoy, label: 'reservas' },
                ].map(m => (
                  <div key={m.label}>
                    <p style={{ fontWeight: 700, fontSize: 18, color: 'var(--ink)', lineHeight: 1 }}>{m.val}</p>
                    <p style={{ fontSize: 11, color: 'var(--muted)', fontFamily: 'var(--f-mono)' }}>{m.label}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      <AgentsToggleView
        runs={(runs ?? []) as AgentRun[]}
        chats={(chats ?? []) as ChatMessage[]}
      />
    </div>
  )
}
