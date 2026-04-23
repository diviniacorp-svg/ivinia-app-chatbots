'use client'

import { useState } from 'react'

type Channel = {
  id: string
  nombre: string
  nicho: string
  color: string
  status: 'activo' | 'planificado' | 'pausado'
  subs?: number
  videos?: number
  ingresoEst?: number
}

const CHANNELS: Channel[] = [
  { id: 'mente-oscura',      nombre: 'La Mente Oscura',      nicho: 'True crime',       color: '#8B5CF6', status: 'planificado' },
  { id: 'sin-resolver',      nombre: 'Sin Resolver',          nicho: 'Misterios',        color: '#06B6D4', status: 'planificado' },
  { id: 'historia-prohibida',nombre: 'Historia Prohibida',    nicho: 'Historia oculta',  color: '#F59E0B', status: 'planificado' },
  { id: 'psicologia-real',   nombre: 'Psicología Real',       nicho: 'Psicología',       color: '#10B981', status: 'planificado' },
  { id: 'plata-de-verdad',   nombre: 'Plata de Verdad',       nicho: 'Finanzas personales', color: '#C6FF3D', status: 'planificado' },
  { id: 'el-juicio',         nombre: 'El Juicio',             nicho: 'Casos judiciales', color: '#EF4444', status: 'planificado' },
  { id: 'mundo-en-llamas',   nombre: 'Mundo en Llamas',       nicho: 'Geopolítica',      color: '#FF6B35', status: 'planificado' },
  { id: 'ciencia-extrema',   nombre: 'Ciencia Extrema',       nicho: 'Ciencia viral',    color: '#3B82F6', status: 'planificado' },
  { id: 'millonarios-caidos',nombre: 'Millonarios Caídos',    nicho: 'Finanzas drama',   color: '#F59E0B', status: 'planificado' },
  { id: 'la-conspiracion',   nombre: 'La Conspiración',       nicho: 'Conspiraciones',   color: '#6366F1', status: 'planificado' },
  { id: 'naturaleza-salvaje',nombre: 'Naturaleza Salvaje',    nicho: 'Naturaleza',       color: '#84CC16', status: 'planificado' },
  { id: 'mente-maestra',     nombre: 'Mente Maestra',         nicho: 'Estoicismo',       color: '#A78BFA', status: 'planificado' },
  { id: 'tecnologia',        nombre: 'Tecnología Sin Filtro', nicho: 'Tech / IA',        color: '#38BDF8', status: 'planificado' },
  { id: 'casos-inexplicables',nombre: 'Casos Inexplicables',  nicho: 'Paranormal',       color: '#F472B6', status: 'planificado' },
  { id: 'el-expediente',     nombre: 'El Expediente',         nicho: 'Investigación',    color: '#FB923C', status: 'planificado' },
]

const PIPELINE = [
  { paso: '01', label: 'Guión', tool: 'Claude Sonnet', icon: '✍️', desc: 'Hook + estructura + CTA, 1.200 palabras' },
  { paso: '02', label: 'Voz', tool: 'ElevenLabs', icon: '🎙️', desc: 'Narrador faceless en español neutro' },
  { paso: '03', label: 'Imágenes', tool: 'Freepik Seedance', icon: '🎬', desc: 'Video generativo + stock editorial' },
  { paso: '04', label: 'Montaje', tool: 'Remotion', icon: '⚡', desc: 'Ensamble automático con subtítulos' },
  { paso: '05', label: 'Thumbnail', tool: 'Canva API', icon: '🖼️', desc: 'Template por canal + texto generado' },
  { paso: '06', label: 'Subida', tool: 'YouTube API v3', icon: '🚀', desc: 'Título, descripción, tags y programación' },
]

