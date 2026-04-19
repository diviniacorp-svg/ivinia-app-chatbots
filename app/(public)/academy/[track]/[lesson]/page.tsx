import Navbar from '@/components/public/Navbar'
import Footer from '@/components/public/Footer'
import Link from 'next/link'
import fs from 'fs'
import path from 'path'
import { notFound } from 'next/navigation'

// Valida que el segmento de ruta solo contenga caracteres seguros (sin path traversal)
function isValidPathSegment(s: unknown): s is string {
  return typeof s === 'string' && s.length > 0 && /^[a-zA-Z0-9_\-]+$/.test(s)
}

function parseFrontmatter(raw: string): { meta: Record<string, any>; body: string } {
  const match = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/)
  if (!match) return { meta: {}, body: raw }
  const meta: Record<string, any> = {}
  match[1].split('\n').forEach(line => {
    const [k, ...v] = line.split(':')
    if (k && v.length) meta[k.trim()] = v.join(':').trim().replace(/^"(.*)"$/, '$1')
  })
  return { meta, body: match[2] }
}

function markdownToHtml(md: string): string {
  return md
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`(.+?)`/g, '<code>$1</code>')
    .replace(/^\| (.+) \|$/gm, (m) => `<tr><td>${m.slice(2, -2).split(' | ').join('</td><td>')}</td></tr>`)
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    .replace(/(<li>[\s\S]*?<\/li>)/g, '<ul>$1</ul>')
    .replace(/\n\n/g, '</p><p>')
    .replace(/^(?!<[hlupc])/gm, '')
}

