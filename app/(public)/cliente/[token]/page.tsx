'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'

interface PortalData {
  cliente: {
    id: string
    nombre: string
    email: string
    plan: string
    estado: string
    mrr: number
    creado: string
  }
  turnero: {
    url: string
    panel_url: string | null
    panel_pin: string | null
    qr_url: string | null
  } | null
  suscripcion: {
    plan: string
    estado: string
    monto_ars: number
    desde: string
  } | null
  turnos_este_mes: Array<{
    id: string
    date: string
    time: string
    service_name: string
    status: string
    customer_name: string
  }>
  soporte_wa: string
}

const LIME = '#C6FF3D'
const INK = '#09090B'
const PAPER = '#F6F5F2'

function StatusPill({ estado }: { estado: string }) {
  const map: Record<string, { label: string; bg: string; color: string }> = {
    active:          { label: 'Activo',          bg: '#dcfce7', color: '#16a34a' },
    trial:           { label: 'En prueba',        bg: '#fef9c3', color: '#ca8a04' },
    pending_payment: { label: 'Pago pendiente',   bg: '#fee2e2', color: '#dc2626' },
    inactive:        { label: 'Inactivo',         bg: '#f4f4f5', color: '#71717a' },
    authorized:      { label: 'Autorizado',       bg: '#dcfce7', color: '#16a34a' },
  }
  const s = map[estado] ?? { label: estado, bg: '#f4f4f5', color: '#52525b' }
  return (
    <span style={{
      background: s.bg, color: s.color, border: `1px solid ${s.color}30`,
      borderRadius: 100, padding: '3px 12px',
      fontFamily: 'var(--f-mono)', fontSize: 10, letterSpacing: '0.06em',
      fontWeight: 700, textTransform: 'uppercase',
    }}>
      {s.label}
    </span>
  )
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <button
      onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000) }}
      style={{
        background: copied ? '#dcfce7' : PAPER, border: '1px solid #E4E4E7',
        borderRadius: 7, padding: '5px 12px', cursor: 'pointer',
        fontFamily: 'var(--f-mono)', fontSize: 10, color: copied ? '#16a34a' : '#52525B',
        letterSpacing: '0.04em',
      }}
    >
      {copied ? '✓ Copiado' : 'Copiar'}
    </button>
  )
}

