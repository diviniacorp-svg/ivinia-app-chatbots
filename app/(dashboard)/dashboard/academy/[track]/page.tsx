import fs from 'fs'
import path from 'path'
import Link from 'next/link'
import { notFound } from 'next/navigation'

function parseFrontmatter(raw: string): Record<string, any> {
  const match = raw.match(/^---\n([\s\S]*?)\n---/)
  if (!match) return {}
  const obj: Record<string, any> = {}
  match[1].split('\n').forEach(line => {
    const [k, ...v] = line.split(':')
    if (k && v.length) obj[k.trim()] = v.join(':').trim().replace(/^"(.*)"$/, '$1')
  })
  return obj
}

export default function AcademyTrackEditorPage({ params }: { params: { track: string } }) {
  const { track } = params
  const trackDir = path.join(process.cwd(), 'content', 'academy', track)

  if (!fs.existsSync(trackDir)) notFound()

  const trackRaw = fs.readFileSync(path.join(trackDir, 'track.md'), 'utf-8')
  const trackMeta = parseFrontmatter(trackRaw)

  const lessonsDir = path.join(trackDir, 'lessons')
  const lessons = fs.existsSync(lessonsDir)
    ? fs.readdirSync(lessonsDir)
        .filter(f => f.endsWith('.md'))
        .sort()
        .map(file => {
          const raw = fs.readFileSync(path.join(lessonsDir, file), 'utf-8')
          const meta = parseFrontmatter(raw)
          return { file, slug: file.replace('.md', ''), ...meta }
        })
    : []

  return (
    <div style={{ minHeight: '100vh', background: 'var(--paper-2)' }}>

      {/* Header */}
      <div style={{ padding: '36px 40px 28px', borderBottom: '1px solid var(--line)', background: 'var(--paper)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <Link
            href="/dashboard/academy"
            style={{
              fontFamily: 'var(--f-mono)', fontSize: 10, letterSpacing: '0.08em',
              textTransform: 'uppercase', color: 'var(--muted)', textDecoration: 'none',
            }}
          >
            ← Academy
          </Link>
          <span style={{ color: 'var(--muted)' }}>·</span>
          <span style={{ fontFamily: 'var(--f-mono)', fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--muted)' }}>
            {track}
          </span>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{
              width: 16, height: 16, borderRadius: '50%',
              background: trackMeta.color ?? 'var(--muted)', flexShrink: 0,
            }} />
            <div>
              <h1 style={{ fontFamily: 'var(--f-display)', fontWeight: 700, fontSize: 'clamp(20px, 2.5vw, 30px)', color: 'var(--ink)', letterSpacing: '-0.03em', margin: 0 }}>
                {trackMeta.title ?? track}
              </h1>
              <p style={{ fontFamily: 'var(--f-mono)', fontSize: 11, color: 'var(--muted)', marginTop: 5, letterSpacing: '0.04em' }}>
                {trackMeta.nivel} · {lessons.length} lecciones · {trackMeta.duracion ?? '—'}
              </p>
            </div>
          </div>

          <button
            style={{
              padding: '9px 18px', borderRadius: 8, border: '1px solid var(--lime)',
              fontFamily: 'var(--f-mono)', fontSize: 10, letterSpacing: '0.08em',
              textTransform: 'uppercase', color: 'var(--ink)', cursor: 'pointer',
              background: 'var(--lime)',
            }}
          >
            + Nueva lección
          </button>
        </div>
      </div>

      {/* Lessons list */}
      <div style={{ padding: '28px 40px' }}>
        <div style={{ fontFamily: 'var(--f-mono)', fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 16 }}>
          Lecciones
        </div>

        {lessons.length === 0 ? (
          <div style={{ padding: '32px 0', textAlign: 'center' }}>
            <div style={{ fontFamily: 'var(--f-display)', fontSize: 14, color: 'var(--muted-2)' }}>
              No hay lecciones en este track todavía.
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {lessons.map((lesson: any, i: number) => (
              <div
                key={lesson.slug}
                style={{
                  background: 'var(--paper)', border: '1px solid var(--line)',
                  borderRadius: i === 0 ? '10px 10px 0 0' : i === lessons.length - 1 ? '0 0 10px 10px' : 0,
                  padding: '16px 24px',
                  display: 'flex', alignItems: 'center', gap: 16,
                }}
              >
                <div style={{ fontFamily: 'var(--f-mono)', fontSize: 12, color: 'var(--muted)', minWidth: 28 }}>
                  {String(i + 1).padStart(2, '0')}
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: 'var(--f-display)', fontWeight: 600, fontSize: 15, color: 'var(--ink)', marginBottom: 3 }}>
                    {lesson.titulo ?? lesson.slug}
                  </div>
                  <div style={{ fontFamily: 'var(--f-mono)', fontSize: 11, color: 'var(--muted)', letterSpacing: '0.06em' }}>
                    {lesson.duracion ?? '—'} · {lesson.tipo ?? 'lectura'}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 8 }}>
                  <Link
                    href={`/academy/${track}/${lesson.slug}`}
                    target="_blank"
                    style={{
                      padding: '7px 14px', borderRadius: 6, border: '1px solid var(--line)',
                      fontFamily: 'var(--f-mono)', fontSize: 10, letterSpacing: '0.06em',
                      textTransform: 'uppercase', color: 'var(--muted)', textDecoration: 'none',
                      background: 'var(--paper-2)',
                    }}
                  >
                    Ver →
                  </Link>
                  <Link
                    href={`/dashboard/academy/${track}/${lesson.slug}`}
                    style={{
                      padding: '7px 14px', borderRadius: 6, border: '1px solid var(--line)',
                      fontFamily: 'var(--f-mono)', fontSize: 10, letterSpacing: '0.06em',
                      textTransform: 'uppercase', color: 'var(--ink)', textDecoration: 'none',
                      background: 'var(--paper)',
                    }}
                  >
                    Editar →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
