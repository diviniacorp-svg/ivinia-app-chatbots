export const dynamic = 'force-dynamic'

import { createAdminClient } from '@/lib/supabase'
import CreadorRapido from './_components/CreadorRapido'
import AgentChat from '@/components/dashboard/AgentChat'

const COPY_AGENT = { id: 'copy', nombre: 'Copy',  emoji: '✍️', rol: 'Copywriter IA',  model: 'sonnet', color: '#E879F9' }
const DISE_AGENT = { id: 'dise', nombre: 'Dise',  emoji: '🖌️', rol: 'Diseñador IA',   model: 'haiku',  color: '#E879F9' }
const REEL_AGENT = { id: 'reel', nombre: 'Reel',  emoji: '🎬', rol: 'Video Creator',  model: 'haiku',  color: '#E879F9' }

// ── Types ────────────────────────────────────────────────────────────────────

interface ContentItem {
  id: string
  titulo: string | null
  tipo: string | null
  plataforma: string | null
  estado: string | null
  fecha_publicacion: string | null
}

interface StatsData {
  totalPlanificadas: number
  publicadas: number
  enBorrador: number
  estaSemana: number
  topPlataformas: [string, number][]
}

// ── Demo fallback ─────────────────────────────────────────────────────────────

const DEMO_ITEMS: ContentItem[] = [
  { id: '1', titulo: 'Cómo el Turnero IA te ahorra 2hs por día', plataforma: 'instagram', tipo: 'Reel', estado: 'planificado', fecha_publicacion: new Date().toISOString() },
  { id: '2', titulo: 'Antes: 10 llamadas para dar un turno. Ahora: 0', plataforma: 'tiktok', tipo: 'Post', estado: 'publicado', fecha_publicacion: new Date().toISOString() },
  { id: '3', titulo: 'Newsletter: IA para PYMEs — Edición Abril', plataforma: 'email', tipo: 'Email', estado: 'borrador', fecha_publicacion: new Date().toISOString() },
  { id: '4', titulo: 'Case study: Rufina Nails + Chatbot 24hs', plataforma: 'linkedin', tipo: 'Post', estado: 'planificado', fecha_publicacion: new Date().toISOString() },
  { id: '5', titulo: 'Hook: "¿Cuánto te cuesta cada turno perdido?"', plataforma: 'instagram', tipo: 'Story', estado: 'borrador', fecha_publicacion: new Date().toISOString() },
]

// ── Data fetching ─────────────────────────────────────────────────────────────

async function getContentData(): Promise<{ items: ContentItem[]; stats: StatsData }> {
  try {
    const db = createAdminClient()
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString()

    const { data, error } = await db
      .from('content_calendar')
      .select('id, titulo, tipo, plataforma, estado, fecha_publicacion')
      .order('fecha_publicacion', { ascending: false })
      .limit(20)

    if (error) throw error

    const items = (data ?? []) as ContentItem[]

    const thisMonth = items.filter(i => i.fecha_publicacion && i.fecha_publicacion >= startOfMonth)
    const totalPlanificadas = thisMonth.filter(i => i.estado === 'planificado').length
    const publicadas = thisMonth.filter(i => i.estado === 'publicado').length
    const enBorrador = thisMonth.filter(i => i.estado === 'borrador').length
    const estaSemana = items.filter(i => i.fecha_publicacion && i.fecha_publicacion >= now.toISOString() && i.fecha_publicacion <= nextWeek).length

    const platCount: Record<string, number> = {}
    items.forEach(i => {
      if (i.plataforma) platCount[i.plataforma] = (platCount[i.plataforma] ?? 0) + 1
    })
    const topPlataformas = Object.entries(platCount).sort((a, b) => b[1] - a[1]).slice(0, 3) as [string, number][]

    return { items: items.length > 0 ? items : DEMO_ITEMS, stats: { totalPlanificadas, publicadas, enBorrador, estaSemana, topPlataformas } }
  } catch {
    const items = DEMO_ITEMS
    const platCount: Record<string, number> = {}
    items.forEach(i => { if (i.plataforma) platCount[i.plataforma] = (platCount[i.plataforma] ?? 0) + 1 })
    const topPlataformas = Object.entries(platCount).sort((a, b) => b[1] - a[1]).slice(0, 3) as [string, number][]
    return {
      items,
      stats: {
        totalPlanificadas: items.filter(i => i.estado === 'planificado').length,
        publicadas: items.filter(i => i.estado === 'publicado').length,
        enBorrador: items.filter(i => i.estado === 'borrador').length,
        estaSemana: 2,
        topPlataformas,
      },
    }
  }
}

