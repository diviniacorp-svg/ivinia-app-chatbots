import { NextRequest, NextResponse } from 'next/server'
import { generarConfigLanding } from '@/lib/anthropic'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { company_name, rubro, city, servicios_raw, tono, color_preferido } = body

    if (!company_name || !rubro || !city) {
      return NextResponse.json({ error: 'Faltan datos del negocio' }, { status: 400 })
    }

    const config = await generarConfigLanding({ company_name, rubro, city, servicios_raw, tono, color_preferido })
    return NextResponse.json({ ok: true, config })
  } catch (err) {
    console.error('[landing-agent]', err)
    return NextResponse.json({ error: 'Error generando la landing' }, { status: 500 })
  }
}
