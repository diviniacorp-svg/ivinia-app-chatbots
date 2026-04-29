'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { FileText, Plus, ExternalLink, Clock, CheckCircle, XCircle, Send, Copy, Check } from 'lucide-react'

type Propuesta = {
  id: string
  empresa: string
  rubro: string
  contacto: string
  productos: string[]
  monto_ars: number
  estado: 'borrador' | 'enviada' | 'en_revision' | 'aceptada' | 'rechazada'
  fecha_creacion: string
  fecha_envio?: string
  notas?: string
}

const ESTADO_CONFIG: Record<Propuesta['estado'], { label: string; color: string; icon: React.ReactNode }> = {
  borrador:    { label: 'Borrador',     color: '#71717A',  icon: <Clock size={11} /> },
  enviada:     { label: 'Enviada',      color: '#3b82f6',  icon: <Send size={11} /> },
  en_revision: { label: 'En revisión',  color: '#f59e0b',  icon: <Clock size={11} /> },
  aceptada:    { label: 'Aceptada ✓',   color: '#16a34a',  icon: <CheckCircle size={11} /> },
  rechazada:   { label: 'Rechazada',    color: '#dc2626',  icon: <XCircle size={11} /> },
}

const PRODUCTOS_DIVINIA = [
  'Turnero IA', 'Chatbot 24hs', 'Content Factory', 'Redes Sociales IA',
  'Núcleo IA', 'Avatares IA', 'Publicidad IA', 'Todo DIVINIA',
]

const LIME = '#C6FF3D'
const INK = '#09090B'

function ars(n: number) {
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0 }).format(n)
}

function formatDate(s: string) {
  return new Date(s).toLocaleDateString('es-AR', { day: 'numeric', month: 'short' })
}

const MOCK_PROPUESTAS: Propuesta[] = [
  {
    id: 'p1',
    empresa: 'Clínica San Martín',
    rubro: 'clínica',
    contacto: 'Dr. Pérez',
    productos: ['Turnero IA', 'Chatbot 24hs'],
    monto_ars: 85000,
    estado: 'en_revision',
    fecha_creacion: '2026-04-20',
    fecha_envio: '2026-04-22',
    notas: 'Interesados en demo completa de turnos',
  },
  {
    id: 'p2',
    empresa: 'Restaurante La Esquina',
    rubro: 'restaurante',
    contacto: 'María González',
    productos: ['Chatbot 24hs', 'Redes Sociales IA'],
    monto_ars: 65000,
    estado: 'enviada',
    fecha_creacion: '2026-04-25',
    fecha_envio: '2026-04-25',
  },
  {
    id: 'p3',
    empresa: 'Gym Power',
    rubro: 'gimnasio',
    contacto: 'Carlos Rueda',
    productos: ['Todo DIVINIA'],
    monto_ars: 150000,
    estado: 'aceptada',
    fecha_creacion: '2026-04-10',
    fecha_envio: '2026-04-12',
    notas: 'Firmaron por 6 meses',
  },
  {
    id: 'p4',
    empresa: 'Ferretería Romero',
    rubro: 'comercio',
    contacto: 'Pedro Romero',
    productos: ['Chatbot 24hs'],
    monto_ars: 35000,
    estado: 'rechazada',
    fecha_creacion: '2026-04-15',
    fecha_envio: '2026-04-16',
    notas: 'Presupuesto ajustado, seguir en 3 meses',
  },
  {
    id: 'p5',
    empresa: 'Estudio Contable Ríos',
    rubro: 'contabilidad',
    contacto: 'Lic. Ríos',
    productos: ['Turnero IA', 'Content Factory'],
    monto_ars: 95000,
    estado: 'borrador',
    fecha_creacion: '2026-04-28',
  },
]

