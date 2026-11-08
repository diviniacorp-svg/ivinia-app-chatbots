'use client'
import {useState,useEffect,useCallback} from 'react'
type Job={id:string;title:string;labor:number;part:number;created_at:string;status:string;reason:string|null}
export default function ExtraJobs({id,pin}:{id:string;pin?:string}){
  const [jobs,setJobs]=useState<Job[]>([])
  const [message,setMessage]=useState('')
  const [busy,setBusy]=useState(false)
  const request=useCallback(async(body:Record<string,unknown>|FormData)=>{
    const res=await fetch('/api/celulab/work-orders/'+id,body instanceof FormData?{method:'POST',body}:{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...body,pin})})
    if(!res.ok)throw new Error()
    return res.json()
  },[id,pin])
  const reload=useCallback(async()=>setJobs(await request({action:'read'})),[request])
  useEffect(()=>{reload().catch(()=>setMessage('No pudimos cargar los trabajos.'))},[reload])
  async function save(body:Record<string,unknown>|FormData,form?:HTMLFormElement){
    setBusy(true)
    try{await request(body);form?.reset();await reload();setMessage('Guardado.')}catch{setMessage('No pudimos confirmar el cambio. Revisá la orden antes de reintentar.')}finally{setBusy(false)}
  }
  const money=(n:number)=>'$ '+n.toLocaleString('es-AR')
  return <section style={{padding:16,margin:'12px 0',background:'#fff',borderRadius:12}}>
    <h3>Trabajos adicionales</h3>
    {jobs.map(j=><article key={j.id}><strong>{j.title} · {money(j.labor+j.part)}</strong><p>{new Date(j.created_at).toLocaleString('es-AR')} · {j.status}</p><p>Mano de obra {money(j.labor)} · Repuesto {money(j.part)}</p>{j.reason&&<p>{j.reason}</p>}
    {!pin&&j.status==='presupuestado'&&<form onSubmit={e=>{e.preventDefault();const d=new FormData(e.currentTarget);void save({action:'decision',id:j.id,status:'rechazado',reason:d.get('reason')})}}>
      <button type="button" disabled={busy} onClick={()=>save({action:'decision',id:j.id,status:'aceptado'})}>Aceptar trabajo</button>
      <select required aria-label="Motivo de rechazo" name="reason" defaultValue=""><option value="">Motivo de rechazo</option><option>El cliente rechazó el presupuesto</option><option>Sin repuesto disponible</option><option>Decisión del taller</option><option>Otro motivo</option></select>
      <button disabled={busy}>Rechazar este trabajo</button></form>}</article>)}
    {!pin&&<><details><summary>Agregar trabajo presupuestado</summary><form style={{display:'grid',gap:6}} onSubmit={e=>{e.preventDefault();const form=e.currentTarget,d=new FormData(form);void save({action:'add',id:crypto.randomUUID(),title:d.get('title'),labor:Number(d.get('labor')),part:Number(d.get('part'))},form)}}>
      <label>Trabajo <input required name="title" maxLength={200}/></label><label>Mano de obra $ <input type="number" min="0" name="labor" required/></label><label>Repuesto $ <input type="number" min="0" name="part" defaultValue={0} required/></label><button disabled={busy}>Agregar al presupuesto</button>
    </form></details><details><summary>Compartir evidencia con el cliente</summary><form style={{display:'grid',gap:6}} onSubmit={e=>{e.preventDefault();const form=e.currentTarget,d=new FormData(form);const file=d.get('file');if(!(file instanceof File)||file.size>4000000){setMessage('El máximo es 4 MB por archivo.');return}void save(d,form)}}>
    <input required type="file" name="file" accept="image/jpeg,image/png,image/webp,video/mp4,video/webm"/><input name="caption" placeholder="Descripción para el cliente" maxLength={400}/><button disabled={busy}>Publicar en el seguimiento</button></form></details></>}
    {message&&<p role="status">{message}</p>}
  </section>
}