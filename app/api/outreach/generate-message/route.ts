import { NextRequest, NextResponse } from 'next/server'
import { generarOutreach } from '@/lib/anthropic'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const { companyName, rubro, city, website, contactName, type, score, dolor, servicio_recomendado } = await request.json()

    if (!companyName || !rubro) {
      return NextResponse.json({ error: 'companyName y rubro son requeridos' }, { status: 400 })
    }

    const result = await generarOutreach({
      company_name: companyName,
      rubro,
      city,
      website,
      contact_name: contactName,
      score,
      dolor,
      servicio_recomendado,
    })

    // Compatibilidad con el formato anterior que espera la UI
    if (type === 'whatsapp') {
      return NextResponse.json({ message: result.mensaje_wa })
    }

    return NextResponse.json({
      subject: result.subject,
      body: result.body,
      mensaje_wa: result.mensaje_wa,
      apertura_estimada: result.apertura_estimada,
    })
  } catch (error) {
    console.error('Generate message error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error al generar mensaje' },
      { status: 500 }
    )
  }
}
