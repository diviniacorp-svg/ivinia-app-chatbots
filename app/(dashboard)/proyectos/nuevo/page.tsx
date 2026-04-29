'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { STRATEGY_TEMPLATES } from '@/lib/nucleus/index'

const INK = '#09090B'
const LIME = '#C6FF3D'

type Client = { id: string; company_name: string; rubro: string; status: string }

const CATEGORIAS = [
  { value: 'turnero', label: '📅 Turnero IA' },
  { value: 'chatbot', label: '💬 Chatbot WA' },
  { value: 'landing', label: '🌐 Landing Page' },
  { value: 'content_factory', label: '🎬 Content Factory' },
  { value: 'nucleus', label: '🧠 NUCLEUS IA' },
  { value: 'ads', label: '📢 Publicidad IA' },
  { value: 'automatizacion', label: '⚡ Automatización' },
  { value: 'otro', label: '📁 Otro' },
]

const ICONS = ['📅', '💬', '🌐', '🎬', '🧠', '📢', '⚡', '🔧', '🚀', '📁', '💡', '🎯']
const COLORS = ['#C6FF3D', '#60A5FA', '#A78BFA', '#F472B6', '#FBBF24', '#4ade80', '#38BDF8', '#F87171', '#FF8C00', '#DC2828']

