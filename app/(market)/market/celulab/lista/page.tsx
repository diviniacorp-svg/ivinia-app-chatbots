import type { Metadata } from 'next'
import { createAdminClient } from '@/lib/supabase'
import ListaClient from './_components/ListaClient'

export const metadata: Metadata = {
  title: { absolute: 'Lista de precios · CeluLab' },
  description: 'Lista de precios mayorista de repuestos. Módulos, baterías, pines de carga y más.',
}

export const dynamic = 'force-dynamic'

async function getDefaultTechPct() {
  try {
    const db = createAdminClient()
    const { data } = await db
      .from('cl_local_splits')
      .select('tech_pct')
      .limit(1)
      .maybeSingle()
    return data?.tech_pct ?? 70
  } catch {
    return 70
  }
}

export default async function ListaPage() {
  const techPct = await getDefaultTechPct()
  return <ListaClient techPct={techPct} />
}