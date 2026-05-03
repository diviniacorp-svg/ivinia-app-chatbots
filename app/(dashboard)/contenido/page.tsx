'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import ContentFactory from './ContentFactory'

const INK = '#0E0E0E'
const LIME = '#C6FF3D'
const PAPER = '#F6F5F2'
const LINE = '#E2E0DA'
const MUTED = '#8E8B82'

const PILARES = [
  {
    id: 'educativo', label: 'Educativo', emoji: '📚', pct: 40, color: '#7C3AED',
    desc: 'Tips, tutoriales, "sabías que...", explicá tu servicio',
    ejemplos: ['5 errores al agendar un turno', 'Cómo funciona el pago con seña', 'Qué hace diferente a [negocio]'],
  },
  {
    id: 'venta', label: 'Venta', emoji: '💰', pct: 30, color: '#16A34A',
    desc: 'Ofertas, testimonios, casos de éxito, CTA directo',
    ejemplos: ['Testimonio de cliente real', 'Promo de la semana', 'Reservá tu turno ahora'],
  },
  {
    id: 'comunidad', label: 'Comunidad', emoji: '🤝', pct: 20, color: '#0284C7',
    desc: 'Detrás de escena, el equipo, el local, el proceso',
    ejemplos: ['Un día en [negocio]', 'Presentamos a [persona]', 'Así preparamos [servicio]'],
  },
  {
    id: 'entretenimiento', label: 'Entretenimiento', emoji: '🎉', pct: 10, color: '#EA580C',
    desc: 'Humor, trends, algo inesperado que humanice la marca',
    ejemplos: ['Meme del rubro', 'Trend adaptado', 'Algo divertido que pasó hoy'],
  },
]

const PLAN_SEMANAL = [
  { dia: 'Lun', tipo: 'Carrusel', pilar: 'educativo', color: '#7C3AED', emoji: '📑' },
  { dia: 'Mar', tipo: 'Reel',     pilar: 'venta',     color: '#16A34A', emoji: '🎬' },
  { dia: 'Mié', tipo: 'Post',     pilar: 'educativo', color: '#7C3AED', emoji: '🖼️' },
  { dia: 'Jue', tipo: 'Carrusel', pilar: 'comunidad', color: '#0284C7', emoji: '📑' },
  { dia: 'Vie', tipo: 'Post',     pilar: 'venta',     color: '#16A34A', emoji: '🖼️' },
]

const TABS = [
  { id: 'clientes',   n: '0', label: 'Clientes',   desc: 'Content Factory por cliente' },
  { id: 'estrategia', n: '1', label: 'Estrategia', desc: 'Pilares y mix 40/30/20/10' },
  { id: 'crear',      n: '2', label: 'Crear',      desc: 'IA genera caption + visual' },
  { id: 'feed',       n: '3', label: 'Feed',       desc: 'Posts y estados' },
  { id: 'metricas',   n: '4', label: 'Métricas',   desc: 'Qué funciona' },
]

type ClientRow = {
  id: string
  company_name: string
  rubro: string
  phone: string
  plan: string
  estado: string
}

type ClientStats = {
  total: number
  aprobados: number
  pendientes: number
  con_cambios: number
  mes: string
}

type Post = {
  id: string
  caption: string
  scheduled_for: string | null
  status: string
  pillar: string | null
  format: string | null
  clients?: { company_name: string } | null
}

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  draft:     { label: 'Borrador',  color: MUTED },
  scheduled: { label: 'Agendado', color: '#D97706' },
  published: { label: 'Publicado',color: '#16A34A' },
  approved:  { label: 'Aprobado', color: '#2563EB' },
}

const PILAR_COLOR: Record<string, string> = {
  educativo: '#7C3AED', venta: '#16A34A', comunidad: '#0284C7', entretenimiento: '#EA580C',
}

