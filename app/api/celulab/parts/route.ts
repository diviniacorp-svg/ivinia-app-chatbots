import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase'

import {hasNucleusSession} from '@/lib/celulab/nucleus-session'

export const dynamic = 'force-dynamic'

// GET /api/celulab/parts — lista repuestos con el precio más barato actual por proveedor
export async function GET(req:NextRequest) {
  if(!await hasNucleusSession(req))return NextResponse.json({error:'Sólo taller.'},{status:403})
  const db = createAdminClient()
  const parts=[]
  for(let offset=0;;offset+=500){
    const {data,error}=await db.from('cl_parts').select(`*,cl_provider_prices(id,cost_ars,url_item,scraped_at,is_latest,supplier_in_stock,cl_providers(id,name,is_active))`)
      .eq('cl_provider_prices.is_latest',true).order('category').order('id').range(offset,offset+499)
    if(error)return NextResponse.json({error:'No se pudo leer el catálogo de repuestos'},{status:503})
    parts.push(...(data||[]))
    if(!data||data.length<500)break
  }
  return NextResponse.json(parts,{headers:{'Cache-Control':'no-store'}})
}

// POST /api/celulab/parts
export async function POST(req: NextRequest) {
  if(req.headers.get('origin')!==req.nextUrl.origin||!await hasNucleusSession(req))return NextResponse.json({}, {status:403})
  const body = await req.json()
  const { name, category, service_name, notes } = body

  if (!name || !category) {
    return NextResponse.json({ error: 'name y category son obligatorios' }, { status: 400 })
  }

  const db = createAdminClient()
  const { data, error } = await db
    .from('cl_parts')
    .insert({ name, category, service_name: service_name ?? '', notes: notes ?? '' })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
