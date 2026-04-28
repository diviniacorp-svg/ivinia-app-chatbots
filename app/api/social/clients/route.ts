import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET() {
  const db = createAdminClient()
  const { data, error } = await db
    .from('social_clients')
    .select('*')
    .eq('is_active', true)
    .order('is_divinia', { ascending: false })
    .order('nombre')

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ clients: data })
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const db = createAdminClient()

  const { data, error } = await db
    .from('social_clients')
    .insert({
      nombre: body.nombre,
      rubro: body.rubro ?? 'general',
      client_id: body.clientId ?? null,
      brand_voice: body.brandVoice ?? {},
      content_strategy: body.contentStrategy ?? {},
      is_divinia: false,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ client: data })
}

export async function PATCH(req: NextRequest) {
  const { id, ...updates } = await req.json()
  if (!id) return NextResponse.json({ error: 'id requerido' }, { status: 400 })

  const db = createAdminClient()
  const { data, error } = await db
    .from('social_clients')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ client: data })
}
