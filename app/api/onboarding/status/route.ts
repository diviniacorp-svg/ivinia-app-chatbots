import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const clientId = request.nextUrl.searchParams.get('clientId')
  if (!clientId) {
    return NextResponse.json({ error: 'clientId requerido' }, { status: 400 })
  }

  const db = createAdminClient()
  const { data: client, error } = await db
    .from('clients')
    .select('id, company_name, status, plan, custom_config, created_at')
    .eq('id', clientId)
    .single()

  if (error || !client) {
    return NextResponse.json({ error: 'Cliente no encontrado' }, { status: 404 })
  }

  const cfg = (client.custom_config as Record<string, unknown>) ?? {}
  const turneroUrl = cfg.turnero_url as string | undefined
  const panelUrl = cfg.panel_url as string | undefined
  const panelPin = cfg.panel_pin as string | undefined
  const provisionedAt = cfg.provisioned_at as string | undefined

  const provisioned = turneroUrl ? {
    turnero_url: turneroUrl,
    panel_url: panelUrl ?? null,
    panel_pin: panelPin ?? null,
    qr_url: `https://api.qrserver.com/v1/create-qr-code/?size=300x300&format=png&data=${encodeURIComponent(turneroUrl)}`,
    provisioned_at: provisionedAt ?? null,
  } : null

  return NextResponse.json({
    id: client.id,
    company_name: client.company_name,
    status: client.status,
    plan: client.plan,
    provisioned,
    is_ready: client.status === 'active' && !!provisioned,
    created_at: client.created_at,
  })
}
