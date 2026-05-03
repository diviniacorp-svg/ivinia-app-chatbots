'use client'
import { useState, useEffect, useCallback, useRef } from 'react'
import Link from 'next/link'
import { DEPARTMENTS, NUCLEUS_AGENTS, DepartmentId } from '@/lib/nucleus/index'

type Status = 'idle' | 'working' | 'done' | 'error'
interface DeptState {
  status: Status
  runsToday: number
  activeAgent?: string
  lastRun?: string
}

function hex2rgb(hex: string) {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return { r, g, b }
}
function rgba(hex: string, a: number) {
  const { r, g, b } = hex2rgb(hex)
  return `rgba(${r},${g},${b},${a})`
}

// ── Pixel sprite: agent character ──
function AgentSprite({
  color, active, idx, x, y,
}: { color: string; active: boolean; idx: number; x: number; y: number }) {
  const dur = 2.8 + idx * 0.4
  const delay = idx * 0.55
  const wanders = [
    `agW0 ${dur}s ${delay}s ease-in-out infinite`,
    `agW1 ${dur}s ${delay}s ease-in-out infinite`,
    `agW2 ${dur}s ${delay}s ease-in-out infinite`,
  ]
  return (
    <div style={{
      position: 'absolute', left: x, top: y,
      animation: active ? wanders[idx % 3] : 'none',
      transition: 'opacity 0.4s',
      opacity: active ? 1 : 0.45,
    }}>
      {/* head */}
      <div style={{
        width: 8, height: 8, borderRadius: '50%',
        background: color,
        margin: '0 auto',
        boxShadow: active ? `0 0 6px ${color}` : 'none',
      }} />
      {/* torso */}
      <div style={{
        width: 6, height: 5, margin: '1px auto 0',
        background: color, opacity: 0.6,
      }} />
      {/* legs */}
      <div style={{ display: 'flex', gap: 1, marginTop: 1, justifyContent: 'center' }}>
        <div style={{ width: 2, height: 3, background: color, opacity: 0.4,
          animation: active ? `legL 0.4s ${delay}s ease-in-out infinite` : 'none' }} />
        <div style={{ width: 2, height: 3, background: color, opacity: 0.4,
          animation: active ? `legR 0.4s ${delay + 0.2}s ease-in-out infinite` : 'none' }} />
      </div>
    </div>
  )
}

