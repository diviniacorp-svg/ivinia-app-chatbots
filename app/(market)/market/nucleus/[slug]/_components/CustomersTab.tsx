'use client'
import {useEffect,useState} from 'react'
import CustomerFamily from './CustomerFamily'
type Repair={id:string;order_number:string;device_brand:string;device_model:string;requested_work:string;status:string;created_at:string;total_ars:number|null;origin?:string;lines?:{job:string;option?:string;part:number;pending?:boolean}[]}
type Purchase={id:string;order_number:string;metodo_pago:string;estado:string;created_at:string;total_ars:number|null;items:{name:string;qty:number;price_ars:number}[]}
export type Customer={key:string;name:string;dni:string;phone:string;repairs:Repair[];purchases:Purchase[];quotes?:{id:string;created_at:string}[]}
export function useCustomers(partner?:string|null){
  const [rows,setRows]=useState<Customer[]>([]),[status,setStatus]=useState('Cargando clientes…'),[version,reload]=useState(0)
  useEffect(()=>{const controller=new AbortController()
    fetch('/api/celulab/customers'+(partner?'?partner='+encodeURIComponent(partner):''),{signal:controller.signal,cache:'no-store'}).then(async r=>{if(!r.ok)throw Error();const data=await r.json();setRows(data);setStatus('')}).catch(()=>{if(!controller.signal.aborted)setStatus('No se pudieron cargar los clientes.')})
    return ()=>controller.abort()
  },[version,partner])
  return {rows,status,refresh:()=>reload(v=>v+1)}
}
const money=(v:number|null)=>v==null?'A consultar':v.toLocaleString('es-AR',{style:'currency',currency:'ARS',maximumFractionDigits:0})
const date=(s:string)=>new Date(s).toLocaleDateString('es-AR',{timeZone:'America/Argentina/Buenos_Aires'})
export default function CustomersTab({partner}:{partner?:string}={}){
 const {rows,status,refresh}=useCustomers(partner),[search,setSearch]=useState(''),[key,select]=useState(''),[edit,setEdit]=useState<Customer|null>(null),[message,setMessage]=useState(''),[saving,setSaving]=useState(false)
 const [adding,setAdding]=useState(false),[contact,setContact]=useState({name:'',dni:'',phone:''})
 async function add(){setSaving(true);try{const r=await fetch('/api/celulab/customers',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({...contact,partner})});const data=await r.json();if(!r.ok)throw Error(data.error||'No se pudo guardar');setAdding(false);setContact({name:'',dni:'',phone:''});setMessage('Ficha guardada.');refresh()}catch(error){setMessage(error instanceof Error?error.message:'No se pudo guardar')}finally{setSaving(false)}}
 const normalize=(v:string|null|undefined)=>(v||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('es-AR')
 const c=rows.find(r=>r.key===key),query=normalize(search.trim())
 const digits=query.replace(/[^0-9]/g,'')
 const isNumber=digits.length>0&&/^[0-9+ .()-]+$/.test(query)

 async function save(){if(!edit||saving)return;setSaving(true);try{const r=await fetch('/api/celulab/customers',{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({key:edit.key,name:edit.name,phone:edit.phone||'',dni:edit.dni||''})});if(!r.ok)throw Error();setEdit(null);setMessage('Datos guardados.');refresh()}catch{setMessage('No se pudieron guardar los datos.')}finally{setSaving(false)}}
 const matches=rows.filter(r=>!query||[r.name,r.dni,r.phone].some(v=>normalize(v).includes(query))||(isNumber&&[r.dni,r.phone].some(v=>(v||'').replace(/[^0-9]/g,'').includes(digits))))
 function open(id:string){select(id);setEdit(null);setMessage('')}
 return <section className="cl-customer-panel">
  <style>{`
   .cl-customer-panel{font:400 14px/1.45 system-ui,sans-serif;color:#334155}
   .cl-customer-panel h2,.cl-customer-panel h3{margin:0;color:#0f172a}
   .cl-customer-panel h2{font-size:21px}.cl-customer-panel h3{font-size:16px}
   .cl-customer-panel .sub{margin:4px 0 15px;color:#64748b;font-size:13px}
   .customer-workspace{display:grid;grid-template-columns:minmax(270px,345px) minmax(0,1fr);gap:16px;align-items:start}
   .customer-stack{display:grid;gap:12px;min-width:0}
   .customer-card{background:#fff;border:1px solid #e2e8f0;border-radius:16px;padding:16px;min-width:0;overflow-wrap:anywhere}
   .customer-toolbar,.customer-family-row,.customer-heading{display:flex;gap:8px;align-items:center;justify-content:space-between;flex-wrap:wrap}
   .customer-directory{display:grid;gap:7px;max-height:69vh;overflow:auto;margin-top:10px;padding:2px}
   .customer-row{display:flex;gap:10px;align-items:center;width:100%;min-width:0;text-align:left;font:inherit;color:#17243b;background:#fff;border:1px solid #e2e8f0;border-radius:12px;padding:9px;cursor:pointer}
   .customer-row[aria-pressed=true],.customer-row:hover{border-color:#a5b4fc;background:#f4f6ff}
   .customer-row-text{min-width:0;flex:1;overflow-wrap:anywhere}
   .customer-avatar{font-weight:750;color:#245cda;background:#eff6ff;border-radius:11px;width:37px;height:37px;display:grid;place-items:center;flex-shrink:0}
   .customer-row small,.customer-card small,.customer-card article>div{display:block;color:#64748b}
   .customer-soft,.customer-primary,.customer-link,.customer-back{background:#fff;border:1px solid #dbe3ef;border-radius:10px;padding:8px 12px;color:#1e40af;font:inherit;font-weight:650;cursor:pointer}
   .customer-primary{background:#2563eb;color:#fff;border-color:#2563eb}
   .customer-primary:disabled,.customer-soft:disabled{opacity:.55;cursor:default}
   .customer-link{border:0;padding:4px 0;text-align:left}
   .cl-customer-panel :focus-visible{outline:2px solid #2563eb;outline-offset:2px}
   .cl-customer-panel form{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,175px),1fr));gap:10px;margin-top:12px}
   .cl-customer-panel label{font-size:12px;font-weight:650}
   .cl-customer-panel input,.cl-customer-panel select{display:block;width:100%;box-sizing:border-box;font:inherit;color:#1e293b;background:#fff;border:1px solid #cbd5e1;border-radius:10px;padding:9px 11px;margin:4px 0 0;min-height:39px}
   .cl-customer-panel .actions{grid-column:1/-1;display:flex;gap:8px;flex-wrap:wrap}
   .customer-contact{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,126px),1fr));gap:10px;margin-top:13px}
   .customer-contact>div{border-radius:10px;padding:9px 11px;background:#f8fafc}
   .customer-family-row{border-top:1px solid #e2e8f0;padding:8px 0;justify-content:flex-start}
   .customer-family-row span{color:#64748b}
   .histories{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,260px),1fr));gap:12px;align-items:start}
   .history-heading{display:flex;align-items:center;gap:8px}
   .count{font-size:12px;border-radius:20px;padding:2px 9px;color:#245cda;background:#eff6ff}
   .customer-card article{border-top:1px solid #e2e8f0;padding:10px 0}
   .customer-back{display:none}
   @media(max-width:720px){.customer-workspace{grid-template-columns:1fr}.customer-workspace[data-open=true] .customer-index{display:none}.customer-back{display:inline-block}.customer-directory{max-height:none}.cl-customer-panel input,.cl-customer-panel select{font-size:16px}.histories{grid-template-columns:1fr}}
  `}</style>
  <div className="customer-heading" style={{marginBottom:14}}>
   <div><h2>{partner?'👤 Clientes del local':'👤 Clientes CeluLab'}</h2><p className="sub" style={{marginBottom:0}}>{partner?'Fichas e historial de servicio técnico de este local.':'Fichas, reparaciones, compras online y presupuestos.'}</p></div>
   <button type="button" className="customer-primary" onClick={()=>{open('');setAdding(v=>!v)}}>{adding?'Cancelar':'+ Guardar cliente'}</button>
  </div>
  {status&&<p role="status">{status} <button type="button" className="customer-soft" onClick={refresh}>Actualizar</button></p>}
  {adding&&<div className="customer-card" style={{marginBottom:12}}><h3>Nueva ficha</h3><form onSubmit={e=>{e.preventDefault();void add()}}>{(['name','dni','phone'] as const).map((k,i)=><label key={k}>{['Nombre y apellido','DNI','Teléfono'][i]}<input required={k==='name'} value={contact[k]} onChange={e=>setContact({...contact,[k]:e.target.value})}/></label>)}<div className="actions"><button className="customer-primary" disabled={saving}>Guardar ficha</button><button type="button" className="customer-soft" onClick={()=>setAdding(false)}>Cancelar</button></div></form></div>}
  {message&&!c&&<p role="status">{message}</p>}
  <div className="customer-workspace" data-open={!!c}>
   <aside className="customer-card customer-index" aria-label="Directorio de clientes">
    <div className="customer-toolbar"><h3>Directorio</h3><span className="count">{matches.length} {matches.length===1?'cliente':'clientes'}</span></div>
    <input type="search" aria-label="Buscar cliente" placeholder="Nombre, DNI o teléfono" value={search} onChange={e=>setSearch(e.target.value)}/>
    <div className="customer-directory">{matches.map(r=><button type="button" key={r.key} aria-pressed={r.key===key} className="customer-row" onClick={()=>open(r.key)}>
     <span className="customer-avatar" aria-hidden="true">{r.name.split(/\s+/).slice(0,2).map(n=>n[0]).join('').toUpperCase()||'•'}</span>
     <span className="customer-row-text"><strong>{r.name}</strong><small>{r.phone||r.dni||'Sin contacto registrado'}</small><small>{r.repairs.length} reparaciones{!partner&&' · '+r.purchases.length+' compras'}</small></span><span aria-hidden="true">›</span>
    </button>)}</div>
    {!matches.length&&!status&&<p className="sub">Sin clientes para mostrar.</p>}
   </aside>
   <div className="customer-stack">
    {!c?<section className="customer-card" style={{padding:'38px 20px',textAlign:'center'}}><span aria-hidden="true" style={{fontSize:28}}>👤</span><h3>Elegí un cliente del directorio</h3><p className="sub">Abrí su ficha para ver los datos de contacto y lo que registró en CeluLab.</p></section>:<>
     <button type="button" className="customer-back" onClick={()=>open('')} style={{justifySelf:'start'}}>← Volver al directorio</button>
     <section className="customer-card">
      <div className="customer-heading"><h3>{c.name}</h3>{!partner&&!edit&&<button className="customer-soft" onClick={()=>{setEdit(c);setMessage('')}}>Editar datos</button>}</div>
      {edit?<form onSubmit={e=>{e.preventDefault();void save()}}>{(['name','dni','phone'] as const).map((k,i)=><label key={k}>{['Nombre y apellido','DNI','Teléfono'][i]}<input required={k==='name'} value={edit[k]||''} onChange={e=>setEdit({...edit,[k]:e.target.value})}/></label>)}<div className="actions"><button className="customer-primary" disabled={saving}>{saving?'Guardando…':'Guardar cambios'}</button><button type="button" className="customer-soft" onClick={()=>setEdit(null)}>Cancelar</button></div></form>:<div className="customer-contact"><div><small>DNI</small><strong>{c.dni||'No registrado'}</strong></div><div><small>Teléfono</small><strong>{c.phone||'No registrado'}</strong></div><div><small>Reparaciones</small><strong>{c.repairs.length}</strong></div>{!partner&&<div><small>Compras online</small><strong>{c.purchases.length}</strong></div>}</div>}
      {message&&<p role="status">{message}</p>}
     </section>
     <div className="histories">
      <section className="customer-card"><h3 className="history-heading">🛠 Servicio técnico <span className="count">{c.repairs.length}</span></h3>{!c.repairs.length&&<p className="sub">Sin reparaciones registradas.</p>}{c.repairs.map(r=><article key={r.id}><strong>{r.order_number} · {r.device_brand} {r.device_model}</strong><div>{date(r.created_at)} · {r.status.replaceAll('_',' ')} · {money(r.total_ars)}{!partner&&r.origin&&' · '+r.origin}</div>{r.requested_work}{r.lines?.map((line,index)=><div key={index}>{line.option?.startsWith('Repuesto: ')?line.option.slice(10):line.job} · {line.pending?'A confirmar':money(line.part)}</div>)}</article>)}</section>
      {!partner&&<section className="customer-card"><h3 className="history-heading">🛍 Compras de accesorios <span className="count">{c.purchases.length}</span></h3>{!c.purchases.length&&<p className="sub">Sin compras online registradas.</p>}{c.purchases.map(p=><article key={p.id}><strong>{p.order_number} · {money(p.total_ars)}</strong><div>{date(p.created_at)} · {p.estado} · Método: {p.metodo_pago||'Sin registrar'}</div>{Array.isArray(p.items)&&p.items.map((i,n)=><div key={n}>{i.qty} × {i.name} · {money(i.price_ars)} por unidad</div>)}</article>)}</section>}
     </div>
     {!partner&&<>
      <section className="customer-card"><h3 className="history-heading">📄 Presupuestos <span className="count">{c.quotes?.length??0}</span></h3>{!c.quotes?.length?<p className="sub">Sin presupuestos guardados.</p>:c.quotes.map(q=><article key={q.id}><strong>Presupuesto {q.id.slice(0,8).toUpperCase()}</strong><div>{date(q.created_at)}</div></article>)}</section>
      <CustomerFamily key={c.key} customer={c} rows={rows} onOpen={open}/>
     </>}
    </>}
   </div>
  </div>
 </section>
}
