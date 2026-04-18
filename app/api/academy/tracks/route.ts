import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export async function GET() {
  try {
    const academyDir = path.join(process.cwd(), 'content', 'academy')
    const folders = fs.readdirSync(academyDir).filter(f =>
      fs.statSync(path.join(academyDir, f)).isDirectory()
    ).sort()

    const tracks = folders.map(folder => {
      const trackFile = path.join(academyDir, folder, 'track.md')
      const lessonsDir = path.join(academyDir, folder, 'lessons')
      const raw = fs.existsSync(trackFile) ? fs.readFileSync(trackFile, 'utf-8') : ''
      const meta = parseFrontmatter(raw)
      const lessons = fs.existsSync(lessonsDir)
        ? fs.readdirSync(lessonsDir).filter(f => f.endsWith('.md')).sort()
        : []
      return { slug: folder, ...meta, lessonFiles: lessons }
    })

    return NextResponse.json({ tracks })
  } catch (e) {
    return NextResponse.json({ tracks: [] })
  }
}

function parseFrontmatter(raw: string) {
  const match = raw.match(/^---\n([\s\S]*?)\n---/)
  if (!match) return {}
  const obj: Record<string, any> = {}
  match[1].split('\n').forEach(line => {
    const [k, ...v] = line.split(':')
    if (k && v.length) {
      const val = v.join(':').trim().replace(/^"(.*)"$/, '$1')
      obj[k.trim()] = val
    }
  })
  return obj
}
