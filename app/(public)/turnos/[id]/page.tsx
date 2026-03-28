import { notFound } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase'
import { BookingConfig } from '@/lib/bookings'
import BookingWizard from './BookingWizard'

export default async function TurnosPage({ params }: { params: { id: string } }) {
  const db = createAdminClient()

  // Buscar booking_config por id (URL principal) o por client chatbot_id (compat)
  let config: BookingConfig | null = null
  let companyName = ''
  let color = '#6366f1'
  let clientId = ''

  // Opción 1: el id ES el booking_config.id
  const { data: cfgById } = await db
    .from('booking_configs')
    .select('*, clients(company_name, custom_config)')
    .eq('id', params.id)
    .eq('is_active', true)
    .maybeSingle()

  if (cfgById) {
    config = cfgById as BookingConfig
    clientId = cfgById.client_id
    const client = cfgById.clients as { company_name: string; custom_config: Record<string, string> } | null
    companyName = client?.company_name || ''
    color = client?.custom_config?.color || '#6366f1'
  } else {
    // Opción 2: el id es chatbot_id del cliente (compatibilidad hacia atrás)
    const { data: client } = await db
      .from('clients')
      .select('id, company_name, custom_config')
      .or(`chatbot_id.eq.${params.id},id.eq.${params.id}`)
      .maybeSingle()

    if (client) {
      clientId = client.id
      companyName = client.company_name
      color = (client.custom_config as Record<string, string>)?.color || '#6366f1'

      const { data: cfg } = await db
        .from('booking_configs')
        .select('*')
        .eq('client_id', client.id)
        .eq('is_active', true)
        .maybeSingle()

      if (cfg) config = cfg as BookingConfig
    }
  }

  if (!config || !config.services?.length || !clientId) {
    if (!companyName) return notFound()
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-2xl mb-2">📅</p>
          <h1 className="text-xl font-bold text-gray-800">{companyName}</h1>
          <p className="text-gray-500 mt-2">El sistema de turnos no está disponible en este momento.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="text-white py-8 px-4 text-center" style={{ backgroundColor: color }}>
        <h1 className="text-2xl font-bold">{companyName}</h1>
        <p className="text-white/80 text-sm mt-1">Reservá tu turno online</p>
      </div>

      {/* Wizard */}
      <div className="max-w-lg mx-auto p-4 pt-8 pb-16">
        <BookingWizard
          clientId={clientId}
          config={config}
          companyName={companyName}
          color={color}
          configId={params.id}
        />
      </div>
    </div>
  )
}
