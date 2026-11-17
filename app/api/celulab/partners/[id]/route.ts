import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase'

import {hasNucleusSession} from '@/lib/celulab/nucleus-session'
import {sameOrigin} from '@/lib/celulab/partner-session'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const db = createAdminClient()
  const { data, error } = await db
    .from('cl_partners')
    .select(await hasNucleusSession(req)?'*':'id,name,address,phone,logo_url,slug,is_active')
    .eq('id', params.id)
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 404 })
  return NextResponse.json(data)
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  if(!sameOrigin(req)||!await hasNucleusSession(req))return NextResponse.json({}, {status:403})
  const body = await req.json()
  const db = createAdminClient()
  const { data, error } = await db
    .from('cl_partners')
    .update(body)
    .eq('id', params.id)
    .select()
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  if(!sameOrigin(req)||!await hasNucleusSession(req))return NextResponse.json({}, {status:403})
  const db = createAdminClient()
  const { error } = await db.from('cl_partners').delete().eq('id', params.id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}