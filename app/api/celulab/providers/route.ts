import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

// GET /api/celulab/providers
export async function GET() {
  const db = createAdminClient()
  const { data, error } = await db
    .from('cl_providers')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

// POST /api/celulab/providers
export async function POST(req: NextRequest) {
  const body = await req.json()
  const { name, url, scrape_type, scrape_selector, notes } = body

  if (!name || !url) {
    return NextResponse.json({ error: 'name y url son obligatorios' }, { status: 400 })
  }

  const db = createAdminClient()
  const { data, error } = await db
    .from('cl_providers')
    .insert({ name, url, scrape_type: scrape_type ?? 'manual', scrape_selector: scrape_selector ?? '', notes: notes ?? '' })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
