import type { Metadata } from 'next'
import { createAdminClient } from '@/lib/supabase'
import CelulabClient from './CelulabClient'

export const metadata: Metadata = {
  title: { absolute: 'CeluLab' },
  description: 'Precios actualizados de módulos, baterías y reparaciones para celulares. Acceso público y mayorista. San Luis, Argentina.',
}

export const revalidate = 3600

async function getActivePartners() {
  try {
    const db = createAdminClient()
    const { data } = await db
      .from('cl_partners')
      .select('id, name, address')
      .eq('is_active', true)
      .order('name')
    return (data ?? []) as Array<{ id: string; name: string; address: string }>
  } catch {
    return []
  }
}

export default async function CelulabPage() {
  const partners = await getActivePartners()
  return <CelulabClient partners={partners} />
}