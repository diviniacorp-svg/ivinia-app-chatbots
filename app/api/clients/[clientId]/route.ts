import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET(
  _req: NextRequest,
  { params }: { params: { clientId: string } }
) {
  const { data, error } = await supabaseAdmin
    .from('clients')
    .select('*')
    .eq('id', params.clientId)
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 404 })
  return NextResponse.json({ client: data })
}

// PATCH /api/clients/[clientId] — actualiza campos de custom_config (apariencia, intro, etc.)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { clientId: string } }
) {
  try {
    const body = await request.json()

    // Leer custom_config actual y mergear con los nuevos valores
    const { data: existing } = await supabaseAdmin
      .from('clients')
      .select('custom_config')
      .eq('id', params.clientId)
      .single()

    const current = (existing?.custom_config as Record<string, string>) || {}
    const merged = { ...current, ...body }

    const { data, error } = await supabaseAdmin
      .from('clients')
      .update({ custom_config: merged })
      .eq('id', params.clientId)
      .select()
      .single()

    if (error) throw error
    return NextResponse.json({ client: data })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error' },
      { status: 500 }
    )
  }
}
