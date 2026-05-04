import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase'
import Anthropic from '@anthropic-ai/sdk'

export const dynamic = 'force-dynamic'
// Playwright scraping puede tardar
export const maxDuration = 60

type PriceItem = {
  part_id: string
  cost_ars: number
  url_item?: string
}

// POST /api/celulab/scrape
// Body: { provider_id: string, items?: PriceItem[] }
// - Si items está presente → carga manual de precios
// - Si items está ausente y scrape_type='playwright' → scraping con Claude+Playwright
export async function POST(req: NextRequest) {
  const body = await req.json()
  const { provider_id, items } = body as { provider_id: string; items?: PriceItem[] }

  if (!provider_id) {
    return NextResponse.json({ error: 'provider_id es obligatorio' }, { status: 400 })
  }

  const db = createAdminClient()

  // Verificar que el proveedor existe
  const { data: provider, error: provErr } = await db
    .from('cl_providers')
    .select('*')
    .eq('id', provider_id)
    .single()

  if (provErr || !provider) {
    return NextResponse.json({ error: 'Proveedor no encontrado' }, { status: 404 })
  }

  // Crear log de scraping
  const { data: log } = await db
    .from('cl_scrape_logs')
    .insert({ provider_id, status: 'running' })
    .select('id')
    .single()

  const logId = log?.id

  try {
    let priceItems: PriceItem[] = []

    if (items && items.length > 0) {
      // Carga manual directa
      priceItems = items
    } else if (provider.scrape_type === 'playwright') {
      // Scraping con Claude + Playwright vía Anthropic API
      priceItems = await scrapeWithClaude(provider.url, provider.scrape_selector)
    } else {
      await db.from('cl_scrape_logs').update({
        status: 'error',
        error_message: 'No se enviaron items y scrape_type es manual',
        finished_at: new Date().toISOString(),
      }).eq('id', logId)
      return NextResponse.json({ error: 'Para carga manual enviá items en el body' }, { status: 400 })
    }

    if (priceItems.length === 0) {
      await db.from('cl_scrape_logs').update({
        status: 'error',
        error_message: 'No se encontraron precios',
        finished_at: new Date().toISOString(),
      }).eq('id', logId)
      return NextResponse.json({ error: 'No se encontraron precios' }, { status: 422 })
    }

    // Marcar como no-latest los precios anteriores para los mismos parts
    const partIds = Array.from(new Set(priceItems.map(i => i.part_id)))
    await db
      .from('cl_provider_prices')
      .update({ is_latest: false })
      .eq('provider_id', provider_id)
      .in('part_id', partIds)

    // Insertar nuevos precios
    const rows = priceItems.map(item => ({
      provider_id,
      part_id: item.part_id,
      cost_ars: item.cost_ars,
      url_item: item.url_item ?? '',
      is_latest: true,
    }))

    const { error: insertErr } = await db.from('cl_provider_prices').insert(rows)
    if (insertErr) throw new Error(insertErr.message)

    // Actualizar last_scraped_at del proveedor
    await db.from('cl_providers').update({ last_scraped_at: new Date().toISOString() }).eq('id', provider_id)

    // Marcar log como exitoso
    await db.from('cl_scrape_logs').update({
      status: 'success',
      items_found: priceItems.length,
      finished_at: new Date().toISOString(),
    }).eq('id', logId)

    return NextResponse.json({ ok: true, items_saved: priceItems.length })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Error desconocido'
    await db.from('cl_scrape_logs').update({
      status: 'error',
      error_message: msg,
      finished_at: new Date().toISOString(),
    }).eq('id', logId)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

async function scrapeWithClaude(url: string, _selector: string): Promise<PriceItem[]> {
  const client = new Anthropic()

  // Claude usa computer use / tool use para navegar con Playwright
  // Por ahora retorna vacío — el scraping interactivo se hace desde el dashboard con el MCP
  // Esta función se puede extender cuando se configura un MCP server en el backend
  void client
  void url
  return []
}
