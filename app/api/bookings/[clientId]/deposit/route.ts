import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase'
import { getAvailableSlots, BookingConfig } from '@/lib/bookings'
import { createPaymentPreference } from '@/lib/mercadopago'

export const dynamic = 'force-dynamic'

// POST /api/bookings/[clientId]/deposit
// Crea el turno como 'pending_payment' y genera link de pago de seña
export async function POST(
  request: NextRequest,
  { params }: { params: { clientId: string } }
) {
  try {
    const body = await request.json()
    const { serviceIds, serviceNames, totalDuration, totalPrice, date, time, customerName, customerPhone, customerEmail, customerNotes, configId } = body

    if (!serviceIds?.length || !date || !time || !customerName || !totalDuration) {
      return NextResponse.json({ error: 'Faltan datos requeridos' }, { status: 400 })
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !/^\d{2}:\d{2}$/.test(time)) {
      return NextResponse.json({ error: 'Formato de fecha/hora inválido' }, { status: 400 })
    }

    const safeName = String(customerName).slice(0, 100)
    const safePhone = String(customerPhone || '').slice(0, 30)
    const safeEmail = String(customerEmail || '').slice(0, 100)
    const safeNotes = String(customerNotes || '').slice(0, 500)
    const safeNames = String(serviceNames || '').slice(0, 300)
    const safeDuration = Math.min(Math.max(parseInt(totalDuration, 10) || 60, 5), 480)
    const safePrice = Math.max(parseFloat(totalPrice) || 0, 0)
    const safeServiceId = String(serviceIds[0])

    const db = createAdminClient()

    const { data: config } = await db
      .from('booking_configs')
      .select('*')
      .eq('client_id', params.clientId)
      .eq('is_active', true)
      .maybeSingle()

    if (!config) return NextResponse.json({ error: 'Negocio no disponible' }, { status: 404 })

    // Verificar slot disponible
    const { data: existing } = await db
      .from('appointments')
      .select('appointment_time, service_duration_minutes')
      .eq('client_id', params.clientId)
      .eq('appointment_date', date)
      .in('status', ['confirmed', 'pending', 'pending_payment'])

    const slots = getAvailableSlots(config as BookingConfig, date, safeDuration, existing || [])
    if (!slots.includes(time)) {
      return NextResponse.json({ error: 'El turno ya no está disponible' }, { status: 409 })
    }

    // Calcular monto de seña desde los servicios seleccionados
    const services = config.services as BookingConfig['services']
    const selectedSvcs = services.filter((s: { id: string }) => serviceIds.includes(s.id))
    const maxDepositPct = Math.max(...selectedSvcs.map((s: { deposit_percentage?: number }) => s.deposit_percentage ?? 0), 0)
    const depositAmount = Math.round((safePrice * maxDepositPct) / 100)

    if (depositAmount <= 0) {
      return NextResponse.json({ error: 'Este combo de servicios no requiere seña' }, { status: 400 })
    }

    // Crear turno con status pending_payment
    const { data: appt, error: apptError } = await db
      .from('appointments')
      .insert({
        client_id: params.clientId,
        booking_config_id: config.id,
        service_id: safeServiceId,
        service_name: safeNames,
        service_duration_minutes: safeDuration,
        service_price_ars: safePrice,
        appointment_date: date,
        appointment_time: time,
        customer_name: safeName,
        customer_phone: safePhone,
        customer_email: safeEmail,
        customer_notes: safeNotes,
        status: 'pending_payment',
      })
      .select()
      .single()

    if (apptError || !appt) throw apptError

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://divinia.vercel.app'

    // Crear preferencia de MercadoPago
    const preference = await createPaymentPreference({
      title: `Seña — ${safeNames}`,
      description: `Turno el ${date} a las ${time} · ${safeName}`,
      amount: depositAmount,
      clientEmail: safeEmail || undefined,
      clientName: safeName,
      externalReference: appt.id,
      backUrls: {
        success: `${appUrl}/turnos/${configId}?paid=true&appt=${appt.id}`,
        failure: `${appUrl}/turnos/${configId}?paid=false&appt=${appt.id}`,
        pending: `${appUrl}/turnos/${configId}?paid=pending&appt=${appt.id}`,
      },
    })

    return NextResponse.json({
      appointmentId: appt.id,
      depositAmount,
      depositPct: maxDepositPct,
      initPoint: preference.init_point,
    })
  } catch (error) {
    console.error('Deposit error:', error)
    return NextResponse.json({ error: 'Error al procesar la seña' }, { status: 500 })
  }
}
