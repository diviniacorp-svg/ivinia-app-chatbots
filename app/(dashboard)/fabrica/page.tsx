'use client'
import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { DEPARTMENTS, NUCLEUS_AGENTS, DepartmentId } from '@/lib/nucleus/index'

type Status = 'idle' | 'working' | 'done' | 'error'

interface DeptState {
  status: Status
  lastRun?: string
  runsToday: number
  activeAgent?: string
}

const MODEL_COLORS: Record<string, string> = {
  haiku: '#06B6D4',
  sonnet: '#8B5CF6',
  opus: '#F59E0B',
}

const STATUS_CONFIG: Record<Status, { color: string; label: string; anim: string }> = {
  idle:    { color: 'rgba(255,255,255,0.15)', label: 'IDLE',    anim: 'pulse-slow' },
  working: { color: '#C6FF3D',               label: 'WORKING', anim: 'pulse-fast' },
  done:    { color: '#10B981',               label: 'DONE',     anim: 'pulse-mid'  },
  error:   { color: '#EF4444',               label: 'ERROR',    anim: 'pulse-fast' },
}

function formatAgo(iso?: string) {
  if (!iso) return '—'
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1) return 'ahora'
  if (m < 60) return `${m}m`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h`
  return `${Math.floor(h / 24)}d`
}

function StationCard({
  deptId,
  state,
  onClick,
  active,
}: {
  deptId: DepartmentId
  state: DeptState
  onClick: () => void
  active: boolean
}) {
  const dept = DEPARTMENTS[deptId]
  const agents = NUCLEUS_AGENTS.filter(a => a.depto === deptId)
  const sc = STATUS_CONFIG[state.status]
  const isCerebro = deptId === 'cerebro'

  return (
    <div
      onClick={onClick}
      style={{
        background: active ? 'rgba(198,255,61,0.06)' : 'rgba(255,255,255,0.03)',
        border: `1.5px solid ${active ? '#C6FF3D' : dept.color + '40'}`,
        borderRadius: isCerebro ? 20 : 16,
        padding: isCerebro ? '20px 28px' : '14px 16px',
        cursor: 'pointer',
        position: 'relative',
        overflow: 'hidden',
        transition: 'border-color 0.2s, background 0.2s',
      }}
    >
      {/* Glow behind */}
      <div style={{
        position: 'absolute', inset: 0,
        background: `radial-gradient(ellipse at 50% 0%, ${dept.color}18 0%, transparent 70%)`,
        pointerEvents: 'none',
      }} />

      {/* Status indicator dot */}
      <div style={{
        position: 'absolute', top: 10, right: 10,
        width: 7, height: 7, borderRadius: '50%',
        background: sc.color,
        boxShadow: state.status !== 'idle' ? `0 0 8px ${sc.color}` : 'none',
        animation: state.status !== 'idle' ? `${sc.anim} 1.2s ease-in-out infinite` : undefined,
      }} />

      <div style={{ position: 'relative', zIndex: 1 }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: isCerebro ? 12 : 8 }}>
          <div style={{
            width: isCerebro ? 40 : 32, height: isCerebro ? 40 : 32,
            borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: dept.color + '20', border: `1px solid ${dept.color}40`,
            fontSize: isCerebro ? 20 : 16, flexShrink: 0,
          }}>
            {dept.emoji}
          </div>
          <div>
            <div style={{
              fontFamily: 'var(--f-display)', fontWeight: 700,
              fontSize: isCerebro ? 16 : 12, color: '#F6F5F2',
              letterSpacing: '-0.02em',
            }}>
              {dept.nombre}
            </div>
            <div style={{ fontFamily: 'var(--f-mono)', fontSize: 8, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.08em' }}>
              {agents.length} agentes · {dept.modelo_base}
            </div>
          </div>
        </div>

        {/* Active agent */}
        {state.status === 'working' && state.activeAgent && (
          <div style={{
            fontFamily: 'var(--f-mono)', fontSize: 8.5, color: '#C6FF3D',
            letterSpacing: '0.06em', marginBottom: 6,
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            ▶ {state.activeAgent}
          </div>
        )}

        {/* Stats row */}
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <div style={{ fontFamily: 'var(--f-mono)', fontSize: 8, color: 'rgba(255,255,255,0.25)' }}>
            {state.runsToday} runs hoy
          </div>
          <div style={{ fontFamily: 'var(--f-mono)', fontSize: 8, color: 'rgba(255,255,255,0.2)' }}>
            {formatAgo(state.lastRun)}
          </div>
          <div style={{
            marginLeft: 'auto',
            fontFamily: 'var(--f-mono)', fontSize: 7, letterSpacing: '0.1em',
            padding: '2px 6px', borderRadius: 4,
            background: sc.color + '18', color: sc.color,
          }}>
            {sc.label}
          </div>
        </div>

        {/* Agent pills — only cerebro shows them */}
        {isCerebro && (
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 12 }}>
            {agents.map(a => (
              <span key={a.id} style={{
                fontFamily: 'var(--f-mono)', fontSize: 7.5, padding: '2px 7px',
                borderRadius: 4, background: dept.color + '18',
                color: dept.color, border: `1px solid ${dept.color}30`,
              }}>
                {a.emoji} {a.nombre}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function ActivityTicker({ items }: { items: Array<{ agent: string; status: string; ts: string }> }) {
  return (
    <div style={{
      borderTop: '1px solid rgba(255,255,255,0.07)',
      padding: '10px 24px',
      display: 'flex', gap: 24, overflowX: 'auto',
      scrollbarWidth: 'none',
    }}>
      {items.map((item, i) => (
        <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0 }}>
          <span style={{
            width: 6, height: 6, borderRadius: '50%', flexShrink: 0,
            background: item.status === 'done' ? '#10B981' : item.status === 'error' ? '#EF4444' : '#C6FF3D',
          }} />
          <span style={{ fontFamily: 'var(--f-mono)', fontSize: 9, color: 'rgba(255,255,255,0.5)', whiteSpace: 'nowrap' }}>
            {item.agent}
          </span>
          <span style={{
            fontFamily: 'var(--f-mono)', fontSize: 8, letterSpacing: '0.08em',
            color: item.status === 'done' ? '#10B981' : item.status === 'error' ? '#EF4444' : '#C6FF3D',
          }}>
            {item.status.toUpperCase()}
          </span>
          <span style={{ fontFamily: 'var(--f-mono)', fontSize: 8, color: 'rgba(255,255,255,0.2)' }}>
            {formatAgo(item.ts)}
          </span>
        </div>
      ))}
      {items.length === 0 && (
        <span style={{ fontFamily: 'var(--f-mono)', fontSize: 9, color: 'rgba(255,255,255,0.2)' }}>
          Sin actividad reciente — los agentes duermen...
        </span>
      )}
    </div>
  )
}

// Simulates factory activity when there's no real data
function simulateActivity(
  setState: React.Dispatch<React.SetStateAction<Record<DepartmentId, DeptState>>>
) {
  const deptIds = Object.keys(DEPARTMENTS) as DepartmentId[]
  const pick = deptIds[Math.floor(Math.random() * deptIds.length)]
  const agents = NUCLEUS_AGENTS.filter(a => a.depto === pick)
  const agent = agents[Math.floor(Math.random() * agents.length)]

  setState(prev => ({
    ...prev,
    [pick]: { ...prev[pick], status: 'working', activeAgent: agent?.nombre },
  }))

  setTimeout(() => {
    setState(prev => ({
      ...prev,
      [pick]: { ...prev[pick], status: 'done', activeAgent: undefined, runsToday: prev[pick].runsToday + 1, lastRun: new Date().toISOString() },
    }))
    setTimeout(() => {
      setState(prev => ({ ...prev, [pick]: { ...prev[pick], status: 'idle' } }))
    }, 2500)
  }, 2000 + Math.random() * 3000)
}

export default function FabricaPage() {
  const deptIds = Object.keys(DEPARTMENTS) as DepartmentId[]

  const [deptStates, setDeptStates] = useState<Record<DepartmentId, DeptState>>(() =>
    Object.fromEntries(deptIds.map(id => [id, { status: 'idle' as Status, runsToday: 0 }]))
    as Record<DepartmentId, DeptState>
  )
  const [selected, setSelected] = useState<DepartmentId | null>(null)
  const [ticker, setTicker] = useState<Array<{ agent: string; status: string; ts: string }>>([])
  const [liveData, setLiveData] = useState(false)

  // Fetch real data
  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch('/api/agents/status')
      if (!res.ok) return
      const { runs } = await res.json()
      if (!runs?.length) return
      setLiveData(true)

      // Build per-dept state from real runs
      const newStates: Partial<Record<DepartmentId, DeptState>> = {}
      const todayStart = new Date().toISOString().split('T')[0]

      for (const run of runs) {
        const agent = NUCLEUS_AGENTS.find(a =>
          run.agent?.toLowerCase().includes(a.id.split('-')[0])
        )
        if (!agent) continue
        const dept = agent.depto
        if (!newStates[dept]) newStates[dept] = { status: 'idle', runsToday: 0 }
        const state = newStates[dept]!
        if (run.created_at > todayStart) state.runsToday++
        if (!state.lastRun || run.created_at > state.lastRun) {
          state.lastRun = run.created_at
          state.status = run.status === 'running' ? 'working' : run.status === 'error' ? 'error' : run.status === 'done' ? 'done' : 'idle'
          state.activeAgent = run.status === 'running' ? agent.nombre : undefined
        }
      }

      setDeptStates(prev => ({ ...prev, ...newStates }))
      setTicker(runs.slice(0, 20).map((r: { agent: string; status: string; created_at: string }) => ({
        agent: r.agent, status: r.status, ts: r.created_at,
      })))
    } catch {}
  }, [])

  // Simulation loop (runs when no live data)
  useEffect(() => {
    fetchStatus()
    const fetchInterval = setInterval(fetchStatus, 8000)
    return () => clearInterval(fetchInterval)
  }, [fetchStatus])

  useEffect(() => {
    if (liveData) return
    const sim = setInterval(() => simulateActivity(setDeptStates), 2500)
    return () => clearInterval(sim)
  }, [liveData])

  const cerebroDept = 'cerebro' as DepartmentId
  const otherDepts = deptIds.filter(id => id !== 'cerebro')
  const row2 = otherDepts.slice(0, 4)
  const row3 = otherDepts.slice(4, 8)
  const row4 = otherDepts.slice(8)

  const totalRuns = Object.values(deptStates).reduce((s, d) => s + d.runsToday, 0)
  const working = Object.values(deptStates).filter(d => d.status === 'working').length

  return (
    <div style={{ minHeight: '100vh', background: 'var(--ink)', color: 'var(--paper)', display: 'flex', flexDirection: 'column' }}>

      <style>{`
        @keyframes pulse-slow { 0%,100%{opacity:0.6;transform:scale(1)} 50%{opacity:1;transform:scale(1.3)} }
        @keyframes pulse-mid  { 0%,100%{opacity:0.8;transform:scale(1)} 50%{opacity:1;transform:scale(1.4)} }
        @keyframes pulse-fast { 0%,100%{opacity:1;transform:scale(1)}   50%{opacity:0.6;transform:scale(1.6)} }
        .station:hover { border-color: rgba(198,255,61,0.5) !important; }
      `}</style>

      {/* Header */}
      <div style={{ padding: '16px 24px 12px', borderBottom: '1px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
        <Link href="/agents" style={{ fontFamily: 'var(--f-mono)', fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', textDecoration: 'none' }}>
          ← Agentes
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: liveData ? '#10B981' : '#F59E0B', animation: 'pulse-mid 2s infinite' }} />
          <span style={{ fontFamily: 'var(--f-mono)', fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)' }}>
            DIVINIA FACTORY {liveData ? '· LIVE' : '· SIMULADO'}
          </span>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 24 }}>
          {[
            { label: 'Departamentos', val: deptIds.length },
            { label: 'Agentes totales', val: NUCLEUS_AGENTS.length },
            { label: 'Activos ahora', val: working, color: '#C6FF3D' },
            { label: 'Runs hoy', val: totalRuns },
          ].map(s => (
            <div key={s.label} style={{ textAlign: 'right' }}>
              <div style={{ fontFamily: 'var(--f-display)', fontWeight: 700, fontSize: 18, color: s.color ?? 'var(--paper)', letterSpacing: '-0.03em', lineHeight: 1 }}>
                {s.val}
              </div>
              <div style={{ fontFamily: 'var(--f-mono)', fontSize: 7.5, color: 'rgba(255,255,255,0.25)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Factory floor */}
      <div style={{ flex: 1, padding: '20px 24px', overflow: 'auto' }}>

        {/* Row 0: Cerebro — control room */}
        <div style={{ marginBottom: 16 }}>
          <StationCard deptId={cerebroDept} state={deptStates[cerebroDept]} onClick={() => setSelected(s => s === cerebroDept ? null : cerebroDept)} active={selected === cerebroDept} />
        </div>

        {/* Connector line */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 4 }}>
          <div style={{ width: 1, height: 16, background: 'rgba(198,255,61,0.25)' }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, padding: '0 10%' }}>
          {row2.map((_, i) => (
            <div key={i} style={{ width: 1, height: 12, background: 'rgba(255,255,255,0.1)' }} />
          ))}
        </div>

        {/* Row 1 */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 12 }}>
          {row2.map(id => (
            <div key={id} className="station">
              <StationCard deptId={id} state={deptStates[id]} onClick={() => setSelected(s => s === id ? null : id)} active={selected === id} />
            </div>
          ))}
        </div>

        {/* Row 2 */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 12 }}>
          {row3.map(id => (
            <div key={id} className="station">
              <StationCard deptId={id} state={deptStates[id]} onClick={() => setSelected(s => s === id ? null : id)} active={selected === id} />
            </div>
          ))}
        </div>

        {/* Row 3 */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
          {row4.map(id => (
            <div key={id} className="station">
              <StationCard deptId={id} state={deptStates[id]} onClick={() => setSelected(s => s === id ? null : id)} active={selected === id} />
            </div>
          ))}
        </div>

        {/* Selected dept detail panel */}
        {selected && selected !== cerebroDept && (
          <div style={{
            marginTop: 20, background: 'rgba(255,255,255,0.03)',
            border: `1px solid ${DEPARTMENTS[selected].color}40`,
            borderRadius: 16, padding: '20px 24px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <span style={{ fontSize: 24 }}>{DEPARTMENTS[selected].emoji}</span>
              <div>
                <div style={{ fontFamily: 'var(--f-display)', fontWeight: 700, fontSize: 18, color: '#F6F5F2' }}>
                  {DEPARTMENTS[selected].nombre}
                </div>
                <div style={{ fontFamily: 'var(--f-display)', fontSize: 13, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>
                  {DEPARTMENTS[selected].mision}
                </div>
              </div>
              <Link href={`/agents/${selected}`} style={{
                marginLeft: 'auto', fontFamily: 'var(--f-mono)', fontSize: 10, letterSpacing: '0.08em',
                textTransform: 'uppercase', textDecoration: 'none', padding: '8px 16px',
                borderRadius: 8, background: DEPARTMENTS[selected].color, color: '#0E0E0E', fontWeight: 700,
              }}>
                Ver agentes →
              </Link>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 8 }}>
              {NUCLEUS_AGENTS.filter(a => a.depto === selected).map(a => (
                <div key={a.id} style={{
                  display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px',
                  background: 'rgba(255,255,255,0.04)', borderRadius: 8,
                  border: `1px solid ${DEPARTMENTS[selected].color}20`,
                }}>
                  <span style={{ fontSize: 14 }}>{a.emoji}</span>
                  <div>
                    <div style={{ fontFamily: 'var(--f-display)', fontSize: 11, fontWeight: 600, color: 'var(--paper)' }}>{a.nombre}</div>
                    <div style={{ fontFamily: 'var(--f-mono)', fontSize: 7.5, color: MODEL_COLORS[a.modelo] }}>{a.modelo}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Live ticker */}
      <ActivityTicker items={ticker} />
    </div>
  )
}
