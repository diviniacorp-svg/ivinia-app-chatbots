import {test} from 'node:test'
import assert from 'node:assert/strict'
import {readFileSync} from 'node:fs'
import {createRequire} from 'node:module'
import vm from 'node:vm'
import * as catalog from './catalog.ts'

const require=createRequire(import.meta.url),ts=require('typescript')
const source=readFileSync(new URL('../../app/api/celulab/products/route.ts',import.meta.url),'utf8')
const code=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText
function setup(allowed,products){
 const calls=[]
 const query={}
 for(const op of ['select','eq','order'])query[op]=(...args)=>{calls.push([op,...args]);return query}
 query.range=async (start,end)=>({data:products.slice(start,end+1),error:null})
 const modules={
  'next/server':{NextResponse:{json:(body,opts)=>({body,status:opts?.status??200})}},
  '@/lib/supabase':{createAdminClient:()=>({from:(table)=>{calls.push(['table',table]);return table==='cl_products'?query:{select:async()=>({data:[{category:'Cables',markup_pct:25}],error:null})}}})},
  '@/lib/celulab/nucleus-session':{hasNucleusSession:async()=>allowed},
  '@/lib/celulab/catalog':catalog
 }
 const exports={}
 vm.runInNewContext(code,{exports,require:id=>modules[id],URL})
 return {run:q=>exports.GET({nextUrl:new URL('https://demo.test?view=catalog&'+q)}),calls}
}
const sample=[
 {id:'c1',name:'Cable USB-C Kolke',brand:'Kolke',category:'Cables',price_ars:2000,in_stock:true},
 {id:'c2',name:'Cable USB-C Samsung',brand:'Samsung',category:'Cables',price_ars:3000,in_stock:false},
 {id:'b1',name:'Batería interna iPhone',brand:'Apple',category:'Baterías',price_ars:8000,in_stock:true},
 {id:'b2',name:'Batería portátil USB',brand:'Kolke',category:'Cargadores',price_ars:20000,in_stock:true},
 {id:'t1',name:'Pinza',brand:'',category:'Herramientas',price_ars:1500,in_stock:true},
]
test('private catalogue does not read supplier costs without a Nucleus session',async()=>{
 const s=setup(false,sample)
 assert.equal((await s.run('')).status,401)
 assert.equal(s.calls.length,0)
})
test('catalogue keeps accessories including supplier stockouts, excluding repair batteries and tools',async()=>{
 const r=await setup(true,sample).run('q=usb%20c&category=Cables')
 assert.equal(r.status,200)
 assert.equal(r.body.catalogueSize,3)
 assert.equal(r.body.available,2)
 assert.equal(r.body.total,2)
 const available=r.body.items.find(row=>row.id==='c1')
 assert.equal(available.final_price,2500)
 assert.equal(r.body.items.find(row=>row.id==='c2').in_stock,false)
 const filtered=await setup(true,sample).run('stock=unavailable')
 assert.equal(filtered.body.total,1)
 assert.equal(filtered.body.items[0].id,'c2')
})
