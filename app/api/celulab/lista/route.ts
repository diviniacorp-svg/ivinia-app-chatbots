import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// Read the historical public list while validating the replacement in preview.
export async function GET(req: NextRequest) {
  if (process.env.VERCEL_ENV !== 'preview') {
    return NextResponse.json({ error: 'Lista en configuración' }, { status: 503 })
  }
  const url = new URL('https://divinia.vercel.app/api/celulab/lista')
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