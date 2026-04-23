'use client'

import { useState } from 'react'

type Etapa = 'semilla' | 'evaluando' | 'validado' | 'archivado'

type Idea = {
  id: string
  titulo: string
  descripcion: string
  etapa: Etapa
  impacto: 'alto' | 'medio' | 'bajo'
  esfuerzo: 'alto' | 'medio' | 'bajo'
  tags: string[]
  fecha: string
}

const IDEAS_INICIALES: Idea[] = [
  {
    id: '1',
    titulo: 'App DIVINIA para clientes finales',
    descripcion: 'App nativa (React Native / PWA) que el cliente usa para reservar turnos, ver historial, recibir notificaciones. Elimina la dependencia de WhatsApp.',
    etapa: 'evaluando',
    impacto: 'alto',
    esfuerzo: 'alto',
    tags: ['producto', 'mobile', 'turnero'],
    fecha: '2026-04-20',
  },
  {
    id: '2',
    titulo: 'DIVINIA para franquicias',
    descripcion: 'Un cliente con múltiples sucursales (ej. cadena de peluquerías). Panel multi-sede, reportes consolidados, precios escalonados.',
    etapa: 'semilla',
    impacto: 'alto',
    esfuerzo: 'medio',
    tags: ['producto', 'enterprise', 'turnero'],
    fecha: '2026-04-22',
  },
  {
    id: '3',
    titulo: 'Marketplace Nacional',
    descripcion: 'Replicar Market SL en otras ciudades. API-first: cada ciudad es un "tenant". Monetizar con suscripción por ciudad + % de delivery.',
    etapa: 'semilla',
    impacto: 'alto',
    esfuerzo: 'alto',
    tags: ['market', 'escalabilidad', 'nacional'],
    fecha: '2026-04-23',
  },
  {
    id: '4',
    titulo: 'Avatares IA para clínicas dentales',
    descripcion: 'Niche específico: avatar IA de recepcionista dental. Recordatorios de turnos, instrucciones post-operatorias, FAQ de tratamientos.',
    etapa: 'evaluando',
    impacto: 'medio',
    esfuerzo: 'bajo',
    tags: ['avatares', 'salud', 'nicho'],
    fecha: '2026-04-18',
  },
  {
    id: '5',
    titulo: 'DIVINIA Academy',
    descripcion: 'Cursos de IA para PYMEs. Contenido propio como lead magnet y producto independiente. Integrado al dashboard como sección /academy.',
    etapa: 'evaluando',
    impacto: 'medio',
    esfuerzo: 'medio',
    tags: ['educación', 'contenido', 'brand'],
    fecha: '2026-04-15',
  },
  {
    id: '6',
    titulo: 'Chatbot de WhatsApp Business oficial',
    descripcion: 'Integrar con API oficial de WhatsApp Business para reemplazar el actual workaround. Requiere cuenta Business verificada y meta review.',
    etapa: 'evaluando',
    impacto: 'alto',
    esfuerzo: 'alto',
    tags: ['whatsapp', 'chatbot', 'infraestructura'],
    fecha: '2026-04-10',
  },
  {
    id: '7',
    titulo: 'Programa de referidos entre PYMEs',
    descripcion: 'Cliente DIVINIA recomienda a otro comercio y recibe descuento en su próxima factura. Viralidad orgánica en redes de comerciantes locales.',
    etapa: 'semilla',
    impacto: 'alto',
    esfuerzo: 'bajo',
    tags: ['growth', 'referidos', 'ventas'],
    fecha: '2026-04-21',
  },
  {
    id: '8',
    titulo: 'Informes semanales automáticos al cliente',
    descripcion: 'Cada lunes, el cliente recibe por email/WhatsApp: turnos de la semana, nuevos clientes, ingresos estimados, comparativo. Generado con Claude.',
    etapa: 'validado',
    impacto: 'medio',
    esfuerzo: 'bajo',
    tags: ['retención', 'automatización', 'turnero'],
    fecha: '2026-04-05',
  },
]

