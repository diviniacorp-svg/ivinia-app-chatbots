import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

// PUT /api/celulab/providers/[id]
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json()
  const db = createAdminClient()
  const { data, error } = await db
    .from('cl_providers')
    .update(body)
    .eq('id', params.id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

// DELETE /api/celulab/providers/[id]
export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const db = createAdminClient()
  const { error } = await db.from('cl_providers').delete().eq('id', params.id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
