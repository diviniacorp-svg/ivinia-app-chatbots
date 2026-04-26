import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase'

interface KnowledgeEntry {
  title: string
  content: string
  category: 'producto' | 'precio' | 'proceso' | 'faq' | 'cliente' | 'estrategia' | 'tecnico'
  tags?: string[]
  source?: string
}

export async function POST(req: NextRequest) {
  let body: { entries?: KnowledgeEntry[]; entry?: KnowledgeEntry }
  try { body = await req.json() } catch { return NextResponse.json({ error: 'Body inválido' }, { status: 400 }) }

  const entries = body.entries ?? (body.entry ? [body.entry] : [])
  if (entries.length === 0) return NextResponse.json({ error: 'Sin entries' }, { status: 400 })

  const valid = entries.filter(e => e.title && e.content && e.category)
  if (valid.length === 0) return NextResponse.json({ error: 'Entries sin title/content/category' }, { status: 400 })

  try {
    const db = createAdminClient()
    const { data, error } = await db
      .from('nucleus_knowledge')
      .insert(valid.map(e => ({
        title: e.title,
        content: e.content,
        category: e.category,
        tags: e.tags ?? [],
        source: e.source ?? 'manual',
      })))
      .select('id, title, category')

    if (error) throw error
    return NextResponse.json({ ok: true, inserted: data?.length ?? 0, items: data })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

// Upsert por título (evita duplicados al re-seedear)
export async function PUT(req: NextRequest) {
  let body: { entries: KnowledgeEntry[] }
  try { body = await req.json() } catch { return NextResponse.json({ error: 'Body inválido' }, { status: 400 }) }

  const entries = body.entries ?? []
  if (entries.length === 0) return NextResponse.json({ error: 'Sin entries' }, { status: 400 })

  try {
    const db = createAdminClient()
    const { data, error } = await db
      .from('nucleus_knowledge')
      .upsert(
        entries.map(e => ({
          title: e.title,
          content: e.content,
          category: e.category,
          tags: e.tags ?? [],
          source: e.source ?? 'manual',
        })),
        { onConflict: 'title' }
      )
      .select('id, title, category')

    if (error) throw error
    return NextResponse.json({ ok: true, upserted: data?.length ?? 0 })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