export default function PropuestasPage() {
  const [propuestas, setPropuestas] = useState<Propuesta[]>(MOCK_PROPUESTAS)
  const [filtro, setFiltro] = useState<'todas' | Propuesta['estado']>('todas')
  const [showNueva, setShowNueva] = useState(false)
  const [copied, setCopied] = useState<string | null>(null)

  const filtered = filtro === 'todas' ? propuestas : propuestas.filter(p => p.estado === filtro)

  const stats = {
    total: propuestas.length,
    activas: propuestas.filter(p => ['enviada', 'en_revision'].includes(p.estado)).length,
    aceptadas: propuestas.filter(p => p.estado === 'aceptada').length,
    mrr_potencial: propuestas
      .filter(p => ['enviada', 'en_revision', 'aceptada'].includes(p.estado))
      .reduce((s, p) => s + p.monto_ars, 0),
  }

  const tabs: { key: 'todas' | Propuesta['estado']; label: string }[] = [
    { key: 'todas',        label: `Todas (${propuestas.length})` },
    { key: 'borrador',     label: 'Borrador' },
    { key: 'enviada',      label: 'Enviadas' },
    { key: 'en_revision',  label: 'En revisión' },
    { key: 'aceptada',     label: 'Aceptadas' },
    { key: 'rechazada',    label: 'Rechazadas' },
  ]

  return (
    <div style={{ background: '#F4F4F5', minHeight: '100vh', color: INK }}>

      {/* Ventas flow strip */}
      <div style={{ background: '#09090B', padding: '8px 40px', display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
        <span style={{ fontFamily: 'var(--f-mono)', fontSize: 8, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.2)', marginRight: 6 }}>Ventas:</span>
        {[
          { href: '/leads',      label: '🎯 Leads',       active: false },
          { href: '/comercial',  label: '🔥 Pipeline',    active: false },
          { href: '/crm',        label: '🗂 CRM',          active: false },
          { href: '/propuestas', label: '📄 Propuestas',  active: true  },
          { href: '/clientes',   label: '👥 Clientes',    active: false },
        ].map((s, i) => (
          <span key={s.href} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Link href={s.href} style={{
              fontFamily: 'var(--f-mono)', fontSize: 8.5, textDecoration: 'none',
              color: s.active ? LIME : 'rgba(255,255,255,0.3)',
              borderBottom: s.active ? `1px solid ${LIME}` : 'none',
              paddingBottom: s.active ? 1 : 0,
            }}>{s.label}</Link>
            {i < 4 && <span style={{ color: 'rgba(255,255,255,0.12)', fontSize: 10 }}>→</span>}
          </span>
        ))}
      </div>

      <div style={{ padding: '32px 40px' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontFamily: 'var(--f-display)', fontStyle: 'italic', fontWeight: 700, fontSize: 36, letterSpacing: '-0.03em', color: INK, margin: 0 }}>
            Propuestas
          </h1>
          <p style={{ color: '#71717A', fontSize: 13, marginTop: 4, fontFamily: 'var(--f-mono)' }}>
            Pipeline de propuestas enviadas a clientes
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <Link href="/outreach" style={{
            display: 'flex', alignItems: 'center', gap: 6, padding: '9px 16px', borderRadius: 9,
            background: '#fff', border: '1px solid #E4E4E7', color: INK, textDecoration: 'none',
            fontFamily: 'var(--f-mono)', fontSize: 11, letterSpacing: '0.06em', textTransform: 'uppercase',
          }}>
            <Send size={12} /> Outreach
          </Link>
          <button
            onClick={() => setShowNueva(true)}
            style={{
              display: 'flex', alignItems: 'center', gap: 6, padding: '9px 16px', borderRadius: 9,
              background: INK, color: '#fff', border: 'none', cursor: 'pointer',
              fontFamily: 'var(--f-mono)', fontSize: 11, letterSpacing: '0.06em', textTransform: 'uppercase',
            }}
          >
            <Plus size={12} /> Nueva propuesta
          </button>
        </div>
      </div>

      {/* KPI strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 24 }}>
        {[
          { label: 'Total',        value: stats.total,                          color: INK },
          { label: 'Activas',      value: stats.activas,                        color: '#3b82f6' },
          { label: 'Aceptadas',    value: stats.aceptadas,                      color: '#16a34a' },
          { label: 'MRR potencial', value: ars(stats.mrr_potencial),            color: LIME, dark: true },
        ].map(k => (
          <div key={k.label} style={{
            background: k.dark ? INK : '#fff',
            borderRadius: 12, border: `1px solid ${k.dark ? 'transparent' : '#E4E4E7'}`,
            padding: '16px 20px',
          }}>
            <div style={{ fontFamily: 'var(--f-mono)', fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase', color: k.dark ? 'rgba(255,255,255,0.4)' : '#71717A', marginBottom: 6 }}>
              {k.label}
            </div>
            <div style={{ fontFamily: 'var(--f-mono)', fontWeight: 700, fontSize: 22, color: k.dark ? LIME : k.color, letterSpacing: '-0.02em' }}>
              {k.value}
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 16, flexWrap: 'wrap' }}>
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setFiltro(t.key)}
            style={{
              padding: '6px 14px', borderRadius: 7, border: 'none', cursor: 'pointer',
              fontFamily: 'var(--f-mono)', fontSize: 10, letterSpacing: '0.06em', textTransform: 'uppercase',
              background: filtro === t.key ? INK : '#fff',
              color: filtro === t.key ? '#fff' : '#71717A',
              transition: 'all 0.1s',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #E4E4E7', overflow: 'hidden' }}>
        {filtered.length === 0 ? (
          <div style={{ padding: '48px 32px', textAlign: 'center' }}>
            <FileText size={32} style={{ color: '#D4D4D8', marginBottom: 12 }} />
            <p style={{ fontFamily: 'var(--f-display)', fontSize: 14, color: '#71717A' }}>No hay propuestas en esta categoría</p>
            <button
              onClick={() => setShowNueva(true)}
              style={{ marginTop: 12, padding: '8px 18px', borderRadius: 8, background: INK, color: '#fff', border: 'none', cursor: 'pointer', fontFamily: 'var(--f-mono)', fontSize: 11 }}
            >
              + Nueva propuesta
            </button>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #E4E4E7' }}>
                {['Empresa', 'Productos', 'Monto', 'Estado', 'Fecha', 'Acciones'].map(h => (
                  <th key={h} style={{
                    padding: '10px 16px', textAlign: 'left',
                    fontFamily: 'var(--f-mono)', fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#71717A',
                    fontWeight: 400,
                  }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((p, i) => {
                const cfg = ESTADO_CONFIG[p.estado]
                return (
                  <tr key={p.id} style={{ borderBottom: i < filtered.length - 1 ? '1px solid #F4F4F5' : 'none' }}>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ fontFamily: 'var(--f-display)', fontWeight: 600, fontSize: 13, color: INK }}>{p.empresa}</div>
                      <div style={{ fontFamily: 'var(--f-mono)', fontSize: 9, color: '#71717A', textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: 2 }}>
                        {p.rubro} · {p.contacto}
                      </div>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                        {p.productos.map(prod => (
                          <span key={prod} style={{
                            fontSize: 9, fontFamily: 'var(--f-mono)', padding: '2px 7px', borderRadius: 4,
                            background: '#F4F4F5', color: '#3F3F46', letterSpacing: '0.04em',
                          }}>
                            {prod}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{ fontFamily: 'var(--f-mono)', fontWeight: 700, fontSize: 13, color: INK }}>{ars(p.monto_ars)}</span>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: 5,
                        fontSize: 9, fontFamily: 'var(--f-mono)', letterSpacing: '0.06em', textTransform: 'uppercase',
                        padding: '3px 9px', borderRadius: 6,
                        background: `${cfg.color}14`, color: cfg.color, fontWeight: 600,
                      }}>
                        {cfg.icon} {cfg.label}
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ fontFamily: 'var(--f-mono)', fontSize: 10, color: '#71717A' }}>
                        {p.fecha_envio ? `Enviada ${formatDate(p.fecha_envio)}` : `Creada ${formatDate(p.fecha_creacion)}`}
                      </div>
                      {p.notas && (
                        <div style={{ fontFamily: 'var(--f-mono)', fontSize: 9, color: '#A1A1AA', marginTop: 2, maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {p.notas}
                        </div>
                      )}
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <Link
                          href={`/crm?company=${encodeURIComponent(p.empresa)}&rubro=${encodeURIComponent(p.rubro)}`}
                          style={{
                            display: 'inline-flex', alignItems: 'center', gap: 4, padding: '5px 10px', borderRadius: 6,
                            background: '#F4F4F5', border: '1px solid #E4E4E7', color: '#3F3F46',
                            fontFamily: 'var(--f-mono)', fontSize: 9, textDecoration: 'none',
                          }}
                        >
                          <ExternalLink size={9} /> CRM
                        </Link>
                        <button
                          onClick={() => {
                            const text = `Propuesta DIVINIA para ${p.empresa}\nProductos: ${p.productos.join(', ')}\nMonto: ${ars(p.monto_ars)}/mes`
                            navigator.clipboard.writeText(text)
                            setCopied(p.id)
                            setTimeout(() => setCopied(null), 2000)
                          }}
                          style={{
                            display: 'inline-flex', alignItems: 'center', gap: 4, padding: '5px 10px', borderRadius: 6,
                            background: '#F4F4F5', border: '1px solid #E4E4E7', color: '#3F3F46',
                            fontFamily: 'var(--f-mono)', fontSize: 9, cursor: 'pointer',
                          }}
                        >
                          {copied === p.id ? <><Check size={9} /> Copiado</> : <><Copy size={9} /> Copiar</>}
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Nueva propuesta modal */}
      {showNueva && (
        <NuevaPropuestaModal
          onClose={() => setShowNueva(false)}
          onSave={(p) => { setPropuestas(prev => [p, ...prev]); setShowNueva(false) }}
        />
      )}
      </div>
    </div>
  )
}

function NuevaPropuestaModal({ onClose, onSave }: {
  onClose: () => void
  onSave: (p: Propuesta) => void
}) {
  const [form, setForm] = useState({
    empresa: '', rubro: '', contacto: '', monto_ars: '', notas: '',
    productos: [] as string[],
  })

  function toggle(prod: string) {
    setForm(f => ({
      ...f,
      productos: f.productos.includes(prod) ? f.productos.filter(p => p !== prod) : [...f.productos, prod],
    }))
  }

  function handleSave() {
    if (!form.empresa || form.productos.length === 0) return
    onSave({
      id: `p${Date.now()}`,
      empresa: form.empresa,
      rubro: form.rubro || 'sin rubro',
      contacto: form.contacto || '—',
      productos: form.productos,
      monto_ars: Number(form.monto_ars) || 0,
      estado: 'borrador',
      fecha_creacion: new Date().toISOString().split('T')[0],
      notas: form.notas || undefined,
    })
  }

  const INK = '#09090B'
  const LIME = '#C6FF3D'

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 9999,
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
    }} onClick={onClose}>
      <div style={{
        background: '#fff', borderRadius: 16, padding: 28, width: '100%', maxWidth: 520,
        display: 'flex', flexDirection: 'column', gap: 16,
      }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h2 style={{ fontFamily: 'var(--f-display)', fontWeight: 700, fontSize: 18, color: INK, margin: 0 }}>Nueva propuesta</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#71717A', fontSize: 18 }}>×</button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {[
            { key: 'empresa', label: 'Empresa *', placeholder: 'Nombre del negocio' },
            { key: 'rubro', label: 'Rubro', placeholder: 'restaurante, clínica...' },
            { key: 'contacto', label: 'Contacto', placeholder: 'Nombre del decisor' },
            { key: 'monto_ars', label: 'Monto ARS/mes', placeholder: '85000', type: 'number' },
          ].map(f => (
            <div key={f.key}>
              <label style={{ display: 'block', fontFamily: 'var(--f-mono)', fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#71717A', marginBottom: 4 }}>{f.label}</label>
              <input
                type={f.type || 'text'}
                placeholder={f.placeholder}
                value={(form as any)[f.key]}
                onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                style={{ width: '100%', border: '1px solid #E4E4E7', borderRadius: 8, padding: '8px 10px', fontSize: 13, outline: 'none', boxSizing: 'border-box' }}
              />
            </div>
          ))}
        </div>

        <div>
          <label style={{ display: 'block', fontFamily: 'var(--f-mono)', fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#71717A', marginBottom: 8 }}>Productos *</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {PRODUCTOS_DIVINIA.map(prod => (
              <button key={prod} onClick={() => toggle(prod)} style={{
                padding: '5px 12px', borderRadius: 6, cursor: 'pointer',
                border: `1px solid ${form.productos.includes(prod) ? INK : '#E4E4E7'}`,
                background: form.productos.includes(prod) ? INK : '#F4F4F5',
                color: form.productos.includes(prod) ? '#fff' : '#3F3F46',
                fontFamily: 'var(--f-mono)', fontSize: 10,
              }}>
                {prod}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label style={{ display: 'block', fontFamily: 'var(--f-mono)', fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#71717A', marginBottom: 4 }}>Notas</label>
          <textarea
            placeholder="Notas internas, próximos pasos..."
            value={form.notas}
            onChange={e => setForm(p => ({ ...p, notas: e.target.value }))}
            rows={2}
            style={{ width: '100%', border: '1px solid #E4E4E7', borderRadius: 8, padding: '8px 10px', fontSize: 13, outline: 'none', resize: 'vertical', boxSizing: 'border-box' }}
          />
        </div>

        <button
          onClick={handleSave}
          disabled={!form.empresa || form.productos.length === 0}
          style={{
            padding: '12px', borderRadius: 9, border: 'none', cursor: 'pointer',
            background: (!form.empresa || form.productos.length === 0) ? '#E4E4E7' : INK,
            color: (!form.empresa || form.productos.length === 0) ? '#71717A' : '#fff',
            fontFamily: 'var(--f-mono)', fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase',
          }}
        >
          Guardar borrador
        </button>
      </div>
    </div>
  )
}
