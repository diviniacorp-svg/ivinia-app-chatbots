'use client'
import { useState } from 'react'
import { ExternalLink, Settings, Plus, Globe, LayoutDashboard, Brain, ChevronRight, Zap, Package } from 'lucide-react'
import Link from 'next/link'

const LIME = '#C6FF3D'

// Clientes demo hasta que haya DB real
const DEMO_NUCLEOS = [
  {
    id: 'vecino-compraventa',
    slug: 'el-vecino-usados',
    nombre: 'El Vecino Usados',
    rubro: 'Compraventa',
    ciudad: 'San Luis Capital',
    estado: 'configurando',
    plan: 'nucleo-pro',
    items_publicados: 0,
    contactos: 0,
    url_publica: '/nucleo/el-vecino-usados',
    url_admin: '/nucleo/el-vecino-usados/admin',
  },
]

const PLAN_NUCLEO = {
  setup: 400000,
  mensual: 100000,
  descripcion: 'Sistema de gestión completo + vitrina pública con IA',
}

function formatARS(n: number) {
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0 }).format(n)
}

const ESTADO_BADGE: Record<string, { label: string; color: string; bg: string }> = {
  activo:        { label: 'Activo',        color: '#fff',  bg: 'rgba(198,255,61,0.15)' },
  configurando:  { label: 'Configurando',  color: '#fff',  bg: 'rgba(251,146,60,0.15)' },
  pausado:       { label: 'Pausado',       color: '#fff',  bg: 'rgba(255,255,255,0.07)' },
}

export default function NucleoPage() {
  const [tab, setTab] = useState<'clientes' | 'crear'>('clientes')

  return (
    <div style={{ minHeight: '100vh', background: 'var(--ink)', color: 'var(--paper)' }}>

      {/* Header */}
      <div style={{ borderBottom: '1px solid rgba(255,255,255,0.07)', padding: '28px 32px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 18,
          }}>🧠</div>
          <div>
            <h1 style={{ fontFamily: 'var(--f-display)', fontWeight: 700, fontSize: 22, letterSpacing: '-0.03em', margin: 0 }}>
              Núcleo IA
            </h1>
            <p style={{ fontFamily: 'var(--f-mono)', fontSize: 10, color: 'rgba(255,255,255,0.35)', margin: 0, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              Sistema de gestión + vitrina pública con IA
            </p>
          </div>
        </div>

        {/* Pricing pill */}
        <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
          <span style={{
            fontFamily: 'var(--f-mono)', fontSize: 11,
            background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)',
            borderRadius: 20, padding: '4px 12px', color: '#a5b4fc',
          }}>
            Setup {formatARS(PLAN_NUCLEO.setup)}
          </span>
          <span style={{
            fontFamily: 'var(--f-mono)', fontSize: 11,
            background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 20, padding: '4px 12px', color: 'rgba(255,255,255,0.5)',
          }}>
            {formatARS(PLAN_NUCLEO.mensual)}/mes mantenimiento
          </span>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 4, marginTop: 20 }}>
          {(['clientes', 'crear'] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              style={{
                fontFamily: 'var(--f-display)', fontSize: 13, fontWeight: tab === t ? 600 : 400,
                padding: '6px 16px', borderRadius: 8, border: 'none', cursor: 'pointer',
                background: tab === t ? 'rgba(198,255,61,0.1)' : 'transparent',
                color: tab === t ? LIME : 'rgba(255,255,255,0.4)',
                borderBottom: tab === t ? `2px solid ${LIME}` : '2px solid transparent',
              }}
            >
              {t === 'clientes' ? `Clientes (${DEMO_NUCLEOS.length})` : '+ Nuevo Núcleo'}
            </button>
          ))}
        </div>
      </div>

      <div style={{ padding: '28px 32px' }}>

        {tab === 'clientes' && (
          <div>
            {DEMO_NUCLEOS.length === 0 ? (
              <EmptyState onNew={() => setTab('crear')} />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {DEMO_NUCLEOS.map(nucleo => (
                  <NucleoCard key={nucleo.id} nucleo={nucleo} />
                ))}

                <button
                  onClick={() => setTab('crear')}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    padding: '14px', borderRadius: 12,
                    border: '1px dashed rgba(255,255,255,0.12)', background: 'transparent',
                    color: 'rgba(255,255,255,0.3)', cursor: 'pointer',
                    fontFamily: 'var(--f-display)', fontSize: 13,
                    transition: 'all 0.15s',
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLElement).style.borderColor = LIME
                    ;(e.currentTarget as HTMLElement).style.color = LIME
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.12)'
                    ;(e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.3)'
                  }}
                >
                  <Plus size={15} />
                  Agregar cliente Núcleo IA
                </button>
              </div>
            )}
          </div>
        )}

        {tab === 'crear' && <NuevoNucleoForm onCancel={() => setTab('clientes')} />}
      </div>
    </div>
  )
}

