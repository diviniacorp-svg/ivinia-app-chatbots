import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET(
  _req: NextRequest,
  { params }: { params: { clientId: string } }
) {
  const db = createAdminClient()
  const { data } = await db
    .from('booking_configs')
    .select('*')
    .eq('client_id', params.clientId)
    .maybeSingle()

  return NextResponse.json({ config: data })
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { clientId: string } }
) {
  try {
    const body = await request.json()
    const db = createAdminClient()

    const { data: existing } = await db
      .from('booking_configs')
      .select('id')
      .eq('client_id', params.clientId)
      .maybeSingle()

    let result
    if (existing) {
      result = await db
        .from('booking_configs')
        .update({ ...body, updated_at: new Date().toISOString() })
        .eq('client_id', params.clientId)
        .select()
        .single()
    } else {
      result = await db
        .from('booking_configs')
        .insert({ ...body, client_id: params.clientId })
        .select()
        .single()
    }

    if (result.error) throw result.error
    return NextResponse.json({ config: result.data })
  } catch (error) {
    console.error('Config error:', error)
    return NextResponse.json({ error: 'Error al guardar config' }, { status: 500 })
  }
}
