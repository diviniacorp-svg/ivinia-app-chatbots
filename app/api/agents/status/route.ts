import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET() {
  const db = createAdminClient()

  const [{ data: runs }, { data: chats }] = await Promise.all([
    db.from('agent_runs').select('*').order('created_at', { ascending: false }).limit(15),
    db.from('agent_chats').select('*').order('created_at', { ascending: true }).limit(60),
  ])

  return NextResponse.json({ runs: runs ?? [], chats: chats ?? [] })
}
