import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

// GET /api/celulab/partners/all — todos los partners (incluyendo inactivos)
// Solo llamado desde el panel NUCLEUS privado
export async function GET() {
  const db = createAdminClient()
  const { data, error } = await db
    .from('cl_partners')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}