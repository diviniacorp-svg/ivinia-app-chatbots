import Navbar from '@/components/public/Navbar'
import Footer from '@/components/public/Footer'
import Link from 'next/link'
import Orb from '@/components/public/Orb'
import fs from 'fs'
import path from 'path'
import { notFound } from 'next/navigation'

function parseFrontmatter(raw: string) {
  const match = raw.match(/^---\n([\s\S]*?)\n---/)
  if (!match) return {} as Record<string, any>
  const obj: Record<string, any> = {}
  match[1].split('\n').forEach(line => {
    const [k, ...v] = line.split(':')
    if (k && v.length) obj[k.trim()] = v.join(':').trim().replace(/^"(.*)"$/, '$1')
  })
  return obj
}

export default function TrackPage({ params }: { params: { track: string } }) {
  const dir = path.join(process.cwd(), 'content', 'academy', params.track)
  if (!fs.existsSync(dir)) notFound()

  const raw = fs.readFileSync(path.join(dir, 'track.md'), 'utf-8')
  const meta = parseFrontmatter(raw) as any
  const lessonsDir = path.join(dir, 'lessons')
  const lessons = fs.readdirSync(lessonsDir).filter(f => f.endsWith('.md')).sort().map(f => {
    const lRaw = fs.readFileSync(path.join(lessonsDir, f), 'utf-8')
    const lMeta = parseFrontmatter(lRaw) as any
    return { file: f, slug: f.replace('.md', ''), ...lMeta }
  })

  return (
    <main style={{ minHeight: '100vh', background: 'var(--paper)', color: 'var(--ink)', overflowX: 'hidden' }}>
      <div className="grid-bg" />
      <Navbar />

      <section style={{ padding: '100px 0 60px', borderBottom: '1px solid var(--line)' }}>
        <div className="wrap-v2">
          <Link href="/academy" style={{ fontFamily: 'var(--f-mono)', fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--muted)', textDecoration: 'none', display: 'block', marginBottom: 32 }}>
            ← Volver a Academy
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 28 }}>
            <Orb size={56} color={meta.color || '#C6FF3D'} colorDeep={meta.color || '#8AAA1A'} shade="rgba(0,0,0,0.4)" />
            <div>
              <div style={{ fontFamily: 'var(--f-mono)', fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 6 }}>
                {meta.nivel} · {lessons.length} lecciones · {meta.duracion}
              </div>
              <h1 style={{ fontFamily: 'var(--f-display)', fontWeight: 700, fontSize: 'clamp(28px, 4vw, 52px)', color: 'var(--ink)', letterSpacing: '-0.03em', margin: 0 }}>
                {meta.title}
              </h1>
            </div>
          </div>
          <p style={{ fontFamily: 'var(--f-display)', fontSize: 17, color: 'var(--muted-2)', lineHeight: 1.55, maxWidth: '52ch' }}>
            {meta.description}
          </p>
        </div>
      </section>

      <section style={{ padding: '60px 0' }}>
        <div className="wrap-v2" style={{ maxWidth: 720 }}>
          <div style={{ fontFamily: 'var(--f-mono)', fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 20 }}>
            Lecciones
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {lessons.map((l: any, i: number) => (
              <Link key={l.slug} href={`/academy/${params.track}/${l.slug}`} style={{
                display: 'flex', alignItems: 'center', gap: 20,
                padding: '24px 28px',
                background: 'var(--paper-2)', border: '1px solid var(--line)',
                borderRadius: i === 0 ? '12px 12px 0 0' : i === lessons.length - 1 ? '0 0 12px 12px' : 0,
                textDecoration: 'none', transition: 'background 0.15s',
              }}>
                <div style={{ fontFamily: 'var(--f-mono)', fontSize: 13, color: 'var(--muted)', minWidth: 24 }}>
                  {String(i + 1).padStart(2, '0')}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: 'var(--f-display)', fontWeight: 600, fontSize: 17, color: 'var(--ink)', marginBottom: 4 }}>
                    {l.titulo}
                  </div>
                  <div style={{ fontFamily: 'var(--f-mono)', fontSize: 11, color: 'var(--muted)', letterSpacing: '0.08em' }}>
                    {l.duracion} · {l.tipo}
                  </div>
                </div>
                <div style={{ fontFamily: 'var(--f-mono)', fontSize: 12, color: 'var(--muted)' }}>→</div>
              </Link>
            ))}
          </div>

          {meta.cta_href && (
            <div style={{ marginTop: 48, padding: '32px', background: 'var(--ink)', borderRadius: 16, textAlign: 'center' }}>
              <p style={{ fontFamily: 'var(--f-display)', fontSize: 16, color: 'rgba(255,255,255,0.6)', marginBottom: 20 }}>
                ¿Listo para implementarlo en tu negocio?
              </p>
              <a href={meta.cta_href} style={{
                display: 'inline-block', padding: '14px 32px', borderRadius: 10,
                background: 'var(--lime)', color: 'var(--ink)',
                fontFamily: 'var(--f-mono)', fontSize: 12, letterSpacing: '0.08em',
                textTransform: 'uppercase', textDecoration: 'none', fontWeight: 700,
              }}>
                {meta.cta_label} →
              </a>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </main>
  )
}
