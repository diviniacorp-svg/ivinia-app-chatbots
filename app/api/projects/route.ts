import { createAdminClient } from '@/lib/supabase'
import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const db = createAdminClient()
  const tipo = req.nextUrl.searchParams.get('tipo') // 'cliente' | 'producto-divinia' | null (all)

  let query = db
    .from('projects')
    .select(`*, clients(id, company_name, rubro, status, chatbot_id)`)
    .order('updated_at', { ascending: false })

  if (tipo) query = query.eq('tipo', tipo)

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data ?? [])
}

export async function POST(req: NextRequest) {
  const db = createAdminClient()
  const body = await req.json()

  const { data, error } = await db
    .from('projects')
    .insert({
      client_id: body.client_id ?? null,
      nombre: body.nombre,
      tagline: body.tagline ?? '',
      descripcion: body.descripcion ?? '',
      tipo: body.tipo ?? 'cliente',
      categoria: body.categoria ?? null,
      status: body.status ?? 'en-desarrollo',
      icon: body.icon ?? '📁',
      color: body.color ?? '#C6FF3D',
      progreso: body.progreso ?? 0,
      estrategia: body.estrategia ?? {},
      scope: body.scope ?? {},
      proximos: body.proximos ?? [],
      kpis: body.kpis ?? [],
      fecha_inicio: body.fecha_inicio ?? null,
      fecha_entrega: body.fecha_entrega ?? null,
      presupuesto_ars: body.presupuesto_ars ?? null,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
