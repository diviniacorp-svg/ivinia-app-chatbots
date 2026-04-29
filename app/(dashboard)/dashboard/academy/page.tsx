import Link from 'next/link'

export const dynamic = 'force-dynamic'

const INK = '#09090B'
const LIME = '#C6FF3D'
const PAPER = '#F6F5F2'
const LINE = '#E8E7E4'

interface Track {
  slug: string
  title?: string
  description?: string
  nivel?: string
  duracion?: string
  color?: string
  lessonFiles?: string[]
}

async function getTracks(): Promise<Track[]> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://divinia.vercel.app'
    const res = await fetch(`${baseUrl}/api/academy/tracks`, { cache: 'no-store' })
    const data = await res.json()
    return data.tracks ?? []
  } catch {
    return []
  }
}

const NIVEL_COLOR: Record<string, string> = {
  Básico: '#10B981',
  Intermedio: '#F59E0B',
  Avanzado: '#EF4444',
}

export default async function AcademyDashboardPage() {
  const tracks = await getTracks()
  const totalLessons = tracks.reduce((s, t) => s + (t.lessonFiles?.length ?? 0), 0)

  return (
    <div style={{ padding: '32px 40px', minHeight: '100vh', background: PAPER }}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ fontFamily: 'var(--f-mono)', fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 8 }}>
          Panel · Academy
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <h1 style={{ fontFamily: 'var(--f-display)', fontStyle: 'italic', fontWeight: 700, fontSize: 36, letterSpacing: '-0.03em', color: INK, margin: 0 }}>
            Academy
          </h1>
          <div style={{ display: 'flex', gap: 16 }}>
            {[
              { label: 'Tracks', val: tracks.length },
              { label: 'Lecciones', val: totalLessons },
            ].map(k => (
              <div key={k.label} style={{ textAlign: 'right' }}>
                <div style={{ fontFamily: 'var(--f-mono)', fontWeight: 700, fontSize: 22, color: INK }}>{k.val}</div>
                <div style={{ fontFamily: 'var(--f-mono)', fontSize: 9, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{k.label}</div>
              </div>
            ))}
          </div>
        </div>
        <p style={{ marginTop: 8, fontFamily: 'var(--f-mono)', fontSize: 11, color: 'var(--muted)' }}>
          Editá el contenido de cada track. Los cambios se reflejan en <Link href="/academy" target="_blank" style={{ color: LIME, fontWeight: 700 }}>/academy</Link> en tiempo real.
        </p>
      </div>

      {/* Tracks grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 12 }}>
        {tracks.map(track => {
          const color = track.color ?? '#C6FF3D'
          const lessonCount = track.lessonFiles?.length ?? 0
          return (
            <div key={track.slug} style={{
              background: '#fff', borderRadius: 14, border: `1px solid ${LINE}`,
              borderTop: `3px solid ${color}`, overflow: 'hidden',
            }}>
              <div style={{ padding: '20px 22px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontFamily: 'var(--f-display)', fontWeight: 700, fontSize: 15, color: INK, marginBottom: 4 }}>
                      {track.title ?? track.slug}
                    </div>
                    {track.description && (
                      <div style={{ fontFamily: 'var(--f-display)', fontSize: 12, color: 'var(--muted-2)', lineHeight: 1.5 }}>
                        {track.description.slice(0, 90)}{track.description.length > 90 ? '…' : ''}
                      </div>
                    )}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 16 }}>
                  {track.nivel && (
                    <span style={{
                      fontFamily: 'var(--f-mono)', fontSize: 9, letterSpacing: '0.07em', textTransform: 'uppercase',
                      padding: '2px 8px', borderRadius: 4,
                      background: `${NIVEL_COLOR[track.nivel] ?? '#71717A'}14`,
                      color: NIVEL_COLOR[track.nivel] ?? '#71717A',
                    }}>
                      {track.nivel}
                    </span>
                  )}
                  <span style={{
                    fontFamily: 'var(--f-mono)', fontSize: 9, letterSpacing: '0.07em', textTransform: 'uppercase',
                    padding: '2px 8px', borderRadius: 4, background: '#F4F4F5', color: '#71717A',
                  }}>
                    {lessonCount} lección{lessonCount !== 1 ? 'es' : ''}
                  </span>
                  {track.duracion && (
                    <span style={{
                      fontFamily: 'var(--f-mono)', fontSize: 9, letterSpacing: '0.07em', textTransform: 'uppercase',
                      padding: '2px 8px', borderRadius: 4, background: '#F4F4F5', color: '#71717A',
                    }}>
                      {track.duracion}
                    </span>
                  )}
                </div>

                {/* Lesson list */}
                {track.lessonFiles && track.lessonFiles.length > 0 && (
                  <div style={{ marginBottom: 14, display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {track.lessonFiles.map((file, i) => {
                      const lessonSlug = file.replace('.md', '')
                      return (
                        <Link
                          key={file}
                          href={`/academy/${track.slug}/${lessonSlug}`}
                          style={{
                            display: 'flex', alignItems: 'center', gap: 8,
                            fontFamily: 'var(--f-mono)', fontSize: 10, color: 'var(--muted-2)',
                            textDecoration: 'none', padding: '5px 8px', borderRadius: 6,
                            border: '1px solid transparent', transition: 'all 0.1s',
                          }}
                          title={`Ver lección en la academia pública`}
                        >
                          <span style={{
                            minWidth: 18, height: 18, background: `${color}20`, color,
                            borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontFamily: 'var(--f-mono)', fontWeight: 700, fontSize: 8,
                          }}>
                            {i + 1}
                          </span>
                          <span>{lessonSlug.replace(/^\d+-/, '').replace(/-/g, ' ')}</span>
                        </Link>
                      )
                    })}
                  </div>
                )}

                <Link
                  href={`/dashboard/academy/${track.slug}`}
                  style={{
                    display: 'block', textAlign: 'center', padding: '9px 16px', borderRadius: 9,
                    background: INK, color: LIME, textDecoration: 'none',
                    fontFamily: 'var(--f-mono)', fontWeight: 700, fontSize: 10,
                    letterSpacing: '0.08em', textTransform: 'uppercase',
                  }}
                >
                  Editar track →
                </Link>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
