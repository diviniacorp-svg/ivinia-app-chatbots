'use client'
import {useEffect,useState} from 'react'

export type SupplierProduct={id:string;name:string;category:string;brand:string|null;price_ars:number;final_price:number;in_stock:boolean|null;image_url:string|null;is_offer:boolean}
export const storeMoney=(value:number)=>new Intl.NumberFormat('es-AR',{style:'currency',currency:'ARS',maximumFractionDigits:0}).format(value)
type Catalogue={items:SupplierProduct[];total:number;available:number;catalogueSize:number;categories:string[]}
const size=24
export default function StoreCatalogue({onStock,stockLinks,stockReady}:{onStock:(row:SupplierProduct)=>void;stockLinks:ReadonlyMap<string,number>;stockReady:boolean}){
 const [data,setData]=useState<Catalogue|null>(null)
 const [query,setQuery]=useState(''),[category,setCategory]=useState(''),[status,setStatus]=useState(''),[page,setPage]=useState(0),[version,refresh]=useState(0)
 const [busy,setBusy]=useState(true),[error,setError]=useState('')
 useEffect(()=>{
  const ctrl=new AbortController()
  setBusy(true)
  setError('')
  const timer=window.setTimeout(async()=>{
   try{
    const q=new URLSearchParams({view:'catalog',q:query,category,stock:status,offset:String(page*size),limit:String(size)})
    const r=await fetch('/api/celulab/products?'+q,{cache:'no-store',signal:ctrl.signal})
    if(!r.ok)throw Error()
    const result:Catalogue=await r.json()
    if(!ctrl.signal.aborted)setData(result)
   }catch{if(!ctrl.signal.aborted)setError('No se pudo leer el catálogo del proveedor.')}
   finally{if(!ctrl.signal.aborted)setBusy(false)}
  },query?220:0)
  return ()=>{clearTimeout(timer);ctrl.abort()}
 },[query,category,status,page,version])
 return <section className="store-card">
  <div className="store-heading"><div><h3>Catálogo de proveedores</h3><p className="store-muted">Accesorios importados. La disponibilidad del proveedor no es el stock que tenés en Junín.</p></div>
   <button className="store-button" type="button" onClick={()=>refresh(v=>v+1)} disabled={busy}>↻ Recargar vista</button>
  </div>
  {!stockReady&&<p className="store-muted">Podés consultar el catálogo aunque el stock físico no esté disponible. Para vincular un producto, revisá Mi stock físico.</p>}
  <div className="store-summary"><div><small>Accesorios importados</small><strong>{data?.catalogueSize??'—'}</strong></div><div><small>Disponibles en proveedor</small><strong>{data?.available??'—'}</strong></div><div><small>Sin disponibilidad confirmada</small><strong>{data?data.catalogueSize-data.available:'—'}</strong></div></div>
  <div className="store-filters">
   <label>Buscar producto<input type="search" placeholder="Ej. cable USB-C, Kolke…" value={query} onChange={e=>{setQuery(e.target.value);setPage(0)}} /></label>
   <label>Rubro<select value={category} onChange={e=>{setCategory(e.target.value);setPage(0)}}><option value="">Todos los rubros</option>{data?.categories.map(value=><option key={value}>{value}</option>)}</select></label>
   <label>Disponibilidad<select value={status} onChange={e=>{setStatus(e.target.value);setPage(0)}}><option value="">Todos</option><option value="available">Disponible en proveedor</option><option value="unavailable">Sin stock o sin confirmar</option></select></label>
  </div>
  {error?<p role="alert" className="store-notice">{error} <button type="button" className="store-button" onClick={()=>refresh(v=>v+1)}>Reintentar</button></p>:busy?<p role="status" className="store-muted">Cargando accesorios…</p>:!data?.items.length?<p className="store-notice">{query||category||status?'No hay accesorios que coincidan con estos filtros.':'Todavía no hay accesorios importados. La importación se hace en Gestión → Proveedores de accesorios.'}</p>:<>
   <p className="store-muted">{data.total} {data.total===1?'resultado':'resultados'}.</p>
   <ul className="store-list">{data.items.map(row=>{
    const qty=stockLinks.get(row.id)
    return <li className="store-product" key={row.id}>
     <div className="store-thumb">{/^https?:\/\//i.test(row.image_url||'')?<img src={row.image_url!} alt="" loading="lazy" referrerPolicy="no-referrer" />:<span aria-hidden="true">📦</span>}</div>
     <div className="store-product-name"><strong>{row.name}</strong><small>{[row.brand,row.category].filter(Boolean).join(' · ')}</small><div className="store-badges"><span className={row.in_stock?'ok':'muted'}>{row.in_stock?'Disponible en proveedor':row.in_stock===false?'Sin stock proveedor':'Sin confirmar'}</span>{qty!==undefined&&<span className="muted">Junín · {qty} un.</span>}{row.is_offer&&<span className="muted">Oferta</span>}</div></div>
     <div className="store-price"><small>Costo proveedor</small><strong>{storeMoney(row.price_ars)}</strong></div>
     <div className="store-price"><small>Precio público</small><strong style={{color:'#245cda'}}>{storeMoney(row.final_price)}</strong></div>
     <button className="store-button" type="button" disabled={!stockReady} onClick={()=>onStock(row)}>{qty!==undefined?'Editar mi stock':'Vincular al stock'}</button>
    </li>
   })}</ul>
   {data.total>size&&<div className="store-heading" style={{marginTop:14}}><button className="store-button" type="button" disabled={page===0} onClick={()=>setPage(p=>p-1)}>← Anterior</button><span>Página {page+1} de {Math.ceil(data.total/size)}</span><button className="store-button" type="button" disabled={(page+1)*size>=data.total} onClick={()=>setPage(p=>p+1)}>Siguiente →</button></div>}
  </>}
 </section>
}
