'use client'
import ExtraJobs from '../../../celulab/_components/ExtraJobs'
import ShareOrder from '../../../celulab/_components/ShareOrder'
import { useState, useEffect, useCallback } from 'react'
import { PatternLock } from '../../../celulab/_components/PatternLock'

// ─── Types ────────────────────────────────────────────────────────────────────

export type Partner = {
  id: string; name: string; commission_pct: number; phone: string; address: string
}

type DamageMarker = { x: number; y: number; side: 'front' | 'back' }

type BudgetItem = { desc: string; price: number; is_cost?: boolean }

type Order = {
  id: string
  order_number: string
  status: string
  created_at: string
  client_name: string
  client_dni: string
  client_phone: string
  device_brand: string
  device_model: string
  has_battery: boolean
  has_chip: boolean
  has_cover: boolean
  has_memory: boolean
  turns_on: boolean
  water_damage: boolean
  revision_required: boolean
  unlock_type: 'pin' | 'patron' | 'none'
  unlock_code: string
  damage_diagram: { markers?: DamageMarker[] }
  requested_work: string
  notes: string
  deposit_ars: number
  budget_ars: number
  total_ars: number
  part_cost_ars: number
  commission_pct: number
  commission_ars: number
  warranty_days: number
  partner_id: string | null
  budget_items: BudgetItem[]
  diagnostic_result: string
  delivery_days: number
  cl_partners?: { name: string; phone?: string; address?: string } | null
}

// ─── Constants ────────────────────────────────────────────────────────────────

const STATUS_LABELS: Record<string, string> = {
  ingresado: 'Ingresado',
  en_revision: 'En revisión',
  presupuesto_enviado: 'Presupuesto enviado',
  aprobado: 'Aprobado',
  rechazado: 'Rechazado',
  en_reparacion: 'En reparación',
  listo: 'Listo — en taller ✓',
  retirado_por_local: 'Retirado por local',
  entregado_al_cliente: 'Entregado al cliente',
  entregado: 'Entregado',
}

const STATUS_COLORS: Record<string, string> = {
  ingresado: '#6366f1',
  en_revision: '#f59e0b',
  presupuesto_enviado: '#3b82f6',
  aprobado: '#10b981',
  rechazado: '#ef4444',
  en_reparacion: '#8b5cf6',
  listo: '#059669',
  retirado_por_local: '#0ea5e9',
  entregado_al_cliente: '#9ca3af',
  entregado: '#9ca3af',
}

// Para órdenes de locales: listo → retirado_por_local → entregado_al_cliente
// Para órdenes directas: listo → entregado
const NEXT_STATUS: Record<string, string[]> = {
  ingresado: ['en_revision', 'presupuesto_enviado'],
  en_revision: ['presupuesto_enviado'],
  presupuesto_enviado: ['aprobado', 'rechazado'],
  aprobado: ['en_reparacion'],
  en_reparacion: ['listo'],
  listo: ['retirado_por_local', 'entregado'],
  retirado_por_local: ['entregado_al_cliente'],
  rechazado: ['entregado'],
  entregado_al_cliente: [],
  entregado: [],
}

