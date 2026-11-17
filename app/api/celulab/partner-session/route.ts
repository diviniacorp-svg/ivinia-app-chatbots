import {NextRequest,NextResponse} from 'next/server'
import {createAdminClient} from '@/lib/supabase'
import {createPartnerToken,hasPartnerSession,partnerCookie,sameOrigin,validPartnerId} from '@/lib/celulab/partner-session'
export const dynamic='force-dynamic'
const reply=(v:unknown,status=200)=>NextResponse.json(v,{status,headers:{'Cache-Control':'no-store'}})
const attempts=new Map<string,{count:number;until:number}>()
export async function GET(req:NextRequest){
 return await hasPartnerSession(req,req.nextUrl.searchParams.get('partner'))?reply({ok:true}):reply({},401)
}
export async function POST(req:NextRequest){
 if(!sameOrigin(req))return reply({},403)
 const b=await req.json().catch(()=>null)
 if(!validPartnerId(b?.partner)||typeof b.pin!=='string'||!/^[0-9]{4,8}$/.test(b.pin))return reply({},400)
 const id=b.partner,ip=req.headers.get('x-vercel-forwarded-for')?.split(',')[0]||'unknown',fingerprint=id+'|'+ip
 const now=Date.now(),current=attempts.get(fingerprint)
 if(current&&current.until>now&&current.count>=12)return reply({},429)
 if(attempts.size>=5000)for(const [k,v] of Array.from(attempts.entries())){if(v.until<=now)attempts.delete(k)}
 if(attempts.size>=5000)return reply({},429)
 const active=current&&current.until>now?current:{count:0,until:now+10*60000}
 attempts.set(fingerprint,{...active,count:active.count+1})
 const {data}=await createAdminClient().from('cl_partners').select('id').eq('id',id).eq('pin',b.pin).eq('is_active',true).maybeSingle()
 if(!data)return reply({},401)
 attempts.delete(fingerprint)
 const res=reply({ok:true})
 res.cookies.set(partnerCookie(id),createPartnerToken(id,b.pin),{httpOnly:true,secure:req.nextUrl.protocol==='https:',sameSite:'strict',path:'/',maxAge:8*3600})
 return res
}
