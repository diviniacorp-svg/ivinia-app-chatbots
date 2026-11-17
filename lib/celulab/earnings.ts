export type EarningsOrder = {
  id: string
  created_at: string
  status: string
  total_ars?: number | null
  commission_pct?: number | null
  commission_ars?: number | null
}

/** Use the order's saved amounts; never apply today's partner rate to history. */
export function orderEarnings(order: EarningsOrder) {
  const total = typeof order.total_ars === 'number' && Number.isFinite(order.total_ars) && order.total_ars >= 0 ? order.total_ars : null
  const gain = typeof order.commission_ars === 'number' && Number.isFinite(order.commission_ars) ? order.commission_ars : null
  const rate = typeof order.commission_pct === 'number' && Number.isFinite(order.commission_pct) ? order.commission_pct : null
  return { total, gain, rate, margin: total !== null && total > 0 && gain !== null ? gain / total * 100 : null }
}

export function argentinaDate(value: string) {
  const date = new Date(value)
  if (!Number.isFinite(date.getTime())) return null
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Argentina/Buenos_Aires', year: 'numeric', month: '2-digit', day: '2-digit' }).format(date)
}

export function summarizeEarnings<T extends EarningsOrder>(orders: T[], from = '', to = '') {
  const selected = orders.filter(order => {
    if (!from && !to) return true
    const day = argentinaDate(order.created_at)
    return day !== null && (!from || day >= from) && (!to || day <= to)
  })
  const delivered = selected.filter(order => ['entregado', 'entregado_al_cliente'].includes(order.status))
  const known = delivered.map(orderEarnings).filter(e => e.total !== null && e.gain !== null)
  const total = known.reduce((sum, e) => sum + e.total!, 0)
  const gain = known.reduce((sum, e) => sum + e.gain!, 0)
  return { selected, delivered: delivered.length, incomplete: delivered.length - known.length, total, gain, margin: total > 0 ? gain / total * 100 : null }
}
