'use client'
import { useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Mail, MessageCircle, Loader2, Send, Copy, ExternalLink, Check } from 'lucide-react'

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

function OutreachForm() {
  const searchParams = useSearchParams()

  const [form, setForm] = useState({
    companyName: searchParams.get('company') || '',
    email: searchParams.get('email') || '',
    phone: '',
    rubro: searchParams.get('rubro') || 'restaurante',
    city: searchParams.get('city') || 'San Luis',
  })

  const [emailContent, setEmailContent] = useState<{ subject: string; body: string } | null>(null)
  const [whatsappMsg, setWhatsappMsg] = useState('')
  const [loadingEmail, setLoadingEmail] = useState(false)
  const [loadingWA, setLoadingWA] = useState(false)
  const [sendingEmail, setSendingEmail] = useState(false)
  const [emailSent, setEmailSent] = useState(false)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState('')

  async function generateEmail() {
    setLoadingEmail(true)
    setError('')
    try {
      const res = await fetch('/api/outreach/generate-message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, type: 'email' }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setEmailContent(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al generar')
    } finally {
      setLoadingEmail(false)
    }
  }

  async function generateWhatsApp() {
    setLoadingWA(true)
    setError('')
    try {
      const res = await fetch('/api/outreach/generate-message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, type: 'whatsapp' }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setWhatsappMsg(data.message)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al generar')
    } finally {
      setLoadingWA(false)
    }
  }

  async function sendEmail() {
    if (!form.email || !emailContent) return
    setSendingEmail(true)
    try {
      const res = await fetch('/api/outreach/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: form.email,
          subject: emailContent.subject,
          body: emailContent.body,
        }),
      })
      if (!res.ok) throw new Error('Error al enviar')
      setEmailSent(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al enviar email')
    } finally {
      setSendingEmail(false)
    }
  }

  const waLink = form.phone
    ? `https://wa.me/${form.phone.replace(/\D/g, '')}?text=${encodeURIComponent(whatsappMsg)}`
    : ''

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
      {/* Form */}
      <div style={{
        background: 'var(--paper)',
        borderRadius: 16,
        border: '1px solid var(--line)',
        padding: 24,
      }}>
        <h2 style={{ fontFamily: 'var(--f-display)', fontWeight: 700, color: 'var(--ink)', marginBottom: 20, fontSize: 16 }}>
          Datos del prospecto
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={labelStyle}>Empresa</label>
            <input
              type="text"
              value={form.companyName}
              onChange={e => setForm(p => ({ ...p, companyName: e.target.value }))}
              style={inputStyle}
              placeholder="Nombre del negocio"
            />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={labelStyle}>Email</label>
              <input
                type="email"
                value={form.email}
                onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                style={inputStyle}
                placeholder="email@empresa.com"
              />
            </div>
            <div>
              <label style={labelStyle}>Teléfono / WA</label>
              <input
                type="tel"
                value={form.phone}
                onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
                style={inputStyle}
                placeholder="+5492664..."
              />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={labelStyle}>Rubro</label>
              <input
                type="text"
                value={form.rubro}
                onChange={e => setForm(p => ({ ...p, rubro: e.target.value }))}
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>Ciudad</label>
              <input
                type="text"
                value={form.city}
                onChange={e => setForm(p => ({ ...p, city: e.target.value }))}
                style={inputStyle}
              />
            </div>
          </div>
        </div>

        {error && (
          <div style={{
            marginTop: 16,
            fontSize: 13,
            color: '#dc2626',
            background: '#fee2e2',
            padding: '10px 12px',
            borderRadius: 10,
          }}>
            {error}
          </div>
        )}

        <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
          <button
            onClick={generateEmail}
            disabled={loadingEmail || !form.companyName}
            style={{
              flex: 1,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              background: 'var(--ink)', color: 'var(--paper)',
              borderRadius: 10, border: 'none', cursor: 'pointer',
              fontFamily: 'var(--f-mono)', fontSize: 11, letterSpacing: '0.08em',
              textTransform: 'uppercase', padding: '12px 0',
              opacity: (loadingEmail || !form.companyName) ? 0.4 : 1,
            }}
          >
            {loadingEmail ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <Mail size={14} />}
            Email
          </button>
          <button
            onClick={generateWhatsApp}
            disabled={loadingWA || !form.companyName}
            style={{
              flex: 1,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              background: '#25D366', color: '#fff',
              borderRadius: 10, border: 'none', cursor: 'pointer',
              fontFamily: 'var(--f-mono)', fontSize: 11, letterSpacing: '0.08em',
              textTransform: 'uppercase', padding: '12px 0',
              opacity: (loadingWA || !form.companyName) ? 0.4 : 1,
            }}
          >
            {loadingWA ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <MessageCircle size={14} />}
            WhatsApp
          </button>
        </div>
      </div>

      {/* Output */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Email output */}
        {emailContent && (
          <div style={{
            background: 'var(--paper)',
            borderRadius: 16,
            border: '1px solid var(--line)',
            padding: 20,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <h3 style={{
                fontFamily: 'var(--f-mono)', fontSize: 10, letterSpacing: '0.1em',
                textTransform: 'uppercase', color: 'var(--muted)',
                display: 'flex', alignItems: 'center', gap: 8, margin: 0,
              }}>
                <Mail size={12} /> Email generado
              </h3>
              {emailSent ? (
                <span style={{
                  fontFamily: 'var(--f-mono)', fontSize: 10, letterSpacing: '0.06em',
                  textTransform: 'uppercase', color: 'var(--ink)',
                  background: 'var(--lime)', borderRadius: 100, padding: '3px 10px',
                }}>
                  Enviado
                </span>
              ) : (
                <button
                  onClick={sendEmail}
                  disabled={sendingEmail || !form.email}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    fontFamily: 'var(--f-mono)', fontSize: 10, letterSpacing: '0.06em',
                    textTransform: 'uppercase', color: 'var(--paper)',
                    background: 'var(--ink)', borderRadius: 8, padding: '6px 12px',
                    border: 'none', cursor: 'pointer',
                    opacity: (sendingEmail || !form.email) ? 0.4 : 1,
                  }}
                >
                  {sendingEmail ? <Loader2 size={11} style={{ animation: 'spin 1s linear infinite' }} /> : <Send size={11} />}
                  Enviar
                </button>
              )}
            </div>
            <div style={{
              background: 'var(--paper-2)', borderRadius: 10, padding: 12, marginBottom: 10,
              border: '1px solid var(--line)',
            }}>
              <p style={{ ...labelStyle, marginBottom: 4 }}>Asunto</p>
              <p style={{ fontSize: 13, color: 'var(--ink)', fontWeight: 600, margin: 0 }}>{emailContent.subject}</p>
            </div>
            <div style={{ background: 'var(--paper-2)', borderRadius: 10, padding: 12, border: '1px solid var(--line)' }}>
              <p style={{ ...labelStyle, marginBottom: 8 }}>Cuerpo</p>
              <p style={{ fontSize: 13, color: 'var(--ink)', whiteSpace: 'pre-line', lineHeight: 1.6, margin: 0 }}>{emailContent.body}</p>
            </div>
          </div>
        )}

        {/* WhatsApp output */}
        {whatsappMsg && (
          <div style={{
            background: 'var(--paper)',
            borderRadius: 16,
            border: '1px solid var(--line)',
            padding: 20,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <h3 style={{
                fontFamily: 'var(--f-mono)', fontSize: 10, letterSpacing: '0.1em',
                textTransform: 'uppercase', color: 'var(--muted)',
                display: 'flex', alignItems: 'center', gap: 8, margin: 0,
              }}>
                <MessageCircle size={12} /> Mensaje WhatsApp
              </h3>
              <div style={{ display: 'flex', gap: 6 }}>
                <button
                  onClick={() => { navigator.clipboard.writeText(whatsappMsg); setCopied(true); setTimeout(() => setCopied(false), 2000) }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 4,
                    padding: '6px 10px', borderRadius: 8,
                    border: '1px solid var(--line)', background: 'var(--paper)',
                    color: 'var(--muted)', cursor: 'pointer', fontSize: 11,
                    fontFamily: 'var(--f-mono)',
                  }}
                >
                  {copied ? <><Check size={11} /> Copiado</> : <><Copy size={11} /> Copiar</>}
                </button>
                {waLink && (
                  <a
                    href={waLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'flex', alignItems: 'center', gap: 4,
                      padding: '6px 12px', borderRadius: 8,
                      background: '#25D366', color: '#fff',
                      fontFamily: 'var(--f-mono)', fontSize: 11, letterSpacing: '0.06em',
                      textDecoration: 'none', textTransform: 'uppercase',
                    }}
                  >
                    <ExternalLink size={11} /> Abrir WA
                  </a>
                )}
              </div>
            </div>
            <div style={{ background: 'rgba(37,211,102,0.08)', borderRadius: 10, padding: 12, border: '1px solid rgba(37,211,102,0.2)' }}>
              <p style={{ fontSize: 13, color: 'var(--ink)', whiteSpace: 'pre-line', lineHeight: 1.6, margin: 0 }}>{whatsappMsg}</p>
            </div>
          </div>
        )}

        {(emailContent || whatsappMsg) && (
          <div style={{
            background: 'var(--paper)',
            borderRadius: 16,
            border: '1px solid var(--line)',
            padding: 16,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
          }}>
            <p style={{ color: 'var(--muted)', fontSize: 12, fontFamily: 'var(--f-mono)', margin: 0 }}>
              ¿Este prospecto ya está en el CRM?
            </p>
            <div style={{ display: 'flex', gap: 8 }}>
              <a
                href={`/crm?company=${encodeURIComponent(form.companyName)}&rubro=${encodeURIComponent(form.rubro)}&city=${encodeURIComponent(form.city)}&email=${encodeURIComponent(form.email)}`}
                style={{
                  padding: '7px 14px', borderRadius: 8,
                  fontFamily: 'var(--f-mono)', fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase',
                  color: 'var(--paper)', background: 'var(--ink)', textDecoration: 'none',
                  display: 'flex', alignItems: 'center', gap: 6,
                }}
              >
                Ver en CRM →
              </a>
              <a
                href={`/comercial?company=${encodeURIComponent(form.companyName)}&rubro=${encodeURIComponent(form.rubro)}`}
                style={{
                  padding: '7px 14px', borderRadius: 8,
                  fontFamily: 'var(--f-mono)', fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase',
                  color: 'var(--ink)', background: 'var(--lime)', textDecoration: 'none',
                }}
              >
                Pipeline →
              </a>
            </div>
          </div>
        )}

        {!emailContent && !whatsappMsg && (
          <div style={{
            background: 'var(--paper)',
            borderRadius: 16,
            border: '1px dashed var(--line)',
            padding: '64px 32px',
            textAlign: 'center',
          }}>
            <p style={{ color: 'var(--muted)', fontSize: 13, fontFamily: 'var(--f-mono)' }}>
              Completá los datos y generá el mensaje con IA
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default function OutreachPage() {
  return (
    <div style={{ background: 'var(--paper-2)', minHeight: '100vh' }}>
      {/* Marketing flow strip */}
      <div style={{ background: '#0E0E0E', padding: '7px 40px', display: 'flex', alignItems: 'center', gap: 6 }}>
        <span style={{ fontFamily: 'var(--f-mono)', fontSize: 8, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.2)', marginRight: 6 }}>Marketing:</span>
        {[
          { href: '/contenido', label: '✨ Contenido', active: false },
          { href: '/publicidad', label: '📢 Publicidad', active: false },
          { href: '/redes', label: '📱 Redes', active: false },
          { href: '/outreach', label: '📞 Outreach', active: true },
        ].map((s, i, arr) => (
          <span key={s.href} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Link href={s.href} style={{ fontFamily: 'var(--f-mono)', fontSize: 8.5, textDecoration: 'none', color: s.active ? '#C6FF3D' : 'rgba(255,255,255,0.3)', borderBottom: s.active ? '1px solid #C6FF3D' : 'none', paddingBottom: s.active ? 1 : 0 }}>{s.label}</Link>
            {i < arr.length - 1 && <span style={{ color: 'rgba(255,255,255,0.15)', fontSize: 10 }}>→</span>}
          </span>
        ))}
      </div>
      <div style={{ padding: '32px 40px' }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{
          fontFamily: 'var(--f-display)', fontStyle: 'italic', fontWeight: 700,
          fontSize: 36, letterSpacing: '-0.03em', color: 'var(--ink)', margin: 0,
        }}>
          Outreach
        </h1>
        <p style={{ color: 'var(--muted)', fontSize: 13, marginTop: 4, fontFamily: 'var(--f-mono)' }}>
          Generá emails y mensajes de WhatsApp personalizados con IA
        </p>
      </div>
      <Suspense fallback={
        <p style={{ color: 'var(--muted)', fontSize: 13, fontFamily: 'var(--f-mono)' }}>Cargando...</p>
      }>
        <OutreachForm />
      </Suspense>
      </div>
    </div>
  )
}