// ── Pixel desk + monitor ──
function PixelDesk({ color, x, y }: { color: string; x: number; y: number }) {
  return (
    <div style={{ position: 'absolute', left: x, top: y, pointerEvents: 'none' }}>
      <div style={{
        width: 14, height: 10, background: '#111',
        border: `1px solid ${rgba(color, 0.4)}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginBottom: 1,
      }}>
        <div style={{ width: 8, height: 5, background: rgba(color, 0.18) }} />
      </div>
      <div style={{
        width: 18, height: 4, background: '#2a231a',
        border: '1px solid rgba(255,255,255,0.1)', marginLeft: -2,
      }} />
    </div>
  )
}

// ── Pixel bookshelf ──
function PixelShelf({ color, x, y }: { color: string; x: number; y: number }) {
  const books = ['#ef4444', '#3b82f6', '#f59e0b', '#10b981', '#8b5cf6']
  return (
    <div style={{ position: 'absolute', left: x, top: y, display: 'flex', gap: 2, pointerEvents: 'none' }}>
      {books.map((c, i) => (
        <div key={i} style={{ width: 4, height: 12, background: c, opacity: 0.6 }} />
      ))}
    </div>
  )
}

// ── A single department room ──
function PixelRoom({
  deptId, state, isSelected, onClick, isCerebro,
}: {
  deptId: DepartmentId
  state: DeptState
  isSelected: boolean
  onClick: () => void
  isCerebro?: boolean
}) {
  const dept = DEPARTMENTS[deptId]
  const agents = NUCLEUS_AGENTS.filter(a => a.depto === deptId)
  const color = dept.color
  const working = state.status === 'working'
  const done = state.status === 'done'

  const tileFloor = `
    repeating-linear-gradient(0deg, transparent, transparent 15px, ${rgba(color, 0.04)} 15px, ${rgba(color, 0.04)} 16px),
    repeating-linear-gradient(90deg, transparent, transparent 15px, ${rgba(color, 0.04)} 15px, ${rgba(color, 0.04)} 16px),
    ${rgba(color, 0.06)}
  `

  // agent positions: 3 columns × 2 rows
  const agentSlots = isCerebro
    ? Array.from({ length: Math.min(agents.length, 6) }, (_, i) => ({
        x: 30 + i * 80, y: 55,
      }))
    : [
        { x: 22, y: 56 }, { x: 58, y: 56 }, { x: 94, y: 56 },
        { x: 30, y: 88 }, { x: 66, y: 88 }, { x: 102, y: 82 },
      ]
  const deskSlots = isCerebro
    ? Array.from({ length: 6 }, (_, i) => ({ x: 18 + i * 80, y: 42 }))
    : [{ x: 14, y: 42 }, { x: 50, y: 42 }, { x: 86, y: 42 }]

  return (
    <div
      onClick={onClick}
      style={{
        position: 'relative',
        height: isCerebro ? 140 : '100%',
        minHeight: isCerebro ? 140 : 148,
        cursor: 'pointer',
        overflow: 'hidden',
        background: tileFloor,
        border: isSelected
          ? `2px solid ${color}`
          : `2px solid ${working ? rgba(color, 0.6) : 'rgba(255,255,255,0.08)'}`,
        boxShadow: working
          ? `0 0 24px ${rgba(color, 0.3)}, inset 0 0 60px ${rgba(color, 0.05)}`
          : isSelected
          ? `0 0 16px ${rgba(color, 0.2)}`
          : 'none',
        transition: 'border 0.3s, box-shadow 0.3s',
        imageRendering: 'pixelated',
      }}
    >
      {/* Top bar */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0,
        padding: '5px 8px',
        background: rgba(color, 0.14),
        borderBottom: `1px solid ${rgba(color, 0.2)}`,
        display: 'flex', alignItems: 'center', gap: 6,
        fontFamily: 'JetBrains Mono, monospace',
        fontSize: isCerebro ? 11 : 9,
        fontWeight: 700,
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        color: color,
        zIndex: 3,
      }}>
        <span>{dept.emoji}</span>
        <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {dept.nombre}
        </span>
        {isCerebro && (
          <span style={{ fontSize: 8, opacity: 0.6, letterSpacing: '0.06em' }}>
            COMMAND CENTER
          </span>
        )}
        {/* status LED */}
        <div style={{
          width: isCerebro ? 7 : 5, height: isCerebro ? 7 : 5,
          borderRadius: '50%', flexShrink: 0,
          background: working ? color : done ? '#10b981' : 'rgba(255,255,255,0.15)',
          boxShadow: working ? `0 0 8px ${color}` : done ? '0 0 6px #10b981' : 'none',
          animation: working ? 'blink 1s ease-in-out infinite' : 'none',
        }} />
      </div>

      {/* Desks */}
      {deskSlots.map((d, i) => (
        <PixelDesk key={i} color={color} x={d.x} y={d.y} />
      ))}

      {/* Bookshelves on walls */}
      {!isCerebro && <PixelShelf color={color} x={6} y={28} />}

      {/* Agent sprites */}
      {agents.slice(0, isCerebro ? 6 : 6).map((agent, i) => (
        <AgentSprite
          key={agent.id}
          color={color}
          active={working || (done && i === 0)}
          idx={i}
          x={agentSlots[i]?.x ?? 20 + i * 18}
          y={agentSlots[i]?.y ?? 60}
        />
      ))}

      {/* Scanline overlay (subtle) */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.04) 2px, rgba(0,0,0,0.04) 4px)',
        zIndex: 1,
      }} />

      {/* Bottom HUD */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        padding: '3px 8px',
        background: 'rgba(0,0,0,0.65)',
        borderTop: '1px solid rgba(255,255,255,0.05)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        fontFamily: 'JetBrains Mono, monospace',
        fontSize: 8, letterSpacing: '0.04em',
        zIndex: 3,
      }}>
        <span style={{ color: 'rgba(255,255,255,0.3)' }}>{agents.length} agts</span>
        <span style={{
          color: working ? color : done ? '#10b981' : 'rgba(255,255,255,0.18)',
          fontWeight: 700, fontSize: 8,
        }}>
          {working && state.activeAgent
            ? state.activeAgent.slice(0, 14)
            : state.status.toUpperCase()}
        </span>
        <span style={{ color: 'rgba(255,255,255,0.2)' }}>{state.runsToday}r</span>
      </div>
    </div>
  )
}

// ── Selected room detail panel ──
function DetailPanel({ deptId, state, onClose }: { deptId: DepartmentId; state: DeptState; onClose: () => void }) {
  const dept = DEPARTMENTS[deptId]
  const agents = NUCLEUS_AGENTS.filter(a => a.depto === deptId)
  const color = dept.color

  return (
    <div style={{
      background: '#0a0a0a',
      border: `2px solid ${color}`,
      padding: 20,
      display: 'flex', flexDirection: 'column', gap: 14,
      position: 'relative',
      boxShadow: `0 0 30px ${rgba(color, 0.25)}`,
    }}>
      <button onClick={onClose} style={{
        position: 'absolute', top: 12, right: 14,
        background: 'none', border: 'none', cursor: 'pointer',
        color: 'rgba(255,255,255,0.3)', fontFamily: 'JetBrains Mono, monospace',
        fontSize: 11, padding: 0,
      }}>[ X ]</button>

      <div>
        <div style={{
          fontFamily: 'JetBrains Mono, monospace', fontSize: 10,
          letterSpacing: '0.12em', textTransform: 'uppercase',
          color: color, marginBottom: 4,
        }}>
          {dept.emoji} {dept.nombre}
        </div>
        <p style={{
          fontFamily: 'JetBrains Mono, monospace', fontSize: 9,
          color: 'rgba(255,255,255,0.35)', lineHeight: 1.6,
          letterSpacing: '0.03em',
        }}>
          {dept.mision}
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {agents.map(agent => (
          <div key={agent.id} style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '5px 8px',
            background: rgba(color, 0.07),
            border: `1px solid ${rgba(color, 0.15)}`,
          }}>
            <span style={{ fontSize: 12 }}>{agent.emoji}</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                fontFamily: 'JetBrains Mono, monospace', fontSize: 9,
                fontWeight: 700, color: 'rgba(255,255,255,0.8)',
                letterSpacing: '0.04em', overflow: 'hidden',
                textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}>
                {agent.nombre}
              </div>
              <div style={{
                fontFamily: 'JetBrains Mono, monospace', fontSize: 7,
                color: 'rgba(255,255,255,0.3)', letterSpacing: '0.03em',
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}>
                {agent.funcion}
              </div>
            </div>
            <div style={{
              fontFamily: 'JetBrains Mono, monospace', fontSize: 7,
              color: agent.modelo === 'haiku' ? '#06b6d4' : agent.modelo === 'sonnet' ? '#8b5cf6' : '#f59e0b',
              letterSpacing: '0.06em', textTransform: 'uppercase', flexShrink: 0,
            }}>
              {agent.modelo}
            </div>
          </div>
        ))}
      </div>

      <Link href={`/agents/${deptId}`} style={{
        display: 'block', textAlign: 'center',
        padding: '8px', fontFamily: 'JetBrains Mono, monospace',
        fontSize: 9, fontWeight: 700, letterSpacing: '0.1em',
        textTransform: 'uppercase',
        background: rgba(color, 0.15),
        border: `1px solid ${rgba(color, 0.3)}`,
        color: color, textDecoration: 'none',
      }}>
        ABRIR DEPARTAMENTO →
      </Link>
    </div>
  )
}

// ── Activity ticker ──
function Ticker({ items }: { items: Array<{ agent: string; dept: string; status: string; ts: string }> }) {
  const ref = useRef<HTMLDivElement>(null)
  if (!items.length) return null

  return (
    <div style={{
      borderTop: '1px solid rgba(255,255,255,0.06)',
      background: '#050505',
      padding: '6px 0',
      overflow: 'hidden',
    }}>
      <div ref={ref} style={{
        display: 'flex', gap: 32,
        animation: 'tickerScroll 24s linear infinite',
        whiteSpace: 'nowrap',
      }}>
        {[...items, ...items].map((item, i) => (
          <span key={i} style={{
            fontFamily: 'JetBrains Mono, monospace', fontSize: 9,
            color: 'rgba(255,255,255,0.35)', letterSpacing: '0.06em',
          }}>
            <span style={{ color: '#C6FF3D', marginRight: 6 }}>▸</span>
            {item.agent}
            <span style={{ color: 'rgba(255,255,255,0.2)', margin: '0 6px' }}>·</span>
            {item.dept}
            <span style={{ color: 'rgba(255,255,255,0.2)', margin: '0 6px' }}>·</span>
            <span style={{ color: item.status === 'done' ? '#10b981' : '#ef4444' }}>
              {item.status.toUpperCase()}
            </span>
            <span style={{ color: 'rgba(255,255,255,0.15)', marginLeft: 6 }}>{item.ts}</span>
          </span>
        ))}
      </div>
    </div>
  )
}

// ══ MAIN PAGE ════════════════════════════════════════════════════════════════
export default function FabricaPage() {
  const deptIds = Object.keys(DEPARTMENTS) as DepartmentId[]
  const cerebro = deptIds[0]
  const rest = deptIds.slice(1)

  const [states, setStates] = useState<Record<DepartmentId, DeptState>>(
    () => Object.fromEntries(deptIds.map(id => [id, { status: 'idle' as Status, runsToday: 0 }])) as Record<DepartmentId, DeptState>
  )
  const [selected, setSelected] = useState<DepartmentId | null>(null)
  const [ticker, setTicker] = useState<Array<{ agent: string; dept: string; status: string; ts: string }>>([])
  const [liveMode, setLiveMode] = useState(false)

  // Simulation loop
  const simRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const scheduleNext = useCallback(() => {
    const delay = 1800 + Math.random() * 2400
    simRef.current = setTimeout(() => {
      const id = deptIds[Math.floor(Math.random() * deptIds.length)]
      const dept = DEPARTMENTS[id]
      const agents = NUCLEUS_AGENTS.filter(a => a.depto === id)
      const agent = agents[Math.floor(Math.random() * agents.length)]

      setStates(prev => ({
        ...prev,
        [id]: { ...prev[id], status: 'working', activeAgent: agent?.nombre },
      }))

      const workDur = 1600 + Math.random() * 2200
      setTimeout(() => {
        setStates(prev => ({
          ...prev,
          [id]: { ...prev[id], status: 'done', runsToday: prev[id].runsToday + 1, lastRun: new Date().toISOString() },
        }))
        setTicker(prev => [{
          agent: agent?.nombre ?? 'Agente', dept: dept.nombre, status: 'done',
          ts: new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }),
        }, ...prev].slice(0, 20))
        setTimeout(() => {
          setStates(prev => ({ ...prev, [id]: { ...prev[id], status: 'idle' } }))
          scheduleNext()
        }, 2000)
      }, workDur)
    }, delay)
  }, [deptIds])

  useEffect(() => {
    scheduleNext()
    return () => { if (simRef.current) clearTimeout(simRef.current) }
  }, [scheduleNext])

  // Live data fetch
  const fetchLive = useCallback(async () => {
    try {
      const res = await fetch('/api/agents/status')
      if (!res.ok) return
      const { runs } = await res.json()
      if (!runs?.length) return
      setLiveMode(true)
      const byDept: Record<string, DeptState> = {}
      for (const run of runs) {
        if (!byDept[run.department]) {
          byDept[run.department] = { status: 'done', runsToday: 0 }
        }
        byDept[run.department].runsToday++
        if (run.status === 'running') byDept[run.department].status = 'working'
      }
      setStates(prev => {
        const next = { ...prev }
        for (const [id, s] of Object.entries(byDept)) {
          if (next[id as DepartmentId]) {
            next[id as DepartmentId] = { ...next[id as DepartmentId], ...s }
          }
        }
        return next
      })
    } catch {}
  }, [])

  useEffect(() => {
    fetchLive()
    const iv = setInterval(fetchLive, 8000)
    return () => clearInterval(iv)
  }, [fetchLive])

  const totalAgents = NUCLEUS_AGENTS.length
  const activeNow = deptIds.filter(id => states[id].status === 'working').length
  const runsToday = deptIds.reduce((s, id) => s + states[id].runsToday, 0)

  return (
    <div style={{ background: '#070707', minHeight: '100vh', color: '#fff' }}>
      <style>{`
        @keyframes agW0 { 0%,100%{transform:translate(0,0)} 33%{transform:translate(10px,5px)} 66%{transform:translate(-5px,9px)} }
        @keyframes agW1 { 0%,100%{transform:translate(0,0)} 33%{transform:translate(-8px,4px)} 66%{transform:translate(9px,-5px)} }
        @keyframes agW2 { 0%,100%{transform:translate(0,0)} 33%{transform:translate(5px,-8px)} 66%{transform:translate(-9px,3px)} }
        @keyframes legL { 0%,100%{height:3px} 50%{height:5px} }
        @keyframes legR { 0%,100%{height:5px} 50%{height:3px} }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.3} }
        @keyframes tickerScroll { from{transform:translateX(0)} to{transform:translateX(-50%)} }
      `}</style>

      {/* ── Header ── */}
      <div style={{
        padding: '10px 20px',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        display: 'flex', alignItems: 'center', gap: 16,
        fontFamily: 'JetBrains Mono, monospace',
      }}>
        <Link href="/dashboard" style={{
          color: 'rgba(255,255,255,0.3)', textDecoration: 'none',
          fontSize: 9, letterSpacing: '0.1em',
        }}>← PANEL</Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 7, height: 7, borderRadius: '50%',
            background: '#C6FF3D',
            boxShadow: '0 0 8px #C6FF3D',
            animation: 'blink 2s ease-in-out infinite',
          }} />
          <span style={{
            fontSize: 11, fontWeight: 700, letterSpacing: '0.14em',
            textTransform: 'uppercase', color: '#C6FF3D',
          }}>
            DIVINIA FACTORY
          </span>
          <span style={{
            fontSize: 8, color: 'rgba(255,255,255,0.3)',
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)',
            padding: '2px 6px',
          }}>
            {liveMode ? 'LIVE' : 'SIM'}
          </span>
        </div>

        <div style={{ flex: 1 }} />

        {/* Stats */}
        {[
          { val: 12, label: 'DEPTOS' },
          { val: totalAgents, label: 'AGENTES' },
          { val: activeNow, label: 'ACTIVOS', accent: activeNow > 0 },
          { val: runsToday, label: 'RUNS HOY' },
        ].map(s => (
          <div key={s.label} style={{ textAlign: 'center' }}>
            <div style={{
              fontSize: 18, fontWeight: 700, lineHeight: 1,
              color: s.accent ? '#C6FF3D' : '#fff',
              textShadow: s.accent ? '0 0 12px #C6FF3D' : 'none',
            }}>{s.val}</div>
            <div style={{ fontSize: 7, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.08em' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* ── Building map ── */}
      <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 4 }}>

        {/* Cerebro — full width command center */}
        <PixelRoom
          deptId={cerebro}
          state={states[cerebro]}
          isSelected={selected === cerebro}
          onClick={() => setSelected(selected === cerebro ? null : cerebro)}
          isCerebro
        />

        {/* Connector lines */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 0,
          height: 12,
          padding: '0 25%',
        }}>
          {[0,1,2,3].map(i => (
            <div key={i} style={{
              width: 1, height: '100%', background: 'rgba(255,255,255,0.08)',
              margin: '0 auto',
            }} />
          ))}
        </div>

        {/* Grid of 11 depts + optional detail panel */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: selected ? 'repeat(3, 1fr) 1fr' : 'repeat(4, 1fr)',
          gap: 4,
          transition: 'grid-template-columns 0.3s',
        }}>
          {rest.map(id => (
            <PixelRoom
              key={id}
              deptId={id}
              state={states[id]}
              isSelected={selected === id}
              onClick={() => setSelected(selected === id ? null : id)}
            />
          ))}

          {/* Detail panel if dept selected */}
          {selected && selected !== cerebro && (
            <DetailPanel
              deptId={selected}
              state={states[selected]}
              onClose={() => setSelected(null)}
            />
          )}
        </div>

        {/* Cerebro detail if selected */}
        {selected === cerebro && (
          <DetailPanel
            deptId={cerebro}
            state={states[cerebro]}
            onClose={() => setSelected(null)}
          />
        )}
      </div>

      {/* ── Activity ticker ── */}
      <Ticker items={ticker} />

      {/* ── Floor label ── */}
      <div style={{
        textAlign: 'center', padding: '8px',
        fontFamily: 'JetBrains Mono, monospace',
        fontSize: 8, color: 'rgba(255,255,255,0.1)',
        letterSpacing: '0.12em', textTransform: 'uppercase',
        borderTop: '1px solid rgba(255,255,255,0.04)',
      }}>
        DIVINIA NUCLEUS v1 · {deptIds.length} departamentos · {totalAgents} agentes IA
      </div>
    </div>
  )
}
