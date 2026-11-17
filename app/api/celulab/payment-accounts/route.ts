import {NextRequest,NextResponse} from 'next/server'
import {cleanAccounts,readPaymentAccounts,savePaymentAccounts} from '@/lib/celulab/payment-accounts'
import {orderActor,sameOrigin} from '@/lib/celulab/partner-session'
import {hasNucleusSession} from '@/lib/celulab/nucleus-session'
export const dynamic='force-dynamic'
const reply=(v:unknown,status=200)=>NextResponse.json(v,{status,headers:{'Cache-Control':'no-store'}})
export async function GET(req:NextRequest){
 const actor=await orderActor(req,req.nextUrl.searchParams.get('partner'))
 if(!actor.allowed)return reply({},401)
 try{return reply(await readPaymentAccounts())}catch{return reply({error:'No se pudieron cargar las cuentas.'},503)}
}
export async function PUT(req:NextRequest){
 if(!sameOrigin(req)||!await hasNucleusSession(req))return reply({},403)
 const items=cleanAccounts(await req.json().catch(()=>null))
 if(!items)return reply({error:'Revisá los alias y las imágenes QR.'},400)
 try{await savePaymentAccounts(items);return reply({ok:true})}catch{return reply({error:'No se pudieron guardar las cuentas.'},503)}
}
