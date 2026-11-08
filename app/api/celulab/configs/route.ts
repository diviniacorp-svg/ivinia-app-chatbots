import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase'
import { hasNucleusSession } from '@/lib/celulab/nucleus-session'

export const dynamic = 'force-dynamic'
export async function GET(req: NextRequest) {
  if(!await hasNucleusSession(req)) return NextResponse.json({},{status:401})
  const {data,error} = await createAdminClient().from('cl_repair_configs').select('id,tab_key,category,label,markup_ars,labor_ars,sort_order').order('sort_order')
  return error ? NextResponse.json({error:'No se pudieron cargar las tarifas.'},{status:503}) : NextResponse.json(data)
}
export async function PATCH(req: NextRequest) {
  if (req.headers.get('origin') !== req.nextUrl.origin || !await hasNucleusSession(req)) return NextResponse.json({}, {status:403})
  const body = await req.json().catch(() => null)
  if (!body || typeof body.id !== 'string' || ![body.markup_ars,body.labor_ars].every(v => Number.isSafeInteger(v) && v >= 0))
    return NextResponse.json({error:'Importe inválido'},{status:400})
  const {data,error} = await createAdminClient().from('cl_repair_configs').update({markup_ars:body.markup_ars,labor_ars:body.labor_ars}).eq('id',body.id).select('id').maybeSingle()
  return NextResponse.json({ok:!!data && !error},{status:error?503:data?200:404})
}