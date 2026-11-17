import {test} from 'node:test'
import assert from 'node:assert/strict'
import {readFileSync} from 'node:fs'
import {createRequire} from 'node:module'
import vm from 'node:vm'

const require=createRequire(import.meta.url),ts=require('typescript')
const source=readFileSync(new URL('../../app/api/celulab/orders/route.ts',import.meta.url),'utf8')
const code=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText
const pid='660c74ca-7fce-4d60-bfee-cb19de180422'
function fixture({owner=false,admin=false}={}){
 const calls=[]
 const query={}
 for(const key of ['select','eq','neq','gt','gte','lt','order','is','range'])query[key]=(...args)=>{calls.push([key,...args]);return query}
 query.then=resolve=>resolve({data:[{budget_ars:12300},{budget_ars:22700}],error:null})
 const modules={
  'next/server':{NextResponse:{json:(body,options)=>({body,status:options?.status??200})}},
  '@/lib/supabase':{createAdminClient:()=>({from:()=>query})},
  '@/lib/celulab/owner-session':{canReadEarnings:async(_req,id)=>owner&&id===pid},
  '@/lib/celulab/partner-session':{orderActor:async()=>({allowed:true,admin}),validPartnerId:id=>id===pid},
  '@/lib/celulab/public-order':{},'@/lib/celulab/payment-accounts':{},'@/lib/twilio':{},'@/lib/celulab/order-sourcing':{},
  '@/app/(market)/market/celulab/_components/charge-quote':{},'@/app/(market)/market/celulab/_components/repair-guidance':{},
 }
 const exports={}
 vm.runInNewContext(code,{exports,require:id=>{if(!(id in modules))throw Error(id);return modules[id]}, URL})
 return {calls,get:query=>exports.GET({url:'https://demo.example/api/celulab/orders?'+query})}
}
test('monthly budget rejects a seller session without the owner session before querying totals',async()=>{
 const f=fixture()
 assert.equal((await f.get('summary=budget&partner_id='+pid)).status,403)
 assert.equal(f.calls.length,0)
})
test('authorized owner gets monthly budget for their local, excluding rejected orders',async()=>{
 const f=fixture({owner:true})
 const result=await f.get('summary=budget&partner_id='+pid)
 assert.equal(result.status,200)
 assert.equal(result.body.total,35000)
 assert.ok(f.calls.some(x=>x[0]==='eq'&&x[1]==='partner_id'&&x[2]===pid))
 assert.ok(f.calls.some(x=>x[0]==='neq'&&x[1]==='status'&&x[2]==='rechazado'))
})
test('the direct workshop scope is administrative and queries without a partner',async()=>{
 const f=fixture()
 assert.equal((await f.get('scope=direct')).status,403)
 const a=fixture({admin:true})
 assert.equal((await a.get('scope=direct')).status,200)
 assert.ok(a.calls.some(x=>x[0]==='is'&&x[1]==='partner_id'&&x[2]===null))
})
