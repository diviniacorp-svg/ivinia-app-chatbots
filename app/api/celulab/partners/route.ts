import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET() {
  const db = createAdminClient()
  const { data, error } = await db
    .from('cl_partners')
    .select('*')
    .eq('is_active', true)
    .order('name')
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { name, address, phone, contact_name, commission_pct, notes } = body
  if (!name) return NextResponse.json({ error: 'name es obligatorio' }, { status: 400 })
  const db = createAdminClient()
  const { data, error } = await db
    .from('cl_partners')
    .insert({
      name,
      address: address ?? '',
      phone: phone ?? '',
      contact_name: contact_name ?? '',
      commission_pct: commission_pct ?? 33,
      notes: notes ?? '',
    })
    .select()
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}