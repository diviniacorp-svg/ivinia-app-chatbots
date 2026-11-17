import {createHmac,timingSafeEqual} from 'node:crypto'
import type {NextRequest} from 'next/server'
import {createAdminClient} from '@/lib/supabase'
import {hasNucleusSession} from './nucleus-session'

export const validPartnerId=(value:unknown):value is string=>typeof value==='string'&&/^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i.test(value)
const key=()=>process.env.CELULAB_SESSION_SECRET||process.env.SUPABASE_SERVICE_ROLE_KEY
export const partnerCookie=(id:string)=>'cl_local_'+id.toLowerCase()
const signature=(id:string,pin:string,expires:string)=>createHmac('sha256',key()||'').update(JSON.stringify(['celulab-reception-v1',id,pin,expires])).digest('hex')
export function createPartnerToken(id:string,pin:string){
 if(!key())throw Error('No se pudo iniciar la sesión')
 const expires=String(Math.floor(Date.now()/1000)+8*3600)
 return expires+'.'+signature(id,pin,expires)
}
export async function hasPartnerSession(req:NextRequest,id:unknown){
 if(!key()||!validPartnerId(id))return false
 const token=req.cookies.get(partnerCookie(id))?.value||''
 if(!/^\d{10}\.[a-f0-9]{64}$/.test(token))return false
 const [expires,mac]=token.split('.')
 if(Number(expires)<=Math.floor(Date.now()/1000))return false
 const {data}=await createAdminClient().from('cl_partners').select('pin').eq('id',id).eq('is_active',true).maybeSingle()
 return !!data?.pin&&timingSafeEqual(Buffer.from(mac,'hex'),Buffer.from(signature(id,String(data.pin),expires),'hex'))
}
export async function orderActor(req:NextRequest,partner:unknown){
 const admin=await hasNucleusSession(req)
 return {admin,allowed:admin||await hasPartnerSession(req,partner)}
}
export const sameOrigin=(req:NextRequest)=>req.headers.get('origin')===req.nextUrl.origin
