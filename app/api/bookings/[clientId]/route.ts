import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase'
import { getAvailableSlots, BookingConfig } from '@/lib/bookings'

// GET /api/bookings/[clientId]?date=YYYY-MM-DD&totalDuration=60&professionalId=xxx&serviceId=xxx
export async function GET(
  request: NextRequest,
  { params }: { params: { clientId: string } }
) {
  const db = createAdminClient()
  const { searchParams } = new URL(request.url)
  const date = searchParams.get('date')
  const totalDuration = parseInt(searchParams.get('totalDuration') || '0', 10)
  const professionalId = searchParams.get('professionalId')
  const serviceId = searchParams.get('serviceId')

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

  const typedConfig = config as BookingConfig

  // Detectar cupo máximo del servicio principal
  const service = serviceId ? (typedConfig.services || []).find((s: { id: string }) => s.id === serviceId) : null
  const maxCapacity: number = (service as { max_capacity?: number } | null)?.max_capacity ?? 1

  // Turnos existentes ese día
  const { data: existing } = await db
    .from('appointments')
    .select('appointment_time, service_duration_minutes, professional_id')
    .eq('client_id', params.clientId)
    .eq('appointment_date', date)
    .in('status', ['confirmed', 'pending', 'pending_payment'])

  const allExisting = existing || []

  // Si hay profesionales y el id es 'any': unión de slots de todos los profesionales
  if (professionalId === 'any' && typedConfig.professionals && typedConfig.professionals.length > 0) {
    const slotSet = new Set<string>()
    for (const prof of typedConfig.professionals) {
      const profExisting = allExisting.filter(a => a.professional_id === prof.id)
      const profSlots = getAvailableSlots(typedConfig, date, totalDuration, profExisting, maxCapacity)
      profSlots.forEach(s => slotSet.add(s))
    }
    const slots = Array.from(slotSet).sort()
    return NextResponse.json({ slots })
  }

  // Profesional específico: filtrar turnos por ese profesional
  const filtered = professionalId && professionalId !== 'any'
    ? allExisting.filter(a => a.professional_id === professionalId)
    : allExisting

  const slots = getAvailableSlots(typedConfig, date, totalDuration, filtered, maxCapacity)

  // Para servicios con cupo > 1, retornar también la cantidad ocupada por slot (para mostrar "X cupos disponibles")
  let slotCounts: Record<string, number> | undefined
  if (maxCapacity > 1) {
    slotCounts = {}
    for (const appt of filtered) {
      const t = appt.appointment_time
      slotCounts[t] = (slotCounts[t] || 0) + 1
    }
  }

  return NextResponse.json({ slots, slotCounts, maxCapacity: maxCapacity > 1 ? maxCapacity : undefined })
}

// POST /api/bookings/[clientId] — crear turno (multi-servicio)
export async function POST(
  request: NextRequest,
  { params }: { params: { clientId: string } }
) {
  try {
    const body = await request.json()
    const { serviceIds, serviceNames, totalDuration, totalPrice, date, time, customerName, customerPhone, customerEmail, customerNotes, professionalId, professionalName } = body

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
      .select('appointment_time, service_duration_minutes, professional_id')
      .eq('client_id', params.clientId)
      .eq('appointment_date', date)
      .in('status', ['confirmed', 'pending', 'pending_payment'])

    const allExisting = existing || []
    const filteredForCheck = professionalId && professionalId !== 'any'
      ? allExisting.filter((a: { professional_id?: string }) => a.professional_id === professionalId)
      : allExisting

    const typedCfg = config as BookingConfig
    const primaryService = safeServiceId ? (typedCfg.services || []).find((s: { id: string }) => s.id === safeServiceId) : null
    const maxCap: number = (primaryService as { max_capacity?: number } | null)?.max_capacity ?? 1

    const slots = getAvailableSlots(typedCfg, date, safeDuration, filteredForCheck, maxCap)
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
        professional_id: professionalId || null,
        professional_name: professionalName || null,
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
