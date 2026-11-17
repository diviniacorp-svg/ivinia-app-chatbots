import { test } from 'node:test'
import assert from 'node:assert/strict'
import { quoteJobsToReview, splitDevice } from './quote-order.ts'

test('intake accepts Apple and Motorola device names from an old quote', () => {
  assert.deepEqual(splitDevice(' Apple iPhone 14 Pro '), {device_brand:'iPhone',device_model:'14 Pro'})
  assert.deepEqual(splitDevice('Moto G22'), {device_brand:'Motorola',device_model:'G22'})
  assert.deepEqual(splitDevice('Samsung'), {device_brand:'Samsung',device_model:''})
})
test('an archived quote has no confirmed jobs until selections from the current catalogue are made', () => {
  const requested=['Cambio de módulo','Cambio de módulo','Pin de carga']
  assert.deepEqual(quoteJobsToReview(requested,[]), ['Cambio de módulo','Pin de carga'])
  assert.deepEqual(quoteJobsToReview(requested,['  cambio de módulo ']), ['Pin de carga'])
})
