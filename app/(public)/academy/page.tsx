import Navbar from '@/components/public/Navbar'
import Footer from '@/components/public/Footer'
import Link from 'next/link'
import Orb from '@/components/public/Orb'
import fs from 'fs'
import path from 'path'

function getTracks() {
  try {
    const dir = path.join(process.cwd(), 'content', 'academy')
    return fs.readdirSync(dir).filter(f => fs.statSync(path.join(dir, f)).isDirectory()).sort().map(slug => {
      const raw = fs.readFileSync(path.join(dir, slug, 'track.md'), 'utf-8')
      const meta = parseFrontmatter(raw)
      const lessons = fs.readdirSync(path.join(dir, slug, 'lessons')).filter(f => f.endsWith('.md'))
      return { slug, ...meta, lessonCount: lessons.length } as any
    })
  } catch { return [] }
}

function parseFrontmatter(raw: string) {
  const match = raw.match(/^---\n([\s\S]*?)\n---/)
  if (!match) return {}
  const obj: Record<string, any> = {}
  match[1].split('\n').forEach(line => {
    const [k, ...v] = line.split(':')
    if (k && v.length) obj[k.trim()] = v.join(':').trim().replace(/^"(.*)"$/, '$1')
  })
  return obj
}

export default function AcademyPage() {
  const tracks = getTracks()
  return (
    <main style={{ minHeight: '100vh', background: 'var(--paper)', color: 'var(--ink)', overflowX: 'hidden' }}>
      <div className="grid-bg" />
      <Navbar />

      <section style={{ padding: '120px 0 80px', borderBottom: '1px solid var(--line)' }}>
        <div className="wrap-v2">
          <div className="eyebrow" style={{ marginBottom: 24 }}>DIVINIA Academy — Gratis</div>
          <h1 className="h-display" style={{ fontSize: 'clamp(52px, 7vw, 110px)', marginBottom: 28, color: 'var(--ink)' }}>
            Aprendé a<br />
            <em>automatizar<br />tu negocio.</em>
          </h1>
          <p style={{ fontSize: 18, lineHeight: 1.5, color: 'var(--muted-2)', fontFamily: 'var(--f-display)', maxWidth: '44ch' }}>
            Cursos cortos y prácticos sobre IA aplicada a PYMEs argentinas. Sin registro, sin tarjeta, sin humo.
          </p>
        </div>
      </section>

      <section style={{ padding: '80px 0' }}>
        <div className="wrap-v2">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2 }} className="grid-cols-1 md:grid-cols-2">
            {tracks.map((t: any, i: number) => (
              <Link key={t.slug} href={`/academy/${t.slug}`} style={{
                display: 'block', textDecoration: 'none',
                padding: '36px 36px',
                background: 'var(--paper-2)', border: '1px solid var(--line)',
                borderRadius: i === 0 ? '16px 0 0 0' : i === 1 ? '0 16px 0 0' : i === tracks.length - 2 ? '0 0 0 16px' : i === tracks.length - 1 ? '0 0 16px 0' : 0,
                transition: 'background 0.2s',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
                  <Orb size={44} color={t.color || '#C6FF3D'} colorDeep={t.color || '#8AAA1A'} shade="rgba(0,0,0,0.4)" />
                  <div>
                    <div style={{ fontFamily: 'var(--f-mono)', fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 4 }}>
                      {t.nivel} · {t.lessonCount} lecciones · {t.duracion}
                    </div>
                  </div>
                </div>
                <div style={{ fontFamily: 'var(--f-display)', fontWeight: 700, fontSize: 22, color: 'var(--ink)', marginBottom: 10, lineHeight: 1.25 }}>
                  {t.title}
                </div>
                <div style={{ fontFamily: 'var(--f-display)', fontSize: 15, color: 'var(--muted-2)', lineHeight: 1.5, marginBottom: 20 }}>
                  {t.description}
                </div>
                <div style={{ fontFamily: 'var(--f-mono)', fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--ink)', borderBottom: '1px solid var(--ink)', paddingBottom: 2, display: 'inline' }}>
                  Empezar →
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
