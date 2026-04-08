import { NextRequest, NextResponse } from 'next/server'
import { publishPost, publishCarousel, getAccountInsights, getPostInsights } from '@/agents/instagram/publisher'
import type { InstagramPost } from '@/agents/instagram/types'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const { action, post, imageUrls, caption, hashtags, igMediaId } = await req.json()

    switch (action) {
      case 'publish': {
        if (!post) {
          return NextResponse.json({ error: 'post es requerido' }, { status: 400 })
        }
        const result = await publishPost(post as InstagramPost)
        return NextResponse.json(result)
      }

      case 'carousel': {
        if (!imageUrls || !caption) {
          return NextResponse.json({ error: 'imageUrls y caption son requeridos' }, { status: 400 })
        }
        const result = await publishCarousel(imageUrls, caption, hashtags || [])
        return NextResponse.json(result)
      }

      case 'insights_post': {
        if (!igMediaId) {
          return NextResponse.json({ error: 'igMediaId es requerido' }, { status: 400 })
        }
        const metrics = await getPostInsights(igMediaId)
        return NextResponse.json({ metrics })
      }

      default:
        return NextResponse.json({ error: 'action inválida. Usar: publish, carousel, insights_post' }, { status: 400 })
    }
  } catch (error) {
    console.error('[Instagram Publish] Error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error interno' },
      { status: 500 }
    )
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const period = (searchParams.get('period') || 'week') as 'day' | 'week' | 'month'
    const metrics = await getAccountInsights(period)
    return NextResponse.json({ metrics })
  } catch (error) {
    console.error('[Instagram Insights] Error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error interno' },
      { status: 500 }
    )
  }
}
