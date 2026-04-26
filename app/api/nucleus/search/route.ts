import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  const { query, category, limit = 4 } = await req.json().catch(() => ({}))

  if (!query || typeof query !== 'string' || query.trim().length < 2) {
    return NextResponse.json({ results: [] })
  }

  try {
    const db = createAdminClient()
    const { data, error } = await db.rpc('search_knowledge', {
      query_text: query.trim(),
      max_results: Math.min(Number(limit) || 4, 8),
      filter_cat: category || null,
    })

    if (error) throw error
    return NextResponse.json({ results: data ?? [] })
  } catch (e: any) {
    return NextResponse.json({ results: [], error: e.message }, { status: 500 })
  }
}
