import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase'

// POST /api/celulab/partners/verify-pin
// Body: { pin: string }
// Returns { slug, name } if valid active partner, 404 otherwise
export async function POST(req: Request) {
  const { pin } = await req.json().catch(() => ({}))
  if (!pin) return NextResponse.json({ error: 'PIN requerido' }, { status: 400 })

  const db = createAdminClient()
  const { data } = await db
    .from('cl_partners')
    .select('id, slug, name')
    .eq('pin', String(pin).trim())
    .eq('is_active', true)
    .single()

  if (!data) return NextResponse.json({ error: 'PIN inválido' }, { status: 404 })
  return NextResponse.json({ id: data.id, slug: data.slug, name: data.name })
}