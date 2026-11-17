'use client'
import {useState,useEffect,useCallback} from 'react'
import {ChargeOptions,RepairPicker,standardRepairRates,repairName} from './RepairPicker'
import QuoteParts,{catalogGroup} from './QuoteParts'
import {isChargeJob} from './charge-quote'
import {chargeProfile,chargeTierOptions} from './repair-guidance'
import type {QuoteLine} from './quote-groups'
type Job={id:string;title:string;labor:number;part:number;created_at:string;status:string;reason:string|null;total?:number}
export default function ExtraJobs({id,pin,device='',local=false,onDraftChanged}:{id:string;pin?:string;device?:string;local?:boolean;onDraftChanged?:(lines:QuoteLine[])=>void}){
  const [jobs,setJobs]=useState<Job[]>([]),[initial,setInitial]=useState<QuoteLine[]>([]),[revision,setRevision]=useState<string|null>(null)
  const [repair,setRepair]=useState(''),[tier,setTier]=useState(''),[selected,setSelected]=useState(''),[custom,setCustom]=useState('')
  const chargeTier=tier||chargeProfile(device).tier||''
  const [message,setMessage]=useState('')
  const [busy,setBusy]=useState(false)
  const request=useCallback(async(body:Record<string,unknown>|FormData)=>{
    const res=await fetch('/api/celulab/work-orders/'+id,body instanceof FormData?{method:'POST',body}:{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...body,pin})})
    if(!res.ok)throw new Error()
    return res.json()
  },[id,pin])
  const reload=useCallback(async()=>{const data=await request({action:'read'});setJobs(data.jobs||[]);setInitial(data.initial||[]);setRevision(data.revision??null);return data.initial||[]},[request])
  useEffect(()=>{reload().catch(()=>setMessage('No pudimos cargar los trabajos.'))},[reload])
  async function save(body:Record<string,unknown>|FormData,form?:HTMLFormElement){
    setBusy(true)
    try{await request(body);form?.reset();const lines=await reload();if(!(body instanceof FormData)&&body.action==='remove-intake')onDraftChanged?.(lines);setMessage('Guardado.')}catch{setMessage('No pudimos confirmar el cambio. Revisá la orden antes de reintentar.')}finally{setBusy(false)}
  }
  function remove(action:'cancel'|'remove-intake',target:Record<string,unknown>){const reason=window.prompt('Motivo por el que no se hará el trabajo');if(reason?.trim())void save({action,...target,reason})}
  const money=(n:number)=>'$ '+n.toLocaleString('es-AR')
  return <section className="order-work">
    <h3>🛠 Trabajos de la orden</h3>
    {initial.map((line,index)=><article key={index}><strong>{line.job} · {line.pending?'A confirmar':money(line.part+line.labor)}</strong>{line.option&&<p>{line.option}</p>}<button type="button" disabled={busy} onClick={()=>remove('remove-intake',{index,revision})}>Quitar del ingreso</button></article>)}
    <p>Quitar un trabajo deja un motivo registrado. No modifica cobros ya asentados.</p>
    {jobs.map(j=><article key={j.id}><strong>{j.title} · {(j.total??j.labor+j.part)===0?'A cotizar':money(j.total??j.labor+j.part)}</strong><p>{new Date(j.created_at).toLocaleString('es-AR')} · {j.status}</p>{!local&&<p>Mano de obra {money(j.labor)} · Repuesto {money(j.part)}</p>}{j.reason&&<p>{j.reason}</p>}
    {j.status==='presupuestado'&&<form onSubmit={e=>{e.preventDefault();const d=new FormData(e.currentTarget);void save({action:'decision',id:j.id,status:'rechazado',reason:d.get('reason')})}}>
      <button type="button" disabled={busy||(j.total??j.labor+j.part)===0} onClick={()=>save({action:'decision',id:j.id,status:'aceptado'})}>Aceptar trabajo</button>
      <select required aria-label="Motivo de rechazo" name="reason" defaultValue=""><option value="">Motivo de rechazo</option><option>El cliente rechazó el presupuesto</option><option>Sin repuesto disponible</option><option>Decisión del taller</option><option>Otro motivo</option></select>
      <button disabled={busy}>Rechazar este trabajo</button></form>}{j.status==='aceptado'&&<button type="button" disabled={busy} onClick={()=>remove('cancel',{id:j.id})}>Cancelar trabajo</button>}</article>)}
    <details><summary>Buscar trabajo y repuesto para este equipo</summary><RepairPicker device={device} rates={standardRepairRates} value={repair} onChange={value=>{setRepair(value);setTier('');setSelected('')}}/>{isChargeJob(repair)&&<ChargeOptions device={device} value={chargeTier} onChange={setTier}/>}<QuoteParts device={device} job={repair} chargeRate={chargeTierOptions(device).find(t=>t.tier===chargeTier)?.amount||0} selected={selected?[selected]:[]} onPick={(partId,label,total,labor)=>{if(busy)return;setSelected(partId);void save({action:'add',id:crypto.randomUUID(),title:repairName(repair,device)+' · '+label.slice(10),part:total-labor,labor,total})}}/>{repair==='Otro trabajo'&&<form onSubmit={event=>{event.preventDefault();if(custom.trim()){void save({action:'add',id:crypto.randomUUID(),title:custom.trim(),total:0,labor:0,part:0});setCustom('')}}}><label>Describí el trabajo<input value={custom} onChange={event=>setCustom(event.target.value)} maxLength={200} required/></label><button disabled={busy}>Agregar a cotizar</button></form>}{repair==='Revisión'&&<button type="button" disabled={busy} onClick={()=>save({action:'add',id:crypto.randomUUID(),title:'Revisión',labor:15000,part:0,total:15000})}>Agregar revisión · $15.000</button>}</details>
    {!local&&<><details><summary>Agregar trabajo manual del taller</summary><form style={{display:'grid',gap:6}} onSubmit={e=>{e.preventDefault();const form=e.currentTarget,d=new FormData(form);void save({action:'add',id:crypto.randomUUID(),title:d.get('title'),labor:Number(d.get('labor')),part:Number(d.get('part'))},form)}}>
      <label>Trabajo <input required name="title" maxLength={200}/></label><label>Mano de obra $ <input type="number" min="0" name="labor" required/></label><label>Repuesto $ <input type="number" min="0" name="part" defaultValue={0} required/></label><button disabled={busy}>Agregar al presupuesto</button>
    </form></details><details><summary>Compartir evidencia con el cliente</summary><form style={{display:'grid',gap:6}} onSubmit={e=>{e.preventDefault();const form=e.currentTarget,d=new FormData(form);const file=d.get('file');if(!(file instanceof File)||file.size>4000000){setMessage('El máximo es 4 MB por archivo.');return}void save(d,form)}}>
    <input required type="file" name="file" accept="image/jpeg,image/png,image/webp,video/mp4,video/webm"/><input name="caption" placeholder="Descripción para el cliente" maxLength={400}/><button disabled={busy}>Publicar en el seguimiento</button></form></details></>}
    {message&&<p role="status">{message}</p>}
    <style jsx>{`
      .order-work { padding:18px 20px; border:1px solid #e5e7eb; background:white; border-radius:14px; font:inherit; color:#374151; min-width:0 }
      h3 { font-size:13px; font-weight:600; margin:0 0 12px }
      details, article { margin-top:8px; border:1px solid #e5e7eb; border-radius:9px; font-size:13px; padding:0 12px }
      summary { cursor:pointer; padding:10px 0; font-weight:600 }
      form, article { padding-block:10px }
      label { display:grid; gap:4px }
      input, select, button { font:inherit; background:#fff; border:1px solid #d1d5db; border-radius:8px; padding:8px 10px; max-width:100%; box-sizing:border-box }
      button { color:#1d4ed8; cursor:pointer; font-weight:600 }
      p { margin:5px 0; font-size:13px }
    `}</style>
  </section>
}