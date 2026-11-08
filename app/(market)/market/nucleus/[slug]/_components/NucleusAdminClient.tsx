'use client'
import { useState, useEffect, useCallback, useRef } from 'react'
import { OrdersTab } from './OrdersTab'
import { LocalesTab } from './LocalesTab'
import { CajaTab } from './CajaTab'
import { VentasTab } from './VentasTab'
import { TiendaTab } from './TiendaTab'

// ─── Types ────────────────────────────────────────────────────────────────────

type Provider = {
  id: string; name: string; url: string
  scrape_type: 'playwright' | 'manual'
  is_active: boolean; last_scraped_at: string | null; notes: string
}

type RepairConfig = {
  id: string; tab_key: string; category: string; label: string
  markup_ars: number; labor_ars: number; sort_order: number
}

type Part = {
  id: string; name: string; category: string; service_name: string; notes: string
  cl_provider_prices?: Array<{ cost_ars: number; url_item: string; scraped_at: string; cl_providers: { id: string; name: string } | null }>
}

type MarginRow = {
  service_id: string; service_name: string; category: string; price_ars: number
  best_cost: { cost_ars: number; provider: string; url_item: string; scraped_at: string } | null
  all_costs: Array<{ cost_ars: number; provider: string }>
  margin_ars: number | null; margin_pct: number | null
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const CATS = ['Pantallas', 'Batería', 'Conectores', 'Cámara', 'Datos & Software', 'Mantenimiento']

const CAT_LABELS: Record<string, string> = {
  modulo_android: 'Módulo Android',
  modulo_iphone: 'Módulo iPhone',
  bateria_android: 'Batería Android',
  bateria_iphone: 'Batería iPhone',
  pin_carga: 'Pin de carga',
  placa_carga: 'Placa de carga',
}

async function readPanelJson(url: string) {
  const response = await fetch(url, { cache: 'no-store' })
  if (!response.ok) throw new Error('Error al cargar ' + url)
  return response.json()
}

function calcFinal(category: string, cost: number, configs: RepairConfig[]): number {
  const cfg = configs.find(c => c.category === category)
  if (cfg) return cost + cfg.markup_ars + cfg.labor_ars
  return cost + 5000 + 15000
}

function ars(n: number) {
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0 }).format(n)
}

function ago(iso: string | null) {
  if (!iso) return 'Nunca'
  const d = (Date.now() - new Date(iso).getTime()) / 1000
  if (d < 60) return 'Hace un momento'
  if (d < 3600) return `Hace ${Math.floor(d / 60)}min`
  if (d < 86400) return `Hace ${Math.floor(d / 3600)}h`
  return `Hace ${Math.floor(d / 86400)}d`
}

function marginColor(pct: number | null) {
  if (pct === null) return '#9ca3af'
  if (pct >= 50) return '#16a34a'
  if (pct >= 30) return '#ca8a04'
  return '#dc2626'
}

// ─── Root ─────────────────────────────────────────────────────────────────────

export default function NucleusAdminClient({
  clientId, companyName, pin, color, publicUrl,
}: {
  clientId: string; companyName: string; pin?: string; color: string; publicUrl: string
}) {
  const [unlocked, setUnlocked] = useState(false)
  const [pinInput, setPinInput] = useState('')
  const [pinErr, setPinErr] = useState(false)

  // Persist unlock in sessionStorage so no re-login on refresh
  useEffect(() => {
    if (pin === undefined) {
      fetch('/api/celulab/nucleus-session', {cache:'no-store'}).then(r => setUnlocked(r.ok)).catch(() => {})
      return
    }
    if (sessionStorage.getItem(`nucleus-${clientId}`) === 'ok') setUnlocked(true)
  }, [clientId, pin])

  async function tryPin() {
    const valid = pin === undefined
      ? await fetch('/api/celulab/nucleus-session', {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({pin:pinInput})}).then(r=>r.ok).catch(()=>false)
      : pinInput === pin
    if (valid) {
      setUnlocked(true)
      if (pin !== undefined) sessionStorage.setItem(`nucleus-${clientId}`, 'ok')
    } else {
      setPinErr(true)
      setPinInput('')
      setTimeout(() => setPinErr(false), 2000)
    }
  }

  if (!unlocked) return (
    <PinScreen
      companyName={companyName} color={color}
      pinInput={pinInput} pinErr={pinErr}
      onInput={setPinInput} onSubmit={tryPin}
    />
  )

  return <AdminPanel clientId={clientId} companyName={companyName} color={color} publicUrl={publicUrl} />
}

// ─── PIN Screen ───────────────────────────────────────────────────────────────

function PinScreen({ companyName, color, pinInput, pinErr, onInput, onSubmit }: {
  companyName: string; color: string; pinInput: string; pinErr: boolean
  onInput: (v: string) => void; onSubmit: () => void
}) {
  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: '#0a0a0a', fontFamily: 'system-ui',
    }}>
      <div style={{
        background: '#111', border: '1px solid #222', borderRadius: 20,
        padding: '40px 36px', width: 340, textAlign: 'center',
      }}>
        <div style={{
          width: 56, height: 56, borderRadius: 16,
          background: color + '22', border: `1px solid ${color}44`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 26, margin: '0 auto 20px',
        }}>🔒</div>

        <div style={{ fontSize: 11, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#555', marginBottom: 6 }}>
          Panel privado
        </div>
        <div style={{ fontSize: 22, fontWeight: 700, color: '#fff', marginBottom: 28 }}>
          {companyName}
        </div>

        <input
          type="password"
          maxLength={8}
          value={pinInput}
          onChange={e => onInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && onSubmit()}
          placeholder="PIN de acceso"
          style={{
            width: '100%', padding: '12px 16px', borderRadius: 10,
            border: `1px solid ${pinErr ? '#ef4444' : '#2a2a2a'}`,
            background: '#0d0d0d', color: '#fff', fontSize: 16,
            textAlign: 'center', letterSpacing: '0.3em', outline: 'none',
            boxSizing: 'border-box', marginBottom: 12,
            transition: 'border-color .2s',
          }}
          autoFocus
        />

        {pinErr && (
          <div style={{ fontSize: 12, color: '#ef4444', marginBottom: 10 }}>PIN incorrecto</div>
        )}

        <button onClick={onSubmit} style={{
          width: '100%', padding: '12px', borderRadius: 10, border: 'none',
          background: color, color: '#fff', fontWeight: 700, fontSize: 14,
          cursor: 'pointer',
        }}>
          Ingresar →
        </button>
      </div>
    </div>
  )
}

// ─── Admin Panel ──────────────────────────────────────────────────────────────

