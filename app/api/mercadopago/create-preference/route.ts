import { NextRequest, NextResponse } from 'next/server'
import { createPaymentPreference } from '@/lib/mercadopago'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const { title, amount, clientEmail, clientName, externalRef, backUrls } = await request.json()

    if (!title || !amount) {
      return NextResponse.json({ error: 'title y amount son requeridos' }, { status: 400 })
    }

    const preference = await createPaymentPreference({
      title,
      description: `Servicio de chatbot IA - DIVINIA`,
      amount: Number(amount),
      clientEmail,
      clientName,
      externalReference: externalRef,
      backUrls,
    })

    return NextResponse.json({
      id: preference.id,
      preference_id: preference.id,
      init_point: preference.init_point,
      sandbox_init_point: preference.sandbox_init_point,
      amount: Number(amount),
      title,
    })
  } catch (error) {
    console.error('MercadoPago error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error al crear preferencia' },
      { status: 500 }
    )
  }
}
