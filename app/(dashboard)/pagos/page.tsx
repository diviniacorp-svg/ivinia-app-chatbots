'use client'
import { useState } from 'react'
import { ExternalLink, Copy, Check } from 'lucide-react'

interface PaymentLink {
  id: string
  init_point: string
  preference_id: string
  title: string
  amount: number
}

const PLANES = [
  // Mantenimiento mensual
  { value: 50000,  label: 'Plan Básico — $50.000/mes',                 plan: 'basic' },
  { value: 100000, label: 'Plan Pro — $100.000/mes',                   plan: 'pro' },
  { value: 200000, label: 'Plan Enterprise — $200.000/mes',            plan: 'enterprise' },
  // IA & Chatbots
  { value: 150000, label: 'Chatbot WhatsApp básico — $150.000',        plan: 'one-time' },
  { value: 250000, label: 'Chatbot WhatsApp pro — $250.000',           plan: 'one-time' },
  // Automatizaciones
  { value: 120000, label: 'Automatización de proceso — $120.000',      plan: 'one-time' },
  { value: 300000, label: 'Pack 3 automatizaciones — $300.000',        plan: 'one-time' },
  { value: 350000, label: 'Automatización ventas completa — $350.000', plan: 'one-time' },
  { value: 800000, label: 'Sistema multi-agente — $800.000',           plan: 'one-time' },
  // Web & Apps
  { value: 100000, label: 'Landing page — $100.000',                   plan: 'one-time' },
  { value: 300000, label: 'Sitio web completo — $300.000',             plan: 'one-time' },
  { value: 400000, label: 'Dashboard/panel admin — $400.000',          plan: 'one-time' },
  // Auditoría & Consultoría
  { value: 80000,  label: 'Auditoría digital completa — $80.000',      plan: 'one-time' },
  { value: 150000, label: 'Auditoría + plan de acción — $150.000',     plan: 'one-time' },
  // Content Factory
  { value: 80000,  label: 'Pack 30 posts/mes redes — $80.000/mes',     plan: 'monthly' },
  { value: 120000, label: 'Pack 10 posts + 4 videos — $120.000/mes',   plan: 'monthly' },
  { value: 150000, label: 'Gestión completa redes — $150.000/mes',     plan: 'monthly' },
  // Avatares IA
  { value: 200000, label: 'Avatar corporativo — $200.000',             plan: 'one-time' },
  { value: 350000, label: 'Avatar + chatbot integrado — $350.000',     plan: 'one-time' },
  // Adelantos
  { value: 40000,  label: 'Adelanto 50% — Auditoría $80k',            plan: 'deposit' },
  { value: 75000,  label: 'Adelanto 50% — Chatbot básico $150k',      plan: 'deposit' },
  { value: 50000,  label: 'Adelanto 50% — Landing page $100k',        plan: 'deposit' },
]

const inputStyle: React.CSSProperties = {
  width: '100%',
  border: '1px solid var(--line)',
  borderRadius: 10,
  padding: '10px 12px',
  fontSize: 13,
  outline: 'none',
  background: 'var(--paper)',
  color: 'var(--ink)',
  boxSizing: 'border-box',
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontFamily: 'var(--f-mono)',
  fontSize: 10,
  letterSpacing: '0.1em',
  textTransform: 'uppercase',
  color: 'var(--muted)',
  marginBottom: 4,
}