export default function ContenidoPage() {
  const [tab, setTab] = useState('clientes')
  const [posts, setPosts] = useState<Post[]>([])
  const [loadingPosts, setLoadingPosts] = useState(false)
  const [statusFilter, setStatusFilter] = useState('todos')
  const [expandedPost, setExpandedPost] = useState<string | null>(null)

  // Content Factory por cliente
  const [clients, setClients] = useState<ClientRow[]>([])
  const [loadingClients, setLoadingClients] = useState(false)
  const [clientStats, setClientStats] = useState<Record<string, ClientStats>>({})
  const [generating, setGenerating] = useState<string | null>(null)
  const [genResult, setGenResult] = useState<Record<string, string>>({})
  const [generatingImages, setGeneratingImages] = useState<string | null>(null)
  const [imgResult, setImgResult] = useState<Record<string, string>>({})

  useEffect(() => {
    if (tab === 'clientes') {
      setLoadingClients(true)
      fetch('/api/clients')
        .then(r => r.json())
        .then(d => {
          const list: ClientRow[] = (d.clients ?? []).filter((c: ClientRow) => c.estado === 'activo' || c.plan !== 'trial')
          setClients(list)
          setLoadingClients(false)
          // Cargar stats de cada cliente en paralelo
          list.forEach(c => {
            fetch(`/api/content-factory/client?client_id=${c.id}`)
              .then(r => r.json())
              .then(s => setClientStats(prev => ({ ...prev, [c.id]: s })))
              .catch(() => {})
          })
        })
        .catch(() => setLoadingClients(false))
    }
  }, [tab])

  async function generarImagenes(client: ClientRow) {
    setGeneratingImages(client.id)
    setImgResult(prev => ({ ...prev, [client.id]: '' }))
    try {
      const res = await fetch('/api/content-factory/generate-images', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ client_id: client.id }),
      })
      const d = await res.json()
      if (d.ok) {
        setImgResult(prev => ({ ...prev, [client.id]: `✓ ${d.successful}/${d.total} imágenes` }))
        // Recargar stats
        fetch(`/api/content-factory/client?client_id=${client.id}`)
          .then(r => r.json())
          .then(s => setClientStats(prev => ({ ...prev, [client.id]: s })))
          .catch(() => {})
      } else {
        setImgResult(prev => ({ ...prev, [client.id]: `Error: ${d.error}` }))
      }
    } catch {
      setImgResult(prev => ({ ...prev, [client.id]: 'Error de conexión' }))
    } finally {
      setGeneratingImages(null)
    }
  }

  async function generarMes(client: ClientRow) {
    setGenerating(client.id)
    setGenResult(prev => ({ ...prev, [client.id]: '' }))
    try {
      const res = await fetch('/api/content-factory/client', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_id: client.id,
          business_name: client.company_name,
          rubro: client.rubro,
        }),
      })
      const d = await res.json()
      if (d.ok) {
        setGenResult(prev => ({ ...prev, [client.id]: `✓ ${d.posts_generados} posts generados` }))
        // Recargar stats
        fetch(`/api/content-factory/client?client_id=${client.id}`)
          .then(r => r.json())
          .then(s => setClientStats(prev => ({ ...prev, [client.id]: s })))
          .catch(() => {})
      } else {
        setGenResult(prev => ({ ...prev, [client.id]: `Error: ${d.error}` }))
      }
    } catch {
      setGenResult(prev => ({ ...prev, [client.id]: 'Error de conexión' }))
    } finally {
      setGenerating(null)
    }
  }

  useEffect(() => {
    if (tab === 'feed' || tab === 'metricas') {
      setLoadingPosts(true)
      fetch('/api/social/calendar')
        .then(r => r.json())
        .then(d => { setPosts(Array.isArray(d) ? d : []); setLoadingPosts(false) })
        .catch(() => setLoadingPosts(false))
    }
  }, [tab])

  const filteredPosts = posts.filter(p => statusFilter === 'todos' || p.status === statusFilter)
  const totalPosts = posts.length || 1
  const mixActual = posts.reduce((acc, p) => {
    if (p.pillar) acc[p.pillar] = (acc[p.pillar] ?? 0) + 1
    return acc
  }, {} as Record<string, number>)

  const inputStyle: React.CSSProperties = {
    fontFamily: 'var(--f-mono)', fontSize: 10, cursor: 'pointer',
  }

  return (
    <div style={{ background: PAPER, minHeight: '100vh', color: INK }}>

      {/* ── Marketing flow strip ────────────────────────────────────── */}
      <div style={{ background: INK, padding: '7px 28px', display: 'flex', alignItems: 'center', gap: 6 }}>
        <span style={{ fontFamily: 'var(--f-mono)', fontSize: 8, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.2)', marginRight: 6 }}>Marketing:</span>
        {([
          { href: '/contenido', label: '✨ Contenido', active: true },
          { href: '/publicidad', label: '📢 Publicidad', active: false },
          { href: '/redes', label: '📱 Redes', active: false },
          { href: '/outreach', label: '📞 Outreach', active: false },
        ] as const).map((s, i, arr) => (
          <span key={s.href} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Link href={s.href} style={{ fontFamily: 'var(--f-mono)', fontSize: 8.5, textDecoration: 'none', color: s.active ? LIME : 'rgba(255,255,255,0.3)', borderBottom: s.active ? `1px solid ${LIME}` : 'none', paddingBottom: s.active ? 1 : 0 }}>{s.label}</Link>
            {i < arr.length - 1 && <span style={{ color: 'rgba(255,255,255,0.15)', fontSize: 10 }}>→</span>}
          </span>
        ))}
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 6 }}>
          {[
            { href: 'https://www.instagram.com', label: '📸 IG' },
            { href: 'https://www.canva.com', label: '🎨 Canva' },
            { href: 'https://www.freepik.com/pikaso', label: '✨ Freepik' },
          ].map(t => (
            <a key={t.href} href={t.href} target="_blank" rel="noopener noreferrer" style={{ fontFamily: 'var(--f-mono)', fontSize: 8.5, color: 'rgba(255,255,255,0.35)', textDecoration: 'none' }}>
              {t.label} ↗
            </a>
          ))}
        </div>
      </div>

      {/* ── Header + tabs ────────────────────────────────────────────── */}
      <div style={{ background: '#fff', borderBottom: `1px solid ${LINE}` }}>
        <div style={{ padding: '18px 28px 0', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
          <div>
            <p style={{ fontFamily: 'var(--f-mono)', fontSize: 9, letterSpacing: '0.14em', textTransform: 'uppercase', color: MUTED, marginBottom: 4 }}>
              DIVINIA OS · MARKETING
            </p>
            <h1 style={{ fontFamily: 'var(--f-display)', fontSize: 24, fontWeight: 800, letterSpacing: '-0.03em', margin: 0 }}>
              Contenido IA
            </h1>
          </div>
          <Link href="/publicidad" style={{ padding: '7px 14px', borderRadius: 8, border: `1px solid ${LINE}`, color: MUTED, fontFamily: 'var(--f-mono)', fontSize: 10, textDecoration: 'none', marginBottom: 8 }}>
            📢 Ver campañas →
          </Link>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', padding: '0 28px' }}>
          {TABS.map((t, i) => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              display: 'flex', alignItems: 'center', gap: 8, padding: '12px 18px',
              background: 'transparent', border: 'none', cursor: 'pointer',
              borderBottom: tab === t.id ? `2px solid ${LIME}` : '2px solid transparent',
            }}>
              <span style={{ fontFamily: 'var(--f-mono)', fontSize: 9, fontWeight: 700,
                background: tab === t.id ? LIME : LINE, color: tab === t.id ? INK : MUTED,
                width: 18, height: 18, borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              }}>{t.n}</span>
              <span style={{ fontFamily: 'var(--f-mono)', fontSize: 10, fontWeight: 700, color: tab === t.id ? INK : MUTED }}>
                {t.label}
              </span>
              {i < TABS.length - 1 && (
                <span style={{ color: LINE, fontSize: 12, marginLeft: 4 }}>→</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ── Tab 0: Content Factory por cliente ───────────────────────── */}
      {tab === 'clientes' && (
        <div style={{ padding: '28px 28px 60px', maxWidth: 900 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
            <div>
              <p style={{ fontFamily: 'var(--f-mono)', fontSize: 9, letterSpacing: '0.12em', textTransform: 'uppercase', color: MUTED, marginBottom: 4 }}>
                CONTENT FACTORY — {new Date().toLocaleDateString('es-AR', { month: 'long', year: 'numeric' }).toUpperCase()}
              </p>
              <h2 style={{ fontFamily: 'var(--f-display)', fontSize: 20, fontWeight: 800, margin: 0 }}>
                Contenido por cliente
              </h2>
            </div>
            <div style={{ background: '#F0FFF4', border: '1px solid #BBF7D0', borderRadius: 8, padding: '8px 14px', fontFamily: 'var(--f-mono)', fontSize: 10, color: '#16A34A' }}>
              $80.000–$150.000/mes por cliente
            </div>
          </div>

          {loadingClients && (
            <div style={{ padding: '40px 0', textAlign: 'center', fontFamily: 'var(--f-mono)', fontSize: 11, color: MUTED }}>
              Cargando clientes…
            </div>
          )}

          {!loadingClients && clients.length === 0 && (
            <div style={{ background: '#fff', borderRadius: 12, border: `1px solid ${LINE}`, padding: '32px 24px', textAlign: 'center' }}>
              <p style={{ fontFamily: 'var(--f-display)', fontSize: 15, color: MUTED, marginBottom: 12 }}>
                No hay clientes activos todavía.
              </p>
              <a href="/clientes" style={{ fontFamily: 'var(--f-mono)', fontSize: 10, color: '#2563EB' }}>
                Ir a Clientes →
              </a>
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {clients.map(client => {
              const stats = clientStats[client.id]
              const isGen = generating === client.id
              const result = genResult[client.id]
              const allApproved = stats && stats.total > 0 && stats.aprobados === stats.total
              const hasContent = stats && stats.total > 0

              return (
                <div key={client.id} style={{
                  background: '#fff', borderRadius: 14,
                  border: `1px solid ${allApproved ? '#BBF7D0' : LINE}`,
                  padding: '18px 22px', display: 'flex', alignItems: 'center', gap: 18, flexWrap: 'wrap',
                }}>
                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 200 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <span style={{ fontFamily: 'var(--f-display)', fontSize: 15, fontWeight: 700 }}>
                        {client.company_name}
                      </span>
                      <span style={{ fontFamily: 'var(--f-mono)', fontSize: 8, letterSpacing: '0.08em', textTransform: 'uppercase', background: `${LIME}30`, color: '#3F3F46', borderRadius: 4, padding: '2px 7px' }}>
                        {client.rubro}
                      </span>
                    </div>
                    <span style={{ fontFamily: 'var(--f-mono)', fontSize: 9, color: MUTED }}>
                      {client.plan} · {client.phone || 'sin teléfono'}
                    </span>
                  </div>

                  {/* Stats del mes */}
                  {hasContent ? (
                    <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontFamily: 'var(--f-mono)', fontSize: 18, fontWeight: 700, color: INK }}>{stats.total}</div>
                        <div style={{ fontFamily: 'var(--f-mono)', fontSize: 8, color: MUTED, textTransform: 'uppercase', letterSpacing: '0.08em' }}>total</div>
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontFamily: 'var(--f-mono)', fontSize: 18, fontWeight: 700, color: '#16A34A' }}>{stats.aprobados}</div>
                        <div style={{ fontFamily: 'var(--f-mono)', fontSize: 8, color: MUTED, textTransform: 'uppercase', letterSpacing: '0.08em' }}>aprobados</div>
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontFamily: 'var(--f-mono)', fontSize: 18, fontWeight: 700, color: stats.pendientes > 0 ? '#D97706' : MUTED }}>{stats.pendientes}</div>
                        <div style={{ fontFamily: 'var(--f-mono)', fontSize: 8, color: MUTED, textTransform: 'uppercase', letterSpacing: '0.08em' }}>pendientes</div>
                      </div>
                      {stats.con_cambios > 0 && (
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ fontFamily: 'var(--f-mono)', fontSize: 18, fontWeight: 700, color: '#DC2626' }}>{stats.con_cambios}</div>
                          <div style={{ fontFamily: 'var(--f-mono)', fontSize: 8, color: MUTED, textTransform: 'uppercase', letterSpacing: '0.08em' }}>con cambios</div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div style={{ fontFamily: 'var(--f-mono)', fontSize: 10, color: MUTED }}>
                      Sin contenido este mes
                    </div>
                  )}

                  {/* Acciones */}
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                    {result && (
                      <span style={{ fontFamily: 'var(--f-mono)', fontSize: 9, color: result.startsWith('✓') ? '#16A34A' : '#DC2626' }}>
                        {result}
                      </span>
                    )}
                    {imgResult[client.id] && (
                      <span style={{ fontFamily: 'var(--f-mono)', fontSize: 9, color: imgResult[client.id].startsWith('✓') ? '#7C3AED' : '#DC2626' }}>
                        {imgResult[client.id]}
                      </span>
                    )}
                    {hasContent && (
                      <a href={`/contenido/${client.id}`} target="_blank" style={{
                        padding: '7px 14px', borderRadius: 8, border: `1px solid ${LINE}`,
                        fontFamily: 'var(--f-mono)', fontSize: 9, textDecoration: 'none', color: INK,
                      }}>
                        Ver panel cliente ↗
                      </a>
                    )}
                    {hasContent && (
                      <button
                        onClick={() => generarImagenes(client)}
                        disabled={generatingImages === client.id}
                        style={{
                          padding: '7px 14px', borderRadius: 8,
                          cursor: generatingImages === client.id ? 'wait' : 'pointer',
                          background: generatingImages === client.id ? LINE : '#F3E8FF',
                          color: '#7C3AED', border: '1px solid #DDD6FE',
                          fontFamily: 'var(--f-mono)', fontSize: 9, fontWeight: 700,
                          letterSpacing: '0.06em', textTransform: 'uppercase',
                          opacity: generatingImages === client.id ? 0.6 : 1,
                        }}
                      >
                        {generatingImages === client.id ? 'Generando…' : 'Imágenes Freepik'}
                      </button>
                    )}
                    <button
                      onClick={() => generarMes(client)}
                      disabled={isGen}
                      style={{
                        padding: '7px 16px', borderRadius: 8, cursor: isGen ? 'wait' : 'pointer',
                        background: isGen ? LINE : LIME, color: INK, border: 'none',
                        fontFamily: 'var(--f-mono)', fontSize: 9, fontWeight: 700,
                        letterSpacing: '0.06em', textTransform: 'uppercase',
                        opacity: isGen ? 0.6 : 1,
                      }}
                    >
                      {isGen ? 'Generando…' : hasContent ? 'Regenerar mes' : 'Generar mes'}
                    </button>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Instrucción SQL si la tabla no existe */}
          <div style={{ marginTop: 32, background: '#F8F7F4', borderRadius: 12, border: `1px solid ${LINE}`, padding: '18px 22px' }}>
            <p style={{ fontFamily: 'var(--f-mono)', fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase', color: MUTED, marginBottom: 8 }}>
              Setup inicial — correr en Supabase SQL Editor si es la primera vez
            </p>
            <code style={{ fontFamily: 'var(--f-mono)', fontSize: 10, color: '#52525B', display: 'block', whiteSpace: 'pre-wrap' }}>
              {`-- Ejecutar: C:/divinia/supabase-content-factory.sql`}
            </code>
          </div>
        </div>
      )}

      {/* ── Tab 1: Estrategia ─────────────────────────────────────────── */}
      {tab === 'estrategia' && (
        <div style={{ padding: '24px 28px 40px' }}>

          {/* Mix bar */}
          <div style={{ background: '#fff', borderRadius: 10, border: `1px solid ${LINE}`, padding: '18px 20px', marginBottom: 20 }}>
            <p style={{ fontFamily: 'var(--f-mono)', fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase', color: MUTED, marginBottom: 10 }}>
              Mix de contenido — 40 / 30 / 20 / 10
            </p>
            <div style={{ height: 10, borderRadius: 5, overflow: 'hidden', display: 'flex', background: LINE }}>
              {PILARES.map(p => (
                <div key={p.id} style={{ width: `${p.pct}%`, background: p.color }} title={`${p.label} ${p.pct}%`} />
              ))}
            </div>
            <div style={{ display: 'flex', gap: 18, marginTop: 10 }}>
              {PILARES.map(p => (
                <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <div style={{ width: 8, height: 8, borderRadius: 2, background: p.color, flexShrink: 0 }} />
                  <span style={{ fontFamily: 'var(--f-mono)', fontSize: 9, color: MUTED }}>{p.pct}% {p.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Pilares */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 12, marginBottom: 20 }}>
            {PILARES.map(p => (
              <div key={p.id} style={{ background: '#fff', borderRadius: 10, border: `1px solid ${LINE}`, padding: '16px 18px', borderTop: `3px solid ${p.color}` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                  <span style={{ fontSize: 20 }}>{p.emoji}</span>
                  <div>
                    <div style={{ fontFamily: 'var(--f-display)', fontSize: 13, fontWeight: 700, color: p.color }}>{p.label}</div>
                    <div style={{ fontFamily: 'var(--f-mono)', fontSize: 8, color: MUTED }}>{p.pct}% del plan</div>
                  </div>
                </div>
                <p style={{ fontFamily: 'var(--f-mono)', fontSize: 9, color: MUTED, lineHeight: 1.5, margin: '0 0 10px' }}>{p.desc}</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {p.ejemplos.map((ej, i) => (
                    <div key={i} style={{ fontFamily: 'var(--f-mono)', fontSize: 8.5, color: MUTED, paddingLeft: 10, borderLeft: `2px solid ${p.color}40` }}>
                      {ej}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Plan semanal */}
          <div style={{ background: '#fff', borderRadius: 10, border: `1px solid ${LINE}`, padding: '16px 20px', marginBottom: 20 }}>
            <p style={{ fontFamily: 'var(--f-mono)', fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase', color: MUTED, marginBottom: 14 }}>
              Plan semanal base
            </p>
            <div style={{ display: 'flex', gap: 8 }}>
              {PLAN_SEMANAL.map(d => (
                <div key={d.dia} style={{ flex: 1, background: PAPER, borderRadius: 8, border: `1px solid ${LINE}`, padding: '12px 10px', textAlign: 'center', borderTop: `3px solid ${d.color}` }}>
                  <div style={{ fontFamily: 'var(--f-mono)', fontSize: 10, fontWeight: 700, color: MUTED, marginBottom: 6 }}>{d.dia}</div>
                  <div style={{ fontSize: 18, marginBottom: 4 }}>{d.emoji}</div>
                  <div style={{ fontFamily: 'var(--f-mono)', fontSize: 9, color: d.color, fontWeight: 700 }}>{d.tipo}</div>
                  <div style={{ fontFamily: 'var(--f-mono)', fontSize: 8, color: MUTED, marginTop: 2 }}>{d.pilar}</div>
                </div>
              ))}
            </div>
          </div>

          <button onClick={() => setTab('crear')} style={{ padding: '10px 24px', borderRadius: 8, border: 'none', background: INK, color: '#fff', fontFamily: 'var(--f-mono)', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>
            Crear contenido con IA →
          </button>
        </div>
      )}

      {/* ── Tab 2: Crear ──────────────────────────────────────────────── */}
      {tab === 'crear' && (
        <div style={{ background: PAPER }}>
          <ContentFactory />
        </div>
      )}

      {/* ── Tab 3: Feed ───────────────────────────────────────────────── */}
      {tab === 'feed' && (
        <div style={{ padding: '20px 28px 40px' }}>

          <div style={{ display: 'flex', gap: 6, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ fontFamily: 'var(--f-mono)', fontSize: 8, color: MUTED, letterSpacing: '0.1em', textTransform: 'uppercase', marginRight: 4 }}>Estado:</span>
            {['todos', 'draft', 'scheduled', 'approved', 'published'].map(s => {
              const sm = STATUS_MAP[s]
              return (
                <button key={s} onClick={() => setStatusFilter(s)} style={{
                  padding: '4px 10px', borderRadius: 20, cursor: 'pointer',
                  border: `1px solid ${statusFilter === s ? (sm?.color ?? INK) : LINE}`,
                  background: statusFilter === s ? `${sm?.color ?? INK}15` : '#fff',
                  color: statusFilter === s ? (sm?.color ?? INK) : MUTED,
                  fontFamily: 'var(--f-mono)', fontSize: 9,
                }}>
                  {s === 'todos' ? 'Todos' : sm?.label ?? s}
                </button>
              )
            })}
            <Link href="/redes" style={{ marginLeft: 'auto', padding: '6px 14px', borderRadius: 8, background: INK, color: '#fff', fontFamily: 'var(--f-mono)', fontSize: 10, fontWeight: 700, textDecoration: 'none' }}>
              Ver todo en Redes →
            </Link>
          </div>

          {loadingPosts ? (
            <div style={{ fontFamily: 'var(--f-mono)', fontSize: 11, color: MUTED, padding: 40, textAlign: 'center' }}>Cargando...</div>
          ) : filteredPosts.length === 0 ? (
            <div style={{ background: '#fff', borderRadius: 12, border: `1px dashed ${LINE}`, padding: 48, textAlign: 'center' }}>
              <div style={{ fontFamily: 'var(--f-mono)', fontSize: 11, color: MUTED, marginBottom: 14 }}>No hay posts todavía</div>
              <button onClick={() => setTab('crear')} style={{ padding: '8px 20px', borderRadius: 8, border: 'none', background: INK, color: '#fff', fontFamily: 'var(--f-mono)', fontSize: 10, fontWeight: 700, cursor: 'pointer' }}>
                Crear con IA →
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {filteredPosts.map(p => {
                const sm = STATUS_MAP[p.status] ?? { label: p.status, color: MUTED }
                const pc = PILAR_COLOR[p.pillar ?? ''] ?? MUTED
                const isExpanded = expandedPost === p.id
                return (
                  <div key={p.id} style={{ background: '#fff', borderRadius: 10, border: `1px solid ${LINE}`, overflow: 'hidden' }}>
                    <div onClick={() => setExpandedPost(isExpanded ? null : p.id)} style={{ padding: '11px 16px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: pc, flexShrink: 0 }} />
                      <div style={{ flex: 1, fontFamily: 'var(--f-mono)', fontSize: 10, color: INK, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {p.caption}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                        {p.pillar && <span style={{ fontFamily: 'var(--f-mono)', fontSize: 8, color: pc }}>{p.pillar}</span>}
                        {p.scheduled_for && <span style={{ fontFamily: 'var(--f-mono)', fontSize: 8, color: MUTED }}>📅 {new Date(p.scheduled_for).toLocaleDateString('es-AR', { day: '2-digit', month: 'short' })}</span>}
                        <span style={{ fontFamily: 'var(--f-mono)', fontSize: 8, padding: '2px 7px', borderRadius: 20, background: `${sm.color}15`, color: sm.color, border: `1px solid ${sm.color}30` }}>{sm.label}</span>
                        <span style={{ color: LINE, fontSize: 12 }}>{isExpanded ? '▲' : '▼'}</span>
                      </div>
                    </div>
                    {isExpanded && (
                      <div style={{ padding: '0 16px 12px', borderTop: `1px solid ${LINE}` }}>
                        <p style={{ fontFamily: 'var(--f-mono)', fontSize: 10, color: MUTED, lineHeight: 1.6, margin: '10px 0 8px', whiteSpace: 'pre-wrap' }}>{p.caption}</p>
                        <button onClick={() => navigator.clipboard.writeText(p.caption)} style={{ padding: '4px 12px', borderRadius: 6, border: `1px solid ${LINE}`, background: '#fff', color: MUTED, fontFamily: 'var(--f-mono)', fontSize: 9, cursor: 'pointer' }}>
                          Copiar caption
                        </button>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* ── Tab 4: Métricas ───────────────────────────────────────────── */}
      {tab === 'metricas' && (
        <div style={{ padding: '20px 28px 40px' }}>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 10, marginBottom: 24 }}>
            {[
              { label: 'Total posts',  valor: posts.length,                                     color: '#2563EB' },
              { label: 'Publicados',   valor: posts.filter(p => p.status === 'published').length, color: '#16A34A' },
              { label: 'Agendados',    valor: posts.filter(p => p.status === 'scheduled').length, color: '#D97706' },
              { label: 'Borradores',   valor: posts.filter(p => p.status === 'draft').length,     color: MUTED    },
            ].map(m => (
              <div key={m.label} style={{ background: '#fff', borderRadius: 10, border: `1px solid ${LINE}`, padding: '14px 16px' }}>
                <div style={{ fontFamily: 'var(--f-mono)', fontSize: 22, fontWeight: 700, color: m.color }}>{m.valor}</div>
                <div style={{ fontFamily: 'var(--f-mono)', fontSize: 8.5, color: MUTED, marginTop: 4 }}>{m.label}</div>
              </div>
            ))}
          </div>

          {/* Mix real vs objetivo */}
          <div style={{ background: '#fff', borderRadius: 10, border: `1px solid ${LINE}`, padding: '18px 20px', marginBottom: 20 }}>
            <p style={{ fontFamily: 'var(--f-mono)', fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase', color: MUTED, marginBottom: 14 }}>Mix real vs objetivo</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {PILARES.map(p => {
                const real = Math.round(((mixActual[p.id] ?? 0) / totalPosts) * 100)
                return (
                  <div key={p.id}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                      <span style={{ fontFamily: 'var(--f-mono)', fontSize: 9, color: p.color, fontWeight: 700 }}>{p.emoji} {p.label}</span>
                      <span style={{ fontFamily: 'var(--f-mono)', fontSize: 9, color: MUTED }}>{real}% real · {p.pct}% obj</span>
                    </div>
                    <div style={{ height: 6, background: LINE, borderRadius: 3, overflow: 'hidden' }}>
                      <div style={{ width: `${Math.min(real, 100)}%`, height: '100%', background: real >= p.pct ? p.color : `${p.color}60`, borderRadius: 3 }} />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <div style={{ background: '#fff', borderRadius: 10, border: `1px solid ${LINE}`, padding: '20px', textAlign: 'center' }}>
            <p style={{ fontFamily: 'var(--f-mono)', fontSize: 10, color: MUTED, marginBottom: 10 }}>
              Métricas de Instagram — conectar cuenta para ver alcance, impresiones y engagement
            </p>
            <a href="https://www.instagram.com" target="_blank" rel="noopener noreferrer" style={{ display: 'inline-block', padding: '7px 18px', borderRadius: 8, background: '#E1306C15', color: '#E1306C', border: '1px solid #E1306C30', fontFamily: 'var(--f-mono)', fontSize: 10, textDecoration: 'none' }}>
              📸 Abrir Instagram ↗
            </a>
          </div>
        </div>
      )}
    </div>
  )
}
