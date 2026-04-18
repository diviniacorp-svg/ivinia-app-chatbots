export const dynamic = 'force-dynamic'

import { createAdminClient } from '@/lib/supabase'
import Link from 'next/link'

async function getContentData() {
  try {
    const db = createAdminClient()
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString()
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay())).toISOString()

    const { data } = await db
      .from('content_calendar')
      .select('id, titulo, tipo, plataforma, estado, fecha_publicacion, contenido')
      .order('fecha_publicacion', { ascending: false })
      .limit(20)

    const items = (data ?? []) as any[]

    const thisMonth = items.filter((i: any) => {
      const d = i.fecha_publicacion
      return d >= startOfMonth && d <= endOfMonth
    })

    const totalPlanificado = thisMonth.filter((i: any) => i.estado === 'planificado').length
    const publicados = thisMonth.filter((i: any) => i.estado === 'publicado').length
    const borradores = thisMonth.filter((i: any) => i.estado === 'borrador').length
    const estaSemana = items.filter((i: any) => i.fecha_publicacion >= startOfWeek).length

    const platCount: Record<string, number> = {}
    items.forEach((i: any) => {
      if (i.plataforma) platCount[i.plataforma] = (platCount[i.plataforma] ?? 0) + 1
    })
    const topPlats = Object.entries(platCount).sort((a, b) => b[1] - a[1]).slice(0, 3)

    return { items, totalPlanificado, publicados, borradores, estaSemana, topPlats }
  } catch {
    return { items: [], totalPlanificado: 0, publicados: 0, borradores: 0, estaSemana: 0, topPlats: [] }
  }
}

const PLATFORM_COLORS: Record<string, string> = {
  instagram: '#E1306C',
  tiktok: '#000000',
  linkedin: '#0077B5',
  email: '#F59E0B',
  blog: '#8B5CF6',
  youtube: '#FF0000',
}

const ESTADO_STYLES: Record<string, { bg: string; color: string; label: string }> = {
  planificado: { bg: 'var(--paper-2)', color: 'var(--ink)', label: 'Planificado' },
  publicado: { bg: 'var(--lime)', color: 'var(--ink)', label: 'Publicado' },
  borrador: { bg: '#FED7AA', color: '#92400E', label: 'Borrador' },
}

const QUICK_TEMPLATES = [
  { label: 'Hook de problema', brief: 'Empezá con una pregunta o dolor del cliente objetivo' },
  { label: 'Before/After', brief: 'Mostrá el antes y después de usar el producto/servicio' },
  { label: 'CTA directo', brief: 'Post corto con llamada a la acción clara al final' },
]

