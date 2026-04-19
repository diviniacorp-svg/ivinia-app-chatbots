import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

// Solo permite letras, números, guiones y underscores — bloquea cualquier intento de path traversal
function validateSegment(s: string): boolean {
  return typeof s === 'string' && s.length > 0 && /^[a-zA-Z0-9_\-]+$/.test(s)
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const track = searchParams.get('track') ?? ''
  const lesson = searchParams.get('lesson') ?? ''

  if (!validateSegment(track) || !validateSegment(lesson)) {
    return NextResponse.json({ error: 'Parámetros inválidos' }, { status: 400 })
  }

  const filePath = path.join(process.cwd(), 'content', 'academy', track, 'lessons', lesson + '.md')

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
