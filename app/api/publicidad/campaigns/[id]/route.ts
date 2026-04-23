import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const allowed = [
      'status', 'campaign_name', 'objective', 'platform',
      'budget_monthly_ars', 'budget_spent_ars', 'impressions', 'clicks',
      'leads', 'conversions', 'cpc_ars', 'cpl_ars', 'roas',
      'start_date', 'end_date', 'target_audience', 'ad_copies',
      'strategy', 'notas', 'client_name', 'rubro',
    ]
    const update: Record<string, unknown> = { updated_at: new Date().toISOString() }
    for (const key of allowed) {
      if (key in body) update[key] = body[key]
    }

    const db = createAdminClient()
    const { data, error } = await db
      .from('ad_campaigns')
      .update(update)
      .eq('id', params.id)
      .select()
      .single()

    if (error) throw error
    return NextResponse.json({ campaign: data })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const db = createAdminClient()
  const { error } = await db.from('ad_campaigns').delete().eq('id', params.id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
