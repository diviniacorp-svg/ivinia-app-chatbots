'use client'
import {useCallback,useEffect,useState} from 'react'
import StoreCatalogue,{storeMoney,type SupplierProduct} from './StoreCatalogue'

type Stock={id:string;name:string;variant:string;kind:string;qty:number;cost:number;price:number;catalog_id:string|null}
type Order={id:string;order_number:string;client_name:string;client_phone:string;total_ars:number;fulfillment:string;destination:string;carrier:string;shipment_stage:string;deposit_paid:number;delivery_cost:number;delivery_fee:number;items:{name:string;qty:number}[]}
const deliveryStages=['Recibido','Confirmado','Preparando','Esperando delivery','Repartidor en el local','En camino','Llegando','Entregado']
const pickupStages=['Recibido','Confirmado','Preparando','Listo para retirar','Entregado']

function Field({label,name,value='',numeric=false,required=false}:{label:string;name:string;value?:string|number;numeric?:boolean;required?:boolean}){
 return <label>{label}<input name={name} required={required} type={numeric?'number':'text'} min={numeric?0:undefined} step={numeric?1:undefined} defaultValue={value}/></label>
}
export default function StoreOperations(){
 const [view,setView]=useState<'catalogue'|'physical'|'delivery'>('catalogue')
 const [rows,setRows]=useState<Stock[]>([]),[orders,setOrders]=useState<Order[]>([]),[carrier,setCarrier]=useState('')
 const [message,setMessage]=useState(''),[loadError,setLoadError]=useState(''),[loaded,setLoaded]=useState(false),[busy,setBusy]=useState(false)
 const [edit,setEdit]=useState<Partial<Stock>|null>(null),[stockQuery,setStockQuery]=useState(''),[stockMode,setStockMode]=useState<'all'|'positive'|'zero'>('all')
 const load=useCallback(async(signal?:AbortSignal)=>{
  try{
   const r=await fetch('/api/celulab/fulfillment?admin=1',{cache:'no-store',signal})
   if(!r.ok)throw Error()
   const d=await r.json()
   if(!signal?.aborted){setOrders(d.orders);setRows(d.stock);setCarrier(d.carrier);setLoadError('');setLoaded(true);return true}
  }catch{if(!signal?.aborted){setLoaded(false);setLoadError('No se pudo leer el stock físico y las entregas. El catálogo de proveedores se consulta aparte.')}}
  return false
 },[])
 useEffect(()=>{const ctrl=new AbortController();void load(ctrl.signal);return()=>ctrl.abort()},[load])
 async function save(body:Record<string,unknown>){
  if(busy||!loaded)return false
  setBusy(true);setMessage('')
  try{
   const r=await fetch('/api/celulab/fulfillment',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)})
   if(!r.ok){setMessage(r.status===409?'No se guardó. Puede haber cambiado el stock o existir un vínculo con ese artículo. Recargá antes de intentar de nuevo.':'No se pudo guardar el cambio. Revisá los datos.');return false}
   setMessage(await load()?'Cambios guardados.':'El cambio se guardó, pero no se pudo actualizar la vista.')
   return true
  }catch{setMessage('No se pudo confirmar el cambio. Recargá antes de reintentar.');return false}
  finally{setBusy(false)}
 }
 const links=new Map(rows.flatMap(row=>row.catalog_id?[[row.catalog_id,row.qty] as const]:[]))
 const stock=rows.filter(r=>(r.name+' '+r.variant+' '+r.kind).toLowerCase().includes(stockQuery.trim().toLowerCase())&&(stockMode==='all'||(stockMode==='positive'?r.qty>0:r.qty===0)))
 function selectSupplier(row:SupplierProduct){
  const existing=rows.find(s=>s.catalog_id===row.id)
  setEdit(existing??{name:row.name,kind:'Accesorio',cost:row.price_ars,price:row.final_price,catalog_id:row.id,qty:0})
  setView('physical')
 }
 return <section className="cl-store-ops">
  <div className="store-heading"><div><h2>Catálogo de mi tienda</h2><p className="store-muted">Buscá accesorios, controlá lo que tenés en Junín y prepará pedidos.</p></div><a className="store-button" href="/market/celulab/tienda" target="_blank" rel="noreferrer">↗ Ver tienda pública</a></div>
  <nav className="store-tabs" aria-label="Vistas del catálogo">{([['catalogue','🛒 Catálogo proveedor'],['physical','📦 Mi stock físico'],['delivery','🚚 Entregas y retiros']] as const).map(([id,label])=><button className="store-button" type="button" key={id} aria-pressed={view===id} onClick={()=>{setView(id);setMessage('')}}>{label}</button>)}</nav>
  {message&&<p role="status" className="store-notice">{message}</p>}
  {view!=='catalogue'&&loadError&&<p role="alert" className="store-notice">{loadError} <button className="store-button" type="button" onClick={()=>void load()}>Reintentar</button></p>}
  {view==='catalogue'&&<StoreCatalogue onStock={selectSupplier} stockLinks={links} stockReady={loaded}/>}
  {view==='physical'&&<section className="store-card">
   <div className="store-heading"><div><h3>Stock físico en Junín</h3><p className="store-muted">Cargá unidades reales. Editar una ficha de stock no modifica el precio del catálogo público.</p></div><button className="store-primary" type="button" disabled={!loaded} onClick={()=>{setEdit({kind:'Accesorio'});setMessage('')}}>+ Cargar producto</button></div>
   {edit&&<form key={edit.id||edit.catalog_id||'new'} className="store-form" onSubmit={async e=>{e.preventDefault();const d=new FormData(e.currentTarget);if(await save({action:'stock',id:edit.id,originalQty:edit.qty,name:d.get('name'),variant:d.get('variant'),kind:d.get('kind'),qty:Number(d.get('qty')),cost:Number(d.get('cost')),price:Number(d.get('price')),catalog_id:d.get('catalog_id')}))setEdit(null)}}>
    <div className="store-form-title"><strong>{edit.id?'Editar stock':'Cargar stock físico'}</strong>{edit.catalog_id&&<small>Vinculado a una ficha del proveedor.</small>}</div>
    <Field label="Producto" name="name" value={edit.name} required/><Field label="Variante" name="variant" value={edit.variant}/>
    <label>Tipo<select name="kind" defaultValue={edit.kind||'Accesorio'}><option>Accesorio</option><option>Repuesto</option></select></label>
    <Field label="Unidades en Junín" name="qty" value={edit.qty??0} numeric required/><Field label="Costo unitario $" name="cost" value={edit.cost??0} numeric required/><Field label="Precio de registro $" name="price" value={edit.price??0} numeric required/>
    <details className="store-form-title"><summary>Vínculo con catálogo</summary><Field label="ID de catálogo (opcional)" name="catalog_id" value={edit.catalog_id??''}/></details>
    <div className="store-form-title store-tabs"><button className="store-primary" disabled={busy||!loaded}>{busy?'Guardando…':'Guardar stock'}</button><button type="button" className="store-button" onClick={()=>setEdit(null)}>Cancelar</button></div>
   </form>}
   <div className="store-filters"><label>Buscar en mi stock<input type="search" placeholder="Producto, variante o tipo" value={stockQuery} onChange={e=>setStockQuery(e.target.value)}/></label><label>Unidades<select value={stockMode} onChange={e=>setStockMode(e.target.value as typeof stockMode)}><option value="all">Todas</option><option value="positive">Con stock</option><option value="zero">Agotadas</option></select></label></div>
   {loaded&&!stock.length&&<p className="store-notice">{rows.length?'No hay productos que coincidan.':'Todavía no cargaste stock físico.'}</p>}
   <ul className="store-list">{stock.map(s=><li key={s.id} className="store-product"><div className="store-thumb" aria-hidden="true">📦</div><div className="store-product-name"><strong>{s.name}</strong><small>{[s.variant,s.kind,s.catalog_id?'Vinculado al catálogo':'Sin vínculo público'].filter(Boolean).join(' · ')}</small><div className="store-badges"><span className={s.qty?'ok':'muted'}>{s.qty} un. en Junín</span></div></div>
    <div className="store-price"><small>Costo unitario</small><strong>{storeMoney(s.cost)}</strong></div><div className="store-price"><small>Margen unitario estimado</small><strong>{storeMoney(s.price-s.cost)}</strong></div>
    <button className="store-button" type="button" onClick={()=>{setEdit(s);setMessage('')}}>Editar stock</button>
   </li>)}</ul>
  </section>}
  {view==='delivery'&&<section className="store-card"><h3>Entregas y retiros</h3><p className="store-muted">Preparación, entrega y cobros de pedidos de la tienda.</p>
   <form className="store-form" onSubmit={e=>{e.preventDefault();void save({action:'carrier',carrier})}}><label>Delivery habitual<input required value={carrier} onChange={e=>setCarrier(e.target.value)}/></label><button className="store-primary" disabled={busy||!loaded}>Guardar delivery</button></form>
   {loaded&&!orders.length&&<p className="store-notice">Todavía no hay pedidos registrados.</p>}
   {orders.map(o=>{const stages=o.fulfillment==='envio'?deliveryStages:pickupStages;const index=stages.indexOf(o.shipment_stage);const next=index>=0?stages[index+1]:undefined;return <details className="store-order" key={o.id+'-'+o.shipment_stage+'-'+o.deposit_paid}>
    <summary><strong>{o.order_number}</strong> · {o.client_name} · {o.shipment_stage}</summary>
    <p>{Array.isArray(o.items)?o.items.map(i=>i.qty+' × '+i.name).join(', '):''} · {storeMoney(o.total_ars)}</p><p>{o.fulfillment==='envio'?o.destination:'Retiro en Junín 584'} · {o.client_phone}</p>
    <form className="store-form" onSubmit={e=>{e.preventDefault();const d=new FormData(e.currentTarget);void save({action:'stage',id:o.id,expected:o.shipment_stage,stage:d.get('stage'),carrier:d.get('carrier'),fee:Number(d.get('fee')),cost:Number(d.get('cost')),paid:Number(d.get('paid'))})}}>
     {o.fulfillment==='envio'&&<><Field label="Quién entrega" name="carrier" value={o.carrier||carrier}/><Field label="Envío cobrado $" name="fee" value={o.delivery_fee??0} numeric/><Field label="Costo del reparto $" name="cost" value={o.delivery_cost??0} numeric/></>}
     <Field label="Total ya cobrado, incluida la seña $" name="paid" value={o.deposit_paid??0} numeric/>
     <label>Estado<select name="stage"><option>{o.shipment_stage}</option>{next&&<option>{next}</option>}</select></label><button className="store-primary" disabled={busy}>Registrar cambio</button>
    </form>
   </details>})}
  </section>}
  <style>{`
    .cl-store-ops{display:grid;gap:14px;color:#17243b;padding-block:6px;font-size:14px}
    .cl-store-ops h2,.cl-store-ops h3{margin:0;color:#111827}.cl-store-ops h3{font-size:16px}
    .store-heading{display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap}
    .store-muted{color:#64748b;font-size:13px;margin:5px 0}
    .store-tabs{display:flex;gap:8px;flex-wrap:wrap}
    .store-card{background:#fff;border:1px solid #dfe5ee;border-radius:16px;padding:clamp(12px,2vw,20px);min-width:0}
    .store-button,.store-primary{min-height:38px;border:1px solid #dbe3ef;border-radius:10px;background:#fff;padding:8px 12px;color:#245cda;font:650 13px/1.4 system-ui;cursor:pointer;text-decoration:none;box-sizing:border-box;display:inline-flex;align-items:center;justify-content:center}
    .store-primary,.store-tabs [aria-pressed=true]{background:#2563eb;color:#fff;border-color:#2563eb}
    .store-button:disabled,.store-primary:disabled{opacity:.55;cursor:default}
    .store-tabs .store-button{border-radius:25px}
    .store-summary{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,155px),1fr));gap:8px;margin:13px 0}
    .store-summary>div{background:#f5f8ff;border:1px solid #e6edfc;border-radius:11px;padding:10px}
    .store-summary strong{font-size:20px;display:block;color:#245cda}
    .cl-store-ops small{font-size:12px;color:#64748b;display:block}
    .store-filters,.store-form{display:grid;grid-template-columns:2fr 1fr 1fr;gap:10px;margin:14px 0;align-items:end}
    .store-form{grid-template-columns:repeat(auto-fit,minmax(min(100%,185px),1fr));border-radius:12px;padding:12px;background:#f8fafc;border:1px solid #e2e8f0}
    .store-form-title{grid-column:1/-1}
    .cl-store-ops label{font-size:12px;font-weight:650;min-width:0}
    .cl-store-ops input,.cl-store-ops select{display:block;width:100%;box-sizing:border-box;margin-top:4px;font:inherit;border:1px solid #cbd5e1;border-radius:9px;padding:9px 10px;color:#1e293b;background:#fff;min-height:39px}
    .store-list{padding:0;margin:0;list-style:none;display:grid;gap:7px}
    .store-product{display:grid;grid-template-columns:42px minmax(0,1fr) minmax(76px,auto) minmax(76px,auto) auto;align-items:center;gap:10px;border:1px solid #e2e8f0;border-radius:11px;padding:9px}
    .store-product-name{min-width:0;overflow-wrap:anywhere}
    .store-thumb{border-radius:9px;background:#eff6ff;width:42px;height:42px;display:grid;place-items:center;overflow:hidden}
    .store-thumb img{width:100%;height:100%;object-fit:contain;background:#fff}
    .store-badges{display:flex;gap:4px;flex-wrap:wrap;margin-top:4px}.store-badges span{padding:2px 7px;border-radius:14px;font-size:11px}.store-badges .ok{background:#dcfce7;color:#166534}.store-badges .muted{background:#f1f5f9;color:#475569}
    .store-notice{padding:11px 13px;border-radius:10px;background:#f1f5f9;margin:8px 0;font-size:13px}
    .store-order{padding:10px;border:1px solid #e2e8f0;border-radius:9px;margin-top:7px}.store-order summary{cursor:pointer}
    @media(max-width:700px){.store-filters{grid-template-columns:repeat(2,minmax(0,1fr))}.store-filters label:first-child{grid-column:1/-1}.store-product{grid-template-columns:42px minmax(0,1fr) minmax(0,1fr);gap:6px}.store-product-name{grid-column:2/4}.store-price{grid-column:auto}.store-product .store-button{grid-column:1/-1}.cl-store-ops input,.cl-store-ops select{font-size:16px}}
  `}</style>
 </section>
}
