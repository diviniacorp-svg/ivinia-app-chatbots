import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import * as crypto from 'node:crypto'
import vm from 'node:vm'
import { isTechnicalCategory } from './catalog.ts'
const ts = createRequire(import.meta.url)('typescript')
const compiled = ts.transpileModule(readFileSync(new URL('../../app/api/celulab/storefront/route.ts', import.meta.url), 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText
function fixture(rows, failure = false) {
  const pages = []
  const db = { from(table) {
    const query = {
      gt() { return query }, maybeSingle() { return { data: {username:'demo'} } },
      select() { return query }, eq() { return query }, order() { return query },
      async range(start, end) { pages.push(start); return { data: rows.slice(start, end + 1), error: failure ? new Error('db') : null } },
      then(resolve) { return Promise.resolve({ data: [{ category: 'Cables', markup_pct: 50 }], error: null }).then(resolve) },
    }; return query
  } }
  const exports = {}
  const modules = { 'node:crypto': crypto, 'next/server': { NextResponse: { json: (body, options = {}) => ({ body, status: options.status || 200 }) } }, '@/lib/supabase': { createAdminClient: () => db }, '@/lib/celulab/catalog': { isTechnicalCategory } }
  vm.runInNewContext(compiled, { exports, require: name => modules[name], URL, Map, Set, Array })
  return { pages, get: (query, authenticated = false) => exports.GET({ cookies: { get: () => authenticated ? {value:'a'.repeat(64)} : undefined }, nextUrl: new URL(`https://example.test?${query}`) }) }
}
const row = (id, category) => ({ id, category, name: `Producto ${id}`, brand: 'ONLY', price_ars: 100, is_offer: true })
test('accessories exclude technical categories in search, offers and category counts', async () => {
  const { get } = fixture([row('1', 'Cables'), row('2', 'Herramientas'), row('3', 'Repuestos')])
  const { body } = await get('q=Producto&offers=1')
  assert.equal(body.total, 1)
  assert.equal(body.items[0].final_price, 150)
  assert.deepEqual(Array.from(body.categories, c => c.name), ['Cables'])
  assert.equal((await get('section=technical', true)).body.total, 2)
  assert.equal((await get('category=Herramientas')).body.total, 0)
})
test('category counts include records beyond Supabase first 1000 rows', async () => {
  const { get, pages } = fixture(Array.from({ length: 1003 }, (_, i) => row(String(i), 'Cables')))
  const { body } = await get('limit=2&offset=1000')
  assert.equal(body.total, 1003)
  assert.equal(body.categories[0].count, 1003)
  assert.equal(body.items.length, 2)
  assert.deepEqual(pages, [0, 1000])
})
test('database failures return an error instead of an empty successful catalogue', async () => {
  assert.equal((await fixture([], true).get('')).status, 503)
})

test('repair batteries stay with technicians while power banks remain public', async () => {
  const { get } = fixture([
    { ...row('1', 'Baterías'), name: 'Batería interna Galaxy A14', brand: 'Samsung' },
    { ...row('2', 'Baterías'), name: 'Batería externa power bank' },
  ])
  const publicPage = await get('q=bateria')
  assert.deepEqual(Array.from(publicPage.body.items, item => item.id), ['2'])
  const technicalPage = await get('section=technical&q=samsung%20a14%20bateria', true)
  assert.deepEqual(Array.from(technicalPage.body.items, item => item.id), ['1'])
})

test('technical catalogue requires a session', async () => {
  assert.equal((await fixture([]).get('section=technical')).status, 401)
})
