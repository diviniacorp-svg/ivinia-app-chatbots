import { NextRequest, NextResponse } from 'next/server'
import { createHmac } from 'crypto'

export const dynamic = 'force-dynamic'

function sessionToken(secret: string): string {
  return createHmac('sha256', secret).update('divinia_session_v1').digest('hex')
}

export async function POST(request: NextRequest) {
  const { password } = await request.json()
  const validSecret = process.env.ADMIN_SECRET || 'divinia2024'

  if (password !== validSecret) {
    return NextResponse.json({ error: 'Contraseña incorrecta' }, { status: 401 })
  }

  const token = sessionToken(validSecret)
  const response = NextResponse.json({ ok: true })
  response.cookies.set('divinia_session', token, {
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
