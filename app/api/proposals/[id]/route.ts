import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const db = createAdminClient()
  const { data, error } = await db
    .from('proposals')
    .select('*, leads(company_name, rubro, city, phone, email)')
    .eq('id', params.id)
    .single()

  if (error || !data) {
    return NextResponse.json({ error: 'Propuesta no encontrada' }, { status: 404 })
  }

  // Marcar como vista si estaba en borrador o enviada
  if (data.status === 'borrador' || data.status === 'enviada') {
    await db
      .from('proposals')
      .update({ status: 'vista', updated_at: new Date().toISOString() })
      .eq('id', params.id)
  }

  return NextResponse.json({ proposal: data })
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const allowed = ['status', 'link_pago', 'mp_preference_id']
    const update: Record<string, unknown> = { updated_at: new Date().toISOString() }
    for (const key of allowed) {
      if (key in body) update[key] = body[key]
    }

    const db = createAdminClient()
    const { data, error } = await db
      .from('proposals')
      .update(update)
      .eq('id', params.id)
      .select()
      .single()

    if (error) throw error
    return NextResponse.json({ proposal: data })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error' },
      { status: 500 }
    )
  }
}
