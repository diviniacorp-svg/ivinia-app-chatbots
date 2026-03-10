import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase'
import { getAvailableSlots, BookingConfig } from '@/lib/bookings'

// GET /api/bookings/[clientId]?date=YYYY-MM-DD&serviceId=xxx
export async function GET(
  request: NextRequest,
  { params }: { params: { clientId: string } }
) {
  const db = createAdminClient()
  const { searchParams } = new URL(request.url)
  const date = searchParams.get('date')
  const serviceId = searchParams.get('serviceId')

  const { data: config } = await db
    .from('booking_configs')
    .select('*')
    .eq('client_id', params.clientId)
    .eq('is_active', true)
    .maybeSingle()

  if (!config) return NextResponse.json({ error: 'No encontrado' }, { status: 404 })

  // Sin fecha/servicio → devolver config completa (para inicializar el wizard)
  if (!date || !serviceId) {
    return NextResponse.json({ config })
  }

  const service = (config.services as BookingConfig['services']).find((s: { id: string }) => s.id === serviceId)
  if (!service) return NextResponse.json({ error: 'Servicio no encontrado' }, { status: 404 })

  // Turnos existentes ese día
  const { data: existing } = await db
    .from('appointments')
    .select('appointment_time, service_duration_minutes')
    .eq('client_id', params.clientId)
    .eq('appointment_date', date)
    .eq('status', 'confirmed')

  const slots = getAvailableSlots(config as BookingConfig, date, service.duration_minutes, existing || [])

  return NextResponse.json({ slots, service })
}

// POST /api/bookings/[clientId] — crear turno
export async function POST(
  request: NextRequest,
  { params }: { params: { clientId: string } }
) {
  try {
    const body = await request.json()
    const { serviceId, date, time, customerName, customerPhone, customerEmail, customerNotes } = body

    if (!serviceId || !date || !time || !customerName) {
      return NextResponse.json({ error: 'Faltan datos requeridos' }, { status: 400 })
    }

    // Validar formato fecha/hora
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !/^\d{2}:\d{2}$/.test(time)) {
      return NextResponse.json({ error: 'Formato de fecha/hora inválido' }, { status: 400 })
    }

    // Sanitizar inputs
    const safeName = String(customerName).slice(0, 100)
    const safePhone = String(customerPhone || '').slice(0, 30)
    const safeEmail = String(customerEmail || '').slice(0, 100)
    const safeNotes = String(customerNotes || '').slice(0, 500)

    const db = createAdminClient()

    const { data: config } = await db
      .from('booking_configs')
      .select('*')
      .eq('client_id', params.clientId)
      .eq('is_active', true)
      .maybeSingle()

    if (!config) return NextResponse.json({ error: 'Negocio no disponible' }, { status: 404 })

    const service = (config.services as BookingConfig['services']).find((s: { id: string }) => s.id === serviceId)
    if (!service) return NextResponse.json({ error: 'Servicio no encontrado' }, { status: 404 })

    // Verificar que el slot sigue disponible
    const { data: existing } = await db
      .from('appointments')
      .select('appointment_time, service_duration_minutes')
      .eq('client_id', params.clientId)
      .eq('appointment_date', date)
      .eq('status', 'confirmed')

    const slots = getAvailableSlots(config as BookingConfig, date, service.duration_minutes, existing || [])
    if (!slots.includes(time)) {
      return NextResponse.json({ error: 'El turno ya no está disponible' }, { status: 409 })
    }

    const { data: appt, error } = await db
      .from('appointments')
      .insert({
        client_id: params.clientId,
        booking_config_id: config.id,
        service_id: serviceId,
        service_name: service.name,
        service_duration_minutes: service.duration_minutes,
        service_price_ars: service.price_ars,
        appointment_date: date,
        appointment_time: time,
        customer_name: safeName,
        customer_phone: safePhone,
        customer_email: safeEmail,
        customer_notes: safeNotes,
        status: 'confirmed',
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
