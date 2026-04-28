import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase'
import { generateCaptions } from '@/agents/social/creator'
import type { SocialClient, Platform, ContentPillar, PostFormat } from '@/agents/social/types'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

export async function POST(req: NextRequest) {
  const { socialClientId, idea, pilar, formato, platforms } = await req.json()

  if (!socialClientId || !idea || !pilar || !platforms?.length) {
    return NextResponse.json({ error: 'Faltan campos: socialClientId, idea, pilar, platforms' }, { status: 400 })
  }

  const db = createAdminClient()
  const { data: clientData } = await db
    .from('social_clients')
    .select('*')
    .eq('id', socialClientId)
    .single()

  if (!clientData) return NextResponse.json({ error: 'Cliente no encontrado' }, { status: 404 })

  const client: SocialClient = {
    id: clientData.id,
    nombre: clientData.nombre,
    rubro: clientData.rubro,
    brandVoice: clientData.brand_voice,
    contentStrategy: clientData.content_strategy,
    isDivinia: clientData.is_divinia,
    isActive: clientData.is_active,
  }

  const pkg = await generateCaptions(
    client,
    idea,
    pilar as ContentPillar,
    (formato ?? 'post') as PostFormat,
    platforms as Platform[],
  )

  return NextResponse.json({ ok: true, package: pkg })
}
