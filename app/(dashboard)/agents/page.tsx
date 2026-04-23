import { createAdminClient } from '@/lib/supabase'
import AgentsToggleView from './_components/AgentsToggleView'
import type { AgentRun, ChatMessage } from '@/lib/agents/types'

export const dynamic = 'force-dynamic'

const INK = '#09090B'
const LIME = '#C6FF3D'

export default async function AgentsPage() {
  const db = createAdminClient()

  const [{ data: runs }, { data: chats }] = await Promise.all([
    db.from('agent_runs').select('*').order('created_at', { ascending: false }).limit(50),
    db.from('agent_chats').select('*').order('created_at', { ascending: true }).limit(60),
  ])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden', background: INK }}>

      {/* Header */}
      <div style={{
        padding: '14px 20px',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div>
          <div style={{ fontFamily: 'var(--f-mono)', fontSize: 9, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.25)', marginBottom: 3 }}>
            DIVINIA OS · Sala de Mando
          </div>
          <h1 style={{ fontFamily: 'var(--f-display)', fontStyle: 'italic', fontWeight: 700, fontSize: 22, color: '#fff', letterSpacing: '-0.04em', margin: 0, lineHeight: 1 }}>
            Agentes IA
          </h1>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 12px', background: 'rgba(198,255,61,0.08)', border: '1px solid rgba(198,255,61,0.2)', borderRadius: 20 }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: LIME, boxShadow: '0 0 6px rgba(198,255,61,0.6)' }} />
          <span style={{ fontFamily: 'var(--f-mono)', fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase', color: LIME }}>
            Sistema activo
          </span>
        </div>
      </div>

      {/* Main */}
      <AgentsToggleView
        runs={(runs ?? []) as AgentRun[]}
        chats={(chats ?? []) as ChatMessage[]}
      />
    </div>
  )
}
