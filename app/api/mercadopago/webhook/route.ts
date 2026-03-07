import { NextRequest, NextResponse } from 'next/server'
import { getPaymentById } from '@/lib/mercadopago'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

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
