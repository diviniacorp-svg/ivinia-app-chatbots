'use client'
import {useEffect,useState} from 'react'
type Repair={id:string;order_number:string;device_brand:string;device_model:string;requested_work:string;status:string;created_at:string;total_ars:number|null;origin?:string;lines?:{job:string;option?:string;part:number;pending?:boolean}[]}
type Purchase={id:string;order_number:string;metodo_pago:string;estado:string;created_at:string;total_ars:number|null;items:{name:string;qty:number;price_ars:number}[]}
export type Customer={key:string;name:string;dni:string;phone:string;repairs:Repair[];purchases:Purchase[]}
export function useCustomers(partner?:string|null){
  const [rows,setRows]=useState<Customer[]>([]),[status,setStatus]=useState('Cargando clientes…'),[version,reload]=useState(0)
  useEffect(()=>{const controller=new AbortController()
    fetch('/api/celulab/customers'+(partner?'?partner='+encodeURIComponent(partner):''),{signal:controller.signal,cache:'no-store'}).then(async r=>{if(!r.ok)throw Error();const data=await r.json();setRows(data);setStatus('')}).catch(()=>{if(!controller.signal.aborted)setStatus('No se pudieron cargar los clientes.')})
    return ()=>controller.abort()
  },[version,partner])
  return {rows,status,refresh:()=>reload(v=>v+1)}
}
const card={background:'white',border:'1px solid #e2e8f0',borderRadius:14,padding:18,marginBottom:12}
const button={fontFamily:'inherit',fontSize:13,fontWeight:600,color:'#374151',background:'white',border:'1px solid #cbd5e1',borderRadius:9,padding:'8px 14px',cursor:'pointer'}
const field={...button,fontWeight:400,color:'#17243b',width:'100%',boxSizing:'border-box' as const,textAlign:'left' as const,cursor:'text'}
const money=(v:number|null)=>v==null?'A consultar':v.toLocaleString('es-AR',{style:'currency',currency:'ARS',maximumFractionDigits:0})
const date=(s:string)=>new Date(s).toLocaleDateString('es-AR',{timeZone:'America/Argentina/Buenos_Aires'})
export default function CustomersTab({partner}:{partner?:string}={}){
 const {rows,status,refresh}=useCustomers(partner),[search,setSearch]=useState(''),[key,select]=useState(''),[edit,setEdit]=useState<Customer|null>(null),[message,setMessage]=useState(''),[saving,setSaving]=useState(false)
 const [adding,setAdding]=useState(false),[contact,setContact]=useState({name:'',dni:'',phone:''})
 async function add(){setSaving(true);try{const r=await fetch('/api/celulab/customers',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({...contact,partner})});const data=await r.json();if(!r.ok)throw Error(data.error||'No se pudo guardar');setAdding(false);setContact({name:'',dni:'',phone:''});setMessage('Ficha guardada.');refresh()}catch(error){setMessage(error instanceof Error?error.message:'No se pudo guardar')}finally{setSaving(false)}}
 const c=rows.find(r=>r.key===key),query=search.trim().toLowerCase()
 async function save(){if(!edit||saving)return;setSaving(true);try{const r=await fetch('/api/celulab/customers',{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({key:edit.key,name:edit.name,phone:edit.phone||'',dni:edit.dni||''})});if(!r.ok)throw Error();setEdit(null);setMessage('Datos guardados.');refresh()}catch{setMessage('No se pudieron guardar los datos.')}finally{setSaving(false)}}
 const matches=rows.filter(r=>[r.name,r.dni,r.phone].some(v=>v?.toLowerCase().includes(query)))
 return <section className="cl-customer-panel">
 <style>{`
 .cl-customer-panel{font:400 13px/1.5 system-ui,sans-serif;color:#374151}
 .cl-customer-panel h2{margin:0;color:#111;font-size:17px;font-weight:700}
 .cl-customer-panel h3{margin:0 0 10px;font-size:15px;font-weight:700;color:#111827}
 .cl-customer-panel .sub{margin:3px 0 20px;color:#64748b;font-size:12px}
 .cl-customer-panel form{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,190px),1fr));gap:10px}
 .cl-customer-panel label{font-size:12px;font-weight:600;color:#475569}
 .cl-customer-panel label input{display:block;margin-top:4px}
 .cl-customer-panel .actions{grid-column:1/-1;display:flex;gap:8px;flex-wrap:wrap}
 .cl-customer-panel article>div,.cl-customer-panel small{color:#64748b}
 .cl-customer-panel :focus-visible{outline:2px solid #2563eb;outline-offset:2px}
 .cl-customer-panel .histories{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;align-items:start}
 .cl-customer-panel .history-heading{display:flex;align-items:center;gap:8px}
 .cl-customer-panel .count{font-size:12px;border-radius:20px;padding:2px 9px;color:#245cda;background:#eff6ff}
 .cl-customer-panel article{overflow-wrap:anywhere}
 @media(max-width:650px){.cl-customer-panel .histories{grid-template-columns:1fr;gap:0}.cl-customer-panel input{font-size:16px!important}}
 `}</style>
 <h2>{partner?'👤 Clientes del local':'👤 Clientes CeluLab'}</h2><p className="sub">{c?'Ficha del cliente · Datos e historial':'Buscá por nombre, DNI o teléfono'}</p>{status&&<p role="status">{status} <button style={button} onClick={refresh}>Actualizar</button></p>}{!c?<>{!adding?<button style={button} onClick={()=>{setAdding(true);setMessage('')}}>+ Guardar cliente</button>:<form onSubmit={e=>{e.preventDefault();void add()}}>{(['name','dni','phone'] as const).map((k,i)=><label key={k}>{['Nombre','DNI','Teléfono'][i]}<input required={k==='name'} style={field} value={contact[k]} onChange={e=>setContact({...contact,[k]:e.target.value})}/></label>)}<div className="actions"><button style={button} disabled={saving}>Guardar ficha</button><button type="button" style={button} onClick={()=>setAdding(false)}>Cancelar</button></div></form>}{message&&<p role="status">{message}</p>}<input aria-label="Buscar cliente" style={field} placeholder="Buscar por nombre, DNI o teléfono" value={search} onChange={e=>setSearch(e.target.value)}/><p>{matches.length} clientes</p>{matches.map(r=><button key={r.key} onClick={()=>{select(r.key);setMessage('')}} style={{...card,width:'100%',textAlign:'left',cursor:'pointer',fontFamily:'inherit',fontSize:13}}><strong>{r.name}</strong><div>{[r.dni,r.phone].filter(Boolean).join(' · ')}</div><small>{r.repairs.length} reparaciones{!partner&&' · '+r.purchases.length+' compras'}</small></button>)}</>:<>
 <button style={button} onClick={()=>{select('');setEdit(null)}}>← Volver a clientes</button><div style={{...card,marginTop:12}}><h3>{c.name}</h3>{edit?<form onSubmit={e=>{e.preventDefault();save()}}>{(['name','dni','phone'] as const).map((k,i)=><label key={k} style={{display:'block',marginBottom:8}}>{['Nombre','DNI','Teléfono'][i]}<input required={k==='name'} style={field} value={edit[k]||''} onChange={e=>setEdit({...edit,[k]:e.target.value})}/></label>)}<div className="actions"><button style={{...button,background:'#2563eb',color:'#fff',borderColor:'#2563eb',fontWeight:700}} disabled={saving}>{saving?'Guardando…':'Guardar cambios'}</button> <button type="button" style={button} onClick={()=>setEdit(null)}>Cancelar</button></div></form>:<><p>DNI {c.dni||'—'} · Teléfono {c.phone||'—'}</p>{!partner&&<button style={button} onClick={()=>{setEdit(c);setMessage('')}}>Editar datos</button>}</>}<div role="status">{message}</div></div>
 <div className="histories"><div style={card}><h3 className="history-heading">🛠 Servicio técnico <span className="count">{c.repairs.length}</span></h3>{!c.repairs.length&&'Sin reparaciones registradas.'}{c.repairs.map(r=><article style={{borderTop:'1px solid #e2e8f0',padding:'12px 0'}} key={r.id}><strong>{r.order_number} · {r.device_brand} {r.device_model}</strong><div>{date(r.created_at)} · {r.status} · {money(r.total_ars)}{!partner&&r.origin&&' · '+r.origin}</div>{r.requested_work}{r.lines?.map((line,index)=><div key={index}>{line.option?.startsWith('Repuesto: ')?line.option.slice(10):line.job} · {line.pending?'A confirmar':money(line.part)}</div>)}</article>)}</div>
 {!partner&&<div style={card}><h3 className="history-heading">🛍 Compras de accesorios <span className="count">{c.purchases.length}</span></h3>{!c.purchases.length&&'Sin compras registradas.'}{c.purchases.map(p=><article style={{borderTop:'1px solid #e2e8f0',padding:'12px 0'}} key={p.id}><strong>{p.order_number} · {money(p.total_ars)}</strong><div>{date(p.created_at)} · {p.estado} · Método elegido: {p.metodo_pago||'Sin registrar'}</div>{Array.isArray(p.items)&&p.items.map((i,n)=><div key={n}>{i.qty} × {i.name} · {money(i.price_ars)} por unidad</div>)}</article>)}</div>}</div></>}</section>
}