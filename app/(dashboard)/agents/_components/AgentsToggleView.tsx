'use client'
import { useState } from 'react'
import type { AgentRun, ChatMessage } from '@/lib/agents/types'
import VirtualOffice from './VirtualOffice'
import OrchestratorChat from './OrchestratorChat'
import NeuralGraphClient from '../../dashboard/_components/NeuralGraphClient'

interface Props {
  runs: AgentRun[]
  chats: ChatMessage[]
}

export default function AgentsToggleView({ runs, chats }: Props) {
  const [vista, setVista] = useState<'cards' | 'grafo'>('cards')

  return (
    <>
      {/* Toggle Cards / Grafo */}
      <div style={{ display: 'flex', gap: 4, padding: '12px 12px 0', flexShrink: 0 }}>
        {(['cards', 'grafo'] as const).map(v => (
          <button
            key={v}
            onClick={() => setVista(v)}
            style={{
              fontFamily: 'var(--f-mono)',
              fontSize: 10,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              padding: '6px 16px',
              borderRadius: 8,
              border: '1px solid var(--line)',
              background: vista === v ? 'var(--ink)' : 'var(--paper)',
              color: vista === v ? 'var(--paper)' : 'var(--muted-2)',
              cursor: 'pointer',
              transition: 'all 0.15s',
            }}
          >
            {v === 'cards' ? 'Cards' : 'Grafo'}
          </button>
        ))}
      </div>

      {/* Main layout */}
      <div className="flex flex-col lg:flex-row gap-3 flex-1 min-h-0 px-3 sm:px-0 pb-3 sm:pb-0">
        {vista === 'cards' ? (
          <>
            {/* Oficina virtual */}
            <div style={{
              background: 'var(--paper)',
              border: '1px solid var(--line)',
              borderRadius: 16,
              overflow: 'hidden',
            }} className="lg:w-80 lg:shrink-0 h-[45vh] lg:h-full">
              <VirtualOffice runs={runs} />
            </div>

            {/* Chat orquestador */}
            <div style={{
              background: 'var(--paper)',
              border: '1px solid var(--line)',
              borderRadius: 16,
              overflow: 'hidden',
            }} className="flex-1 min-h-0 min-h-[40vh]">
              <OrchestratorChat initialMessages={chats} />
            </div>
          </>
        ) : (
          <div style={{
            background: 'var(--paper)',
            border: '1px solid var(--line)',
            borderRadius: 16,
            overflow: 'hidden',
            flex: 1,
          }}>
            <NeuralGraphClient />
          </div>
        )}
      </div>
    </>
  )
}
