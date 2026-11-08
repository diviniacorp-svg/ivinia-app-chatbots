'use client'

import { useState } from 'react'
import { argentinaDate, orderEarnings, summarizeEarnings, type EarningsOrder } from '@/lib/celulab/earnings'

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
  function choosePeriod(period: 'week' | 'month') {
    const today = argentinaDate(new Date().toISOString())!
    const day = new Date(`${today}T12:00:00Z`)
    if (period === 'week') day.setUTCDate(day.getUTCDate() - ((day.getUTCDay() + 6) % 7))
    else day.setUTCDate(1)
    setFrom(day.toISOString().slice(0, 10)); setTo(today)
  }
  const invalidRange = Boolean(from && to && from > to)
  const summary = summarizeEarnings(orders, from, to)
  if (!unlocked) return <p role="status">Las ganancias están protegidas. Desbloquealas desde la búsqueda de repuestos en una nueva orden.</p>
  return <section aria-label="Resumen de ganancias del local" style={{ background: '#fff', padding: 16, borderRadius: 12, border: '1px solid #e2e8f0' }}>
    <h2 style={{ marginTop: 0, fontSize: 18 }}>Ganancias del local</h2>
    <p style={{ fontSize: 13, color: '#64748b' }}>Órdenes entregadas, agrupadas por fecha de ingreso. Los importes corresponden a la comisión guardada en cada orden; no indican que se haya cobrado o liquidado.</p>
    <p style={{ fontSize: 12, color: '#64748b' }}>Este resumen usa las {orders.length} órdenes cargadas en el panel (máximo 200).</p>
    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 16 }}>
      <label>Elegir mes <input type="month" onChange={e=>{const m=e.target.value;if(!m)return;const [year,month]=m.split('-').map(Number);setFrom(m+'-01');setTo(new Date(Date.UTC(year,month,0)).toISOString().slice(0,10))}} /></label>
      <button onClick={() => choosePeriod('week')}>Esta semana</button>
      <button onClick={() => choosePeriod('month')}>Este mes</button>
      <button onClick={() => { setFrom(''); setTo('') }}>Todo lo cargado</button>
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
