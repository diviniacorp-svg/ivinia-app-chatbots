import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase'
import { canSyncCatalogue } from '@/lib/celulab/admin-auth'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

// trusted_session cookie value — obtenido al loguear en mayori.store/onlysanluis
// Si expira, hacer login con curl y actualizar ONLY_COOKIE en Vercel env vars
const ONLY_COOKIE = process.env.ONLY_COOKIE || ''
const ONLY_BASE = 'https://mayori.store/onlysanluis'

// Categorías de repuestos — se excluyen de la tienda
const REPAIR_CATS = new Set([
  'Repuestos_Modulos', 'Repuestos_LCD', 'Repuestos_Touch',
  'Repuestos_Baterías', 'Bateria_Bateria Celular',
  'Repuestos_Camaras',
  'Repuestos_ConectoresCarga', 'Repuestos_Conectores',
  'Repuestos_PlacaCarga', 'Repuestos_Tapa', 'Repuestos_Vidrios',
  'Repuestos-Buzzer', 'Repuestos-Speaker', 'Repuestos_Microfonos',
  'Repuestos_FlexHome', 'Repuestos_FlexPower', 'Repuestos_BotonPower', 'Repuestos_BotonHome',
])

function getCredentials(): { uid: string; apiKey: string; cookieStr: string } {
  if (!ONLY_COOKIE) throw new Error('ONLY_COOKIE env var no configurada')
  const decoded = JSON.parse(
    Buffer.from(decodeURIComponent(ONLY_COOKIE), 'base64').toString('utf-8')
  ) as { uid: number; api_key: string }
  return {
    uid: String(decoded.uid),
    apiKey: decoded.api_key,
    cookieStr: `trusted_session=${ONLY_COOKIE}; dncs=1`,
  }
}

function mapCategory(onlyCat: string, productName = ''): string {
  const c = onlyCat.toLowerCase()
  const n = productName.toLowerCase()

  // By Only category name
  if (c.includes('auricular') || c.includes('handsfree') || c.includes('earphone') || c.includes('headphone') || c.includes('audifonos')) return 'Auriculares'
  if (c.includes('cable')) return 'Cables'
  if (c.includes('cargador') || c.includes('charger') || c.includes('adaptador') || c.includes('fuente')) return 'Cargadores'
  if (c.includes('funda') || c.includes('case') || c.includes('carcasa') || c.includes('cover') || c.includes('estuche')) return 'Fundas y carcasas'
  if (c.includes('vidrio') || c.includes('protector') || c.includes('templado') || c.includes('film') || c.includes('lamina') || c.includes('lámina')) return 'Protectores de pantalla'
  if (c.includes('power bank') || c.includes('powerbank') || c.includes('batería portatil') || c.includes('cargador portátil')) return 'Power banks'
  if (c.includes('smartwatch') || c.includes('reloj inteligente') || c.includes('smart watch')) return 'Smartwatches'
  if (c.includes('smartband') || c.includes('pulsera') || c.includes('smart band') || c.includes('banda')) return 'Smartbands'
  if (c.includes('parlante') || c.includes('speaker') || c.includes('bocina') || c.includes('altavoz')) return 'Parlantes'
  if (c.includes('tablet')) return 'Tablets'
  if (c.includes('memoria') || c.includes('micro sd') || c.includes('microsd') || c.includes('pendrive') || c.includes('flash') || c.includes('almacen')) return 'Almacenamiento'
  if (c.includes('soporte') || c.includes('holder') || c.includes('mount') || c.includes('base')) return 'Soportes'
  if (c.includes('foto') || c.includes('lente') || c.includes('trípode') || c.includes('tripode') || c.includes('selfie') || c.includes('gopro')) return 'Fotografía'
  if (c.includes('gaming') || c.includes('joystick') || c.includes('gamepad') || c.includes('control') || c.includes('gamer')) return 'Gaming'
  if (c.includes('electrodom') || c.includes('hogar') || c.includes('cocina')) return 'Electrodomésticos'
  if (c.includes('herramienta') || c.includes('soldador') || c.includes('pinza') || c.includes('destornillador') || c.includes('bisturi') || c.includes('abridor') || c.includes('espatula') || c.includes('alcohol') || c.includes('limpiador') || c.includes('lamparita') || c.includes('lampara') || c.includes('led bulb')) return 'Herramientas'
  if (c.includes('mouse') || c.includes('teclado') || c.includes('periferico') || c.includes('periférico') || c.includes('combo inalambric') || c.includes('combo inalámbric')) return 'Periféricos'

  // Fallback: classify by product name when category doesn't match
  if (n.startsWith('tpu ') || n.includes(' tpu ') || n.startsWith('funda ') || n.startsWith('case ')) return 'Fundas y carcasas'
  if (n.startsWith('manos libres') || n.startsWith('auricular') || n.startsWith('microfono clip') || n.startsWith('audifono')) return 'Auriculares'
  if (n.startsWith('malla reloj') || n.startsWith('watch band') || n.startsWith('correa ')) return 'Smartbands'
  if (n.startsWith('reloj ') || n.startsWith('smartwatch')) return 'Smartwatches'
  if (n.startsWith('sportbelt') || n.startsWith('soporte ') || n.startsWith('holder ')) return 'Soportes'
  if (n.startsWith('combo inalambr') || n.startsWith('teclado ') || n.startsWith('mouse ')) return 'Periféricos'
  if (n.startsWith('power bank') || n.startsWith('powerbank')) return 'Power banks'
  if (n.startsWith('punta ') || n.startsWith('espatula') || n.startsWith('soldador') || n.startsWith('brusela') || n.startsWith('pinza ') || n.startsWith('barra led') || n.startsWith('luz neon') || n.startsWith('usb led')) return 'Herramientas'
  if (n.startsWith('tripode') || n.startsWith('trípode') || n.startsWith('ring light') || n.startsWith('aro de luz') || n.startsWith('camara ')) return 'Fotografía'
  if (n.startsWith('parlante') || n.startsWith('speaker ') || n.startsWith('bocina ')) return 'Parlantes'
  if (n.startsWith('cable ')) return 'Cables'
  if (n.startsWith('cargador ') || n.startsWith('adaptador ')) return 'Cargadores'

  return 'Otros'
}

