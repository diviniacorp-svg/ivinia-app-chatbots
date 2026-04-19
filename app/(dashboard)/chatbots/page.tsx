'use client'
import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Copy, ExternalLink, Check, Bot, CalendarCheck, Link2 } from 'lucide-react'
import { RUBROS_INFO } from '@/lib/templates-data'

interface Client {
  id: string
  company_name: string
  contact_name: string
  email: string
  phone: string
  rubro: string
  plan: string
  status: string
  chatbot_id: string
  embed_code: string
  trial_end: string
  created_at: string
}

interface Template {
  id: string
  name: string
  rubro: string
}

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

function ChatbotForm({ templates }: { templates: Template[] }) {
  const searchParams = useSearchParams()
  const [form, setForm] = useState({
    company_name: searchParams.get('company') || '',
    contact_name: '',
    email: searchParams.get('email') || '',
    phone: searchParams.get('phone') || '',
    rubro: '',
    city: '',
    template_id: searchParams.get('template') || '',
    custom_name: '',
    custom_horario: '',
    plan: 'trial',
  })
  const [loading, setLoading] = useState(false)
  const [created, setCreated] = useState<Client | null>(null)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  async function createClient(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Error al crear cliente')
      setCreated(data.client)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error inesperado')
    } finally {
      setLoading(false)
    }
  }

  function copyEmbed() {
    if (created?.embed_code) {
      navigator.clipboard.writeText(created.embed_code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

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
          Crear nuevo cliente de chatbot
        </h2>
        <form onSubmit={createClient} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={labelStyle}>Empresa *</label>
              <input required type="text" value={form.company_name}
                onChange={e => setForm(p => ({ ...p, company_name: e.target.value }))}
                style={inputStyle} placeholder="Nombre del negocio" />
            </div>
            <div>
              <label style={labelStyle}>Contacto *</label>
              <input required type="text" value={form.contact_name}
                onChange={e => setForm(p => ({ ...p, contact_name: e.target.value }))}
                style={inputStyle} placeholder="Nombre" />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={labelStyle}>Email *</label>
              <input required type="email" value={form.email}
                onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Teléfono</label>
              <input type="tel" value={form.phone}
                onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
                style={inputStyle} />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={labelStyle}>Rubro *</label>
              <select required value={form.rubro}
                onChange={e => setForm(p => ({ ...p, rubro: e.target.value }))}
                style={inputStyle}>
                <option value="">Seleccioná</option>
                {RUBROS_INFO.map(r => <option key={r.rubro} value={r.rubro}>{r.emoji} {r.name.replace('Chatbot para ', '')}</option>)}
                <option value="otro">Otro</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>Ciudad</label>
              <input type="text" value={form.city}
                onChange={e => setForm(p => ({ ...p, city: e.target.value }))}
                style={inputStyle} placeholder="San Luis" />
            </div>
          </div>

          {templates.length > 0 && (
            <div>
              <label style={labelStyle}>Template</label>
              <select value={form.template_id}
                onChange={e => setForm(p => ({ ...p, template_id: e.target.value }))}
                style={inputStyle}>
                <option value="">Auto (por rubro)</option>
                {templates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
          )}

          <div>
            <label style={labelStyle}>Horario del negocio</label>
            <input type="text" value={form.custom_horario}
              onChange={e => setForm(p => ({ ...p, custom_horario: e.target.value }))}
              style={inputStyle} placeholder="Lunes a Viernes 9-18hs" />
          </div>

          <div>
            <label style={labelStyle}>Plan</label>
            <select value={form.plan}
              onChange={e => setForm(p => ({ ...p, plan: e.target.value }))}
              style={inputStyle}>
              <option value="trial">Trial (14 días gratis)</option>
              <option value="basic">Básico — $50.000/mes</option>
              <option value="pro">Pro — $100.000/mes</option>
              <option value="enterprise">Enterprise — $200.000/mes</option>
            </select>
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
            {loading ? 'Creando...' : 'Crear cliente y activar chatbot'}
          </button>
        </form>
      </div>

      {/* Result */}
      {created ? (
        <div style={{
          background: 'var(--paper)',
          borderRadius: 16,
          border: '1px solid rgba(198,255,61,0.4)',
          padding: 24,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
            <div style={{
              width: 40, height: 40, borderRadius: 10,
              background: 'rgba(198,255,61,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Check size={20} style={{ color: 'var(--ink)' }} />
            </div>
            <div>
              <h3 style={{ fontFamily: 'var(--f-display)', fontWeight: 700, color: 'var(--ink)', margin: 0 }}>
                Chatbot activado
              </h3>
              <p style={{ fontSize: 12, color: 'var(--muted)', margin: 0 }}>{created.company_name}</p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{
              background: 'var(--paper-2)', borderRadius: 12, padding: 16,
              border: '1px solid var(--line)',
            }}>
              <p style={{
                fontFamily: 'var(--f-mono)', fontSize: 10, letterSpacing: '0.1em',
                textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 8,
              }}>
                Código para instalar en la web
              </p>
              <code style={{
                fontFamily: 'var(--f-mono)', fontSize: 11, color: 'var(--ink)',
                wordBreak: 'break-all', lineHeight: 1.6, display: 'block',
              }}>
                {created.embed_code}
              </code>
              <button
                onClick={copyEmbed}
                style={{
                  marginTop: 10, display: 'flex', alignItems: 'center', gap: 6,
                  fontFamily: 'var(--f-mono)', fontSize: 10, letterSpacing: '0.06em',
                  textTransform: 'uppercase', color: 'var(--ink)',
                  background: 'none', border: 'none', cursor: 'pointer',
                }}
              >
                {copied ? <><Check size={11} /> Copiado!</> : <><Copy size={11} /> Copiar código</>}
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div style={{ background: 'var(--paper-2)', borderRadius: 10, padding: 12, border: '1px solid var(--line)' }}>
                <p style={{
                  fontFamily: 'var(--f-mono)', fontSize: 10, letterSpacing: '0.08em',
                  textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 4,
                }}>Estado</p>
                <p style={{ fontFamily: 'var(--f-mono)', fontWeight: 700, color: 'var(--ink)', fontSize: 12 }}>
                  {created.status}
                </p>
              </div>
              <div style={{ background: 'var(--paper-2)', borderRadius: 10, padding: 12, border: '1px solid var(--line)' }}>
                <p style={{
                  fontFamily: 'var(--f-mono)', fontSize: 10, letterSpacing: '0.08em',
                  textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 4,
                }}>Plan</p>
                <p style={{ fontFamily: 'var(--f-mono)', fontWeight: 700, color: 'var(--ink)', fontSize: 12 }}>
                  {created.plan}
                </p>
              </div>
              {created.status === 'trial' && (
                <div style={{
                  gridColumn: 'span 2',
                  background: 'rgba(251,146,60,0.1)', borderRadius: 10, padding: 12,
                  border: '1px solid rgba(251,146,60,0.2)',
                }}>
                  <p style={{
                    fontFamily: 'var(--f-mono)', fontSize: 10, letterSpacing: '0.08em',
                    textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 4,
                  }}>Trial vence</p>
                  <p style={{ fontFamily: 'var(--f-mono)', fontWeight: 700, color: 'var(--ink)', fontSize: 12 }}>
                    {new Date(created.trial_end).toLocaleDateString('es-AR')}
                  </p>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <a
                href={`/api/chatbot/${created.chatbot_id}`}
                target="_blank" rel="noopener noreferrer"
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '10px 12px', borderRadius: 10, border: '1px solid var(--line)',
                  fontSize: 13, color: 'var(--ink)', textDecoration: 'none',
                }}
              >
                <Bot size={14} style={{ color: 'var(--muted)' }} /> Probar chatbot
                <ExternalLink size={11} style={{ color: 'var(--muted)', marginLeft: 'auto' }} />
              </a>
              <a
                href={`/turnos/config/nuevo?clientId=${created.id}`}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '10px 12px', borderRadius: 10, border: '1px solid var(--line)',
                  fontSize: 13, color: 'var(--ink)', textDecoration: 'none',
                }}
              >
                <CalendarCheck size={14} style={{ color: 'var(--muted)' }} /> Agregar sistema de turnos
              </a>
            </div>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{
            background: 'var(--paper)',
            borderRadius: 16,
            border: '1px solid var(--line)',
            padding: 20,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
              <Bot size={20} style={{ color: 'var(--ink)' }} />
              <h3 style={{ fontFamily: 'var(--f-display)', fontWeight: 700, color: 'var(--ink)', margin: 0 }}>Chatbot IA</h3>
            </div>
            <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.6, marginBottom: 16 }}>
              Atención automática 24/7 con inteligencia artificial. Responde preguntas, toma pedidos y convierte visitas en clientes.
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {['Atención 24/7', 'Sin código', 'IA avanzada', 'WhatsApp listo'].map(f => (
                <span key={f} style={{
                  fontFamily: 'var(--f-mono)', fontSize: 10, letterSpacing: '0.06em',
                  textTransform: 'uppercase', color: 'var(--ink)',
                  background: 'var(--paper-2)', borderRadius: 100, padding: '4px 10px',
                  border: '1px solid var(--line)',
                }}>
                  {f}
                </span>
              ))}
            </div>
          </div>
          <div style={{
            background: 'var(--paper)',
            borderRadius: 16,
            border: '1px solid var(--line)',
            padding: 20,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
              <Link2 size={20} style={{ color: 'var(--muted)' }} />
              <h3 style={{ fontFamily: 'var(--f-display)', fontWeight: 700, color: 'var(--ink)', margin: 0 }}>¿Ya tiene chatbot?</h3>
            </div>
            <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.6 }}>
              Podés agregar el sistema de turnos a un cliente existente desde la sección <strong style={{ color: 'var(--ink)' }}>Turnos</strong>.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

export default function ChatbotsPage() {
  const [templates, setTemplates] = useState<Template[]>([])

  useEffect(() => {
    fetch('/api/templates').then(r => r.json()).then(d => setTemplates(d.templates || []))
  }, [])

  return (
    <div style={{ padding: '32px 40px', background: 'var(--paper-2)', minHeight: '100vh' }}>
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
          <Bot size={24} style={{ color: 'var(--ink)' }} />
          <h1 style={{
            fontFamily: 'var(--f-display)', fontStyle: 'italic', fontWeight: 700,
            fontSize: 36, letterSpacing: '-0.03em', color: 'var(--ink)', margin: 0,
          }}>
            Chatbots
          </h1>
        </div>
        <p style={{ color: 'var(--muted)', fontSize: 13, fontFamily: 'var(--f-mono)' }}>
          Creá y activá chatbots IA para tus clientes
        </p>
      </div>
      <Suspense fallback={
        <p style={{ color: 'var(--muted)', fontSize: 13, fontFamily: 'var(--f-mono)' }}>Cargando...</p>
      }>
        <ChatbotForm templates={templates} />
      </Suspense>
    </div>
  )
}
