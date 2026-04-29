'use client'
import { useState } from 'react'
import Link from 'next/link'
import type { AgentRun, ChatMessage } from '@/lib/agents/types'
import { DEPARTMENTS, NUCLEUS_AGENTS, type DepartmentId } from '@/lib/nucleus'
import OrchestratorChat from './OrchestratorChat'

const INK = '#09090B'

interface Props {
  runs: AgentRun[]
  chats: ChatMessage[]
}

export default function AgentsToggleView({ runs, chats }: Props) {
  const [selectedDept, setSelectedDept] = useState<DepartmentId | null>(null)
  const departments = Object.entries(DEPARTMENTS) as [DepartmentId, typeof DEPARTMENTS[DepartmentId]][]

  function agentsInDept(id: DepartmentId) {
    return NUCLEUS_AGENTS.filter(a => a.depto === id)
  }

  function isRunning(agentId: string) {
    return runs.some(r => (r.agent ?? r.agent_name) === agentId && r.status === 'running')
  }

  function deptActive(id: DepartmentId) {
    return agentsInDept(id).some(a => isRunning(a.id))
  }

  function lastDeptRun(id: DepartmentId): string | null {
    const ids = agentsInDept(id).map(a => a.id)
    const latest = runs
      .filter(r => ids.includes(r.agent ?? r.agent_name ?? ''))
      .sort((a, b) =>
        new Date(b.created_at ?? b.started_at ?? 0).getTime() -
        new Date(a.created_at ?? a.started_at ?? 0).getTime()
      )[0]
    return latest?.created_at ?? latest?.started_at ?? null
  }

  function timeAgo(iso: string | null) {
    if (!iso) return null
    const m = Math.floor((Date.now() - new Date(iso).getTime()) / 60000)
    if (m < 1) return 'ahora'
    if (m < 60) return `${m}m`
    const h = Math.floor(m / 60)
    return h < 24 ? `${h}h` : `${Math.floor(h / 24)}d`
  }

  const totalActive = NUCLEUS_AGENTS.filter(a => isRunning(a.id)).length
  const selected = selectedDept ? DEPARTMENTS[selectedDept] : null

  return (
    <div style={{ display: 'flex', flex: 1, minHeight: 0, overflow: 'hidden' }}>

      {/* ── Panel izquierdo: Departamentos ─────────────────────────── */}
      <div style={{
        width: 256,
        flexShrink: 0,
        background: INK,
        borderRight: '1px solid rgba(255,255,255,0.07)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}>
        {/* Header */}
        <div style={{ padding: '14px 16px 10px', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <div style={{
              width: 7, height: 7, borderRadius: '50%',
              background: totalActive > 0 ? '#4ade80' : 'rgba(255,255,255,0.15)',
              boxShadow: totalActive > 0 ? '0 0 6px #4ade80' : 'none',
            }} />
            <span style={{ fontFamily: 'var(--f-mono)', fontSize: 9, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)' }}>
              {totalActive > 0 ? `${totalActive} activos` : 'en espera'}
            </span>
          </div>
          <div style={{ fontFamily: 'var(--f-display)', fontWeight: 700, fontSize: 13, color: 'rgba(255,255,255,0.9)', marginTop: 5, letterSpacing: '-0.02em' }}>
            Departamentos
          </div>
        </div>

        {/* Lista */}
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {departments.map(([id, dept]) => {
            const count = agentsInDept(id).length
            const active = deptActive(id)
            const ago = timeAgo(lastDeptRun(id))
            const isSel = selectedDept === id

            return (
              <button
                key={id}
                onClick={() => setSelectedDept(isSel ? null : id)}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '9px 16px',
                  background: isSel ? `${dept.color}15` : 'transparent',
                  borderLeft: `2px solid ${isSel ? dept.color : 'transparent'}`,
                  border: 'none',
                  cursor: 'pointer',
                  textAlign: 'left',
                  boxSizing: 'border-box',
                  paddingLeft: isSel ? 14 : 16,
                  borderLeftWidth: 2,
                  borderLeftStyle: 'solid',
                  borderLeftColor: isSel ? dept.color : 'transparent',
                }}
              >
                <span style={{ fontSize: 15, flexShrink: 0 }}>{dept.emoji}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontFamily: 'var(--f-display)',
                    fontSize: 12,
                    fontWeight: isSel ? 600 : 400,
                    color: isSel ? '#fff' : 'rgba(255,255,255,0.6)',
                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                  }}>
                    {dept.nombre}
                  </div>
                  <div style={{ fontFamily: 'var(--f-mono)', fontSize: 9, color: 'rgba(255,255,255,0.22)', marginTop: 1 }}>
                    {count} agentes{ago ? ` · ${ago}` : ''}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <div style={{
                    width: 6, height: 6, borderRadius: '50%', flexShrink: 0,
                    background: active ? '#4ade80' : 'rgba(255,255,255,0.1)',
                    boxShadow: active ? '0 0 5px #4ade80' : 'none',
                  }} />
                  <Link
                    href={`/agents/${id}`}
                    onClick={e => e.stopPropagation()}
                    style={{
                      fontFamily: 'var(--f-mono)', fontSize: 9, color: 'rgba(255,255,255,0.2)',
                      textDecoration: 'none', padding: '2px 4px', borderRadius: 3,
                      border: '1px solid rgba(255,255,255,0.08)',
                    }}
                    title="Ver departamento"
                  >↗</Link>
                </div>
              </button>
            )
          })}
        </div>

        {/* CEO footer */}
        <div style={{ padding: '12px 16px', borderTop: '1px solid rgba(255,255,255,0.07)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 30, height: 30, borderRadius: '50%', flexShrink: 0,
              background: 'linear-gradient(135deg, #8B5CF6, #6366F1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 15, boxShadow: '0 0 10px rgba(139,92,246,0.4)',
            }}>🧠</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: 'var(--f-display)', fontSize: 12, fontWeight: 600, color: '#fff' }}>CEO Orquestador</div>
              <div style={{ fontFamily: 'var(--f-mono)', fontSize: 9, color: 'rgba(255,255,255,0.28)' }}>
                {NUCLEUS_AGENTS.length} agentes · 12 depts
              </div>
            </div>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#4ade80', boxShadow: '0 0 5px #4ade80' }} />
          </div>
        </div>
      </div>

      {/* ── Panel derecho: Chat ─────────────────────────────────────── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, background: INK, overflow: 'hidden' }}>

        {/* Strip del departamento seleccionado */}
        {selected && selectedDept && (
          <div style={{ padding: '10px 16px', borderBottom: '1px solid rgba(255,255,255,0.07)', flexShrink: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
              <span style={{ fontSize: 13 }}>{selected.emoji}</span>
              <span style={{ fontFamily: 'var(--f-display)', fontSize: 12, fontWeight: 600, color: selected.color }}>{selected.nombre}</span>
              <span style={{ fontFamily: 'var(--f-mono)', fontSize: 9, color: 'rgba(255,255,255,0.25)' }}>
                — {selected.mision.slice(0, 55)}...
              </span>
            </div>
            <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
              {agentsInDept(selectedDept).map(agent => {
                const active = isRunning(agent.id)
                return (
                  <div key={agent.id} style={{
                    display: 'inline-flex', alignItems: 'center', gap: 5,
                    padding: '3px 9px', borderRadius: 20,
                    background: active ? `${selected.color}22` : 'rgba(255,255,255,0.05)',
                    border: `1px solid ${active ? selected.color + '55' : 'rgba(255,255,255,0.09)'}`,
                  }}>
                    <span style={{ fontSize: 10 }}>{agent.emoji}</span>
                    <span style={{ fontFamily: 'var(--f-display)', fontSize: 10, color: active ? '#fff' : 'rgba(255,255,255,0.45)' }}>
                      {agent.nombre}
                    </span>
                    {active && <span style={{ width: 4, height: 4, borderRadius: '50%', background: '#4ade80', flexShrink: 0 }} />}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Chat ocupa todo */}
        <div style={{ flex: 1, minHeight: 0 }}>
          <OrchestratorChat initialMessages={chats} />
        </div>
      </div>
    </div>
  )
}
