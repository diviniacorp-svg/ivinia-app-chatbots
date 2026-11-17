import { createHash } from 'node:crypto'
import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase'
import { accessoryFinalPrice,isAccessoryProduct,searchable } from '@/lib/celulab/catalog'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const db = createAdminClient()
  const params = req.nextUrl.searchParams
  const technical = params.get('section') === 'technical'
  if (technical) {
    const token = req.cookies.get('cl_tech')?.value || ''
    if (!/^[a-f0-9]{64}$/.test(token)) return NextResponse.json({ error: 'PIN requerido' }, { status: 401 })
    const digest = createHash('sha256').update(token).digest('hex')
    const { data } = await db.from('cl_technician_access').select('username')
      .eq('token_digest', digest).gt('expires_at', new Date().toISOString()).maybeSingle()
    if (!data) return NextResponse.json({ error: 'Ingresá nuevamente con tu PIN.' }, { status: 401 })
  }
  const category = params.get('category') || ''
  const brand = params.get('brand') || ''
  const search = searchable(params.get('q') || '').split(' ').filter(Boolean)
  const limit = Math.min(200, Math.max(1, Number(params.get('limit')) || 80))
  const offset = Math.max(0, Number(params.get('offset')) || 0)
  const products = []
  // Supabase limits each response: explicitly paginate before computing categories.
  for (let start = 0; ; start += 1000) {
    const { data, error } = await db.from('cl_products')
      .select('id,name,category,brand,price_ars,in_stock,image_url,is_offer,offer_label')
      .eq('is_latest', true).eq('in_stock', true).order('id').range(start, start + 999)
    if (error) return NextResponse.json({ error: 'No pudimos cargar el catálogo.' }, { status: 503 })
    products.push(...(data || []))
    if (!data || data.length < 1000) break
  }
  const { data: markups, error } = await db.from('cl_product_markups').select('category,markup_pct')
  if (error) return NextResponse.json({ error: 'No pudimos consultar los precios.' }, { status: 503 })
  const rates = new Map((markups || []).map(row => [row.category, Number(row.markup_pct)]))
  const catalogue = products.filter(row => isAccessoryProduct(row.category||'',row.name||'') !== technical)
  const counts = new Map<string, number>()
  catalogue.forEach(row => counts.set(row.category, (counts.get(row.category) || 0) + 1))
  const filtered = catalogue.filter(row => (!category || row.category === category)
    && (!brand || row.brand === brand)
    && search.every(term => searchable([row.name, row.brand, row.category].join(' ')).includes(term))
    && (params.get('offers') !== '1' || row.is_offer))
    .sort((a, b) => a.name.localeCompare(b.name, 'es'))
  return NextResponse.json({
    items: filtered.slice(offset, offset + limit).map(row => ({ ...row,
      markup_pct: rates.get(row.category) || 0,
      final_price: accessoryFinalPrice(row.price_ars,rates.get(row.category)||0),
    })),
    total: filtered.length,
    categories: Array.from(counts).map(([name, count]) => ({ name, count })).sort((a,b) => a.name.localeCompare(b.name, 'es')),
    brands: Array.from(new Set(catalogue.filter(row => !category || row.category === category).map(row => row.brand).filter(Boolean))).sort(),
    limit, offset,
  })
}
