import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase'

// GET /api/bookings/configs — lista todos los booking_configs con info del cliente
export async function GET() {
  const db = createAdminClient()

  const { data, error } = await db
    .from('booking_configs')
    .select('*, clients(id, company_name, contact_name, chatbot_id, status)')
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ configs: data || [] })
}
