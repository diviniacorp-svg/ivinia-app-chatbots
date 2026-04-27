import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase'
import { addKnowledge, clearKnowledge } from '@/lib/embeddings'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

// POST /api/chatbot/knowledge — agrega conocimiento a un chatbot
// Body: { chatbot_id, text, source?, replace? }
export async function POST(req: NextRequest) {
  try {
    const { chatbot_id, text, source, metadata, replace } = await req.json()

    if (!chatbot_id || !text) {
      return NextResponse.json({ error: 'chatbot_id y text son requeridos' }, { status: 400 })
    }
    if (typeof text !== 'string' || text.length > 100_000) {
      return NextResponse.json({ error: 'text debe ser string de máx 100.000 chars' }, { status: 400 })
    }

    // Si replace=true, borramos el conocimiento previo del mismo source
    if (replace && source) {
      const db = createAdminClient()
      await db.from('chatbot_knowledge').delete()
        .eq('chatbot_id', chatbot_id)
        .eq('source', source)
    } else if (replace) {
      await clearKnowledge(chatbot_id)
    }

    const result = await addKnowledge({ chatbot_id, text, source, metadata })
    return NextResponse.json({ ok: true, ...result })
  } catch (err) {
    console.error('[knowledge POST]', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Error' },
      { status: 500 }
    )
  }
}

// GET /api/chatbot/knowledge?chatbot_id=xxx — lista items del knowledge base
export async function GET(req: NextRequest) {
  const chatbot_id = req.nextUrl.searchParams.get('chatbot_id')
  if (!chatbot_id) {
    return NextResponse.json({ error: 'chatbot_id requerido' }, { status: 400 })
  }

  const db = createAdminClient()
  const { data, error } = await db
    .from('chatbot_knowledge')
    .select('id, content, source, metadata, created_at')
    .eq('chatbot_id', chatbot_id)
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ items: data, total: data.length })
}

// DELETE /api/chatbot/knowledge?chatbot_id=xxx&id=yyy
// Si no hay id, borra todo el knowledge del chatbot
export async function DELETE(req: NextRequest) {
  const chatbot_id = req.nextUrl.searchParams.get('chatbot_id')
  const id = req.nextUrl.searchParams.get('id')

  if (!chatbot_id) {
    return NextResponse.json({ error: 'chatbot_id requerido' }, { status: 400 })
  }

  const db = createAdminClient()
  if (id) {
    const { error } = await db.from('chatbot_knowledge').delete()
      .eq('id', id).eq('chatbot_id', chatbot_id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  } else {
    await clearKnowledge(chatbot_id)
  }

  return NextResponse.json({ ok: true })
}
