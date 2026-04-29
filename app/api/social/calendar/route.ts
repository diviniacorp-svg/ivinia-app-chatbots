import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

// GET /api/social/calendar?socialClientId=xxx&from=YYYY-MM-DD&to=YYYY-MM-DD
export async function GET(req: NextRequest) {
  const db = createAdminClient()
  const socialClientId = req.nextUrl.searchParams.get('socialClientId') ?? '857cef01-16a1-4034-8286-1b9e44dcfda3'
  const from = req.nextUrl.searchParams.get('from') ?? '2026-01-01'
  const to = req.nextUrl.searchParams.get('to') ?? '2027-12-31'

  const { data, error } = await db
    .from('content_calendar')
    .select('id,titulo,caption,fecha,plataforma,tipo,status,pilar,imagen_url,ig_media_id,social_client_id,publish_at,hashtags,prompt_imagen,remotion_composition')
    .eq('social_client_id', socialClientId)
    .neq('status', 'cancelado')
    .gte('fecha', from)
    .lte('fecha', to)
    .order('fecha', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ posts: data ?? [] })
}