export default async function ContenidoPage() {
  const { items, totalPlanificado, publicados, borradores, estaSemana, topPlats } = await getContentData()

  return (
    <div style={{ minHeight: '100vh', background: 'var(--paper-2)' }}>

      {/* Header */}
      <div style={{ padding: '36px 40px 28px', borderBottom: '1px solid var(--line)', background: 'var(--paper)' }}>
        <div style={{ fontFamily: 'var(--f-mono)', fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 8 }}>
          Dashboard · Contenido
        </div>
        <h1 style={{ fontFamily: 'var(--f-display)', fontWeight: 700, fontSize: 'clamp(24px, 3vw, 36px)', color: 'var(--ink)', letterSpacing: '-0.03em', margin: 0 }}>
          Fábrica de Contenido
        </h1>
        <p style={{ fontFamily: 'var(--f-display)', fontStyle: 'italic', fontSize: 15, color: 'var(--muted-2)', marginTop: 6 }}>
          Tu pipeline de contenido en tiempo real
        </p>
      </div>

      {/* 3-col layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr 240px', gap: '24px', padding: '28px 40px', alignItems: 'start' }}>

        {/* ── Col izquierda: Creación rápida ── */}
        <div style={{ background: 'var(--paper)', border: '1px solid var(--line)', borderRadius: 12, padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ fontFamily: 'var(--f-mono)', fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--muted)' }}>
            Creación rápida
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <label style={{ fontFamily: 'var(--f-mono)', fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--muted)' }}>
              Tipo
            </label>
            <select style={{
              width: '100%', padding: '8px 12px', border: '1px solid var(--line)',
              borderRadius: 8, background: 'var(--paper-2)', color: 'var(--ink)',
              fontFamily: 'var(--f-display)', fontSize: 14, outline: 'none',
            }}>
              <option value="post">Post</option>
              <option value="reel">Reel</option>
              <option value="story">Story</option>
              <option value="email">Email</option>
              <option value="blog">Blog</option>
            </select>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <label style={{ fontFamily: 'var(--f-mono)', fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--muted)' }}>
              Plataforma
            </label>
            <select style={{
              width: '100%', padding: '8px 12px', border: '1px solid var(--line)',
              borderRadius: 8, background: 'var(--paper-2)', color: 'var(--ink)',
              fontFamily: 'var(--f-display)', fontSize: 14, outline: 'none',
            }}>
              <option value="instagram">Instagram</option>
              <option value="tiktok">TikTok</option>
              <option value="linkedin">LinkedIn</option>
              <option value="email">Email</option>
              <option value="blog">Blog</option>
            </select>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <label style={{ fontFamily: 'var(--f-mono)', fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--muted)' }}>
              Tema / Brief
            </label>
            <textarea
              rows={3}
              placeholder="Describí de qué trata el contenido..."
              style={{
                width: '100%', padding: '10px 12px', border: '1px solid var(--line)',
                borderRadius: 8, background: 'var(--paper-2)', color: 'var(--ink)',
                fontFamily: 'var(--f-display)', fontSize: 14, resize: 'vertical',
                outline: 'none', boxSizing: 'border-box',
              }}
            />
          </div>

          <button
            onClick={() => console.log('Generar con IA')}
            style={{
              width: '100%', padding: '11px 0', borderRadius: 8,
              background: 'var(--ink)', color: 'var(--lime)',
              fontFamily: 'var(--f-mono)', fontSize: 11, letterSpacing: '0.08em',
              textTransform: 'uppercase', border: 'none', cursor: 'pointer',
            }}
          >
            Generar con IA →
          </button>

          {/* Plantillas rápidas */}
          <div style={{ borderTop: '1px solid var(--line)', paddingTop: 16 }}>
            <div style={{ fontFamily: 'var(--f-mono)', fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 10 }}>
              Plantillas rápidas
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {QUICK_TEMPLATES.map(t => (
                <div
                  key={t.label}
                  style={{
                    padding: '10px 12px', border: '1px solid var(--line)',
                    borderRadius: 8, background: 'var(--paper-2)', cursor: 'pointer',
                  }}
                >
                  <div style={{ fontFamily: 'var(--f-display)', fontWeight: 600, fontSize: 13, color: 'var(--ink)', marginBottom: 3 }}>
                    {t.label}
                  </div>
                  <div style={{ fontFamily: 'var(--f-display)', fontSize: 11, color: 'var(--muted-2)', lineHeight: 1.4 }}>
                    {t.brief}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Col central: Calendario ── */}
        <div style={{ background: 'var(--paper)', border: '1px solid var(--line)', borderRadius: 12, overflow: 'hidden' }}>
          <div style={{
            padding: '16px 20px', borderBottom: '1px solid var(--line)',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          }}>
            <div style={{ fontFamily: 'var(--f-mono)', fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--muted)' }}>
              Calendario · últimos 20 items
            </div>
            <button style={{
              width: 28, height: 28, borderRadius: 6, border: '1px solid var(--line)',
              background: 'var(--paper-2)', color: 'var(--ink)', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'var(--f-mono)', fontSize: 16, lineHeight: 1,
            }}>
              +
            </button>
          </div>

          {items.length === 0 ? (
            <div style={{ padding: '48px 20px', textAlign: 'center' }}>
              <div style={{ fontFamily: 'var(--f-display)', fontSize: 15, color: 'var(--muted-2)', marginBottom: 16 }}>
                No hay contenido en el calendario todavía.
              </div>
              <div style={{ fontFamily: 'var(--f-mono)', fontSize: 11, color: 'var(--muted)', letterSpacing: '0.08em' }}>
                Creá tu primer post con el panel de la izquierda →
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {items.map((item: any, i: number) => {
                const platColor = PLATFORM_COLORS[item.plataforma?.toLowerCase()] ?? 'var(--muted)'
                const estado = ESTADO_STYLES[item.estado?.toLowerCase()] ?? ESTADO_STYLES.borrador
                const fecha = item.fecha_publicacion
                  ? new Date(item.fecha_publicacion).toLocaleDateString('es-AR', { day: 'numeric', month: 'short' })
                  : '—'

                return (
                  <div
                    key={item.id}
                    style={{
                      padding: '14px 20px',
                      borderBottom: i < items.length - 1 ? '1px solid var(--line)' : 'none',
                      display: 'flex', alignItems: 'center', gap: 12,
                    }}
                  >
                    {/* Platform badge */}
                    <div style={{
                      minWidth: 8, height: 8, borderRadius: '50%',
                      background: platColor, flexShrink: 0,
                    }} />

                    {/* Platform name */}
                    <div style={{
                      fontFamily: 'var(--f-mono)', fontSize: 10, letterSpacing: '0.06em',
                      textTransform: 'uppercase', color: platColor, minWidth: 72, flexShrink: 0,
                    }}>
                      {item.plataforma ?? '—'}
                    </div>

                    {/* Title */}
                    <div style={{ flex: 1, fontFamily: 'var(--f-display)', fontSize: 14, color: 'var(--ink)', lineHeight: 1.3 }}>
                      {item.titulo ?? 'Sin título'}
                    </div>

                    {/* Fecha */}
                    <div style={{ fontFamily: 'var(--f-mono)', fontSize: 11, color: 'var(--muted)', minWidth: 48, textAlign: 'right' }}>
                      {fecha}
                    </div>

                    {/* Estado badge */}
                    <div style={{
                      padding: '3px 8px', borderRadius: 4,
                      background: estado.bg, color: estado.color,
                      fontFamily: 'var(--f-mono)', fontSize: 10, letterSpacing: '0.06em',
                      textTransform: 'uppercase', flexShrink: 0,
                    }}>
                      {estado.label}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* ── Col derecha: Stats ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ background: 'var(--paper)', border: '1px solid var(--line)', borderRadius: 12, padding: 20 }}>
            <div style={{ fontFamily: 'var(--f-mono)', fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 16 }}>
              Stats del mes
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                { label: 'Total planificado', value: totalPlanificado },
                { label: 'Publicados', value: publicados },
                { label: 'En borrador', value: borradores },
                { label: 'Esta semana', value: estaSemana },
              ].map(s => (
                <div key={s.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <div style={{ fontFamily: 'var(--f-display)', fontSize: 13, color: 'var(--muted-2)' }}>
                    {s.label}
                  </div>
                  <div style={{ fontFamily: 'var(--f-display)', fontWeight: 700, fontSize: 22, color: 'var(--ink)', letterSpacing: '-0.03em' }}>
                    {s.value}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {topPlats.length > 0 && (
            <div style={{ background: 'var(--paper)', border: '1px solid var(--line)', borderRadius: 12, padding: 20 }}>
              <div style={{ fontFamily: 'var(--f-mono)', fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 16 }}>
                Plataformas activas
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {topPlats.map(([plat, count]) => (
                  <div key={plat} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{
                        width: 8, height: 8, borderRadius: '50%',
                        background: PLATFORM_COLORS[plat.toLowerCase()] ?? 'var(--muted)',
                      }} />
                      <div style={{ fontFamily: 'var(--f-display)', fontSize: 13, color: 'var(--ink)', textTransform: 'capitalize' }}>
                        {plat}
                      </div>
                    </div>
                    <div style={{ fontFamily: 'var(--f-mono)', fontSize: 12, color: 'var(--muted)' }}>
                      {count} posts
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <Link
            href="/dashboard/contenido/pipeline"
            style={{
              display: 'block', padding: '12px 16px', borderRadius: 10,
              background: 'var(--ink)', color: 'var(--lime)',
              fontFamily: 'var(--f-mono)', fontSize: 10, letterSpacing: '0.08em',
              textTransform: 'uppercase', textDecoration: 'none', textAlign: 'center',
            }}
          >
            Pipeline IA →
          </Link>
        </div>

      </div>
    </div>
  )
}
