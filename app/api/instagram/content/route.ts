import { NextRequest, NextResponse } from 'next/server'
import { generateCaptions, generateHashtags, improveCaption } from '@/agents/instagram/content-creator'
import type { Rubro } from '@/agents/instagram/types'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const { action, idea, rubro, postType, format, caption, feedback } = await req.json()

    switch (action) {
      case 'generate': {
        if (!idea || !rubro) {
          return NextResponse.json({ error: 'idea y rubro son requeridos' }, { status: 400 })
        }
        const variants = await generateCaptions(
          idea,
          rubro as Rubro,
          postType || 'educativo',
          format || 'post'
        )
        return NextResponse.json({ variants })
      }

      case 'hashtags': {
        const hashtags = await generateHashtags(rubro as Rubro, postType || 'general')
        return NextResponse.json({ hashtags })
      }

      case 'improve': {
        if (!caption || !feedback) {
          return NextResponse.json({ error: 'caption y feedback son requeridos' }, { status: 400 })
        }
        const improved = await improveCaption(caption, feedback)
        return NextResponse.json({ caption: improved })
      }

      default:
        return NextResponse.json({ error: 'action inválida. Usar: generate, hashtags, improve' }, { status: 400 })
    }
  } catch (error) {
    console.error('[Instagram Content] Error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error interno' },
      { status: 500 }
    )
  }
}
