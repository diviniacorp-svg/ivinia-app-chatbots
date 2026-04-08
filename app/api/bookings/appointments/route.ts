import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

// GET /api/bookings/appointments?clientId=xxx&date=YYYY-MM-DD&status=confirmed
export async function GET(request: NextRequest) {
  const db = createAdminClient()
  const { searchParams } = new URL(request.url)
  const clientId = searchParams.get('clientId')
  const date = searchParams.get('date')
  const status = searchParams.get('status')

  let query = db
    .from('appointments')
    .select('*, clients(company_name)')
    .order('appointment_date', { ascending: true })
    .order('appointment_time', { ascending: true })

  if (clientId) query = query.eq('client_id', clientId)
  if (date) query = query.eq('appointment_date', date)
  if (status) query = query.eq('status', status)

  const { data, error } = await query
  if (error) return NextResponse.json({ error: 'Error' }, { status: 500 })

  return NextResponse.json({ appointments: data })
}
