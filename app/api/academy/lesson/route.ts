import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

// Solo permite letras, números, guiones y underscores — bloquea cualquier intento de path traversal
function validateSegment(s: string): boolean {
  return typeof s === 'string' && s.length > 0 && /^[a-zA-Z0-9_\-]+$/.test(s)
}

function parseFrontmatter(raw: string) {
  const match = raw.match(/^---\n([\s\S]*?)\n---/)
  const obj: Record<string, string> = {}
  if (match) {
    match[1].split('\n').forEach(line => {
      const [k, ...v] = line.split(':')
      if (k && v.length) obj[k.trim()] = v.join(':').trim().replace(/^"(.*)"$/, '$1')
    })
  }
  const body = raw.replace(/^---\n[\s\S]*?\n---\n?/, '')
  return { meta: obj, body }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const track = searchParams.get('track') ?? ''
  const lesson = searchParams.get('lesson') ?? ''

  if (!validateSegment(track)) {
    return NextResponse.json({ error: 'Parámetros inválidos' }, { status: 400 })
  }

  const academyDir = path.join(process.cwd(), 'content', 'academy')
  const trackDir = path.join(academyDir, track)

  // No lesson param → return all lessons + track meta
  if (!lesson) {
    try {
      const trackFile = path.join(trackDir, 'track.md')
      const trackRaw = fs.existsSync(trackFile) ? fs.readFileSync(trackFile, 'utf-8') : ''
      const { meta } = parseFrontmatter(trackRaw)

      const lessonsDir = path.join(trackDir, 'lessons')
      const lessonFiles = fs.existsSync(lessonsDir)
        ? fs.readdirSync(lessonsDir).filter(f => f.endsWith('.md')).sort()
        : []

      const lessons = lessonFiles.map(file => {
        const raw = fs.readFileSync(path.join(lessonsDir, file), 'utf-8')
        const { meta: lMeta, body } = parseFrontmatter(raw)
        return { slug: file.replace('.md', ''), title: lMeta.title ?? file, content: raw }
      })

      return NextResponse.json({ meta, lessons })
    } catch (e: any) {
      return NextResponse.json({ error: 'Track no encontrado', detail: e.message }, { status: 404 })
    }
  }

  if (!validateSegment(lesson)) {
    return NextResponse.json({ error: 'Parámetros inválidos' }, { status: 400 })
  }

  const filePath = path.join(trackDir, 'lessons', lesson + '.md')

  if (!fs.existsSync(filePath)) {
    return NextResponse.json({ error: 'Lección no encontrada' }, { status: 404 })
  }

  const content = fs.readFileSync(filePath, 'utf-8')
  return NextResponse.json({ content })
}

export async function PUT(req: NextRequest) {
  let body: { track?: string; lesson?: string; content?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Body inválido' }, { status: 400 })
  }

  const { track, lesson, content } = body

  if (!track || !lesson || content === undefined) {
    return NextResponse.json({ error: 'Faltan campos requeridos: track, lesson, content' }, { status: 400 })
  }

  if (!validateSegment(track) || !validateSegment(lesson)) {
    return NextResponse.json({ error: 'Parámetros inválidos (path traversal detectado)' }, { status: 400 })
  }

  const baseDir = path.resolve(process.cwd(), 'content', 'academy')
  const filePath = path.resolve(baseDir, track, 'lessons', lesson + '.md')

  // Doble verificación: el path resuelto debe estar dentro del directorio base
  if (!filePath.startsWith(baseDir + path.sep)) {
    return NextResponse.json({ error: 'Ruta inválida' }, { status: 400 })
  }

  try {
    fs.writeFileSync(filePath, content, 'utf-8')
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: 'No se pudo escribir el archivo', detail: e.message }, { status: 500 })
  }
}
