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

// PATCH /api/clients/[clientId] — actualiza datos del cliente
// Soporta top-level fields + custom_config merge
export async function PATCH(
  request: NextRequest,
  { params }: { params: { clientId: string } }
) {
  try {
    const body = await request.json()

    const TOP_LEVEL = ['company_name', 'contact_name', 'email', 'phone', 'plan', 'status', 'mrr'] as const
    type TopKey = typeof TOP_LEVEL[number]

    const topFields: Partial<Record<TopKey, string | number>> = {}
    const configFields: Record<string, string> = {}

    for (const [k, v] of Object.entries(body)) {
      if (TOP_LEVEL.includes(k as TopKey)) {
        topFields[k as TopKey] = v as string | number
      } else {
        configFields[k] = v as string
      }
    }

    // Si hay campos de custom_config, mergear con los actuales
    let updatePayload: Record<string, unknown> = { ...topFields }
    if (Object.keys(configFields).length > 0) {
      const { data: existing } = await supabaseAdmin
        .from('clients')
        .select('custom_config')
        .eq('id', params.clientId)
        .single()
      const current = (existing?.custom_config as Record<string, string>) || {}
      updatePayload.custom_config = { ...current, ...configFields }
    }

    // Actualizar status automático según plan
    if (topFields.plan && !topFields.status) {
      updatePayload.status = topFields.plan === 'trial' ? 'trial' : 'active'
    }

    const { data, error } = await supabaseAdmin
      .from('clients')
      .update(updatePayload)
      .eq('id', params.clientId)
      .select('*, booking_configs(id, is_active)')
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

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { clientId: string } }
) {
  try {
    const { error } = await supabaseAdmin
      .from('clients')
      .delete()
      .eq('id', params.clientId)
    if (error) throw error
    return NextResponse.json({ ok: true })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error' },
      { status: 500 }
    )
  }
}