const ETAPAS: { id: Etapa; label: string; color: string; desc: string }[] = [
  { id: 'semilla', label: 'Semilla', color: '#A78BFA', desc: 'Idea nueva, sin evaluar' },
  { id: 'evaluando', label: 'Evaluando', color: '#F59E0B', desc: 'En análisis activo' },
  { id: 'validado', label: 'Validado', color: '#10B981', desc: 'Lista para desarrollar' },
  { id: 'archivado', label: 'Archivado', color: '#6B7280', desc: 'Descartada o postergada' },
]

const IMPACTO_COLOR = { alto: '#10B981', medio: '#F59E0B', bajo: '#6B7280' }
const ESFUERZO_LABEL = { alto: '🔴 Esfuerzo alto', medio: '🟡 Esfuerzo medio', bajo: '🟢 Esfuerzo bajo' }

export default function IdeasPage() {
  const [ideas, setIdeas] = useState<Idea[]>(IDEAS_INICIALES)
  const [filtroEtapa, setFiltroEtapa] = useState<Etapa | 'todas'>('todas')
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ titulo: '', descripcion: '', impacto: 'medio' as Idea['impacto'], esfuerzo: 'medio' as Idea['esfuerzo'], tags: '' })

  const filtradas = filtroEtapa === 'todas' ? ideas : ideas.filter(i => i.etapa === filtroEtapa)

  function moverEtapa(id: string, etapa: Etapa) {
    setIdeas(prev => prev.map(i => i.id === id ? { ...i, etapa } : i))
  }

  function agregarIdea() {
    if (!form.titulo.trim()) return
    const nueva: Idea = {
      id: Date.now().toString(),
      titulo: form.titulo,
      descripcion: form.descripcion,
      etapa: 'semilla',
      impacto: form.impacto,
      esfuerzo: form.esfuerzo,
      tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
      fecha: new Date().toISOString().split('T')[0],
    }
    setIdeas(prev => [nueva, ...prev])
    setForm({ titulo: '', descripcion: '', impacto: 'medio', esfuerzo: 'medio', tags: '' })
    setShowForm(false)
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--paper-2)' }}>

      {/* Header */}
      <div style={{ padding: '36px 40px 28px', borderBottom: '1px solid var(--line)', background: 'var(--paper)' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, marginBottom: 16 }}>
          <div>
            <div style={{ fontFamily: 'var(--f-mono)', fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 8 }}>
              Laboratorio
            </div>
            <h1 style={{ fontFamily: 'var(--f-display)', fontStyle: 'italic', fontWeight: 700, fontSize: 'clamp(28px, 4vw, 42px)', color: 'var(--ink)', letterSpacing: '-0.04em', lineHeight: 1.1, margin: 0 }}>
              Banco de Ideas
            </h1>
            <p style={{ marginTop: 8, fontFamily: 'var(--f-display)', fontSize: 14, color: 'var(--muted-2)', marginBottom: 0 }}>
              Pipeline de ideas — de semilla a proyecto real
            </p>
          </div>
          <button
            onClick={() => setShowForm(s => !s)}
            style={{
              padding: '10px 20px', borderRadius: 8, background: 'var(--lime)',
              border: 'none', cursor: 'pointer', fontFamily: 'var(--f-mono)',
              fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase',
              color: 'var(--ink)', fontWeight: 700,
            }}
          >
            {showForm ? 'Cancelar' : '+ Nueva idea'}
          </button>
        </div>

        {/* Etapas summary */}
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          {ETAPAS.map(e => {
            const count = ideas.filter(i => i.etapa === e.id).length
            const active = filtroEtapa === e.id
            return (
              <button
                key={e.id}
                onClick={() => setFiltroEtapa(active ? 'todas' : e.id)}
                style={{
                  padding: '6px 14px', borderRadius: 20,
                  border: `1px solid ${active ? e.color : 'var(--line)'}`,
                  background: active ? e.color + '18' : 'transparent',
                  cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: 8,
                }}
              >
                <span style={{ fontFamily: 'var(--f-display)', fontWeight: 600, fontSize: 13, color: active ? e.color : 'var(--muted-2)' }}>
                  {e.label}
                </span>
                <span style={{
                  fontFamily: 'var(--f-mono)', fontSize: 10, fontWeight: 700,
                  color: active ? e.color : 'var(--muted)',
                }}>
                  {count}
                </span>
              </button>
            )
          })}
          {filtroEtapa !== 'todas' && (
            <button
              onClick={() => setFiltroEtapa('todas')}
              style={{ padding: '6px 14px', borderRadius: 20, border: '1px solid var(--line)', background: 'transparent', cursor: 'pointer', fontFamily: 'var(--f-mono)', fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}
            >
              Ver todas
            </button>
          )}
        </div>
      </div>

      <div style={{ padding: '32px 40px', display: 'flex', flexDirection: 'column', gap: 12 }}>

        {/* Formulario nueva idea */}
        {showForm && (
          <div style={{ background: 'var(--paper)', border: '1px solid var(--lime)', borderRadius: 12, padding: 28, marginBottom: 8 }}>
            <div style={{ fontFamily: 'var(--f-mono)', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--lime)', marginBottom: 20 }}>
              Nueva idea
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <input
                value={form.titulo}
                onChange={e => setForm(f => ({ ...f, titulo: e.target.value }))}
                placeholder="Título de la idea"
                style={{ padding: '10px 16px', borderRadius: 8, border: '1px solid var(--line)', background: 'var(--paper-2)', fontFamily: 'var(--f-display)', fontSize: 15, fontWeight: 600, color: 'var(--ink)', outline: 'none' }}
              />
              <textarea
                value={form.descripcion}
                onChange={e => setForm(f => ({ ...f, descripcion: e.target.value }))}
                placeholder="Descripción: qué es, para quién, por qué importa"
                rows={3}
                style={{ padding: '10px 16px', borderRadius: 8, border: '1px solid var(--line)', background: 'var(--paper-2)', fontFamily: 'var(--f-display)', fontSize: 14, color: 'var(--ink)', outline: 'none', resize: 'vertical' }}
              />
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: 160 }}>
                  <div style={{ fontFamily: 'var(--f-mono)', fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--muted)', marginBottom: 6 }}>Impacto</div>
                  <select value={form.impacto} onChange={e => setForm(f => ({ ...f, impacto: e.target.value as Idea['impacto'] }))}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid var(--line)', background: 'var(--paper-2)', fontFamily: 'var(--f-display)', fontSize: 13, color: 'var(--ink)', outline: 'none' }}>
                    <option value="alto">Alto</option>
                    <option value="medio">Medio</option>
                    <option value="bajo">Bajo</option>
                  </select>
                </div>
                <div style={{ flex: 1, minWidth: 160 }}>
                  <div style={{ fontFamily: 'var(--f-mono)', fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--muted)', marginBottom: 6 }}>Esfuerzo</div>
                  <select value={form.esfuerzo} onChange={e => setForm(f => ({ ...f, esfuerzo: e.target.value as Idea['esfuerzo'] }))}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid var(--line)', background: 'var(--paper-2)', fontFamily: 'var(--f-display)', fontSize: 13, color: 'var(--ink)', outline: 'none' }}>
                    <option value="alto">Alto</option>
                    <option value="medio">Medio</option>
                    <option value="bajo">Bajo</option>
                  </select>
                </div>
                <div style={{ flex: 2, minWidth: 200 }}>
                  <div style={{ fontFamily: 'var(--f-mono)', fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--muted)', marginBottom: 6 }}>Tags (separados por coma)</div>
                  <input value={form.tags} onChange={e => setForm(f => ({ ...f, tags: e.target.value }))}
                    placeholder="ej: producto, mobile, turnero"
                    style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid var(--line)', background: 'var(--paper-2)', fontFamily: 'var(--f-display)', fontSize: 13, color: 'var(--ink)', outline: 'none', boxSizing: 'border-box' }} />
                </div>
              </div>
              <button onClick={agregarIdea} style={{ alignSelf: 'flex-start', padding: '10px 24px', borderRadius: 8, background: 'var(--lime)', border: 'none', cursor: 'pointer', fontFamily: 'var(--f-mono)', fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--ink)', fontWeight: 700 }}>
                Agregar idea →
              </button>
            </div>
          </div>
        )}

        {/* Lista de ideas */}
        {filtradas.map(idea => {
          const etapa = ETAPAS.find(e => e.id === idea.etapa)!
          const siguienteEtapas = ETAPAS.filter(e => e.id !== idea.etapa && e.id !== 'archivado')
          return (
            <div key={idea.id} style={{
              background: 'var(--paper)',
              border: '1px solid var(--line)',
              borderRadius: 12,
              padding: '22px 28px',
              borderLeft: `3px solid ${etapa.color}`,
            }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8, flexWrap: 'wrap' }}>
                    <h3 style={{ fontFamily: 'var(--f-display)', fontWeight: 700, fontSize: 15, color: 'var(--ink)', margin: 0 }}>
                      {idea.titulo}
                    </h3>
                    <span style={{
                      fontFamily: 'var(--f-mono)', fontSize: 8, letterSpacing: '0.1em', textTransform: 'uppercase',
                      color: etapa.color, border: `1px solid ${etapa.color}50`, borderRadius: 4, padding: '2px 7px', flexShrink: 0,
                    }}>
                      {etapa.label}
                    </span>
                    <span style={{ fontFamily: 'var(--f-mono)', fontSize: 9, color: IMPACTO_COLOR[idea.impacto], flexShrink: 0 }}>
                      ↑ Impacto {idea.impacto}
                    </span>
                    <span style={{ fontFamily: 'var(--f-mono)', fontSize: 9, color: 'var(--muted)', flexShrink: 0 }}>
                      {ESFUERZO_LABEL[idea.esfuerzo]}
                    </span>
                  </div>
                  <p style={{ fontFamily: 'var(--f-display)', fontSize: 13, color: 'var(--muted-2)', lineHeight: 1.6, margin: '0 0 12px' }}>
                    {idea.descripcion}
                  </p>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {idea.tags.map(t => (
                      <span key={t} style={{
                        fontFamily: 'var(--f-mono)', fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.06em',
                        color: 'var(--muted)', background: 'var(--paper-2)', border: '1px solid var(--line)',
                        borderRadius: 4, padding: '2px 8px',
                      }}>
                        {t}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Acciones */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flexShrink: 0 }}>
                  {siguienteEtapas.map(e => (
                    <button
                      key={e.id}
                      onClick={() => moverEtapa(idea.id, e.id)}
                      style={{
                        padding: '5px 12px', borderRadius: 6,
                        border: `1px solid ${e.color}40`, background: e.color + '10',
                        cursor: 'pointer', fontFamily: 'var(--f-mono)', fontSize: 9,
                        letterSpacing: '0.08em', textTransform: 'uppercase', color: e.color,
                        whiteSpace: 'nowrap',
                      }}
                    >
                      → {e.label}
                    </button>
                  ))}
                  {idea.etapa !== 'archivado' && (
                    <button
                      onClick={() => moverEtapa(idea.id, 'archivado')}
                      style={{
                        padding: '5px 12px', borderRadius: 6,
                        border: '1px solid var(--line)', background: 'transparent',
                        cursor: 'pointer', fontFamily: 'var(--f-mono)', fontSize: 9,
                        letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--muted)',
                      }}
                    >
                      Archivar
                    </button>
                  )}
                </div>
              </div>
            </div>
          )
        })}

        {filtradas.length === 0 && (
          <div style={{ padding: '60px 0', textAlign: 'center', color: 'var(--muted)', fontFamily: 'var(--f-display)', fontSize: 14 }}>
            No hay ideas en esta etapa todavía.
          </div>
        )}
      </div>
    </div>
  )
}