function AdminPanel({ clientId, companyName, color, publicUrl }: { clientId: string; companyName: string; color: string; publicUrl: string }) {
  const [tab, setTab] = useState<'ordenes' | 'locales' | 'ventas' | 'caja' | 'margenes' | 'proveedores' | 'repuestos' | 'precios' | 'lista' | 'tienda' | 'qr'>('ordenes')
  const [repairConfigs, setRepairConfigs] = useState<RepairConfig[]>([])
  const [configEditing, setConfigEditing] = useState<Record<string, { markup: string; labor: string }>>({})
  const [configSaving, setConfigSaving] = useState<string | null>(null)
  const [syncLoading, setSyncLoading] = useState(false)
  const [syncResult, setSyncResult] = useState<string | null>(null)
  const [syncTiendaLoading, setSyncTiendaLoading] = useState(false)
  const [syncTiendaResult, setSyncTiendaResult] = useState<string | null>(null)
  const [splitPct, setSplitPct] = useState(70)
  const [providers, setProviders] = useState<Provider[]>([])
  const [parts, setParts] = useState<Part[]>([])
  const [partsTotal, setPartsTotal] = useState(0)
  const [partsOffset, setPartsOffset] = useState(0)
  const [partsQ, setPartsQ] = useState('')
  const [partsCat, setPartsCat] = useState('')
  const [partsLoading, setPartsLoading] = useState(false)
  const PARTS_LIMIT = 60
  const [margins, setMargins] = useState<MarginRow[]>([])
  const [loading, setLoading] = useState(true)
  const [pendingRequests, setPendingRequests] = useState(0)

  // Forms
  const [showProvForm, setShowProvForm] = useState(false)
  const [provForm, setProvForm] = useState({ name: '', url: '', scrape_type: 'manual', notes: '' })
  const [provSaving, setProvSaving] = useState(false)

  const [showPartForm, setShowPartForm] = useState(false)
  const [partForm, setPartForm] = useState({ name: '', category: CATS[0], service_name: '', notes: '' })
  const [partSaving, setPartSaving] = useState(false)

  // Price modal
  const [priceModal, setPriceModal] = useState<{ part: Part | null; open: boolean }>({ part: null, open: false })
  const [priceItems, setPriceItems] = useState<Record<string, { cost_ars: string; url_item: string }>>({})
  const [priceSaving, setPriceSaving] = useState(false)

  // Inline price editing
  const [editingPrice, setEditingPrice] = useState<{ id: string; val: string } | null>(null)
  const [priceSavingInline, setPriceSavingInline] = useState(false)

  // Markups por servicio (persistido en localStorage)
  const [markups, setMarkups] = useState<Record<string, number>>({})
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    try { const s = localStorage.getItem('celulab-service-markups'); if (s) setMarkups(JSON.parse(s)) } catch {}
  }, [])

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  function updateMarkup(serviceId: string, val: number) {
    const next = { ...markups, [serviceId]: val }
    setMarkups(next)
    localStorage.setItem('celulab-service-markups', JSON.stringify(next))
  }

  // Suppress unused warning
  void clientId

  const [loadError, setLoadError] = useState('')
  const fetchParts = useCallback(async (q: string, cat: string, offset: number) => {
    setPartsLoading(true)
    try {
      const rows: Part[] = await readPanelJson('/api/celulab/parts')
      const filtered = rows.filter(row => (!cat || row.category === cat) && row.name.toLowerCase().includes(q.toLowerCase()))
      setParts(filtered.slice(offset, offset + PARTS_LIMIT))
      setPartsTotal(filtered.length)
    } catch { setLoadError('No pudimos cargar los repuestos.') }
    finally { setPartsLoading(false) }
  }, [])

  const fetchAll = useCallback(async () => {
    setLoading(true)
    setLoadError('')
    const results = await Promise.allSettled([
      readPanelJson('/api/celulab/providers').then(setProviders),
      readPanelJson('/api/celulab/margins').then(setMargins),
      readPanelJson('/api/celulab/configs').then((configs: RepairConfig[]) => {
        setRepairConfigs(configs)
        const edits: Record<string, { markup: string; labor: string }> = {}
        configs.forEach(cfg => { edits[cfg.id] = { markup: String(cfg.markup_ars), labor: String(cfg.labor_ars) } })
        setConfigEditing(edits)
      }),
      fetchParts('', '', 0),
    ])
    if (results.some(result => result.status === 'rejected')) setLoadError('No pudimos cargar todos los datos del panel.')
    setLoading(false)
  }, [fetchParts])

  async function saveConfig(cfg: RepairConfig) {
    const edit = configEditing[cfg.id]
    if (!edit) return
    setConfigSaving(cfg.id)
    const response = await fetch('/api/celulab/configs', {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: cfg.id, markup_ars: Number(edit.markup), labor_ars: Number(edit.labor) }),
    })
    setConfigSaving(null)
    if (!response.ok) { setLoadError('No se pudo guardar el precio. Revisá la sesión administradora.'); return }
    fetchAll()
  }

  async function triggerSync() {
    setSyncLoading(true); setSyncResult(null)
    const res = await fetch('/api/celulab/sync').then(r => r.json())
    setSyncLoading(false)
    setSyncResult(res.ok ? `✓ ${res.mapped} repuestos sincronizados (${res.synced_at?.slice(11,16)})` : `Error: ${res.error}`)
  }

  function supportsCatalogue(url: string) {
    try {
      const source = new URL(url)
      return source.hostname === 'mayori.store' && /^\/onlysanluis(?:\/|$)/i.test(source.pathname)
    } catch { return false }
  }

  async function triggerSyncTienda() {
    if (syncTiendaLoading) return
    setSyncTiendaLoading(true); setSyncTiendaResult(null)
    try {
      const response = await fetch('/api/celulab/sync/tienda', { method: 'POST' })
      const res = await response.json()
      if (!response.ok || !res.ok) throw new Error(res.error || 'No se pudo actualizar el catálogo')
      const cats = Object.keys(res.categories || {}).length
      setSyncTiendaResult(`✓ ${res.upserted} productos actualizados en ${cats} categorías`)
    } catch (error) {
      setSyncTiendaResult(`Error: ${error instanceof Error ? error.message : 'No se pudo conectar con el proveedor'}`)
    } finally { setSyncTiendaLoading(false) }
  }

  useEffect(() => { fetchAll() }, [fetchAll])

  // Poll solicitudes pendientes para badge
  useEffect(() => {
    function checkRequests() {
      fetch('/api/celulab/partners/requests', { cache: 'no-store' })
        .then(r => r.json())
        .then((data: Array<{ status: string }>) => {
          setPendingRequests(Array.isArray(data) ? data.filter(r => r.status === 'pendiente').length : 0)
        })
        .catch(() => {})
    }
    checkRequests()
    const interval = setInterval(checkRequests, 30000)
    return () => clearInterval(interval)
  }, [])

  // Debounced search
  useEffect(() => {
    const t = setTimeout(() => { setPartsOffset(0); fetchParts(partsQ, partsCat, 0) }, 350)
    return () => clearTimeout(t)
  }, [partsQ, partsCat, fetchParts])

  async function saveServicePrice() {
    if (!editingPrice) return
    const price = Number(editingPrice.val)
    if (!price || price <= 0) { setEditingPrice(null); return }
    setPriceSavingInline(true)
    await fetch('/api/celulab/services', {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ service_id: editingPrice.id, price_ars: price }),
    })
    setPriceSavingInline(false)
    setEditingPrice(null)
    fetchAll()
  }

  // Save provider
  async function saveProvider() {
    if (!provForm.name || !provForm.url) return
    setProvSaving(true)
    await fetch('/api/celulab/providers', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(provForm),
    })
    setProvForm({ name: '', url: '', scrape_type: 'manual', notes: '' })
    setShowProvForm(false); setProvSaving(false); fetchAll()
  }

  async function deleteProvider(id: string) {
    if (!confirm('¿Eliminar proveedor? Se borran todos sus precios.')) return
    await fetch(`/api/celulab/providers/${id}`, { method: 'DELETE' })
    fetchAll()
  }

  // Save part
  async function savePart() {
    if (!partForm.name || !partForm.category) return
    setPartSaving(true)
    await fetch('/api/celulab/parts', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(partForm),
    })
    setPartForm({ name: '', category: CATS[0], service_name: '', notes: '' })
    setShowPartForm(false); setPartSaving(false); fetchAll()
  }

  // Price modal
  function openPriceModal(part: Part) {
    const init: Record<string, { cost_ars: string; url_item: string }> = {}
    providers.forEach(p => {
      const ex = part.cl_provider_prices?.find(pp => pp.cl_providers?.id === p.id)
      init[p.id] = { cost_ars: ex ? String(ex.cost_ars) : '', url_item: ex?.url_item ?? '' }
    })
    setPriceItems(init)
    setPriceModal({ part, open: true })
  }

  async function savePrices() {
    if (!priceModal.part) return
    setPriceSaving(true)
    const entries = Object.entries(priceItems).filter(([, v]) => v.cost_ars && Number(v.cost_ars) > 0)
    for (const [provider_id, entry] of entries) {
      await fetch('/api/celulab/scrape', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider_id,
          items: [{ part_id: priceModal.part!.id, cost_ars: Number(entry.cost_ars), url_item: entry.url_item }],
        }),
      })
    }
    setPriceSaving(false)
    setPriceModal({ part: null, open: false })
    fetchAll()
  }

  const grouped = CATS.reduce<Record<string, MarginRow[]>>((acc, cat) => {
    acc[cat] = margins.filter(m => m.category === cat)
    return acc
  }, {})

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', fontFamily: 'system-ui' }}>

      {/* Top bar */}
      <div style={{
        background: '#fff', borderBottom: '1px solid #e5e7eb',
        padding: isMobile ? '0 12px' : '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 56,
        position: 'sticky', top: 0, zIndex: 10,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 30, height: 30, borderRadius: 8, background: color,
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14,
          }}>📱</div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 14, lineHeight: 1 }}>{companyName}</div>
            <div style={{ fontSize: 10, color: '#9ca3af', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Panel privado · NUCLEUS IA</div>
          </div>
        </div>
        <button onClick={fetchAll} style={{ fontSize: 12, color: '#6b7280', background: 'none', border: 'none', cursor: 'pointer' }}>
          ↻ Actualizar
        </button>
      </div>

      {/* Tabs */}
      <style>{`.cl-nucleus-tabs::-webkit-scrollbar{display:none}.cl-nucleus-tabs{scrollbar-width:none}`}</style>
      <div className="cl-nucleus-tabs" style={{ background: '#fff', borderBottom: '1px solid #e5e7eb', padding: '0 8px', display: 'flex', gap: 0, overflowX: 'auto' }}>
        {(['ordenes', 'locales', 'ventas', 'caja', 'lista', 'margenes', 'proveedores', 'repuestos', 'precios', 'tienda', 'qr'] as const).map(t => {
          const label = t === 'ordenes' ? '📋 Órdenes' : t === 'locales' ? '🏪 Locales' : t === 'ventas' ? '🛍 Ventas' : t === 'caja' ? '💰 Caja' : t === 'lista' ? '📊 Lista' : t === 'margenes' ? '📈 Márgenes' : t === 'proveedores' ? '🏷 Proveedores' : t === 'repuestos' ? '🔩 Repuestos' : t === 'precios' ? '💲 Precios' : t === 'tienda' ? '🛒 Tienda' : '📲 QR'
          return (
            <button key={t} onClick={() => setTab(t)} style={{
              padding: '12px 14px', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600,
              borderBottom: tab === t ? `2px solid ${color}` : '2px solid transparent',
              color: tab === t ? color : '#6b7280', background: 'transparent', whiteSpace: 'nowrap',
              position: 'relative', flexShrink: 0,
            }}>
              {label}
              {t === 'locales' && pendingRequests > 0 && (
                <span style={{
                  position: 'absolute', top: 6, right: 4,
                  background: '#ef4444', color: '#fff',
                  borderRadius: '50%', width: 17, height: 17,
                  fontSize: 10, fontWeight: 900,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  lineHeight: 1,
                }}>
                  {pendingRequests}
                </span>
              )}
            </button>
          )
        })}
      </div>

      <div style={{ maxWidth: 960, margin: '0 auto', padding: isMobile ? '16px 8px' : '28px 24px' }}>
        {loadError && <p role="alert">{loadError} <button onClick={fetchAll}>Reintentar</button></p>}
        {loading && ['proveedores','margenes','repuestos','precios'].includes(tab) ? (
          <div style={{ textAlign: 'center', color: '#9ca3af', padding: 64 }}>Cargando...</div>
        ) : (
          <>

            {/* ══ ÓRDENES ══ */}
            {tab === 'ordenes' && <OrdersTab color={color} />}

            {/* ══ LOCALES ══ */}
            {tab === 'locales' && <LocalesTab color={color} />}

            {/* ══ VENTAS ══ */}
            {tab === 'ventas' && <VentasTab color={color} />}

            {/* ══ CAJA ══ */}
            {tab === 'caja' && <CajaTab color={color} />}

            {/* ══ LISTA ══ */}
            {tab === 'lista' && <AdminListaTab color={color} configs={repairConfigs} />}

            {/* ══ TIENDA ══ */}
            {tab === 'tienda' && <TiendaTab color={color} />}

            {/* ══ QR ══ */}
            {tab === 'qr' && (
              <QRTab publicUrl={publicUrl} companyName={companyName} color={color} />
            )}

            {/* ══ MÁRGENES ══ */}
            {tab === 'margenes' && (
              <div>
                <div style={{ fontSize: 12, color: '#9ca3af', marginBottom: 20 }}>
                  Editá el precio de venta haciendo click en ✏️ · Ingresá el markup del repuesto para ver la ganancia real.
                </div>
                {margins.length === 0 ? (
                  <Empty title="Sin datos de costos" desc="Agregá proveedores y cargá precios para ver los márgenes." />
                ) : (
                  CATS.map(cat => {
                    const rows = grouped[cat] ?? []
                    if (!rows.length) return null
                    return (
                      <div key={cat} style={{ marginBottom: 32 }}>
                        <div style={{ fontSize: 11, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>{cat}</div>
                        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, overflow: 'hidden' }}>
                          <div style={{ overflowX: 'auto' }}>
                          <table style={{ width: '100%', minWidth: 640, borderCollapse: 'collapse', fontSize: 13 }}>
                            <thead>
                              <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                                <th style={{ textAlign: 'left', padding: '8px 14px', fontWeight: 600, fontSize: 12 }}>Servicio</th>
                                <th style={{ textAlign: 'right', padding: '8px 14px', fontWeight: 600, fontSize: 12 }}>Precio venta</th>
                                <th style={{ textAlign: 'right', padding: '8px 14px', fontWeight: 600, fontSize: 12 }}>Costo repuesto (provs.)</th>
                                <th style={{ textAlign: 'right', padding: '8px 14px', fontWeight: 600, fontSize: 12 }}>+ Markup repuesto</th>
                                <th style={{ textAlign: 'right', padding: '8px 14px', fontWeight: 600, fontSize: 12 }}>Ganancia</th>
                                <th style={{ textAlign: 'right', padding: '8px 14px', fontWeight: 600, fontSize: 12 }}>%</th>
                              </tr>
                            </thead>
                            <tbody>
                              {rows.map((row, i) => {
                                const markup = markups[row.service_id] ?? 0
                                const trueCost = row.best_cost ? row.best_cost.cost_ars + markup : null
                                const gainArs = trueCost !== null ? row.price_ars - trueCost : null
                                const gainPct = gainArs !== null && row.price_ars > 0
                                  ? Math.round((gainArs / row.price_ars) * 100)
                                  : null
                                const isEditing = editingPrice?.id === row.service_id
                                return (
                                  <tr key={i} style={{ borderBottom: '1px solid #f3f4f6' }}>
                                    {/* Servicio */}
                                    <td style={{ padding: '12px 14px', maxWidth: 220 }}>{row.service_name}</td>

                                    {/* Precio editable */}
                                    <td style={{ padding: '12px 14px', textAlign: 'right' }}>
                                      {isEditing ? (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 4, justifyContent: 'flex-end' }}>
                                          <input
                                            type="number"
                                            autoFocus
                                            value={editingPrice.val}
                                            onChange={e => setEditingPrice(p => p ? { ...p, val: e.target.value } : p)}
                                            onKeyDown={e => { if (e.key === 'Enter') saveServicePrice(); if (e.key === 'Escape') setEditingPrice(null) }}
                                            style={{ width: 100, padding: '4px 8px', borderRadius: 6, border: `1px solid ${color}`, fontSize: 13, textAlign: 'right' }}
                                          />
                                          <button onClick={saveServicePrice} disabled={priceSavingInline}
                                            style={{ padding: '4px 10px', borderRadius: 6, border: 'none', background: color, color: '#fff', fontSize: 12, cursor: 'pointer', fontWeight: 700 }}>
                                            {priceSavingInline ? '…' : '✓'}
                                          </button>
                                          <button onClick={() => setEditingPrice(null)}
                                            style={{ padding: '4px 8px', borderRadius: 6, border: '1px solid #e5e7eb', background: '#fff', fontSize: 12, cursor: 'pointer', color: '#9ca3af' }}>
                                            ✕
                                          </button>
                                        </div>
                                      ) : (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'flex-end' }}>
                                          <span style={{ fontWeight: 700 }}>{ars(row.price_ars)}</span>
                                          <button
                                            onClick={() => setEditingPrice({ id: row.service_id, val: String(row.price_ars) })}
                                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', fontSize: 13, padding: '0 2px', lineHeight: 1 }}
                                            title="Editar precio"
                                          >✏️</button>
                                        </div>
                                      )}
                                    </td>

                                    {/* Todos los proveedores */}
                                    <td style={{ padding: '12px 14px', textAlign: 'right' }}>
                                      {row.all_costs.length === 0 ? (
                                        <span style={{ color: '#d1d5db', fontSize: 12 }}>Sin dato</span>
                                      ) : (
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 3 }}>
                                          {row.all_costs.map((c, j) => (
                                            <div key={j} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                                              <span style={{ fontSize: 10, color: '#9ca3af', background: '#f3f4f6', borderRadius: 4, padding: '1px 5px' }}>{c.provider}</span>
                                              <span style={{ fontWeight: 600, fontSize: 13 }}>{ars(c.cost_ars)}</span>
                                              {row.best_cost?.provider === c.provider && (
                                                <span style={{ fontSize: 9, color: '#16a34a', fontWeight: 700 }}>✓</span>
                                              )}
                                            </div>
                                          ))}
                                        </div>
                                      )}
                                    </td>

                                    {/* Markup repuesto editable */}
                                    <td style={{ padding: '12px 14px', textAlign: 'right' }}>
                                      <div style={{ display: 'flex', alignItems: 'center', gap: 4, justifyContent: 'flex-end' }}>
                                        <span style={{ color: '#9ca3af', fontSize: 12 }}>+$</span>
                                        <input
                                          type="number"
                                          min={0}
                                          value={markup || ''}
                                          placeholder="0"
                                          onChange={e => updateMarkup(row.service_id, Number(e.target.value) || 0)}
                                          style={{ width: 80, padding: '4px 8px', borderRadius: 6, border: '1px solid #e5e7eb', fontSize: 13, textAlign: 'right', background: markup > 0 ? '#f0fdf4' : '#fff' }}
                                        />
                                      </div>
                                    </td>

                                    {/* Ganancia */}
                                    <td style={{ padding: '12px 14px', textAlign: 'right', fontWeight: 700, color: marginColor(gainPct) }}>
                                      {gainArs !== null ? ars(gainArs) : '—'}
                                    </td>

                                    {/* % */}
                                    <td style={{ padding: '12px 14px', textAlign: 'right' }}>
                                      {gainPct !== null ? (
                                        <span style={{
                                          background: marginColor(gainPct) + '18',
                                          color: marginColor(gainPct),
                                          borderRadius: 6, padding: '3px 9px', fontWeight: 700, fontSize: 12,
                                        }}>{gainPct}%</span>
                                      ) : '—'}
                                    </td>
                                  </tr>
                                )
                              })}
                            </tbody>
                          </table>
                          </div>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            )}

            {/* ══ PROVEEDORES ══ */}
            {tab === 'proveedores' && (
              <div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'flex-end', marginBottom: 16 }}>
                  <Btn onClick={triggerSyncTienda} color={color} disabled={syncTiendaLoading || !providers.some(p => p.is_active && supportsCatalogue(p.url))}>
                    {syncTiendaLoading ? 'Actualizando…' : 'Actualizar proveedores conectados'}
                  </Btn>
                  <Btn onClick={() => setShowProvForm(true)} color={color}>+ Nuevo proveedor</Btn>
                </div>

                {showProvForm && (
                  <FormCard title="Nuevo proveedor" onClose={() => setShowProvForm(false)}>
                    <Field label="Nombre *"><input style={inp} value={provForm.name} onChange={e => setProvForm(p => ({ ...p, name: e.target.value }))} placeholder="ej: MercadoLibre" /></Field>
                    <Field label="URL de lista de precios *"><input style={inp} value={provForm.url} onChange={e => setProvForm(p => ({ ...p, url: e.target.value }))} placeholder="https://..." /></Field>
                    <Field label="Tipo"><select style={inp} value={provForm.scrape_type} onChange={e => setProvForm(p => ({ ...p, scrape_type: e.target.value }))}>
                      <option value="manual">Manual (yo cargo los precios)</option>
                      <option value="playwright">Automático</option>
                    </select></Field>
                    <Field label="Notas"><input style={inp} value={provForm.notes} onChange={e => setProvForm(p => ({ ...p, notes: e.target.value }))} placeholder="contacto, condiciones, etc." /></Field>
                    <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                      <Btn onClick={saveProvider} color={color} disabled={provSaving}>{provSaving ? 'Guardando...' : 'Guardar'}</Btn>
                      <BtnSec onClick={() => setShowProvForm(false)}>Cancelar</BtnSec>
                    </div>
                  </FormCard>
                )}

                {providers.length === 0
                  ? <Empty title="Sin proveedores" desc="Agregá tu primer proveedor para empezar a comparar precios." />
                  : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {providers.map(p => (
                        <div key={p.id} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: '14px 18px', display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 16 }}>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 600, fontSize: 14 }}>{p.name}</div>
                            <a href={p.url} target="_blank" rel="noreferrer" style={{ fontSize: 12, color: color, wordBreak: 'break-all' }}>{p.url}</a>
                            {p.notes && <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 2 }}>{p.notes}</div>}
                          </div>
                          <div style={{ textAlign: 'right', fontSize: 12, flexShrink: 0 }}>
                            <div style={{ color: '#9ca3af' }}>Último scraping</div>
                            <div style={{ fontWeight: 600, color: '#374151' }}>{ago(p.last_scraped_at)}</div>
                          </div>
                          {supportsCatalogue(p.url) ? (
                            <div style={{ maxWidth: 260 }}>
                              <button onClick={triggerSyncTienda} disabled={syncTiendaLoading || !p.is_active}
                                style={{ minHeight: 44, padding: '8px 12px', borderRadius: 8, border: '1px solid #bfdbfe', background: '#eff6ff', color: '#1d4ed8', cursor: 'pointer' }}>
                                {syncTiendaLoading ? 'Actualizando…' : '↻ Actualizar catálogo de tienda'}
                              </button>
                              {syncTiendaResult && <div role="status" style={{ fontSize: 12, marginTop: 6 }}>{syncTiendaResult}</div>}
                            </div>
                          ) : <span style={{ fontSize: 12 }}>Sin conexión automática</span>}
                          <BtnSec onClick={() => deleteProvider(p.id)} style={{ color: '#ef4444', borderColor: '#fecaca', fontSize: 12 }}>Eliminar</BtnSec>
                        </div>
                      ))}
                    </div>
                  )}
              </div>
            )}

            {/* ══ PRECIOS ══ */}
            {tab === 'precios' && (
              <div>
                {/* Link to lista */}
                <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 12, padding: '14px 18px', marginBottom: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontWeight: 700, color: '#1d4ed8', fontSize: 14 }}>📋 Lista pública mayorista</div>
                    <div style={{ fontSize: 12, color: '#3b82f6', marginTop: 2 }}>PIN de acceso: <strong>2050</strong> · Compartí este link con los locales</div>
                  </div>
                  <a href="/market/celulab/lista" target="_blank" rel="noreferrer"
                    style={{ padding: '8px 16px', borderRadius: 8, background: '#2563eb', color: '#fff', fontWeight: 700, fontSize: 13, textDecoration: 'none' }}>
                    Ver lista →
                  </a>
                </div>

                {/* Sync ONLY */}
                <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: '16px 20px', marginBottom: 20 }}>
                  <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>🔄 Sincronizar ONLY San Luis</div>
                  <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 12 }}>Actualiza los precios de ONLY desde su API en tiempo real.</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <button onClick={triggerSync} disabled={syncLoading}
                      style={{ padding: '8px 18px', borderRadius: 8, border: 'none', background: color, color: '#fff', fontWeight: 700, fontSize: 13, cursor: syncLoading ? 'not-allowed' : 'pointer', opacity: syncLoading ? 0.7 : 1 }}>
                      {syncLoading ? '⏳ Sincronizando...' : '↻ Sincronizar ahora'}
                    </button>
                    {syncResult && <span style={{ fontSize: 12, color: syncResult.startsWith('✓') ? '#16a34a' : '#ef4444' }}>{syncResult}</span>}
                  </div>
                </div>

                {/* Sync Tienda */}
                <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: '16px 20px', marginBottom: 20 }}>
                  <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>🛒 Sincronizar Tienda (accesorios)</div>
                  <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 12 }}>Importa todos los accesorios de ONLY San Luis con precio, stock e imágenes a la tienda pública.</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                    <button onClick={triggerSyncTienda} disabled={syncTiendaLoading}
                      style={{ padding: '8px 18px', borderRadius: 8, border: 'none', background: '#7c3aed', color: '#fff', fontWeight: 700, fontSize: 13, cursor: syncTiendaLoading ? 'not-allowed' : 'pointer', opacity: syncTiendaLoading ? 0.7 : 1 }}>
                      {syncTiendaLoading ? '⏳ Importando...' : '↻ Importar catálogo'}
                    </button>
                    <a href="/market/celulab/tienda" target="_blank" style={{ fontSize: 12, color: '#6b7280', textDecoration: 'none' }}>
                      Ver tienda →
                    </a>
                    {syncTiendaResult && <span style={{ fontSize: 12, color: syncTiendaResult.startsWith('✓') ? '#16a34a' : '#ef4444' }}>{syncTiendaResult}</span>}
                  </div>
                </div>

                {/* Division split */}
                <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: '16px 20px', marginBottom: 20 }}>
                  <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>✂️ División mano de obra (técnico / local)</div>
                  <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 12 }}>
                    Del total de mano de obra cobrada, qué % te quedás vos como técnico. El resto va al local.
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <input type="range" min={50} max={90} step={5} value={splitPct} onChange={e => setSplitPct(Number(e.target.value))}
                        style={{ width: 160 }} />
                      <span style={{ fontWeight: 700, fontSize: 16, color: color, minWidth: 40 }}>{splitPct}%</span>
                    </div>
                    <span style={{ fontSize: 13, color: '#6b7280' }}>Técnico · {100 - splitPct}% Local</span>
                  </div>
                  <div style={{ marginTop: 10, fontSize: 12, color: '#9ca3af' }}>
                    Ej: mano de obra $30.000 → técnico {ars(30000 * splitPct / 100)} · local {ars(30000 * (100 - splitPct) / 100)}
                  </div>
                </div>

                {/* Repair configs */}
                <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 14 }}>🔧 Ganancia y mano de obra por categoría</div>
                {repairConfigs.length === 0 ? (
                  <div style={{ color: '#9ca3af', fontSize: 13 }}>Cargando configuraciones...</div>
                ) : (
                  <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, overflow: 'hidden' }}>
                    <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', minWidth: 580, borderCollapse: 'collapse', fontSize: 13 }}>
                      <thead>
                        <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                          {['Categoría', 'Tab', '+ Ganancia repuesto', '+ Mano de obra', '= Precio final (ej. $15k costo)', ''].map(h => (
                            <th key={h} style={{ padding: '8px 14px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#6b7280' }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {repairConfigs.map((cfg, i) => {
                          const edit = configEditing[cfg.id] || { markup: String(cfg.markup_ars), labor: String(cfg.labor_ars) }
                          const exampleFinal = 15000 + Number(edit.markup || 0) + Number(edit.labor || 0)
                          const isSaving = configSaving === cfg.id
                          return (
                            <tr key={cfg.id} style={{ borderBottom: '1px solid #f3f4f6', background: i % 2 === 0 ? '#fff' : '#f9fafb' }}>
                              <td style={{ padding: '10px 14px', fontWeight: 600 }}>{cfg.label}</td>
                              <td style={{ padding: '10px 14px' }}>
                                <span style={{ fontSize: 10, background: '#f3f4f6', borderRadius: 4, padding: '2px 6px', color: '#374151' }}>{cfg.tab_key}</span>
                              </td>
                              <td style={{ padding: '10px 14px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                  <span style={{ color: '#9ca3af', fontSize: 12 }}>+$</span>
                                  <input type="number" value={edit.markup} onChange={e => setConfigEditing(prev => ({ ...prev, [cfg.id]: { ...edit, markup: e.target.value } }))}
                                    style={{ width: 90, padding: '4px 8px', borderRadius: 6, border: '1px solid #d1d5db', fontSize: 13 }} />
                                </div>
                              </td>
                              <td style={{ padding: '10px 14px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                  <span style={{ color: '#9ca3af', fontSize: 12 }}>+$</span>
                                  <input type="number" value={edit.labor} onChange={e => setConfigEditing(prev => ({ ...prev, [cfg.id]: { ...edit, labor: e.target.value } }))}
                                    style={{ width: 90, padding: '4px 8px', borderRadius: 6, border: '1px solid #d1d5db', fontSize: 13 }} />
                                </div>
                              </td>
                              <td style={{ padding: '10px 14px', color: '#2563eb', fontWeight: 700 }}>
                                {ars(exampleFinal)}
                              </td>
                              <td style={{ padding: '10px 14px' }}>
                                <button onClick={() => saveConfig(cfg)} disabled={isSaving}
                                  style={{ padding: '5px 14px', borderRadius: 7, border: 'none', background: color, color: '#fff', fontWeight: 700, fontSize: 12, cursor: isSaving ? 'not-allowed' : 'pointer', opacity: isSaving ? 0.7 : 1 }}>
                                  {isSaving ? '...' : 'Guardar'}
                                </button>
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ══ REPUESTOS ══ */}
            {tab === 'repuestos' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
                  <div style={{ fontSize: 13, color: '#6b7280' }}>
                    {partsTotal} repuestos · {providers.filter(p => p.is_active).length} proveedores
                  </div>
                  <Btn onClick={() => setShowPartForm(true)} color={color}>+ Nuevo repuesto</Btn>
                </div>

                {/* Filtros */}
                <div style={{ display: 'flex', gap: 10, marginBottom: 14, flexWrap: 'wrap' }}>
                  <input
                    style={{ ...inp, flex: '1 1 200px', minWidth: 160 }}
                    placeholder="🔍 Buscar modelo..."
                    value={partsQ}
                    onChange={e => setPartsQ(e.target.value)}
                  />
                  <select
                    style={{ ...inp, flex: '0 0 180px' }}
                    value={partsCat}
                    onChange={e => setPartsCat(e.target.value)}
                  >
                    <option value="">Todas las categorías</option>
                    <option value="modulo_android">Módulo Android</option>
                    <option value="modulo_iphone">Módulo iPhone</option>
                    <option value="bateria_android">Batería Android</option>
                    <option value="bateria_iphone">Batería iPhone</option>
                    <option value="pin_carga">Pin de carga</option>
                    <option value="placa_carga">Placa de carga</option>
                  </select>
                </div>

                {showPartForm && (
                  <FormCard title="Nuevo repuesto" onClose={() => setShowPartForm(false)}>
                    <Field label="Nombre *"><input style={inp} value={partForm.name} onChange={e => setPartForm(p => ({ ...p, name: e.target.value }))} placeholder="ej: Pantalla iPhone 14" /></Field>
                    <Field label="Categoría *"><select style={inp} value={partForm.category} onChange={e => setPartForm(p => ({ ...p, category: e.target.value }))}>
                      {CATS.map(c => <option key={c}>{c}</option>)}
                    </select></Field>
                    <Field label="Servicio CeluLab vinculado (para margen)"><input style={inp} value={partForm.service_name} onChange={e => setPartForm(p => ({ ...p, service_name: e.target.value }))} placeholder="ej: Cambio de pantalla iPhone (14 a 16)" /></Field>
                    <Field label="Notas"><input style={inp} value={partForm.notes} onChange={e => setPartForm(p => ({ ...p, notes: e.target.value }))} /></Field>
                    <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                      <Btn onClick={savePart} color={color} disabled={partSaving}>{partSaving ? 'Guardando...' : 'Guardar'}</Btn>
                      <BtnSec onClick={() => setShowPartForm(false)}>Cancelar</BtnSec>
                    </div>
                  </FormCard>
                )}

                {partsLoading ? (
                  <div style={{ textAlign: 'center', color: '#9ca3af', padding: 40 }}>Cargando...</div>
                ) : parts.length === 0 ? (
                  <Empty title="Sin resultados" desc="Probá con otra búsqueda o categoría." />
                ) : (
                  <>
                    <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, overflow: 'hidden' }}>
                      <div style={{ overflowX: 'auto' }}>
                      <table style={{ width: '100%', minWidth: 520, borderCollapse: 'collapse', fontSize: 13 }}>
                        <thead>
                          <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                            {['Repuesto', 'Categoría', 'Proveedor', 'Precio costo', 'Precio final*'].map(h => (
                              <th key={h} style={{ textAlign: 'left', padding: '8px 14px', fontWeight: 600, fontSize: 12 }}>{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {parts.map(part => {
                            const prices = part.cl_provider_prices ?? []
                            const bestPrice = prices.length > 0
                              ? prices.reduce((a, b) => a.cost_ars < b.cost_ars ? a : b)
                              : null
                            const precioFinal = bestPrice ? calcFinal(part.category, bestPrice.cost_ars, repairConfigs) : null
                            const provName = bestPrice?.cl_providers?.name ?? null
                            return (
                              <tr key={part.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                                <td style={{ padding: '10px 14px', fontWeight: 500, maxWidth: 280 }}>{part.name}</td>
                                <td style={{ padding: '10px 14px', color: '#6b7280', fontSize: 12, whiteSpace: 'nowrap' }}>
                                  {CAT_LABELS[part.category] ?? part.category}
                                </td>
                                <td style={{ padding: '10px 14px' }}>
                                  {provName
                                    ? <span style={{ fontSize: 11, background: '#f3f4f6', color: '#374151', borderRadius: 5, padding: '2px 7px', fontWeight: 600 }}>{provName}</span>
                                    : <span style={{ color: '#d1d5db', fontSize: 12 }}>—</span>}
                                </td>
                                <td style={{ padding: '10px 14px', fontWeight: 600 }}>
                                  {bestPrice ? ars(bestPrice.cost_ars) : <span style={{ color: '#d1d5db', fontSize: 12 }}>Sin stock</span>}
                                </td>
                                <td style={{ padding: '10px 14px', fontWeight: 700, color: color }}>
                                  {precioFinal ? ars(precioFinal) : '—'}
                                </td>
                              </tr>
                            )
                          })}
                        </tbody>
                      </table>
                      </div>
                    </div>

                    {/* Paginación */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 14, fontSize: 13, color: '#6b7280' }}>
                      <span>
                        Mostrando {partsOffset + 1}–{Math.min(partsOffset + PARTS_LIMIT, partsTotal)} de {partsTotal}
                      </span>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <BtnSec onClick={() => { const o = Math.max(0, partsOffset - PARTS_LIMIT); setPartsOffset(o); fetchParts(partsQ, partsCat, o) }} style={{ fontSize: 12, opacity: partsOffset === 0 ? 0.4 : 1 }}>
                          ← Anterior
                        </BtnSec>
                        <BtnSec onClick={() => { const o = partsOffset + PARTS_LIMIT; if (o < partsTotal) { setPartsOffset(o); fetchParts(partsQ, partsCat, o) } }} style={{ fontSize: 12, opacity: partsOffset + PARTS_LIMIT >= partsTotal ? 0.4 : 1 }}>
                          Siguiente →
                        </BtnSec>
                      </div>
                    </div>
                    <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 6 }}>
                      * Precio final = costo + ganancia repuesto + mano de obra (fórmula CeluLab)
                    </div>
                  </>
                )}
              </div>
            )}

          </>
        )}
      </div>

      {/* ══ MODAL PRECIOS ══ */}
      {priceModal.open && priceModal.part && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          onClick={() => setPriceModal({ part: null, open: false })}
        >
          <div style={{ background: '#fff', borderRadius: 14, padding: 28, width: 460, maxWidth: '92vw' }} onClick={e => e.stopPropagation()}>
            <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 4 }}>💰 Cargar precios</div>
            <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 22 }}>{priceModal.part.name}</div>
            {providers.map(prov => (
              <div key={prov.id} style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 5 }}>{prov.name}</div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input type="number" style={{ ...inp, flex: 1 }} placeholder="Costo ARS"
                    value={priceItems[prov.id]?.cost_ars ?? ''}
                    onChange={e => setPriceItems(p => ({ ...p, [prov.id]: { ...p[prov.id], cost_ars: e.target.value } }))}
                  />
                  <input style={{ ...inp, flex: 2 }} placeholder="URL (opcional)"
                    value={priceItems[prov.id]?.url_item ?? ''}
                    onChange={e => setPriceItems(p => ({ ...p, [prov.id]: { ...p[prov.id], url_item: e.target.value } }))}
                  />
                </div>
              </div>
            ))}
            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
              <Btn onClick={savePrices} color={color} disabled={priceSaving}>{priceSaving ? 'Guardando...' : 'Guardar precios'}</Btn>
              <BtnSec onClick={() => setPriceModal({ part: null, open: false })}>Cancelar</BtnSec>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── QR Tab ───────────────────────────────────────────────────────────────────

function QRTab({ publicUrl, companyName, color }: { publicUrl: string; companyName: string; color: string }) {
  const qrApi = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(publicUrl)}&bgcolor=ffffff&color=000000&margin=16`
  const qrDownload = `https://api.qrserver.com/v1/create-qr-code/?size=1000x1000&data=${encodeURIComponent(publicUrl)}&bgcolor=ffffff&color=000000&margin=40`

  // Payment config
  const [pay, setPay] = useState({ alias: '', nombre: '', mp_link: '' })
  const [paySaving, setPaySaving] = useState(false)
  const [paySaved, setPaySaved] = useState(false)

  useEffect(() => {
    fetch('/api/celulab/payment-config').then(r => r.json()).then(d => {
      if (d) setPay({ alias: d.alias ?? '', nombre: d.nombre ?? '', mp_link: d.mp_link ?? '' })
    }).catch(() => {})
  }, [])

  async function savePay() {
    setPaySaving(true)
    await fetch('/api/celulab/payment-config', {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(pay),
    })
    setPaySaving(false)
    setPaySaved(true)
    setTimeout(() => setPaySaved(false), 2500)
  }

  const mpQrUrl = pay.mp_link
    ? `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(pay.mp_link)}&bgcolor=ffffff&color=009ee3&margin=16`
    : null

  function handlePrint() {
    const win = window.open('', '_blank')
    if (!win) return
    win.document.write(`
      <html><head><title>QR ${companyName}</title>
      <style>
        body { margin: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; font-family: system-ui; background: #fff; }
        img { width: 280px; height: 280px; }
        h2 { font-size: 22px; margin: 16px 0 6px; color: #111; }
        p { font-size: 12px; color: #888; margin: 0; }
        @media print { body { padding: 20mm; } }
      </style></head>
      <body>
        <img src="${qrApi}" />
        <h2>${companyName}</h2>
        <p>${publicUrl}</p>
        <script>window.onload = () => { window.print(); window.close(); }<\/script>
      </body></html>
    `)
    win.document.close()
  }

  return (
    <div style={{ maxWidth: 560, margin: '0 auto', padding: '12px 0', display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* Card QR landing */}
      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 16, padding: 28, textAlign: 'center' }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 16 }}>QR — Lista de precios pública</div>
        <div style={{ display: 'inline-block', padding: 14, borderRadius: 12, border: `3px solid ${color}`, background: '#fff', marginBottom: 16 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={qrApi} alt="QR Code" width={180} height={180} style={{ display: 'block' }} />
        </div>
        <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 4 }}>{companyName}</div>
        <div style={{ fontSize: 12, color: '#9ca3af', marginBottom: 20, wordBreak: 'break-all' }}>{publicUrl}</div>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
          <a href={qrDownload} download={`qr-${companyName.toLowerCase().replace(/\s+/g, '-')}.png`} target="_blank" rel="noreferrer"
            style={{ padding: '9px 18px', borderRadius: 9, background: color, color: '#fff', fontWeight: 700, fontSize: 13, textDecoration: 'none' }}>
            ⬇ Descargar PNG
          </a>
          <button onClick={handlePrint} style={{ padding: '9px 18px', borderRadius: 9, border: `1px solid ${color}`, background: '#fff', color: color, fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
            🖨 Imprimir
          </button>
          <button onClick={() => navigator.clipboard.writeText(publicUrl)} style={{ padding: '9px 18px', borderRadius: 9, border: '1px solid #e5e7eb', background: '#fff', color: '#374151', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>
            📋 Copiar link
          </button>
        </div>
      </div>

      {/* Configuración de pago */}
      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 16, padding: 24 }}>
        <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>💳 Método de pago (seña)</div>
        <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 20 }}>
          Configurá el alias o link de MP que va a ver el cliente en la landing para dejar la seña.
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[
            { key: 'nombre', label: 'Nombre de la cuenta', placeholder: 'Ej: CeluLab / Joaquín García' },
            { key: 'alias', label: 'Alias (CBU/CVU)', placeholder: 'Ej: celulab.mp · MODO · etc.' },
            { key: 'mp_link', label: 'Link de Mercado Pago (genera QR automático)', placeholder: 'https://link.mercadopago.com.ar/...' },
          ].map(f => (
            <div key={f.key}>
              <div style={{ fontSize: 11, fontWeight: 600, color: '#374151', marginBottom: 4 }}>{f.label}</div>
              <input
                value={(pay as Record<string, string>)[f.key]}
                onChange={e => setPay(p => ({ ...p, [f.key]: e.target.value }))}
                placeholder={f.placeholder}
                style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #d1d5db', fontSize: 13, boxSizing: 'border-box' }}
              />
            </div>
          ))}
        </div>

        {mpQrUrl && (
          <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', gap: 16, padding: '14px 16px', background: '#f0f9ff', borderRadius: 10, border: '1px solid #7dd3fc' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={mpQrUrl} alt="QR MP" width={80} height={80} style={{ borderRadius: 8 }} />
            <div>
              <div style={{ fontWeight: 700, fontSize: 13, color: '#0369a1' }}>QR de Mercado Pago listo</div>
              <div style={{ fontSize: 12, color: '#0ea5e9', marginTop: 2 }}>Se muestra en la landing para que los clientes escaneen y paguen la seña</div>
            </div>
          </div>
        )}

        <button onClick={savePay} disabled={paySaving}
          style={{ marginTop: 16, padding: '10px 24px', borderRadius: 9, border: 'none', background: paySaved ? '#16a34a' : color, color: '#fff', fontWeight: 700, fontSize: 14, cursor: 'pointer', opacity: paySaving ? 0.7 : 1 }}>
          {paySaving ? 'Guardando...' : paySaved ? '✓ Guardado' : 'Guardar configuración'}
        </button>
      </div>

    </div>
  )
}

