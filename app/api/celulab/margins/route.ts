import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

// GET /api/celulab/margins
// Retorna: servicios de CeluLab + costo más barato de proveedor + margen calculado
export async function GET() {
  const db = createAdminClient()

  // 1. Traer servicios de CeluLab desde booking_configs
  const { data: clientRow } = await db
    .from('clients')
    .select('id')
    .eq('chatbot_id', 'celulab-demo')
    .single()

  const { data: config } = clientRow
    ? await db.from('booking_configs').select('services').eq('client_id', clientRow.id).single()
    : { data: null }

  const services: Array<{
    id: string
    category: string
    name: string
    price_ars: number
    description: string
  }> = config?.services ?? []

  // 2. Traer repuestos con sus precios más baratos actuales
  const { data: parts } = await db
    .from('cl_parts')
    .select(`
      id, name, category, service_name,
      cl_provider_prices(cost_ars, url_item, scraped_at, cl_providers(id, name))
    `)
    .eq('cl_provider_prices.is_latest', true)

  // Mapa: service_name → array de precios de proveedores
  const pricesByService: Record<string, Array<{ cost_ars: number; provider: string; url_item: string; scraped_at: string; part_id: string }>> = {}

  for (const part of (parts ?? [])) {
    const key = part.service_name ?? part.name
    if (!pricesByService[key]) pricesByService[key] = []
    for (const pp of (part.cl_provider_prices ?? [])) {
      pricesByService[key].push({
        cost_ars: pp.cost_ars,
        provider: (pp.cl_providers as unknown as { name: string } | null)?.name ?? '?',
        url_item: pp.url_item,
        scraped_at: pp.scraped_at,
        part_id: part.id,
      })
    }
  }

  // 3. Construir vista de márgenes
  const margins = services.map(service => {
    const prices = pricesByService[service.name] ?? []
    const bestPrice = prices.length > 0
      ? prices.reduce((best, p) => p.cost_ars < best.cost_ars ? p : best)
      : null

    const margin_ars = bestPrice ? service.price_ars - bestPrice.cost_ars : null
    const margin_pct = bestPrice && service.price_ars > 0
      ? Math.round(((service.price_ars - bestPrice.cost_ars) / service.price_ars) * 100)
      : null

    return {
      service_id: service.id,
      service_name: service.name,
      category: service.category,
      price_ars: service.price_ars,
      best_cost: bestPrice
        ? {
            cost_ars: bestPrice.cost_ars,
            provider: bestPrice.provider,
            url_item: bestPrice.url_item,
            scraped_at: bestPrice.scraped_at,
          }
        : null,
      all_costs: prices,
      margin_ars,
      margin_pct,
    }
  })

  return NextResponse.json(margins)
}
