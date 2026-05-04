import type { Metadata } from 'next'
import { createAdminClient } from '@/lib/supabase'
import CelulabClient from './CelulabClient'

export const metadata: Metadata = {
  title: 'CeluLab — Lista de precios oficial',
  description: 'Precios actualizados de módulos, baterías y reparaciones para celulares. Acceso público y mayorista. San Luis, Argentina.',
}

export const revalidate = 3600

async function getPrices() {
  try {
    const db = createAdminClient()
    const { data: client } = await db
      .from('clients')
      .select('id, custom_config')
      .eq('chatbot_id', 'celulab-demo')
      .single()

    if (!client) return null

    const { data: config } = await db
      .from('booking_configs')
      .select('services')
      .eq('client_id', client.id)
      .single()

    return {
      config: client.custom_config,
      services: config?.services ?? [],
    }
  } catch {
    return null
  }
}

export default async function CelulabPage() {
  const data = await getPrices()
  return <CelulabClient data={data} />
}
