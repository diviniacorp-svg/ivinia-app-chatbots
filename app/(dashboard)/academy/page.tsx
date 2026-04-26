import Link from 'next/link'
import fs from 'fs'
import path from 'path'

function parseFrontmatter(raw: string): Record<string, string> {
  const match = raw.match(/^---\n([\s\S]*?)\n---/)
  if (!match) return {}
  const obj: Record<string, string> = {}
  match[1].split('\n').forEach(line => {
    const [k, ...v] = line.split(':')
    if (k && v.length) obj[k.trim()] = v.join(':').trim().replace(/^"(.*)"$/, '$1')
  })
  return obj
}

interface TrackMeta {
  slug: string
  lessonCount: number
  title?: string
  description?: string
  nivel?: string
  duracion?: string
}

function getTracks(): TrackMeta[] {
  const dir = path.join(process.cwd(), 'content', 'academy')
  if (!fs.existsSync(dir)) return []
  return fs.readdirSync(dir)
    .filter(f => fs.statSync(path.join(dir, f)).isDirectory())
    .sort()
    .map(slug => {
      const trackFile = path.join(dir, slug, 'track.md')
      const lessonsDir = path.join(dir, slug, 'lessons')
      const meta = fs.existsSync(trackFile)
        ? parseFrontmatter(fs.readFileSync(trackFile, 'utf-8'))
        : {}
      const lessonCount = fs.existsSync(lessonsDir)
        ? fs.readdirSync(lessonsDir).filter(f => f.endsWith('.md')).length
        : 0
      return { slug, lessonCount, ...meta }
    })
}

const NIVEL_COLORS: Record<string, string> = {
  Básico: 'text-green-400 bg-green-400/10',
  Intermedio: 'text-yellow-400 bg-yellow-400/10',
  Avanzado: 'text-orange-400 bg-orange-400/10',
}

export default function AcademyDashboardPage() {
  const tracks = getTracks()

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">DIVINIA Academy</h1>
        <p className="text-zinc-400 mt-1">
          {tracks.length} tracks · {tracks.reduce((a, t) => a + t.lessonCount, 0)} lecciones
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {tracks.map(track => (
          <div
            key={track.slug}
            className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 flex flex-col gap-3"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-xs text-zinc-500 font-mono mb-1">{track.slug}</p>
                <h2 className="text-white font-semibold leading-tight">
                  {track.title || track.slug}
                </h2>
              </div>
              {track.nivel && (
                <span className={`text-xs px-2 py-0.5 rounded-full font-mono shrink-0 ${NIVEL_COLORS[track.nivel] || 'text-zinc-400 bg-zinc-800'}`}>
                  {track.nivel}
                </span>
              )}
            </div>

            {track.description && (
              <p className="text-sm text-zinc-400 leading-relaxed line-clamp-2">
                {track.description}
              </p>
            )}

            <div className="flex items-center justify-between mt-auto pt-2 border-t border-zinc-800">
              <span className="text-xs text-zinc-500">
                {track.lessonCount} {track.lessonCount === 1 ? 'lección' : 'lecciones'}
                {track.duracion ? ` · ${track.duracion}` : ''}
              </span>
              <Link
                href={`/academy/${track.slug}`}
                className="text-sm text-lime-400 hover:text-lime-300 font-medium transition-colors"
              >
                Editar →
              </Link>
            </div>
          </div>
        ))}
      </div>

      {tracks.length === 0 && (
        <div className="text-center py-20 text-zinc-500">
          No hay tracks en <code className="text-zinc-400">content/academy/</code>
        </div>
      )}
    </div>
  )
}
