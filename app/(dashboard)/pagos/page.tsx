'use client'
import { useState } from 'react'
import { ExternalLink, Copy, Check, MessageCircle, Clock, Trash2 } from 'lucide-react'

interface PaymentLink {
  id?: string
  init_point: string
  preference_id?: string
  title: string
  amount: number
  clientName?: string
  clientPhone?: string
  createdAt?: string
}

const PLANES = [
  // ── TURNERO
  { value: 45000,  label: 'Turnero — Mensual ($45.000/mes)',             group: 'Turnero' },
  { value: 35000,  label: 'Turnero — Anual ($35.000/mes × 12)',          group: 'Turnero' },
  { value: 120000, label: 'Turnero — Pago Único ($120.000)',             group: 'Turnero' },
  { value: 60000,  label: 'Adelanto 50% — Turnero único $120k',         group: 'Turnero' },
  // ── CENTRAL IA
  { value: 90000,  label: 'Central IA Básico ($90.000/mes)',             group: 'Central IA' },
  { value: 150000, label: 'Central IA Pro ($150.000/mes)',               group: 'Central IA' },
  { value: 180000, label: 'Central IA — Setup Único ($180.000)',         group: 'Central IA' },
  { value: 90000,  label: 'Adelanto 50% — Central IA setup $180k',      group: 'Central IA' },
  // ── CONTENT FACTORY
  { value: 80000,  label: 'Content Factory Starter ($80.000/mes)',       group: 'Content Factory' },
  { value: 120000, label: 'Content Factory Crecimiento ($120.000/mes)',  group: 'Content Factory' },
  { value: 150000, label: 'Content Factory Gestión Total ($150.000/mes)',group: 'Content Factory' },
  // ── TODO DIVINIA
  { value: 120000, label: 'Todo DIVINIA — Bundle Mensual ($120.000/mes)',group: 'Todo DIVINIA' },
  { value: 280000, label: 'Todo DIVINIA — Pago Único ($280.000)',        group: 'Todo DIVINIA' },
  { value: 140000, label: 'Adelanto 50% — Todo DIVINIA único $280k',    group: 'Todo DIVINIA' },
  // ── PROYECTOS
  { value: 100000, label: 'Landing page ($100.000)',                     group: 'Proyectos' },
  { value: 50000,  label: 'Adelanto 50% — Landing $100k',               group: 'Proyectos' },
  { value: 120000, label: 'Automatización de proceso ($120.000)',        group: 'Proyectos' },
  { value: 300000, label: 'Pack 3 automatizaciones ($300.000)',          group: 'Proyectos' },
  { value: 400000, label: 'CRM con IA ($400.000)',                       group: 'Proyectos' },
  { value: 350000, label: 'Automatización de ventas ($350.000)',         group: 'Proyectos' },
  // ── AVATARES
  { value: 200000, label: 'Avatar IA corporativo ($200.000)',            group: 'Avatares' },
  { value: 600000, label: 'Avatar IA premium + videos ($600.000)',       group: 'Avatares' },
  // ── NUCLEUS
  { value: 800000, label: 'NUCLEUS — Sistema multi-agente ($800.000+)', group: 'NUCLEUS' },
]

const inputStyle: React.CSSProperties = {
  width: '100%',
  border: '1px solid var(--line)',
  borderRadius: 9,
  padding: '9px 12px',
  fontSize: 13,
  outline: 'none',
  background: 'var(--paper)',
  color: 'var(--ink)',
  boxSizing: 'border-box',
  fontFamily: 'var(--f-display)',
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontFamily: 'var(--f-mono)',
  fontSize: 9.5,
  letterSpacing: '0.1em',
  textTransform: 'uppercase',
  color: 'var(--muted)',
  marginBottom: 4,
}

function ars(n: number) {
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0 }).format(n)
}

function waMessage(link: PaymentLink) {
  const name = link.clientName ? `Hola ${link.clientName}!` : 'Hola!'
  return `${name} Te comparto el link de pago de DIVINIA.\n\n*${link.title}*\n💰 ${ars(link.amount)}\n\n👉 ${link.init_point}\n\nAny duda me avisás. Saludos, Joaco de DIVINIA 🤖`
}

function waLink(phone: string, message: string) {
  const clean = phone.replace(/\D/g, '')
  const num = clean.startsWith('549') ? clean : clean.startsWith('54') ? clean : `549${clean}`
  return `https://wa.me/${num}?text=${encodeURIComponent(message)}`
}