// ─── Admin Lista Tab ──────────────────────────────────────────────────────────

type AdminItem = {
  id: string; name: string; brand: string; quality: string; category: string
  stock: boolean; best_cost: number | null; final_price: number | null
  best_provider: string | null; markup_ars: number; labor_ars: number
  all_providers: Array<{ name: string; cost: number }>
}

const LISTA_TABS = [
  { key: 'modulos', label: '📱 Módulos' }, { key: 'baterias', label: '🔋 Baterías' },
  { key: 'partes', label: '🔌 Partes' }, { key: 'camaras', label: '📷 Cámaras' },
  { key: 'tapas', label: '🛡 Tapas' }, { key: 'glass', label: '🔲 Glass' },
  { key: 'placas', label: '🧩 Placas' },
]
const LISTA_BRAND_ORDER = ['Samsung', 'iPhone', 'Motorola', 'Xiaomi', 'LG', 'TCL', 'Huawei', 'ZTE', 'Varios']
const LISTA_CAT_COLOR: Record<string, string> = {
  OLED: '#7c3aed', INCELL: '#2563eb', MECÁNICO: '#16a34a', ORIG: '#d97706',
  WUZIP: '#0891b2', T20: '#be185d', AMM: '#dc2626', COPY: '#6b7280',
}

