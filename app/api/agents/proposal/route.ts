import { NextRequest, NextResponse } from 'next/server'
import { generarPropuesta } from '@/lib/anthropic'
import { createAdminClient } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  const t0 = Date.now()
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

    const db = createAdminClient()
    db.from('agent_runs').insert({
      agent: 'generador-propuestas', department: 'clientes',
      action: `Propuesta para ${company_name} — ${servicio}`,
      status: 'success', duration_ms: Date.now() - t0,
      metadata: { rubro, servicio },
    }).then(() => {}).catch(() => {})

    return NextResponse.json({ ok: true, ...result })
  } catch (err) {
    console.error('[proposal]', err)
    return NextResponse.json({ error: 'Error del agente de propuestas' }, { status: 500 })
  }
}
