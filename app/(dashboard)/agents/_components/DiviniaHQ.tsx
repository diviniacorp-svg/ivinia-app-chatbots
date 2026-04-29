'use client'
import { useState, useEffect, useRef } from 'react'
import type { AgentRun } from '@/lib/agents/types'

// ── Rooms / departments ───────────────────────────────────────────────────────
const ROOMS = [
  { id: 'ceo',        label: 'CEO HQ',         icon: '⚡', color: '#C6FF3D', agents: ['Joaco'],                tasks: ['Revisando métricas diarias','Aprobando propuestas','Definiendo prioridades','Monitoreando pipeline'] },
  { id: 'ventas',     label: 'Ventas',          icon: '🎯', color: '#F59E0B', agents: ['Prospector','Qualifier'], tasks: ['Escaneando 240 negocios SL','Calificando 8 leads nuevos','Generando propuesta automática','Enviando outreach por WA'] },
  { id: 'chatbots',   label: 'Chatbots',        icon: '💬', color: '#3B82F6', agents: ['Central IA'],            tasks: ['3 conversaciones activas','Respondiendo consulta de precio','Agendando turno en Rufina','Calificando lead entrante'] },
  { id: 'turnero',    label: 'Turnero',         icon: '📅', color: '#10B981', agents: ['BookingAgent'],          tasks: ['2 turnos confirmados hoy','Enviando recordatorio WA','Procesando seña en MP','Sincronizando calendario'] },
  { id: 'content',    label: 'Content Factory', icon: '✨', color: '#EC4899', agents: ['Writer','Designer'],     tasks: ['Escribiendo post de Turnero','Generando brief visual','Planificando semana de contenido','Creando variantes de copy'] },
  { id: 'redes',      label: 'Redes Sociales',  icon: '📱', color: '#8B5CF6', agents: ['SocialAgent'],           tasks: ['Publicando en @autom_atia','Analizando reach del post','Programando story de mañana','Respondiendo comentarios'] },
  { id: 'finanzas',   label: 'Finanzas',        icon: '💰', color: '#6EE7B7', agents: ['FinBot'],                tasks: ['Calculando MRR actual','Registrando pago de seña','Generando resumen semanal','Proyectando runway'] },
  { id: 'publicidad', label: 'Publicidad IA',   icon: '📢', color: '#F97316', agents: ['AdsAgent'],              tasks: ['Planificando campaña Turnero','Generando copy para Meta Ads','Analizando ROAS histórico','Sugiriendo audiencia objetivo'] },
  { id: 'clientes',   label: 'Clientes',        icon: '👥', color: '#67E8F9', agents: ['OnboardBot'],            tasks: ['Activando nuevo cliente','Enviando accesos del panel','Configurando Turnero para clínica','Seguimiento post-venta'] },
  { id: 'propuestas', label: 'Propuestas',      icon: '📄', color: '#A78BFA', agents: ['Strategist'],            tasks: ['Redactando propuesta a medida','Calculando ROI del cliente','Generando caso de uso','Preparando deck de ventas'] },
  { id: 'nucleus',    label: 'NUCLEUS',         icon: '🧠', color: '#C6FF3D', agents: ['Cerebro'],              tasks: ['Coordinando todos los agentes','Aprendiendo de interacciones','Optimizando flujos internos','Generando digest semanal'] },
  { id: 'labs',       label: 'LABS',            icon: '🔬', color: '#FCA5A5', agents: ['R&D Agent'],             tasks: ['Prototipando Avatar IA v2','Investigando nuevas integraciones','Testeando modelo de embeddings','Benchmarking modelos'] },
]

// ── Activity log fake events ──────────────────────────────────────────────────
const BASE_EVENTS = [
  { room: 'ventas',     msg: 'Prospector encontró 12 leads nuevos en San Luis Capital' },
  { room: 'chatbots',   msg: 'Central IA resolvió consulta de precios · Rufina Nails' },
  { room: 'turnero',    msg: 'Turno confirmado: Rufina Nails · martes 15:00' },
  { room: 'content',    msg: 'Post generado: "Tu competencia te está ganando..."' },
  { room: 'redes',      msg: 'Instagram @autom_atia · nuevo post publicado' },
  { room: 'ventas',     msg: 'Lead calificado con score 82/100 · clínica dental' },
  { room: 'propuestas', msg: 'Propuesta generada para Estudio Contable · $95k/mes' },
  { room: 'nucleus',    msg: 'Cerebro coordinó 3 agentes · 7 acciones ejecutadas' },
  { room: 'finanzas',   msg: 'Seña de $22.500 procesada por MercadoPago' },
  { room: 'labs',       msg: 'Avatar IA v2 prototype · 85% completado' },
  { room: 'clientes',   msg: 'Cliente activado: Gym Power · plan Todo DIVINIA' },
  { room: 'publicidad', msg: 'Campaña Turnero · copy generado para Meta Ads' },
]

