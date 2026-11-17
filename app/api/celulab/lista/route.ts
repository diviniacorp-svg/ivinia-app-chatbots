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
  if (params.get('offers') === '1' && data?.items?.length) {
    const ids = data.items.map((item:{id:string}) => item.id)
    const {data:prices,error:offerError} = await createAdminClient().from('cl_provider_prices')
      .select('*,cl_providers(name,is_active)').in('part_id',ids).eq('is_latest',true)
    if (offerError) return NextResponse.json({error:'No se pudo comprobar la disponibilidad.'},{status:503})
    for (const item of data.items) {
      item.all_providers = (prices || []).filter(price => price.part_id === item.id && price.cl_providers?.is_active && price.cost_ars > 0 && price.supplier_in_stock !== false)
        .map(price => ({name:price.cl_providers.name,cost:price.cost_ars,available:price.supplier_in_stock===true,updated:price.scraped_at}))
    }
  }
  return NextResponse.json(data, { headers: { 'Cache-Control': 'no-store' } })
}

