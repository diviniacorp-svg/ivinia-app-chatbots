import {NextRequest,NextResponse} from 'next/server'
import {createAdminClient} from '@/lib/supabase'
import {hasNucleusSession} from '@/lib/celulab/nucleus-session'
import {orderSourcing,parseOrderDraft} from '@/lib/celulab/order-sourcing'

export const dynamic='force-dynamic'
const reply=(value:unknown,status=200)=>NextResponse.json(value,{status,headers:{'Cache-Control':'no-store'}})
export async function GET(req:NextRequest,{params}:{params:{id:string}}){
 if(!await hasNucleusSession(req))return reply({},403)
 const db=createAdminClient()
 const {data,error}=await db.from('cl_orders').select('quote_draft_lines').eq('id',params.id).maybeSingle()
 if(error)return reply({},503)
 if(!data)return reply({},404)
 try{return reply(await orderSourcing(db,parseOrderDraft(data.quote_draft_lines)))}catch{return reply({},503)}
}