interface LogEntry { room: string; msg: string; ts: string; id: number }

// ── Tiny pulsing dot ──────────────────────────────────────────────────────────
function Dot({ color, size = 8, glow = false }: { color: string; size?: number; glow?: boolean }) {
  return (
    <span style={{
      display: 'inline-block', width: size, height: size, borderRadius: '50%',
      background: color, flexShrink: 0,
      boxShadow: glow ? `0 0 ${size * 1.5}px ${color}` : 'none',
      animation: 'pulse-dot 2s ease-in-out infinite',
    }} />
  )
}

// ── Room card ─────────────────────────────────────────────────────────────────
function RoomCard({
  room, isActive, activeTask, runCount, onClick, selected,
}: {
  room: typeof ROOMS[0]
  isActive: boolean
  activeTask: string
  runCount: number
  onClick: () => void
  selected: boolean
}) {
  const [taskIdx, setTaskIdx] = useState(0)

  useEffect(() => {
    const t = setInterval(() => setTaskIdx(i => (i + 1) % room.tasks.length), 4000 + Math.random() * 2000)
    return () => clearInterval(t)
  }, [room.tasks.length])

  const status = isActive ? 'running' : runCount > 0 ? 'idle' : 'standby'
  const statusColor = status === 'running' ? '#10B981' : status === 'idle' ? '#F59E0B' : '#3F3F46'

  return (
    <button onClick={onClick} style={{
      background: selected ? `${room.color}12` : 'rgba(255,255,255,0.03)',
      border: `1px solid ${selected ? room.color + '60' : isActive ? room.color + '30' : 'rgba(255,255,255,0.07)'}`,
      borderRadius: 12, padding: '12px 14px',
      cursor: 'pointer', textAlign: 'left', width: '100%',
      transition: 'all 0.2s', position: 'relative', overflow: 'hidden',
    }}>
      {/* Top glow line when active */}
      {isActive && (
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: 2,
          background: `linear-gradient(90deg, transparent, ${room.color}, transparent)`,
          animation: 'slide-glow 2s ease-in-out infinite',
        }} />
      )}

      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 16 }}>{room.icon}</span>
          <span style={{ fontFamily: 'var(--f-display)', fontWeight: 700, fontSize: 11, color: '#fff' }}>{room.label}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          {isActive && <Dot color="#10B981" size={6} glow />}
          <span style={{
            fontFamily: 'var(--f-mono)', fontSize: 7.5, letterSpacing: '0.08em',
            textTransform: 'uppercase', padding: '1px 6px', borderRadius: 3,
            background: `${statusColor}18`, color: statusColor, border: `1px solid ${statusColor}33`,
          }}>
            {status === 'running' ? 'activo' : status === 'idle' ? 'en pausa' : 'standby'}
          </span>
        </div>
      </div>

      {/* Agents */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 8, flexWrap: 'wrap' }}>
        {room.agents.map(a => (
          <span key={a} style={{
            fontFamily: 'var(--f-mono)', fontSize: 8, padding: '2px 7px', borderRadius: 4,
            background: `${room.color}14`, color: room.color, border: `1px solid ${room.color}25`,
          }}>
            {a}
          </span>
        ))}
      </div>

      {/* Current task */}
      <div style={{
        fontFamily: 'var(--f-mono)', fontSize: 9, color: 'rgba(255,255,255,0.4)',
        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        letterSpacing: '0.02em',
      }}>
        {isActive && activeTask ? activeTask : room.tasks[taskIdx]}
      </div>

      {/* Run count */}
      {runCount > 0 && (
        <div style={{
          position: 'absolute', bottom: 10, right: 12,
          fontFamily: 'var(--f-mono)', fontSize: 8, color: `${room.color}80`,
          fontWeight: 700,
        }}>
          {runCount} runs
        </div>
      )}
    </button>
  )
}

