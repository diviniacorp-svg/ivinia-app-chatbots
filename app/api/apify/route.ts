import { NextRequest, NextResponse } from 'next/server'
import { scrapeLeads } from '@/lib/apify'

export async function POST(request: NextRequest) {
  try {
    const { rubro, city, maxItems = 20 } = await request.json()

    if (!rubro || !city) {
      return NextResponse.json({ error: 'rubro y city son requeridos' }, { status: 400 })
    }

    const leads = await scrapeLeads(rubro, city, maxItems)

    return NextResponse.json({ leads, count: leads.length })
  } catch (error) {
    console.error('Apify error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error al hacer scraping' },
      { status: 500 }
    )
  }
}
