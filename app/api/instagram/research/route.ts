import { NextRequest, NextResponse } from 'next/server'
import { researchMarket, getCompetitorAnalysis } from '@/agents/instagram/market-researcher'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const { rubro, includeCompetitorAnalysis } = await req.json()

    if (!rubro) {
      return NextResponse.json({ error: 'rubro es requerido' }, { status: 400 })
    }

    const research = await researchMarket(rubro)

    let competitorAnalysis: string | undefined
    if (includeCompetitorAnalysis && research.competitors.length > 0) {
      competitorAnalysis = await getCompetitorAnalysis(research.competitors)
    }

    return NextResponse.json({ research, competitorAnalysis })
  } catch (error) {
    console.error('[Instagram Research] Error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error interno' },
      { status: 500 }
    )
  }
}