function parsePrice(str: string): number {
  // ARS format: "$ 22.326,92" → 22327
  const clean = (str || '').replace(/[^0-9,]/g, '').replace(',', '.')
  return Math.round(parseFloat(clean) || 0)
}

type OnlyRaw = {
  id: number
  producto: string
  categoria: string
  marca: string
  codigo_interno?: string
  codigo_barras?: string
  stock: string
  precio_final: string
  imagen?: string
  imagenes?: string[]
}

async function fetchPage(
  page: number, cookieStr: string, uid: string, apiKey: string
): Promise<{ items: OnlyRaw[]; totalPages: number }> {
  const url = `${ONLY_BASE}/api/productos.php?page=${page}&uid=${uid}&api_key=${apiKey}`
  const r = await fetch(url, {
    headers: { Cookie: cookieStr },
    signal: AbortSignal.timeout(20000),
  })
  if (!r.ok) throw new Error('El proveedor no respondió correctamente')
  const d = await r.json()
  if (d.error || !Array.isArray(d.body) || !d.body.length) throw new Error('La respuesta del proveedor está vacía o incompleta')
  const totalPages = Number(d.total_pages || 1)
  if (!Number.isInteger(totalPages) || totalPages < 1 || totalPages > 500) throw new Error('Paginación del proveedor inválida')
  return { items: d.body, totalPages }
}

async function fetchAll(cookieStr: string, uid: string, apiKey: string): Promise<OnlyRaw[]> {
  const { items: first, totalPages } = await fetchPage(1, cookieStr, uid, apiKey)
  if (totalPages <= 1) return first

  const all = [...first]
  const BATCH = 8
  for (let p = 2; p <= totalPages; p += BATCH) {
    const pages = Array.from({ length: Math.min(BATCH, totalPages - p + 1) }, (_, i) => p + i)
    const results = await Promise.all(pages.map(pg => fetchPage(pg, cookieStr, uid, apiKey)))
    for (const { items } of results) all.push(...items)
  }
  return all
}

function extractImage(r: OnlyRaw): string | null {
  const url = r.imagenes?.[0] ?? r.imagen ?? null
  if (!url) return null
  const s = String(url).trim()
  if (!s || s === '0' || s === 'false') return null
  if (s.startsWith('http')) return s
  if (s.startsWith('/')) return `${ONLY_BASE}${s}`
  return null
}