// ── Sub-components (server) ───────────────────────────────────────────────────

function EmptyPipeline() {
  return (
    <div style={{ padding: '48px 20px', textAlign: 'center', background: 'var(--paper-2)', borderRadius: 8 }}>
      <div style={{ fontFamily: 'var(--f-display)', fontSize: 15, color: 'var(--muted)', marginBottom: 8 }}>
        No hay contenido en el pipeline todavía.
      </div>
      <div style={{ fontFamily: 'var(--f-mono)', fontSize: 11, color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
        Creá tu primer post con el panel de la izquierda →
      </div>
    </div>
  )
}

const PLATFORM_BADGE: Record<string, React.CSSProperties> = {
  instagram: { background: '#E1306C', color: 'white' },
  tiktok: { background: '#000', color: 'white' },
  linkedin: { background: '#0077B5', color: 'white' },
}

const ESTADO_BADGE: Record<string, React.CSSProperties> = {
  planificado: { background: 'rgba(198,255,61,0.15)', color: '#5A7A00' },
  publicado: { background: 'rgba(52,211,153,0.2)', color: '#065F46' },
  borrador: { background: 'rgba(251,146,60,0.15)', color: '#9A3412' },
}

const ESTADO_LABEL: Record<string, string> = {
  planificado: 'Planificado',
  publicado: 'Publicado',
  borrador: 'Borrador',
}

function ContentCard({ item }: { item: ContentItem }) {
  const plat = (item.plataforma ?? '').toLowerCase()
  const est = (item.estado ?? 'borrador').toLowerCase()
  const platStyle = PLATFORM_BADGE[plat] ?? { background: 'var(--paper)', color: 'var(--muted)' }
  const estadoStyle = ESTADO_BADGE[est] ?? ESTADO_BADGE.borrador
  const fecha = item.fecha_publicacion
    ? new Date(item.fecha_publicacion).toLocaleDateString('es-AR', { day: 'numeric', month: 'short' })
    : '—'

  return (
    <div style={{
      background: 'var(--paper-2)',
      border: '1px solid var(--line)',
      borderRadius: 8,
      padding: '16px 20px',
      marginBottom: 4,
      display: 'flex',
      gap: 16,
      alignItems: 'center',
    }}>
      <div style={{
        borderRadius: 8,
        padding: '4px 10px',
        fontFamily: 'var(--f-mono)',
        fontSize: 11,
        fontWeight: 600,
        flexShrink: 0,
        textTransform: 'capitalize',
        ...platStyle,
      }}>
        {item.plataforma ?? '—'}
      </div>

      <div style={{ flex: 1, fontFamily: 'var(--f-display)', fontSize: 15, fontWeight: 500, color: 'var(--ink)', lineHeight: 1.3 }}>
        {item.titulo ?? 'Sin título'}
      </div>

      <div style={{ fontFamily: 'var(--f-mono)', fontSize: 11, color: 'var(--muted)', flexShrink: 0 }}>
        {fecha}
      </div>

      <div style={{
        borderRadius: 20,
        padding: '4px 10px',
        fontFamily: 'var(--f-mono)',
        fontSize: 10,
        textTransform: 'uppercase',
        flexShrink: 0,
        letterSpacing: '0.06em',
        ...estadoStyle,
      }}>
        {ESTADO_LABEL[est] ?? est}
      </div>
    </div>
  )
}

function StatsPanel({ data }: { data: StatsData }) {
  const maxCount = data.topPlataformas[0]?.[1] ?? 1

  return (
    <div style={{
      background: 'var(--paper-2)',
      border: '1px solid var(--line)',
      borderRadius: 12,
      padding: 20,
      position: 'sticky',
      top: 24,
    }}>
      <div style={{
        fontFamily: 'var(--f-mono)',
        fontSize: 10,
        letterSpacing: '0.1em',
        textTransform: 'uppercase',
        color: 'var(--muted)',
        marginBottom: 20,
      }}>
        Este mes
      </div>

      {[
        { label: 'Total planificadas', value: data.totalPlanificadas },
        { label: 'Publicadas', value: data.publicadas },
        { label: 'En borrador', value: data.enBorrador },
        { label: 'Esta semana', value: data.estaSemana },
      ].map(m => (
        <div key={m.label} style={{ marginBottom: 20 }}>
          <div style={{
            fontFamily: 'var(--f-display)',
            fontSize: 32,
            fontWeight: 700,
            color: 'var(--ink)',
            lineHeight: 1,
            marginBottom: 4,
          }}>
            {m.value}
          </div>
          <div style={{
            fontFamily: 'var(--f-mono)',
            fontSize: 10,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: 'var(--muted)',
          }}>
            {m.label}
          </div>
        </div>
      ))}

      {data.topPlataformas.length > 0 && (
        <>
          <div style={{ borderTop: '1px solid var(--line)', margin: '4px 0 20px' }} />
          <div style={{
            fontFamily: 'var(--f-mono)',
            fontSize: 10,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: 'var(--muted)',
            marginBottom: 14,
          }}>
            Top plataformas
          </div>
          {data.topPlataformas.map(([plat, count]) => (
            <div key={plat} style={{ marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontFamily: 'var(--f-display)', fontSize: 13, color: 'var(--ink)', textTransform: 'capitalize' }}>
                  {plat}
                </span>
                <span style={{ fontFamily: 'var(--f-mono)', fontSize: 11, color: 'var(--muted)' }}>
                  {count}
                </span>
              </div>
              <div style={{ background: 'var(--line)', borderRadius: 4, height: 4 }}>
                <div style={{
                  background: 'var(--lime)',
                  borderRadius: 4,
                  height: 4,
                  width: `${(count / maxCount) * 100}%`,
                }} />
              </div>
            </div>
          ))}
        </>
      )}
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function ContenidoPage() {
  const { items, stats } = await getContentData()

  return (
    <div style={{ padding: '32px 40px', minHeight: '100vh', background: 'var(--paper)' }}>

      {/* HEADER */}
      <div style={{ marginBottom: 40 }}>
        <h1 style={{
          fontFamily: 'var(--f-display)',
          fontWeight: 700,
          fontSize: 32,
          letterSpacing: '-0.03em',
          color: 'var(--ink)',
          marginBottom: 6,
          margin: 0,
        }}>
          Fábrica de Contenido
        </h1>
        <p style={{
          fontFamily: 'var(--f-display)',
          fontStyle: 'italic',
          fontSize: 16,
          color: 'var(--muted)',
          marginTop: 6,
          marginBottom: 0,
        }}>
          Tu pipeline de contenido en tiempo real
        </p>
      </div>

      {/* 3 COLUMNAS */}
      <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr 220px', gap: 24, alignItems: 'start' }}>

        {/* COL IZQ — CreadorRapido (client component) */}
        <CreadorRapido />

        {/* COL CENTRO — Pipeline */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h2 style={{
              fontFamily: 'var(--f-display)',
              fontWeight: 600,
              fontSize: 18,
              color: 'var(--ink)',
              margin: 0,
            }}>
              Pipeline de contenido
            </h2>
            <button style={{
              background: 'var(--lime)',
              color: 'var(--ink)',
              border: 'none',
              borderRadius: 8,
              padding: '8px 16px',
              fontFamily: 'var(--f-mono)',
              fontSize: 11,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              cursor: 'pointer',
              fontWeight: 700,
            }}>
              + Nuevo
            </button>
          </div>

          {items.length === 0
            ? <EmptyPipeline />
            : items.map(item => <ContentCard key={item.id} item={item} />)
          }
        </div>

        {/* COL DER — Stats */}
        <StatsPanel data={stats} />

      </div>

      {/* Content Factory Team */}
      <div style={{ padding: '0 40px 40px' }}>
        <div style={{ fontFamily: 'var(--f-mono)', fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 12 }}>
          Content Factory — equipo IA en tiempo real
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: 12 }}>
          <AgentChat
            agent={COPY_AGENT}
            suggestions={['Escribí un caption para Instagram de una estética', 'Hook para reel: "antes y después del turnero"', 'CTA para cierre de mes DIVINIA']}
            collapsed={false}
          />
          <AgentChat
            agent={DISE_AGENT}
            suggestions={['Prompt Freepik para post de peluquería', 'Paleta de colores para clínica dental', 'Prompt Canva: carrusel educativo IA']}
            collapsed={true}
          />
          <AgentChat
            agent={REEL_AGENT}
            suggestions={['Prompt Freepik Kling para reel de gym', 'Storyboard de 6 clips para reel', 'Prompt de video 9:16 mostrando el chatbot']}
            collapsed={true}
          />
        </div>
      </div>

    </div>
  )
}
