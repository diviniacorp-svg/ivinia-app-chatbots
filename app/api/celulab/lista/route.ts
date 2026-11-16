import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const params = req.nextUrl.searchParams
  const limit = Number(params.get('limit') || 50)
  const offset = Number(params.get('offset') || 0)
  if (!Number.isSafeInteger(limit) || !Number.isSafeInteger(offset) || offset < 0 || offset > 2147483647) {
    return NextResponse.json({ error: 'Paginación inválida.' }, { status: 400 })
  }
  const { data, error } = await createAdminClient().rpc('cl_price_list_v1', {
    p_tab: params.get('tab') || 'modulos',
    p_brand: params.get('brand') || '',
    p_search: (params.get('q') || '').trim(),
    p_limit: Math.max(1, Math.min(limit, 1000)),
    p_offset: offset,
  })
  if (error) return NextResponse.json({ error: 'No se pudo cargar la lista de repuestos.' }, { status: 503 })
  return NextResponse.json(data, { headers: { 'Cache-Control': 'no-store' } })
}
