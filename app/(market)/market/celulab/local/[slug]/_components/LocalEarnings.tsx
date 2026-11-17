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
  const [month, setMonth] = useState('')
  const [period, setPeriod] = useState('Todos')
  function choosePeriod(next: string) {
    setPeriod(next)
    if (next === 'Personalizado' || next === 'Por mes') { setMonth(''); setFrom(''); setTo(''); return }
    if (next === 'Todos') { setMonth(''); setFrom(''); setTo(''); return }
    setMonth('')
    const today = argentinaDate(new Date().toISOString())!
    const day = new Date(`${today}T12:00:00Z`)
    if (next === 'Esta semana') day.setUTCDate(day.getUTCDate() - ((day.getUTCDay() + 6) % 7))
    else if (next === 'Este mes') day.setUTCDate(1)
    setFrom(day.toISOString().slice(0, 10)); setTo(today)
  }
  const invalidRange = Boolean(from && to && from > to)
  const summary = summarizeEarnings(orders, from, to)
  if (!unlocked) return <p role="status">Las ganancias están protegidas. Desbloquealas desde Historial → Métricas.</p>
  return <section aria-label="Resumen de ganancias del local" style={{ background: '#f8fafc', padding: 14, borderRadius: 12, border: '1px solid #e2e8f0' }}>
    <h2 style={{ marginTop: 0, fontSize: 18 }}>Ganancias del local</h2>
    <p style={{ fontSize: 13, color: '#64748b' }}>Órdenes entregadas, agrupadas por fecha de ingreso. Los importes corresponden a la comisión guardada en cada orden; no indican que se haya cobrado o liquidado.</p>
    <p style={{ fontSize: 12, color: '#64748b' }}>Este resumen usa las {orders.length} órdenes cargadas en el panel.</p>
    <div className="periods" role="group" aria-label="Período del resumen">
      {['Hoy','Esta semana','Este mes','Por mes','Personalizado','Todos'].map(item =>
        <button key={item} type="button" aria-pressed={item === period} onClick={() => choosePeriod(item)}>{item}</button>
      )}
    </div>
    {(period === 'Personalizado'||period==='Por mes') && <fieldset className="earn-period"><legend>{period==='Por mes'?'Elegí un mes':'Elegí un rango'}</legend><div className="earn-controls">
      <label>Elegir mes <input type="month" value={month} onChange={e=>{const m=e.target.value;setMonth(m);if(!m){setFrom('');setTo('');return;}const [year,month]=m.split('-').map(Number);setFrom(m+'-01');setTo(new Date(Date.UTC(year,month,0)).toISOString().slice(0,10))}} /></label>
      {period==='Personalizado'&&<><label>Desde <input type="date" value={from} onChange={e => {setMonth(''); setFrom(e.target.value)}} /></label>
      <label>Hasta <input type="date" value={to} onChange={e => {setMonth(''); setTo(e.target.value)}} /></label></>}
    </div></fieldset>}
    <style jsx>{`
      .periods { display:flex; flex-wrap:wrap; gap:8px; margin:16px 0; }
      .periods button { border-radius:99px; border-color:#d6dce5; }
      .periods button[aria-pressed=true] { color:white; background:#2563eb; border-color:#2563eb; }
      .metrics { display:grid; grid-template-columns:repeat(4,minmax(0,1fr)); gap:10px; }
      .metrics dd { overflow-wrap:anywhere; }
      @media(max-width:720px) { .metrics {grid-template-columns:repeat(2,minmax(0,1fr));} }
      .earn-period { margin: 16px 0; padding: 14px; min-width: 0; background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 12px; }
      legend, label { font-weight: 600; color: #334155; font-size: 13px; }
      .earn-controls { display: flex; align-items: end; flex-wrap: wrap; gap: 10px; }
      label { display: grid; gap: 6px; }
      input, button { background: white; color: #1e293b; min-height: 44px; border: 1px solid #94a3b8; border-radius: 8px; padding: 8px 12px; }
      button { cursor: pointer; font-weight: 600; }
      button:hover { background: #eef2ff; }
      input:focus-visible, button:focus-visible { outline: 3px solid #6366f1; outline-offset: 2px; }
      @media(max-width: 600px) { .earn-controls { display: grid; grid-template-columns: repeat(2,minmax(0,1fr)); } label:first-child {grid-column: 1/-1;} input {width: 100%; min-width: 0;} }
    `}</style>
    {invalidRange ? <p role="alert">La fecha inicial debe ser anterior o igual a la final.</p> : <>
      <dl className="metrics">
        {[
          ['Órdenes entregadas', String(summary.delivered)],
          ['Total de trabajos con datos completos', money(summary.total)],
          ['Ganancia del local', money(summary.gain)],
          ['Margen sobre total', percent(summary.margin)],
        ].map(([label, value]) => <div key={label} style={{padding:12, background:"#fff", border:"1px solid #e2e8f0", borderRadius:10}}><dt style={{ fontSize: 12, color: '#64748b' }}>{label}</dt><dd style={{ margin: '4px 0', fontSize: 20, fontWeight: 700, color: label === 'Ganancia del local' ? '#15803d' : '#1e40af' }}>{value}</dd></div>)}
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