export default function ClientePortalPage() {
  const params = useParams()
  const token = params?.token as string

  const [data, setData] = useState<PortalData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!token) return
    fetch(`/api/cliente/portal?token=${token}`)
      .then(r => r.json())
      .then(d => {
        if (d.error) setError(d.error)
        else setData(d)
      })
      .catch(() => setError('Error al cargar tu portal'))
      .finally(() => setLoading(false))
  }, [token])

  if (loading) return (
    <div style={{ minHeight: '100vh', background: PAPER, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: 36, height: 36, border: '3px solid #E4E4E7', borderTopColor: INK, borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
        <p style={{ fontFamily: 'var(--f-mono)', fontSize: 12, color: '#71717A' }}>Cargando tu portal...</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      </div>
    </div>
  )

  if (error || !data) return (
    <div style={{ minHeight: '100vh', background: PAPER, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center', maxWidth: 400, padding: 24 }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
        <h1 style={{ fontFamily: 'var(--f-display)', fontWeight: 700, fontSize: 22, marginBottom: 8 }}>Link inválido</h1>
        <p style={{ fontFamily: 'var(--f-display)', fontSize: 14, color: '#52525B', marginBottom: 24, lineHeight: 1.5 }}>
          {error || 'No encontramos tu cuenta. Verificá que el link sea correcto o contactá a soporte.'}
        </p>
        <a href="https://wa.me/5492665286110?text=Hola%2C%20no%20puedo%20acceder%20a%20mi%20portal" target="_blank" rel="noopener noreferrer"
          style={{ display: 'inline-block', background: INK, color: LIME, borderRadius: 10, padding: '11px 24px', fontFamily: 'var(--f-mono)', fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textDecoration: 'none' }}>
          Contactar soporte →
        </a>
      </div>
    </div>
  )

  const { cliente, turnero, suscripcion, turnos_este_mes, soporte_wa } = data

  const turnosConfirmados = turnos_este_mes.filter(t => t.status !== 'cancelled').length

  return (
    <div style={{ minHeight: '100vh', background: PAPER, fontFamily: 'var(--f-display)' }}>

      {/* Header */}
      <div style={{ background: INK, padding: '20px 24px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <p style={{ fontFamily: 'var(--f-mono)', fontSize: 9, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', marginBottom: 3 }}>
              Portal del cliente · DIVINIA
            </p>
            <h1 style={{ fontFamily: 'var(--f-display)', fontWeight: 700, fontSize: 22, color: '#fff', margin: 0, letterSpacing: '-0.02em' }}>
              {cliente.nombre}
            </h1>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <StatusPill estado={cliente.estado} />
            <a href={soporte_wa} target="_blank" rel="noopener noreferrer"
              style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#25D366', color: '#fff', borderRadius: 8, padding: '7px 14px', fontFamily: 'var(--f-mono)', fontSize: 10, fontWeight: 700, textDecoration: 'none' }}>
              💬 Soporte
            </a>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '28px 24px', display: 'flex', flexDirection: 'column', gap: 20 }}>

        {/* KPIs rápidos */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12 }}>
          {[
            { label: 'Plan', value: cliente.plan || '—', icon: '📋' },
            { label: 'Turnos este mes', value: turnosConfirmados, icon: '📅', highlight: turnosConfirmados > 0 },
            { label: 'Suscripción', value: suscripcion?.estado === 'active' || suscripcion?.estado === 'authorized' ? 'Al día' : suscripcion?.estado ?? '—', icon: '💳' },
            { label: 'Cliente desde', value: new Date(cliente.creado).toLocaleDateString('es-AR', { month: 'long', year: 'numeric' }), icon: '📆' },
          ].map(k => (
            <div key={k.label} style={{ background: '#fff', borderRadius: 14, border: '1px solid #E4E4E7', padding: '16px 18px' }}>
              <div style={{ fontFamily: 'var(--f-mono)', fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#71717A', marginBottom: 6 }}>
                {k.icon} {k.label}
              </div>
              <div style={{ fontFamily: 'var(--f-mono)', fontWeight: 700, fontSize: 18, color: (k as any).highlight ? '#16a34a' : INK, letterSpacing: '-0.02em' }}>
                {k.value}
              </div>
            </div>
          ))}
        </div>

        {/* Turnero */}
        {turnero ? (
          <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #E4E4E7', padding: '20px 24px' }}>
            <h2 style={{ fontFamily: 'var(--f-mono)', fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#71717A', marginBottom: 16 }}>
              📅 Tu Turnero
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: 16, alignItems: 'start' }}>
              {/* Link público */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div>
                  <p style={{ fontFamily: 'var(--f-mono)', fontSize: 9, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#71717A', marginBottom: 6 }}>
                    Link para tus clientes
                  </p>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                    <a href={turnero.url} target="_blank" rel="noopener noreferrer"
                      style={{ fontFamily: 'var(--f-mono)', fontSize: 11, color: '#2563EB', textDecoration: 'underline', wordBreak: 'break-all' }}>
                      {turnero.url}
                    </a>
                    <CopyButton text={turnero.url} />
                  </div>
                </div>
                {turnero.panel_url && (
                  <div>
                    <p style={{ fontFamily: 'var(--f-mono)', fontSize: 9, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#71717A', marginBottom: 6 }}>
                      Panel del negocio
                    </p>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                      <a href={turnero.panel_url} target="_blank" rel="noopener noreferrer"
                        style={{ background: INK, color: LIME, borderRadius: 8, padding: '7px 16px', fontFamily: 'var(--f-mono)', fontSize: 10, fontWeight: 700, letterSpacing: '0.06em', textDecoration: 'none' }}>
                        Abrir panel →
                      </a>
                      {turnero.panel_pin && (
                        <span style={{ fontFamily: 'var(--f-mono)', fontSize: 11, background: PAPER, border: '1px solid #E4E4E7', borderRadius: 7, padding: '5px 12px', letterSpacing: '0.1em', color: INK }}>
                          PIN: {turnero.panel_pin}
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* QR */}
              {turnero.qr_url && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <p style={{ fontFamily: 'var(--f-mono)', fontSize: 9, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#71717A' }}>
                    QR para imprimir
                  </p>
                  <img src={turnero.qr_url} alt="QR Turnero" style={{ width: 120, height: 120, borderRadius: 12, border: '1px solid #E4E4E7' }} />
                  <a href={turnero.qr_url} download="turnero-qr.png"
                    style={{ fontFamily: 'var(--f-mono)', fontSize: 10, color: '#2563EB', textDecoration: 'underline' }}>
                    Descargar QR
                  </a>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div style={{ background: '#fff', borderRadius: 16, border: '2px dashed #E4E4E7', padding: '28px 24px', textAlign: 'center' }}>
            <p style={{ fontFamily: 'var(--f-display)', fontSize: 14, color: '#52525B', margin: 0 }}>
              Tu Turnero está siendo configurado. Recibirás el link en los próximos minutos.
            </p>
          </div>
        )}

        {/* Turnos del mes */}
        {turnos_este_mes.length > 0 && (
          <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #E4E4E7', padding: '20px 24px' }}>
            <h2 style={{ fontFamily: 'var(--f-mono)', fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#71717A', marginBottom: 16 }}>
              📋 Turnos este mes ({turnosConfirmados} confirmados)
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {turnos_este_mes.slice(0, 10).map((t, i) => (
                <div key={t.id} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap',
                  padding: '10px 0', borderBottom: i < Math.min(turnos_este_mes.length, 10) - 1 ? '1px solid #F4F4F5' : 'none', gap: 8,
                }}>
                  <div>
                    <div style={{ fontFamily: 'var(--f-display)', fontWeight: 600, fontSize: 13, color: INK }}>{t.customer_name || 'Cliente'}</div>
                    <div style={{ fontFamily: 'var(--f-mono)', fontSize: 9, color: '#71717A', textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: 2 }}>
                      {t.service_name} · {t.date} {t.time}
                    </div>
                  </div>
                  <StatusPill estado={t.status} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Soporte */}
        <div style={{ background: INK, borderRadius: 16, padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <p style={{ fontFamily: 'var(--f-display)', fontWeight: 700, fontSize: 15, color: '#fff', margin: '0 0 4px' }}>
              ¿Necesitás algo?
            </p>
            <p style={{ fontFamily: 'var(--f-display)', fontSize: 13, color: 'rgba(246,245,242,0.5)', margin: 0 }}>
              Escribinos por WhatsApp y respondemos en minutos.
            </p>
          </div>
          <a href={soporte_wa} target="_blank" rel="noopener noreferrer"
            style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#25D366', color: '#fff', borderRadius: 10, padding: '11px 22px', fontFamily: 'var(--f-mono)', fontWeight: 700, fontSize: 11, letterSpacing: '0.08em', textDecoration: 'none' }}>
            💬 Hablar con Joaco →
          </a>
        </div>

      </div>

      <footer style={{ textAlign: 'center', padding: '20px 24px', borderTop: '1px solid #E4E4E7' }}>
        <Link href="/" style={{ fontFamily: 'var(--f-mono)', fontSize: 10, color: '#A1A1AA', textDecoration: 'none', letterSpacing: '0.08em' }}>
          Powered by DIVINIA ◉
        </Link>
      </footer>
    </div>
  )
}
