import { NextRequest, NextResponse } from 'next/server'
import { getPaymentById, getSubscription } from '@/lib/mercadopago'
import { supabaseAdmin } from '@/lib/supabase'
import { sendTurneroWelcomeEmail } from '@/lib/resend'
import { createHmac } from 'crypto'

export const dynamic = 'force-dynamic'

function verifyMPSignature(request: NextRequest, _rawBody: string): boolean {
  const secret = process.env.MP_WEBHOOK_SECRET
  if (!secret) return true // sin secret configurado → dev mode

  const signatureHeader = request.headers.get('x-signature')
  const requestId = request.headers.get('x-request-id')
  if (!signatureHeader) return false

  const parts = Object.fromEntries(signatureHeader.split(',').map(p => p.split('=')))
  const ts = parts['ts']
  const receivedHash = parts['v1']
  if (!ts || !receivedHash) return false

  const manifest = `id=${requestId};request-id=${requestId};ts=${ts};`
  const expectedHash = createHmac('sha256', secret).update(manifest).digest('hex')
  return expectedHash === receivedHash
}

async function provisionTurnero(clientId: string) {
  const { data: client } = await supabaseAdmin
    .from('clients')
    .select('*')
    .eq('id', clientId)
    .single()

  if (!client) return

  const cfg = client.custom_config as Record<string, unknown> | null
  if (!cfg || cfg.source !== 'onboarding_self_service') return

  // Verificar que no exista ya un booking_config
  const { data: existing } = await supabaseAdmin
    .from('booking_configs')
    .select('id')
    .eq('client_id', clientId)
    .maybeSingle()

  if (existing) return

  // Use per-day schedule if provided by new onboarding, fall back to single-pair for old records
  const schedule = cfg.schedule ?? (() => {
    const apertura = (cfg.horario_apertura as string) || '09:00'
    const cierre = (cfg.horario_cierre as string) || '18:00'
    return {
      lun: { open: apertura, close: cierre },
      mar: { open: apertura, close: cierre },
      mie: { open: apertura, close: cierre },
      jue: { open: apertura, close: cierre },
      vie: { open: apertura, close: cierre },
      sab: { open: apertura, close: cierre },
      dom: null,
    }
  })()

  const pendingServices = (cfg.pending_services as Array<{
    nombre: string
    duracion: number
    precio: number
  }>) || []

  const services = pendingServices.map(s => ({
    id: crypto.randomUUID(),
    category: 'General',
    name: s.nombre,
    description: '',
    duration_minutes: s.duracion || 60,
    price_ars: s.precio || 0,
    deposit_percentage: 0,
  }))

  const pin = Math.floor(1000 + Math.random() * 9000).toString()
  const whatsapp = (cfg.whatsapp as string) || client.phone || ''

  const { data: bookingConfig } = await supabaseAdmin
    .from('booking_configs')
    .insert({
      client_id: clientId,
      is_active: true,
      slot_duration_minutes: 30,
      advance_booking_days: 60,
      blocked_dates: [],
      owner_phone: whatsapp,
      owner_pin: pin,
      schedule,
      services,
    })
    .select('id')
    .single()

  if (!bookingConfig) return

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://divinia.vercel.app'
  const turneroUrl = `${appUrl}/reservas/${bookingConfig.id}`
  const panelUrl = `${appUrl}/panel/${bookingConfig.id}`

  // Guardar el link en custom_config para mostrarlo en success page
  await supabaseAdmin
    .from('clients')
    .update({
      custom_config: {
        ...cfg,
        turnero_url: turneroUrl,
        panel_url: panelUrl,
        panel_pin: pin,
        provisioned_at: new Date().toISOString(),
      },
    })
    .eq('id', clientId)

  console.log(`[PROVISION] Nuevo cliente: ${client.company_name} | Turnero: ${turneroUrl}`)

  // Enviar email de bienvenida al cliente con sus links + PIN + QR
  if (client.email) {
    await sendTurneroWelcomeEmail({
      company_name: client.company_name,
      contact_name: (client as Record<string, unknown>).contact_name as string | null ?? null,
      email: client.email,
      turnero_url: turneroUrl,
      panel_url: panelUrl,
      panel_pin: pin,
    })
  }
}

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text()

    if (!verifyMPSignature(request, rawBody)) {
      console.warn('MP Webhook: firma inválida rechazada')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = JSON.parse(rawBody)

    // Suscripciones recurrentes (preapproval)
    if (body.type === 'preapproval' && body.data?.id) {
      const preapprovalId = String(body.data.id)
      try {
        const mpSub = await getSubscription(preapprovalId)
        const estado = mpSub.status === 'authorized' ? 'active'
          : mpSub.status === 'cancelled' ? 'cancelled'
          : mpSub.status || 'pending'
        await supabaseAdmin
          .from('subscriptions')
          .update({ estado })
          .eq('mp_preapproval_id', preapprovalId)
        console.log(`[WEBHOOK] preapproval ${preapprovalId} → ${estado}`)
      } catch (e) {
        console.error('[WEBHOOK preapproval]', e)
      }
    }

    if (body.type === 'payment' && body.data?.id) {
      const paymentId = String(body.data.id)
      const payment = await getPaymentById(paymentId)

      if (!payment) return NextResponse.json({ ok: true })

      const externalRef = payment.external_reference
      const status = payment.status

      // Guardar en DB
      await supabaseAdmin.from('payments').upsert({
        mp_payment_id: paymentId,
        mp_preference_id: payment.collector_id?.toString() || '',
        amount: payment.transaction_amount || 0,
        status: status || 'pending',
        type: 'one-time',
      })

      if (status === 'approved' && externalRef) {
        // Activar cliente
        await supabaseAdmin
          .from('clients')
          .update({ status: 'active' })
          .eq('id', externalRef)

        // Auto-provisionar Turnero si viene del onboarding self-service
        await provisionTurnero(externalRef)
      }
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json({ ok: true }) // siempre 200 para MP
  }
}

export async function GET() {
  return NextResponse.json({ ok: true })
}
