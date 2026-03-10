import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()

    // Whitelist: solo campos permitidos para actualizar
    const allowed = ['status', 'notes', 'score', 'contact_name', 'email', 'phone', 'outreach_sent']
    const safeUpdate: Record<string, unknown> = { updated_at: new Date().toISOString() }
    for (const key of allowed) {
      if (key in body) safeUpdate[key] = body[key]
    }

    const { data, error } = await supabaseAdmin
      .from('leads')
      .update(safeUpdate)
      .eq('id', params.id)
      .select()
      .single()

    if (error) throw error
    return NextResponse.json({ lead: data })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error' },
      { status: 500 }
    )
  }
}
