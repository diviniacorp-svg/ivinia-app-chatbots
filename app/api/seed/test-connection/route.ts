import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !key) {
    return NextResponse.json({ error: 'Faltan variables de entorno', url: !!url, key: !!key })
  }

  const db = createAdminClient()

  // Test 1: leer clientes
  const { data: clients, error: readError } = await db
    .from('clients').select('id').limit(1)

  // Test 2: intentar insertar y borrar un registro de prueba
  const { data: inserted, error: writeError } = await db
    .from('clients')
    .insert({
      chatbot_id: '__test_connection__',
      company_name: 'TEST',
      contact_name: 'test',
      email: 'test@test.com',
      status: 'trial',
      plan: 'trial',
    })
    .select('id')
    .single()

  if (inserted?.id) {
    await db.from('clients').delete().eq('id', inserted.id)
  }

  return NextResponse.json({
    url_prefix: url?.slice(0, 40),
    key_prefix: key?.slice(0, 20),
    read: readError ? { error: readError.message, code: readError.code } : { ok: true, count: clients?.length },
    write: writeError ? { error: writeError.message, code: writeError.code } : { ok: true },
  })
}
