import {NextRequest,NextResponse} from 'next/server'
import {createAdminClient} from '@/lib/supabase'
import {hasPartnerSession} from '@/lib/celulab/partner-session'
import {totalOnlyLines} from '@/lib/celulab/public-order'
import {hasNucleusSession} from '@/lib/celulab/nucleus-session'

export async function POST(req:NextRequest,{params}:{params:{id:string}}) {
  if(req.headers.get('origin')!==req.nextUrl.origin) return NextResponse.json({}, {status:403})
  const db=createAdminClient()
  const admin=await hasNucleusSession(req)
  const multipart=req.headers.get('content-type')?.startsWith('multipart/form-data')
  if(multipart && !admin) return NextResponse.json({}, {status:403})
  const form=multipart ? await req.formData():null
  const body=form ? {action:'evidence'} : await req.json().catch(()=>({}))
  const {data:order}=await db.from('cl_orders').select('partner_id,quote_draft_lines,updated_at,damage_diagram').eq('id',params.id).maybeSingle()
  if(!order)return NextResponse.json({}, {status:404})
  if(!admin&&!await hasPartnerSession(req,order.partner_id))return NextResponse.json({}, {status:403})
  const fail=()=>NextResponse.json({error:'No se pudo guardar o leer la orden'},{status:503})
  if(body.action==='share'){
    const {data,error}=await db.rpc('cl_order_tracking_token',{p_order:params.id})
    return error?fail():NextResponse.json({path:'/market/celulab/seguimiento/'+data})
  }
  if(body.action==='read'){
    const {data,error}=await db.from('cl_order_extra_jobs').select('*').eq('order_id',params.id).order('created_at')
    return error?fail():NextResponse.json({jobs:admin?data:(data||[]).map(({labor,part,...j})=>({...j,total:(Number(labor)||0)+(Number(part)||0)})),initial:admin?order.quote_draft_lines||[]:totalOnlyLines(order.quote_draft_lines),revision:order.updated_at})
  }
  if(body.action==='evidence' && form){
    const file=form.get('file')
    const allowed:Record<string,string>={'image/jpeg':'jpg','image/png':'png','image/webp':'webp','video/mp4':'mp4','video/webm':'webm'}
    if(!(file instanceof File)||!allowed[file.type]||!file.size||file.size>4000000) return NextResponse.json({error:'Elegí una imagen o video de hasta 4 MB.'},{status:400})
    const key=params.id+'/'+crypto.randomUUID()+'.'+allowed[file.type]
    const bucket=db.storage.from('celulab-evidence')
    const upload=await bucket.upload(key,file,{contentType:file.type})
    if(upload.error) return fail()
    const {error}=await db.from('cl_customer_evidence').insert({order_id:params.id,object_key:key,media_type:file.type,caption:String(form.get('caption')||'').slice(0,400)})
    if(error){await bucket.remove([key]);return fail()}
    return NextResponse.json({ok:true})
  }
  if(body.action==='add'){
    if(!admin){body.part=body.total;body.labor=0}
    if(typeof body.title!=='string'||!body.title.trim()||![body.labor,body.part].every(n=>Number.isSafeInteger(n)&&n>=0&&n<=2147483647)) return NextResponse.json({}, {status:400})
    const {error}=await db.from('cl_order_extra_jobs').upsert({id:body.id,order_id:params.id,title:body.title.trim().slice(0,200),labor:body.labor,part:body.part},{onConflict:'id',ignoreDuplicates:true})
    return error?fail():NextResponse.json({ok:true})
  }
  if(body.action==='cancel'){
    const reason=String(body.reason||'').trim().slice(0,400)
    if(!reason)return NextResponse.json({error:'Ingresá el motivo.'},{status:400})
    const {data,error}=await db.from('cl_order_extra_jobs').update({status:'rechazado',reason,decided_at:new Date().toISOString()}).eq('id',body.id).eq('order_id',params.id).in('status',['presupuestado','aceptado']).select('id').maybeSingle()
    return error?fail():NextResponse.json({ok:!!data},{status:data?200:409})
  }
  if(body.action==='remove-intake'){
    const lines=Array.isArray(order.quote_draft_lines)?order.quote_draft_lines:[], reason=String(body.reason||'').trim().slice(0,400)
    if(!reason||!Number.isInteger(body.index)||body.index<0||body.index>=lines.length||body.revision!==order.updated_at)return NextResponse.json({}, {status:409})
    const diagram=order.damage_diagram||{}, removed=Array.isArray(diagram.removedWork)?diagram.removedWork:[]
    let q=db.from('cl_orders').update({quote_draft_lines:lines.filter((_,i)=>i!==body.index),damage_diagram:{...diagram,removedWork:[...removed,{job:lines[body.index]?.job,reason,at:new Date().toISOString()}]},updated_at:new Date().toISOString()}).eq('id',params.id)
    q=order.updated_at?q.eq('updated_at',order.updated_at):q.is('updated_at',null)
    const {data,error}=await q.select('id').maybeSingle()
    return error?fail():NextResponse.json({ok:!!data},{status:data?200:409})
  }
  if(body.action==='decision' && ['aceptado','rechazado'].includes(body.status)){
    if(body.status==='rechazado'&&!String(body.reason||'').trim()) return NextResponse.json({}, {status:400})
    const {data,error}=await db.from('cl_order_extra_jobs').update({status:body.status,reason:body.status==='rechazado'?String(body.reason).slice(0,400):null,decided_at:new Date().toISOString()}).eq('id',body.id).eq('order_id',params.id).eq('status','presupuestado').select('id').maybeSingle()
    return error?fail():NextResponse.json({ok:!!data},{status:data?200:409})
  }
  return NextResponse.json({}, {status:400})
}