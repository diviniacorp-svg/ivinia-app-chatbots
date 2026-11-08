import {NextRequest,NextResponse} from 'next/server'
import {createAdminClient} from '@/lib/supabase'
import {hasNucleusSession} from '@/lib/celulab/nucleus-session'

export async function GET(req:NextRequest) {
  if(!await hasNucleusSession(req)) return NextResponse.json({error:'Ingresá a Nucleus'},{status:401})
  const db=createAdminClient()
  const params=req.nextUrl.searchParams
  let query=db.from('cl_tienda_orders').select('*').order('created_at',{ascending:false})
  const state=params.get('estado')
  if(state) query=query.eq('estado',state)
  const {data,error}=await query
  return NextResponse.json(error?{error:'Error de lectura'}:data,{status:error?503:200})
}
export async function POST(req:NextRequest) {
  if(req.headers.get('origin')!==req.nextUrl.origin) return NextResponse.json({}, {status:403})
  const b=await req.json().catch(()=>null)
  const bad=(error:string)=>NextResponse.json({error},{status:400})
  if(!b || !/^[a-f0-9-]{36}$/i.test(b.request_id)||!['retiro','envio'].includes(b.fulfillment)||!['digital','efectivo'].includes(b.metodo_pago)||!String(b.client_name||'').trim()||!String(b.client_phone||'').trim()||(b.fulfillment==='envio'&&!String(b.destination||'').trim())) return bad('Completá el nombre, WhatsApp y los datos de entrega.')
  if(!Array.isArray(b.items)||!b.items.length||b.items.length>80) return bad('Revisá el carrito.')
  const db=createAdminClient()
  const cols='order_number,total_ars,tracking_token'
  const existing=()=>db.from('cl_tienda_orders').select(cols).eq('request_id',b.request_id).maybeSingle()
  const prev=await existing()
  if(prev.data)return NextResponse.json(prev.data)
  const ids=b.items.map((i:{id:string})=>i?.id)
  if(new Set(ids).size!==ids.length) return bad('Hay productos repetidos.')
  const [products,rates,setting]=await Promise.all([
    db.from('cl_products').select('id,name,category,price_ars').in('id',ids).eq('is_latest',true).eq('in_stock',true),
    db.from('cl_product_markups').select('category,markup_pct'),db.from('cl_delivery_settings').select('carrier').single()])
  if(products.error||rates.error||setting.error)return NextResponse.json({error:'No pudimos verificar la disponibilidad.'},{status:503})
  const items=[]
  for(const line of b.items){
    const product=products.data.find(p=>p.id===line.id)
    if(!product||!Number.isInteger(line.qty)||line.qty<1||line.qty>99)return bad('Revisá la disponibilidad y cantidad.')
    const pct=Number(rates.data.find(r=>r.category===product.category)?.markup_pct||0)
    const price=Math.round(product.price_ars*(1+pct/100))
    if(line.price_ars!==price)return bad('El precio cambió. Actualizá el carrito.')
    items.push({id:product.id,name:product.name,qty:line.qty,price_ars:price})
  }
  const {data,error}=await db.from('cl_tienda_orders').insert({request_id:b.request_id,items,total_ars:items.reduce((n,i)=>n+i.price_ars*i.qty,0),client_name:String(b.client_name).slice(0,150),client_phone:String(b.client_phone).slice(0,40),metodo_pago:b.metodo_pago,notas:String(b.notas||'').slice(0,500),fulfillment:b.fulfillment,destination:b.fulfillment==='envio'?String(b.destination).slice(0,400):null,carrier:b.fulfillment==='envio'?setting.data.carrier:null}).select(cols).single()
  if(error?.code==='23505'){const again=await existing();if(again.data)return NextResponse.json(again.data)}
  return error?NextResponse.json({error:'No pudimos guardar el pedido.'},{status:503}):NextResponse.json(data)
}