export default function LessonPage({ params }: { params: { track: string; lesson: string } }) {
  if (!isValidPathSegment(params.track) || !isValidPathSegment(params.lesson)) notFound()

  const lessonPath = path.join(process.cwd(), 'content', 'academy', params.track, 'lessons', `${params.lesson}.md`)
  const trackPath = path.join(process.cwd(), 'content', 'academy', params.track, 'track.md')

  if (!fs.existsSync(lessonPath)) notFound()

  const { meta, body } = parseFrontmatter(fs.readFileSync(lessonPath, 'utf-8'))
  const trackMeta = parseFrontmatter(fs.readFileSync(trackPath, 'utf-8')).meta

  const allLessons = fs.readdirSync(path.join(process.cwd(), 'content', 'academy', params.track, 'lessons')).filter(f => f.endsWith('.md')).sort()
  const currentIdx = allLessons.indexOf(`${params.lesson}.md`)
  const nextLesson = allLessons[currentIdx + 1]?.replace('.md', '')

  return (
    <main style={{ minHeight: '100vh', background: 'var(--paper)', color: 'var(--ink)' }}>
      <div className="grid-bg" />
      <Navbar />

      <article style={{ maxWidth: 720, margin: '0 auto', padding: '80px 24px 120px' }}>
        {/* Breadcrumb */}
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 40, flexWrap: 'wrap' }}>
          <Link href="/academy" style={{ fontFamily: 'var(--f-mono)', fontSize: 11, color: 'var(--muted)', textDecoration: 'none', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Academy</Link>
          <span style={{ color: 'var(--muted)' }}>·</span>
          <Link href={`/academy/${params.track}`} style={{ fontFamily: 'var(--f-mono)', fontSize: 11, color: 'var(--muted)', textDecoration: 'none', letterSpacing: '0.08em', textTransform: 'uppercase' }}>{trackMeta.title}</Link>
        </div>

        {/* Lesson header */}
        <div style={{ fontFamily: 'var(--f-mono)', fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 16 }}>
          {meta.duracion} · {meta.tipo}
        </div>
        <h1 style={{ fontFamily: 'var(--f-display)', fontWeight: 700, fontSize: 'clamp(28px, 5vw, 44px)', color: 'var(--ink)', letterSpacing: '-0.03em', lineHeight: 1.15, marginBottom: 48 }}>
          {meta.titulo}
        </h1>

        {/* Body */}
        <div style={{
          fontFamily: 'var(--f-display)', fontSize: 17, lineHeight: 1.75, color: 'var(--ink)',
        }}>
          {body.split('\n\n').map((block, i) => {
            if (block.startsWith('# ')) return <h1 key={i} style={{ fontFamily: 'var(--f-display)', fontWeight: 700, fontSize: 28, letterSpacing: '-0.03em', marginTop: 48, marginBottom: 20, lineHeight: 1.2 }}>{block.slice(2)}</h1>
            if (block.startsWith('## ')) return <h2 key={i} style={{ fontFamily: 'var(--f-display)', fontWeight: 700, fontSize: 22, letterSpacing: '-0.02em', marginTop: 40, marginBottom: 16, lineHeight: 1.3 }}>{block.slice(3)}</h2>
            if (block.startsWith('### ')) return <h3 key={i} style={{ fontFamily: 'var(--f-display)', fontWeight: 600, fontSize: 18, marginTop: 32, marginBottom: 12 }}>{block.slice(4)}</h3>
            if (block.startsWith('```')) {
              const code = block.replace(/^```\w*\n?/, '').replace(/\n?```$/, '')
              return <pre key={i} style={{ background: 'var(--ink)', color: 'var(--lime)', fontFamily: 'var(--f-mono)', fontSize: 13, padding: '20px 24px', borderRadius: 12, overflowX: 'auto', margin: '24px 0' }}><code>{code}</code></pre>
            }
            if (block.startsWith('| ')) {
              const rows = block.split('\n').filter(r => r.startsWith('| ') && !r.match(/^[| -]+$/))
              return (
                <table key={i} style={{ width: '100%', borderCollapse: 'collapse', margin: '24px 0', fontFamily: 'var(--f-display)', fontSize: 14 }}>
                  <tbody>
                    {rows.map((r, ri) => (
                      <tr key={ri}>
                        {r.slice(2, -2).split(' | ').map((cell, ci) => (
                          <td key={ci} style={{ padding: '10px 16px', border: '1px solid var(--line)', background: ri === 0 ? 'var(--paper-2)' : 'transparent', fontWeight: ri === 0 ? 600 : 400 }} dangerouslySetInnerHTML={{ __html: cell.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/\*(.+?)\*/g, '<em>$1</em>') }} />
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              )
            }
            if (block.startsWith('- ') || block.match(/^[0-9]+\. /)) {
              const items = block.split('\n').filter(l => l.trim())
              const isOrdered = items[0]?.match(/^[0-9]+\./)
              const Tag = isOrdered ? 'ol' : 'ul'
              return (
                <Tag key={i} style={{ margin: '20px 0', paddingLeft: 28, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {items.map((item, ii) => (
                    <li key={ii} style={{ lineHeight: 1.6 }} dangerouslySetInnerHTML={{ __html: item.replace(/^[-0-9.] /, '').replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/`(.+?)`/g, '<code style="font-family:var(--f-mono);font-size:13px;background:var(--paper-2);padding:2px 6px;border-radius:4px">$1</code>') }} />
                  ))}
                </Tag>
              )
            }
            return block.trim() ? (
              <p key={i} style={{ marginBottom: 24 }} dangerouslySetInnerHTML={{ __html: block.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/\*(.+?)\*/g, '<em>$1</em>').replace(/`(.+?)`/g, '<code style="font-family:var(--f-mono);font-size:13px;background:var(--paper-2);padding:2px 6px;border-radius:4px">$1</code>') }} />
            ) : null
          })}
        </div>

        {/* Navigation */}
        <div style={{ marginTop: 64, paddingTop: 32, borderTop: '1px solid var(--line)', display: 'flex', justifyContent: 'space-between', gap: 16 }}>
          <Link href={`/academy/${params.track}`} style={{ fontFamily: 'var(--f-mono)', fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--muted)', textDecoration: 'none' }}>
            ← Volver al track
          </Link>
          {nextLesson && (
            <Link href={`/academy/${params.track}/${nextLesson}`} style={{
              padding: '12px 24px', borderRadius: 8, background: 'var(--ink)', color: 'var(--paper)',
              fontFamily: 'var(--f-mono)', fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', textDecoration: 'none',
            }}>
              Siguiente lección →
            </Link>
          )}
        </div>
      </article>

      <Footer />
    </main>
  )
}
