import {NextRequest,NextResponse} from 'next/server'
import {createAdminClient} from '@/lib/supabase'
import {hasNucleusSession} from '@/lib/celulab/nucleus-session'
export async function GET(req:NextRequest){
 const db=createAdminClient()
 if(req.nextUrl.searchParams.get('admin')!=='1'){
 const {data}=await db.from('cl_delivery_settings').select('carrier').single()
 return NextResponse.json({carrier:data?.carrier||'Uber Envíos'})}
 if(!await hasNucleusSession(req))return NextResponse.json({},{status:403})
 const [orders,stock,settings]=await Promise.all([db.from('cl_tienda_orders').select('id,order_number,client_name,client_phone,total_ars,fulfillment,destination,carrier,shipment_stage,delivery_fee,delivery_cost,deposit_paid,items').order('created_at',{ascending:false}).limit(100),db.from('cl_physical_stock').select('*').order('name'),db.from('cl_delivery_settings').select('carrier').single()])
 if(orders.error||stock.error||settings.error)return NextResponse.json({},{status:503})
 return NextResponse.json({orders:orders.data,stock:stock.data,carrier:settings.data.carrier})
}
export async function POST(req:NextRequest){
 if(req.headers.get('origin')!==req.nextUrl.origin||!await hasNucleusSession(req))return NextResponse.json({},{status:403})
 const b=await req.json(),db=createAdminClient()
 const nat=(n:unknown)=>typeof n==='number'&&Number.isSafeInteger(n)&&n>=0
 const result=(error:unknown)=>NextResponse.json({ok:!error},{status:error?409:200})
 if(b.action==='carrier'&&typeof b.carrier==='string'&&b.carrier.trim())return result((await db.from('cl_delivery_settings').update({carrier:b.carrier.trim().slice(0,80)}).eq('id',true)).error)
 if(b.action==='stock'&&b.name?.trim()&&['Accesorio','Repuesto'].includes(b.kind)&&[b.qty,b.cost,b.price].every(nat)){
 const fields={name:b.name.trim(),kind:b.kind,variant:b.variant||'',qty:b.qty,cost:b.cost,price:b.price,catalog_id:b.catalog_id||null}
 if(b.id){const {data,error}=await db.from('cl_physical_stock').update(fields).eq('id',b.id).eq('qty',b.originalQty).select('id').maybeSingle();return result(error||!data)}
 return result((await db.from('cl_physical_stock').insert(fields)).error)}
 if(b.action==='stage'&&[b.paid,b.fee,b.cost].every(nat)){
 const {data,error}=await db.rpc('cl_advance_shipment',{p_order:b.id,p_expected:b.expected,p_stage:b.stage,p_carrier:b.carrier||null,p_fee:b.fee,p_cost:b.cost,p_paid:b.paid})
 return result(error||!data)}
 return NextResponse.json({},{status:400})
}