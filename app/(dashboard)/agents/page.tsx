import { createAdminClient } from '@/lib/supabase'
import VirtualOffice from './_components/VirtualOffice'
import OrchestratorChat from './_components/OrchestratorChat'
import type { AgentRun, ChatMessage } from '@/lib/agents/types'

export const dynamic = 'force-dynamic'

export default async function AgentsPage() {
  const db = createAdminClient()

  const [{ data: runs }, { data: chats }] = await Promise.all([
    db.from('agent_runs').select('*').order('started_at', { ascending: false }).limit(15),
    db.from('agent_chats').select('*').order('created_at', { ascending: true }).limit(60),
  ])

  return (
    <div className="flex gap-4 h-[calc(100vh-3rem)]">
      {/* Left: Virtual Office */}
      <div className="w-72 shrink-0 bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
        <VirtualOffice runs={(runs ?? []) as AgentRun[]} />
      </div>

      {/* Right: Orchestrator Chat */}
      <div className="flex-1 bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
        <OrchestratorChat initialMessages={(chats ?? []) as ChatMessage[]} />
      </div>
    </div>
  )
}