function AdminListaTab({ color, configs }: { color: string; configs: RepairConfig[] }) {
  const [activeTab, setActiveTab] = useState('modulos')
  const [items, setItems] = useState<AdminItem[]>([])
  const [brands, setBrands] = useState<string[]>([])
  const [brand, setBrand] = useState('')
  const [q, setQ] = useState('')
  const [showSinStock, setShowSinStock] = useState(false)
  const [total, setTotal] = useState(0)
  const [offset, setOffset] = useState(0)
  const [loading, setLoading] = useState(false)
  const [lastSync, setLastSync] = useState('')
  const [isMobile, setIsMobile] = useState(false)
  const [listError, setListError] = useState('')
  const LIMIT = 120

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  const fetchItems = useCallback(async (t: string, b: string, search: string, off: number) => {
    setLoading(true)
    try {
      const rows: (Part & { tab_key: string; stock_qty: number; brand: string; quality: string })[] = await readPanelJson('/api/celulab/parts')
      const tabRows = rows.filter(row => row.tab_key === t)
      setBrands(Array.from(new Set(tabRows.map(row => row.brand).filter(Boolean))).sort())
      const filtered = tabRows.filter(row => (!b || row.brand === b) && row.name.toLowerCase().includes(search.toLowerCase()))
      setItems(filtered.slice(off, off + LIMIT).map(row => {
        const providers = (row.cl_provider_prices || []).map(p => ({ name: p.cl_providers?.name || '', cost: p.cost_ars })).sort((a,b) => a.cost - b.cost)
        const cfg = configs.find(c => c.category === row.category)
        return { ...row, stock: row.stock_qty > 0, best_cost: providers[0]?.cost ?? null, best_provider: providers[0]?.name ?? null,
          all_providers: providers, final_price: providers.length ? calcFinal(row.category,providers[0].cost,configs) : null,
          markup_ars: cfg?.markup_ars ?? 5000, labor_ars: cfg?.labor_ars ?? 15000 }
      }))
      setTotal(filtered.length)
      setLastSync(new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }))
      setListError('')
    } catch { setListError('No pudimos cargar la lista. Tocá Actualizar para reintentar.') }
    finally { setLoading(false) }
  }, [configs])

  useEffect(() => {
    setOffset(0); setBrand(''); setQ('')
    fetchItems(activeTab, '', '', 0)
  }, [activeTab, fetchItems])

  const searchRef = useRef<ReturnType<typeof setTimeout>>(null)
  function handleSearch(val: string) {
    setQ(val)
    if (searchRef.current) clearTimeout(searchRef.current)
    searchRef.current = setTimeout(() => { setOffset(0); fetchItems(activeTab, brand, val, 0) }, 350)
  }

  const displayItems = showSinStock ? items : items.filter(i => i.stock)
  const grouped = displayItems.reduce<Record<string, AdminItem[]>>((acc, item) => {
    const b = item.brand || 'Varios'
    if (!acc[b]) acc[b] = []
    acc[b].push(item)
    return acc
  }, {})
  const orderedBrands = [
    ...LISTA_BRAND_ORDER.filter(b => grouped[b]),
    ...Object.keys(grouped).filter(b => !LISTA_BRAND_ORDER.includes(b)).sort(),
  ]

  return (
    <div>
      <div style={{ display: 'flex', alignItems: isMobile ? 'flex-start' : 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 8 }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: isMobile ? 14 : 16, color: '#111' }}>Lista completa de precios</div>
          {!isMobile && <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 2 }}>Costo real + markup + mano de obra · Para admin solamente</div>}
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {lastSync && <span style={{ fontSize: 12, color: '#9ca3af' }}>Act. {lastSync}</span>}
          <button onClick={() => fetchItems(activeTab, brand, q, offset)}
            style={{ padding: '6px 14px', borderRadius: 8, border: '1px solid #e5e7eb', background: '#fff', fontSize: 12, cursor: 'pointer', color: '#374151' }}>
            ↻ Actualizar
          </button>
        </div>
      </div>

      {listError && <p role="alert">{listError}</p>}
      {/* Sub-tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 14, flexWrap: 'wrap' }}>
        {LISTA_TABS.map(t => (
          <button key={t.key} onClick={() => setActiveTab(t.key)} style={{
            padding: '6px 14px', borderRadius: 20, border: `1px solid ${activeTab === t.key ? color : '#e5e7eb'}`,
            background: activeTab === t.key ? color : '#fff',
            color: activeTab === t.key ? '#fff' : '#374151',
            fontSize: 12, fontWeight: 600, cursor: 'pointer',
          }}>{t.label}</button>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 14, flexWrap: 'wrap', alignItems: 'center' }}>
        <input
          value={q} onChange={e => handleSearch(e.target.value)}
          placeholder="🔍 Buscar modelo..."
          style={{ flex: '1 1 180px', padding: '7px 11px', borderRadius: 8, border: '1px solid #d1d5db', fontSize: 13 }}
        />
        <select value={brand} onChange={e => { setBrand(e.target.value); setOffset(0); fetchItems(activeTab, e.target.value, q, 0) }}
          style={{ padding: '7px 11px', borderRadius: 8, border: '1px solid #d1d5db', fontSize: 13, minWidth: 120 }}>
          <option value="">Todas las marcas</option>
          {brands.map(b => <option key={b} value={b}>{b}</option>)}
        </select>
        <label style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 13, color: '#6b7280', cursor: 'pointer' }}>
          <input type="checkbox" checked={showSinStock} onChange={e => setShowSinStock(e.target.checked)} />
          Sin stock
        </label>
        <span style={{ marginLeft: 'auto', fontSize: 12, color: '#9ca3af' }}>
          {loading ? 'Cargando...' : `${total} items`}
        </span>
      </div>

      {/* Content */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 48, color: '#9ca3af' }}>Cargando lista...</div>
      ) : orderedBrands.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 48, color: '#9ca3af' }}>Sin resultados</div>
      ) : (
        <>
          {orderedBrands.map(b => (
            <AdminBrandSection key={b} brand={b} items={grouped[b]} color={color} isMobile={isMobile} />
          ))}
          {total > LIMIT && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 16 }}>
              <button onClick={() => { const o = Math.max(0, offset - LIMIT); setOffset(o); fetchItems(activeTab, brand, q, o) }}
                disabled={offset === 0}
                style={{ padding: '7px 16px', borderRadius: 8, border: '1px solid #d1d5db', background: '#fff', cursor: offset === 0 ? 'not-allowed' : 'pointer', opacity: offset === 0 ? 0.4 : 1, fontSize: 13 }}>
                ← Anterior
              </button>
              <span style={{ padding: '7px 12px', fontSize: 12, color: '#6b7280' }}>
                {offset + 1}–{Math.min(offset + LIMIT, total)} de {total}
              </span>
              <button onClick={() => { const o = offset + LIMIT; if (o < total) { setOffset(o); fetchItems(activeTab, brand, q, o) } }}
                disabled={offset + LIMIT >= total}
                style={{ padding: '7px 16px', borderRadius: 8, border: '1px solid #d1d5db', background: '#fff', cursor: offset + LIMIT >= total ? 'not-allowed' : 'pointer', opacity: offset + LIMIT >= total ? 0.4 : 1, fontSize: 13 }}>
                Siguiente →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}

