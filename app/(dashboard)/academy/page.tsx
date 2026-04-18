import fs from 'fs'
import path from 'path'
import Link from 'next/link'

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

function getTracks() {
  try {
    const dir = path.join(process.cwd(), 'content', 'academy')
    return fs.readdirSync(dir)
      .filter(f => fs.statSync(path.join(dir, f)).isDirectory())
      .sort()
      .map(slug => {
        const raw = fs.readFileSync(path.join(dir, slug, 'track.md'), 'utf-8')
        const meta = parseFrontmatter(raw)
        const lessonsDir = path.join(dir, slug, 'lessons')
        const lessonCount = fs.existsSync(lessonsDir)
          ? fs.readdirSync(lessonsDir).filter(f => f.endsWith('.md')).length
          : 0
        return { slug, ...meta, lessonCount } as any
      })
  } catch { return [] }
}

export default function AcademyDashboardPage() {
  const tracks = getTracks()
  const totalLessons = tracks.reduce((acc: number, t: any) => acc + (t.lessonCount ?? 0), 0)

  return (
    <div style={{ minHeight: '100vh', background: 'var(--paper-2)' }}>

      {/* Header */}
      <div style={{ padding: '36px 40px 28px', borderBottom: '1px solid var(--line)', background: 'var(--paper)' }}>
        <div style={{ fontFamily: 'var(--f-mono)', fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 8 }}>
          Dashboard · Academy
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 style={{ fontFamily: 'var(--f-display)', fontWeight: 700, fontSize: 'clamp(24px, 3vw, 36px)', color: 'var(--ink)', letterSpacing: '-0.03em', margin: 0 }}>
              Academy
            </h1>
            <p style={{ fontFamily: 'var(--f-mono)', fontSize: 12, color: 'var(--muted)', marginTop: 8, letterSpacing: '0.04em' }}>
              {tracks.length} tracks · {totalLessons} lecciones totales
            </p>
          </div>
          <Link
            href="/academy"
            target="_blank"
            style={{
              padding: '9px 18px', borderRadius: 8, border: '1px solid var(--line)',
              fontFamily: 'var(--f-mono)', fontSize: 10, letterSpacing: '0.08em',
              textTransform: 'uppercase', color: 'var(--muted)', textDecoration: 'none',
              background: 'var(--paper)',
            }}
          >
            Ver sitio público →
          </Link>
        </div>
      </div>

      {/* Tracks list */}
      <div style={{ padding: '28px 40px', display: 'flex', flexDirection: 'column', gap: 2 }}>
        {tracks.length === 0 && (
          <div style={{ padding: '48px 0', textAlign: 'center' }}>
            <div style={{ fontFamily: 'var(--f-display)', fontSize: 15, color: 'var(--muted-2)' }}>
              No se encontraron tracks en content/academy/
            </div>
          </div>
        )}
        {tracks.map((t: any, i: number) => (
          <div
            key={t.slug}
            style={{
              background: 'var(--paper)', border: '1px solid var(--line)',
              borderRadius: i === 0 ? '10px 10px 0 0' : i === tracks.length - 1 ? '0 0 10px 10px' : 0,
              padding: '18px 24px',
              display: 'flex', alignItems: 'center', gap: 16,
            }}
          >
            {/* Color dot */}
            <div style={{
              width: 12, height: 12, borderRadius: '50%',
              background: t.color ?? 'var(--muted)', flexShrink: 0,
            }} />

            {/* Track info */}
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: 'var(--f-display)', fontWeight: 600, fontSize: 16, color: 'var(--ink)', marginBottom: 4 }}>
                {t.title ?? t.slug}
              </div>
              <div style={{ fontFamily: 'var(--f-mono)', fontSize: 11, color: 'var(--muted)', letterSpacing: '0.06em' }}>
                {t.nivel} · {t.lessonCount} lecciones · {t.duracion ?? '—'}
              </div>
            </div>

            {/* Botón editar */}
            <Link
              href={`/dashboard/academy/${t.slug}`}
              style={{
                padding: '8px 20px', borderRadius: 6, border: '1px solid var(--line)',
                fontFamily: 'var(--f-mono)', fontSize: 10, letterSpacing: '0.08em',
                textTransform: 'uppercase', color: 'var(--ink)', textDecoration: 'none',
                background: 'var(--paper-2)', whiteSpace: 'nowrap',
              }}
            >
              Editar →
            </Link>
          </div>
        ))}
      </div>
    </div>
  )
}
