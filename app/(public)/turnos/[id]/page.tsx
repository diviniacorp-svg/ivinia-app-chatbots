import { notFound } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase'
import { BookingConfig } from '@/lib/bookings'
import BookingWizard from './BookingWizard'

export default async function TurnosPage({ params }: { params: { id: string } }) {
  const db = createAdminClient()

  let config: BookingConfig | null = null
  let companyName = ''
  let color = '#6366f1'
  let clientId = ''
  let customCfg: Record<string, string> = {}

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
    customCfg = (client?.custom_config as Record<string, string>) || {}
    color = customCfg.color || '#6366f1'
  } else {
    // Opción 2: el id es chatbot_id del cliente
    const { data: client } = await db
      .from('clients')
      .select('id, company_name, custom_config')
      .or(`chatbot_id.eq.${params.id},id.eq.${params.id}`)
      .maybeSingle()

    if (client) {
      clientId = client.id
      companyName = client.company_name
      customCfg = (client.custom_config as Record<string, string>) || {}
      color = customCfg.color || '#6366f1'

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
      <div style={{ minHeight: '100vh', background: 'var(--paper)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'var(--paper-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, margin: '0 auto 16px' }}>📅</div>
          <h1 style={{ fontFamily: 'var(--f-display)', fontWeight: 700, fontSize: 20, color: 'var(--ink)', margin: '0 0 8px' }}>{companyName}</h1>
          <p style={{ color: 'var(--muted)', fontSize: 14 }}>El sistema de turnos no está disponible en este momento.</p>
        </div>
      </div>
    )
  }

  // Config de intro desde custom_config del cliente
  const introEmoji = customCfg.intro_emoji || '📅'
  const introTagline = customCfg.intro_tagline || 'Reservá tu turno online'
  const introStyle = (customCfg.intro_style as 'bubbles' | 'sparkles' | 'petals') || 'bubbles'
  const depositsEnabled = customCfg.deposits_enabled === 'true'
  const instagram = customCfg.instagram || ''
  const ownerPhone = customCfg.whatsapp || config.owner_phone || ''

  const firstServiceName = config.services?.[0]?.name || ''

  return (
    <div style={{ minHeight: '100vh', background: 'var(--paper)' }}>
      {/* Header del negocio — standalone, sin navbar DIVINIA */}
      <div style={{
        borderBottom: '1px solid var(--line)',
        padding: '20px 24px',
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        maxWidth: 480,
        margin: '0 auto',
      }}>
        <div style={{
          width: 48, height: 48, borderRadius: '50%',
          background: color,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#fff', fontFamily: 'var(--f-display)', fontWeight: 900,
          fontSize: 20, flexShrink: 0,
        }}>
          {companyName.charAt(0).toUpperCase()}
        </div>
        <div>
          <h1 style={{
            fontFamily: 'var(--f-display)', fontWeight: 700, fontSize: 20,
            color: 'var(--ink)', margin: 0, lineHeight: 1.2,
          }}>
            {companyName}
          </h1>
          {firstServiceName && (
            <p style={{
              fontFamily: 'var(--f-mono)', fontSize: 10, letterSpacing: '0.12em',
              textTransform: 'uppercase', color: 'var(--muted)', marginTop: 3,
            }}>
              {firstServiceName}
            </p>
          )}
        </div>
      </div>

      <div style={{ maxWidth: 480, margin: '0 auto', padding: '0 0 80px' }}>
        <BookingWizard
          clientId={clientId}
          config={config}
          companyName={companyName}
          color={color}
          configId={params.id}
          introEmoji={introEmoji}
          introTagline={introTagline}
          introStyle={introStyle}
          depositsEnabled={depositsEnabled}
          instagram={instagram}
          ownerPhone={ownerPhone}
        />
      </div>
    </div>
  )
}
