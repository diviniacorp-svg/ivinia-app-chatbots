import {NextRequest,NextResponse} from 'next/server'
import {createHash} from 'node:crypto'
import {createAdminClient} from '@/lib/supabase'
import {hasNucleusSession} from '@/lib/celulab/nucleus-session'
export const dynamic='force-dynamic'
const reply=(body:unknown,status=200)=>NextResponse.json(body,{status,headers:{'Cache-Control':'no-store'}})
const digits=(s:string)=>String(s||'').replace(/\D/g,'')
const key=(s:string)=>createHash('sha256').update(s).digest('hex')
type Row={id:string;client_name:string;client_dni?:string;client_phone:string;created_at:string;[field:string]:unknown}
type Profile={history_key:string;name:string;dni:string;phone:string}
async function readRows(table:string,columns:string,sort:string){
  const db=createAdminClient()
  const rows:any[]=[]
  for(let offset=0;;offset+=500){
    const {data,error}=await db.from(table).select(columns).order(sort).range(offset,offset+499)
    if(error)throw Error()
    rows.push(...data)
    if(data.length<500)return rows
  }
}
export async function GET(req:NextRequest){
  if(!await hasNucleusSession(req))return reply({},401)
  try{
    const [repairs,purchases,profiles,quotes]=await Promise.all([
      readRows('cl_orders','id,order_number,client_name,client_phone,client_dni,device_brand,device_model,requested_work,status,created_at,total_ars','id'),
      readRows('cl_tienda_orders','id,order_number,client_name,client_phone,items,metodo_pago,total_ars,estado,created_at','id'),
      readRows('cl_customer_profiles','history_key,name,dni,phone','history_key'),
      readRows('cl_quote_versions','quote_id,revision,customer,customer_phone,issued_at','issued_at')
    ])
    const contact=(name:string,phone:string)=>digits(phone).length>=8&&name?.trim()?name.trim().toLowerCase()+'|'+digits(phone):''
    const aliases=new Map<string,Set<string>>()
    const alias=(value:string,id:string)=>{if(value){const ids=aliases.get(value)||new Set<string>();ids.add(id);aliases.set(value,ids)}}
    const doc=(dni:string)=>digits(dni).length>=7?'dni:'+digits(dni):''
    for(const p of profiles){alias(doc(p.dni),p.history_key);alias(contact(p.name,p.phone),p.history_key)}
    const unique=(value:string)=>{const ids=aliases.get(value);return ids?.size===1?Array.from(ids)[0]:undefined}
    for(const r of repairs){const d=doc(r.client_dni||'');if(d)alias(contact(r.client_name,r.client_phone),unique(d)||key(d))}
    const edits=new Map<string,Profile>(profiles.map(p=>[p.history_key,p]))
    const customers=new Map<string,{key:string;name:string;phone:string;dni:string;repairs:Row[];purchases:Row[];quotes:Row[]}>()
    const add=(r:Row,kind:'repairs'|'purchases'|'quotes')=>{
      const d=doc(r.client_dni||''),pair=contact(r.client_name||'',r.client_phone)
      const id=d?(unique(d)||key(d)):unique(pair)||key(pair&&!aliases.has(pair)?pair:kind+':'+r.id)
      let c=customers.get(id)
      if(!c){const p=edits.get(id);c={key:id,name:p?.name??r.client_name??'Sin nombre',dni:p?.dni??r.client_dni??'',phone:p?.phone??r.client_phone,repairs:[],purchases:[],quotes:[]};customers.set(id,c)}
      c[kind].push(r)
    }
    repairs.sort((a,b)=>String(b.created_at).localeCompare(String(a.created_at)))
    purchases.sort((a,b)=>String(b.created_at).localeCompare(String(a.created_at)))
    for(const r of repairs)add(r,'repairs')
    for(const r of purchases)add(r,'purchases')
    const seen=new Set<string>()
    for(const v of quotes.sort((a,b)=>b.revision-a.revision)){
      if(seen.has(v.quote_id))continue
      seen.add(v.quote_id)
      if(v.customer||v.customer_phone)add({id:v.quote_id,client_name:v.customer||'Sin nombre',client_phone:v.customer_phone,created_at:v.issued_at},'quotes')
    }
    return reply(Array.from(customers.values()).sort((a,b)=>a.name.localeCompare(b.name,'es')))
  }catch{return reply({error:'No se pudo cargar el historial.'},503)}
}
export async function PATCH(req:NextRequest){
  if(req.headers.get('origin')!==req.nextUrl.origin||!await hasNucleusSession(req))return reply({},403)
  const b=await req.json().catch(()=>null)
  if(!b||!/^\w{64}$/.test(b.key)||typeof b.name!=='string'||!b.name.trim()||b.name.length>150||typeof b.phone!=='string'||b.phone.length>40||typeof b.dni!=='string'||b.dni.length>30)return reply({},400)
  const {error}=await createAdminClient().from('cl_customer_profiles').upsert({history_key:b.key,name:b.name.trim(),phone:b.phone.trim(),dni:b.dni.trim()})
  return error?reply({error:'No se pudo guardar la ficha.'},503):reply({ok:true})
}