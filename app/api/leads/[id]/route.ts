import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { createPaymentPreference } from '@/lib/mercadopago'
import { generarPropuesta } from '@/lib/anthropic'

export const dynamic = 'force-dynamic'

async function autoPropuesta(leadId: string) {
  const { data: lead } = await supabaseAdmin
    .from('leads')
    .select('company_name, rubro, city, email, phone')
    .eq('id', leadId)
    .single()

  if (!lead?.company_name) return null

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://divinia.vercel.app'
  const precio = 120000

  try {
    const proposal = await generarPropuesta({
      company_name: lead.company_name,
      rubro: lead.rubro || 'negocio local',
      city: lead.city || 'San Luis',
      servicio: 'Turnero IA',
      dolor: 'Optimizar reservas y conseguir más clientes',
      precio,
    })

    let link_pago: string | null = null
    try {
      const pref = await createPaymentPreference({
        title: proposal.titulo,
        description: `Turnero IA para ${lead.company_name}`,
        amount: precio,
        externalReference: leadId,
        backUrls: {
          success: `${appUrl}/checkout/success`,
          failure: `${appUrl}/propuesta`,
          pending: `${appUrl}/checkout/success?status=pending`,
        },
      })
      link_pago = pref.init_point || null
    } catch {}

    const { data: saved } = await supabaseAdmin
      .from('proposals')
      .insert({
        lead_id: leadId,
        rubro: lead.rubro || 'negocio local',
        productos: ['Turnero IA'],
        precio_total: precio,
        precio_adelanto: Math.round(precio * 0.5),
        contenido: JSON.stringify(proposal),
        status: 'borrador',
        link_pago,
      })
      .select('id')
      .single()

    return saved?.id ?? null
  } catch (e) {
    console.error('[autoPropuesta]', e)
    return null
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()

    const allowed = ['status', 'notes', 'score', 'contact_name', 'email', 'phone', 'outreach_sent']
    const safeUpdate: Record<string, unknown> = { updated_at: new Date().toISOString() }
    for (const key of allowed) {
      if (key in body) safeUpdate[key] = body[key]
    }

    const { data, error } = await supabaseAdmin
      .from('leads')
      .update(safeUpdate)
      .eq('id', params.id)
      .select()
      .single()

    if (error) throw error

    // Auto-crear propuesta borrador cuando el lead se califica
    let proposal_id: string | null = null
    if (body.status === 'qualified') {
      proposal_id = await autoPropuesta(params.id)
    }

    return NextResponse.json({ lead: data, proposal_id })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error' },
      { status: 500 }
    )
  }
}
