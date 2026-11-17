import { test } from 'node:test'
import assert from 'node:assert/strict'
import { economicPatch } from './economic-patch.ts'

const saved = { total_ars: 100000, part_cost_ars: 50000, commission_pct: 10, commission_ars: 5000 }
test('partial amount update keeps the historical 10% instead of defaulting to 33%', () => {
  assert.deepEqual(economicPatch(saved, { total_ars: 120000 }), { total_ars: 120000, commission_ars: 7000 })
})
test('partial cost and explicit rate changes recalculate from saved fields', () => {
  assert.equal(economicPatch(saved, { part_cost_ars: 40000 }).commission_ars, 6000)
  assert.equal(economicPatch(saved, { commission_pct: 20 }).commission_ars, 10000)
})
test('status-only and repeated budget saves preserve the stored commission', () => {
  assert.deepEqual(economicPatch({ ...saved, commission_ars: 4000 }, { status: 'listo' }), {})
  assert.deepEqual(economicPatch(saved, { total_ars: 100000, part_cost_ars: 50000 }), { total_ars: 100000, part_cost_ars: 50000 })
})
test('missing historical rate stays pending, never guessed', () => {
  assert.equal(economicPatch({ total_ars: 100, part_cost_ars: 50 }, { total_ars: 200 }).commission_ars, null)
  assert.equal(economicPatch(saved, { total_ars: null }).commission_ars, null)
})
test('validates amounts and percentages without coercing user strings', () => {
  for (const value of [-1, Infinity, NaN, '100', undefined]) assert.throws(() => economicPatch(saved, { total_ars: value }))
  for (const value of [-1, 101, null]) assert.throws(() => economicPatch(saved, { commission_pct: value }))
  assert.equal(economicPatch(saved, { commission_pct: 0 }).commission_ars, 0)
})
