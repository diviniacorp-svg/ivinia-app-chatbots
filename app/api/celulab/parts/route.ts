import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

// GET /api/celulab/parts — lista repuestos con el precio más barato actual por proveedor
export async function GET() {
  const db = createAdminClient()
  const { data, error } = await db
    .from('cl_parts')
    .select(`
      *,
      cl_provider_prices!inner(
        id, cost_ars, url_item, scraped_at, is_latest,
        cl_providers(id, name)
      )
    `)
    .eq('cl_provider_prices.is_latest', true)
    .order('category')

  // También traer partes sin precios aún
  const { data: allParts } = await db
    .from('cl_parts')
    .select('*')
    .order('category')

  if (error && !data) return NextResponse.json({ error: error.message }, { status: 500 })

  // Merge: partes con precios y partes sin precios
  const partsWithPrices = new Set((data ?? []).map((p: { id: string }) => p.id))
  const partsWithoutPrices = (allParts ?? []).filter((p: { id: string }) => !partsWithPrices.has(p.id))

  return NextResponse.json([...(data ?? []), ...partsWithoutPrices])
}

// POST /api/celulab/parts
export async function POST(req: NextRequest) {
  const body = await req.json()
  const { name, category, service_name, notes } = body

  if (!name || !category) {
    return NextResponse.json({ error: 'name y category son obligatorios' }, { status: 400 })
  }

  const db = createAdminClient()
  const { data, error } = await db
    .from('cl_parts')
    .insert({ name, category, service_name: service_name ?? '', notes: notes ?? '' })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
