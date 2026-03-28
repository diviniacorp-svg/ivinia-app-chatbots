import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase'
import { getAvailableSlots, BookingConfig } from '@/lib/bookings'

// GET /api/bookings/[clientId]?date=YYYY-MM-DD&totalDuration=60
export async function GET(
  request: NextRequest,
  { params }: { params: { clientId: string } }
) {
  const db = createAdminClient()
  const { searchParams } = new URL(request.url)
  const date = searchParams.get('date')
  const totalDuration = parseInt(searchParams.get('totalDuration') || '0', 10)

  const { data: config } = await db
    .from('booking_configs')
    .select('*')
    .eq('client_id', params.clientId)
    .eq('is_active', true)
    .maybeSingle()

  if (!config) return NextResponse.json({ error: 'No encontrado' }, { status: 404 })

  // Sin fecha/duración → devolver config completa (para inicializar el wizard)
  if (!date || !totalDuration) {
    return NextResponse.json({ config })
  }

  // Turnos existentes ese día
  const { data: existing } = await db
    .from('appointments')
    .select('appointment_time, service_duration_minutes')
    .eq('client_id', params.clientId)
    .eq('appointment_date', date)
    .in('status', ['confirmed', 'pending', 'pending_payment'])

  const slots = getAvailableSlots(config as BookingConfig, date, totalDuration, existing || [])

  return NextResponse.json({ slots })
}

// POST /api/bookings/[clientId] — crear turno (multi-servicio)
export async function POST(
  request: NextRequest,
  { params }: { params: { clientId: string } }
) {
  try {
    const body = await request.json()
    const { serviceIds, serviceNames, totalDuration, totalPrice, date, time, customerName, customerPhone, customerEmail, customerNotes } = body

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
    const safeServiceId = String(serviceIds[0]) // primary service id

    const db = createAdminClient()

    const { data: config } = await db
      .from('booking_configs')
      .select('*')
      .eq('client_id', params.clientId)
      .eq('is_active', true)
      .maybeSingle()

    if (!config) return NextResponse.json({ error: 'Negocio no disponible' }, { status: 404 })

    // Verificar que el slot sigue disponible con la duración total
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

    const { data: appt, error } = await db
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
        status: 'pending',
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ appointment: appt })
  } catch (error) {
    console.error('Booking error:', error)
    return NextResponse.json({ error: 'Error al reservar' }, { status: 500 })
  }
}
