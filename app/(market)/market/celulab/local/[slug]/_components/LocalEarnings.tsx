'use client'

import { useState } from 'react'
import { orderEarnings, summarizeEarnings, type EarningsOrder } from '@/lib/celulab/earnings'

const money = (amount: number) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(amount)
const percent = (amount: number | null) => amount === null ? '—' : `${amount.toLocaleString('es-AR', { maximumFractionDigits: 2 })}%`

export function OrderEarnings({ order, unlocked }: { order: EarningsOrder; unlocked: boolean }) {
  if (!unlocked) return <div style={{ fontSize: 12, color: '#64748b' }}>Ganancia del local: 🔒</div>
  const value = orderEarnings(order)
  return <div style={{ fontSize: 12, color: value.gain !== null && value.gain < 0 ? '#b91c1c' : '#15803d', marginTop: 4 }}>
    <strong>Ganancia del local: {value.gain === null ? 'Pendiente de registrar' : money(value.gain)}</strong>
    <div>Comisión sobre mano de obra: {percent(value.rate)} · Margen sobre total: {percent(value.margin)}</div>
  </div>
}

export function LocalEarnings({ orders, unlocked }: { orders: Array<EarningsOrder & { order_number: string }>; unlocked: boolean }) {
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const invalidRange = Boolean(from && to && from > to)
  const summary = summarizeEarnings(orders, from, to)
  if (!unlocked) return <p role="status">Las ganancias están protegidas. Desbloquealas desde la búsqueda de repuestos en una nueva orden.</p>
  return <section aria-label="Resumen de ganancias del local" style={{ background: '#fff', padding: 16, borderRadius: 12, border: '1px solid #e2e8f0' }}>
    <h2 style={{ marginTop: 0, fontSize: 18 }}>Ganancias del local</h2>
    <p style={{ fontSize: 13, color: '#64748b' }}>Órdenes entregadas, agrupadas por fecha de ingreso. Los importes corresponden a la comisión guardada en cada orden; no indican que se haya cobrado o liquidado.</p>
    <p style={{ fontSize: 12, color: '#64748b' }}>Este resumen usa las {orders.length} órdenes cargadas en el panel (máximo 200).</p>
    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 16 }}>
      <label>Desde <input type="date" value={from} onChange={e => setFrom(e.target.value)} /></label>
      <label>Hasta <input type="date" value={to} onChange={e => setTo(e.target.value)} /></label>
    </div>
    {invalidRange ? <p role="alert">La fecha inicial debe ser anterior o igual a la final.</p> : <>
      <dl style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12 }}>
        {[
          ['Órdenes entregadas', String(summary.delivered)],
          ['Total de trabajos con datos completos', money(summary.total)],
          ['Ganancia del local', money(summary.gain)],
          ['Margen sobre total', percent(summary.margin)],
        ].map(([label, value]) => <div key={label}><dt style={{ fontSize: 12, color: '#64748b' }}>{label}</dt><dd style={{ margin: '4px 0', fontSize: 20, fontWeight: 700 }}>{value}</dd></div>)}
      </dl>
      {summary.incomplete > 0 && <p role="status">{summary.incomplete} órdenes entregadas tienen importes pendientes y no se suman a los totales.</p>}
      <div style={{ display: 'grid', gap: 10 }}>
        {summary.selected.map(order => <article key={order.id} style={{ borderTop: '1px solid #e2e8f0', paddingTop: 10 }}>
          <strong>{order.order_number}</strong><OrderEarnings order={order} unlocked />
        </article>)}
      </div>
      {summary.selected.length === 0 && <p>No hay órdenes en este período.</p>}
    </>}
  </section>
}
