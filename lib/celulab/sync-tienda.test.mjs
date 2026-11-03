import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import vm from 'node:vm'
const ts = createRequire(import.meta.url)('typescript')
const compiled = ts.transpileModule(readFileSync(new URL('../../app/api/celulab/sync/tienda/route.ts', import.meta.url), 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText
function fixture({ allowed = true, failDownload = false, failInsert = false } = {}) {
  const calls = []
  const q = { eq() {return q}, not(){return q}, lt(){calls.push('retire');return Promise.resolve({error:null})} }
  const db = {from(){return { upsert:async()=>{calls.push('insert');return {error:failInsert?{}:null}},update:()=>q }}}
  const modules = {'next/server':{NextResponse:{json:(body,options={})=>({body,status:options.status||200})}},'@/lib/supabase':{createAdminClient:()=>db},'@/lib/celulab/admin-auth':{canSyncCatalogue:()=>allowed}}
  const exports = {}
  vm.runInNewContext(compiled,{ exports, require:n=>modules[n], Buffer, URL, AbortSignal, process:{env:{ONLY_COOKIE:Buffer.from(JSON.stringify({uid:1,api_key:'test-only'})).toString('base64')}},fetch:async()=>({ok:!failDownload,json:async()=>({body:[{id:1,producto:'Cable USB',categoria:'Cables',precio_final:'1.000',stock:'En stock'}],total_pages:1})}) })
  return {calls,run:()=>exports.POST({url:'https://example.test/sync',headers:new Headers()})}
}
test('unauthenticated sync cannot access provider or modify catalogue',async()=>{const f=fixture({allowed:false});assert.equal((await f.run()).status,401);assert.deepEqual(f.calls,[])})
test('failed download preserves existing catalogue',async()=>{const f=fixture({failDownload:true});assert.equal((await f.run()).status,502);assert.deepEqual(f.calls,[])})
test('failed upsert never retires existing catalogue',async()=>{const f=fixture({failInsert:true});assert.equal((await f.run()).status,503);assert.deepEqual(f.calls,['insert'])})
test('retires old catalogue only after successful imports',async()=>{const f=fixture();assert.equal((await f.run()).status,200);assert.deepEqual(f.calls,['insert','retire'])})