// ── Card de un Núcleo activo ──────────────────────────────────────────────────
function NucleoCard({ nucleo }: { nucleo: typeof DEMO_NUCLEOS[0] }) {
  const badge = ESTADO_BADGE[nucleo.estado] ?? ESTADO_BADGE.pausado

  return (
    <div style={{
      background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: 14, padding: '20px 24px',
      display: 'flex', alignItems: 'center', gap: 20,
    }}>
      {/* Icon */}
      <div style={{
        width: 44, height: 44, borderRadius: 12, flexShrink: 0,
        background: 'linear-gradient(135deg, rgba(99,102,241,0.2) 0%, rgba(139,92,246,0.2) 100%)',
        border: '1px solid rgba(99,102,241,0.2)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20,
      }}>🧠</div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
          <span style={{ fontFamily: 'var(--f-display)', fontWeight: 600, fontSize: 15 }}>
            {nucleo.nombre}
          </span>
          <span style={{
            fontSize: 10, fontFamily: 'var(--f-mono)', letterSpacing: '0.06em',
            textTransform: 'uppercase', padding: '2px 8px', borderRadius: 20,
            background: badge.bg, color: badge.color, border: '1px solid rgba(255,255,255,0.08)',
          }}>
            {badge.label}
          </span>
        </div>
        <div style={{ display: 'flex', gap: 16 }}>
          <Stat label="Rubro" value={nucleo.rubro} />
          <Stat label="Ciudad" value={nucleo.ciudad} />
          <Stat label="Items" value={String(nucleo.items_publicados)} />
          <Stat label="Contactos" value={String(nucleo.contactos)} />
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
        <ActionBtn href={nucleo.url_publica} icon={<Globe size={14} />} label="Vitrina" />
        <ActionBtn href={nucleo.url_admin} icon={<LayoutDashboard size={14} />} label="Panel" />
        <ActionBtn href={`/nucleo/${nucleo.slug}/config`} icon={<Settings size={14} />} label="Config" />
      </div>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div style={{ fontFamily: 'var(--f-mono)', fontSize: 9, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{label}</div>
      <div style={{ fontFamily: 'var(--f-display)', fontSize: 13, color: 'rgba(255,255,255,0.7)' }}>{value}</div>
    </div>
  )
}

function ActionBtn({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  return (
    <Link
      href={href}
      style={{
        display: 'flex', alignItems: 'center', gap: 6, padding: '7px 12px', borderRadius: 8,
        background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)',
        color: 'rgba(255,255,255,0.5)', textDecoration: 'none',
        fontFamily: 'var(--f-display)', fontSize: 12,
        transition: 'all 0.15s',
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.09)'
        ;(e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.9)'
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.05)'
        ;(e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.5)'
      }}
    >
      {icon}
      {label}
    </Link>
  )
}

// ── Estado vacío ──────────────────────────────────────────────────────────────
function EmptyState({ onNew }: { onNew: () => void }) {
  return (
    <div style={{
      textAlign: 'center', padding: '60px 20px',
      border: '1px dashed rgba(255,255,255,0.1)', borderRadius: 16,
    }}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>🧠</div>
      <h2 style={{ fontFamily: 'var(--f-display)', fontWeight: 700, fontSize: 20, marginBottom: 8 }}>
        Núcleo IA — sin clientes aún
      </h2>
      <p style={{ color: 'rgba(255,255,255,0.4)', fontFamily: 'var(--f-display)', fontSize: 14, marginBottom: 24, maxWidth: 400, margin: '0 auto 24px' }}>
        El Núcleo IA es el sistema de gestión completo para un negocio — vitrina pública + panel interno + IA integrada.
      </p>
      <button
        onClick={onNew}
        style={{
          background: LIME, color: 'var(--ink)', border: 'none', borderRadius: 10,
          padding: '12px 24px', fontFamily: 'var(--f-display)', fontWeight: 700,
          fontSize: 14, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8,
        }}
      >
        <Plus size={16} />
        Crear primer Núcleo IA
      </button>
    </div>
  )
}

// ── Formulario nuevo Núcleo ───────────────────────────────────────────────────
const RUBROS_NUCLEO = [
  'Compraventa / Usados', 'Inmobiliaria', 'Repuestos / Autopartes',
  'Distribuidora', 'Taller mecánico', 'Ferretería', 'Veterinaria',
  'Clínica / Consultorio', 'Restaurante / Rotisería', 'Otro',
]

