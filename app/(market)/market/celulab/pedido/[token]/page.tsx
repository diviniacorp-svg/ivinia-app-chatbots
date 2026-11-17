import {notFound} from 'next/navigation'
import {createAdminClient} from '@/lib/supabase'
export const dynamic='force-dynamic'
export const metadata={robots:{index:false,follow:false}}
export default async function OrderTracking({params}:{params:{token:string}}){
 if(!/^[a-f0-9-]{36}$/i.test(params.token))notFound()
 const db=createAdminClient()
 const {data:o}=await db.from('cl_tienda_orders').select('id,order_number,created_at,total_ars,fulfillment,carrier,shipment_stage,delivery_fee,deposit_paid').eq('tracking_token',params.token).maybeSingle()
 if(!o)notFound()
 const {data}=await db.from('cl_shipment_events').select('id,stage,created_at').eq('order_id',o.id).order('id')
 const money=(n:number)=>'$ '+Number(n).toLocaleString('es-AR')
 return <main style={{maxWidth:620,margin:'auto',padding:20}}><img src="/celulab-logo.png" width={84} alt="CeluLab"/><h1>Pedido {o.order_number}</h1><h2>{o.shipment_stage}</h2><p>{o.fulfillment==='envio'?'Envío con '+o.carrier:'Retiro en Junín 584'}</p><p>Productos {money(o.total_ars)} · {o.fulfillment==='envio'?(o.delivery_fee===null?'Envío por confirmar':'Envío '+money(o.delivery_fee)):'Retiro sin cargo'}</p><p>Pagado {money(o.deposit_paid)}</p><ol>{[{id:0,stage:'Recibido',created_at:o.created_at},...(data||[])].map(e=><li key={e.id}>{e.stage} · {new Date(e.created_at).toLocaleString('es-AR',{timeZone:'America/Argentina/San_Luis'})}</li>)}</ol><a href={'/market/celulab/pedido/'+params.token}>Actualizar seguimiento</a></main>
}