function AdminBrandSection({ brand, items, color, isMobile }: { brand: string; items: AdminItem[]; color: string; isMobile?: boolean }) {
  const [collapsed, setCollapsed] = useState(false)
  const cols = isMobile
    ? '1fr 54px 90px 110px'
    : '1fr 60px 90px 100px 80px 80px 110px 100px'

  return (
    <div style={{ marginBottom: 16 }}>
      <div onClick={() => setCollapsed(c => !c)} style={{
        background: color, color: '#fff', padding: '8px 14px',
        borderRadius: collapsed ? 8 : '8px 8px 0 0',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        cursor: 'pointer', userSelect: 'none',
      }}>
        <span style={{ fontWeight: 700, fontSize: 13 }}>{brand.toUpperCase()}</span>
        <span style={{ fontSize: 11, opacity: 0.8 }}>{items.length} · {collapsed ? '▼' : '▲'}</span>
      </div>

      {!collapsed && (
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderTop: 'none', borderRadius: '0 0 8px 8px', overflowX: 'auto' }}>
          {/* Header */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: cols,
            background: '#f9fafb', borderBottom: '1px solid #e5e7eb',
            padding: '5px 12px', fontSize: 10, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase',
            minWidth: isMobile ? 0 : 720,
          }}>
            <span>Modelo</span>
            <span>Cal</span>
            <span>Proveedor</span>
            {!isMobile && <span style={{ textAlign: 'right' }}>Costo</span>}
            {!isMobile && <span style={{ textAlign: 'right' }}>Markup</span>}
            {!isMobile && <span style={{ textAlign: 'right' }}>M.O.</span>}
            <span style={{ textAlign: 'right' }}>Precio final</span>
            {!isMobile && <span style={{ textAlign: 'right' }}>Comisión local</span>}
          </div>

          {items.map((item, i) => {
            const commission = item.labor_ars > 0 ? Math.round(item.labor_ars / 3) : null
            const isLast = i === items.length - 1
            return (
              <div key={item.id} style={{
                display: 'grid',
                gridTemplateColumns: cols,
                padding: '7px 12px', fontSize: 12,
                borderBottom: isLast ? 'none' : '1px solid #f3f4f6',
                background: i % 2 === 0 ? '#fff' : '#fafafa',
                opacity: item.stock ? 1 : 0.5,
                minWidth: isMobile ? 0 : 720,
              }}>
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: 500 }}>
                  {!item.stock && <span style={{ fontSize: 8, color: '#ef4444', marginRight: 3 }}>●</span>}
                  {item.name.replace(brand.toUpperCase(), '').replace(brand, '').trim() || item.name}
                </span>

                <span>
                  {item.quality ? (
                    <span style={{
                      fontSize: 9, fontWeight: 700, padding: '1px 4px', borderRadius: 3,
                      background: (LISTA_CAT_COLOR[item.quality] || '#6b7280') + '18',
                      color: LISTA_CAT_COLOR[item.quality] || '#6b7280',
                    }}>{item.quality}</span>
                  ) : '—'}
                </span>

                <span style={{ fontSize: 11, color: '#6b7280', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {item.best_provider || '—'}
                </span>

                {!isMobile && (
                  <span style={{ textAlign: 'right', color: '#dc2626', fontWeight: 600 }}>
                    {item.best_cost ? ars(item.best_cost) : <span style={{ color: '#d1d5db' }}>—</span>}
                  </span>
                )}

                {!isMobile && (
                  <span style={{ textAlign: 'right', color: '#7c3aed' }}>
                    {item.markup_ars > 0 ? `+${ars(item.markup_ars)}` : '—'}
                  </span>
                )}

                {!isMobile && (
                  <span style={{ textAlign: 'right', color: '#0891b2' }}>
                    {item.labor_ars > 0 ? `+${ars(item.labor_ars)}` : '—'}
                  </span>
                )}

                <span style={{ textAlign: 'right', fontWeight: 700, color: '#1d4ed8' }}>
                  {item.final_price ? ars(item.final_price) : '—'}
                </span>

                {!isMobile && (
                  <span style={{ textAlign: 'right', fontWeight: 600, color: '#16a34a' }}>
                    {commission ? ars(commission) : '—'}
                  </span>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ─── Mini-components ──────────────────────────────────────────────────────────

function Empty({ title, desc }: { title: string; desc: string }) {
  return (
    <div style={{ textAlign: 'center', padding: '56px 24px', color: '#9ca3af' }}>
      <div style={{ fontSize: 36, marginBottom: 12 }}>📦</div>
      <div style={{ fontWeight: 600, fontSize: 15, color: '#6b7280', marginBottom: 6 }}>{title}</div>
      <div style={{ fontSize: 13 }}>{desc}</div>
    </div>
  )
}

function FormCard({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 12, padding: 20, marginBottom: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <span style={{ fontWeight: 600, fontSize: 14 }}>{title}</span>
        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', fontSize: 16 }}>✕</button>
      </div>
      {children}
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ fontSize: 11, fontWeight: 600, color: '#374151', marginBottom: 4 }}>{label}</div>
      {children}
    </div>
  )
}

function Btn({ onClick, color, disabled, children }: { onClick: () => void; color: string; disabled?: boolean; children: React.ReactNode }) {
  return (
    <button onClick={onClick} disabled={disabled} style={{
      padding: '9px 18px', borderRadius: 9, border: 'none', background: color,
      color: '#fff', fontWeight: 700, fontSize: 13, cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.7 : 1,
    }}>{children}</button>
  )
}

function BtnSec({ onClick, style, children }: { onClick: () => void; style?: React.CSSProperties; children: React.ReactNode }) {
  return (
    <button onClick={onClick} style={{
      padding: '9px 16px', borderRadius: 9, border: '1px solid #e5e7eb',
      background: '#fff', color: '#374151', fontSize: 13, cursor: 'pointer', ...style,
    }}>{children}</button>
  )
}

const inp: React.CSSProperties = {
  width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid #d1d5db',
  fontSize: 13, background: '#fff', boxSizing: 'border-box',
}