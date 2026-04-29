import { createAdminClient } from '@/lib/supabase'
import AgentsPageClient from './_components/AgentsPageClient'
import type { AgentRun, ChatMessage } from '@/lib/agents/types'

export const dynamic = 'force-dynamic'

export default async function AgentsPage() {
  const db = createAdminClient()

  const [{ data: runs }, { data: chats }] = await Promise.all([
    db.from('agent_runs').select('*').order('created_at', { ascending: false }).limit(50),
    db.from('agent_chats').select('*').order('created_at', { ascending: true }).limit(60),
  ])

  return (
    <AgentsPageClient
      runs={(runs ?? []) as AgentRun[]}
      chats={(chats ?? []) as ChatMessage[]}
    />
  )
}
