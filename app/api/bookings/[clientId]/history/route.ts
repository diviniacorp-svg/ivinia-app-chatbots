import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase'

// GET /api/bookings/[clientId]/history?phone=xxx
// Devuelve los últimos turnos de un cliente por su número de teléfono
export async function GET(
  request: NextRequest,
  { params }: { params: { clientId: string } }
) {
  const phone = new URL(request.url).searchParams.get('phone')?.trim()
  if (!phone || phone.length < 6) {
    return NextResponse.json({ appointments: [] })
  }

  const db = createAdminClient()
  const { data } = await db
    .from('appointments')
    .select('service_name, appointment_date, appointment_time, status, service_price_ars')
    .eq('client_id', params.clientId)
    .ilike('customer_phone', `%${phone.replace(/\D/g, '').slice(-8)}%`)
    .in('status', ['confirmed', 'completed'])
    .order('appointment_date', { ascending: false })
    .limit(4)

  return NextResponse.json({ appointments: data || [] })
}
