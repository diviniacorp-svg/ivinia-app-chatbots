import { NextRequest, NextResponse } from 'next/server'
import { getPaymentById } from '@/lib/mercadopago'
import { supabaseAdmin } from '@/lib/supabase'
import { createHmac } from 'crypto'

export const dynamic = 'force-dynamic'

function verifyMPSignature(request: NextRequest, rawBody: string): boolean {
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

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text()

    if (!verifyMPSignature(request, rawBody)) {
      console.warn('MP Webhook: firma inválida rechazada')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = JSON.parse(rawBody)

    // MercadoPago envía notificaciones de tipo payment
    if (body.type === 'payment' && body.data?.id) {
      const paymentId = String(body.data.id)
      const payment = await getPaymentById(paymentId)

      if (!payment) return NextResponse.json({ ok: true })

      const externalRef = payment.external_reference
      const status = payment.status // approved, rejected, pending

      // Guardar en DB
      await supabaseAdmin.from('payments').upsert({
        mp_payment_id: paymentId,
        mp_preference_id: payment.collector_id?.toString() || '',
        amount: payment.transaction_amount || 0,
        status: status || 'pending',
        type: 'one-time',
      })

      // Si aprobado y hay referencia de cliente, activar cliente
      if (status === 'approved' && externalRef) {
        await supabaseAdmin
          .from('clients')
          .update({ status: 'active' })
          .eq('id', externalRef)
      }
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json({ ok: true }) // siempre 200 para MP
  }
}

export async function GET(request: NextRequest) {
  // MercadoPago a veces hace GET para verificar el endpoint
  return NextResponse.json({ ok: true })
}
