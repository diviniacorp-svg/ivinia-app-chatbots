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
    <div className="flex flex-col lg:flex-row gap-4 h-[calc(100vh-5rem)] lg:h-[calc(100vh-3rem)]">
      {/* Oficina virtual — en mobile se achica, en desktop columna fija */}
      <div className="lg:w-72 lg:shrink-0 h-48 lg:h-full bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
        <VirtualOffice runs={(runs ?? []) as AgentRun[]} />
      </div>

      {/* Chat — ocupa el resto */}
      <div className="flex-1 min-h-0 bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
        <OrchestratorChat initialMessages={(chats ?? []) as ChatMessage[]} />
      </div>
    </div>
  )
}
