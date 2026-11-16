import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// Use the immutable deployment that serves the historical price list.
export async function GET(req: NextRequest) {
  const url = new URL('https://divinia-o7hyhosov-joacos-projects-9c3dbc62.vercel.app/api/celulab/lista')
  for (const key of ['tab', 'brand', 'q', 'limit', 'offset']) {
    const value = req.nextUrl.searchParams.get(key)
    if (value) url.searchParams.set(key, value)
  }
  try {
    const res = await fetch(url, { cache: 'no-store', signal: AbortSignal.timeout(15000) })
    if (!res.ok) throw new Error('Lista no disponible')
    const data = await res.json()
    if (!Array.isArray(data.items)) throw new Error('Lista inválida')
    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ error: 'No se pudo cargar la lista de repuestos.' }, { status: 503 })
  }
}