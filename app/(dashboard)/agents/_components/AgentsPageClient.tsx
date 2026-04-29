'use client'
import { useState } from 'react'
import type { AgentRun, ChatMessage } from '@/lib/agents/types'
import DiviniaHQ from './DiviniaHQ'
import AgentsToggleView from './AgentsToggleView'

const INK = '#09090B'
const LIME = '#C6FF3D'

interface Props {
  runs: AgentRun[]
  chats: ChatMessage[]
}

export default function AgentsPageClient({ runs, chats }: Props) {
  const [view, setView] = useState<'hq' | 'cards'>('hq')

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden', background: INK }}>

      {/* View toggle strip */}
      <div style={{
        padding: '6px 20px',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        gap: 8,
      }}>
        <div style={{ display: 'flex', background: 'rgba(255,255,255,0.05)', borderRadius: 7, padding: 2, border: '1px solid rgba(255,255,255,0.09)' }}>
          {[
            { key: 'hq', label: '🏢 HQ en vivo' },
            { key: 'cards', label: '⚡ Agentes' },
          ].map(opt => (
            <button
              key={opt.key}
              onClick={() => setView(opt.key as 'hq' | 'cards')}
              style={{
                padding: '4px 14px', borderRadius: 5, border: 'none', cursor: 'pointer',
                fontFamily: 'var(--f-mono)', fontSize: 9.5, letterSpacing: '0.04em',
                background: view === opt.key ? 'rgba(255,255,255,0.12)' : 'transparent',
                color: view === opt.key ? '#fff' : 'rgba(255,255,255,0.35)',
                transition: 'all 0.15s',
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* View */}
      <div style={{ flex: 1, overflow: 'hidden', minHeight: 0 }}>
        {view === 'hq'
          ? <DiviniaHQ runs={runs} />
          : <AgentsToggleView runs={runs} chats={chats} />
        }
      </div>
    </div>
  )
}
