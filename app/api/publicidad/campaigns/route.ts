import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET() {
  const db = createAdminClient()
  const { data, error } = await db
    .from('ad_campaigns')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(100)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ campaigns: data ?? [] })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      client_id, client_name, rubro, platform, campaign_name,
      objective, budget_monthly_ars, start_date, end_date,
      target_audience, notas,
    } = body

    if (!client_name || !campaign_name || !platform) {
      return NextResponse.json({ error: 'client_name, campaign_name y platform son requeridos' }, { status: 400 })
    }

    const db = createAdminClient()
    const { data, error } = await db
      .from('ad_campaigns')
      .insert({
        client_id: client_id || null,
        client_name,
        rubro: rubro || null,
        platform,
        campaign_name,
        objective: objective || 'leads',
        budget_monthly_ars: budget_monthly_ars || 0,
        start_date: start_date || null,
        end_date: end_date || null,
        target_audience: target_audience || null,
        notas: notas || null,
        status: 'borrador',
      })
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