function ars(n: number) {
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0 }).format(n)
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: '2-digit' })
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function OrdersTab({ color }: { color: string }) {
  const [orders, setOrders] = useState<Order[]>([])
  const [partners, setPartners] = useState<Partner[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [partnerFilter, setPartnerFilter] = useState<string>('all')
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [showNewForm, setShowNewForm] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())

  const fetchData = useCallback(async () => {
    const url = statusFilter === 'all' ? '/api/celulab/orders' : `/api/celulab/orders?status=${statusFilter}`
    const [ord, part] = await Promise.all([
      fetch(url).then(r => r.json()),
      fetch('/api/celulab/partners').then(r => r.json()),
    ])
    setOrders(Array.isArray(ord) ? ord : [])
    setPartners(Array.isArray(part) ? part : [])
    setLastUpdated(new Date())
    setLoading(false)
  }, [statusFilter])

  useEffect(() => { fetchData() }, [fetchData])

  // Auto-refresh cada 30 segundos
  useEffect(() => {
    const interval = setInterval(() => fetchData(), 30000)
    return () => clearInterval(interval)
  }, [fetchData])

  async function changeStatus(order: Order, newStatus: string) {
    await fetch(`/api/celulab/orders/${order.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    })
    fetchData()
    setSelectedOrder(prev => prev?.id === order.id ? { ...prev, status: newStatus } : prev)
  }

  async function updateEconomic(order: Order, updates: Partial<Order>) {
    const res = await fetch(`/api/celulab/orders/${order.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    })
    const updated = await res.json()
    setSelectedOrder(updated)
    fetchData()
  }

  if (selectedOrder) {
    return (
      <OrderDetail
        order={selectedOrder}
        partners={partners}
        color={color}
        onBack={() => setSelectedOrder(null)}
        onStatusChange={changeStatus}
        onUpdateEconomic={updateEconomic}
      />
    )
  }

  if (showNewForm) {
    return (
      <NewOrderForm
        color={color}
        partners={partners}
        onClose={() => setShowNewForm(false)}
        onSaved={() => { setShowNewForm(false); fetchData() }}
      />
    )
  }

  const visibleOrders = partnerFilter === 'all'
    ? orders
    : partnerFilter === '__direct__'
      ? orders.filter(o => !o.partner_id)
      : orders.filter(o => o.partner_id === partnerFilter)

  function secsAgo() {
    const d = Math.floor((Date.now() - lastUpdated.getTime()) / 1000)
    if (d < 5) return 'ahora'
    if (d < 60) return `hace ${d}s`
    return `hace ${Math.floor(d / 60)}m`
  }

  // Stats del mes
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const thisMonthOrders = orders.filter(o => new Date(o.created_at) >= startOfMonth)
  const facturadoMes = thisMonthOrders
    .filter(o => !['rechazado'].includes(o.status) && o.budget_ars > 0)
    .reduce((sum, o) => sum + (o.budget_ars ?? 0), 0)
  const activasCount = orders.filter(o => !['entregado_al_cliente', 'entregado', 'rechazado'].includes(o.status)).length
  const listaCount = orders.filter(o => o.status === 'listo').length

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: 18 }}>Órdenes de Servicio</div>
          <div style={{ fontSize: 13, color: '#6b7280' }}>
            {visibleOrders.length} orden{visibleOrders.length !== 1 ? 'es' : ''}
            <span style={{ fontSize: 11, color: '#d1d5db', marginLeft: 8 }}>· actualizado {secsAgo()}</span>
          </div>
        </div>
        <button onClick={() => setShowNewForm(true)} style={{
          padding: '10px 20px', borderRadius: 10, border: 'none',
          background: color, color: '#fff', fontWeight: 700, fontSize: 14, cursor: 'pointer',
        }}>
          + Nueva orden
        </button>
      </div>

      {/* Stats strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 20 }}>
        {[
          { label: 'Activas', val: activasCount, icon: '⚙️', color: '#6366f1' },
          { label: 'Listas en taller', val: listaCount, icon: '✅', color: '#059669' },
          { label: 'Ingresadas este mes', val: thisMonthOrders.length, icon: '📋', color: '#f59e0b' },
          { label: 'Facturado este mes', val: facturadoMes > 0 ? ars(facturadoMes) : '—', icon: '💰', color: '#0ea5e9', isText: true },
        ].map(s => (
          <div key={s.label} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: '14px 16px', textAlign: 'center' }}>
            <div style={{ fontSize: 20, marginBottom: 4 }}>{s.icon}</div>
            <div style={{ fontSize: s.isText ? 14 : 24, fontWeight: 800, color: s.color, letterSpacing: s.isText ? '-0.02em' : 0 }}>{s.val}</div>
            <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Partner filter */}
      {partners.length > 0 && (
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
          {[
            { id: 'all', label: '🏠 Todos los locales' },
            { id: '__direct__', label: '⚡ Directo (sin local)' },
            ...partners.map(p => ({ id: p.id, label: `🏪 ${p.name}` })),
          ].map(opt => {
            const active = partnerFilter === opt.id
            return (
              <button key={opt.id} onClick={() => setPartnerFilter(opt.id)} style={{
                padding: '5px 14px', borderRadius: 20, fontSize: 12, fontWeight: 700, cursor: 'pointer',
                border: `1px solid ${active ? color : '#e5e7eb'}`,
                background: active ? color : '#fff',
                color: active ? '#fff' : '#6b7280',
              }}>
                {opt.label}
                {opt.id !== 'all' && (
                  <span style={{ marginLeft: 5, fontSize: 11, opacity: 0.75 }}>
                    ({opt.id === '__direct__'
                      ? orders.filter(o => !o.partner_id).length
                      : orders.filter(o => o.partner_id === opt.id).length})
                  </span>
                )}
              </button>
            )
          })}
        </div>
      )}

      {/* Status filters */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 20 }}>
        {(['all', ...Object.keys(STATUS_LABELS)]).map(s => {
          const active = statusFilter === s
          const c = s === 'all' ? color : STATUS_COLORS[s]
          return (
            <button key={s} onClick={() => setStatusFilter(s)} style={{
              padding: '5px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600, cursor: 'pointer',
              border: `1px solid ${active ? c : '#e5e7eb'}`,
              background: active ? c + '18' : '#fff',
              color: active ? c : '#9ca3af',
            }}>
              {s === 'all' ? 'Todas' : STATUS_LABELS[s]}
            </button>
          )
        })}
      </div>

      {/* List */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 64, color: '#9ca3af' }}>Cargando...</div>
      ) : visibleOrders.length === 0 ? (
        <EmptyOrders onNew={() => setShowNewForm(true)} />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {visibleOrders.map(order => (
            <OrderRow key={order.id} order={order} color={color} onClick={() => setSelectedOrder(order)} />
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Order Row ─────────────────────────────────────────────────────────────────

function OrderRow({ order, color, onClick }: { order: Order; color: string; onClick: () => void }) {
  const sc = STATUS_COLORS[order.status] ?? '#9ca3af'
  return (
    <div
      onClick={onClick}
      style={{
        background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12,
        padding: '14px 18px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 16,
      }}
      onMouseEnter={e => (e.currentTarget.style.borderColor = color)}
      onMouseLeave={e => (e.currentTarget.style.borderColor = '#e5e7eb')}
    >
      <div style={{ fontWeight: 700, fontSize: 14, color: '#111', minWidth: 84, fontFamily: 'monospace' }}>
        {order.order_number}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 600, fontSize: 14 }}>{order.client_name}</div>
        <div style={{ fontSize: 12, color: '#6b7280' }}>{order.device_brand} {order.device_model}</div>
      </div>
      {order.cl_partners?.name && (
        <div style={{ fontSize: 12, color: '#9ca3af', flexShrink: 0 }}>📍 {order.cl_partners.name}</div>
      )}
      <div style={{
        padding: '4px 10px', borderRadius: 8, fontSize: 11, fontWeight: 700,
        background: sc + '18', color: sc, flexShrink: 0,
      }}>
        {STATUS_LABELS[order.status] ?? order.status}
      </div>
      <div style={{ fontSize: 12, color: '#d1d5db', flexShrink: 0 }}>{fmtDate(order.created_at)}</div>
      <div style={{ color: '#d1d5db', fontSize: 18 }}>›</div>
    </div>
  )
}

// ─── Order Detail ──────────────────────────────────────────────────────────────

function OrderDetail({
  order, partners, color, onBack, onStatusChange, onUpdateEconomic,
}: {
  order: Order; partners: Partner[]; color: string
  onBack: () => void
  onStatusChange: (o: Order, s: string) => void
  onUpdateEconomic: (o: Order, u: Partial<Order>) => void
}) {
  const sc = STATUS_COLORS[order.status] ?? '#9ca3af'
  const nextStatuses = NEXT_STATUS[order.status] ?? []
  const partner = partners.find(p => p.id === order.partner_id) ?? null

  function handlePrint() {
    const win = window.open('', '_blank')
    if (!win) return
    win.document.write(buildPrintHTML(order, partner, order.warranty_days ?? 0))
    win.document.close()
  }

  return (
    <div>
      <button onClick={onBack} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280', fontSize: 13, marginBottom: 16, padding: 0 }}>
        ← Volver a órdenes
      </button>

      {/* Header card */}
      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 14, padding: '20px 24px', marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div style={{ fontSize: 11, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 2 }}>Orden de servicio</div>
            <div style={{ fontSize: 26, fontWeight: 800, fontFamily: 'monospace' }}>{order.order_number}</div>
            <div style={{ fontSize: 12, color: '#9ca3af' }}>{fmtDate(order.created_at)}</div>
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ padding: '6px 14px', borderRadius: 10, fontWeight: 700, fontSize: 13, background: sc + '18', color: sc }}>
              {STATUS_LABELS[order.status]}
            </span>
            <ExtraJobs id={order.id}/><ShareOrder id={order.id} number={order.order_number} phone={order.client_phone} />
            <button onClick={handlePrint} style={{ padding: '8px 16px', borderRadius: 9, border: '1px solid #e5e7eb', background: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
              🖨 Imprimir
            </button>
          </div>
        </div>

        {nextStatuses.length > 0 && (
          <div style={{ background: '#f9fafb', borderRadius: 10, padding: '12px 16px' }}>
            <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 8, fontWeight: 600 }}>Pasar a:</div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {nextStatuses.map(ns => (
                <button key={ns} onClick={() => onStatusChange(order, ns)} style={{ padding: '7px 16px', borderRadius: 8, border: 'none', cursor: 'pointer', background: STATUS_COLORS[ns], color: '#fff', fontWeight: 700, fontSize: 12 }}>
                  → {STATUS_LABELS[ns]}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Partner notification banner — only when listo + has local */}
      {order.status === 'listo' && order.partner_id && partner?.phone && (
        <div style={{ background: '#dcfce7', border: '1px solid #86efac', borderRadius: 14, padding: '16px 20px', marginBottom: 16 }}>
          <div style={{ fontWeight: 700, fontSize: 14, color: '#14532d', marginBottom: 6 }}>
            📦 El equipo está listo — avisá al local
          </div>
          <div style={{ fontSize: 13, color: '#166534', marginBottom: 12 }}>
            Mandales un WhatsApp a <strong>{order.cl_partners?.name ?? partner.name}</strong> para que vengan a buscarlo.
          </div>
          <a
            href={`https://wa.me/54${partner.phone.replace(/\D/g, '')}?text=${encodeURIComponent(
              `Hola ${order.cl_partners?.name ?? partner.name}! 📦\n\nEl equipo de *${order.client_name}* ya está listo para retirar del taller.\n📱 ${order.device_brand} ${order.device_model} · Orden *${order.order_number}*\n\nCuando quieran pasar a buscarlo, está esperando en el taller.\n\n— CeluLab · San Luis Capital`
            )}`}
            target="_blank"
            rel="noreferrer"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 20px', borderRadius: 9, background: '#25d366', color: '#fff', fontWeight: 700, fontSize: 13, textDecoration: 'none' }}
          >
            📲 Avisar a {order.cl_partners?.name ?? partner.name}
          </a>
        </div>
      )}

      {/* Info grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
        <InfoCard title="👤 Cliente">
          <InfoRow label="Nombre" value={order.client_name} />
          <InfoRow label="DNI" value={order.client_dni || '—'} />
          <InfoRow label="Teléfono" value={order.client_phone || '—'} />
          {order.cl_partners?.name && <InfoRow label="Local" value={order.cl_partners.name} />}
        </InfoCard>

        <InfoCard title="📱 Equipo">
          <InfoRow label="Marca" value={order.device_brand} />
          <InfoRow label="Modelo" value={order.device_model} />
          <InfoRow label="Enciende" value={order.turns_on ? 'SÍ' : 'NO'} />
          <InfoRow label="Humedad" value={order.water_damage ? 'SÍ ⚠️' : 'No'} />
          {order.revision_required && (
            <div style={{ marginTop: 6, padding: '5px 10px', borderRadius: 7, background: '#fef3c7', fontSize: 12, color: '#92400e', fontWeight: 600 }}>⚠️ Revisión diagnóstica requerida ($15.000)</div>
          )}
          <div style={{ marginTop: 8, display: 'flex', gap: 5, flexWrap: 'wrap' }}>
            {[{ k: 'has_battery', l: 'Batería' }, { k: 'has_chip', l: 'Chip' }, { k: 'has_cover', l: 'Tapa' }, { k: 'has_memory', l: 'Memoria' }].map(({ k, l }) => {
              const has = (order as Record<string, unknown>)[k] as boolean
              return <span key={k} style={{ padding: '2px 8px', borderRadius: 6, fontSize: 11, fontWeight: 600, background: has ? '#dcfce7' : '#f1f5f9', color: has ? '#15803d' : '#94a3b8' }}>{l}: {has ? '✓' : '✗'}</span>
            })}
          </div>
        </InfoCard>

        <InfoCard title="🔒 Acceso">
          <InfoRow label="Tipo" value={order.unlock_type === 'pin' ? 'PIN' : order.unlock_type === 'patron' ? 'Patrón' : 'Sin acceso'} />
          {order.unlock_code
            ? <InfoRow label="Código" value={order.unlock_code} mono />
            : <div style={{ fontSize: 12, color: '#f59e0b', marginTop: 4 }}>⚠️ Sin código — no aplica garantía</div>}
        </InfoCard>

        <InfoCard title="🔧 Trabajo pedido">
          <div style={{ fontSize: 13, color: '#374151', lineHeight: 1.6 }}>{order.requested_work || <em style={{ color: '#d1d5db' }}>Sin especificar</em>}</div>
          {order.notes && <div style={{ marginTop: 8, fontSize: 12, color: '#9ca3af', borderTop: '1px solid #f3f4f6', paddingTop: 8 }}>{order.notes}</div>}
        </InfoCard>
      </div>

      {/* Damage diagram */}
      {(order.damage_diagram?.markers ?? []).length > 0 && (
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 14, padding: '18px 20px', marginBottom: 16 }}>
          <div style={{ fontWeight: 600, fontSize: 13, color: '#374151', marginBottom: 12 }}>📍 Daños marcados</div>
          <PhoneDiagramReadonly markers={order.damage_diagram.markers!} />
        </div>
      )}

      {/* Budget form */}
      <BudgetForm order={order} color={color} onUpdateEconomic={onUpdateEconomic} onStatusChange={onStatusChange} />
    </div>
  )
}

// ─── Budget Form ───────────────────────────────────────────────────────────────

function BudgetForm({ order, color, onUpdateEconomic, onStatusChange }: {
  order: Order; color: string
  onUpdateEconomic: (o: Order, u: Partial<Order>) => void
  onStatusChange: (o: Order, s: string) => void
}) {
  const [items, setItems] = useState<BudgetItem[]>(
    order.budget_items?.length ? order.budget_items : []
  )
  const [includeDiag, setIncludeDiag] = useState(
    order.budget_items?.some(i => i.desc.toLowerCase().includes('diagnóstica')) ?? order.revision_required ?? false
  )
  const [diagResult, setDiagResult] = useState(order.diagnostic_result ?? '')
  const [deliveryDays, setDeliveryDays] = useState(order.delivery_days ?? 1)
  const [newDesc, setNewDesc] = useState('')
  const [newPrice, setNewPrice] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [waPreview, setWaPreview] = useState(false)
  const [partSearch, setPartSearch] = useState('')
  const [allParts, setAllParts] = useState<Array<{ id: string; name: string; stock_qty?: number | null; cl_provider_prices?: Array<{ cost_ars: number; cl_providers: { name: string } }> }>>([])
  const [showLookup, setShowLookup] = useState(false)
  const [partsLoading, setPartsLoading] = useState(false)

  const diagItem: BudgetItem = { desc: 'Revisión diagnóstica', price: 15000 }
  const allItems = includeDiag ? [diagItem, ...items] : items
  const total = allItems.reduce((s, i) => s + i.price, 0)
  const costItems = items.filter(i => i.is_cost)
  const totalCost = costItems.reduce((s, i) => s + i.price, 0)
  const labor = total - totalCost - (includeDiag ? 15000 : 0)
  const commPct = order.commission_pct ?? 0
  const commArs = commPct > 0 ? Math.round(labor * commPct / 100) : 0
  const warrantyOk = !!order.unlock_code && labor >= 20000

  function addItem() {
    if (!newDesc.trim() || !newPrice) return
    setItems(prev => [...prev, { desc: newDesc.trim(), price: Number(newPrice) }])
    setNewDesc(''); setNewPrice('')
  }

  async function openLookup() {
    setShowLookup(v => !v)
    if (allParts.length === 0) {
      setPartsLoading(true)
      const data = await fetch('/api/celulab/parts').then(r => r.json()).catch(() => [])
      setAllParts(Array.isArray(data) ? data : [])
      setPartsLoading(false)
    }
  }

  const filteredParts = partSearch.length > 1
    ? allParts.filter(p => p.name.toLowerCase().includes(partSearch.toLowerCase()))
    : []

  function removeItem(i: number) {
    setItems(prev => prev.filter((_, idx) => idx !== i))
  }

  async function saveBudget(andSend = false) {
    setSaving(true); setSaved(false)
    const budgetItems = allItems
    const budgetArs = total
    const warrantyDays = warrantyOk ? 30 : 0
    await onUpdateEconomic(order, {
      budget_items: budgetItems,
      budget_ars: budgetArs,
      total_ars: budgetArs,
      part_cost_ars: totalCost,
      warranty_days: warrantyDays,
      diagnostic_result: diagResult,
      delivery_days: deliveryDays,
    })
    if (andSend && order.status !== 'presupuesto_enviado') {
      await onStatusChange(order, 'presupuesto_enviado')
    }
    setSaving(false); setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  function buildWAText() {
    const items_text = allItems.map(i => `• ${i.desc}: ${ars(i.price)}`).join('\n')
    const diagDiscount = includeDiag ? `\n_Los $15.000 del diagnóstico se descuentan del total si aprobás._` : ''
    const deliveryText = deliveryDays === 1
      ? 'Si aprobás hoy a la mañana, listo esta tarde. Si aprobás a la tarde, mañana temprano.'
      : `Aproximadamente ${deliveryDays} días hábiles.`
    return (
      `Hola ${order.client_name}! 👋\n\n` +
      `*Revisamos tu equipo en CeluLab* 🔧\n` +
      `📱 ${order.device_brand} ${order.device_model} · Orden ${order.order_number}\n\n` +
      (diagResult ? `🔍 *Diagnóstico:*\n${diagResult}\n\n` : '') +
      `💬 *Presupuesto de reparación:*\n${items_text}\n` +
      `━━━━━━━━━━━━━\n` +
      `*TOTAL: ${ars(total)}*${diagDiscount}\n\n` +
      `⏱ *Entrega estimada:* ${deliveryText}\n\n` +
      `¿Lo aprobamos? Respondé *SÍ* para confirmar o escribinos cualquier consulta 🙌\n\n` +
      `🔗 Seguí tu orden en tiempo real:\nhttps://divinia.vercel.app/seguimiento/${order.order_number}\n\n` +
      `— CeluLab · San Luis Capital\n+54 9 2664 501140`
    )
  }

  function buildWALink() {
    if (!order.client_phone) return '#'
    const phone = order.client_phone.replace(/\D/g, '')
    return `https://wa.me/54${phone}?text=${encodeURIComponent(buildWAText())}`
  }

  const isLocked = ['aprobado', 'en_reparacion', 'listo', 'retirado_por_local', 'entregado_al_cliente', 'entregado'].includes(order.status)

  return (
    <div style={{ background: '#fff', border: `2px solid ${color}22`, borderRadius: 14, padding: '22px 24px' }}>
      <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 8 }}>
        📋 Presupuesto
        {order.budget_ars > 0 && order.status === 'presupuesto_enviado' && (
          <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 6, background: '#dbeafe', color: '#1d4ed8', fontWeight: 700 }}>Enviado</span>
        )}
      </div>
      <div style={{ fontSize: 12, color: '#9ca3af', marginBottom: 18 }}>Armá el presupuesto, guardalo y envialo por WhatsApp con un clic.</div>

      {/* Diagnóstico toggle */}
      <div style={{ background: '#fefce8', border: '1px solid #fde68a', borderRadius: 10, padding: '12px 14px', marginBottom: 16 }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: isLocked ? 'default' : 'pointer' }}>
          <input type="checkbox" checked={includeDiag} onChange={e => !isLocked && setIncludeDiag(e.target.checked)}
            style={{ width: 16, height: 16, accentColor: '#ca8a04' }} disabled={isLocked} />
          <div>
            <div style={{ fontWeight: 700, fontSize: 13, color: '#92400e' }}>Incluir revisión diagnóstica — $15.000</div>
            <div style={{ fontSize: 11, color: '#a16207', marginTop: 2 }}>Se descuenta del total si el cliente aprueba la reparación</div>
          </div>
          <div style={{ marginLeft: 'auto', fontWeight: 800, fontSize: 16, color: '#92400e' }}>{ars(15000)}</div>
        </label>
      </div>

      {/* Diagnostic result */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: '#374151', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.05em' }}>🔍 Hallazgo técnico (para el mensaje al cliente)</div>
        <textarea
          value={diagResult}
          onChange={e => !isLocked && setDiagResult(e.target.value)}
          placeholder="Ej: Pantalla rota. Placa en buen estado. Conector de carga con suciedad pero funcional."
          disabled={isLocked}
          style={{ width: '100%', padding: '10px 12px', borderRadius: 9, border: '1px solid #d1d5db', fontSize: 13, lineHeight: 1.5, resize: 'vertical', minHeight: 70, boxSizing: 'border-box', background: isLocked ? '#f9fafb' : '#fff' }}
        />
      </div>

      {/* Items */}
      <div style={{ marginBottom: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Ítems del presupuesto</div>
          {!isLocked && (
            <button onClick={openLookup} style={{ padding: '4px 10px', borderRadius: 7, border: '1px solid #e5e7eb', background: showLookup ? '#eff6ff' : '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer', color: showLookup ? '#1d4ed8' : '#6b7280' }}>
              📦 Buscar repuesto
            </button>
          )}
        </div>

        {/* Parts lookup panel */}
        {showLookup && !isLocked && (
          <div style={{ background: '#f8faff', border: '1px solid #bfdbfe', borderRadius: 12, padding: '14px', marginBottom: 14 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#1d4ed8', marginBottom: 8 }}>🔍 Catálogo de repuestos — proveedores y stock</div>
            <input
              value={partSearch}
              onChange={e => setPartSearch(e.target.value)}
              placeholder="Escribí el repuesto (ej: pantalla A54, batería iPhone 13...)"
              style={{ width: '100%', padding: '9px 12px', borderRadius: 9, border: '1px solid #bfdbfe', fontSize: 13, boxSizing: 'border-box', marginBottom: 10 }}
              autoFocus
            />
            {partsLoading && <div style={{ fontSize: 12, color: '#6b7280', textAlign: 'center', padding: 8 }}>Cargando catálogo...</div>}
            {!partsLoading && partSearch.length > 1 && filteredParts.length === 0 && (
              <div style={{ fontSize: 12, color: '#9ca3af', textAlign: 'center', padding: 8 }}>Sin resultados para &ldquo;{partSearch}&rdquo;</div>
            )}
            {!partsLoading && filteredParts.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {filteredParts.slice(0, 6).map(part => {
                  const prices = (part.cl_provider_prices ?? []).sort((a, b) => a.cost_ars - b.cost_ars)
                  const inStock = typeof part.stock_qty === 'number' && part.stock_qty > 0
                  return (
                    <div key={part.id} style={{ background: '#fff', border: '1px solid #dbeafe', borderRadius: 10, padding: '10px 12px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                        <div style={{ fontWeight: 700, fontSize: 13 }}>{part.name}</div>
                        <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 5, background: inStock ? '#dcfce7' : '#fef2f2', color: inStock ? '#15803d' : '#dc2626' }}>
                          {typeof part.stock_qty === 'number' ? (inStock ? `✓ ${part.stock_qty} en stock` : '✗ Sin stock') : 'Stock sin dato'}
                        </span>
                      </div>
                      {prices.length > 0 ? (
                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>
                          {prices.map((pp, i) => (
                            <div key={i} style={{ fontSize: 12, padding: '3px 9px', borderRadius: 6, background: i === 0 ? '#dcfce7' : '#f3f4f6', color: i === 0 ? '#15803d' : '#6b7280', fontWeight: i === 0 ? 700 : 500 }}>
                              {i === 0 && '★ '}{pp.cl_providers.name}: {ars(pp.cost_ars)}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div style={{ fontSize: 12, color: '#9ca3af', marginBottom: 8 }}>Sin precios de proveedores cargados</div>
                      )}
                      <button
                        onClick={() => { setNewDesc(part.name); setShowLookup(false); setPartSearch('') }}
                        style={{ fontSize: 12, padding: '5px 12px', borderRadius: 7, border: 'none', background: '#6366f1', color: '#fff', fontWeight: 700, cursor: 'pointer' }}
                      >
                        📋 Usar en presupuesto
                      </button>
                    </div>
                  )
                })}
              </div>
            )}
            {!partsLoading && partSearch.length <= 1 && (
              <div style={{ fontSize: 12, color: '#93c5fd', textAlign: 'center' }}>Escribí al menos 2 letras para buscar</div>
            )}
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 10 }}>
          {items.map((item, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#f9fafb', borderRadius: 9, padding: '10px 12px' }}>
              <div style={{ flex: 1, fontSize: 13, fontWeight: 500 }}>{item.desc}</div>
              <div style={{ fontWeight: 700, fontSize: 14, color: '#111', whiteSpace: 'nowrap' }}>{ars(item.price)}</div>
              {!isLocked && (
                <button onClick={() => removeItem(i)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#d1d5db', fontSize: 16, padding: 0, lineHeight: 1 }}>✕</button>
              )}
            </div>
          ))}
        </div>

        {!isLocked && (
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              value={newDesc}
              onChange={e => setNewDesc(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addItem()}
              placeholder="Descripción del ítem (ej: Pantalla INCELL A54)"
              style={{ flex: 2, padding: '9px 12px', borderRadius: 9, border: '1px solid #d1d5db', fontSize: 13 }}
            />
            <input
              type="number"
              value={newPrice}
              onChange={e => setNewPrice(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addItem()}
              placeholder="Precio $"
              style={{ flex: 1, padding: '9px 12px', borderRadius: 9, border: '1px solid #d1d5db', fontSize: 13 }}
            />
            <button onClick={addItem} disabled={!newDesc.trim() || !newPrice} style={{
              padding: '9px 16px', borderRadius: 9, border: 'none', background: color,
              color: '#fff', fontWeight: 700, fontSize: 13, cursor: 'pointer', opacity: !newDesc.trim() || !newPrice ? 0.5 : 1, whiteSpace: 'nowrap',
            }}>+ Agregar</button>
          </div>
        )}
      </div>

      {/* Delivery */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
        <div style={{ fontSize: 12, color: '#6b7280', fontWeight: 600 }}>⏱ Entrega estimada:</div>
        <input
          type="number" min={1} max={30}
          value={deliveryDays}
          onChange={e => !isLocked && setDeliveryDays(Number(e.target.value))}
          disabled={isLocked}
          style={{ width: 60, padding: '6px 10px', borderRadius: 8, border: '1px solid #d1d5db', fontSize: 14, textAlign: 'center' }}
        />
        <div style={{ fontSize: 12, color: '#9ca3af' }}>día(s) hábil(es)</div>
      </div>

      {/* Total + breakdown */}
      {allItems.length > 0 && (
        <div style={{ background: '#f9fafb', borderRadius: 12, padding: '14px 18px', marginBottom: 18 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <div style={{ fontSize: 13, color: '#6b7280', fontWeight: 600 }}>Total presupuesto al cliente</div>
            <div style={{ fontSize: 22, fontWeight: 900, color: '#111' }}>{ars(total)}</div>
          </div>
          <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', fontSize: 13 }}>
            <div>
              <span style={{ color: '#9ca3af' }}>Mano de obra: </span>
              <strong style={{ color: labor >= 20000 ? '#16a34a' : '#dc2626' }}>{ars(labor)}</strong>
              {labor < 20000 && labor > 0 && <span style={{ fontSize: 11, color: '#dc2626', marginLeft: 4 }}>⚠️ bajo mínimo ($20k)</span>}
            </div>
            {commPct > 0 && <div><span style={{ color: '#9ca3af' }}>Comisión local ({commPct}%): </span><strong>{ars(commArs)}</strong></div>}
            <div>
              <span style={{ color: '#9ca3af' }}>Garantía: </span>
              <strong style={{ color: warrantyOk ? '#16a34a' : '#f59e0b' }}>{warrantyOk ? '30 días ✅' : 'Sin garantía'}</strong>
            </div>
            {order.deposit_ars > 0 && <div><span style={{ color: '#9ca3af' }}>Seña ya cobrada: </span><strong>{ars(order.deposit_ars)}</strong></div>}
          </div>
        </div>
      )}

      {/* WA Preview */}
      {waPreview && (
        <div style={{ background: '#dcfce7', border: '1px solid #86efac', borderRadius: 12, padding: '14px 16px', marginBottom: 16, fontFamily: 'monospace', fontSize: 12, whiteSpace: 'pre-wrap', color: '#14532d', lineHeight: 1.6 }}>
          {buildWAText()}
        </div>
      )}

      {/* Actions */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        {!isLocked && (
          <>
            <button onClick={() => saveBudget(false)} disabled={saving || allItems.length === 0} style={{
              padding: '10px 18px', borderRadius: 9, border: 'none', background: '#f3f4f6',
              color: '#374151', fontWeight: 700, fontSize: 13, cursor: 'pointer',
              opacity: allItems.length === 0 ? 0.5 : 1,
            }}>
              {saved ? '✓ Guardado' : saving ? 'Guardando...' : '💾 Guardar borrador'}
            </button>
            <button onClick={() => saveBudget(true)} disabled={saving || allItems.length === 0} style={{
              padding: '10px 20px', borderRadius: 9, border: 'none', background: color,
              color: '#fff', fontWeight: 700, fontSize: 13, cursor: 'pointer',
              opacity: allItems.length === 0 ? 0.5 : 1,
            }}>
              {saving ? 'Guardando...' : '✓ Guardar y marcar como enviado'}
            </button>
          </>
        )}
        <button onClick={() => setWaPreview(v => !v)} style={{
          padding: '10px 16px', borderRadius: 9, border: '1px solid #e5e7eb',
          background: '#fff', fontWeight: 600, fontSize: 13, cursor: 'pointer', color: '#6b7280',
        }}>
          {waPreview ? 'Ocultar' : '👁 Ver mensaje'}
        </button>
        {order.client_phone && allItems.length > 0 && (
          <a href={buildWALink()} target="_blank" rel="noreferrer" onClick={() => !isLocked && saveBudget(true)} style={{
            padding: '10px 20px', borderRadius: 9, border: 'none', background: '#25d366',
            color: '#fff', fontWeight: 700, fontSize: 13, textDecoration: 'none',
            display: 'inline-flex', alignItems: 'center', gap: 8,
          }}>
            📲 Enviar por WhatsApp
          </a>
        )}
      </div>
      {!order.client_phone && (
        <div style={{ fontSize: 12, color: '#f59e0b', marginTop: 8 }}>⚠️ El cliente no tiene teléfono registrado — no se puede enviar por WA</div>
      )}
    </div>
  )
}

// ─── Info helpers ──────────────────────────────────────────────────────────────

function InfoCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 14, padding: '18px 20px' }}>
      <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 12, color: '#374151' }}>{title}</div>
      {children}
    </div>
  )
}

function InfoRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 5, gap: 8 }}>
      <span style={{ color: '#9ca3af', flexShrink: 0 }}>{label}</span>
      <span style={{ fontWeight: 500, textAlign: 'right', fontFamily: mono ? 'monospace' : 'inherit' }}>{value}</span>
    </div>
  )
}

// ─── New Order Form ────────────────────────────────────────────────────────────

const BLANK_FORM = {
  partner_id: '',
  client_name: '', client_dni: '', client_phone: '',
  device_brand: '', device_model: '',
  has_battery: false, has_chip: false, has_cover: false, has_memory: false,
  turns_on: true, water_damage: false,
  unlock_type: 'none' as 'pin' | 'patron' | 'none',
  unlock_code: '',
  damage_diagram: { markers: [] as DamageMarker[] },
  requested_work: '', notes: '',
  deposit_ars: '',
}

function NewOrderForm({
  color, partners, onClose, onSaved,
}: {
  color: string; partners: Partner[]; onClose: () => void; onSaved: () => void
}) {
  const [form, setForm] = useState(BLANK_FORM)
  const [saving, setSaving] = useState(false)
  const [err, setErr] = useState('')
  const [patternDots, setPatternDots] = useState<number[]>([])

  function set(field: string, value: unknown) {
    setForm(f => ({ ...f, [field]: value }))
  }

  async function handleSubmit() {
    if (!form.client_name || !form.device_brand || !form.device_model) {
      setErr('Nombre del cliente, marca y modelo son obligatorios.')
      return
    }
    setSaving(true)
    const res = await fetch('/api/celulab/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, deposit_ars: Number(form.deposit_ars) || 0, partner_id: form.partner_id || null }),
    })
    if (!res.ok) {
      const e = await res.json()
      setErr(e.error ?? 'Error al guardar')
      setSaving(false)
      return
    }
    onSaved()
  }

  return (
    <div>
      <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280', fontSize: 13, marginBottom: 16, padding: 0 }}>
        ← Cancelar
      </button>
      <div style={{ fontWeight: 700, fontSize: 20, marginBottom: 20 }}>Nueva Orden de Servicio</div>

      {!form.turns_on && (
        <div style={{ background: '#fef3c7', border: '1px solid #f59e0b', borderRadius: 10, padding: '12px 16px', marginBottom: 20, fontSize: 13 }}>
          ⚠️ <strong>Equipo apagado</strong> — revisión diagnóstica obligatoria ($15.000). Sin revisión diagnóstica no hay garantía.
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
        {/* Columna izquierda: datos + equipo + acceso */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Section title="👤 Datos del cliente">
            <FormField label="Nombre *">
              <input style={inp} value={form.client_name} onChange={e => set('client_name', e.target.value)} placeholder="Nombre completo" />
            </FormField>
            <FormField label="DNI">
              <input style={inp} value={form.client_dni} onChange={e => set('client_dni', e.target.value)} placeholder="Sin puntos" />
            </FormField>
            <FormField label="Teléfono WhatsApp">
              <input style={inp} value={form.client_phone} onChange={e => set('client_phone', e.target.value)} placeholder="+54 9 266 XXXXXXX" />
            </FormField>
            {partners.length > 0 && (
              <FormField label="Local origen">
                <select style={inp} value={form.partner_id} onChange={e => set('partner_id', e.target.value)}>
                  <option value="">Directo (sin local)</option>
                  {partners.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </FormField>
            )}
          </Section>

          <Section title="📱 Datos del equipo">
            <FormField label="Marca *">
              <input style={inp} value={form.device_brand} onChange={e => set('device_brand', e.target.value)} placeholder="Samsung, iPhone, Motorola..." />
            </FormField>
            <FormField label="Modelo *">
              <input style={inp} value={form.device_model} onChange={e => set('device_model', e.target.value)} placeholder="S21, iPhone 14, G54..." />
            </FormField>
            <div style={{ fontSize: 11, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Accesorios</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginBottom: 10 }}>
              {[
                { k: 'has_battery', l: '🔋 Batería' }, { k: 'has_chip', l: '📡 Chip' },
                { k: 'has_cover', l: '📦 Tapa' }, { k: 'has_memory', l: '💾 Memoria' },
              ].map(({ k, l }) => (
                <label key={k} style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: 13 }}>
                  <input type="checkbox" checked={(form as Record<string, unknown>)[k] as boolean} onChange={e => set(k, e.target.checked)} style={{ accentColor: color, width: 14, height: 14 }} />
                  {l}
                </label>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: 13 }}>
                <input type="checkbox" checked={form.turns_on} onChange={e => set('turns_on', e.target.checked)} style={{ accentColor: color, width: 14, height: 14 }} />
                Enciende ✅
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: 13 }}>
                <input type="checkbox" checked={form.water_damage} onChange={e => set('water_damage', e.target.checked)} style={{ accentColor: '#ef4444', width: 14, height: 14 }} />
                Humedad 💧
              </label>
            </div>
          </Section>

          <Section title="🔒 Acceso">
            <FormField label="Tipo de bloqueo">
              <div style={{ display: 'flex', gap: 14 }}>
                {[{ v: 'pin', l: 'PIN' }, { v: 'patron', l: 'Patrón' }, { v: 'none', l: 'Sin acceso' }].map(opt => (
                  <label key={opt.v} style={{ display: 'flex', alignItems: 'center', gap: 5, cursor: 'pointer', fontSize: 13 }}>
                    <input type="radio" name="unlock_type" value={opt.v} checked={form.unlock_type === opt.v}
                      onChange={() => { set('unlock_type', opt.v); if (opt.v !== 'patron') { setPatternDots([]); set('unlock_code', '') } }}
                      style={{ accentColor: color }} />
                    {opt.l}
                  </label>
                ))}
              </div>
            </FormField>
            {form.unlock_type === 'pin' && (
              <FormField label="PIN">
                <input style={inp} value={form.unlock_code} onChange={e => set('unlock_code', e.target.value)}
                  placeholder="Ej: 1234" maxLength={20} />
              </FormField>
            )}
            {form.unlock_type === 'patron' && (
              <FormField label="Patrón">
                <PatternLock
                  value={patternDots}
                  onChange={dots => { setPatternDots(dots); set('unlock_code', dots.join('-')) }}
                  color={color}
                />
              </FormField>
            )}
            {form.unlock_type === 'none' && (
              <div style={{ fontSize: 12, color: '#f59e0b', marginTop: 4 }}>⚠️ Sin código — no aplica garantía</div>
            )}
          </Section>
        </div>

        {/* Columna derecha: diagrama + trabajo */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Section title="📍 Marcar daños existentes">
            <div style={{ fontSize: 12, color: '#9ca3af', marginBottom: 10 }}>
              Clickeá sobre el teléfono para marcar rayaduras o daños preexistentes.
            </div>
            <PhoneDiagramEditor
              markers={form.damage_diagram.markers}
              onAdd={m => set('damage_diagram', { markers: [...form.damage_diagram.markers, m] })}
              onRemove={i => set('damage_diagram', { markers: form.damage_diagram.markers.filter((_, idx) => idx !== i) })}
              color={color}
            />
          </Section>

          <Section title="🔧 Trabajo solicitado">
            <FormField label="Fallas / trabajo pedido *">
              <textarea style={{ ...inp, minHeight: 80, resize: 'vertical' }}
                value={form.requested_work} onChange={e => set('requested_work', e.target.value)}
                placeholder="Pantalla rota, no carga, no enciende, cambio de batería..." />
            </FormField>
            <FormField label="Observaciones internas">
              <textarea style={{ ...inp, minHeight: 50, resize: 'vertical' }}
                value={form.notes} onChange={e => set('notes', e.target.value)}
                placeholder="Notas adicionales para el técnico..." />
            </FormField>
            <FormField label="Seña recibida ($)">
              <input type="number" style={inp} value={form.deposit_ars} onChange={e => set('deposit_ars', e.target.value)} placeholder="0" />
            </FormField>
          </Section>
        </div>
      </div>

      {err && (
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#dc2626', marginBottom: 16 }}>
          {err}
        </div>
      )}

      <div style={{ display: 'flex', gap: 12 }}>
        <button onClick={handleSubmit} disabled={saving} style={{
          padding: '12px 28px', borderRadius: 10, border: 'none', background: color,
          color: '#fff', fontWeight: 700, fontSize: 14, cursor: 'pointer', opacity: saving ? 0.7 : 1,
        }}>
          {saving ? 'Guardando...' : '✓ Crear Orden'}
        </button>
        <button onClick={onClose} style={{
          padding: '12px 20px', borderRadius: 10, border: '1px solid #e5e7eb',
          background: '#fff', color: '#374151', fontSize: 14, cursor: 'pointer',
        }}>
          Cancelar
        </button>
      </div>
    </div>
  )
}

// ─── Phone Diagram ─────────────────────────────────────────────────────────────

const PW = 160
const PH = 300

function PhoneDiagramEditor({
  markers, onAdd, onRemove, color,
}: {
  markers: DamageMarker[]; onAdd: (m: DamageMarker) => void; onRemove: (i: number) => void; color: string
}) {
  const [side, setSide] = useState<'front' | 'back'>('front')
  const sideMarkers = markers.filter(m => m.side === side)
  const sideIdxs = markers.reduce<number[]>((acc, m, i) => { if (m.side === side) acc.push(i); return acc }, [])

  function handleClick(e: React.MouseEvent<SVGSVGElement>) {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = Math.round(((e.clientX - rect.left) / rect.width) * 100)
    const y = Math.round(((e.clientY - rect.top) / rect.height) * 100)
    onAdd({ x, y, side })
  }

  return (
    <div>
      <div style={{ display: 'flex', gap: 4, marginBottom: 12, background: '#f1f5f9', borderRadius: 8, padding: 3, width: 'fit-content' }}>
        {(['front', 'back'] as const).map(s => (
          <button key={s} onClick={() => setSide(s)} style={{
            padding: '5px 14px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600,
            background: side === s ? '#fff' : 'transparent',
            color: side === s ? color : '#9ca3af',
            boxShadow: side === s ? '0 1px 3px rgba(0,0,0,.1)' : 'none',
          }}>
            {s === 'front' ? '🖥 Frente' : '🔄 Trasera'}
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 16 }}>
        <PhoneSVG
          side={side}
          markers={sideMarkers}
          globalIdxs={sideIdxs}
          onClick={handleClick}
          onRemoveLocal={localIdx => onRemove(sideIdxs[localIdx])}
        />

        {markers.length > 0 && (
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: '#9ca3af', marginBottom: 6 }}>MARCADORES</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {markers.map((m, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
                  <span style={{
                    width: 18, height: 18, borderRadius: '50%', background: '#ef4444',
                    color: '#fff', fontSize: 10, fontWeight: 700,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  }}>{i + 1}</span>
                  <span style={{ color: '#6b7280', flex: 1 }}>{m.side === 'front' ? 'Frente' : 'Trasera'}</span>
                  <button onClick={() => onRemove(i)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#d1d5db', fontSize: 14, padding: 0 }}>✕</button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function PhoneSVG({
  side, markers, globalIdxs, onClick, onRemoveLocal,
}: {
  side: 'front' | 'back'
  markers: DamageMarker[]
  globalIdxs: number[]
  onClick: (e: React.MouseEvent<SVGSVGElement>) => void
  onRemoveLocal: (i: number) => void
}) {
  return (
    <svg viewBox={`0 0 ${PW} ${PH}`} width={PW} height={PH} onClick={onClick}
      style={{ cursor: 'crosshair', flexShrink: 0, background: '#fafafa', borderRadius: 8, border: '1px solid #e5e7eb' }}>
      {/* Body */}
      <rect x={10} y={8} width={PW - 20} height={PH - 16} rx={18} ry={18} fill="#f8fafc" stroke="#cbd5e1" strokeWidth={2} />

      {side === 'front' ? (
        <>
          <rect x={PW / 2 - 20} y={22} width={40} height={5} rx={2.5} fill="#cbd5e1" />
          <circle cx={PW / 2 + 26} cy={24.5} r={4} fill="#e2e8f0" stroke="#cbd5e1" strokeWidth={1} />
          <rect x={16} y={42} width={PW - 32} height={PH - 100} rx={4} fill="#e8f0fe" stroke="#bfcbf9" strokeWidth={1} />
          <rect x={PW / 2 - 22} y={PH - 30} width={44} height={4} rx={2} fill="#cbd5e1" />
        </>
      ) : (
        <>
          <rect x={20} y={28} width={48} height={42} rx={10} fill="#e2e8f0" stroke="#cbd5e1" strokeWidth={1.5} />
          <circle cx={44} cy={49} r={14} fill="#cbd5e1" stroke="#94a3b8" strokeWidth={1.5} />
          <circle cx={44} cy={49} r={9} fill="#f1f5f9" stroke="#94a3b8" strokeWidth={1} />
          <circle cx={44} cy={49} r={4} fill="#1e293b" />
          <circle cx={63} cy={33} r={5} fill="#fde68a" stroke="#f59e0b" strokeWidth={1} />
          {[0, 4, 8, 12, 16].map(i => (
            <rect key={i} x={PW / 2 - 20 + i * 5} y={PH - 36} width={2} height={12} rx={1} fill="#cbd5e1" />
          ))}
        </>
      )}

      {/* Damage markers */}
      {markers.map((m, i) => (
        <g key={i} style={{ cursor: 'pointer' }} onClick={e => { e.stopPropagation(); onRemoveLocal(i) }}>
          <circle cx={m.x * PW / 100} cy={m.y * PH / 100} r={10} fill="#ef444428" stroke="#ef4444" strokeWidth={1.5} />
          <text x={m.x * PW / 100} y={m.y * PH / 100 + 4} textAnchor="middle" fontSize={9} fontWeight="bold" fill="#ef4444">
            {globalIdxs[i] + 1}
          </text>
        </g>
      ))}
    </svg>
  )
}

function PhoneDiagramReadonly({ markers }: { markers: DamageMarker[] }) {
  const front = markers.filter(m => m.side === 'front')
  const back = markers.filter(m => m.side === 'back')
  return (
    <div style={{ display: 'flex', gap: 24 }}>
      {front.length > 0 && (
        <div>
          <div style={{ fontSize: 11, color: '#9ca3af', marginBottom: 6 }}>FRENTE</div>
          <svg viewBox={`0 0 ${PW} ${PH}`} width={110} height={206} style={{ background: '#fafafa', borderRadius: 8, border: '1px solid #e5e7eb' }}>
            <rect x={10} y={8} width={PW - 20} height={PH - 16} rx={18} ry={18} fill="#f8fafc" stroke="#cbd5e1" strokeWidth={2} />
            <rect x={PW / 2 - 20} y={22} width={40} height={5} rx={2.5} fill="#cbd5e1" />
            <rect x={16} y={42} width={PW - 32} height={PH - 100} rx={4} fill="#e8f0fe" stroke="#bfcbf9" strokeWidth={1} />
            {front.map((m, i) => (
              <g key={i}>
                <circle cx={m.x * PW / 100} cy={m.y * PH / 100} r={10} fill="#ef444428" stroke="#ef4444" strokeWidth={1.5} />
                <text x={m.x * PW / 100} y={m.y * PH / 100 + 4} textAnchor="middle" fontSize={9} fontWeight="bold" fill="#ef4444">{i + 1}</text>
              </g>
            ))}
          </svg>
        </div>
      )}
      {back.length > 0 && (
        <div>
          <div style={{ fontSize: 11, color: '#9ca3af', marginBottom: 6 }}>TRASERA</div>
          <svg viewBox={`0 0 ${PW} ${PH}`} width={110} height={206} style={{ background: '#fafafa', borderRadius: 8, border: '1px solid #e5e7eb' }}>
            <rect x={10} y={8} width={PW - 20} height={PH - 16} rx={18} ry={18} fill="#f8fafc" stroke="#cbd5e1" strokeWidth={2} />
            {back.map((m, i) => (
              <g key={i}>
                <circle cx={m.x * PW / 100} cy={m.y * PH / 100} r={10} fill="#ef444428" stroke="#ef4444" strokeWidth={1.5} />
                <text x={m.x * PW / 100} y={m.y * PH / 100 + 4} textAnchor="middle" fontSize={9} fontWeight="bold" fill="#ef4444">{i + 1}</text>
              </g>
            ))}
          </svg>
        </div>
      )}
    </div>
  )
}

// ─── Print HTML ───────────────────────────────────────────────────────────────

function buildPrintHTML(order: Order, partner: Partner | null, warrantyDays: number): string {
  const date = new Date(order.created_at).toLocaleDateString('es-AR')
  const markers = order.damage_diagram?.markers ?? []
  const frontMarkers = markers.filter(m => m.side === 'front')
  const backMarkers = markers.filter(m => m.side === 'back')

  const acc = [
    order.has_battery && 'Batería ✓', order.has_chip && 'Chip ✓',
    order.has_cover && 'Tapa ✓', order.has_memory && 'Memoria ✓',
  ].filter(Boolean).join(' &nbsp;') || 'Ninguno'

  const lbl = `display:block;font-size:9px;text-transform:uppercase;font-weight:bold;color:#999;margin-bottom:2px;letter-spacing:0.05em;`
  const val = `font-size:13px;font-weight:600;color:#111;margin-bottom:10px;`

  function row(l: string, v: string) {
    return `<div><span style="${lbl}">${l}</span><span style="${val}">${v}</span></div>`
  }

  function phoneSVG(sideMarkers: DamageMarker[], label: string) {
    const PW = 160, PH = 300
    const circles = sideMarkers.map((m, i) => `
      <circle cx="${m.x * PW / 100}" cy="${m.y * PH / 100}" r="10" fill="#ef444420" stroke="#ef4444" stroke-width="1.5"/>
      <text x="${m.x * PW / 100}" y="${m.y * PH / 100 + 4}" text-anchor="middle" font-size="9" font-weight="bold" fill="#ef4444">${i + 1}</text>
    `).join('')
    return `
      <div style="text-align:center;">
        <div style="font-size:9px;text-transform:uppercase;color:#999;font-weight:bold;margin-bottom:4px;">${label}</div>
        <svg viewBox="0 0 ${PW} ${PH}" width="80" height="150" style="border:1px solid #e5e7eb;border-radius:6px;background:#fafafa;">
          <rect x="10" y="8" width="${PW - 20}" height="${PH - 16}" rx="18" ry="18" fill="#f8fafc" stroke="#cbd5e1" stroke-width="2"/>
          <rect x="${PW / 2 - 20}" y="22" width="40" height="5" rx="2.5" fill="#cbd5e1"/>
          <rect x="16" y="42" width="${PW - 32}" height="${PH - 100}" rx="4" fill="#e8f0fe" stroke="#bfcbf9" stroke-width="1"/>
          ${circles}
        </svg>
      </div>`
  }

  const diagramSection = markers.length > 0 ? `
    <div style="margin-top:12px;border-top:1px dashed #e5e7eb;padding-top:10px;">
      <div style="${lbl}margin-bottom:8px;">Daños preexistentes marcados al ingreso</div>
      <div style="display:flex;gap:16px;align-items:flex-start;">
        ${frontMarkers.length > 0 ? phoneSVG(frontMarkers, 'Frente') : ''}
        ${backMarkers.length > 0 ? phoneSVG(backMarkers, 'Trasera') : ''}
        ${markers.length > 0 ? `<div style="flex:1;font-size:10px;color:#555;">
          ${markers.map((m, i) => `<div style="margin-bottom:3px;">${i + 1}. ${m.side === 'front' ? 'Frente' : 'Trasera'} — pos. ${Math.round(m.x)}%, ${Math.round(m.y)}%</div>`).join('')}
          <div style="margin-top:6px;font-size:9px;color:#aaa;font-style:italic;">Daños existentes al momento de ingresar el equipo.</div>
        </div>` : ''}
      </div>
    </div>` : ''

  const flags = [
    !order.turns_on && '⚠️ NO ENCIENDE',
    order.water_damage && '⚠️ HUMEDAD',
    order.revision_required && '⚠️ REVISIÓN DIAGNÓSTICA REQUERIDA',
  ].filter(Boolean).join(' &nbsp;·&nbsp; ')

  function buildCopy(title: string, includeEconomic: boolean, includeTechDetails: boolean) {
    return `
      <div class="copy" style="font-family:Arial,sans-serif;font-size:12px;border:1.5px solid #000;border-radius:8px;padding:18px 20px;margin-bottom:20px;page-break-inside:avoid;">

        <!-- Header -->
        <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:14px;padding-bottom:12px;border-bottom:2px solid #111;">
          <div>
            <div style="font-size:18px;font-weight:900;letter-spacing:-0.03em;">CeluLab</div>
            <div style="font-size:9px;color:#999;text-transform:uppercase;letter-spacing:0.08em;">Taller de reparaciones · San Luis Capital</div>
          </div>
          <div style="text-align:right;">
            <div style="font-size:22px;font-weight:900;font-family:monospace;letter-spacing:-0.02em;">${order.order_number}</div>
            <div style="font-size:10px;color:#888;">${date}</div>
          </div>
        </div>
        <div style="font-size:9px;text-transform:uppercase;font-weight:bold;color:#aaa;margin-bottom:10px;">${title}</div>

        ${flags ? `<div style="background:#fef3c7;border:1px solid #f59e0b;border-radius:6px;padding:6px 10px;margin-bottom:12px;font-size:11px;font-weight:bold;color:#92400e;">${flags}</div>` : ''}

        <!-- Grid: cliente + equipo -->
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:0 20px;margin-bottom:12px;">
          ${row('Cliente', order.client_name)}
          ${row('Equipo', `${order.device_brand} ${order.device_model}`)}
          ${row('Teléfono', order.client_phone || '—')}
          ${row('Enciende', order.turns_on ? 'SÍ' : 'NO')}
          ${includeTechDetails ? row('DNI', order.client_dni || '—') : ''}
          ${includeTechDetails ? row('Acceso', order.unlock_type === 'none' ? 'Sin acceso' : order.unlock_code || '—') : ''}
          ${partner ? row('Local de ingreso', `${partner.name}${partner.address ? ' · ' + partner.address : ''}`) : ''}
        </div>

        <!-- Accesorios -->
        <div style="margin-bottom:10px;">
          <span style="${lbl}">Accesorios recibidos</span>
          <span style="font-size:12px;font-weight:600;">${acc}</span>
        </div>

        <!-- Trabajo solicitado -->
        <div style="margin-bottom:10px;">
          <span style="${lbl}">Trabajo solicitado</span>
          <div style="font-size:13px;font-weight:600;color:#111;">${order.requested_work || '—'}</div>
        </div>

        ${order.notes ? `<div style="margin-bottom:10px;"><span style="${lbl}">Observaciones</span><div style="font-size:12px;color:#555;">${order.notes}</div></div>` : ''}

        ${diagramSection}

        ${includeEconomic && (order.budget_ars > 0 || order.deposit_ars > 0) ? `
        <!-- Económico -->
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:0 20px;margin-top:12px;padding-top:10px;border-top:1px dashed #e5e7eb;">
          ${row('Seña cobrada', `$${(order.deposit_ars ?? 0).toLocaleString('es-AR')}`)}
          ${row('Presupuesto total', `$${(order.budget_ars ?? 0).toLocaleString('es-AR')}`)}
          ${row('Garantía', warrantyDays > 0 ? `${warrantyDays} días` : 'Sin garantía')}
          ${order.deposit_ars > 0 ? row('Saldo a pagar', `$${((order.total_ars ?? 0) - (order.deposit_ars ?? 0)).toLocaleString('es-AR')}`) : ''}
        </div>` : ''}

        <!-- Firma -->
        <div style="margin-top:18px;display:flex;justify-content:space-between;">
          <div style="text-align:center;width:42%;"><div style="border-top:1px solid #000;padding-top:4px;font-size:9px;color:#888;">Firma y aclaración del cliente</div></div>
          <div style="text-align:center;width:42%;"><div style="border-top:1px solid #000;padding-top:4px;font-size:9px;color:#888;">Conformidad con el estado declarado</div></div>
        </div>

        <!-- Legal -->
        <div style="font-size:9px;color:#999;margin-top:12px;border-top:1px dashed #e5e7eb;padding-top:8px;line-height:1.5;">
          Garantía de ${warrantyDays} días por mal funcionamiento. No cubre golpes, trizaduras ni daño por humedad. Equipo no retirado en 30 días corridos = abandono (Ley 25232). · CeluLab · +54 9 2664 501140
        </div>
      </div>`
  }

  return `<html><head><title>Orden ${order.order_number}</title>
    <style>
      body { margin: 20px; background: #fff; }
      @media print { .copy { page-break-after: always; } .copy:last-child { page-break-after: avoid; } }
    </style>
  </head><body>
    ${buildCopy('COPIA LOCAL — Archivo interno', false, true)}
    ${buildCopy('COPIA CLIENTE — Comprobante de ingreso', true, false)}
    <script>window.onload = () => window.print()<\/script>
  </body></html>`
}

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyOrders({ onNew }: { onNew: () => void }) {
  return (
    <div style={{ textAlign: 'center', padding: '64px 24px', color: '#9ca3af' }}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>📋</div>
      <div style={{ fontWeight: 600, fontSize: 16, color: '#6b7280', marginBottom: 6 }}>Sin órdenes todavía</div>
      <div style={{ fontSize: 13, marginBottom: 24 }}>Creá la primera orden cuando ingrese un equipo.</div>
      <button onClick={onNew} style={{
        padding: '10px 24px', borderRadius: 10, border: 'none', background: '#6366f1',
        color: '#fff', fontWeight: 700, fontSize: 14, cursor: 'pointer',
      }}>
        + Nueva orden
      </button>
    </div>
  )
}

// ─── Section / FormField / inp ────────────────────────────────────────────────

function Section({ title, children, style }: { title: string; children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: '16px 18px', ...style }}>
      <div style={{ fontWeight: 600, fontSize: 13, color: '#374151', marginBottom: 12 }}>{title}</div>
      {children}
    </div>
  )
}

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ fontSize: 11, fontWeight: 600, color: '#374151', marginBottom: 4 }}>{label}</div>
      {children}
    </div>
  )
}

const inp: React.CSSProperties = {
  width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid #d1d5db',
  fontSize: 13, background: '#fff', boxSizing: 'border-box',
}