'use client'

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

export default function VirtualOffice({ runs }: VirtualOfficeProps) {
  const isActive = (agentId: string) =>
    runs.some(r => r.agent_name === agentId && r.status === 'running')

  const lastRun = (agentId: string) =>
    runs.find(r => r.agent_name === agentId)?.started_at

  const recentRuns = runs.slice(0, 5)

  return (
    <div className="h-full flex flex-col">
      {/* Office header */}
      <div className="px-4 py-3 border-b border-gray-700">
        <div className="flex items-center gap-2">
          <motion.div
            className="w-2 h-2 rounded-full bg-green-400"
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          <p className="text-white text-sm font-bold">Oficina Virtual DIVINIA</p>
        </div>
        <p className="text-gray-500 text-xs mt-0.5">{AGENTS.filter(a => isActive(a.id)).length} agente(s) activo(s)</p>
      </div>

      {/* Desks grid */}
      <div className="flex-1 flex flex-col items-center justify-center gap-6 px-4 py-6">
        {/* Top row: 2 agents */}
        <div className="flex gap-8 justify-center">
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

        {/* Bottom row: 1 agent centered */}
        <div className="flex justify-center">
          <AgentDesk
            key={AGENTS[2].id}
            name={AGENTS[2].name}
            role={AGENTS[2].role}
            emoji={AGENTS[2].emoji}
            color={AGENTS[2].color}
            isActive={isActive(AGENTS[2].id)}
            lastRun={lastRun(AGENTS[2].id)}
          />
        </div>

        {/* Orchestrator at center */}
        <div className="flex flex-col items-center">
          <motion.div
            className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center text-2xl shadow-lg shadow-purple-900/40"
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          >
            🧠
          </motion.div>
          <p className="text-white text-xs font-bold mt-1">Orquestador</p>
          <p className="text-gray-500 text-xs">Coordina todo</p>
        </div>
      </div>

      {/* Activity log */}
      <div className="border-t border-gray-700 px-4 py-3">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Actividad reciente</p>
        <div className="space-y-1.5 max-h-28 overflow-y-auto">
          {recentRuns.length === 0 ? (
            <p className="text-gray-600 text-xs">Sin actividad todavía. Pedile al orquestador que ejecute un agente.</p>
          ) : recentRuns.map(run => {
            const agent = AGENTS.find(a => a.id === run.agent_name)
            return (
              <div key={run.id} className="flex items-center gap-2">
                <div
                  className="w-1.5 h-1.5 rounded-full shrink-0"
                  style={{
                    backgroundColor: run.status === 'completed' ? '#22c55e' :
                      run.status === 'running' ? '#f59e0b' : '#ef4444'
                  }}
                />
                <span className="text-xs text-gray-400 truncate">
                  {agent?.emoji} {agent?.name ?? run.agent_name}
                  {' · '}
                  <span className={
                    run.status === 'completed' ? 'text-green-400' :
                    run.status === 'running' ? 'text-yellow-400' : 'text-red-400'
                  }>
                    {run.status === 'completed' ? 'completado' :
                     run.status === 'running' ? 'corriendo' : 'error'}
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
