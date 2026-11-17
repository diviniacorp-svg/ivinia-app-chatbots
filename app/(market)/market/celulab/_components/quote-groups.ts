import {chargeLabel,isChargeJob} from './charge-quote'
import {publicOption} from './quote-labels'
export type QuoteLine={device:string;job:string;part:number;labor:number;pending?:boolean;equipment?:string;task?:string;option?:string;partId?:string}
export const pesos=(n:number)=>n.toLocaleString('es-AR',{style:'currency',currency:'ARS',maximumFractionDigits:0})
export const publicJob=(line:QuoteLine)=>isChargeJob(line.job)?chargeLabel(line.device):line.job
export const linePrice=(line:QuoteLine)=>line.pending?'A confirmar':pesos(line.part+line.labor)
export function quoteGroups(lines:QuoteLine[]){
 const devices=new Map<string,Map<string,QuoteLine[]>>()
 for(const [i,l] of Array.from(lines.entries())){
  const device=l.equipment||l.device, task=l.task||String(i), tasks=devices.get(device)||new Map<string,QuoteLine[]>()
  tasks.set(task,[...(tasks.get(task)||[]),l]);devices.set(device,tasks)
 }
 return Array.from(devices.values()).map((tasks,index)=>{
  let variants:{lines:QuoteLine[];total:number;pending:boolean}[]=[{lines:[],total:0,pending:false}]
  for(const options of Array.from(tasks.values())){
   if(variants.length*options.length>128)throw Error('Reducí las alternativas por equipo antes de emitir.')
   variants=variants.flatMap(v=>options.map(l=>({lines:[...v.lines,l],total:v.total+l.part+l.labor,pending:v.pending||!!l.pending})))
  }
  return {title:'Equipo '+(index+1)+' · '+variants[0].lines[0].device,variants}
 })
}
export type QuoteGroups=ReturnType<typeof quoteGroups>
export function quoteSummary(lines:QuoteLine[]){
 return quoteGroups(lines).map(group=>[group.title,...group.variants.map((v,i)=>[
  group.variants.length>1?'Alternativa '+(i+1):'',
  ...v.lines.map(l=>[publicJob(l),publicOption(l.option),linePrice(l)].filter(Boolean).join(' · ')),
  'Total del equipo: '+(v.pending?'A confirmar':pesos(v.total))
 ].filter(Boolean).join('\n'))].join('\n\n')).join('\n\n')
}
