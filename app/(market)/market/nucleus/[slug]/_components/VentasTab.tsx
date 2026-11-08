'use client'
import { useState, useEffect, useCallback } from 'react'

type OrderItem = { id: string; name: string; price_ars: number; qty: number }

type TiendaOrder = {
  id: string; order_number: string
  items: OrderItem[]
  total_ars: number
  client_name: string; client_phone: string | null
  metodo_pago: 'efectivo' | 'digital'
  estado: 'pendiente' | 'confirmado' | 'listo' | 'entregado' | 'cancelado'
  notas: string | null
  caja_registrado: boolean
  created_at: string
}

const ESTADO_LABELS: Record<string, string> = {
  pendiente: 'Pendiente',
  confirmado: 'Confirmado',
  listo: '✅ Listo',
  entregado: 'Entregado',
  cancelado: 'Cancelado',
}

const ESTADO_COLORS: Record<string, string> = {
  pendiente: '#f59e0b',
  confirmado: '#2563eb',
  listo: '#059669',
  entregado: '#9ca3af',
  cancelado: '#ef4444',
}

function ars(n: number) {
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0 }).format(n)
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleString('es-AR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })
}

export function VentasTab({ color }: { color: string }) {
  const [orders, setOrders] = useState<TiendaOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [filtroEstado, setFiltroEstado] = useState('')
  const [selectedOrder, setSelectedOrder] = useState<TiendaOrder | null>(null)
  const [advancing, setAdvancing] = useState<string | null>(null)

  const fetchOrders = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (filtroEstado) params.set('estado', filtroEstado)
    const data = await fetch(`/api/celulab/tienda-orders?${params}`, { cache: 'no-store' }).then(r => r.json())
    setOrders(Array.isArray(data) ? data : [])
    setLoading(false)
  }, [filtroEstado])

  useEffect(() => { fetchOrders() }, [fetchOrders])

  async function cambiarEstado(order: TiendaOrder, nuevoEstado: string, registrarCaja = false) {
    setAdvancing(order.id)
    await fetch(`/api/celulab/tienda-orders/${order.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ estado: nuevoEstado, registrar_caja: registrarCaja }),
    })
    setAdvancing(null)
    setSelectedOrder(null)
    fetchOrders()
  }

  const pendientes = orders.filter(o => o.estado === 'pendiente').length
  const hoy = orders.filter(o => new Date(o.created_at).toDateString() === new Date().toDateString())
  const totalHoy = hoy.reduce((s, o) => s + Number(o.total_ars), 0)

  if (selectedOrder) {
    return (
      <OrderDetail
        order={selectedOrder}
        color={color}
        advancing={advancing === selectedOrder.id}
        onBack={() => setSelectedOrder(null)}
        onCambiarEstado={cambiarEstado}
      />
    )
  }

  return (
    <div>
      {/* Header stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))', gap: 12, marginBottom: 24 }}>
        <StatCard label="Pendientes" value={String(pendientes)} icon="⏳" color="#f59e0b" />
        <StatCard label="Total hoy" value={ars(totalHoy)} icon="💰" color={color} />
        <StatCard label="Pedidos hoy" value={String(hoy.length)} icon="📦" color="#6b7280" />
      </div>

      {/* Filtros */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
        {[
          { v: '', l: 'Todos' },
          { v: 'pendiente', l: '⏳ Pendientes' },
          { v: 'confirmado', l: '📋 Confirmados' },
          { v: 'listo', l: '✅ Listos' },
          { v: 'entregado', l: '🏁 Entregados' },
          { v: 'cancelado', l: '❌ Cancelados' },
        ].map(opt => (
          <button key={opt.v} onClick={() => setFiltroEstado(opt.v)}
            style={{
              padding: '6px 14px', borderRadius: 20, border: `1px solid ${filtroEstado === opt.v ? color : '#e5e7eb'}`,
              background: filtroEstado === opt.v ? color : '#fff',
              color: filtroEstado === opt.v ? '#fff' : '#374151',
              fontSize: 12, fontWeight: 600, cursor: 'pointer',
            }}>
            {opt.l}
          </button>
        ))}
        <button onClick={fetchOrders} style={{ marginLeft: 'auto', padding: '6px 12px', borderRadius: 8, border: '1px solid #e5e7eb', background: '#fff', fontSize: 12, cursor: 'pointer' }}>↻</button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 48, color: '#9ca3af' }}>Cargando...</div>
      ) : orders.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '56px 24px', color: '#9ca3af' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🛍</div>
          <div style={{ fontWeight: 600, color: '#6b7280', marginBottom: 4 }}>Sin ventas todavía</div>
          <div style={{ fontSize: 13 }}>Los pedidos de la tienda aparecen acá.</div>
        </div>
      ) : (
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                {['Hora', 'Pedido', 'Cliente', 'Items', 'Método', 'Total', 'Estado', ''].map(h => (
                  <th key={h} style={{ padding: '8px 12px', textAlign: 'left', fontWeight: 600, fontSize: 11, color: '#6b7280' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {orders.map((o, i) => {
                const sc = ESTADO_COLORS[o.estado] ?? '#9ca3af'
                const isNew = o.estado === 'pendiente'
                return (
                  <tr key={o.id} onClick={() => setSelectedOrder(o)}
                    style={{ borderBottom: '1px solid #f3f4f6', background: isNew ? '#fffbeb' : i % 2 === 0 ? '#fff' : '#fafafa', cursor: 'pointer' }}
                    onMouseEnter={e => (e.currentTarget.style.background = '#f1f5f9')}
                    onMouseLeave={e => (e.currentTarget.style.background = isNew ? '#fffbeb' : i % 2 === 0 ? '#fff' : '#fafafa')}
                  >
                    <td style={{ padding: '10px 12px', color: '#9ca3af', fontSize: 12, whiteSpace: 'nowrap' }}>{fmtDate(o.created_at)}</td>
                    <td style={{ padding: '10px 12px', fontFamily: 'monospace', fontWeight: 700, color: '#374151', whiteSpace: 'nowrap' }}>{o.order_number}</td>
                    <td style={{ padding: '10px 12px', fontWeight: 600 }}>{o.client_name}</td>
                    <td style={{ padding: '10px 12px', color: '#6b7280', maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {o.items.map(it => `${it.qty > 1 ? `${it.qty}x ` : ''}${it.name}`).join(', ')}
                    </td>
                    <td style={{ padding: '10px 12px' }}>
                      <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 10, background: o.metodo_pago === 'efectivo' ? '#fef9c3' : '#ede9fe', color: o.metodo_pago === 'efectivo' ? '#a16207' : '#6d28d9' }}>
                        {o.metodo_pago === 'efectivo' ? '💵' : '📲'}
                      </span>
                    </td>
                    <td style={{ padding: '10px 12px', fontWeight: 700, color: color, whiteSpace: 'nowrap' }}>{ars(o.total_ars)}</td>
                    <td style={{ padding: '10px 12px' }}>
                      <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 9px', borderRadius: 8, background: sc + '18', color: sc }}>
                        {ESTADO_LABELS[o.estado]}
                      </span>
                    </td>
                    <td style={{ padding: '10px 12px', color: '#d1d5db' }}>›</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

// ─── Order Detail ─────────────────────────────────────────────────────────────

function OrderDetail({ order, color, advancing, onBack, onCambiarEstado }: {
  order: TiendaOrder; color: string; advancing: boolean
  onBack: () => void
  onCambiarEstado: (order: TiendaOrder, estado: string, caja?: boolean) => void
}) {
  const sc = ESTADO_COLORS[order.estado] ?? '#9ca3af'

  const waMsg = encodeURIComponent(
    `📦 *Pedido ${order.order_number} — CeluLab Tienda*\n` +
    `Cliente: ${order.client_name}\n` +
    `${order.client_phone ? `Tel: ${order.client_phone}\n` : ''}` +
    `Total: ${ars(order.total_ars)} (${order.metodo_pago})\n\n` +
    `Artículos:\n${order.items.map(i => `• ${i.qty > 1 ? `${i.qty}x ` : ''}${i.name} — ${ars(i.price_ars * i.qty)}`).join('\n')}`
  )

  return (
    <div style={{ maxWidth: 560, margin: '0 auto' }}>
      <button onClick={onBack} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280', fontSize: 13, marginBottom: 20, padding: 0 }}>
        ← Volver a ventas
      </button>

      {/* Status header */}
      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 16, padding: '20px 24px', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <div>
            <div style={{ fontFamily: 'monospace', fontWeight: 800, fontSize: 20, color: '#0f172a' }}>{order.order_number}</div>
            <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 2 }}>{fmtDate(order.created_at)}</div>
          </div>
          <span style={{ fontSize: 12, fontWeight: 700, padding: '5px 12px', borderRadius: 8, background: sc + '18', color: sc }}>
            {ESTADO_LABELS[order.estado]}
          </span>
        </div>

        {/* Cliente */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 13 }}>
          <Row label="Cliente" value={order.client_name} />
          {order.client_phone && <Row label="WhatsApp" value={order.client_phone} />}
          <Row label="Pago" value={order.metodo_pago === 'efectivo' ? '💵 Efectivo' : '📲 Digital (MP / transferencia)'} />
          {order.notas && <Row label="Notas" value={order.notas} />}
        </div>
      </div>

      {/* Items */}
      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 16, padding: '20px 24px', marginBottom: 16 }}>
        <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 14 }}>🛍 Artículos</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {order.items.map((item, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
              <span style={{ color: '#374151', flex: 1, paddingRight: 12 }}>{item.qty > 1 ? `${item.qty}x ` : ''}{item.name}</span>
              <span style={{ fontWeight: 700, flexShrink: 0 }}>{ars(item.price_ars * item.qty)}</span>
            </div>
          ))}
          <div style={{ borderTop: '1px solid #f3f4f6', paddingTop: 10, display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: 16 }}>
            <span>Total</span>
            <span style={{ color: color }}>{ars(order.total_ars)}</span>
          </div>
        </div>
        {order.caja_registrado && (
          <div style={{ marginTop: 12, padding: '8px 12px', background: '#f0fdf4', border: '1px solid #86efac', borderRadius: 8, fontSize: 12, color: '#15803d', fontWeight: 600 }}>
            ✓ Registrado en Caja
          </div>
        )}
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {order.estado === 'pendiente' && (
          <>
            <button onClick={() => onCambiarEstado(order, 'confirmado', true)} disabled={advancing}
              style={{ padding: '12px', borderRadius: 12, border: 'none', background: color, color: '#fff', fontWeight: 700, fontSize: 14, cursor: 'pointer', opacity: advancing ? 0.7 : 1 }}>
              {advancing ? '...' : '✓ Confirmar pedido + registrar en Caja'}
            </button>
            <button onClick={() => onCambiarEstado(order, 'cancelado')} disabled={advancing}
              style={{ padding: '12px', borderRadius: 12, border: '1px solid #fecaca', background: '#fff', color: '#dc2626', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>
              ✕ Cancelar pedido
            </button>
          </>
        )}
        {order.estado === 'confirmado' && (
          <button onClick={() => onCambiarEstado(order, 'listo')} disabled={advancing}
            style={{ padding: '12px', borderRadius: 12, border: 'none', background: '#059669', color: '#fff', fontWeight: 700, fontSize: 14, cursor: 'pointer', opacity: advancing ? 0.7 : 1 }}>
            {advancing ? '...' : '📦 Marcar como listo para retirar'}
          </button>
        )}
        {order.estado === 'listo' && (
          <button onClick={() => onCambiarEstado(order, 'entregado')} disabled={advancing}
            style={{ padding: '12px', borderRadius: 12, border: 'none', background: '#0891b2', color: '#fff', fontWeight: 700, fontSize: 14, cursor: 'pointer', opacity: advancing ? 0.7 : 1 }}>
            {advancing ? '...' : '🎉 Marcar como entregado'}
          </button>
        )}

        {order.client_phone && (
          <a href={`https://wa.me/${order.client_phone.replace(/\D/g, '')}?text=Hola ${order.client_name}! Tu pedido ${order.order_number} ya está listo para retirar en CeluLab. 📦`}
            target="_blank" rel="noreferrer"
            style={{ display: 'block', textAlign: 'center', padding: '11px', borderRadius: 12, background: '#25d366', color: '#fff', fontWeight: 700, fontSize: 13, textDecoration: 'none' }}>
            📲 Avisar al cliente por WhatsApp
          </a>
        )}

        <a href={`https://wa.me/5492664501140?text=${waMsg}`} target="_blank" rel="noreferrer"
          style={{ display: 'block', textAlign: 'center', padding: '11px', borderRadius: 12, border: '1px solid #e5e7eb', background: '#fff', color: '#374151', fontWeight: 600, fontSize: 13, textDecoration: 'none' }}>
          📤 Compartir orden al técnico
        </a>
      </div>
    </div>
  )
}

function StatCard({ label, value, icon, color }: { label: string; value: string; icon: string; color: string }) {
  return (
    <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: '14px 16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
        <span style={{ fontSize: 16 }}>{icon}</span>
        <span style={{ fontSize: 11, color: '#9ca3af', fontWeight: 600 }}>{label}</span>
      </div>
      <div style={{ fontWeight: 800, fontSize: 18, color }}>{value}</div>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', gap: 12 }}>
      <span style={{ color: '#9ca3af', minWidth: 70, flexShrink: 0 }}>{label}</span>
      <span style={{ fontWeight: 500, color: '#374151' }}>{value}</span>
    </div>
  )
}