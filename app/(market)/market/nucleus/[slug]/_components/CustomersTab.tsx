'use client'
import {useEffect,useState} from 'react'
type Repair={id:string;order_number:string;device_brand:string;device_model:string;requested_work:string;status:string;created_at:string;total_ars:number|null}
type Purchase={id:string;order_number:string;metodo_pago:string;estado:string;created_at:string;total_ars:number|null;items:{name:string;qty:number;price_ars:number}[]}
export type Customer={key:string;name:string;dni:string;phone:string;repairs:Repair[];purchases:Purchase[]}
export function useCustomers(){
  const [rows,setRows]=useState<Customer[]>([]),[status,setStatus]=useState('Cargando clientes…'),[version,reload]=useState(0)
  useEffect(()=>{const controller=new AbortController()
    fetch('/api/celulab/customers',{signal:controller.signal,cache:'no-store'}).then(async r=>{if(!r.ok)throw Error();const data=await r.json();setRows(data);setStatus('')}).catch(()=>{if(!controller.signal.aborted)setStatus('No se pudieron cargar los clientes.')})
    return ()=>controller.abort()
  },[version])
  return {rows,status,refresh:()=>reload(v=>v+1)}
}
const card={background:'white',border:'1px solid #e2e8f0',borderRadius:16,padding:18,marginBottom:12}
const button={font:'inherit',color:'#245cda',background:'white',border:'1px solid #cbd5e1',borderRadius:10,padding:'9px 14px',cursor:'pointer'}
const field={...button,color:'#17243b',width:'100%',boxSizing:'border-box' as const,textAlign:'left' as const,cursor:'text'}
const money=(v:number|null)=>v==null?'A consultar':v.toLocaleString('es-AR',{style:'currency',currency:'ARS',maximumFractionDigits:0})
const date=(s:string)=>new Date(s).toLocaleDateString('es-AR',{timeZone:'America/Argentina/Buenos_Aires'})
export default function CustomersTab(){
 const {rows,status,refresh}=useCustomers(),[search,setSearch]=useState(''),[key,select]=useState(''),[edit,setEdit]=useState<Customer|null>(null),[message,setMessage]=useState(''),[saving,setSaving]=useState(false)
 const c=rows.find(r=>r.key===key),query=search.trim().toLowerCase()
 async function save(){if(!edit||saving)return;setSaving(true);try{const r=await fetch('/api/celulab/customers',{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({key:edit.key,name:edit.name,phone:edit.phone||'',dni:edit.dni||''})});if(!r.ok)throw Error();setEdit(null);setMessage('Datos guardados.');refresh()}catch{setMessage('No se pudieron guardar los datos.')}finally{setSaving(false)}}
 const matches=rows.filter(r=>[r.name,r.dni,r.phone].some(v=>v?.toLowerCase().includes(query)))
 return <section><h2>Clientes</h2>{status&&<p role="status">{status} <button style={button} onClick={refresh}>Actualizar</button></p>}{!c?<><input aria-label="Buscar cliente" style={field} placeholder="Buscar por nombre, DNI o teléfono" value={search} onChange={e=>setSearch(e.target.value)}/><p>{matches.length} clientes</p>{matches.map(r=><button key={r.key} onClick={()=>{select(r.key);setMessage('')}} style={{...card,width:'100%',textAlign:'left',cursor:'pointer',font:'inherit'}}><strong>{r.name}</strong><div>{[r.dni,r.phone].filter(Boolean).join(' · ')}</div><small>{r.repairs.length} reparaciones · {r.purchases.length} compras</small></button>)}</>:<>
 <button style={button} onClick={()=>{select('');setEdit(null)}}>← Volver a clientes</button><div style={{...card,marginTop:12}}><h3>{c.name}</h3>{edit?<form onSubmit={e=>{e.preventDefault();save()}}>{(['name','dni','phone'] as const).map((k,i)=><label key={k} style={{display:'block',marginBottom:8}}>{['Nombre','DNI','Teléfono'][i]}<input required={k==='name'} style={field} value={edit[k]||''} onChange={e=>setEdit({...edit,[k]:e.target.value})}/></label>)}<button style={button} disabled={saving}>Guardar cambios</button> <button type="button" style={button} onClick={()=>setEdit(null)}>Cancelar</button></form>:<><p>DNI {c.dni||'—'} · Teléfono {c.phone||'—'}</p><button style={button} onClick={()=>{setEdit(c);setMessage('')}}>Editar datos</button></>}<div role="status">{message}</div></div>
 <div style={card}><h3>Servicio técnico</h3>{!c.repairs.length&&'Sin reparaciones registradas.'}{c.repairs.map(r=><article style={{borderTop:'1px solid #e2e8f0',padding:'12px 0'}} key={r.id}><strong>{r.order_number} · {r.device_brand} {r.device_model}</strong><div>{date(r.created_at)} · {r.status} · {money(r.total_ars)}</div>{r.requested_work}</article>)}</div>
 <div style={card}><h3>Compras de accesorios</h3>{!c.purchases.length&&'Sin compras registradas.'}{c.purchases.map(p=><article style={{borderTop:'1px solid #e2e8f0',padding:'12px 0'}} key={p.id}><strong>{p.order_number} · {money(p.total_ars)}</strong><div>{date(p.created_at)} · {p.estado} · Método elegido: {p.metodo_pago||'Sin registrar'}</div>{Array.isArray(p.items)&&p.items.map((i,n)=><div key={n}>{i.qty} × {i.name} · {money(i.price_ars)} por unidad</div>)}</article>)}</div></>}</section>
}