import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase'
import { createPaymentPreference } from '@/lib/mercadopago'
import { TURNERO_PLANS } from '@/lib/turnero-plans'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const { planId, negocio, servicios } = await request.json()

    if (!planId || !negocio?.nombre || !negocio?.email || !negocio?.whatsapp) {
      return NextResponse.json({ error: 'Faltan datos requeridos' }, { status: 400 })
    }

    const plan = TURNERO_PLANS.find(p => p.id === planId)
    if (!plan) {
      return NextResponse.json({ error: 'Plan inválido' }, { status: 400 })
    }

    const db = createAdminClient()
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://divinia.vercel.app'

    // Crear cliente con estado pending_payment y todos los datos en custom_config
    const { data: client, error: clientError } = await db
      .from('clients')
      .insert({
        company_name: negocio.nombre,
        contact_name: negocio.nombre,
        email: negocio.email,
        phone: negocio.whatsapp,
        plan: planId,
        status: 'pending_payment',
        custom_config: {
          rubro: negocio.rubro,
          ciudad: negocio.ciudad || '',
          whatsapp: negocio.whatsapp,
          schedule: negocio.schedule || null,
          // legacy fallback — kept for webhook compat with old records
          horario_apertura: '09:00',
          horario_cierre: '18:00',
          pending_services: servicios || [],
          pending_plan: planId,
          source: 'onboarding_self_service',
        },
      })
      .select('id')
      .single()

    if (clientError || !client) {
      console.error('Error creando cliente:', clientError)
      return NextResponse.json({ error: 'Error al registrar el negocio' }, { status: 500 })
    }

    // Monto: para plan anual cobrar el total anual, resto es mensual o único
    const monto = planId === 'anual' ? plan.precio * 12 : plan.precio

    const preference = await createPaymentPreference({
      title: `Turnero DIVINIA — Plan ${plan.nombre}`,
      description: `Sistema de reservas online para ${negocio.nombre}`,
      amount: monto,
      clientEmail: negocio.email,
      clientName: negocio.nombre,
      externalReference: client.id,
      backUrls: {
        success: `${appUrl}/checkout/success?type=onboarding&clientId=${client.id}`,
        failure: `${appUrl}/onboarding?error=pago_rechazado`,
        pending: `${appUrl}/checkout/success?type=onboarding&clientId=${client.id}&status=pending`,
      },
    })

    return NextResponse.json({
      ok: true,
      client_id: client.id,
      init_point: preference.init_point,
    })
  } catch (error) {
    console.error('Onboarding error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error inesperado' },
      { status: 500 }
    )
  }
}
