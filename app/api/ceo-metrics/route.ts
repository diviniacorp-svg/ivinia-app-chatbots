import { createAdminClient } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const db = createAdminClient()
    const { data, error } = await db.from('ceo_metrics').select('*').single()
    if (error) throw error
    return NextResponse.json(data)
  } catch (e) {
    return NextResponse.json({
      leads_nuevos: 0, leads_activos: 0, leads_calientes: 0,
      clientes_activos: 0, en_trial: 0, mrr_actual: 0,
      reservas_hoy: 0, contenido_hoy: 0, mensajes_pendientes: 0,
    })
  }
}
