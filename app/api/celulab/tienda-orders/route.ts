import {NextRequest,NextResponse} from 'next/server'
import {createAdminClient} from '@/lib/supabase'
import {hasNucleusSession} from '@/lib/celulab/nucleus-session'

export async function GET(req:NextRequest) {
  if(!await hasNucleusSession(req)) return NextResponse.json({error:'Ingresá a Nucleus'},{status:401})
  const db=createAdminClient()
  const params=req.nextUrl.searchParams
  let query=db.from('cl_tienda_orders').select('*').order('created_at',{ascending:false})
  const state=params.get('estado')
  if(state) query=query.eq('estado',state)
  const {data,error}=await query
  return NextResponse.json(error?{error:'Error de lectura'}:data,{status:error?503:200})
}