function NuevoNucleoForm({ onCancel }: { onCancel: () => void }) {
  const [form, setForm] = useState({
    nombre: '', rubro: '', ciudad: 'San Luis Capital',
    contacto: '', whatsapp: '', descripcion: '',
  })

  function update(k: keyof typeof form, v: string) {
    setForm(f => ({ ...f, [k]: v }))
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10,
    padding: '10px 14px', color: 'var(--paper)',
    fontFamily: 'var(--f-display)', fontSize: 14,
    outline: 'none', boxSizing: 'border-box',
  }

  const labelStyle: React.CSSProperties = {
    fontFamily: 'var(--f-mono)', fontSize: 10, letterSpacing: '0.08em',
    textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', marginBottom: 6, display: 'block',
  }

  return (
    <div style={{ maxWidth: 560 }}>
      <h2 style={{ fontFamily: 'var(--f-display)', fontWeight: 700, fontSize: 18, marginBottom: 24 }}>
        Nuevo Núcleo IA
      </h2>

      {/* Qué incluye */}
      <div style={{
        background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)',
        borderRadius: 12, padding: '16px 20px', marginBottom: 28,
      }}>
        <div style={{ fontFamily: 'var(--f-mono)', fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#a5b4fc', marginBottom: 10 }}>
          Incluye
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 20px' }}>
          {[
            '🌐 Vitrina pública con catálogo',
            '📋 Panel interno del dueño',
            '🤖 Chatbot IA de consultas',
            '📦 Gestión de productos/servicios',
            '👥 Base de clientes / leads',
            '📊 Estadísticas y reportes',
            '💬 Notificaciones por WhatsApp',
            '✍️ IA para generar descripciones',
          ].map(f => (
            <div key={f} style={{ fontFamily: 'var(--f-display)', fontSize: 12, color: 'rgba(255,255,255,0.55)', display: 'flex', alignItems: 'center', gap: 6 }}>
              {f}
            </div>
          ))}
        </div>
        <div style={{ marginTop: 12, fontFamily: 'var(--f-mono)', fontSize: 11, color: '#a5b4fc' }}>
          Setup {formatARS(PLAN_NUCLEO.setup)} + {formatARS(PLAN_NUCLEO.mensual)}/mes
        </div>
      </div>

      {/* Form fields */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        <div>
          <label style={labelStyle}>Nombre del negocio</label>
          <input style={inputStyle} placeholder="Ej: El Vecino Usados" value={form.nombre} onChange={e => update('nombre', e.target.value)} />
        </div>

        <div>
          <label style={labelStyle}>Rubro</label>
          <select style={{ ...inputStyle, appearance: 'none' }} value={form.rubro} onChange={e => update('rubro', e.target.value)}>
            <option value="">Seleccioná el rubro</option>
            {RUBROS_NUCLEO.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div>
            <label style={labelStyle}>Ciudad</label>
            <input style={inputStyle} value={form.ciudad} onChange={e => update('ciudad', e.target.value)} />
          </div>
          <div>
            <label style={labelStyle}>WhatsApp del negocio</label>
            <input style={inputStyle} placeholder="+54 9 266..." value={form.whatsapp} onChange={e => update('whatsapp', e.target.value)} />
          </div>
        </div>

        <div>
          <label style={labelStyle}>Nombre del dueño / contacto</label>
          <input style={inputStyle} placeholder="Nombre y apellido" value={form.contacto} onChange={e => update('contacto', e.target.value)} />
        </div>

        <div>
          <label style={labelStyle}>Descripción breve del negocio</label>
          <textarea
            style={{ ...inputStyle, minHeight: 80, resize: 'vertical' }}
            placeholder="Qué vende o hace el negocio. La IA usará esto para generar la landing."
            value={form.descripcion}
            onChange={e => update('descripcion', e.target.value)}
          />
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 10, paddingTop: 8 }}>
          <button
            style={{
              flex: 1, padding: '12px', borderRadius: 10, border: 'none',
              background: LIME, color: 'var(--ink)',
              fontFamily: 'var(--f-display)', fontWeight: 700, fontSize: 14, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            }}
          >
            <Zap size={15} />
            Crear Núcleo IA
          </button>
          <button
            onClick={onCancel}
            style={{
              padding: '12px 20px', borderRadius: 10,
              border: '1px solid rgba(255,255,255,0.1)', background: 'transparent',
              color: 'rgba(255,255,255,0.4)',
              fontFamily: 'var(--f-display)', fontSize: 14, cursor: 'pointer',
            }}
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  )
}
