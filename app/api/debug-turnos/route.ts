import { createAdminClient } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export async function GET() {
  const db = createAdminClient()

  const { data: clients, error: ce } = await db
    .from('clients')
    .select('id, company_name, chatbot_id, status')
    .limit(10)

  const { data: configs, error: be } = await db
    .from('booking_configs')
    .select('id, client_id, is_active')
    .limit(10)

  return NextResponse.json({ clients, configs, clientsError: ce?.message, configsError: be?.message })
}
