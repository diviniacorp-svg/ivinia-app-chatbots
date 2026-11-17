import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase'

import {hasNucleusSession} from '@/lib/celulab/nucleus-session'
import {sameOrigin} from '@/lib/celulab/partner-session'

export const dynamic = 'force-dynamic'

export async function GET(req:NextRequest) {
  const db = createAdminClient()
  const { data, error } = await db
    .from('cl_partners')
    .select(await hasNucleusSession(req)?'*':'id,name,address,phone,logo_url,slug,is_active')
    .eq('is_active', true)
    .order('name')
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
  if(!sameOrigin(req)||!await hasNucleusSession(req))return NextResponse.json({}, {status:403})
  const body = await req.json()
  const { name, address, phone, contact_name, commission_pct, notes } = body
  if (!name) return NextResponse.json({ error: 'name es obligatorio' }, { status: 400 })
  const db = createAdminClient()
  const { data, error } = await db
    .from('cl_partners')
    .insert({
      name,
      address: address ?? '',
      phone: phone ?? '',
      contact_name: contact_name ?? '',
      commission_pct: commission_pct ?? 33,
      notes: notes ?? '',
    })
    .select()
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}