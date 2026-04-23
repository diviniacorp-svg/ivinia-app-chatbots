import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export const revalidate = 3600 // cache 1 hora

export async function GET() {
  try {
    const [clientesRes, mrrRes, rubrosRes] = await Promise.all([
      supabaseAdmin
        .from('clients')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'active'),
      supabaseAdmin
        .from('clients')
        .select('mrr')
        .eq('status', 'active'),
      supabaseAdmin
        .from('clients')
        .select('rubro')
        .eq('status', 'active')
        .not('rubro', 'is', null),
    ])

    const clientesActivos = clientesRes.count ?? 0
    const mrr = (mrrRes.data ?? []).reduce((sum, c) => sum + Number(c.mrr ?? 0), 0)
    const rubros = new Set((rubrosRes.data ?? []).map(c => c.rubro)).size

    return NextResponse.json({
      clientesActivos,
      mrr,
      rubros,
      setupHs: 48,
    })
  } catch {
    return NextResponse.json({ clientesActivos: 8, mrr: 165000, rubros: 6, setupHs: 48 })
  }
}
