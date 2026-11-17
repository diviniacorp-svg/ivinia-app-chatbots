import { test } from 'node:test'
import assert from 'node:assert/strict'
import { argentinaDate, orderEarnings, summarizeEarnings } from './earnings.ts'

test('keeps historical commission separate from margin on total', () => {
  assert.deepEqual(orderEarnings({ id: '1', created_at: '', status: '', total_ars: 100000, commission_ars: 5000, commission_pct: 10 }), { total: 100000, gain: 5000, rate: 10, margin: 5 })
})
test('does not invent missing commissions or divide by zero', () => {
  assert.equal(orderEarnings({ id: '1', created_at: '', status: '', total_ars: 100, commission_pct: 10 }).gain, null)
  assert.equal(orderEarnings({ id: '1', created_at: '', status: '', total_ars: 0, commission_ars: 0 }).margin, null)
})
test('weights margins by order value; excludes rejected and unfinished jobs', () => {
  const summary = summarizeEarnings([
    { id: '1', created_at: '', status: 'entregado', total_ars: 100, commission_ars: 20 },
    { id: '2', created_at: '', status: 'entregado_al_cliente', total_ars: 900, commission_ars: 90 },
    { id: '3', created_at: '', status: 'rechazado', total_ars: 500, commission_ars: 500 },
    { id: '4', created_at: '', status: 'listo', total_ars: 500, commission_ars: 500 },
    { id: '5', created_at: '', status: 'entregado' },
  ])
  assert.equal(summary.gain, 110)
  assert.equal(summary.margin, 11)
  assert.equal(summary.incomplete, 1)
})
test('filters by Argentina entry date, including UTC midnight boundary', () => {
  assert.equal(argentinaDate('2026-11-02T01:30:00Z'), '2026-11-01')
  assert.equal(summarizeEarnings([{ id: '1', created_at: '2026-11-02T01:30:00Z', status: 'entregado', total_ars: 100, commission_ars: 10 }], '2026-11-02').delivered, 0)
})
