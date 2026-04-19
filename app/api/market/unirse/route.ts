import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    await request.json() // parsear body para validar JSON; no se usa hasta integrar CRM
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('[market/unirse] error:', error)
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}
