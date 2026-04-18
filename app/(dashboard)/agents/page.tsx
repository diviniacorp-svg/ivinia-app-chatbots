import { createAdminClient } from '@/lib/supabase'
import VirtualOffice from './_components/VirtualOffice'
import OrchestratorChat from './_components/OrchestratorChat'
import type { AgentRun, ChatMessage } from '@/lib/agents/types'

export const dynamic = 'force-dynamic'

export default async function AgentsPage() {
  const db = createAdminClient()

  const [{ data: runs }, { data: chats }, { data: lastPlan }] = await Promise.all([
    db.from('agent_runs').select('*').order('started_at', { ascending: false }).limit(30),
    db.from('agent_chats').select('*').order('created_at', { ascending: true }).limit(60),
    db.from('agent_logs')
      .select('payload, created_at')
      .eq('agent', 'ceo-orchestrator')
      .order('created_at', { ascending: false })
      .limit(1),
  ])

  const dailyPlan = lastPlan?.[0]?.payload as {
    resumen?: string
    prioridad_joaco?: string
    alertas?: string[]
    metricas?: { leads_hoy: number; clientes_activos: number; reservas_hoy: number }
  } | null

  return (
    <div className="flex flex-col gap-3 h-[calc(100vh-3.5rem)] p-0 sm:p-1">

      {/* Plan del CEO — solo si existe */}
      {dailyPlan?.resumen && (
        <div className="mx-3 mt-3 sm:mx-0 sm:mt-0 bg-gradient-to-r from-purple-900/40 to-indigo-900/30 border border-purple-700/40 rounded-xl px-4 py-3 shrink-0">
          <div className="flex items-start gap-3">
            <span className="text-2xl shrink-0">🧠</span>
            <div className="min-w-0 flex-1">
              <p className="text-purple-300 text-xs font-semibold uppercase tracking-wider mb-1">Plan de hoy</p>
              <p className="text-white text-sm leading-relaxed">{dailyPlan.resumen}</p>
              {dailyPlan.prioridad_joaco && (
                <p className="text-yellow-300 text-xs mt-1.5">
                  🔴 Joaco: {dailyPlan.prioridad_joaco}
                </p>
              )}
            </div>
            {dailyPlan.metricas && (
              <div className="flex gap-3 shrink-0 text-center">
                <div>
                  <p className="text-white text-lg font-bold leading-none">{dailyPlan.metricas.leads_hoy}</p>
                  <p className="text-gray-500 text-xs">leads</p>
                </div>
                <div>
                  <p className="text-white text-lg font-bold leading-none">{dailyPlan.metricas.clientes_activos}</p>
                  <p className="text-gray-500 text-xs">clientes</p>
                </div>
                <div>
                  <p className="text-white text-lg font-bold leading-none">{dailyPlan.metricas.reservas_hoy}</p>
                  <p className="text-gray-500 text-xs">reservas</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Main layout: oficina + chat */}
      <div className="flex flex-col lg:flex-row gap-3 flex-1 min-h-0 px-3 sm:px-0 pb-3 sm:pb-0">
        {/* Oficina virtual */}
        <div className="lg:w-80 lg:shrink-0 h-[45vh] lg:h-full bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
          <VirtualOffice runs={(runs ?? []) as AgentRun[]} />
        </div>

        {/* Chat orquestador */}
        <div className="flex-1 min-h-0 min-h-[40vh] bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
          <OrchestratorChat initialMessages={(chats ?? []) as ChatMessage[]} />
        </div>
      </div>
    </div>
  )
}
