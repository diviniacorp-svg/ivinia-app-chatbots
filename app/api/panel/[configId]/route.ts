import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

async function verifyPin(db: ReturnType<typeof createAdminClient>, configId: string, pin: string) {
  const { data: config } = await db
    .from('booking_configs')
    .select('*, clients(company_name, custom_config)')
    .eq('id', configId)
    .eq('is_active', true)
    .maybeSingle()

  if (!config) return { error: 'No encontrado', status: 404, config: null }
  if ((config.owner_pin || '1234') !== pin) return { error: 'PIN incorrecto', status: 401, config: null }
  return { error: null, status: 200, config }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { configId: string } }
) {
  const pin = request.nextUrl.searchParams.get('pin')
  if (!pin) return NextResponse.json({ error: 'PIN requerido' }, { status: 401 })

  const db = createAdminClient()
  const { error, status, config } = await verifyPin(db, params.configId, pin)
  if (error || !config) return NextResponse.json({ error }, { status })

  const client = config.clients as { company_name: string; custom_config: Record<string, string> } | null

  const { data: appointments } = await db
    .from('appointments')
    .select('id, service_name, service_duration_minutes, service_price_ars, appointment_date, appointment_time, customer_name, customer_phone, customer_notes, status, sena_ars, saldo_ars, created_at')
    .eq('client_id', config.client_id)
    .order('appointment_date', { ascending: true })
    .order('appointment_time', { ascending: true })

  return NextResponse.json({
    company_name: client?.company_name || '',
    color: client?.custom_config?.color || '#7c3aed',
    owner_phone: config.owner_phone || '',
    appointments: appointments || [],
  })
}

// PATCH /api/panel/[configId] — aprobar o rechazar una solicitud
export async function PATCH(
  request: NextRequest,
  { params }: { params: { configId: string } }
) {
  const body = await request.json()
  const { pin, appointmentId, action, sena_ars } = body

  if (!pin || !appointmentId || !action) {
    return NextResponse.json({ error: 'Faltan parámetros' }, { status: 400 })
  }
  if (!['approve', 'reject'].includes(action)) {
    return NextResponse.json({ error: 'Acción inválida' }, { status: 400 })
  }

  const db = createAdminClient()
  const { error, status, config } = await verifyPin(db, params.configId, pin)
  if (error || !config) return NextResponse.json({ error }, { status })

  // Verificar que el turno pertenece a este negocio
  const { data: appt } = await db
    .from('appointments')
    .select('id, client_id, status')
    .eq('id', appointmentId)
    .eq('client_id', config.client_id)
    .maybeSingle()

  if (!appt) return NextResponse.json({ error: 'Turno no encontrado' }, { status: 404 })
  if (appt.status !== 'pending') return NextResponse.json({ error: 'El turno ya fue procesado' }, { status: 409 })

  const newStatus = action === 'approve' ? 'confirmed' : 'cancelled'
  const updatePayload: Record<string, unknown> = { status: newStatus }

  if (action === 'approve' && sena_ars !== undefined) {
    const sena = Number(sena_ars) || 0
    updatePayload.sena_ars = sena
    // saldo_ars se puede calcular en frontend con service_price_ars - sena
  }

  const { data: updated, error: updateError } = await db
    .from('appointments')
    .update(updatePayload)
    .eq('id', appointmentId)
    .select()
    .single()

  if (updateError) return NextResponse.json({ error: 'Error al actualizar' }, { status: 500 })

  return NextResponse.json({ appointment: updated })
}
