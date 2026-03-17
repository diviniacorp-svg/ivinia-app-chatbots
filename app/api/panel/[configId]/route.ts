import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase'

export async function GET(
  request: NextRequest,
  { params }: { params: { configId: string } }
) {
  const pin = request.nextUrl.searchParams.get('pin')
  if (!pin) return NextResponse.json({ error: 'PIN requerido' }, { status: 401 })

  const db = createAdminClient()

  // Buscar la config y verificar el PIN
  const { data: config } = await db
    .from('booking_configs')
    .select('*, clients(company_name, custom_config)')
    .eq('id', params.configId)
    .eq('is_active', true)
    .maybeSingle()

  if (!config) return NextResponse.json({ error: 'No encontrado' }, { status: 404 })

  const storedPin = config.owner_pin || '1234'
  if (pin !== storedPin) {
    return NextResponse.json({ error: 'PIN incorrecto' }, { status: 401 })
  }

  const client = config.clients as { company_name: string; custom_config: Record<string, string> } | null
  const company_name = client?.company_name || ''
  const color = client?.custom_config?.color || '#7c3aed'

  // Traer los turnos de ese cliente
  const { data: appointments } = await db
    .from('appointments')
    .select('id, service_name, service_duration_minutes, service_price_ars, appointment_date, appointment_time, customer_name, customer_phone, customer_notes, status, created_at')
    .eq('client_id', config.client_id)
    .order('appointment_date', { ascending: true })
    .order('appointment_time', { ascending: true })

  return NextResponse.json({
    company_name,
    color,
    appointments: appointments || [],
  })
}
