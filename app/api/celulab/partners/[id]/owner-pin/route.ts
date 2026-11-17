import {randomBytes} from 'node:crypto'
import {NextRequest,NextResponse} from 'next/server'
import {createAdminClient} from '@/lib/supabase'
import {hasNucleusSession,sessionHash} from '@/lib/celulab/nucleus-session'

export const dynamic='force-dynamic'
type Context={params:{id:string}}
const reply=(body:object,status=200)=>NextResponse.json(body,{status,headers:{'Cache-Control':'no-store'}})

export async function GET(req:NextRequest,{params}:Context) {
  if(!await hasNucleusSession(req)) return reply({},403)
  const {data,error}=await createAdminClient().from('cl_owner_access').select('owner_pin').eq('partner_id',params.id).single()
  return error?reply({error:'No se pudo leer el PIN'},503):reply({pin:data.owner_pin})
}
export async function PATCH(req:NextRequest,{params}:Context) {
  if(req.headers.get('origin')!==req.nextUrl.origin || !await hasNucleusSession(req)) return reply({},403)
  const pin=(await req.json().catch(()=>null))?.pin
  if(typeof pin!=='string'||!/^\d{4}$/.test(pin))return reply({error:'Ingresá cuatro dígitos'},400)
  const {error}=await createAdminClient().from('cl_owner_access').update({owner_pin:pin,failures:0,blocked_until:null}).eq('partner_id',params.id).select('partner_id').single()
  return error?reply({error:'No se pudo guardar. Elegí un PIN diferente al del local.'},400):reply({ok:true})
}
export async function POST(req:NextRequest,{params}:Context) {
  if(req.headers.get('origin')!==req.nextUrl.origin)return reply({},403)
  const pin=(await req.json().catch(()=>null))?.pin
  if(typeof pin!=='string'||!/^\d{4}$/.test(pin))return reply({},400)
  const db=createAdminClient()
  const {data,error}=await db.rpc('cl_verify_owner',{p_id:params.id,p_pin:pin})
  if(error||!data)return reply({},error?503:401)
  const token=randomBytes(32).toString('hex')
  const saved=await db.from('cl_owner_sessions').insert({partner_id:params.id,token_hash:sessionHash(token),expires_at:new Date(Date.now()+900000).toISOString()})
  if(saved.error)return reply({},503)
  const res=reply({ok:true})
  res.cookies.set('cl_owner_session',token,{httpOnly:true,secure:true,sameSite:'strict',path:'/api/celulab',maxAge:900})
  return res
}