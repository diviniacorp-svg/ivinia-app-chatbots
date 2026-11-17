'use client'
import {useEffect,useState} from 'react'
import {pesos} from './quote-groups'
import {chargeLabel,chargeModel,chargePrice,chargeSupplier,isChargeJob,matchesChargePart} from './charge-quote'
type Part={id:string;name:string;quality:string;markup_ars:number;labor_ars:number;final_price:number|null;best_provider:string|null;stock:boolean;category:string;all_providers:{name:string;cost:number;available:boolean;updated?:string}[]}
export function catalogGroup(job:string):[string,RegExp?]|null{
 if(isChargeJob(job))return ['partes']
 if(!job.startsWith('Cambio de'))return null
 if(/módulo|pantalla/i.test(job))return ['modulos']
 if(/batería/i.test(job))return ['baterias']
 if(/vidrio.*cámara/i.test(job))return ['glass',/camara|lente/i]
 if(/cámara/i.test(job))return ['camaras']
 if(/tapa/i.test(job))return ['tapas']
 if(/carga/i.test(job))return ['partes',/carga|charging|dock/i]
 if(/micrófono/i.test(job))return ['partes',/microfono/i]
 if(/parlante|buzzer|auricular/i.test(job))return ['partes',/parlante|buzzer|auricular/i]
 if(/botones/i.test(job))return ['partes',/boton|encendido|volumen/i]
 if(/huella/i.test(job))return ['partes',/huella/i]
 if(/flex/i.test(job))return ['partes',/flex/i]
 return null
}
export default function QuoteParts({device,job,chargeRate,onPick}:{device:string;job:string;chargeRate:number;onPick:(key:string,label:string,total:number,labor:number)=>void}){
 const charge=isChargeJob(job)
 const [rows,setRows]=useState<Part[]>([]),[status,setStatus]=useState('')
 useEffect(()=>{
   const ctrl=new AbortController(),group=catalogGroup(job)
   setRows([]);setStatus('')
   const model=charge?chargeModel(device):device.trim().replace(/^(samsung|motorola|xiaomi|apple|huawei)\s+/i,'').replace(/^galaxy\s+/i,'')
   if(!group||model.length<2)return
   setStatus('Consultando Lista…')
   const timer=setTimeout(async()=>{
    try{
      const matches:Part[]=[]
      const tabs=charge||/carga/i.test(job)?['partes','placas']:/vidrio/i.test(job)?['glass','partes','camaras']:[group[0]]
      for(const tab of tabs){
      let offset=0
      while(true){
        const query=new URLSearchParams({q:model,tab,offset:String(offset),limit:'100',offers:'1'})
        const response=await fetch('/api/celulab/lista?'+query,{signal:ctrl.signal})
        if(!response.ok)throw Error()
        const data=await response.json() as {items:Part[];total:number}
        matches.push(...data.items.filter(p=>charge?matchesChargePart(device,p.name,p.category)&&p.all_providers?.some(s=>s.available&&chargeSupplier(s.name)):!group[1]||group[1].test((p.name+' '+p.category).normalize('NFD').replace(/[\u0300-\u036f]/g,''))))
        offset+=data.items.length
        if(!data.items.length||offset>=data.total)break
      }
      }
      if(!ctrl.signal.aborted){setRows(matches);setStatus(matches.length?'':(charge?'Sin stock confirmado para este equipo. Queda a confirmar.':'Sin coincidencias en Lista para este equipo y trabajo.'))}
    }catch{if(!ctrl.signal.aborted)setStatus('No se pudo consultar Lista.')}
   },300)
   return ()=>{clearTimeout(timer);ctrl.abort()}
 },[device,job,charge])
 if(!catalogGroup(job))return null
 return <section><strong>{charge?chargeLabel(device):'Repuestos para este trabajo'}</strong><p role="status">{status}</p>{rows.map(p=><div key={p.id}>{(p.all_providers||[]).map(source=>{
   if(charge&&(!source.available||!chargeSupplier(source.name)))return null
   const total=charge?(chargeRate?chargePrice(source.cost,p.markup_ars,chargeRate).total:null):p.final_price===null?null:p.final_price+source.cost-Math.min(...p.all_providers.map(s=>s.cost))
   const key=[p.id,source.name,source.cost].join(':')
   const option=charge?(p.quality?'Calidad '+p.quality:''):[p.name,p.quality,source.name].filter(Boolean).join(' · ')
   const label=charge?[chargeLabel(device),option].filter(Boolean).join(' · '):option
   return <button type="button" key={key} disabled={total===null} onClick={()=>{if(total!==null)onPick(key,option,total,charge?chargeRate:p.labor_ars)}}>{label} · {total===null?(charge?'Elegí mano de obra':'A consultar'):pesos(total)} · {source.available?'Disponible según proveedor':'Stock a confirmar'}{source.updated?' · '+new Date(source.updated).toLocaleDateString('es-AR'):''}</button>
 })}</div>)}</section>
}