export default function PagosPage() {
  const [form, setForm] = useState({
    title: PLANES[0].label,
    amount: PLANES[0].value,
    clientEmail: '',
    clientName: '',
    externalRef: '',
  })
  const [loading, setLoading] = useState(false)
  const [link, setLink] = useState<PaymentLink | null>(null)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  async function createLink(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/mercadopago/create-preference', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Error al crear link')
      setLink(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error')
    } finally {
      setLoading(false)
    }
  }

  function copyLink() {
    if (link?.init_point) {
      navigator.clipboard.writeText(link.init_point)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div style={{ background: 'var(--paper-2)', minHeight: '100vh' }}>

      {/* Page header */}
      <div style={{ padding: '28px 32px 20px', borderBottom: '1px solid var(--line)', background: 'var(--paper)' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
          <div>
            <p style={{ fontFamily: 'var(--f-mono)', fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 6 }}>
              DIVINIA OS · Ventas
            </p>
            <h1 style={{ fontFamily: 'var(--f-display)', fontWeight: 700, fontSize: 28, color: 'var(--ink)', margin: 0, letterSpacing: '-0.02em' }}>
              Generar Link de Pago
            </h1>
            <p style={{ fontFamily: 'var(--f-display)', fontSize: 13, color: 'var(--muted-2)', marginTop: 6 }}>
              Generá links de cobro con MercadoPago · cobro en 50% adelanto / 50% entrega
            </p>
          </div>
        </div>
      </div>

      <div style={{ padding: '24px 32px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, maxWidth: 1000 }}>
        {/* Form */}
        <div style={{
          background: 'var(--paper)',
          borderRadius: 16,
          border: '1px solid var(--line)',
          padding: 24,
        }}>
          <h2 style={{ fontFamily: 'var(--f-display)', fontWeight: 700, color: 'var(--ink)', marginBottom: 20, fontSize: 16 }}>
            Generar link de cobro
          </h2>
          <form onSubmit={createLink} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={labelStyle}>Servicio / Plan</label>
              <select
                value={form.amount}
                onChange={e => {
                  const plan = PLANES.find(p => p.value === Number(e.target.value))
                  setForm(prev => ({ ...prev, amount: Number(e.target.value), title: plan?.label || '' }))
                }}
                style={inputStyle}
              >
                {PLANES.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
              </select>
            </div>

            <div>
              <label style={labelStyle}>Descripción personalizada</label>
              <input
                type="text"
                value={form.title}
                onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                style={inputStyle}
              />
            </div>

            <div>
              <label style={labelStyle}>Monto (ARS)</label>
              <input
                type="number"
                value={form.amount}
                onChange={e => setForm(p => ({ ...p, amount: Number(e.target.value) }))}
                style={inputStyle}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={labelStyle}>Email del cliente</label>
                <input
                  type="email"
                  value={form.clientEmail}
                  onChange={e => setForm(p => ({ ...p, clientEmail: e.target.value }))}
                  placeholder="opcional"
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>Nombre del cliente</label>
                <input
                  type="text"
                  value={form.clientName}
                  onChange={e => setForm(p => ({ ...p, clientName: e.target.value }))}
                  placeholder="opcional"
                  style={inputStyle}
                />
              </div>
            </div>

            {error && (
              <div style={{
                fontSize: 13, color: '#dc2626', background: '#fee2e2',
                padding: '10px 12px', borderRadius: 10,
              }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                background: 'var(--ink)', color: 'var(--paper)',
                borderRadius: 10, border: 'none', cursor: 'pointer',
                fontFamily: 'var(--f-mono)', fontSize: 11,
                letterSpacing: '0.08em', textTransform: 'uppercase',
                padding: '14px 0',
                opacity: loading ? 0.5 : 1,
              }}
            >
              {loading ? 'Generando...' : 'Generar link de pago'}
            </button>
          </form>
        </div>

        {/* Result */}
        {link ? (
          <div style={{
            background: 'var(--paper)',
            borderRadius: 16,
            border: '1px solid var(--line)',
            padding: 24,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
              <div style={{
                width: 40, height: 40, borderRadius: 10,
                background: 'rgba(198,255,61,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20,
              }}>
                💳
              </div>
              <div>
                <h3 style={{ fontFamily: 'var(--f-display)', fontWeight: 700, color: 'var(--ink)', margin: 0 }}>
                  Link generado
                </h3>
                <p style={{ fontSize: 12, color: 'var(--muted)', margin: 0 }}>Listo para enviar al cliente</p>
              </div>
            </div>

            <div style={{
              background: 'var(--paper-2)', borderRadius: 12, padding: 16, marginBottom: 12,
              border: '1px solid var(--line)',
            }}>
              <p style={{ ...labelStyle, marginBottom: 6 }}>Monto</p>
              <p style={{
                fontFamily: 'var(--f-display)', fontStyle: 'italic', fontWeight: 900,
                fontSize: 32, letterSpacing: '-0.04em', color: 'var(--ink)', margin: 0,
              }}>
                ${link.amount.toLocaleString('es-AR')}
                <span style={{ fontSize: 14, fontWeight: 400, marginLeft: 4, fontStyle: 'normal' }}>ARS</span>
              </p>
            </div>

            <div style={{
              background: 'var(--paper-2)', borderRadius: 12, padding: 16, marginBottom: 16,
              border: '1px solid var(--line)',
            }}>
              <p style={{ ...labelStyle, marginBottom: 8 }}>Link de pago</p>
              <p style={{
                fontSize: 11, color: 'var(--muted)', wordBreak: 'break-all',
                lineHeight: 1.6, marginBottom: 12, fontFamily: 'var(--f-mono)',
              }}>
                {link.init_point}
              </p>
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  onClick={copyLink}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    fontFamily: 'var(--f-mono)', fontSize: 10, letterSpacing: '0.06em',
                    textTransform: 'uppercase', color: 'var(--paper)',
                    background: 'var(--ink)', borderRadius: 8, padding: '8px 14px',
                    border: 'none', cursor: 'pointer',
                  }}
                >
                  {copied ? <><Check size={11} /> Copiado</> : <><Copy size={11} /> Copiar link</>}
                </button>
                <a
                  href={link.init_point}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    fontFamily: 'var(--f-mono)', fontSize: 10, letterSpacing: '0.06em',
                    textTransform: 'uppercase', color: 'var(--ink)',
                    border: '1px solid var(--line)', borderRadius: 8, padding: '8px 14px',
                    textDecoration: 'none',
                  }}
                >
                  <ExternalLink size={11} /> Abrir
                </a>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {[
                'Acepta tarjeta débito, crédito y Mercado Crédito',
                'Se acredita en tu cuenta de MercadoPago',
                'El cliente recibe comprobante automático',
              ].map(item => (
                <p key={item} style={{
                  fontSize: 11, color: 'var(--muted)', fontFamily: 'var(--f-mono)',
                  display: 'flex', alignItems: 'center', gap: 6, margin: 0,
                }}>
                  <Check size={11} style={{ color: 'var(--lime)', flexShrink: 0 }} /> {item}
                </p>
              ))}
            </div>
          </div>
        ) : (
          <div style={{
            background: 'var(--paper)',
            borderRadius: 16,
            border: '1px dashed var(--line)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            minHeight: 200,
          }}>
            <p style={{ color: 'var(--muted)', fontSize: 13, textAlign: 'center', fontFamily: 'var(--f-mono)' }}>
              Completá el formulario para generar<br />el link de cobro con MercadoPago
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
