import { test } from 'node:test'
import assert from 'node:assert/strict'
import { loadOrderTracking, trackingPrintBlock, trackingUrl } from './order-tracking.ts'

const origin = 'https://prueba.example'
const path = '/market/celulab/seguimiento/b0d30269-ee84-48b0-81eb-10c9a34ce397'

test('tracking accepts the app route and rejects missing tokens or off-site links', () => {
  assert.equal(trackingUrl(origin, path), origin + path)
  for (const invalid of [null, 'https://otro.example' + path, '//otro.example' + path, path + '?falso=1', '/seguimiento/CL-001']) {
    assert.throws(() => trackingUrl(origin, invalid))
  }
})

test('order receipt uses the same tokenized URL as the QR and requires no external QR service', async t => {
  Object.defineProperty(globalThis, 'window', { value: { location: { origin } }, configurable: true })
  t.after(() => { delete globalThis.window })
  t.mock.method(globalThis, 'fetch', async (endpoint, options) => {
    assert.equal(endpoint, '/api/celulab/work-orders/demo')
    assert.equal(options.method, 'POST')
    assert.deepEqual(JSON.parse(options.body), { action: 'share' })
    return Response.json({ path })
  })
  const tracking = await loadOrderTracking('demo')
  assert.equal(tracking.url, origin + path)
  assert.match(tracking.qr, /^data:image\/png;base64,iVBOR/)
  const receipt = trackingPrintBlock(tracking)
  assert.ok(receipt.includes('href="' + tracking.url + '"'))
  assert.ok(receipt.includes('src="' + tracking.qr + '"'))
  assert.doesNotMatch(trackingPrintBlock(null), /<img|href=/)
})
