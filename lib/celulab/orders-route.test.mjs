import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import vm from 'node:vm'
import { economicPatch } from './economic-patch.ts'

const require = createRequire(import.meta.url)
const ts = require('typescript')
const source = readFileSync(new URL('../../app/api/celulab/orders/[id]/route.ts', import.meta.url), 'utf8')
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText

function fixture({ missing = false, conflict = false } = {}) {
  const previous = { status: 'ingresado', total_ars: 100000, part_cost_ars: 50000, commission_pct: 10, commission_ars: 5000, updated_at: '2026-11-02T10:00:00Z' }
  const calls = { updates: [], conditions: [] }
  const db = { from() {
    let updating = false
    const query = {
      select() { return query },
      update(value) { updating = true; calls.updates.push(value); return query },
      eq(key, value) { if (updating) calls.conditions.push([key, value]); return query },
      is(key, value) { if (updating) calls.conditions.push([key, value]); return query },
      async maybeSingle() { return { data: updating ? (conflict ? null : { id: 'order-1', ...previous, ...calls.updates[0] }) : (missing ? null : previous), error: null } },
    }
    return query
  } }
  const exports = {}
  const modules = {
    'next/server': { NextResponse: { json: (body, options = {}) => ({ body, status: options.status ?? 200 }) } },
    '@/lib/supabase': { createAdminClient: () => db },
    '@/lib/celulab/economic-patch': { economicPatch },
    '@/lib/twilio': { sendWhatsAppMessage: () => { throw new Error('No notification expected') } },
  }
  vm.runInNewContext(compiled, { exports, require: name => { if (!(name in modules)) throw new Error(name); return modules[name] }, Date, Object, Number, Set, Error })
  return { calls, patch: body => exports.PATCH({ json: async () => body }, { params: { id: 'order-1' } }) }
}

test('PATCH uses saved rate and an optimistic concurrency condition', async () => {
  const { patch, calls } = fixture()
  const response = await patch({ total_ars: 120000, commission_ars: 999999 })
  assert.equal(response.status, 200)
  assert.equal(calls.updates[0].commission_ars, 7000)
  assert.ok(calls.conditions.some(([key, value]) => key === 'updated_at' && value === '2026-11-02T10:00:00Z'))
})
test('PATCH rejects a stale write rather than reporting success', async () => {
  const { patch } = fixture({ conflict: true })
  assert.equal((await patch({ total_ars: 120000 })).status, 409)
})
test('PATCH returns 404 for a missing order and performs no write', async () => {
  const { patch, calls } = fixture({ missing: true })
  assert.equal((await patch({ total_ars: 120000 })).status, 404)
  assert.equal(calls.updates.length, 0)
})
test('PATCH rejects invalid economic input before writing', async () => {
  const { patch, calls } = fixture()
  assert.equal((await patch({ commission_pct: 101 })).status, 400)
  assert.equal(calls.updates.length, 0)
})
