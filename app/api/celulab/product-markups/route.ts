import {NextRequest,NextResponse} from 'next/server'
import {createAdminClient} from '@/lib/supabase'
import {hasNucleusSession} from '@/lib/celulab/nucleus-session'

export async function GET(req:NextRequest) {
  if(!await hasNucleusSession(req)) return NextResponse.json({error:'Ingresá a Nucleus'},{status:401})
  const db=createAdminClient()
  const params=req.nextUrl.searchParams
  const {data,error}=await db.from('cl_product_markups').select('category,markup_pct').order('category')
  return NextResponse.json(error?{error:'Error de lectura'}:data,{status:error?503:200})
}