import { createHash, randomBytes } from 'node:crypto'
import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase'
import { canSyncCatalogue } from '@/lib/celulab/admin-auth'

export async function POST(req: NextRequest) {
  if (req.headers.get('origin') !== req.nextUrl.origin) return NextResponse.json({}, { status: 403 })
  const body = await req.json().catch(() => null)
  const username = String(body?.username ?? '').trim().toLowerCase()
  const pin = String(body?.pin ?? '')
  if (!/^[a-z0-9_-]{2,40}$/.test(username) || !/^\d{6,12}$/.test(pin)) {
    return NextResponse.json({ error: 'Ingresá un usuario válido y un PIN de 6 a 12 dígitos.' }, { status: 400 })
  }
  const db = createAdminClient()
  if (body.manage === true) {
    if (req.headers.has('authorization') || !canSyncCatalogue(req)) return NextResponse.json({ error: 'Ingresá con la sesión administradora de Divinia.' }, { status: 403 })
    const { error } = await db.rpc('cl_set_technician_pin', { p_user: username, p_pin: pin })
    return NextResponse.json(error ? { error: 'No se pudo guardar.' } : { ok: true }, { status: error ? 503 : 200 })
  }
  const token = randomBytes(32).toString('hex')
  const digest = createHash('sha256').update(token).digest('hex')
  const { data, error } = await db.rpc('cl_technician_login', { p_user: username, p_pin: pin, p_token: digest })
  if (error || !data) return NextResponse.json({ error: 'Acceso denegado. Revisá los datos o intentá más tarde.' }, { status: error ? 503 : 401 })
  const response = NextResponse.json({ ok: true })
  response.cookies.set('cl_tech', token, { httpOnly: true, secure: true, sameSite: 'strict', path: '/api/celulab/storefront', maxAge: 14400 })
  return response
}