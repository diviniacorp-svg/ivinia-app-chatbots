import { createAdminClient } from '@/lib/supabase'
import QRPrintPage from './QRPrintPage'

export default async function QRPage({ params }: { params: { id: string } }) {
  const db = createAdminClient()

  let companyName = 'Tu negocio'
  let rubro = ''

  // Buscar por booking_config.id primero
  const { data: cfgById } = await db
    .from('booking_configs')
    .select('*, clients(company_name, rubro)')
    .eq('id', params.id)
    .eq('is_active', true)
    .maybeSingle()

  if (cfgById) {
    const client = cfgById.clients as { company_name: string; rubro: string } | null
    companyName = client?.company_name || companyName
    rubro = client?.rubro || ''
  } else {
    // Buscar por chatbot_id o cliente UUID
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(params.id)
    const filter = isUUID
      ? `chatbot_id.eq.${params.id},id.eq.${params.id}`
      : `chatbot_id.eq.${params.id}`

    const { data: client } = await db
      .from('clients')
      .select('company_name, rubro')
      .or(filter)
      .limit(1)
      .maybeSingle()

    if (client) {
      companyName = client.company_name || companyName
      rubro = client.rubro || ''
    }
  }

  const reservasUrl = `https://divinia.vercel.app/reservas/${params.id}`

  return (
    <QRPrintPage
      companyName={companyName}
      rubro={rubro}
      reservasUrl={reservasUrl}
      id={params.id}
    />
  )
}
