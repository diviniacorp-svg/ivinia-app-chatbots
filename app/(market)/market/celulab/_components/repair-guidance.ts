import {isIphone} from './charge-quote'
export const MODULE_MINIMUM=40000
export const REVIEW_PRICE=15000
export const UNKNOWN_ACCESS='Sin acceso, no hay garantía sobre funciones que no podamos verificar.'
export const isModule=(job:string)=>/^cambio de (?:m[oó]dulo|pantalla)\b/i.test(job)
export function finalRepairPrice(job:string,amount:number){return isModule(job)?Math.max(MODULE_MINIMUM,amount):amount}
const normalize=(s:string)=>s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim()
export type Tier='baja'|'media'|'alta'
export function chargeProfile(device:string){
 const model=normalize(device)
 let tier:Tier|null=null,connector='Conector a verificar'
 if(isIphone(device)){
  connector='iPhone · conector a verificar'
  const number=Number(model.match(/\biphone\s*(\d{1,2})\b/)?.[1])
  if(number>=6&&number<=18){
   connector=number>=15?'iPhone · USB-C':'iPhone · Lightning'
   tier=number<=8?'baja':number>=12&&/\b(?:pro|max)\b/.test(model)?'alta':'media'
  }
 }else if(/\b(?:moto(?:rola)?\s*g\s*22|samsung\s+(?:galaxy\s+)?a\s*54)\b/.test(model)){
  connector='Tipo C';tier='media'
 }else if(/\b(?:samsung|galaxy)\s+(?:galaxy\s+)?j\s*[57]\b/.test(model)&&!/\b(?:prime|pro|plus)\b/.test(model)){
  connector='V8 / Micro-USB (verificar variante)';tier='baja'
 }
 return {connector,tier}
}
export function chargeTierOptions(device:string){
 const amounts=isIphone(device)?[30000,40000,50000]:[20000,25000,25000]
 return (['baja','media','alta'] as Tier[]).map((tier,i)=>({tier,amount:amounts[i]}))
}
export function chargeCaution(device:string){
 const model=normalize(device)
 if(!/\b(?:(?:samsung|galaxy)\s+(?:galaxy\s+)?j\s*[57]\b|(?:moto(?:rola)?\s+)?g\s*7\b)/.test(model))return ''
 return 'Verificar la variante antes de abrir. Si se desarma por el frente, el módulo debe estar sano. Si está dañado, cotizar también su cambio antes de intervenir.'
}
export const intakeChoices=[
 {value:'battery',label:'Posible cambio de batería',job:'Cambio de batería'},
 {value:'charge',label:'Posible problema de carga',job:'Cambio de puerto de carga'},
 {value:'board',label:'Posible problema de placa',job:''},
 {value:'water',label:'El equipo se mojó',job:''},
]
export function suggestIntake(text:string){
 const value=normalize(text)
 if(/\b(?:moj|humed|agua|liquido)/.test(value))return 'water'
 if(/\bbateria\b|hinchad|hincho/.test(value))return 'battery'
 if(/\b(?:carga|cargar|cargaba|conector)\b/.test(value))return 'charge'
 if(/\bplaca\b/.test(value))return 'board'
 return ''
}
