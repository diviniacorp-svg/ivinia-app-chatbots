'use client'

import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import AgentDesk from './AgentDesk'
import type { AgentRun } from '@/lib/agents/types'

interface VirtualOfficeProps {
  runs: AgentRun[]
}

const AGENTS = [
  { id: 'prospector', name: 'Prospector', role: 'Busca leads', emoji: '🔍', color: '#6366f1' },
  { id: 'sales', name: 'Ventas', role: 'Envía emails', emoji: '📧', color: '#10b981' },
  { id: 'monitor', name: 'Monitor', role: 'Vigila trials', emoji: '📊', color: '#f59e0b' },
]

export default function VirtualOffice({ runs: initialRuns }: VirtualOfficeProps) {
  const [runs, setRuns] = useState<AgentRun[]>(initialRuns)
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    async function poll() {
      try {
        const res = await fetch('/api/agents/status')
        if (!res.ok) return
        const data = await res.json()
        setRuns(data.runs ?? [])
        setLastUpdated(new Date())
      } catch { /* silently ignore poll errors */ }
    }

    // Poll cada 3 segundos mientras algún agente esté corriendo, cada 8 si no
    intervalRef.current = setInterval(() => {
      const hasRunning = runs.some(r => r.status === 'running')
      poll()
      // Ajustar intervalo dinámicamente
      if (intervalRef.current) clearInterval(intervalRef.current)
      intervalRef.current = setInterval(poll, hasRunning ? 3000 : 8000)
    }, runs.some(r => r.status === 'running') ? 3000 : 8000)

    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [runs.some(r => r.status === 'running')])

  const isActive = (agentId: string) =>
    runs.some(r => r.agent_name === agentId && r.status === 'running')

  const lastRun = (agentId: string) =>
    runs.find(r => r.agent_name === agentId)?.started_at

  const activeCount = AGENTS.filter(a => isActive(a.id)).length
  const recentRuns = runs.slice(0, 6)

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-700 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <motion.div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: activeCount > 0 ? '#22c55e' : '#6b7280' }}
              animate={activeCount > 0 ? { opacity: [1, 0.3, 1], scale: [1, 1.3, 1] } : { opacity: 1 }}
              transition={activeCount > 0 ? { duration: 1, repeat: Infinity } : {}}
            />
            <p className="text-white text-sm font-bold">Oficina Virtual</p>
          </div>
          <p className="text-gray-500 text-xs mt-0.5">
            {activeCount > 0 ? `${activeCount} agente(s) trabajando ahora` : 'Todos en espera'}
          </p>
        </div>
        {/* Indicador de actualización en tiempo real */}
        <div className="flex items-center gap-1 text-gray-600 text-xs">
          <motion.div
            className="w-1.5 h-1.5 rounded-full bg-indigo-500"
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          <span>live</span>
        </div>
      </div>

      {/* Desks */}
      <div className="flex-1 flex flex-col items-center justify-center gap-4 px-4 py-4">
        <div className="flex gap-6 justify-center">
          {AGENTS.slice(0, 2).map(agent => (
            <AgentDesk
              key={agent.id}
              name={agent.name}
              role={agent.role}
              emoji={agent.emoji}
              color={agent.color}
              isActive={isActive(agent.id)}
              lastRun={lastRun(agent.id)}
            />
          ))}
        </div>
        <div className="flex justify-center">
          <AgentDesk
            name={AGENTS[2].name}
            role={AGENTS[2].role}
            emoji={AGENTS[2].emoji}
            color={AGENTS[2].color}
            isActive={isActive(AGENTS[2].id)}
            lastRun={lastRun(AGENTS[2].id)}
          />
        </div>
        {/* Orquestador */}
        <div className="flex flex-col items-center">
          <motion.div
            className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center text-xl shadow-lg shadow-purple-900/40"
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          >
            🧠
          </motion.div>
          <p className="text-white text-xs font-bold mt-1">Orquestador</p>
        </div>
      </div>

      {/* Activity log en tiempo real */}
      <div className="border-t border-gray-700 px-4 py-3">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Actividad</p>
          <p className="text-gray-700 text-xs">
            {lastUpdated.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </p>
        </div>
        <div className="space-y-1.5 max-h-24 overflow-y-auto">
          {recentRuns.length === 0 ? (
            <p className="text-gray-600 text-xs">Sin actividad todavía.</p>
          ) : recentRuns.map(run => {
            const agent = AGENTS.find(a => a.id === run.agent_name)
            const isRunning = run.status === 'running'
            return (
              <div key={run.id} className="flex items-center gap-2">
                {isRunning ? (
                  <motion.div
                    className="w-1.5 h-1.5 rounded-full shrink-0 bg-yellow-400"
                    animate={{ opacity: [1, 0.3, 1] }}
                    transition={{ duration: 0.6, repeat: Infinity }}
                  />
                ) : (
                  <div
                    className="w-1.5 h-1.5 rounded-full shrink-0"
                    style={{ backgroundColor: run.status === 'completed' ? '#22c55e' : '#ef4444' }}
                  />
                )}
                <span className="text-xs text-gray-400 truncate">
                  {agent?.emoji} {agent?.name ?? run.agent_name}
                  {' · '}
                  <span className={
                    run.status === 'completed' ? 'text-green-400' :
                    run.status === 'running' ? 'text-yellow-400' : 'text-red-400'
                  }>
                    {run.status === 'completed' ? 'listo' :
                     run.status === 'running' ? '⟳ corriendo...' : 'error'}
                  </span>
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
