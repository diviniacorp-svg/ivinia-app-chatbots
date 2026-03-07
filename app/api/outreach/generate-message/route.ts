import { NextRequest, NextResponse } from 'next/server'
import { generateOutreachEmail, generateWhatsAppMessage } from '@/lib/claude'

export async function POST(request: NextRequest) {
  try {
    const { companyName, rubro, city, website, contactName, type } = await request.json()

    if (!companyName || !rubro) {
      return NextResponse.json({ error: 'companyName y rubro son requeridos' }, { status: 400 })
    }

    if (type === 'whatsapp') {
      const message = await generateWhatsAppMessage({ companyName, rubro, city })
      return NextResponse.json({ message })
    }

    // Default: email
    const { subject, body } = await generateOutreachEmail({
      companyName,
      rubro,
      city,
      website,
      contactName,
    })

    return NextResponse.json({ subject, body })
  } catch (error) {
    console.error('Generate message error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error al generar mensaje' },
      { status: 500 }
    )
  }
}
