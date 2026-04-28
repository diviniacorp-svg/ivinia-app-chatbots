// Cron: runs daily at 2am — syncs metrics for all active social clients
import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase'
import { syncPostMetrics } from '@/agents/social/analytics'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

export async function GET(request: Request) {
  if (request.headers.get('authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const db = createAdminClient()
  const { data: clients } = await db
    .from('social_clients')
    .select('id, nombre')
    .eq('is_active', true)

  const results = []
  for (const client of clients ?? []) {
    try {
      await syncPostMetrics(client.id)
      results.push({ id: client.id, nombre: client.nombre, ok: true })
    } catch (err) {
      results.push({ id: client.id, nombre: client.nombre, ok: false, error: String(err) })
    }
  }

  return NextResponse.json({ ok: true, synced: results.length, results })
}
