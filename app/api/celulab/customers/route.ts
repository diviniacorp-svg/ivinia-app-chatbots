import {NextRequest,NextResponse} from 'next/server'
import {createHash} from 'node:crypto'
import {createAdminClient} from '@/lib/supabase'
import {orderActor,sameOrigin,validPartnerId} from '@/lib/celulab/partner-session'
import {totalOnlyLines} from '@/lib/celulab/public-order'
import {hasNucleusSession} from '@/lib/celulab/nucleus-session'
export const dynamic='force-dynamic'
const reply=(body:unknown,status=200)=>NextResponse.json(body,{status,headers:{'Cache-Control':'no-store'}})
const digits=(s:string)=>String(s||'').replace(/\D/g,'')
const key=(s:string)=>createHash('sha256').update(s).digest('hex')
type Row={id:string;client_name:string;client_dni?:string;client_phone:string;created_at:string;[field:string]:unknown}
type Profile={history_key:string;name:string;dni:string;phone:string}
const contact=(name:string,phone:string)=>digits(phone).length>=8&&name?.trim()?name.trim().toLowerCase()+'|'+digits(phone).slice(-10):''
const doc=(dni:string)=>digits(dni).length>=7?'dni:'+digits(dni):''
const scopePrefix=(partner:string)=>'local:'+partner+':'
const cleanProfile=(b:any)=>!!b&&typeof b.name==='string'&&!!b.name.trim()&&b.name.length<=150&&typeof b.phone==='string'&&b.phone.length<=40&&typeof b.dni==='string'&&b.dni.length<=30
async function readRows(table:string,columns:string,sort:string,scope?:{column:string;value:string;prefix?:boolean}){
  const db=createAdminClient()
  const rows:any[]=[]
  for(let offset=0;;offset+=500){
    let q=db.from(table).select(columns).order(sort).range(offset,offset+499)
    if(scope)q=scope.prefix?q.like(scope.column,scope.value+'%'):q.eq(scope.column,scope.value)
    const {data,error}=await q
    if(error)throw Error()
    rows.push(...data)
    if(data.length<500)return rows
  }
}
export async function GET(req:NextRequest){
  const partner=req.nextUrl.searchParams.get('partner'), actor=await orderActor(req,partner)
  const scoped=!!partner
  if(partner&&!validPartnerId(partner))return reply({},400)
  if(!actor.allowed)return reply({},401)
  try{
    const [repairs,purchases,profiles,quotes]=await Promise.all([
      readRows('cl_orders','id,order_number,client_name,client_phone,client_dni,device_brand,device_model,requested_work,status,created_at,total_ars,budget_ars,quote_draft_lines,partner_id,cl_partners(name)','id',partner?{column:'partner_id',value:partner}:undefined),
      scoped?Promise.resolve([]):readRows('cl_tienda_orders','id,order_number,client_name,client_phone,items,metodo_pago,total_ars,estado,created_at','id'),
      readRows('cl_customer_profiles','history_key,name,dni,phone','history_key',partner?{column:'history_key',value:scopePrefix(partner),prefix:true}:undefined),
      scoped?Promise.resolve([]):readRows('cl_quote_versions','quote_id,revision,customer,customer_phone,issued_at','issued_at')
    ])
    const aliases=new Map<string,Set<string>>()
    const alias=(value:string,id:string)=>{if(value){const ids=aliases.get(value)||new Set<string>();ids.add(id);aliases.set(value,ids)}}
    const standalone:Profile[]=profiles.filter(p=>p.history_key.startsWith('local:'))
    const overrides:Profile[]=scoped?[]:profiles.filter(p=>!p.history_key.startsWith('local:'))
    for(const p of [...overrides,...standalone]){const id=p.history_key.startsWith('local:')?key(doc(p.dni)||contact(p.name,p.phone)||p.history_key):p.history_key;alias(doc(p.dni),id);alias(contact(p.name,p.phone),id)}
    const unique=(value:string)=>{const ids=aliases.get(value);return ids?.size===1?Array.from(ids)[0]:undefined}
    for(const r of repairs){const d=doc(r.client_dni||'');if(d)alias(contact(r.client_name,r.client_phone),unique(d)||key(d))}
    const edits=new Map<string,Profile>(overrides.map(p=>[p.history_key,p]))
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
    for(const r of repairs){
      const local=Array.isArray(r.cl_partners)?r.cl_partners[0]:r.cl_partners
      const {cl_partners,partner_id,quote_draft_lines,...row}=r
      const lines=totalOnlyLines(quote_draft_lines), priced=lines.length&&!lines.some(l=>l.pending)?lines.reduce((sum,l)=>sum+l.part,0):null
      add({...row,total_ars:r.total_ars||r.budget_ars||priced||null,origin:scoped?undefined:local?.name||(partner_id?'Local no disponible':'Directo · CeluLab'),lines},'repairs')
    }
    for(const p of [...standalone,...overrides]){const id=p.history_key.startsWith('local:')?(unique(doc(p.dni))||unique(contact(p.name,p.phone))||key(doc(p.dni)||contact(p.name,p.phone)||p.history_key)):p.history_key;if(!customers.has(id))customers.set(id,{key:id,name:p.name,dni:p.dni,phone:p.phone,repairs:[],purchases:[],quotes:[]})}
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
export async function POST(req:NextRequest){
 if(!sameOrigin(req))return reply({},403)
 const b=await req.json().catch(()=>null)
 if(!cleanProfile(b)||!doc(b.dni)&&!contact(b.name,b.phone))return reply({error:'Ingresá nombre y un DNI o teléfono válido.'},400)
 if(b.partner!=null&&!validPartnerId(b.partner))return reply({},400)
 const actor=await orderActor(req,b.partner)
 if(!actor.allowed)return reply({},403)
 const id=key(doc(b.dni)||contact(b.name,b.phone)),profileKey=b.partner?scopePrefix(b.partner)+id:id
 const {error}=await createAdminClient().from('cl_customer_profiles').upsert({history_key:profileKey,name:b.name.trim(),phone:b.phone.trim(),dni:b.dni.trim()})
 return error?reply({error:'No se pudo guardar la ficha.'},503):reply({ok:true})
}
