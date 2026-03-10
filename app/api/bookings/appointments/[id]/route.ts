import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { status } = await request.json()
    const allowed = ['confirmed', 'cancelled', 'completed', 'no_show']
    if (!allowed.includes(status)) {
      return NextResponse.json({ error: 'Status inválido' }, { status: 400 })
    }

    const db = createAdminClient()
    const { data, error } = await db
      .from('appointments')
      .update({ status })
      .eq('id', params.id)
      .select()
      .single()

    if (error) throw error
    return NextResponse.json({ appointment: data })
  } catch {
    return NextResponse.json({ error: 'Error' }, { status: 500 })
  }
}
