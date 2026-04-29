import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

// GET /api/social/approve?clientId=xxx  → lista posts en revisión del cliente
export async function GET(req: NextRequest) {
  const clientId = req.nextUrl.searchParams.get('clientId')
  if (!clientId) return NextResponse.json({ error: 'clientId requerido' }, { status: 400 })

  const db = createAdminClient()
  const { data, error } = await db
    .from('social_posts')
    .select('id, caption, tipo, herramienta, visual_prompt, approval_status, approval_comment, scheduled_at, created_at, media_url')
    .eq('client_id', clientId)
    .in('approval_status', ['pending', 'needs_revision'])
    .order('created_at', { ascending: false })
    .limit(20)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ posts: data ?? [] })
}

// PATCH /api/social/approve  → el cliente aprueba o pide cambios
export async function PATCH(req: NextRequest) {
  try {
    const { post_id, accion, comentario } = await req.json()
    if (!post_id || !accion) return NextResponse.json({ error: 'post_id y accion requeridos' }, { status: 400 })
    if (!['approve', 'reject'].includes(accion)) return NextResponse.json({ error: 'accion debe ser approve o reject' }, { status: 400 })

    const db = createAdminClient()
    const nuevoEstado = accion === 'approve' ? 'approved' : 'needs_revision'

    const { error } = await db
      .from('social_posts')
      .update({
        approval_status: nuevoEstado,
        approval_comment: comentario ?? null,
        approval_at: new Date().toISOString(),
      })
      .eq('id', post_id)

    if (error) throw error
    return NextResponse.json({ ok: true, estado: nuevoEstado })
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Error' }, { status: 500 })
  }
}
