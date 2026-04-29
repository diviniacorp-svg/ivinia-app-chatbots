import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

async function sessionToken(secret: string): Promise<string> {
  const enc = new TextEncoder()
  const key = await crypto.subtle.importKey(
    'raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
  )
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode('divinia_session_v1'))
  return Array.from(new Uint8Array(sig)).map(b => b.toString(16).padStart(2, '0')).join('')
}

export async function POST(request: NextRequest) {
  const { password } = await request.json()
  const adminPassword = process.env.ADMIN_PASSWORD
  const signingSecret = process.env.ADMIN_SECRET
  if (!adminPassword || !signingSecret) {
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json({ error: 'Servidor mal configurado — faltan ADMIN_PASSWORD / ADMIN_SECRET' }, { status: 503 })
    }
    // dev fallback solo en local
  }
  const pwd = adminPassword || 'DiViNiA2050'
  const secret = signingSecret || 'DiViNiA2050'

  if (password !== pwd) {
    return NextResponse.json({ error: 'Contraseña incorrecta' }, { status: 401 })
  }
  const token = await sessionToken(secret)

  const response = NextResponse.json({ ok: true })
  response.cookies.set('divinia_session', await sessionToken(secret), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30,
    path: '/',
  })
  return response
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true })
  response.cookies.delete('divinia_session')
  return response
}
