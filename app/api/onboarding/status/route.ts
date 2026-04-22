import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const clientId = request.nextUrl.searchParams.get('clientId')
  if (!clientId) {
    return NextResponse.json({ error: 'clientId requerido' }, { status: 400 })
  }

  const db = createAdminClient()
  const { data: client, error } = await db
    .from('clients')
    .select('id, company_name, status, custom_config')
    .eq('id', clientId)
    .single()

  if (error || !client) {
    return NextResponse.json({ error: 'Cliente no encontrado' }, { status: 404 })
  }

  return NextResponse.json({ client })
}
