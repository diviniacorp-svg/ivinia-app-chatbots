'use client'
import {useEffect,useState} from 'react'
import {familyLabels,type FamilyKind} from '@/lib/celulab/customer-family'
import type {Customer} from './CustomersTab'
type Link={key:string;kind:FamilyKind}
export default function CustomerFamily({customer,rows,onOpen}:{customer:Customer;rows:Customer[];onOpen:(key:string)=>void}){
 const [links,setLinks]=useState<Link[]>([])
 const [search,setSearch]=useState('')
 const [related,setRelated]=useState('')
 const [kind,setKind]=useState<FamilyKind>('family')
 const [message,setMessage]=useState('')
 const [busy,setBusy]=useState(false)
 const [version,reload]=useState(0)
 useEffect(()=>{
  const ctrl=new AbortController()
  fetch('/api/celulab/customers/family?key='+encodeURIComponent(customer.key),{cache:'no-store',signal:ctrl.signal})
   .then(r=>{if(!r.ok)throw Error();return r.json()}).then(r=>{if(!ctrl.signal.aborted)setLinks(r)})
   .catch(()=>{if(!ctrl.signal.aborted)setMessage('No se pudieron cargar los vínculos.')})
  return ()=>ctrl.abort()
 },[customer.key,version])
 const names=new Map(rows.map(row=>[row.key,row.name]))
 const candidates=search.trim()?rows.filter(row=>row.key!==customer.key&&!links.some(link=>link.key===row.key)&&row.name.toLowerCase().includes(search.trim().toLowerCase())).slice(0,30):[]
 async function change(method:'POST'|'DELETE',other:string,type:FamilyKind){
  if(busy||!other)return
  setBusy(true);setMessage('')
  try{
   const r=await fetch('/api/celulab/customers/family',{method,headers:{'Content-Type':'application/json'},body:JSON.stringify({key:customer.key,related:other,kind:type})})
   if(!r.ok)throw Error()
   if(method==='POST'){setSearch('');setRelated('')}
   reload(v=>v+1)
   setMessage(method==='POST'?'Vínculo guardado.':'Vínculo quitado. Las fichas siguen intactas.')
  }catch{setMessage('No se pudo guardar el cambio. Revisá la ficha y volvé a intentar.')}
  finally{setBusy(false)}
 }
 return <section className="customer-card">
  <h3>👥 Familia y contactos relacionados</h3>
  <p className="sub">Asociá fichas existentes sin mezclar compras, reparaciones ni datos.</p>
  {links.length===0&&<p style={{color:'#64748b'}}>Todavía no hay vínculos.</p>}
  {links.map(link=><div key={link.key+link.kind} className="customer-family-row">
   {names.has(link.key)?<button type="button" className="customer-link" onClick={()=>onOpen(link.key)}>{names.get(link.key)}</button>:<span>Ficha no disponible</span>}
   <span>{familyLabels[link.kind]}</span><button type="button" className="customer-soft" disabled={busy} onClick={()=>{if(window.confirm('¿Quitar este vínculo? No se borrará ninguna ficha.'))void change('DELETE',link.key,link.kind)}}>Quitar vínculo</button>
  </div>)}
  <form onSubmit={e=>{e.preventDefault();void change('POST',related,kind)}}>
   <label>Buscar otra ficha<input type="search" placeholder="Nombre y apellido" value={search} onChange={e=>{setSearch(e.target.value);setRelated('')}} /></label>
   {search&&<label>Cliente<select required value={related} onChange={e=>setRelated(e.target.value)}><option value="">{candidates.length?'Elegí una ficha':'No encontramos una ficha'}</option>{candidates.map(c=><option value={c.key} key={c.key}>{c.name}{c.phone?' · '+c.phone:''}</option>)}</select></label>}
   <label>Tipo de vínculo<select value={kind} onChange={e=>setKind(e.target.value as FamilyKind)}>{Object.entries(familyLabels).map(([id,name])=><option value={id} key={id}>{name}</option>)}</select></label>
   <div className="actions"><button type="submit" className="customer-primary" disabled={!related||busy}>Vincular fichas</button></div>
  </form>
  {message&&<p role="status">{message}</p>}
 </section>
}
