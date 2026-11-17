'use client'
import {useEffect,useState} from 'react'
import {pesos} from './quote-groups'
import {chargeModel,isChargeJob} from './charge-quote'
type Part={id:string;name:string;status:'available'|'unavailable'|'unknown';final_price:number|null;labor_ars:number|null}
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

export default function QuoteParts({device,job,chargeRate,selected,onPick}:{device:string;job:string;chargeRate:number;selected:string[];onPick:(key:string,label:string,total:number,labor:number)=>void}){
 const charge=isChargeJob(job), [rows,setRows]=useState<Part[]>([]),[status,setStatus]=useState('')
 useEffect(()=>{
  const ctrl=new AbortController(), group=catalogGroup(job), model=chargeModel(device)
  setRows([]);setStatus('')
  if(!group||model.length<2)return
  setStatus('Consultando disponibilidad…')
  const timer=setTimeout(async()=>{
   try{
    const tabs=charge?['partes','placas']:/vidrio/i.test(job)?['glass','partes','camaras']:[group[0]]
    const batches=await Promise.all(tabs.map(async tab=>{
      const matches:Part[]=[]
      for(let offset=0;;offset+=100){
        const query=new URLSearchParams({q:model,tab,offset:String(offset),limit:'100',quoteJob:job,device,labor:String(chargeRate)})
        const response=await fetch('/api/celulab/lista?'+query,{signal:ctrl.signal})
        if(!response.ok)throw Error()
        const data=await response.json() as {items:Part[];total:number}
        matches.push(...data.items)
        if(offset+100>=data.total)break
      }
      return matches
    }))
    if(!ctrl.signal.aborted){
     const matches=Array.from(new Map(batches.flat().map(p=>[p.id,p])).values())
     matches.sort((a,b)=>Number(b.status==='available')-Number(a.status==='available')||(a.final_price??Infinity)-(b.final_price??Infinity))
     setRows(matches);setStatus(matches.length?'':'No encontramos repuestos para ese modelo y reparación.')
    }
   }catch{if(!ctrl.signal.aborted)setStatus('No se pudo consultar la lista de precios.')}
  },260)
  return ()=>{clearTimeout(timer);ctrl.abort()}
 },[device,job,charge,chargeRate])
 if(!catalogGroup(job)||!device.trim())return null
 return <section className="cl-parts"><strong>Repuestos para este trabajo</strong>{status&&<p role="status">{status}</p>}{rows.map(part=>{
  const available=part.status==='available', total=part.final_price, labor=part.labor_ars
  return <button className="cl-part" type="button" key={part.id} aria-pressed={selected.includes(part.id)} disabled={!available||total===null||labor===null} onClick={()=>{if(available&&total!==null&&labor!==null)onPick(part.id,'Repuesto: '+part.name,total,labor)}}>
   <span>{part.name}<small className={available?'cl-in-stock':'cl-no-stock'}>{available?'Disponible':part.status==='unknown'?'Stock sin confirmar':'Sin stock'}</small></span>
   <strong>{total===null?(available&&charge?'Elegí mano de obra':'—'):pesos(total)}</strong>
  </button>
 })}</section>
}
