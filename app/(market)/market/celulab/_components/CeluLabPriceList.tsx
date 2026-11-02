'use client'
import { useState, useEffect, useCallback, useRef } from 'react'

// ─── Types ────────────────────────────────────────────────────────────────────

export type PriceListItem = {
  id: string; name: string; brand: string; quality: string; category: string
  stock: boolean; best_cost: number | null; final_price: number | null
  best_provider: string | null; markup_ars: number; labor_ars: number
  all_providers: Array<{ name: string; cost: number }>
}

// ─── Constants ────────────────────────────────────────────────────────────────

export const PRICE_TABS = [
  { key: 'modulos',  label: 'Módulos',  icon: '📱' },
  { key: 'baterias', label: 'Baterías', icon: '🔋' },
  { key: 'partes',   label: 'Partes',   icon: '🔌' },
  { key: 'camaras',  label: 'Cámaras',  icon: '📷' },
  { key: 'tapas',    label: 'Tapas',    icon: '🛡' },
  { key: 'glass',    label: 'Glass',    icon: '🔲' },
]

const BRAND_ORDER = ['iPhone', 'Samsung', 'Motorola', 'Xiaomi', 'Huawei', 'LG', 'TCL', 'ZTE', 'Alcatel', 'Varios']

const CAT_COLOR: Record<string, string> = {
  OLED: '#7c3aed', INCELL: '#2563eb', MECÁNICO: '#16a34a', ORIG: '#d97706',
  COPY: '#6b7280', WUZIP: '#0891b2', T20: '#be185d', AMM: '#dc2626',
}

const REPAIR_LABEL: Record<string, string> = {
  modulo_android: 'Cambio de módulo', modulo_iphone: 'Cambio de módulo',
  modulo_mecanico: 'Cambio de módulo', bateria_android: 'Cambio de batería',
  bateria_iphone: 'Cambio de batería', pin_carga: 'Pin de carga',
  placa_carga: 'Placa de carga', camara: 'Cámara', tapa: 'Tapa trasera',
  glass: 'Glass', placa_main: 'Placa madre', placa_prueba: 'Placa prueba',
  flex_interconexion: 'Flex', huellas: 'Sensor huella', buzzer: 'Buzzer',
}

const SERIES_ORDER: Record<string, string[]> = {
  Samsung:  ['Serie S', 'Serie A', 'Serie M', 'Note', 'Galaxy Z', 'Serie J'],
  iPhone:   ['iPhone 16', 'iPhone 15', 'iPhone 14', 'iPhone 13', 'iPhone 12', 'iPhone 11', 'X / XS / XR', 'SE', '6 / 7 / 8'],
  Motorola: ['Edge', 'Moto G', 'Moto E', 'Moto One'],
  Xiaomi:   ['POCO', 'Redmi', 'Mi'],
  Huawei:   ['Mate', 'Nova', 'Serie P', 'Serie Y'],
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getSeriesKey(brand: string, name: string): string {
  const u = name.toUpperCase()
  switch (brand) {
    case 'Samsung':
      if (/\bS\s?\d{2,3}\b|\bS\s?FE\b/.test(u)) return 'Serie S'
      if (/\bA\s?\d{2}\b/.test(u)) return 'Serie A'
      if (/\bM\s?\d{2}\b/.test(u)) return 'Serie M'
      if (/\bNOTE\b/.test(u)) return 'Note'
      if (/\bFOLD\b|\bFLIP\b/.test(u)) return 'Galaxy Z'
      if (/\bJ\s?\d{1,2}\b/.test(u)) return 'Serie J'
      return 'Otros'
    case 'iPhone':
      if (/\b16\b/.test(name)) return 'iPhone 16'
      if (/\b15\b/.test(name)) return 'iPhone 15'
      if (/\b14\b/.test(name)) return 'iPhone 14'
      if (/\b13\b/.test(name)) return 'iPhone 13'
      if (/\b12\b/.test(name)) return 'iPhone 12'
      if (/\b11\b/.test(name)) return 'iPhone 11'
      if (/\bX[SR]?\b|\bXS\b|\bXR\b/.test(name)) return 'X / XS / XR'
      if (/\bSE\b/i.test(name)) return 'SE'
      if (/\b[678]\b/.test(name)) return '6 / 7 / 8'
      return 'Otros'
    case 'Motorola':
      if (/\bEDGE\b/.test(u)) return 'Edge'
      if (/\bG\s?\d{2}\b|\bG\s?(PLAY|POWER|PLUS|PURE|STYLUS)\b/.test(u)) return 'Moto G'
      if (/\bE\s?\d{1,2}\b|\bE\s?PLUS\b/.test(u)) return 'Moto E'
      if (/\bONE\b/.test(u)) return 'Moto One'
      return 'Otros'
    case 'Xiaomi':
      if (/\bPOCO\b/.test(u)) return 'POCO'
      if (/\bREDMI\b/.test(u)) return 'Redmi'
      if (/\bMI\s?\d/.test(u)) return 'Mi'
      return 'Otros'
    case 'Huawei':
      if (/\bMATE\b/.test(u)) return 'Mate'
      if (/\bNOVA\b/.test(u)) return 'Nova'
      if (/\bP\s?\d{1,2}\b|\bP\s?(SMART|LITE|PRO)\b/.test(u)) return 'Serie P'
      if (/\bY\s?\d{1,2}\b/.test(u)) return 'Serie Y'
      return 'Otros'
    default:
      return ''
  }
}

function ars(n: number) {
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0 }).format(n)
}

