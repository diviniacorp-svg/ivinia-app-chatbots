import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET(_req: NextRequest, { params }: { params: { configId: string } }) {
  const db = createAdminClient()

  const { data: configs } = await db
    .from('booking_configs')
    .select('client_id, services')
    .eq('id', params.configId)
    .eq('is_active', true)
    .limit(1)

  const config = configs?.[0]
  if (!config) return NextResponse.json({ error: 'No encontrado' }, { status: 404 })

  const { data: client } = await db
    .from('clients')
    .select('company_name, custom_config')
    .eq('id', config.client_id)
    .maybeSingle()

  const cfg = (client?.custom_config as Record<string, string>) || {}
  const productos = cfg.productos ? JSON.parse(cfg.productos) : []

  return NextResponse.json({
    company_name: client?.company_name || '',
    color: cfg.color || '#7c3aed',
    rubro: cfg.rubro || '',
    logo_url: cfg.logo_url || null,
    productos,
    configId: params.configId,
  })
}
