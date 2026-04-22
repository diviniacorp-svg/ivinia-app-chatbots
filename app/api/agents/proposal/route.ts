import { NextRequest, NextResponse } from 'next/server'
import { generarPropuesta } from '@/lib/anthropic'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { company_name, rubro, city, servicio, dolor, precio, qualification } = body

    if (!company_name || !rubro || !servicio) {
      return NextResponse.json({ error: 'Faltan datos para generar la propuesta' }, { status: 400 })
    }

    const result = await generarPropuesta({
      company_name, rubro, city: city || 'San Luis',
      servicio, dolor: dolor || 'Optimizar operaciones con IA',
      precio: precio || 43000, qualification,
    })

    return NextResponse.json({ ok: true, ...result })
  } catch (err) {
    console.error('[proposal]', err)
    return NextResponse.json({ error: 'Error del agente de propuestas' }, { status: 500 })
  }
}
