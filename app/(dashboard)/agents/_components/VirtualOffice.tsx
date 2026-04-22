'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { NUCLEUS_AGENTS, DEPARTMENTS, type DepartmentId } from '@/lib/nucleus'
import type { AgentRun } from '@/lib/agents/types'

// Mapeo de DepartmentId del nucleus → dept route del panel
const DEPT_ROUTE: Partial<Record<DepartmentId, string>> = {
  ventas_crm: 'clientes',
  developers: 'web-apps',
  content_factory: 'content',
  publicidad: 'content',
  finanzas: 'finanzas',
  legal_seguridad: 'legal',
  customer_success: 'clientes',
  inteligencia: 'innovacion',
  canales_monetizacion: 'youtube',
  gestiones: 'ia-auto',
  rrhh_digital: 'rrhh',
  cerebro: 'ia-auto',
}

interface VirtualOfficeProps {
  runs: AgentRun[]
}

export default function VirtualOffice({ runs: initialRuns }: VirtualOfficeProps) {
  const [runs, setRuns] = useState<AgentRun[]>(initialRuns)
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())
  const [activeDept, setActiveDept] = useState<DepartmentId | 'all'>('all')
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    async function poll() {
      try {
        const res = await fetch('/api/agents/status')
        if (!res.ok) return
        const data = await res.json()
        setRuns(data.runs ?? [])
        setLastUpdated(new Date())
      } catch { /* silently ignore */ }
    }

    const hasRunning = runs.some(r => r.status === 'running')
    intervalRef.current = setInterval(poll, hasRunning ? 3000 : 10000)
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [runs.some(r => r.status === 'running')])

  const isActive = (agentId: string) =>
    runs.some(r => (r.agent ?? r.agent_name) === agentId && r.status === 'running')

  const lastRun = (agentId: string) =>
    runs.find(r => (r.agent ?? r.agent_name) === agentId)?.created_at ?? runs.find(r => (r.agent ?? r.agent_name) === agentId)?.started_at

  const visibleAgents = activeDept === 'all'
    ? NUCLEUS_AGENTS
    : NUCLEUS_AGENTS.filter(a => a.depto === activeDept)

  const activeCount = NUCLEUS_AGENTS.filter(a => isActive(a.id)).length
  const departments = Object.entries(DEPARTMENTS) as [DepartmentId, typeof DEPARTMENTS[DepartmentId]][]

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="px-3 py-2.5 border-b border-gray-700/60 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <motion.div
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: activeCount > 0 ? '#22c55e' : '#6b7280' }}
            animate={activeCount > 0 ? { opacity: [1, 0.3, 1], scale: [1, 1.3, 1] } : { opacity: 1 }}
            transition={activeCount > 0 ? { duration: 1, repeat: Infinity } : {}}
          />
          <p className="text-white text-sm font-bold">Oficina</p>
          <span className="text-gray-500 text-xs">
            {activeCount > 0 ? `${activeCount} activos` : `${NUCLEUS_AGENTS.length} agentes`}
          </span>
        </div>
        <div className="flex items-center gap-1 text-gray-600 text-xs">
          <motion.div
            className="w-1.5 h-1.5 rounded-full bg-violet-500"
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          <span>{lastUpdated.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
      </div>

      {/* Dept tabs */}
      <div className="flex gap-1.5 px-3 py-2 overflow-x-auto shrink-0 scrollbar-none">
        <button
          onClick={() => setActiveDept('all')}
          className={`shrink-0 text-xs px-2.5 py-1 rounded-full border transition-colors ${
            activeDept === 'all'
              ? 'bg-violet-600 border-violet-500 text-white'
              : 'bg-gray-800 border-gray-700 text-gray-400 hover:text-gray-200'
          }`}
        >
          Todos
        </button>
        {departments.map(([id, dept]) => (
          <button
            key={id}
            onClick={() => setActiveDept(id)}
            title={dept.nombre}
            className={`shrink-0 text-xs px-2 py-1 rounded-full border transition-colors ${
              activeDept === id
                ? 'text-white border-transparent'
                : 'bg-gray-800 border-gray-700 text-gray-400 hover:text-gray-200'
            }`}
            style={activeDept === id ? { backgroundColor: dept.color + 'cc', borderColor: dept.color } : {}}
          >
            {dept.emoji}
          </button>
        ))}
      </div>

      {/* Dept label */}
      {activeDept !== 'all' && (
        <div className="px-3 pb-1 shrink-0 flex items-center justify-between gap-2">
          <p className="text-xs text-gray-400 min-w-0 truncate">
            {DEPARTMENTS[activeDept].emoji} {DEPARTMENTS[activeDept].nombre}
            <span className="text-gray-600 ml-1">— {DEPARTMENTS[activeDept].mision.slice(0, 50)}...</span>
          </p>
          {DEPT_ROUTE[activeDept] && (
            <Link
              href={`/dashboard/agents/${DEPT_ROUTE[activeDept]}`}
              style={{
                display: 'inline-block',
                fontFamily: 'var(--f-mono)',
                fontSize: 11,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: DEPARTMENTS[activeDept].color,
                textDecoration: 'none',
                borderBottom: `1px solid ${DEPARTMENTS[activeDept].color}`,
                paddingBottom: 1,
                flexShrink: 0,
              }}
            >
              Entrar →
            </Link>
          )}
        </div>
      )}

      {/* Agent grid */}
      <div className="flex-1 overflow-y-auto px-3 pb-3">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeDept}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="grid grid-cols-2 gap-2 mt-1"
          >
            {visibleAgents.map(agent => {
              const active = isActive(agent.id)
              const dept = DEPARTMENTS[agent.depto]
              const color = dept.color
              const ran = lastRun(agent.id)

              return (
                <motion.div
                  key={agent.id}
                  className="rounded-xl p-2.5 flex flex-col gap-1.5 cursor-default"
                  style={{
                    backgroundColor: active ? color + '20' : '#111827',
                    border: `1px solid ${active ? color + '60' : '#1f2937'}`,
                  }}
                  animate={active ? { borderColor: [color + '40', color + '90', color + '40'] } : {}}
                  transition={active ? { duration: 2, repeat: Infinity } : {}}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="text-lg leading-none">{agent.emoji}</span>
                      <div className="flex flex-col min-w-0">
                        <span className="text-white text-xs font-bold leading-tight truncate max-w-[72px]">{agent.nombre}</span>
                        <span className="text-gray-500 text-xs leading-tight truncate max-w-[72px]">{agent.funcion.split('.')[0].slice(0, 20)}</span>
                      </div>
                    </div>
                    {active ? (
                      <motion.div
                        className="w-2 h-2 rounded-full shrink-0 bg-emerald-400"
                        animate={{ scale: [1, 1.3, 1], opacity: [1, 0.5, 1] }}
                        transition={{ duration: 0.8, repeat: Infinity }}
                      />
                    ) : (
                      <div className="w-2 h-2 rounded-full bg-gray-700 shrink-0" />
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    {active ? (
                      <div className="flex gap-0.5 items-end h-3">
                        {[0, 1, 2, 3].map(i => (
                          <motion.div
                            key={i}
                            className="w-1 rounded-full"
                            style={{ backgroundColor: color }}
                            animate={{ height: ['4px', '10px', '4px'] }}
                            transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.1 }}
                          />
                        ))}
                      </div>
                    ) : ran ? (
                      <span className="text-gray-600 text-xs">
                        {new Date(ran).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    ) : (
                      <span className="text-gray-700 text-xs">en espera</span>
                    )}
                    <span
                      className="text-xs px-1.5 py-0.5 rounded-md font-mono"
                      style={{
                        backgroundColor: agent.modelo === 'opus' ? '#7c3aed30' :
                                         agent.modelo === 'sonnet' ? '#2563eb30' : '#06b6d430',
                        color: agent.modelo === 'opus' ? '#a78bfa' :
                               agent.modelo === 'sonnet' ? '#60a5fa' : '#22d3ee',
                      }}
                    >
                      {agent.modelo}
                    </span>
                  </div>
                </motion.div>
              )
            })}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* CEO footer */}
      <div className="border-t border-gray-700/60 px-3 py-2.5 shrink-0">
        <div className="flex items-center gap-2">
          <motion.div
            className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center text-base shadow-lg shadow-violet-900/30 shrink-0"
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          >
            🧠
          </motion.div>
          <div className="min-w-0 flex-1">
            <p className="text-white text-xs font-bold">CEO Orquestador</p>
            <p className="text-gray-500 text-xs truncate">{NUCLEUS_AGENTS.length} agentes · 12 departamentos</p>
          </div>
          <motion.div
            className="w-2 h-2 rounded-full bg-emerald-400 shrink-0"
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </div>
      </div>
    </div>
  )
}
