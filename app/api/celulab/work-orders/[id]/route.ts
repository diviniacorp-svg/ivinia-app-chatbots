import {NextRequest,NextResponse} from 'next/server'
import {createAdminClient} from '@/lib/supabase'
import {hasNucleusSession} from '@/lib/celulab/nucleus-session'

export async function POST(req:NextRequest,{params}:{params:{id:string}}) {
  if(req.headers.get('origin')!==req.nextUrl.origin) return NextResponse.json({}, {status:403})
  const db=createAdminClient()
  const admin=await hasNucleusSession(req)
  const multipart=req.headers.get('content-type')?.startsWith('multipart/form-data')
  if(multipart && !admin) return NextResponse.json({}, {status:403})
  const form=multipart ? await req.formData():null
  const body=form ? {action:'evidence'} : await req.json().catch(()=>({}))
  if(!admin){
    if(!['read','share'].includes(body.action)||typeof body.pin!=='string'||!body.pin) return NextResponse.json({}, {status:403})
    const {data}=await db.from('cl_orders').select('partner_id').eq('id',params.id).maybeSingle()
    if(!data?.partner_id) return NextResponse.json({}, {status:403})
    const {data:partner}=await db.from('cl_partners').select('id').eq('id',data.partner_id).eq('pin',body.pin).eq('is_active',true).maybeSingle()
    if(!partner) return NextResponse.json({}, {status:403})
  }
  const fail=()=>NextResponse.json({error:'No se pudo guardar o leer la orden'},{status:503})
  if(body.action==='share'){
    const {data,error}=await db.rpc('cl_order_tracking_token',{p_order:params.id})
    return error?fail():NextResponse.json({path:'/market/celulab/seguimiento/'+data})
  }
  if(body.action==='read'){
    const {data,error}=await db.from('cl_order_extra_jobs').select('*').eq('order_id',params.id).order('created_at')
    return error?fail():NextResponse.json(data)
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
    if(typeof body.title!=='string'||!body.title.trim()||![body.labor,body.part].every(n=>Number.isSafeInteger(n)&&n>=0&&n<=2147483647)) return NextResponse.json({}, {status:400})
    const {error}=await db.from('cl_order_extra_jobs').upsert({id:body.id,order_id:params.id,title:body.title.trim().slice(0,200),labor:body.labor,part:body.part},{onConflict:'id',ignoreDuplicates:true})
    return error?fail():NextResponse.json({ok:true})
  }
  if(body.action==='decision' && ['aceptado','rechazado'].includes(body.status)){
    if(body.status==='rechazado'&&!String(body.reason||'').trim()) return NextResponse.json({}, {status:400})
    const {data,error}=await db.from('cl_order_extra_jobs').update({status:body.status,reason:body.status==='rechazado'?String(body.reason).slice(0,400):null,decided_at:new Date().toISOString()}).eq('id',body.id).eq('order_id',params.id).eq('status','presupuestado').select('id').maybeSingle()
    return error?fail():NextResponse.json({ok:!!data},{status:data?200:409})
  }
  return NextResponse.json({}, {status:400})
}