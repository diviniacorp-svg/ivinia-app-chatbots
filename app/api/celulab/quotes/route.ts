import {NextRequest,NextResponse} from 'next/server'
import {createAdminClient} from '@/lib/supabase'
import {hasNucleusSession} from '@/lib/celulab/nucleus-session'
import {repairForCategory,publicOption} from '@/app/(market)/market/celulab/_components/quote-labels'
const publicVersion=(v:{lines?:Record<string,unknown>[]})=>({...v,lines:(v.lines||[]).map(l=>({...l,option:typeof l.option==='string'&&publicOption(l.option)?l.option:undefined,partId:undefined}))})
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
 if(b.action==='rates'){
  const [rates,cfg]=await Promise.all([db.from('cl_labor_rates').select('job,labor_ars').order('position'),db.from('cl_repair_configs').select('category,labor_ars')])
  if(rates.error)return reply({},503)
  return reply((rates.data||[]).map(r=>{
   const amounts=(cfg.data||[]).filter(c=>c.category&&repairForCategory(c.category)===r.job&&typeof c.labor_ars==='number').map(c=>Number(c.labor_ars))
   return {...r,labor_options:[...new Set(amounts.length?amounts:r.labor_ars==null?[]:[r.labor_ars])].sort((a,b)=>a-b)}
  }))
 }
 if(b.action==='rate'&&admin){if(typeof b.job!=='string'||(b.amount!==null&&(!Number.isSafeInteger(b.amount)||b.amount<0||b.amount>2147483647)))return reply({},400);const {error}=await db.from('cl_labor_rates').update({labor_ars:b.amount}).eq('job',b.job).select('job').single();return error?reply({},400):reply({ok:true})}
 if(b.action==='archive'&&admin){const offset=Number(b.offset||0);if(!Number.isSafeInteger(offset)||offset<0)return reply({},400);const {data,error}=await db.from('cl_quote_versions').select('*').order('issued_at',{ascending:false}).order('quote_id').order('revision').range(offset,offset+99);return error?reply({},503):reply(data)}
 let q=db.from('cl_quote_versions').select('*')
 q=b.order?q.eq('order_id',b.order):q.is('order_id',null)
 if(!admin||!b.order)q=partner?q.eq('partner_id',partner):q.is('partner_id',null)
 if(b.action==='history'){const {data,error}=await q.order('issued_at',{ascending:false}).limit(200);return error?reply({},503):reply((data||[]).map(publicVersion))}
 const validText=(s:unknown)=>typeof s==='string'&&s.trim().length>0&&s.length<=200
 const amount=(n:unknown)=>typeof n==='number'&&Number.isSafeInteger(n)&&n>=0&&n<=2147483647
 if(b.action!=='issue'||(typeof b.customer!=='string'||b.customer.length>150||typeof (b.phone??'')!=='string'||(b.phone??'').length>40)||!Array.isArray(b.lines)||!b.lines.length||b.lines.length>100||!b.lines.every((l:{device:string;job:string;part:number;labor:number;pending?:boolean;equipment?:string;task?:string;option?:string})=>l&&validText(l.device)&&validText(l.job)&&amount(l.part)&&amount(l.labor)&&[l.equipment,l.task,l.option].every(x=>x===undefined||(typeof x==='string'&&x.length<=500))))return reply({},400)
 const id=b.id||crypto.randomUUID()
 if(b.id){const {data}=await q.eq('quote_id',id).order('revision',{ascending:false}).limit(1).maybeSingle();if(!data||data.revision!==b.base||data.partner_id!==partner)return reply({},409)}
 const {data,error}=await db.from('cl_quote_versions').insert({quote_id:id,revision:b.id?b.base+1:1,partner_id:partner,order_id:b.order||null,issuer,customer:b.customer.trim(),customer_phone:(b.phone||'').trim(),lines:b.lines.map((l:{device:string;job:string;part:number;labor:number;pending?:boolean;equipment?:string;task?:string;option?:string})=>({device:l.device.trim(),job:l.job.trim(),part:l.part,labor:l.labor,pending:l.pending===true,equipment:l.equipment,task:l.task,option:publicOption(l.option)?l.option:undefined}))}).select().single()
 return error?reply({},error.code==='23505'?409:503):reply(publicVersion(data))
}
