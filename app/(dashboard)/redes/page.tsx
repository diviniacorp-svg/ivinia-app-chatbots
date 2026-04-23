export const dynamic = 'force-dynamic'

import { createAdminClient } from '@/lib/supabase'
import Link from 'next/link'

async function getRedesData() {
  try {
    const db = createAdminClient()
    const [proximosRes, borradoresRes] = await Promise.all([
      db.from('content_calendar')
        .select('id, titulo, plataforma, fecha, status')
        .in('plataforma', ['instagram', 'tiktok'])
        .eq('status', 'planificado')
        .order('fecha', { ascending: true })
        .limit(5),
      db.from('content_calendar')
        .select('id, titulo, plataforma, fecha, status')
        .eq('status', 'borrador')
        .order('fecha', { ascending: false })
        .limit(5),
    ])
    return {
      proximos: (proximosRes.data ?? []) as any[],
      borradores: (borradoresRes.data ?? []) as any[],
    }
  } catch {
    return { proximos: [], borradores: [] }
  }
}

const PLATAFORMAS = [
  { nombre: 'Instagram', emoji: '📸', key: 'instagram' },
  { nombre: 'TikTok', emoji: '🎵', key: 'tiktok' },
  { nombre: 'LinkedIn', emoji: '💼', key: 'linkedin' },
  { nombre: 'YouTube', emoji: '▶️', key: 'youtube' },
]

const PLATFORM_COLORS: Record<string, string> = {
  instagram: '#E1306C',
  tiktok: 'var(--ink)',
  linkedin: '#0077B5',
  email: '#F59E0B',
  youtube: '#FF0000',
  blog: '#8B5CF6',
}

export default async function RedesPage() {
  const { proximos, borradores } = await getRedesData()

  return (
    <div style={{ minHeight: '100vh', background: 'var(--paper-2)' }}>

      {/* Header */}
      <div style={{ padding: '36px 40px 28px', borderBottom: '1px solid var(--line)', background: 'var(--paper)' }}>
        <div style={{ fontFamily: 'var(--f-mono)', fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 8 }}>
          Dashboard · Redes Sociales
        </div>
        <h1 style={{ fontFamily: 'var(--f-display)', fontWeight: 700, fontSize: 'clamp(24px, 3vw, 36px)', color: 'var(--ink)', letterSpacing: '-0.03em', margin: 0 }}>
          Redes Sociales
        </h1>
        <p style={{ fontFamily: 'var(--f-display)', fontStyle: 'italic', fontSize: 15, color: 'var(--muted-2)', marginTop: 6 }}>
          Estado de las cuentas de DIVINIA
        </p>
      </div>

      <div style={{ padding: '28px 40px', display: 'flex', flexDirection: 'column', gap: 28 }}>

        {/* ── 4 plataformas ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
          {PLATAFORMAS.map(p => (
            <div
              key={p.key}
              style={{
                background: 'var(--paper-2)', border: '1px solid var(--line)',
                borderRadius: 12, padding: 20,
                display: 'flex', flexDirection: 'column', gap: 12,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 24 }}>{p.emoji}</span>
                <div style={{ fontFamily: 'var(--f-display)', fontWeight: 700, fontSize: 15, color: 'var(--ink)' }}>
                  {p.nombre}
                </div>
              </div>
              <div style={{ fontFamily: 'var(--f-mono)', fontSize: 11, color: 'var(--muted)', letterSpacing: '0.06em' }}>
                0 posts este mes
              </div>
              <button style={{
                padding: '8px 0', borderRadius: 6, border: '1px solid var(--line)',
                background: 'var(--paper)', color: 'var(--ink)',
                fontFamily: 'var(--f-mono)', fontSize: 10, letterSpacing: '0.08em',
                textTransform: 'uppercase', cursor: 'pointer',
              }}>
                Ver →
              </button>
            </div>
          ))}
        </div>

        {/* ── 2 columnas: próximos + borradores ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>

          {/* Próximos posts */}
          <div style={{ background: 'var(--paper)', border: '1px solid var(--line)', borderRadius: 12, overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--line)' }}>
              <div style={{ fontFamily: 'var(--f-mono)', fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--muted)' }}>
                Próximos posts · IG / TikTok
              </div>
            </div>

            {proximos.length === 0 ? (
              <div style={{ padding: '32px 20px', textAlign: 'center' }}>
                <div style={{ fontFamily: 'var(--f-display)', fontSize: 14, color: 'var(--muted-2)', marginBottom: 12, lineHeight: 1.5 }}>
                  No hay posts planificados.
                </div>
                <Link
                  href="/dashboard/contenido"
                  style={{
                    fontFamily: 'var(--f-mono)', fontSize: 10, letterSpacing: '0.08em',
                    textTransform: 'uppercase', color: 'var(--ink)', textDecoration: 'underline',
                  }}
                >
                  Creá uno en Fábrica de Contenido →
                </Link>
              </div>
            ) : (
              <div>
                {proximos.map((item: any, i: number) => {
                  const fecha = item.fecha
                    ? new Date(item.fecha).toLocaleDateString('es-AR', { day: 'numeric', month: 'short' })
                    : '—'
                  const color = PLATFORM_COLORS[item.plataforma?.toLowerCase()] ?? 'var(--muted)'
                  return (
                    <div
                      key={item.id}
                      style={{
                        padding: '14px 20px',
                        borderBottom: i < proximos.length - 1 ? '1px solid var(--line)' : 'none',
                        display: 'flex', alignItems: 'center', gap: 10,
                      }}
                    >
                      <div style={{ width: 6, height: 6, borderRadius: '50%', background: color, flexShrink: 0 }} />
                      <div style={{ flex: 1, fontFamily: 'var(--f-display)', fontSize: 14, color: 'var(--ink)' }}>
                        {item.titulo ?? 'Sin título'}
                      </div>
                      <div style={{ fontFamily: 'var(--f-mono)', fontSize: 11, color: 'var(--muted)' }}>
                        {fecha}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Borradores */}
          <div style={{ background: 'var(--paper)', border: '1px solid var(--line)', borderRadius: 12, overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--line)' }}>
              <div style={{ fontFamily: 'var(--f-mono)', fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--muted)' }}>
                Ideas en borrador
              </div>
            </div>

            {borradores.length === 0 ? (
              <div style={{ padding: '32px 20px', textAlign: 'center' }}>
                <div style={{ fontFamily: 'var(--f-display)', fontSize: 14, color: 'var(--muted-2)', lineHeight: 1.5 }}>
                  No hay borradores guardados.
                </div>
              </div>
            ) : (
              <div>
                {borradores.map((item: any, i: number) => {
                  const color = PLATFORM_COLORS[item.plataforma?.toLowerCase()] ?? 'var(--muted)'
                  return (
                    <div
                      key={item.id}
                      style={{
                        padding: '14px 20px',
                        borderBottom: i < borradores.length - 1 ? '1px solid var(--line)' : 'none',
                        display: 'flex', alignItems: 'center', gap: 10,
                      }}
                    >
                      <div style={{ width: 6, height: 6, borderRadius: '50%', background: color, flexShrink: 0 }} />
                      <div style={{ flex: 1, fontFamily: 'var(--f-display)', fontSize: 14, color: 'var(--ink)' }}>
                        {item.titulo ?? 'Sin título'}
                      </div>
                      <div style={{
                        padding: '3px 8px', borderRadius: 4,
                        background: '#FED7AA', color: '#92400E',
                        fontFamily: 'var(--f-mono)', fontSize: 10, letterSpacing: '0.06em',
                        textTransform: 'uppercase',
                      }}>
                        Borrador
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}