export default function YouTubeEmpirePage() {
  const [selected, setSelected] = useState<Channel | null>(null)
  const [tema, setTema] = useState('')
  const [loading, setLoading] = useState(false)
  const [guion, setGuion] = useState('')

  async function generarGuion() {
    if (!tema.trim() || !selected) return
    setLoading(true)
    setGuion('')
    try {
      const res = await fetch('/api/youtube/guion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tema,
          canal: selected.nombre,
          nicho: selected.nicho,
        }),
      })
      const data = await res.json()
      setGuion(data.guion || data.error || 'Error generando guión')
    } catch {
      setGuion('Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  const activos = CHANNELS.filter(c => c.status === 'activo').length
  const planificados = CHANNELS.filter(c => c.status === 'planificado').length

  return (
    <div style={{ minHeight: '100vh', background: 'var(--paper-2)' }}>

      {/* Header */}
      <div style={{ padding: '36px 40px 28px', borderBottom: '1px solid var(--line)', background: 'var(--paper)' }}>
        <div style={{ fontFamily: 'var(--f-mono)', fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 8 }}>
          Laboratorio personal
        </div>
        <h1 style={{ fontFamily: 'var(--f-display)', fontStyle: 'italic', fontWeight: 700, fontSize: 'clamp(28px, 4vw, 42px)', color: 'var(--ink)', letterSpacing: '-0.04em', lineHeight: 1.1, margin: 0 }}>
          YouTube Empire
        </h1>
        <p style={{ marginTop: 8, fontFamily: 'var(--f-display)', fontSize: 14, color: 'var(--muted-2)', marginBottom: 0 }}>
          15 canales faceless · IA de punta a punta · monetización en piloto automático
        </p>
        <div style={{ display: 'flex', gap: 24, marginTop: 20, flexWrap: 'wrap' }}>
          {[
            { n: '15', label: 'Canales planificados' },
            { n: activos.toString() || '0', label: 'En vivo' },
            { n: '$0', label: 'Ingresos actuales' },
            { n: '$10-20k', label: 'Proyección mes 12 (USD)' },
          ].map(s => (
            <div key={s.label}>
              <div style={{ fontFamily: 'var(--f-display)', fontStyle: 'italic', fontWeight: 700, fontSize: 22, color: 'var(--ink)', letterSpacing: '-0.04em' }}>{s.n}</div>
              <div style={{ fontFamily: 'var(--f-mono)', fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--muted)' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ padding: '32px 40px', display: 'flex', flexDirection: 'column', gap: 40 }}>

        {/* Canales */}
        <div>
          <div style={{ fontFamily: 'var(--f-mono)', fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 16 }}>
            15 canales · seleccioná uno para generar contenido
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 10 }}>
            {CHANNELS.map(c => {
              const isSelected = selected?.id === c.id
              return (
                <button
                  key={c.id}
                  onClick={() => { setSelected(isSelected ? null : c); setGuion(''); setTema('') }}
                  style={{
                    padding: '16px 18px',
                    borderRadius: 10,
                    border: `1px solid ${isSelected ? c.color : 'var(--line)'}`,
                    background: isSelected ? c.color + '12' : 'var(--paper)',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.15s',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                    <div style={{
                      width: 8, height: 8, borderRadius: '50%',
                      background: c.status === 'activo' ? '#10B981' : c.color,
                      opacity: c.status === 'planificado' ? 0.4 : 1,
                    }} />
                    <span style={{
                      fontFamily: 'var(--f-mono)', fontSize: 8, textTransform: 'uppercase',
                      letterSpacing: '0.08em', color: c.status === 'activo' ? '#10B981' : 'var(--muted)',
                    }}>
                      {c.status === 'activo' ? 'live' : 'pronto'}
                    </span>
                  </div>
                  <div style={{ fontFamily: 'var(--f-display)', fontWeight: 600, fontSize: 13, color: 'var(--ink)', lineHeight: 1.3, marginBottom: 4 }}>
                    {c.nombre}
                  </div>
                  <div style={{ fontFamily: 'var(--f-mono)', fontSize: 9, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    {c.nicho}
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Generador de guiones */}
        <div style={{ background: 'var(--paper)', border: '1px solid var(--line)', borderRadius: 12, padding: 28 }}>
          <div style={{ fontFamily: 'var(--f-mono)', fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 16 }}>
            {selected ? `Generador de guión · ${selected.nombre}` : 'Generador de guión · seleccioná un canal primero'}
          </div>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <input
              value={tema}
              onChange={e => setTema(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && generarGuion()}
              placeholder={selected ? `Tema para ${selected.nicho}...` : 'Seleccioná un canal arriba'}
              disabled={!selected}
              style={{
                flex: 1, minWidth: 280, padding: '10px 16px', borderRadius: 8,
                border: '1px solid var(--line)', background: selected ? 'var(--paper-2)' : 'var(--line)',
                fontFamily: 'var(--f-display)', fontSize: 14, color: 'var(--ink)', outline: 'none',
                opacity: selected ? 1 : 0.5,
              }}
            />
            <button
              onClick={generarGuion}
              disabled={loading || !tema.trim() || !selected}
              style={{
                padding: '10px 24px', borderRadius: 8,
                background: loading || !selected ? 'var(--line)' : (selected?.color ?? 'var(--lime)'),
                border: 'none', cursor: loading || !selected ? 'default' : 'pointer',
                fontFamily: 'var(--f-mono)', fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase',
                color: selected?.color === '#C6FF3D' ? 'var(--ink)' : '#fff', fontWeight: 700,
                opacity: !selected ? 0.5 : 1,
              }}
            >
              {loading ? 'Generando...' : 'Generar guión →'}
            </button>
          </div>
          {guion && (
            <textarea
              value={guion}
              onChange={e => setGuion(e.target.value)}
              rows={22}
              style={{
                marginTop: 16, width: '100%', padding: '16px', borderRadius: 8,
                border: '1px solid var(--line)', background: 'var(--paper-2)',
                fontFamily: 'var(--f-display)', fontSize: 13, color: 'var(--ink)', lineHeight: 1.7,
                resize: 'vertical', outline: 'none', boxSizing: 'border-box',
              }}
            />
          )}
        </div>

        {/* Pipeline automático */}
        <div>
          <div style={{ fontFamily: 'var(--f-mono)', fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 16 }}>
            Pipeline de producción · 1 tema → video publicado
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 10 }}>
            {PIPELINE.map(p => (
              <div key={p.paso} style={{ background: 'var(--paper)', border: '1px solid var(--line)', borderRadius: 10, padding: '20px 20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                  <div style={{
                    fontFamily: 'var(--f-mono)', fontSize: 9, letterSpacing: '0.1em',
                    color: 'var(--lime)', border: '1px solid var(--lime)', borderRadius: 4,
                    padding: '2px 6px', flexShrink: 0,
                  }}>
                    {p.paso}
                  </div>
                  <span style={{ fontSize: 16 }}>{p.icon}</span>
                  <div style={{ fontFamily: 'var(--f-display)', fontWeight: 600, fontSize: 13, color: 'var(--ink)' }}>{p.label}</div>
                </div>
                <div style={{ fontFamily: 'var(--f-mono)', fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--lime)', marginBottom: 6 }}>{p.tool}</div>
                <div style={{ fontFamily: 'var(--f-display)', fontSize: 12, color: 'var(--muted-2)', lineHeight: 1.5 }}>{p.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Proyección */}
        <div style={{ background: 'var(--ink)', borderRadius: 12, padding: '28px 32px', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 28 }}>
          {[
            { mes: 'Mes 3', canales: '3 activos', ingresos: '$150 USD', videos: '12 videos' },
            { mes: 'Mes 6', canales: '8 activos', ingresos: '$1.200 USD', videos: '48 videos' },
            { mes: 'Mes 9', canales: '12 activos', ingresos: '$5.000 USD', videos: '96 videos' },
            { mes: 'Mes 12', canales: '15 activos', ingresos: '$10-20k USD', videos: '180 videos' },
          ].map(r => (
            <div key={r.mes}>
              <div style={{ fontFamily: 'var(--f-mono)', fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.3)', marginBottom: 10 }}>{r.mes}</div>
              <div style={{ fontFamily: 'var(--f-display)', fontStyle: 'italic', fontWeight: 700, fontSize: 22, color: 'var(--lime)', letterSpacing: '-0.04em', lineHeight: 1, marginBottom: 6 }}>{r.ingresos}</div>
              <div style={{ fontFamily: 'var(--f-display)', fontSize: 12, color: 'rgba(255,255,255,0.4)', lineHeight: 1.6 }}>
                {r.canales}<br />{r.videos}
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  )
}
