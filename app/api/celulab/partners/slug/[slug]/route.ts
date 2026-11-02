import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET(_req: NextRequest, { params }: { params: { slug: string } }) {
  const db = createAdminClient()
  const { data, error } = await db
    .from('cl_partners')
    .select('id, name, address, phone, logo_url, pin, is_active, commission_pct')
    .eq('slug', params.slug)
    .single()
  if (error || !data) return NextResponse.json({ error: 'Local no encontrado' }, { status: 404 })
  return NextResponse.json(data)
}