import {NextRequest,NextResponse} from 'next/server'
import {createAdminClient} from '@/lib/supabase'
import {hasNucleusSession} from '@/lib/celulab/nucleus-session'
const reply=(value:unknown,status=200)=>NextResponse.json(value,{status,headers:{'Cache-Control':'no-store'}})
export async function POST(req:NextRequest){
 if(req.headers.get('origin')!==req.nextUrl.origin)return reply({},403)
 const b=await req.json().catch(()=>null)
 if(!b)return reply({},400)
 const db=createAdminClient(),admin=await hasNucleusSession(req)
 let partner=b.partner||null,issuer='CeluLab · San Luis'
 if(b.order){
  const {data}=await db.from('cl_orders').select('partner_id').eq('id',b.order).maybeSingle()
  if(!data||(!admin&&data.partner_id!==partner))return reply({},403)
  if(!admin)partner=data.partner_id
 }
 if(partner){
  let q=db.from('cl_partners').select('name,address,phone').eq('id',partner).eq('is_active',true)
  if(!admin){if(typeof b.pin!=='string'||!b.pin)return reply({},403);q=q.eq('pin',b.pin)}
  const {data}=await q.maybeSingle()
  if(!data)return reply({},403)
  issuer=[data.name,data.address,data.phone].filter(Boolean).join(' · ')
 }else if(!admin)return reply({},403)
 let q=db.from('cl_quote_versions').select('*')
 q=b.order?q.eq('order_id',b.order):q.is('order_id',null)
 if(!admin||!b.order)q=partner?q.eq('partner_id',partner):q.is('partner_id',null)
 if(b.action==='history'){const {data,error}=await q.order('issued_at',{ascending:false}).limit(200);return error?reply({},503):reply(data)}
 const validText=(s:unknown)=>typeof s==='string'&&s.trim().length>0&&s.length<=200
 const amount=(n:unknown)=>typeof n==='number'&&Number.isSafeInteger(n)&&n>=0&&n<=2147483647
 if(b.action!=='issue'||!validText(b.customer)||!Array.isArray(b.lines)||!b.lines.length||b.lines.length>100||!b.lines.every((l:{device:string;job:string;part:number;labor:number})=>l&&validText(l.device)&&validText(l.job)&&amount(l.part)&&amount(l.labor)))return reply({},400)
 const id=b.id||crypto.randomUUID()
 if(b.id){const {data}=await q.eq('quote_id',id).order('revision',{ascending:false}).limit(1).maybeSingle();if(!data||data.revision!==b.base||data.partner_id!==partner)return reply({},409)}
 const {data,error}=await db.from('cl_quote_versions').insert({quote_id:id,revision:b.id?b.base+1:1,partner_id:partner,order_id:b.order||null,issuer,customer:b.customer.trim(),lines:b.lines.map((l:{device:string;job:string;part:number;labor:number})=>({device:l.device.trim(),job:l.job.trim(),part:l.part,labor:l.labor}))}).select().single()
 return error?reply({},error.code==='23505'?409:503):reply(data)
}