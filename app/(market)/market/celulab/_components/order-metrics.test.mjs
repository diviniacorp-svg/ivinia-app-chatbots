import {test} from 'node:test'
import assert from 'node:assert/strict'
import {orderMetrics,orderMetricWindow,matchesOrderMetric} from './order-lists.ts'

test('week starts on Monday in Argentina rather than at the UTC boundary',()=>{
 const w=orderMetricWindow('2026-11-16T01:45:00Z')
 assert.deepEqual(w,{today:'2026-11-15',monday:'2026-11-09',month:'2026-11'})
 assert.equal(matchesOrderMetric({status:'ingresado',created_at:'2026-11-09T02:59:59Z'},'week',w),false)
 assert.equal(matchesOrderMetric({status:'ingresado',created_at:'2026-11-09T03:00:00Z'},'week',w),true)
})

test('metric list and cards use the same filters and never treat rejected as delivered or budgeted',()=>{
 const w=orderMetricWindow('2026-11-17T05:00:00Z')
 const rows=[
  {status:'listo',created_at:'2026-11-16T13:00:00Z',budget_ars:18000},
  {status:'entregado',created_at:'2026-11-12T19:00:00Z',budget_ars:22000},
  {status:'rechazado',created_at:'2026-11-17T04:30:00Z',budget_ars:20000},
  {status:'ingresado',created_at:'2026-10-11T16:00:00Z',budget_ars:50000},
 ]
 assert.deepEqual(orderMetrics(rows,w),{active:2,listo:1,delivered:1,week:2,month:3,budgetMonth:40000})
})