// ─── PriceRow ─────────────────────────────────────────────────────────────────

function PriceRow({ item, i, isLast, cols, localUnlocked, brand, onItemClick, isMobile }: {
  item: PriceListItem; i: number; isLast: boolean; cols: string; localUnlocked: boolean; brand: string
  onItemClick?: (item: PriceListItem) => void; isMobile?: boolean
}) {
  const commission = localUnlocked && item.labor_ars > 0 ? Math.round(item.labor_ars / 3) : null
  const repairLabel = REPAIR_LABEL[item.category] || item.category
  const displayName = item.name.replace(new RegExp(brand, 'gi'), '').trim() || item.name
  return (
    <div
      onClick={onItemClick && item.final_price ? () => onItemClick(item) : undefined}
      style={{
        display: 'grid', gridTemplateColumns: cols,
        padding: '9px 14px', fontSize: 13,
        borderBottom: isLast ? 'none' : '1px solid #f3f4f6',
        background: i % 2 === 0 ? '#fff' : '#f9fafb',
        opacity: item.stock ? 1 : 0.45,
        cursor: onItemClick && item.final_price ? 'pointer' : 'default',
        transition: 'background .1s',
      }}
      onMouseEnter={onItemClick && item.final_price ? e => (e.currentTarget.style.background = '#eff6ff') : undefined}
      onMouseLeave={onItemClick && item.final_price ? e => (e.currentTarget.style.background = i % 2 === 0 ? '#fff' : '#f9fafb') : undefined}
    >
      <span style={{ fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {!item.stock && <span style={{ fontSize: 9, color: '#ef4444', marginRight: 4, verticalAlign: 'middle' }}>●</span>}
        {displayName}
        {item.quality ? (
          <span style={{
            fontSize: 9, fontWeight: 700, padding: '1px 5px', borderRadius: 3, marginLeft: 5,
            background: (CAT_COLOR[item.quality] || '#6b7280') + '18',
            color: CAT_COLOR[item.quality] || '#6b7280',
            border: `1px solid ${(CAT_COLOR[item.quality] || '#6b7280')}44`,
          }}>{item.quality}</span>
        ) : null}
      </span>
      {!isMobile && <span style={{ fontSize: 12, color: '#6b7280' }}>{repairLabel}</span>}
      <span style={{ textAlign: 'right', fontWeight: 700, color: '#1d4ed8', fontSize: 14 }}>
        {item.final_price ? ars(item.final_price) : item.stock ? '—' : <span style={{ fontSize: 11, color: '#d1d5db' }}>Sin stock</span>}
      </span>
      {localUnlocked && (
        <span style={{ textAlign: 'right', fontWeight: 600, color: '#16a34a' }}>
          {commission ? ars(commission) : '—'}
        </span>
      )}
    </div>
  )
}

// ─── BrandSection ─────────────────────────────────────────────────────────────

function BrandSection({ brand, items, localUnlocked, onItemClick, isMobile }: {
  brand: string; items: PriceListItem[]; localUnlocked: boolean
  onItemClick?: (item: PriceListItem) => void; isMobile?: boolean
}) {
  const [collapsed, setCollapsed] = useState(false)
  const cols = isMobile
    ? (localUnlocked ? '1fr 110px 100px' : '1fr 120px')
    : (localUnlocked ? '1fr 120px 150px 130px' : '1fr 120px 160px')

  const seriesDef = SERIES_ORDER[brand]
  let seriesGroups: Array<{ name: string; items: PriceListItem[] }> | null = null
  if (seriesDef) {
    const map: Record<string, PriceListItem[]> = {}
    for (const item of items) {
      const key = getSeriesKey(brand, item.name)
      if (!map[key]) map[key] = []
      map[key].push(item)
    }
    const ordered = [
      ...seriesDef.filter(s => map[s]?.length).map(s => ({ name: s, items: map[s] })),
      ...Object.entries(map).filter(([k]) => !seriesDef.includes(k)).sort(([a], [b]) => a.localeCompare(b)).map(([k, v]) => ({ name: k, items: v })),
    ]
    if (ordered.length > 0) seriesGroups = ordered
  }

  return (
    <div style={{ marginBottom: 20 }}>
      <div onClick={() => setCollapsed(c => !c)} style={{
        background: 'linear-gradient(90deg, #1e1b4b, #2563eb)',
        color: '#fff', padding: '10px 16px', borderRadius: collapsed ? 10 : '10px 10px 0 0',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        cursor: 'pointer', userSelect: 'none',
      }}>
        <span style={{ fontWeight: 700, fontSize: 14, letterSpacing: '0.05em' }}>{brand.toUpperCase()}</span>
        <span style={{ fontSize: 12, opacity: 0.8 }}>{items.length} · {collapsed ? '▼' : '▲'}</span>
      </div>

      {!collapsed && (
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderTop: 'none', borderRadius: '0 0 10px 10px', overflow: 'hidden' }}>
          <div style={{
            display: 'grid', gridTemplateColumns: cols,
            background: '#1e40af', color: '#fff', padding: '6px 14px', fontSize: 11, fontWeight: 700,
          }}>
            <span>MODELO</span>
            {!isMobile && <span>REPARACIÓN</span>}
            <span style={{ textAlign: 'right' }}>PRECIO FINAL</span>
            {localUnlocked && <span style={{ textAlign: 'right' }}>TU COMISIÓN</span>}
          </div>

          {seriesGroups ? (
            seriesGroups.map(({ name: seriesName, items: seriesItems }) => (
              <div key={seriesName}>
                <div style={{
                  padding: '5px 14px', background: '#eff6ff', fontSize: 10, fontWeight: 700,
                  color: '#3b82f6', letterSpacing: '0.08em', textTransform: 'uppercase',
                  borderBottom: '1px solid #dbeafe', borderTop: '1px solid #dbeafe',
                }}>
                  — {seriesName}
                </div>
                {seriesItems.map((item, i) => (
                  <PriceRow key={item.id} item={item} i={i} isLast={i === seriesItems.length - 1} cols={cols} localUnlocked={localUnlocked} brand={brand} onItemClick={onItemClick} isMobile={isMobile} />
                ))}
              </div>
            ))
          ) : (
            items.map((item, i) => (
              <PriceRow key={item.id} item={item} i={i} isLast={i === items.length - 1} cols={cols} localUnlocked={localUnlocked} brand={brand} onItemClick={onItemClick} isMobile={isMobile} />
            ))
          )}
        </div>
      )}
    </div>
  )
}

