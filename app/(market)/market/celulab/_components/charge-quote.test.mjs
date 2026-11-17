import { test } from 'node:test'
import assert from 'node:assert/strict'
import {chargeLabel,chargeLabor,chargePrice,chargeSupplier,isChargeJob,matchesChargePart} from './charge-quote.ts'
import {registerHooks} from 'node:module'
const hook=registerHooks({resolve(specifier,context,next){
  return next(specifier==='./charge-quote'?'./charge-quote.ts':specifier,context)
}})
const {quoteSummary}=await import('./quote-groups.ts')
hook.deregister()

test('pin and puerto use the same quote flow',()=>{
  for(const job of ['Pin de carga','Cambio de puerto de carga','Cambio de pin de carga']) assert.equal(isChargeJob(job),true)
  assert.equal(isChargeJob('Limpieza de puerto de carga'),false)
})
test('Android only uses a model-compatible charging board',()=>{
  assert.equal(matchesChargePart('Samsung Galaxy A14','Plaqueta de Carga Samsung A14 OEM','Placas'),true)
  assert.equal(matchesChargePart('Moto G32','Sub Board Carga Motorola G32','Partes'),true)
  for(const name of ['Pin de carga A14','Flex de carga A14','Placa madre A14','Placa de carga A14 5G','Placa de carga A145']) {
    assert.equal(matchesChargePart('Samsung Galaxy A14',name,'Placas de carga'),false,name)
  }
})
test('iPhone only uses the matching complete charging flex',()=>{
  assert.equal(matchesChargePart('Apple iPhone 13 Pro','Flex Carga iPhone 13 Pro','Partes'),true)
  for(const name of ['Flex Carga iPhone 13 Pro Max','Placa Carga iPhone 13 Pro','Pin Carga iPhone 13 Pro','Flex volumen iPhone 13 Pro']) {
    assert.equal(matchesChargePart('iPhone 13 Pro',name,'Partes'),false,name)
  }
})
test('supplier names, markup and rates',()=>{
  for(const name of ['JPS','ONLY San Luis','MacCell']) assert.equal(chargeSupplier(name),true)
  assert.equal(chargeSupplier('Otro proveedor'),false)
  assert.deepEqual(chargeLabor('Samsung A14'),[20000,25000])
  assert.deepEqual(chargeLabor('iPhone 13'),[30000,40000,50000])
  assert.deepEqual(chargePrice(5000,2500,20000),{part:7500,total:27500})
})
test('receipts keep commercial names and hide legacy part and supplier names',()=>{
  const old={job:'Cambio de puerto de carga',part:7500,labor:20000,option:'Placa de carga A14 · ONLY San Luis'}
  const android=quoteSummary([{...old,device:'Samsung A14'}])
  assert.match(android,/Pin de carga/)
  assert.doesNotMatch(android,/placa|only/i)
  const iphone=quoteSummary([{...old,device:'iPhone 13',option:'Calidad OEM'}])
  assert.match(iphone,/Pin de carga \(flex completo\).*Calidad OEM/)
  assert.equal(chargeLabel('Moto G32'),'Pin de carga')
})
