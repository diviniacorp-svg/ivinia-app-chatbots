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
    <div className="min-h-screen" style={{ backgroundColor: '#f9f5f6' }}>
      {/* Header */}
      <div className="text-white px-6 py-4 shadow-sm" style={{ backgroundColor: color }}>
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-base shrink-0">
            {companyName.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-base font-bold leading-tight">{companyName}</h1>
            <p className="text-white/70 text-xs">Reservas online</p>
          </div>
        </div>
      </div>

      {/* Wizard */}
      <BookingWizard
        clientId={clientId}
        config={config}
        companyName={companyName}
        color={color}
      />
    </div>
  )
}
