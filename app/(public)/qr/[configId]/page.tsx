/**
 * /qr/[configId] — Página imprimible con QR personalizado por negocio
 * Para pegar en vidriera, mostrador o repartir en flyers.
 */
import { notFound } from 'next/navigation'
import QRCode from 'qrcode'
import { createClient } from '@supabase/supabase-js'
import { PrintButton } from './PrintButton'

export const dynamic = 'force-dynamic'

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

async function getConfig(configId: string) {
  const { data } = await getSupabase()
    .from('booking_configs')
    .select('business_name, accent_color, logo_url')
    .eq('config_id', configId)
    .limit(1)
  return data?.[0] ?? null
}

export default async function QRPage({ params }: { params: { configId: string } }) {
  const { configId } = params
  const config = await getConfig(configId)

  if (!config) notFound()

  const reservasUrl = `https://divinia.vercel.app/reservas/${configId}`
  const accent = config.accent_color ?? '#4f46e5'

  const qrDataUrl = await QRCode.toDataURL(reservasUrl, {
    width: 400,
    margin: 2,
    color: {
      dark: accent,
      light: '#ffffff',
    },
    errorCorrectionLevel: 'H',
  })

  return (
    <>
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; }
          .card {
            box-shadow: none !important;
            border: none !important;
            margin: 0 auto !important;
          }
        }
        body { background: #f8f8f8; }
      `}</style>

      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}>
        <div className="card" style={{
          background: 'white',
          borderRadius: 24,
          padding: '40px 36px',
          maxWidth: 420,
          width: '100%',
          textAlign: 'center',
          boxShadow: '0 4px 24px rgba(0,0,0,0.10)',
          border: '1px solid #e5e7eb',
        }}>
          {/* Badge */}
          <div style={{
            display: 'inline-block',
            background: `${accent}15`,
            color: accent,
            border: `1px solid ${accent}40`,
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            padding: '6px 16px',
            borderRadius: 999,
            marginBottom: 20,
          }}>
            📅 Reserva tu turno
          </div>

          {/* Nombre del negocio */}
          <div style={{ fontSize: 28, fontWeight: 900, color: '#111827', marginBottom: 6, letterSpacing: -0.5 }}>
            {config.business_name}
          </div>
          <div style={{ fontSize: 15, color: '#6b7280', marginBottom: 28 }}>
            Escaneá el código y reservá en segundos
          </div>

          {/* QR */}
          <div style={{
            background: 'white',
            borderRadius: 20,
            padding: 16,
            display: 'inline-block',
            border: `2px solid ${accent}25`,
            marginBottom: 28,
          }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={qrDataUrl} alt={`QR para ${config.business_name}`} style={{ width: 220, height: 220, display: 'block' }} />
          </div>

          {/* CTA pill */}
          <div style={{
            display: 'inline-block',
            background: accent,
            color: 'white',
            fontSize: 16,
            fontWeight: 800,
            padding: '14px 32px',
            borderRadius: 14,
            marginBottom: 12,
          }}>
            📱 Reservar turno online
          </div>

          {/* URL */}
          <div style={{ fontSize: 11, color: '#9ca3af', wordBreak: 'break-all', marginBottom: 20 }}>
            {reservasUrl}
          </div>

          {/* Divider */}
          <div style={{ height: 1, background: '#f3f4f6', margin: '16px 0' }} />

          {/* Footer */}
          <div style={{ fontSize: 11, color: '#d1d5db', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
            Powered by Turnero · divinia.vercel.app
          </div>

          {/* Botones (solo en pantalla, no imprime) */}
          <div className="no-print">
            <PrintButton accent={accent} />
            <div style={{ marginTop: 12 }}>
              <a
                href={reservasUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{ fontSize: 13, color: accent, fontWeight: 600, textDecoration: 'none' }}
              >
                Ver página de reservas →
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export async function generateMetadata({ params }: { params: { configId: string } }) {
  const config = await getConfig(params.configId)
  return {
    title: config ? `QR Turnero — ${config.business_name}` : 'QR Turnero',
  }
}