export default function NuevoProyectoPage() {
  const router = useRouter()
  const [clients, setClients] = useState<Client[]>([])
  const [saving, setSaving] = useState(false)
  const [autoStrategy, setAutoStrategy] = useState(false)

  const [form, setForm] = useState({
    client_id: '',
    nombre: '',
    tagline: '',
    descripcion: '',
    categoria: 'turnero',
    status: 'en-desarrollo',
    icon: '📁',
    color: '#C6FF3D',
    progreso: 0,
    fecha_entrega: '',
    presupuesto_ars: '',
  })

  useEffect(() => {
    fetch('/api/clients').then(r => r.json()).then(d => setClients(Array.isArray(d) ? d : []))
  }, [])

  function handleCategoriaChange(cat: string) {
    const catIcon: Record<string, string> = {
      turnero: '📅', chatbot: '💬', landing: '🌐', content_factory: '🎬',
      nucleus: '🧠', ads: '📢', automatizacion: '⚡', otro: '📁',
    }
    const catColor: Record<string, string> = {
      turnero: '#C6FF3D', chatbot: '#60A5FA', landing: '#38BDF8', content_factory: '#F472B6',
      nucleus: '#A78BFA', ads: '#FBBF24', automatizacion: '#4ade80', otro: '#C6FF3D',
    }
    setForm(f => ({ ...f, categoria: cat, icon: catIcon[cat] ?? '📁', color: catColor[cat] ?? '#C6FF3D' }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)

    const template = STRATEGY_TEMPLATES[form.categoria]
    const selectedClient = clients.find(c => c.id === form.client_id)
    const nombreDisplay = selectedClient ? selectedClient.company_name : 'Sin cliente asignado'

    const estrategia = autoStrategy && template ? {
      objetivo: template.objetivo,
      approach: `Proyecto ${form.categoria} para ${nombreDisplay}`,
      kpis_objetivo: template.kpis,
      riesgos: template.riesgos,
      notas: '',
    } : {}

    const proximos = template?.scope_default ?? []
    const kpis = (template?.kpis ?? []).map(k => ({ label: k.label, valor: '-', meta: k.meta }))

    const payload = {
      client_id: form.client_id || null,
      nombre: form.nombre,
      tagline: form.tagline,
      descripcion: form.descripcion,
      tipo: 'cliente',
      categoria: form.categoria,
      status: form.status,
      icon: form.icon,
      color: form.color,
      progreso: form.progreso,
      fecha_entrega: form.fecha_entrega || null,
      presupuesto_ars: form.presupuesto_ars ? parseInt(form.presupuesto_ars) : null,
      estrategia,
      proximos,
      kpis,
    }

    const res = await fetch('/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    if (res.ok) {
      const data = await res.json()
      router.push(`/proyectos/${data.id}`)
    } else {
      setSaving(false)
      alert('Error al crear el proyecto')
    }
  }

  const InputStyle: React.CSSProperties = {
    width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 8, padding: '10px 12px', color: '#fff', fontFamily: 'var(--f-mono)', fontSize: 11,
    outline: 'none', boxSizing: 'border-box',
  }
  const LabelStyle: React.CSSProperties = {
    fontFamily: 'var(--f-mono)', fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase',
    color: 'rgba(255,255,255,0.4)', display: 'block', marginBottom: 6,
  }

  return (
    <div style={{ height: '100%', overflowY: 'auto', background: INK, color: '#fff', padding: '24px 28px' }}>

      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <Link href="/proyectos" style={{ fontFamily: 'var(--f-mono)', fontSize: 9, color: 'rgba(255,255,255,0.3)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4, marginBottom: 12 }}>
          ← Proyectos
        </Link>
        <h1 style={{ fontFamily: 'var(--f-display)', fontSize: 22, fontWeight: 800, letterSpacing: '-0.03em', margin: 0 }}>
          Nuevo proyecto
        </h1>
        <p style={{ fontFamily: 'var(--f-mono)', fontSize: 10, color: 'rgba(255,255,255,0.3)', margin: '4px 0 0' }}>
          El scope y KPIs se pre-llenan según la categoría
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, maxWidth: 820 }}>

          {/* Columna izquierda */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

            {/* Cliente */}
            <div>
              <label style={LabelStyle}>Cliente</label>
              <select value={form.client_id} onChange={e => setForm(f => ({ ...f, client_id: e.target.value }))} style={{ ...InputStyle, cursor: 'pointer' }}>
                <option value="">— Sin cliente asignado —</option>
                {clients.map(c => (
                  <option key={c.id} value={c.id}>{c.company_name} ({c.rubro})</option>
                ))}
              </select>
            </div>

            {/* Nombre */}
            <div>
              <label style={LabelStyle}>Nombre del proyecto *</label>
              <input required value={form.nombre} onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))}
                placeholder="ej: Turnero — Estética Luna Llena" style={InputStyle} />
            </div>

            {/* Tagline */}
            <div>
              <label style={LabelStyle}>Tagline</label>
              <input value={form.tagline} onChange={e => setForm(f => ({ ...f, tagline: e.target.value }))}
                placeholder="Una línea que lo describe" style={InputStyle} />
            </div>

            {/* Descripción */}
            <div>
              <label style={LabelStyle}>Descripción</label>
              <textarea value={form.descripcion} onChange={e => setForm(f => ({ ...f, descripcion: e.target.value }))}
                placeholder="Contexto, por qué se hace, qué problema resuelve..."
                style={{ ...InputStyle, minHeight: 90, resize: 'vertical' }} />
            </div>

            {/* Fecha entrega y presupuesto */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={LabelStyle}>Fecha de entrega</label>
                <input type="date" value={form.fecha_entrega} onChange={e => setForm(f => ({ ...f, fecha_entrega: e.target.value }))} style={InputStyle} />
              </div>
              <div>
                <label style={LabelStyle}>Presupuesto (ARS)</label>
                <input type="number" value={form.presupuesto_ars} onChange={e => setForm(f => ({ ...f, presupuesto_ars: e.target.value }))}
                  placeholder="ej: 150000" style={InputStyle} />
              </div>
            </div>
          </div>

          {/* Columna derecha */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

            {/* Categoría */}
            <div>
              <label style={LabelStyle}>Categoría</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {CATEGORIAS.map(c => (
                  <button key={c.value} type="button" onClick={() => handleCategoriaChange(c.value)} style={{
                    padding: '5px 12px', borderRadius: 20, border: `1px solid ${form.categoria === c.value ? LIME : 'rgba(255,255,255,0.1)'}`,
                    background: form.categoria === c.value ? `${LIME}18` : 'transparent',
                    color: form.categoria === c.value ? LIME : 'rgba(255,255,255,0.4)',
                    fontFamily: 'var(--f-mono)', fontSize: 9, cursor: 'pointer',
                  }}>{c.label}</button>
                ))}
              </div>
            </div>

            {/* Status */}
            <div>
              <label style={LabelStyle}>Estado inicial</label>
              <div style={{ display: 'flex', gap: 6 }}>
                {[['en-desarrollo', 'En desarrollo'], ['activo', 'Activo'], ['idea', 'Idea']].map(([val, lbl]) => (
                  <button key={val} type="button" onClick={() => setForm(f => ({ ...f, status: val }))} style={{
                    padding: '5px 12px', borderRadius: 20, border: `1px solid ${form.status === val ? LIME : 'rgba(255,255,255,0.1)'}`,
                    background: form.status === val ? `${LIME}18` : 'transparent',
                    color: form.status === val ? LIME : 'rgba(255,255,255,0.4)',
                    fontFamily: 'var(--f-mono)', fontSize: 9, cursor: 'pointer',
                  }}>{lbl}</button>
                ))}
              </div>
            </div>

            {/* Ícono */}
            <div>
              <label style={LabelStyle}>Ícono</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {ICONS.map(icon => (
                  <button key={icon} type="button" onClick={() => setForm(f => ({ ...f, icon }))} style={{
                    width: 34, height: 34, borderRadius: 8, border: `1px solid ${form.icon === icon ? LIME : 'rgba(255,255,255,0.1)'}`,
                    background: form.icon === icon ? `${LIME}18` : 'rgba(255,255,255,0.04)',
                    fontSize: 16, cursor: 'pointer',
                  }}>{icon}</button>
                ))}
              </div>
            </div>

            {/* Color */}
            <div>
              <label style={LabelStyle}>Color del proyecto</label>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {COLORS.map(color => (
                  <button key={color} type="button" onClick={() => setForm(f => ({ ...f, color }))} style={{
                    width: 28, height: 28, borderRadius: '50%', background: color, border: `2px solid ${form.color === color ? '#fff' : 'transparent'}`,
                    cursor: 'pointer',
                  }} />
                ))}
              </div>
            </div>

            {/* Pre-llenar estrategia */}
            <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 8, border: '1px solid rgba(255,255,255,0.08)', padding: '12px 14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <input type="checkbox" id="auto-strategy" checked={autoStrategy} onChange={e => setAutoStrategy(e.target.checked)}
                  style={{ cursor: 'pointer', accentColor: LIME }} />
                <label htmlFor="auto-strategy" style={{ fontFamily: 'var(--f-mono)', fontSize: 10, color: 'rgba(255,255,255,0.7)', cursor: 'pointer' }}>
                  Pre-llenar scope y KPIs con template de {form.categoria}
                </label>
              </div>
              {autoStrategy && STRATEGY_TEMPLATES[form.categoria] && (
                <div style={{ marginTop: 10, fontFamily: 'var(--f-mono)', fontSize: 9, color: 'rgba(255,255,255,0.4)', lineHeight: 1.6 }}>
                  <div style={{ color: LIME, marginBottom: 4 }}>Objetivo:</div>
                  {STRATEGY_TEMPLATES[form.categoria].objetivo}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Submit */}
        <div style={{ marginTop: 28, display: 'flex', gap: 10 }}>
          <button type="submit" disabled={saving} style={{
            padding: '10px 28px', borderRadius: 8, border: 'none',
            background: saving ? 'rgba(198,255,61,0.4)' : LIME,
            color: INK, fontFamily: 'var(--f-mono)', fontSize: 11, fontWeight: 700,
            cursor: saving ? 'not-allowed' : 'pointer',
          }}>
            {saving ? 'Creando...' : 'Crear proyecto'}
          </button>
          <Link href="/proyectos" style={{
            padding: '10px 20px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)',
            color: 'rgba(255,255,255,0.4)', fontFamily: 'var(--f-mono)', fontSize: 11,
            textDecoration: 'none', display: 'flex', alignItems: 'center',
          }}>
            Cancelar
          </Link>
        </div>
      </form>
    </div>
  )
}
