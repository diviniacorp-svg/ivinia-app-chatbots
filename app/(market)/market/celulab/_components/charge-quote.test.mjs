import { test } from 'node:test'
import assert from 'node:assert/strict'
import {chargeLabel,chargeLabor,chargePrice,chargeSupplier,isChargeJob,matchesChargePart} from './charge-quote.ts'
import {registerHooks} from 'node:module'
const hook=registerHooks({resolve(specifier,context,next){
  return next(['./charge-quote','./quote-labels','./quote-groups','./quote-document','./repair-guidance'].includes(specifier)?specifier+'.ts':specifier,context)
}})
const {quoteSummary}=await import('./quote-groups.ts')
const {partCaption,partQuality}=await import('./quote-labels.ts')
const {quoteMessage,quotePdf,printableQuote}=await import('./quote-document.ts')
const {chargeProfile,chargeTierOptions,chargeCaution,finalRepairPrice,suggestIntake}=await import('./repair-guidance.ts')
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
  const iphone=quoteSummary([{...old,device:'iPhone 13',option:'Repuesto: Calidad OEM'}])
  assert.match(iphone,/Pin de carga \(flex completo\).*Calidad OEM/)
  assert.equal(chargeLabel('Moto G32'),'Pin de carga')
})

test('shared part is presented under the requested model, with clean quality and no supplier',()=>{
 const caption=partCaption('Cambio de módulo','Motorola G22',partQuality('','Módulo Moto E32/G22 Incell'))
 assert.equal(caption,'Módulo G22 Incell')
 const quote={quote_id:'test-123',revision:1,issued_at:'2026-11-17T03:00:00Z',issuer:'Local Demo',customer:'Cliente <Demo>',lines:[{device:'Motorola G22',job:'Cambio de módulo',part:20000,labor:22500,option:'Repuesto: '+caption},{device:'Motorola G22',job:'Cambio de batería',part:0,labor:0,pending:true,option:'Batería Motorola · VG Mayorista'}]}
 const text=quoteMessage(quote), html=printableQuote(quote)
 assert.match(text,/Módulo G22 Incell/)
 assert.match(text,/42\.500/)
 assert.doesNotMatch(text,/E32|Mayorista/)
 assert.match(html,/Cliente &lt;Demo&gt;/)
 assert.doesNotMatch(html,/Mayorista/)
 return quotePdf(quote).text().then(pdf=>{assert.match(pdf,/^%PDF-1\.4/);assert.match(pdf,/xref/);assert.match(pdf,/%%EOF$/m)})
})

test('module floor preserves higher amounts and never modifies batteries',()=>{
 assert.equal(finalRepairPrice('Cambio de módulo',35000),40000)
 assert.equal(finalRepairPrice('Cambio de módulo',42500),42500)
 assert.equal(finalRepairPrice('Cambio de batería',15000),15000)
})
test('charge tiers, variant caution and optional intake suggestion',()=>{
 assert.equal(chargeProfile('Moto G22').tier,'media')
 assert.equal(chargeProfile('Moto G22').connector,'Tipo C')
 assert.equal(chargeProfile('Android no identificado').tier,null)
 assert.deepEqual(chargeTierOptions('iPhone 15 Pro').map(a=>a.amount),[30000,40000,50000])
 assert.match(chargeCaution('Samsung J7 Prime'),/Si se desarma por el frente/)
 assert.match(chargeCaution('Moto G7'),/Verificar la variante/)
 assert.equal(chargeCaution('Moto G22'),'')
 assert.equal(suggestIntake('Se hinchó la batería'),'battery')
 assert.equal(suggestIntake('No enciende'),'')
 assert.match(quoteSummary([{device:'Samsung J5',job:'Cambio de puerto de carga',part:12000,labor:20000}]),/módulo debe estar sano/)
})
