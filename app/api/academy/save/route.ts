import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

function validateSegment(s: string): boolean {
  return typeof s === 'string' && s.length > 0 && /^[a-zA-Z0-9_\-]+$/.test(s)
}

export async function POST(req: NextRequest) {
  let body: { track?: string; lesson?: string; content?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Body inválido' }, { status: 400 })
  }

  const { track, lesson, content } = body

  if (!track || !lesson || content === undefined) {
    return NextResponse.json({ error: 'Faltan campos: track, lesson, content' }, { status: 400 })
  }

  if (!validateSegment(track) || !validateSegment(lesson)) {
    return NextResponse.json({ error: 'Parámetros inválidos' }, { status: 400 })
  }

  const baseDir = path.resolve(process.cwd(), 'content', 'academy')
  const filePath = path.resolve(baseDir, track, 'lessons', lesson + '.md')

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
