'use client'
import {useEffect,useRef,useState} from 'react'
import {chargeLabel,isChargeJob} from './charge-quote'
import {isModule,MODULE_MINIMUM,REVIEW_PRICE,chargeTierOptions,chargeProfile,chargeCaution} from './repair-guidance'
import {pesos} from './quote-groups'
export type RepairRate={job:string;labor_ars:number|null}
export const standardRepairRates:RepairRate[]=[
 ...['Revisión','Cambio de módulo','Cambio de puerto de carga','Cambio de batería','Cambio de vidrio de cámara','Cambio de cámara','Cambio de flex','Limpieza interna de parlantes, puertos y cámaras','Cambio de tapa trasera (excepto iPhone)','Recuperación de cuenta comprometida','Equipo que no enciende','Equipo mojado / baño químico','Software','Cuenta de Google','Microsoldadura','Circuito integrado CPU','Circuito integrado OVP','Circuito integrado PMIC','Circuito integrado IFPMIC','Cambio de micrófono','Cambio de parlante auricular','Cambio de parlante buzzer','Cambio de botones','Cambio de sensor de huella','Otro trabajo'].map(job=>({job,labor_ars:null}))
]
export const repairName=(job:string,device:string)=>isChargeJob(job)?chargeLabel(device):job
export function repairPrice(rate:RepairRate){
 if(rate.job==='Revisión')return pesos(REVIEW_PRICE)
 if(isModule(rate.job))return 'Desde '+pesos(MODULE_MINIMUM)
 if(/^Cambio de /.test(rate.job)||isChargeJob(rate.job))return 'Según repuesto'
 return rate.labor_ars==null?'A confirmar':pesos(rate.labor_ars)
}
export function RepairPicker({device,rates,value,onChange,disabledJob}:{device:string;rates:RepairRate[];value:string;onChange:(job:string)=>void;disabledJob?:(job:string)=>boolean}){
 const [open,setOpen]=useState(false),root=useRef<HTMLDivElement>(null),trigger=useRef<HTMLButtonElement>(null)
 useEffect(()=>{
  if(!open)return
  const outside=(event:PointerEvent)=>{if(event.target instanceof Node&&!root.current?.contains(event.target))setOpen(false)}
  document.addEventListener('pointerdown',outside)
  return ()=>document.removeEventListener('pointerdown',outside)
 },[open])
 const label=value?repairName(value,device):'Elegí un trabajo'
 const current=rates.find(r=>r.job===value)
 const row={display:'grid',gridTemplateColumns:'minmax(0,1fr) auto',alignItems:'center',gap:12,width:'100%',textAlign:'left' as const,padding:'8px 10px',boxSizing:'border-box' as const}
 return <div ref={root} style={{flex:'1 1 220px',minWidth:0,position:'relative',fontSize:13}} onKeyDown={e=>{if(e.key==='Escape'&&open){e.stopPropagation();setOpen(false);trigger.current?.focus()}}}>
  <span style={{display:'block',marginBottom:4,color:'#475569'}}>Elegir reparación</span>
  <button type="button" ref={trigger} aria-label={'Elegir reparación, '+label} aria-expanded={open} onClick={()=>setOpen(!open)} style={{...row,border:'1px solid #cbd5e1',borderRadius:8,background:'white',cursor:'pointer',color:'#192438'}}>
   <span>{label}</span><strong style={{whiteSpace:'nowrap',textAlign:'right'}}>{current?repairPrice(current)+'  ▾':'▾'}</strong>
  </button>
  {open&&<div role="group" aria-label="Reparaciones" style={{position:'absolute',zIndex:5,top:'100%',left:0,right:0,maxHeight:290,overflowY:'auto',border:'1px solid #cbd5e1',borderRadius:8,background:'white',boxShadow:'0 8px 20px #182b501f'}}>
   {rates.map(rate=><button key={rate.job} aria-pressed={value===rate.job} type="button" disabled={disabledJob?.(rate.job)} onClick={()=>{onChange(rate.job);setOpen(false);trigger.current?.focus()}} style={{...row,border:0,borderBottom:'1px solid #edf1f8',borderRadius:0,background:value===rate.job?'#edf4ff':'white',color:'#192438',cursor:'pointer'}}>
    <span>{repairName(rate.job,device)}</span><strong style={{whiteSpace:'nowrap',textAlign:'right'}}>{repairPrice(rate)}</strong>
   </button>)}
  </div>}
 </div>
}
export function ChargeOptions({device,value,onChange}:{device:string;value:string;onChange:(v:string)=>void}){
 const profile=chargeProfile(device),caution=chargeCaution(device)
 const [manualConnector,setManualConnector]=useState('')
 const detected=profile.connector.startsWith('iPhone')?profile.connector:profile.connector.startsWith('V8')?'V8 / Micro-USB':profile.connector==='Tipo C'?'Tipo C':''
 return <div style={{margin:'9px 0',fontSize:12}}>
  <label style={{display:'block'}}>Conector<select value={manualConnector||detected} onChange={e=>setManualConnector(e.target.value)} style={{display:'block',width:'100%',marginTop:4,padding:7,border:'1px solid #cbd5e1',borderRadius:8,background:'white'}}><option value="">A verificar</option><option>V8 / Micro-USB</option><option>Tipo C</option><option>iPhone · Lightning</option><option>iPhone · USB-C</option><option>iPhone · conector a verificar</option></select></label>
  <label style={{display:'block',marginTop:5}}>Gama del equipo
   <select value={value} onChange={e=>onChange(e.target.value)} style={{display:'block',width:'100%',marginTop:4,padding:7,border:'1px solid #cbd5e1',borderRadius:8,background:'white'}}>
    <option value="">Elegí una gama</option>
    {chargeTierOptions(device).map(t=><option key={t.tier} value={t.tier}>Gama {t.tier} · {pesos(t.amount)}{profile.tier===t.tier?' · sugerida':''}</option>)}
   </select>
  </label>
  {caution&&<p role="note" style={{background:'#fffaeb',color:'#8c4d11',padding:9,borderRadius:8}}>{caution}</p>}
 </div>
}
