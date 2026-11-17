import {test} from 'node:test'
import assert from 'node:assert/strict'
import {partnerOrder} from './public-order.ts'
import {groupOrderMonths,period} from '../../app/(market)/market/celulab/_components/order-lists.ts'
test('partner never receives internal costs, sources or the labor split',()=>{
 const record={id:'demo',part_cost_ars:11000,commission_ars:4000,commission_pct:33,quote_draft_lines:[{job:'Cambio de módulo',part:25000,labor:15000,partId:'private-sourcing',device:'Moto G22'}],budget_items:[{desc:'Costo interno',price:11000,is_cost:true},{desc:'Trabajo',price:40000}]}
 const safe=partnerOrder(record)
 assert.equal(safe.quote_draft_lines[0].part,40000)
 assert.equal(safe.quote_draft_lines[0].labor,0)
 assert.equal(safe.budget_items.length,1)
 assert.ok(!('part_cost_ars' in safe)&&!('commission_ars' in safe)&&!('partId' in safe.quote_draft_lines[0]))
})
test('closed month is grouped by local Argentina time and keeps year boundaries',()=>{
 assert.equal(period('2027-01-01T02:00:00Z'),'2026-12')
 const items=[{created_at:'2026-12-01T12:00:00Z',damage_diagram:{completedAt:'2027-01-03T15:00:00Z'}},{created_at:'2026-12-20T12:00:00Z'}]
 assert.deepEqual(groupOrderMonths(items).map(g=>g.key),['2027-01','2026-12'])
})
