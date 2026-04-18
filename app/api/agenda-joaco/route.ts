import { createAdminClient } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const db = createAdminClient()
    const { data } = await db
      .from('nucleus_memory')
      .select('*')
      .contains('tags', ['agenda'])
      .eq('activo', true)
      .order('importancia', { ascending: false })
      .limit(5)

    return NextResponse.json({ tareas: data ?? [] })
  } catch {
    return NextResponse.json({ tareas: [] })
  }
}

export async function POST(req: Request) {
  const body = await req.json()
  const db = createAdminClient()
  const { error } = await db.from('nucleus_memory').insert({
    tipo: 'contexto',
    agente: 'joaco',
    contenido: body.contenido,
    importancia: body.importancia ?? 7,
    tags: ['agenda', ...(body.tags ?? [])],
  })
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ ok: true })
}
