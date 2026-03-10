import { notFound } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase'
import { BookingConfig } from '@/lib/bookings'
import BookingWizard from './BookingWizard'

export default async function TurnosPage({ params }: { params: { id: string } }) {
  const db = createAdminClient()

  // Buscar cliente por chatbot_id o por id directo
  const { data: client } = await db
    .from('clients')
    .select('id, company_name, custom_config, status')
    .or(`chatbot_id.eq.${params.id},id.eq.${params.id}`)
    .in('status', ['active', 'trial'])
    .maybeSingle()

  if (!client) notFound()

  const { data: config } = await db
    .from('booking_configs')
    .select('*')
    .eq('client_id', client.id)
    .eq('is_active', true)
    .maybeSingle()

  if (!config || !(config as BookingConfig).services?.length) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-2xl mb-2">📅</p>
          <h1 className="text-xl font-bold text-gray-800">{client.company_name}</h1>
          <p className="text-gray-500 mt-2">El sistema de turnos no está disponible en este momento.</p>
        </div>
      </div>
    )
  }

  const cfg = config as BookingConfig
  const customConfig = client.custom_config as Record<string, string>
  const color = customConfig?.color || '#6366f1'

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="text-white py-8 px-4 text-center" style={{ backgroundColor: color }}>
        <h1 className="text-2xl font-bold">{client.company_name}</h1>
        <p className="text-white/80 text-sm mt-1">Reservá tu turno online</p>
      </div>

      {/* Wizard */}
      <div className="max-w-lg mx-auto p-4 pt-8 pb-16">
        <BookingWizard
          clientId={client.id}
          config={cfg}
          companyName={client.company_name}
          color={color}
        />
      </div>
    </div>
  )
}
