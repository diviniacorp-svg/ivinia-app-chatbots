import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    console.log('[market/unirse] nueva solicitud:', body)
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('[market/unirse] error:', error)
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}