// ─── CeluLabPriceList (main export) ──────────────────────────────────────────

export default function CeluLabPriceList({
  localUnlocked = false,
  onOpenPin,
  embedded = false,
  localName,
  localSlug,
  onItemClick,
}: {
  localUnlocked?: boolean
  onOpenPin?: () => void
  embedded?: boolean
  localName?: string
  localSlug?: string
  onItemClick?: (item: PriceListItem) => void
}) {
  const [tab, setTab] = useState('modulos')
  const [items, setItems] = useState<PriceListItem[]>([])
  const [brands, setBrands] = useState<string[]>([])
  const [brand, setBrand] = useState('')
  const [series, setSeries] = useState('')
  const [q, setQ] = useState('')
  const [showSinStock, setShowSinStock] = useState(false)
  const [total, setTotal] = useState(0)
  const [offset, setOffset] = useState(0)
  const [loading, setLoading] = useState(false)
  const [lastSync, setLastSync] = useState('')
  const [isMobile, setIsMobile] = useState(false)
  const LIMIT = 120

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  const fetchItems = useCallback(async (t: string, b: string, search: string, off: number) => {
    setLoading(true)
    const params = new URLSearchParams({ tab: t, limit: String(LIMIT), offset: String(off) })
    if (b) params.set('brand', b)
    if (search) params.set('q', search)
    const res = await fetch(`/api/celulab/lista?${params}`).then(r => r.json())
    setItems(res.items ?? [])
    setTotal(res.total ?? 0)
    setBrands(res.brands ?? [])
    setLoading(false)
    setLastSync(new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }))
  }, [])

  useEffect(() => {
    setOffset(0); setBrand(''); setQ('')
    fetchItems(tab, '', '', 0)
  }, [tab, fetchItems])

  useEffect(() => {
    const interval = setInterval(() => fetchItems(tab, brand, q, offset), 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [tab, brand, q, offset, fetchItems])

  const searchRef = useRef<ReturnType<typeof setTimeout>>(null)
  function handleSearch(val: string) {
    setQ(val)
    if (searchRef.current) clearTimeout(searchRef.current)
    searchRef.current = setTimeout(() => { setOffset(0); fetchItems(tab, brand, val, 0) }, 350)
  }

  function handleBrand(val: string) {
    setBrand(val); setSeries(''); setOffset(0); fetchItems(tab, val, q, 0)
  }

  const baseItems = showSinStock ? items : items.filter(i => i.stock)
  const displayItems = series
    ? baseItems.filter(i => getSeriesKey(i.brand || 'Varios', i.name) === series)
    : baseItems

  // Available series for current brand (from loaded items)
  const availableSeries = brand && SERIES_ORDER[brand]
    ? SERIES_ORDER[brand].filter(s =>
        baseItems.some(i => (i.brand || 'Varios') === brand && getSeriesKey(brand, i.name) === s)
      )
    : []
  const grouped = displayItems.reduce<Record<string, PriceListItem[]>>((acc, item) => {
    const b = item.brand || 'Varios'
    if (!acc[b]) acc[b] = []
    acc[b].push(item)
    return acc
  }, {})
  const orderedBrands = [
    ...BRAND_ORDER.filter(b => grouped[b]),
    ...Object.keys(grouped).filter(b => !BRAND_ORDER.includes(b)).sort(),
  ]

  const content = (
    <>
      {/* Header — only in standalone mode */}
      {!embedded && (
        <div style={{ background: 'linear-gradient(135deg, #1e1b4b 0%, #2563eb 100%)', padding: '0 20px' }}>
          <div style={{ maxWidth: 1000, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 56 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 20, fontWeight: 900, color: '#fff', letterSpacing: '-0.03em' }}>📱 CeluLab</span>
              <span style={{ fontSize: 11, color: '#93c5fd', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Lista de precios</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: 12, color: '#93c5fd' }}>
                {lastSync ? `Act. ${lastSync}` : ''}
                {' '}
                <button onClick={() => fetchItems(tab, brand, q, offset)}
                  style={{ background: 'none', border: 'none', color: '#60a5fa', cursor: 'pointer', fontSize: 12, padding: 0 }}>
                  ↻
                </button>
              </span>
              {localUnlocked ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  {localName && localSlug ? (
                    <>
                      <span style={{ fontSize: 11, color: '#93c5fd' }}>
                        🏪 {localName}
                      </span>
                      <a href={`/market/celulab/local/${localSlug}`} style={{
                        fontSize: 11, background: '#16a34a', color: '#fff',
                        borderRadius: 6, padding: '3px 10px', textDecoration: 'none', fontWeight: 700,
                      }}>
                        Ir a mi panel →
                      </a>
                    </>
                  ) : (
                    <span style={{ fontSize: 11, background: '#16a34a22', color: '#4ade80', border: '1px solid #16a34a44', borderRadius: 6, padding: '3px 8px' }}>
                      ✓ Vista local
                    </span>
                  )}
                </div>
              ) : onOpenPin ? (
                <button onClick={onOpenPin} style={{
                  fontSize: 11, background: 'rgba(255,255,255,0.1)', color: '#cbd5e1',
                  border: '1px solid rgba(255,255,255,0.2)', borderRadius: 6,
                  padding: '4px 10px', cursor: 'pointer',
                }}>
                  🔓 Soy local
                </button>
              ) : null}
            </div>
          </div>

          {/* Tabs */}
          <div style={{ maxWidth: 1000, margin: '0 auto', display: 'flex', gap: 2, borderTop: '1px solid rgba(255,255,255,0.1)', overflowX: 'auto' }}>
            {PRICE_TABS.map(t => (
              <button key={t.key} onClick={() => setTab(t.key)} style={{
                padding: '10px 16px', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap',
                background: 'transparent', color: tab === t.key ? '#fff' : '#93c5fd',
                borderBottom: tab === t.key ? '3px solid #60a5fa' : '3px solid transparent',
              }}>
                {t.icon} {t.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Tabs — embedded mode */}
      {embedded && (
        <div style={{ display: 'flex', gap: 2, overflowX: 'auto', borderBottom: '2px solid #e5e7eb', marginBottom: 12 }}>
          {PRICE_TABS.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)} style={{
              padding: '8px 14px', border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap',
              background: 'transparent', color: tab === t.key ? '#2563eb' : '#6b7280',
              borderBottom: tab === t.key ? '2px solid #2563eb' : '2px solid transparent',
              marginBottom: -2,
            }}>
              {t.icon} {t.label}
            </button>
          ))}
        </div>
      )}

      {/* Filters */}
      <div style={{ background: '#fff', borderBottom: '1px solid #e5e7eb', padding: embedded ? '10px 0 12px' : isMobile ? '10px 12px 12px' : '10px 20px 12px' }}>
        <div style={{ maxWidth: embedded ? '100%' : 1000, margin: '0 auto' }}>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 10 }}>
            <input
              style={{ flex: 1, padding: '8px 12px', borderRadius: 8, border: '1px solid #d1d5db', fontSize: 13 }}
              placeholder="🔍 Buscar modelo..."
              value={q} onChange={e => handleSearch(e.target.value)}
            />
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#6b7280', cursor: 'pointer', whiteSpace: 'nowrap' }}>
              <input type="checkbox" checked={showSinStock} onChange={e => setShowSinStock(e.target.checked)} />
              Sin stock
            </label>
            <span style={{ fontSize: 12, color: '#9ca3af', whiteSpace: 'nowrap' }}>
              {loading ? 'Cargando...' : `${total}`}
            </span>
          </div>
          {/* Brand pills */}
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            <button
              onClick={() => handleBrand('')}
              style={{
                padding: '5px 14px', borderRadius: 20, fontSize: 12, fontWeight: 600, cursor: 'pointer',
                border: brand === '' ? '1.5px solid #2563eb' : '1.5px solid #e5e7eb',
                background: brand === '' ? '#2563eb' : '#fff',
                color: brand === '' ? '#fff' : '#374151',
              }}
            >
              Todas
            </button>
            {[...BRAND_ORDER.filter(b => brands.includes(b)), ...brands.filter(b => !BRAND_ORDER.includes(b)).sort()].map(b => (
              <button
                key={b}
                onClick={() => handleBrand(brand === b ? '' : b)}
                style={{
                  padding: '5px 14px', borderRadius: 20, fontSize: 12, fontWeight: 600, cursor: 'pointer',
                  border: brand === b ? '1.5px solid #1e1b4b' : '1.5px solid #e5e7eb',
                  background: brand === b ? '#1e1b4b' : '#f9fafb',
                  color: brand === b ? '#fff' : '#374151',
                  transition: 'all 0.15s',
                }}
              >
                {b}
              </button>
            ))}
          </div>

          {/* Series pills — only when a brand with series is selected */}
          {availableSeries.length > 0 && (
            <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginTop: 8, paddingTop: 8, borderTop: '1px solid #f3f4f6' }}>
              <button
                onClick={() => setSeries('')}
                style={{
                  padding: '3px 11px', borderRadius: 14, fontSize: 11, fontWeight: 600, cursor: 'pointer',
                  border: series === '' ? '1.5px solid #3b82f6' : '1.5px solid #e5e7eb',
                  background: series === '' ? '#eff6ff' : '#fff',
                  color: series === '' ? '#1d4ed8' : '#6b7280',
                }}
              >
                Todas
              </button>
              {availableSeries.map(s => (
                <button
                  key={s}
                  onClick={() => setSeries(series === s ? '' : s)}
                  style={{
                    padding: '3px 11px', borderRadius: 14, fontSize: 11, fontWeight: 600, cursor: 'pointer',
                    border: series === s ? '1.5px solid #3b82f6' : '1.5px solid #e5e7eb',
                    background: series === s ? '#eff6ff' : '#fff',
                    color: series === s ? '#1d4ed8' : '#6b7280',
                    transition: 'all 0.15s',
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: embedded ? '100%' : 1000, margin: '0 auto', padding: embedded ? '16px 0' : isMobile ? '12px' : '20px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: 60, color: '#9ca3af' }}>Cargando...</div>
        ) : orderedBrands.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 60, color: '#9ca3af' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>📦</div>
            <div style={{ fontWeight: 600, color: '#6b7280' }}>Sin resultados</div>
          </div>
        ) : (
          <>
            {orderedBrands.map(b => (
              <BrandSection key={b} brand={b} items={grouped[b]} localUnlocked={localUnlocked} onItemClick={onItemClick} isMobile={isMobile} />
            ))}
            {total > LIMIT && (
              <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 24 }}>
                <button onClick={() => { const o = Math.max(0, offset - LIMIT); setOffset(o); fetchItems(tab, brand, q, o) }}
                  disabled={offset === 0}
                  style={{ padding: '8px 18px', borderRadius: 8, border: '1px solid #d1d5db', background: '#fff', cursor: offset === 0 ? 'not-allowed' : 'pointer', opacity: offset === 0 ? 0.4 : 1 }}>
                  ← Anterior
                </button>
                <span style={{ padding: '8px 12px', fontSize: 13, color: '#6b7280' }}>
                  {offset + 1}–{Math.min(offset + LIMIT, total)} de {total}
                </span>
                <button onClick={() => { const o = offset + LIMIT; if (o < total) { setOffset(o); fetchItems(tab, brand, q, o) } }}
                  disabled={offset + LIMIT >= total}
                  style={{ padding: '8px 18px', borderRadius: 8, border: '1px solid #d1d5db', background: '#fff', cursor: offset + LIMIT >= total ? 'not-allowed' : 'pointer', opacity: offset + LIMIT >= total ? 0.4 : 1 }}>
                  Siguiente →
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Footer */}
      {!embedded && (
        <div style={{ background: '#f9fafb', borderTop: '1px solid #e5e7eb', padding: '12px 20px', textAlign: 'center' }}>
          <div style={{ fontSize: 11, color: '#9ca3af' }}>
            Precios en ARS · Actualización automática · Precio final incluye repuesto + ganancia + mano de obra
            {localUnlocked && ' · Tu comisión = 1/3 de la mano de obra'}
          </div>
        </div>
      )}
    </>
  )

  if (embedded) return <div style={{ background: '#f8fafc' }}>{content}</div>

  return <div style={{ minHeight: '100vh', background: '#f8fafc', fontFamily: 'system-ui' }}>{content}</div>
}