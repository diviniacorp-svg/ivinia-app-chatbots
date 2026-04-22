import { createAdminClient } from '@/lib/supabase'
import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const db = createAdminClient()
    const { data } = await db
      .from('nucleus_memory')
      .select('id, contenido, importancia, tags, created_at')
      .contains('tags', ['agenda'])
      .eq('activo', true)
      .order('importancia', { ascending: false })
      .limit(10)
    return NextResponse.json({ tareas: data ?? [] })
  } catch {
    return NextResponse.json({ tareas: [] })
  }
}

export async function POST(req: NextRequest) {
  try {
    const { contenido, importancia = 5, tags = ['agenda'] } = await req.json()
    if (!contenido) return NextResponse.json({ error: 'contenido requerido' }, { status: 400 })
    const db = createAdminClient()
    const { data, error } = await db
      .from('nucleus_memory')
      .insert({ tipo: 'tarea', agente: 'joaco', contenido, importancia, tags: Array.from(new Set([...tags, 'agenda'])), activo: true })
      .select()
      .single()
    if (error) throw error
    return NextResponse.json({ ok: true, tarea: data })
  } catch {
    return NextResponse.json({ error: 'Error guardando tarea' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { id } = await req.json()
    if (!id) return NextResponse.json({ error: 'id requerido' }, { status: 400 })
    const db = createAdminClient()
    await db.from('nucleus_memory').update({ activo: false }).eq('id', id)
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Error' }, { status: 500 })
  }
}
