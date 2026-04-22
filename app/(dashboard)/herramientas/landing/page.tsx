'use client'
import { useState } from 'react'

type Servicio = { nombre: string; desc: string; precio?: string }
type Beneficio = { icon: string; titulo: string; desc: string }

type LandingConfig = {
  titulo_hero: string
  subtitulo: string
  badge: string
  servicios: Servicio[]
  beneficios: Beneficio[]
  testimonial: string
  testimonial_autor: string
  cta_principal: string
  cta_secundario: string
  color_primario: string
  color_secundario: string
  meta_title: string
  meta_description: string
}

const TONOS = [
  { value: 'cercano', label: 'Cercano' },
  { value: 'profesional', label: 'Profesional' },
  { value: 'premium', label: 'Premium' },
  { value: 'jovial', label: 'Jovial' },
] as const

const inp: React.CSSProperties = {
  background: 'var(--paper)', border: '1px solid var(--line)', borderRadius: 10,
  padding: '11px 14px', fontSize: 14, color: 'var(--ink)', width: '100%',
  outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box',
}
const label: React.CSSProperties = {
  display: 'block', fontFamily: 'var(--f-mono)', fontSize: 10,
  letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 5,
}

function LandingPreview({ config, whatsapp }: { config: LandingConfig; whatsapp: string }) {
  const bg = config.color_primario || '#06060A'
  const accent = config.color_secundario || '#C6FF3D'
  const isDark = bg.startsWith('#0') || bg.startsWith('#1') || bg === 'black'
  const textColor = isDark ? '#f0f0f0' : '#111'
  const mutedColor = isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)'
  const borderColor = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'
  const cardBg = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)'
  const waLink = `https://wa.me/${whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(`Hola! Vi tu web y quiero saber más sobre ${config.meta_title.split('|')[0].trim()}`)}`

  return (
    <div style={{ background: bg, color: textColor, fontFamily: '-apple-system,sans-serif', borderRadius: 12, overflow: 'hidden', border: `1px solid ${borderColor}` }}>
      {/* Nav */}
      <div style={{ padding: '16px 28px', borderBottom: `1px solid ${borderColor}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ fontWeight: 800, fontSize: 16, letterSpacing: '-0.03em', color: accent }}>{config.meta_title.split('|')[0].trim()}</div>
        <a href={waLink} target="_blank" rel="noopener noreferrer"
          style={{ background: accent, color: bg, borderRadius: 8, padding: '7px 16px', fontSize: 12, fontWeight: 700, textDecoration: 'none' }}>
          {config.cta_principal}
        </a>
      </div>

      {/* Hero */}
      <div style={{ padding: '60px 28px 48px', textAlign: 'center' }}>
        <div style={{ display: 'inline-block', background: `${accent}18`, border: `1px solid ${accent}40`, borderRadius: 100, padding: '5px 14px', fontSize: 11, color: accent, letterSpacing: '0.08em', marginBottom: 20, fontFamily: 'monospace' }}>
          {config.badge}
        </div>
        <h1 style={{ fontSize: 'clamp(28px,5vw,52px)', fontWeight: 900, letterSpacing: '-0.03em', margin: '0 0 16px', lineHeight: 1.1 }}>
          {config.titulo_hero}
        </h1>
        <p style={{ fontSize: 16, color: mutedColor, maxWidth: '48ch', margin: '0 auto 32px', lineHeight: 1.6 }}>
          {config.subtitulo}
        </p>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
          <a href={waLink} target="_blank" rel="noopener noreferrer"
            style={{ background: accent, color: bg, borderRadius: 12, padding: '13px 28px', fontSize: 15, fontWeight: 800, textDecoration: 'none' }}>
            {config.cta_principal}
          </a>
          <span style={{ background: cardBg, border: `1px solid ${borderColor}`, color: textColor, borderRadius: 12, padding: '13px 28px', fontSize: 15, fontWeight: 500, cursor: 'default' }}>
            {config.cta_secundario}
          </span>
        </div>
      </div>

      {/* Servicios */}
      {config.servicios?.length > 0 && (
        <div style={{ padding: '40px 28px', borderTop: `1px solid ${borderColor}` }}>
          <div style={{ fontFamily: 'monospace', fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: accent, textAlign: 'center', marginBottom: 28 }}>
            SERVICIOS
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(config.servicios.length, 3)}, 1fr)`, gap: 12 }}>
            {config.servicios.slice(0, 6).map((s, i) => (
              <div key={i} style={{ background: cardBg, border: `1px solid ${borderColor}`, borderRadius: 12, padding: '16px 18px' }}>
                <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>{s.nombre}</div>
                <div style={{ fontSize: 12, color: mutedColor, marginBottom: s.precio ? 8 : 0 }}>{s.desc}</div>
                {s.precio && <div style={{ fontWeight: 800, fontSize: 16, color: accent }}>{s.precio}</div>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Beneficios */}
      {config.beneficios?.length > 0 && (
        <div style={{ padding: '40px 28px', borderTop: `1px solid ${borderColor}` }}>
          <div style={{ fontFamily: 'monospace', fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: accent, textAlign: 'center', marginBottom: 28 }}>
            POR QUÉ ELEGIRNOS
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
            {config.beneficios.slice(0, 4).map((b, i) => (
              <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <span style={{ fontSize: 24, flexShrink: 0 }}>{b.icon}</span>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 3 }}>{b.titulo}</div>
                  <div style={{ fontSize: 12, color: mutedColor, lineHeight: 1.5 }}>{b.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Testimonial */}
      {config.testimonial && (
        <div style={{ padding: '40px 28px', textAlign: 'center', borderTop: `1px solid ${borderColor}` }}>
          <div style={{ fontSize: 28, marginBottom: 12 }}>⭐⭐⭐⭐⭐</div>
          <blockquote style={{ fontSize: 17, fontWeight: 700, letterSpacing: '-0.02em', margin: '0 0 12px', fontStyle: 'normal', maxWidth: '42ch', marginLeft: 'auto', marginRight: 'auto' }}>
            "{config.testimonial}"
          </blockquote>
          <div style={{ fontSize: 13, color: mutedColor }}>{config.testimonial_autor}</div>
        </div>
      )}

      {/* CTA Final */}
      <div style={{ padding: '40px 28px', textAlign: 'center', borderTop: `1px solid ${borderColor}`, background: `${accent}08` }}>
        <h2 style={{ fontSize: 28, fontWeight: 900, letterSpacing: '-0.03em', margin: '0 0 16px' }}>
          ¿Empezamos?
        </h2>
        <a href={waLink} target="_blank" rel="noopener noreferrer"
          style={{ display: 'inline-block', background: accent, color: bg, borderRadius: 14, padding: '16px 40px', fontSize: 16, fontWeight: 800, textDecoration: 'none' }}>
          {config.cta_principal}
        </a>
      </div>

      {/* Footer */}
      <div style={{ padding: '16px 28px', borderTop: `1px solid ${borderColor}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontFamily: 'monospace', fontSize: 11, color: mutedColor }}>{config.meta_title}</span>
        <span style={{ fontFamily: 'monospace', fontSize: 10, color: mutedColor, letterSpacing: '0.05em' }}>DIVINIA · divinia.vercel.app</span>
      </div>
    </div>
  )
}

export default function LandingGeneratorPage() {
  const [form, setForm] = useState({
    company_name: '', rubro: '', city: 'San Luis', servicios_raw: '',
    tono: 'cercano' as typeof TONOS[number]['value'],
    color_preferido: '', whatsapp: '',
  })
  const [loading, setLoading] = useState(false)
  const [config, setConfig] = useState<LandingConfig | null>(null)
  const [error, setError] = useState('')
  const [tab, setTab] = useState<'preview' | 'json'>('preview')

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  const generate = async () => {
    if (!form.company_name || !form.rubro) { setError('Completá nombre y rubro.'); return }
    setError(''); setLoading(true); setConfig(null)
    try {
      const res = await fetch('/api/agents/landing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company_name: form.company_name,
          rubro: form.rubro,
          city: form.city,
          servicios_raw: form.servicios_raw || undefined,
          tono: form.tono,
          color_preferido: form.color_preferido || undefined,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setConfig(data.config)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error inesperado')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--paper-2)', padding: '40px' }}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <a href="/herramientas" style={{ fontFamily: 'var(--f-mono)', fontSize: 11, color: 'var(--muted)', letterSpacing: '0.06em', textDecoration: 'none' }}>
          ← Herramientas IA
        </a>
        <h1 style={{ fontFamily: 'var(--f-display)', fontSize: 28, fontWeight: 800, margin: '12px 0 4px', letterSpacing: '-0.03em', color: 'var(--ink)' }}>
          Generador de Landings
        </h1>
        <p style={{ fontSize: 14, color: 'var(--muted-2)', margin: 0 }}>
          Generá el contenido completo de una landing premium para cualquier cliente en segundos.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '340px 1fr', gap: 24, alignItems: 'start' }}>
        {/* FORM */}
        <div style={{ background: 'var(--paper)', border: '1px solid var(--line)', borderRadius: 16, padding: '28px', position: 'sticky', top: 24 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={label}>NOMBRE DEL NEGOCIO *</label>
              <input style={inp} placeholder="Ej: Estética Valentina" value={form.company_name} onChange={e => set('company_name', e.target.value)} />
            </div>
            <div>
              <label style={label}>RUBRO *</label>
              <input style={inp} placeholder="Ej: peluquería, odontología" value={form.rubro} onChange={e => set('rubro', e.target.value)} />
            </div>
            <div>
              <label style={label}>CIUDAD</label>
              <input style={inp} value={form.city} onChange={e => set('city', e.target.value)} />
            </div>
            <div>
              <label style={label}>SERVICIOS (opcional)</label>
              <textarea style={{ ...inp, height: 80, resize: 'none' }} placeholder="Ej: corte pelo, barba, color..." value={form.servicios_raw} onChange={e => set('servicios_raw', e.target.value)} />
            </div>
            <div>
              <label style={label}>TONO</label>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {TONOS.map(t => (
                  <button key={t.value} onClick={() => set('tono', t.value)}
                    style={{ padding: '5px 12px', borderRadius: 8, border: '1px solid var(--line)', fontSize: 12, fontFamily: 'var(--f-mono)', cursor: 'pointer', background: form.tono === t.value ? 'var(--ink)' : 'var(--paper)', color: form.tono === t.value ? 'var(--paper)' : 'var(--muted)' }}>
                    {t.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label style={label}>COLOR ACENTO (opcional)</label>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <input type="color" style={{ width: 40, height: 36, border: '1px solid var(--line)', borderRadius: 8, padding: 2, cursor: 'pointer', background: 'var(--paper)' }} value={form.color_preferido || '#C6FF3D'} onChange={e => set('color_preferido', e.target.value)} />
                <input style={{ ...inp, flex: 1 }} placeholder="#C6FF3D" value={form.color_preferido} onChange={e => set('color_preferido', e.target.value)} />
              </div>
            </div>
            <div>
              <label style={label}>WHATSAPP DEL CLIENTE</label>
              <input style={inp} placeholder="5492664000000" value={form.whatsapp} onChange={e => set('whatsapp', e.target.value)} />
            </div>

            {error && <p style={{ color: '#ef4444', fontSize: 12, fontFamily: 'var(--f-mono)', margin: 0 }}>{error}</p>}

            <button onClick={generate} disabled={loading || !form.company_name || !form.rubro}
              style={{ background: loading ? 'rgba(198,255,61,0.4)' : 'var(--lime)', color: 'var(--ink)', border: 'none', borderRadius: 10, padding: '12px', fontSize: 14, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'var(--f-mono)', letterSpacing: '0.02em' }}>
              {loading ? 'Generando...' : 'Generar landing →'}
            </button>
          </div>
        </div>

        {/* PREVIEW */}
        <div>
          {config ? (
            <>
              {/* Tabs */}
              <div style={{ display: 'flex', gap: 4, marginBottom: 16 }}>
                {(['preview', 'json'] as const).map(t => (
                  <button key={t} onClick={() => setTab(t)}
                    style={{ fontFamily: 'var(--f-mono)', fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', padding: '7px 16px', borderRadius: 8, border: '1px solid var(--line)', background: tab === t ? 'var(--ink)' : 'var(--paper)', color: tab === t ? 'var(--paper)' : 'var(--muted)', cursor: 'pointer' }}>
                    {t === 'preview' ? 'Preview' : 'JSON'}
                  </button>
                ))}
                <span style={{ marginLeft: 'auto', fontFamily: 'var(--f-mono)', fontSize: 11, color: 'var(--muted)', alignSelf: 'center' }}>
                  {form.company_name} · {form.rubro}
                </span>
              </div>

              {tab === 'preview' ? (
                <LandingPreview config={config} whatsapp={form.whatsapp || '5492664000000'} />
              ) : (
                <div style={{ background: 'var(--paper)', border: '1px solid var(--line)', borderRadius: 12, padding: '24px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                    <span style={{ fontFamily: 'var(--f-mono)', fontSize: 11, color: 'var(--muted)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Configuración completa</span>
                    <button onClick={() => navigator.clipboard.writeText(JSON.stringify(config, null, 2))}
                      style={{ fontFamily: 'var(--f-mono)', fontSize: 11, background: 'none', border: '1px solid var(--line)', borderRadius: 6, padding: '4px 12px', cursor: 'pointer', color: 'var(--muted)' }}>
                      Copiar JSON
                    </button>
                  </div>
                  <pre style={{ fontFamily: 'var(--f-mono)', fontSize: 11, color: 'var(--ink)', whiteSpace: 'pre-wrap', lineHeight: 1.65, margin: 0, overflowX: 'auto' }}>
                    {JSON.stringify(config, null, 2)}
                  </pre>
                </div>
              )}

              {/* Meta info */}
              <div style={{ marginTop: 16, background: 'var(--paper)', border: '1px solid var(--line)', borderRadius: 12, padding: '16px 20px' }}>
                <div style={{ fontFamily: 'var(--f-mono)', fontSize: 10, color: 'var(--muted)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 8 }}>SEO</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#3b82f6', marginBottom: 4 }}>{config.meta_title}</div>
                <div style={{ fontSize: 13, color: 'var(--muted-2)' }}>{config.meta_description}</div>
              </div>
            </>
          ) : (
            <div style={{ background: 'var(--paper)', border: '1px solid var(--line)', borderRadius: 16, padding: '80px 40px', textAlign: 'center' }}>
              <div style={{ fontSize: 40, marginBottom: 16 }}>🏗️</div>
              <div style={{ fontFamily: 'var(--f-display)', fontSize: 20, fontWeight: 700, color: 'var(--ink)', marginBottom: 8 }}>
                La preview aparece acá
              </div>
              <p style={{ fontSize: 14, color: 'var(--muted-2)', maxWidth: '36ch', margin: '0 auto' }}>
                Completá los datos del cliente y hacé clic en "Generar landing". El resultado aparece en tiempo real.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
