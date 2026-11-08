'use client'
import {useState,useEffect} from 'react'
type Stock={id:string;name:string;variant:string;kind:string;qty:number;cost:number;price:number;catalog_id:string|null}
type Order={id:string;order_number:string;client_name:string;client_phone:string;total_ars:number;fulfillment:string;destination:string;carrier:string;shipment_stage:string;deposit_paid:number;delivery_cost:number;delivery_fee:number;items:{name:string;qty:number}[]}
export default function StoreOperations(){
 const [rows,setRows]=useState<Stock[]>([]),[orders,setOrders]=useState<Order[]>([]),[carrier,setCarrier]=useState(''),[message,setMessage]=useState(''),[edit,setEdit]=useState<Stock|null>(null),[busy,setBusy]=useState(false)
 async function load(){const r=await fetch('/api/celulab/fulfillment?admin=1',{cache:'no-store'});if(!r.ok)throw new Error();const d=await r.json();setOrders(d.orders);setRows(d.stock);setCarrier(d.carrier)}
 useEffect(()=>{load().catch(()=>setMessage('No se pudieron leer los pedidos.'))},[])
 async function save(body:Record<string,unknown>){
 setBusy(true)
 try{const r=await fetch('/api/celulab/fulfillment',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});if(!r.ok)throw new Error();await load();setMessage('Guardado.');return true}
 catch{setMessage('No se pudo confirmar. Actualizá los datos antes de reintentar.');return false}finally{setBusy(false)}}
 const field=(label:string,name:string,value:string|number='',numeric=false)=><label style={{display:'grid'}}>{label}<input name={name} type={numeric?'number':'text'} min={numeric?0:undefined} defaultValue={value}/></label>
 return <section style={{display:'grid',gap:12,marginBlock:14}}>
 <details><summary>Entregas y retiros</summary><form onSubmit={e=>{e.preventDefault();void save({action:'carrier',carrier})}}><label>Delivery habitual <input required value={carrier} onChange={e=>setCarrier(e.target.value)}/></label><button disabled={busy}>Guardar delivery</button></form>
 {orders.map(o=>{const stages=o.fulfillment==='envio'?['Recibido','Confirmado','Preparando','Esperando delivery','Repartidor en el local','En camino','Llegando','Entregado']:['Recibido','Confirmado','Preparando','Listo para retirar','Entregado'];const next=stages[stages.indexOf(o.shipment_stage)+1];return <details key={o.id+'-'+o.shipment_stage+'-'+o.deposit_paid}><summary>{o.order_number} · {o.client_name} · {o.shipment_stage}</summary>
 <p>{o.items.map(i=>i.qty+' × '+i.name).join(', ')} · $ {o.total_ars}</p><p>{o.fulfillment==='envio'?o.destination:'Retiro en Junín 584'} · {o.client_phone}</p>
 <form style={{display:'grid',gap:6}} onSubmit={e=>{e.preventDefault();const d=new FormData(e.currentTarget);void save({action:'stage',id:o.id,expected:o.shipment_stage,stage:d.get('stage'),carrier:d.get('carrier'),fee:Number(d.get('fee')),cost:Number(d.get('cost')),paid:Number(d.get('paid'))})}}>
 {o.fulfillment==='envio'&&<>{field('Quién entrega (Uber Envíos, bici u otro)','carrier',o.carrier||carrier)}{field('Envío cobrado $','fee',o.delivery_fee??0,true)}{field('Costo del reparto $','cost',o.delivery_cost??0,true)}</>}
 {field('Total ya cobrado, incluida la seña $','paid',o.deposit_paid,true)}
 <select name="stage" aria-label="Estado del pedido"><option>{o.shipment_stage}</option>{next&&<option>{next}</option>}</select><button disabled={busy}>Registrar cambio</button></form></details>})}</details>
 <details><summary>Stock CeluLab físico</summary>{rows.map(s=><p key={s.id}><button onClick={()=>setEdit(s)}>{s.name} {s.variant} · {s.qty} disponibles · Editar</button> · Ganancia unitaria $ {s.price-s.cost}</p>)}
 <form key={edit?.id||'new'} style={{display:'grid',gap:6}} onSubmit={async e=>{e.preventDefault();const form=e.currentTarget,d=new FormData(form);if(await save({action:'stock',id:edit?.id,originalQty:edit?.qty,name:d.get('name'),variant:d.get('variant'),kind:d.get('kind'),qty:Number(d.get('qty')),cost:Number(d.get('cost')),price:Number(d.get('price')),catalog_id:d.get('catalog_id')})){form.reset();setEdit(null)}}}>
 {field('Producto','name',edit?.name)}{field('Variante','variant',edit?.variant)}<label>Tipo <select name="kind" defaultValue={edit?.kind}><option>Accesorio</option><option>Repuesto</option></select></label>
 {field('Disponibles en Junín','qty',edit?.qty||0,true)}{field('Costo unitario $','cost',edit?.cost||0,true)}{field('Precio de venta $','price',edit?.price||0,true)}
 {field('ID de producto del catálogo (opcional)','catalog_id',edit?.catalog_id||'')}
 <button disabled={busy}>{edit?'Guardar cambios':'Agregar al stock'}</button>{edit&&<button type="button" onClick={()=>setEdit(null)}>Cancelar edición</button>}</form></details>
 {message&&<p role="status">{message}</p>}</section>
}