export default function PagosPage() {
  const [form, setForm] = useState({
    title: PLANES[0].label,
    amount: PLANES[0].value,
    clientEmail: '',
    clientName: '',
    clientPhone: '',
    externalRef: '',
  })
  const [loading, setLoading] = useState(false)
  const [currentLink, setCurrentLink] = useState<PaymentLink | null>(null)
  const [history, setHistory] = useState<PaymentLink[]>([])
  const [error, setError] = useState('')
  const [copied, setCopied] = useState<string | null>(null)

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
      const newLink: PaymentLink = {
        ...data,
        title: form.title,
        amount: form.amount,
        clientName: form.clientName,
        clientPhone: form.clientPhone,
        createdAt: new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }),
      }
      setCurrentLink(newLink)
      setHistory(h => [newLink, ...h].slice(0, 8))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error')
    } finally {
      setLoading(false)
    }
  }

  function copyText(text: string, key: string) {
    navigator.clipboard.writeText(text)
    setCopied(key)
    setTimeout(() => setCopied(null), 2000)
  }

  function removeFromHistory(i: number) {
    setHistory(h => h.filter((_, idx) => idx !== i))
  }

  return (
    <div style={{ background: 'var(--paper-2)', minHeight: '100vh' }}>

      {/* Header */}
      <div style={{ padding: '20px 28px 16px', borderBottom: '1px solid var(--line)', background: 'var(--paper)' }}>
        <p style={{ fontFamily: 'var(--f-mono)', fontSize: 9, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 4 }}>
          DIVINIA OS · Ventas
        </p>
        <h1 style={{ fontFamily: 'var(--f-display)', fontWeight: 700, fontSize: 28, color: 'var(--ink)', margin: 0, letterSpacing: '-0.02em' }}>
          Pagos
        </h1>
        <p style={{ fontFamily: 'var(--f-display)', fontSize: 13, color: 'var(--muted-2)', marginTop: 4 }}>
          Generá links de cobro con MercadoPago · 50% adelanto / 50% entrega
        </p>
      </div>

      <div style={{ padding: '20px 28px', display: 'grid', gridTemplateColumns: '400px 1fr', gap: 20, maxWidth: 1100 }}>

        {/* ── Formulario ──────────────────────────────── */}
        <div style={{ background: 'var(--paper)', borderRadius: 14, border: '1px solid var(--line)', padding: 22 }}>
          <h2 style={{ fontFamily: 'var(--f-display)', fontWeight: 700, color: 'var(--ink)', marginBottom: 18, fontSize: 15, margin: '0 0 18px' }}>
            Nuevo link de cobro
          </h2>
          <form onSubmit={createLink} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

            <div>
              <label style={labelStyle}>Servicio / Plan</label>
              <select
                value={form.amount + '|' + form.title}
                onChange={e => {
                  const [amt, ...rest] = e.target.value.split('|')
                  const plan = PLANES.find(p => p.value === Number(amt) && p.label === rest.join('|'))
                  setForm(prev => ({ ...prev, amount: Number(amt), title: plan?.label || rest.join('|') }))
                }}
                style={inputStyle}
              >
                {Array.from(new Set(PLANES.map(p => p.group))).map(group => (
                  <optgroup key={group} label={group}>
                    {PLANES.filter(p => p.group === group).map(p => (
                      <option key={p.label} value={`${p.value}|${p.label}`}>{p.label}</option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div>
                <label style={labelStyle}>Monto personalizado (ARS)</label>
                <input
                  type="number"
                  value={form.amount}
                  onChange={e => setForm(p => ({ ...p, amount: Number(e.target.value) }))}
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>Descripción</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                  style={inputStyle}
                />
              </div>
            </div>

            <div>
              <label style={labelStyle}>Nombre del cliente</label>
              <input
                type="text"
                value={form.clientName}
                onChange={e => setForm(p => ({ ...p, clientName: e.target.value }))}
                placeholder="Nombre del negocio o persona"
                style={inputStyle}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div>
                <label style={labelStyle}>WhatsApp del cliente</label>
                <input
                  type="tel"
                  value={form.clientPhone}
                  onChange={e => setForm(p => ({ ...p, clientPhone: e.target.value }))}
                  placeholder="+54 9 266 ..."
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>Email (opcional)</label>
                <input
                  type="email"
                  value={form.clientEmail}
                  onChange={e => setForm(p => ({ ...p, clientEmail: e.target.value }))}
                  placeholder="opcional"
                  style={inputStyle}
                />
              </div>
            </div>

            {error && (
              <div style={{ fontSize: 13, color: '#dc2626', background: '#fee2e2', padding: '10px 12px', borderRadius: 9 }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%', background: 'var(--ink)', color: 'var(--paper)',
                borderRadius: 9, border: 'none', cursor: 'pointer',
                fontFamily: 'var(--f-mono)', fontSize: 10.5, letterSpacing: '0.08em', textTransform: 'uppercase',
                padding: '13px 0', opacity: loading ? 0.5 : 1,
              }}
            >
              {loading ? 'Generando...' : '💳 Generar link de pago'}
            </button>
          </form>
        </div>

        {/* ── Resultado + Historial ────────────────────── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

          {/* Link generado */}
          {currentLink ? (
            <div style={{ background: 'var(--paper)', borderRadius: 14, border: '1px solid var(--line)', padding: 22 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                <div style={{ width: 36, height: 36, borderRadius: 9, background: 'rgba(198,255,61,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>
                  💳
                </div>
                <div>
                  <h3 style={{ fontFamily: 'var(--f-display)', fontWeight: 700, color: 'var(--ink)', margin: 0, fontSize: 14 }}>
                    Link generado ✓
                  </h3>
                  <p style={{ fontSize: 11, color: 'var(--muted)', margin: 0, fontFamily: 'var(--f-mono)' }}>
                    Listo para enviar al cliente
                  </p>
                </div>
              </div>

              {/* Monto */}
              <div style={{ background: 'var(--paper-2)', borderRadius: 10, padding: '12px 16px', marginBottom: 10 }}>
                <p style={{ ...labelStyle, marginBottom: 3 }}>Monto</p>
                <p style={{ fontFamily: 'var(--f-display)', fontStyle: 'italic', fontWeight: 900, fontSize: 28, letterSpacing: '-0.04em', color: 'var(--ink)', margin: 0 }}>
                  {ars(currentLink.amount)}<span style={{ fontSize: 13, fontWeight: 400, marginLeft: 4, fontStyle: 'normal', color: 'var(--muted)' }}>ARS</span>
                </p>
                <p style={{ fontFamily: 'var(--f-mono)', fontSize: 9.5, color: 'var(--muted)', margin: '4px 0 0' }}>{currentLink.title}</p>
              </div>

              {/* Link + actions */}
              <div style={{ background: 'var(--paper-2)', borderRadius: 10, padding: '12px 16px', marginBottom: 12 }}>
                <p style={{ ...labelStyle, marginBottom: 6 }}>Link de pago</p>
                <p style={{ fontSize: 10.5, color: 'var(--muted)', wordBreak: 'break-all', lineHeight: 1.6, marginBottom: 10, fontFamily: 'var(--f-mono)' }}>
                  {currentLink.init_point}
                </p>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <button
                    onClick={() => copyText(currentLink.init_point, 'link')}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 6,
                      fontFamily: 'var(--f-mono)', fontSize: 9.5, letterSpacing: '0.06em', textTransform: 'uppercase',
                      color: 'var(--paper)', background: 'var(--ink)', borderRadius: 7, padding: '7px 14px',
                      border: 'none', cursor: 'pointer',
                    }}
                  >
                    {copied === 'link' ? <><Check size={11} /> Copiado</> : <><Copy size={11} /> Copiar link</>}
                  </button>
                  <a href={currentLink.init_point} target="_blank" rel="noopener noreferrer" style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    fontFamily: 'var(--f-mono)', fontSize: 9.5, letterSpacing: '0.06em', textTransform: 'uppercase',
                    color: 'var(--ink)', border: '1px solid var(--line)', borderRadius: 7, padding: '7px 14px', textDecoration: 'none',
                  }}>
                    <ExternalLink size={11} /> Abrir
                  </a>
                </div>
              </div>

              {/* WA share */}
              <div style={{ borderTop: '1px solid var(--line)', paddingTop: 12 }}>
                <p style={{ ...labelStyle, marginBottom: 8 }}>Enviar al cliente</p>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {currentLink.clientPhone ? (
                    <a
                      href={waLink(currentLink.clientPhone, waMessage(currentLink))}
                      target="_blank" rel="noopener noreferrer"
                      style={{
                        display: 'flex', alignItems: 'center', gap: 7,
                        padding: '9px 18px', borderRadius: 9, background: '#25D366',
                        color: 'white', textDecoration: 'none',
                        fontFamily: 'var(--f-display)', fontWeight: 600, fontSize: 13,
                      }}
                    >
                      <MessageCircle size={15} /> WhatsApp directo
                    </a>
                  ) : (
                    <button
                      onClick={() => copyText(waMessage(currentLink), 'wa')}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 7,
                        padding: '9px 18px', borderRadius: 9, background: '#25D366',
                        color: 'white', border: 'none', cursor: 'pointer',
                        fontFamily: 'var(--f-display)', fontWeight: 600, fontSize: 13,
                      }}
                    >
                      {copied === 'wa' ? <><Check size={15} /> Mensaje copiado</> : <><Copy size={15} /> Copiar mensaje WA</>}
                    </button>
                  )}
                  <button
                    onClick={() => copyText(waMessage(currentLink), 'msg')}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 6,
                      padding: '9px 14px', borderRadius: 9, background: 'var(--paper-2)',
                      color: 'var(--ink)', border: '1px solid var(--line)', cursor: 'pointer',
                      fontFamily: 'var(--f-mono)', fontSize: 9.5, letterSpacing: '0.05em', textTransform: 'uppercase',
                    }}
                  >
                    {copied === 'msg' ? <><Check size={11} /> Copiado</> : <><Copy size={11} /> Copiar mensaje</>}
                  </button>
                </div>
                {/* Preview del mensaje */}
                <div style={{ marginTop: 10, background: 'var(--paper-2)', borderRadius: 8, padding: '10px 12px', border: '1px solid var(--line)' }}>
                  <p style={{ fontFamily: 'var(--f-mono)', fontSize: 9.5, color: 'var(--muted)', margin: 0, whiteSpace: 'pre-line', lineHeight: 1.6 }}>
                    {waMessage(currentLink)}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div style={{
              background: 'var(--paper)', borderRadius: 14, border: '1px dashed var(--line)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 180,
            }}>
              <p style={{ color: 'var(--muted)', fontSize: 13, textAlign: 'center', fontFamily: 'var(--f-mono)', lineHeight: 1.7 }}>
                Completá el formulario para generar<br />el link de cobro con MercadoPago
              </p>
            </div>
          )}

          {/* Historial de esta sesión */}
          {history.length > 1 && (
            <div style={{ background: 'var(--paper)', borderRadius: 14, border: '1px solid var(--line)', padding: '18px 20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 14 }}>
                <Clock size={13} style={{ color: 'var(--muted)' }} />
                <h3 style={{ fontFamily: 'var(--f-mono)', fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--muted)', margin: 0 }}>
                  Historial de esta sesión
                </h3>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {history.slice(1).map((item, i) => (
                  <div key={i + 1} style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '9px 12px', borderRadius: 8, background: 'var(--paper-2)',
                    border: '1px solid var(--line)',
                  }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontFamily: 'var(--f-display)', fontSize: 12, fontWeight: 600, color: 'var(--ink)', truncate: true } as React.CSSProperties}>
                        {item.clientName || 'Cliente'} — {ars(item.amount)}
                      </div>
                      <div style={{ fontFamily: 'var(--f-mono)', fontSize: 9.5, color: 'var(--muted)', marginTop: 1 }}>
                        {item.createdAt} · {item.title.slice(0, 40)}{item.title.length > 40 ? '…' : ''}
                      </div>
                    </div>
                    <button onClick={() => copyText(item.init_point, `hist-${i}`)} style={{
                      background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', display: 'flex', padding: 4,
                    }}>
                      {copied === `hist-${i}` ? <Check size={13} style={{ color: '#4ADE80' }} /> : <Copy size={13} />}
                    </button>
                    {item.clientPhone && (
                      <a href={waLink(item.clientPhone, waMessage(item))} target="_blank" rel="noopener noreferrer" style={{ color: '#25D366', display: 'flex', padding: 4 }}>
                        <MessageCircle size={13} />
                      </a>
                    )}
                    <button onClick={() => removeFromHistory(i + 1)} style={{
                      background: 'none', border: 'none', cursor: 'pointer', color: '#F87171', display: 'flex', padding: 4,
                    }}>
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