// ── Main component ────────────────────────────────────────────────────────────
interface Props { runs: AgentRun[] }

export default function DiviniaHQ({ runs: initialRuns }: Props) {
  const [runs, setRuns] = useState<AgentRun[]>(initialRuns)
  const [log, setLog] = useState<LogEntry[]>([])
  const [selected, setSelected] = useState<string | null>(null)
  const [tick, setTick] = useState(0)
  const logRef = useRef<HTMLDivElement>(null)
  const eventCounter = useRef(0)

  // Poll for real runs every 5s
  useEffect(() => {
    const id = setInterval(async () => {
      try {
        const res = await fetch('/api/agents/status')
        if (res.ok) { const d = await res.json(); setRuns(d.runs ?? []) }
      } catch {}
      setTick(t => t + 1)
    }, 5000)
    return () => clearInterval(id)
  }, [])

  // Simulate live activity log
  useEffect(() => {
    function addEvent() {
      const event = BASE_EVENTS[eventCounter.current % BASE_EVENTS.length]
      eventCounter.current++
      setLog(prev => {
        const entry: LogEntry = { ...event, ts: new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }), id: Date.now() }
        return [entry, ...prev].slice(0, 40)
      })
    }
    addEvent()
    const id = setInterval(addEvent, 3500)
    return () => clearInterval(id)
  }, [])

  // Auto-scroll log
  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = 0
  }, [log.length])

  // Map runs to room IDs
  function runCountForRoom(roomId: string) {
    return runs.filter(r => {
      const n = (r.agent ?? r.agent_name ?? '').toLowerCase()
      return n.includes(roomId) || roomId.includes(n.split(' ')[0])
    }).length
  }
  function isRoomActive(roomId: string) {
    return runs.some(r => {
      const n = (r.agent ?? r.agent_name ?? '').toLowerCase()
      return r.status === 'running' && (n.includes(roomId) || roomId.includes(n.split(' ')[0]))
    })
  }
  function activeTaskForRoom(roomId: string) {
    const r = runs.find(r2 => {
      const n = (r2.agent ?? r2.agent_name ?? '').toLowerCase()
      return r2.status === 'running' && (n.includes(roomId) || roomId.includes(n.split(' ')[0]))
    })
    return r?.action ?? ''
  }

  const selectedRoom = ROOMS.find(r => r.id === selected)
  const totalRuns = runs.length
  const activeRuns = runs.filter(r => r.status === 'running').length

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#09090B', color: '#fff' }}>
      <style>{`
        @keyframes pulse-dot { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.6;transform:scale(1.3)} }
        @keyframes slide-glow { 0%,100%{opacity:0.4} 50%{opacity:1} }
        @keyframes fade-in-up { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }
        @keyframes ticker { 0%{transform:translateY(0)} 100%{transform:translateY(-50%)} }
      `}</style>

      {/* ── HQ Header ───────────────────────────────────────────── */}
      <div style={{
        padding: '16px 24px', borderBottom: '1px solid rgba(255,255,255,0.07)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, flexShrink: 0,
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#C6FF3D', boxShadow: '0 0 10px #C6FF3D', animation: 'pulse-dot 1.5s ease-in-out infinite' }} />
            <h1 style={{ fontFamily: 'var(--f-display)', fontStyle: 'italic', fontWeight: 900, fontSize: 22, color: '#fff', letterSpacing: '-0.04em', margin: 0 }}>
              DIVINIA HQ
            </h1>
            <span style={{ fontFamily: 'var(--f-mono)', fontSize: 9, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.1em', textTransform: 'uppercase', padding: '2px 8px', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 4 }}>
              sistema en vivo
            </span>
          </div>
          <p style={{ fontFamily: 'var(--f-mono)', fontSize: 9.5, color: 'rgba(255,255,255,0.3)', margin: '4px 0 0', letterSpacing: '0.04em' }}>
            {ROOMS.length} departamentos · {totalRuns} procesos registrados · {activeRuns} activos ahora
          </p>
        </div>

        {/* Status bar */}
        <div style={{ display: 'flex', gap: 20 }}>
          {[
            { label: 'Activos', val: activeRuns, color: '#10B981' },
            { label: 'En pausa', val: runs.filter(r => r.status === 'completed').length, color: '#F59E0B' },
            { label: 'Total hoy', val: totalRuns, color: '#C6FF3D' },
          ].map(s => (
            <div key={s.label} style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: 'var(--f-mono)', fontWeight: 700, fontSize: 20, color: s.color, letterSpacing: '-0.02em' }}>{s.val}</div>
              <div style={{ fontFamily: 'var(--f-mono)', fontSize: 8, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Body: Office grid + sidebar ─────────────────────────── */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden', minHeight: 0 }}>

        {/* Office floor plan */}
        <div style={{ flex: 1, padding: '20px 24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Floor label */}
          <div style={{ fontFamily: 'var(--f-mono)', fontSize: 8.5, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.18)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.06)' }} />
            DIVINIA HQ · PLANTA PRINCIPAL
            <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.06)' }} />
          </div>

          {/* Room grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
            {ROOMS.map(room => (
              <RoomCard
                key={room.id}
                room={room}
                isActive={isRoomActive(room.id)}
                activeTask={activeTaskForRoom(room.id)}
                runCount={runCountForRoom(room.id)}
                onClick={() => setSelected(selected === room.id ? null : room.id)}
                selected={selected === room.id}
              />
            ))}
          </div>

          {/* Selected room detail */}
          {selectedRoom && (
            <div style={{
              background: `${selectedRoom.color}08`, border: `1px solid ${selectedRoom.color}30`,
              borderRadius: 14, padding: '20px 24px', animation: 'fade-in-up 0.2s ease-out',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                <span style={{ fontSize: 24 }}>{selectedRoom.icon}</span>
                <div>
                  <h3 style={{ fontFamily: 'var(--f-display)', fontWeight: 800, fontSize: 18, color: '#fff', margin: 0 }}>{selectedRoom.label}</h3>
                  <p style={{ fontFamily: 'var(--f-mono)', fontSize: 10, color: 'rgba(255,255,255,0.4)', margin: '2px 0 0' }}>
                    {selectedRoom.agents.join(' · ')} · {runCountForRoom(selectedRoom.id)} runs registrados
                  </p>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
                {selectedRoom.tasks.map((task, i) => (
                  <div key={i} style={{ display: 'flex', gap: 8, padding: '8px 12px', background: 'rgba(255,255,255,0.04)', borderRadius: 8, alignItems: 'flex-start' }}>
                    <span style={{ color: selectedRoom.color, fontFamily: 'var(--f-mono)', fontSize: 9, marginTop: 1, flexShrink: 0 }}>→</span>
                    <span style={{ fontFamily: 'var(--f-mono)', fontSize: 10, color: 'rgba(255,255,255,0.7)', lineHeight: 1.4 }}>{task}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── Activity feed sidebar ─────────────────────────────── */}
        <div style={{ width: 300, borderLeft: '1px solid rgba(255,255,255,0.07)', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
          <div style={{ padding: '14px 16px', borderBottom: '1px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Dot color="#10B981" size={6} glow />
            <span style={{ fontFamily: 'var(--f-mono)', fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)' }}>
              Actividad en vivo
            </span>
          </div>

          <div ref={logRef} style={{ flex: 1, overflowY: 'auto', padding: '8px 0' }}>
            {log.map((entry, i) => {
              const room = ROOMS.find(r => r.id === entry.room)
              return (
                <div key={entry.id} style={{
                  padding: '8px 16px', borderBottom: '1px solid rgba(255,255,255,0.04)',
                  animation: i === 0 ? 'fade-in-up 0.3s ease-out' : 'none',
                  display: 'flex', flexDirection: 'column', gap: 3,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 10 }}>{room?.icon ?? '🤖'}</span>
                    <span style={{
                      fontFamily: 'var(--f-mono)', fontSize: 8, letterSpacing: '0.06em', textTransform: 'uppercase',
                      color: room?.color ?? '#C6FF3D', padding: '1px 5px', borderRadius: 3,
                      background: `${room?.color ?? '#C6FF3D'}14`,
                    }}>
                      {room?.label ?? entry.room}
                    </span>
                    <span style={{ fontFamily: 'var(--f-mono)', fontSize: 8, color: 'rgba(255,255,255,0.2)', marginLeft: 'auto' }}>
                      {entry.ts}
                    </span>
                  </div>
                  <p style={{ fontFamily: 'var(--f-mono)', fontSize: 9.5, color: 'rgba(255,255,255,0.6)', margin: 0, lineHeight: 1.4 }}>
                    {entry.msg}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
