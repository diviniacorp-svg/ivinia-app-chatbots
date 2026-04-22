'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'

type Track = {
  slug: string
  title: string
  description: string
  nivel: string
  duracion: string
  color: string
  lessonFiles: string[]
}

export default function AcademyDashboardPage() {
  const [tracks, setTracks] = useState<Track[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/academy/tracks')
      .then(r => r.json())
      .then(d => { setTracks(d.tracks ?? []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const totalLessons = tracks.reduce((a, t) => a + (t.lessonFiles?.length ?? 0), 0)

  return (
    <div style={{ minHeight: '100vh', background: 'var(--paper-2)', padding: '40px' }}>
      {/* Header */}
      <div style={{ marginBottom: 36 }}>
        <div style={{ fontFamily: 'var(--f-mono)', fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 8 }}>
          DIVINIA ACADEMY
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <h1 style={{ fontFamily: 'var(--f-display)', fontSize: 32, fontWeight: 800, margin: 0, letterSpacing: '-0.03em', color: 'var(--ink)' }}>
            Panel de contenido
          </h1>
          <a href="/academy" target="_blank" rel="noopener noreferrer"
            style={{ fontFamily: 'var(--f-mono)', fontSize: 12, color: 'var(--muted)', textDecoration: 'none', letterSpacing: '0.05em' }}>
            Ver Academy pública →
          </a>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 32 }}>
        {[
          { label: 'Tracks', value: tracks.length, color: '#C6FF3D' },
          { label: 'Lecciones totales', value: totalLessons, color: '#38BDF8' },
          { label: 'Estado', value: 'Activa', color: '#4ade80' },
        ].map(s => (
          <div key={s.label} style={{ background: 'var(--paper)', border: '1px solid var(--line)', borderRadius: 12, padding: '20px 24px' }}>
            <div style={{ fontFamily: 'var(--f-mono)', fontSize: 11, color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8 }}>{s.label}</div>
            <div style={{ fontSize: 28, fontWeight: 800, color: s.color, fontFamily: 'var(--f-display)' }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Tracks grid */}
      {loading ? (
        <div style={{ fontFamily: 'var(--f-mono)', fontSize: 13, color: 'var(--muted)', padding: '40px 0' }}>Cargando tracks...</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {tracks.map((track, i) => (
            <div key={track.slug} style={{
              background: 'var(--paper)', border: '1px solid var(--line)',
              borderRadius: i === 0 ? '12px 12px 0 0' : i === tracks.length - 1 ? '0 0 12px 12px' : 0,
              padding: '20px 24px',
              display: 'flex', alignItems: 'center', gap: 20,
            }}>
              {/* Color indicator */}
              <div style={{ width: 4, height: 48, borderRadius: 2, background: track.color || '#C6FF3D', flexShrink: 0 }} />

              {/* Track info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                  <span style={{ fontWeight: 700, fontSize: 15, color: 'var(--ink)' }}>{track.title}</span>
                  <span style={{ fontFamily: 'var(--f-mono)', fontSize: 10, background: 'rgba(0,0,0,0.06)', padding: '2px 8px', borderRadius: 4, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--muted)' }}>
                    {track.nivel}
                  </span>
                </div>
                <div style={{ fontSize: 13, color: 'var(--muted-2)', lineHeight: 1.4 }}>{track.description}</div>
              </div>

              {/* Lessons count */}
              <div style={{ textAlign: 'center', flexShrink: 0 }}>
                <div style={{ fontSize: 22, fontWeight: 800, fontFamily: 'var(--f-display)', color: track.color || '#C6FF3D' }}>
                  {track.lessonFiles?.length ?? 0}
                </div>
                <div style={{ fontFamily: 'var(--f-mono)', fontSize: 10, color: 'var(--muted)', letterSpacing: '0.05em' }}>
                  {track.lessonFiles?.length === 1 ? 'LECCIÓN' : 'LECCIONES'}
                </div>
              </div>

              {/* Duration */}
              <div style={{ textAlign: 'center', flexShrink: 0, minWidth: 80 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink)' }}>{track.duracion}</div>
                <div style={{ fontFamily: 'var(--f-mono)', fontSize: 10, color: 'var(--muted)', letterSpacing: '0.05em' }}>DURACIÓN</div>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                <Link href={`/academy/${track.slug}`} target="_blank"
                  style={{ fontFamily: 'var(--f-mono)', fontSize: 11, color: 'var(--muted)', textDecoration: 'none', padding: '6px 12px', border: '1px solid var(--line)', borderRadius: 6, letterSpacing: '0.05em' }}>
                  Ver →
                </Link>
                <Link href={`/academy/editor/${track.slug}`}
                  style={{ fontFamily: 'var(--f-mono)', fontSize: 11, color: 'var(--ink)', textDecoration: 'none', padding: '6px 12px', background: 'rgba(0,0,0,0.05)', borderRadius: 6, letterSpacing: '0.05em' }}>
                  Editar
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Lecciones por track detail */}
      {!loading && tracks.length > 0 && (
        <div style={{ marginTop: 40 }}>
          <div style={{ fontFamily: 'var(--f-mono)', fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 16 }}>
            DETALLE DE LECCIONES
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
            {tracks.map(track => (
              <div key={track.slug} style={{ background: 'var(--paper)', border: '1px solid var(--line)', borderRadius: 12, padding: '20px' }}>
                <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 12, color: track.color || '#C6FF3D' }}>
                  {track.title}
                </div>
                {track.lessonFiles?.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {track.lessonFiles.map((lesson, i) => {
                      const name = lesson.replace(/^\d+-/, '').replace('.md', '').replace(/-/g, ' ')
                      return (
                        <div key={lesson} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 0', borderBottom: i < track.lessonFiles.length - 1 ? '1px solid var(--line)' : 'none' }}>
                          <span style={{ fontFamily: 'var(--f-mono)', fontSize: 10, color: 'var(--muted)', width: 20, flexShrink: 0 }}>
                            {String(i + 1).padStart(2, '0')}
                          </span>
                          <span style={{ fontSize: 13, color: 'var(--ink)', textTransform: 'capitalize' }}>{name}</span>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <p style={{ fontSize: 13, color: 'var(--muted)', fontStyle: 'italic' }}>Sin lecciones todavía</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