export async function POST(req: NextRequest) {
  if (!canSyncCatalogue(req)) return NextResponse.json({ error: 'Iniciá sesión como administrador para actualizar.' }, { status: 401 })

  let creds: { uid: string; apiKey: string; cookieStr: string }
  try {
    creds = getCredentials()
  } catch (e) {
    return NextResponse.json({ error: 'No se pudo conectar con ONLY. Revisá la conexión del proveedor en Vercel.' }, { status: 500 })
  }

  const url = new URL(req.url)
  const discoverOnly = url.searchParams.get('discover') === '1'

  const db = createAdminClient()
  let rawItems: OnlyRaw[]
  try { rawItems = await fetchAll(creds.cookieStr, creds.uid, creds.apiKey) }
  catch { return NextResponse.json({ error: 'No se pudo descargar el catálogo completo. Se conservó el catálogo anterior.' }, { status: 502 }) }

  if (discoverOnly) {
    const cats = new Map<string, number>()
    for (const r of rawItems) {
      if (REPAIR_CATS.has(r.categoria)) continue
      cats.set(r.categoria, (cats.get(r.categoria) || 0) + 1)
    }
    return NextResponse.json({
      total_raw: rawItems.length,
      categories: Object.fromEntries(Array.from(cats.entries()).sort((a, b) => b[1] - a[1])),
    })
  }

  type Mapped = {
    only_id: string; name: string; category: string; brand: string
    code: string; price_ars: number; in_stock: boolean; image_url: string | null
  }

  const products: Mapped[] = []
  const seenKeys = new Set<string>()

  for (const r of rawItems) {
    if (REPAIR_CATS.has(r.categoria)) continue

    const price = parsePrice(r.precio_final)
    if (price <= 0) continue

    const name = (r.producto || '').trim()
    if (!name) continue

    const only_id = String(r.id)
    if (seenKeys.has(only_id)) continue
    seenKeys.add(only_id)

    products.push({
      only_id,
      name,
      category: mapCategory(r.categoria, name),
      brand: r.marca || '',
      code: r.codigo_interno || r.codigo_barras || '',
      price_ars: price,
      in_stock: r.stock === 'En stock',
      image_url: extractImage(r),
    })
  }

  if (!products.length) return NextResponse.json({ error: 'No se encontraron productos válidos. Se conservó el catálogo anterior.' }, { status: 422 })
  const startedAt = new Date().toISOString()

  const BATCH = 200
  let upserted = 0
  for (let i = 0; i < products.length; i += BATCH) {
    const batch = products.slice(i, i + BATCH)
    const { error } = await db.from('cl_products').upsert(
      batch.map(p => ({
        only_id: p.only_id,
        name: p.name,
        category: p.category,
        brand: p.brand,
        code: p.code,
        price_ars: p.price_ars,
        in_stock: p.in_stock,
        image_url: p.image_url,
        is_latest: true,
        scraped_at: startedAt,
      })),
      { onConflict: 'only_id' }
    )
    if (error) return NextResponse.json({ error: 'La actualización quedó incompleta; no se retiraron los productos anteriores.', upserted }, { status: 503 })
    upserted += batch.length
  }

  const { error: cleanupError } = await db.from('cl_products').update({ is_latest: false })
    .eq('is_latest', true).not('only_id', 'is', null).lt('scraped_at', startedAt)
  if (cleanupError) return NextResponse.json({ error: 'Se actualizaron los precios, pero falta retirar productos anteriores.', upserted }, { status: 503 })

  const catMap = new Map<string, number>()
  for (const p of products) catMap.set(p.category, (catMap.get(p.category) || 0) + 1)

  return NextResponse.json({
    ok: true,
    raw_fetched: rawItems.length,
    accessories_mapped: products.length,
    upserted,
    categories: Object.fromEntries(Array.from(catMap.entries()).sort((a, b) => b[1] - a[1])),
    synced_at: new Date().toISOString(),
  })
}

// GET is reserved for authenticated platform cron calls; never manufacture credentials.
export async function GET(req: NextRequest) { return POST(req) }
