import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const db = createAdminClient()
  const { data, error } = await db
    .from('content_calendar')
    .select('id,titulo,caption,fecha,plataforma,tipo,status,pilar,imagen_url,ig_media_id,publish_at,hashtags,prompt_imagen')
    .eq('id', params.id)
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 404 })
  return NextResponse.json({ post: data })
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const db = createAdminClient()
  const body = await req.json()
  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() }
  if (typeof body.caption === 'string') updates.caption = body.caption
  if (typeof body.hashtags === 'string') updates.hashtags = body.hashtags
  if (typeof body.status === 'string') updates.status = body.status
  if (typeof body.publish_at === 'string') updates.publish_at = body.publish_at

  const { error } = await db
    .from('content_calendar')
    .update(updates)
    .eq('id', params.id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
