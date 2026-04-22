import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase'
import { generarPropuesta } from '@/lib/anthropic'
import { createPaymentPreference } from '@/lib/mercadopago'
import { TURNERO_PLANS } from '@/lib/turnero-plans'

export const dynamic = 'force-dynamic'

export async function GET() {
  const db = createAdminClient()
  const { data, error } = await db
    .from('proposals')
    .select('*, leads(company_name, rubro, city, phone, email)')
    .order('created_at', { ascending: false })
    .limit(50)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ proposals: data })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      lead_id,
      company_name,
      rubro,
      city,
      servicio,
      dolor,
      plan_id,
      precio_override,
    } = body

    if (!company_name || !rubro || !servicio) {
      return NextResponse.json({ error: 'company_name, rubro y servicio son requeridos' }, { status: 400 })
    }

    const db = createAdminClient()
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://divinia.vercel.app'

    // Determinar precio
    let precio = precio_override
    if (!precio && plan_id) {
      const plan = TURNERO_PLANS.find(p => p.id === plan_id)
      precio = plan ? (plan_id === 'anual' ? plan.precio * 12 : plan.precio) : 120000
    }
    if (!precio) precio = 120000

    // Generar propuesta con Claude Sonnet
    const proposal = await generarPropuesta({
      company_name,
      rubro,
      city: city || 'San Luis',
      servicio,
      dolor: dolor || 'Optimizar operaciones y conseguir más clientes',
      precio,
    })

    // Crear preferencia de MercadoPago
    let link_pago: string | null = null
    let mp_preference_id: string | null = null

    try {
      const pref = await createPaymentPreference({
        title: proposal.titulo,
        description: `${servicio} para ${company_name} — DIVINIA`,
        amount: precio,
        externalReference: lead_id || undefined,
        backUrls: {
          success: `${appUrl}/checkout/success`,
          failure: `${appUrl}/propuesta`,
          pending: `${appUrl}/checkout/success?status=pending`,
        },
      })
      link_pago = pref.init_point || null
      mp_preference_id = pref.id || null
    } catch (mpErr) {
      console.warn('MP preference error (no crítico):', mpErr)
    }

    // Guardar en tabla proposals
    const contenidoJson = JSON.stringify(proposal)

    const { data: saved, error: saveErr } = await db
      .from('proposals')
      .insert({
        lead_id: lead_id || null,
        rubro,
        productos: [servicio],
        precio_total: precio,
        precio_adelanto: Math.round(precio * 0.5),
        contenido: contenidoJson,
        status: 'borrador',
        link_pago,
        mp_preference_id,
      })
      .select('id')
      .single()

    if (saveErr || !saved) {
      console.error('Error guardando propuesta:', saveErr)
      return NextResponse.json({ error: 'Error al guardar la propuesta' }, { status: 500 })
    }

    // Si hay lead_id, actualizar su status
    if (lead_id) {
      await db
        .from('leads')
        .update({ status: 'propuesta', updated_at: new Date().toISOString() })
        .eq('id', lead_id)
    }

    const propuestaUrl = `${appUrl}/propuesta/${saved.id}`

    return NextResponse.json({
      ok: true,
      proposal_id: saved.id,
      url: propuestaUrl,
      link_pago,
      mensaje_wa: proposal.mensaje_wa_propuesta,
      precio,
    })
  } catch (error) {
    console.error('Proposal generation error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error al generar propuesta' },
      { status: 500 }
    )
  }
}
