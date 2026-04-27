/**
 * RAG para chatbots DIVINIA
 * Búsqueda: PostgreSQL full-text search (español)
 * Reranking: Claude Haiku — sin dependencias externas adicionales
 */

import Anthropic from '@anthropic-ai/sdk'
import { createAdminClient } from '@/lib/supabase'

let _anthropic: Anthropic | null = null
function getAnthropic() {
  if (!_anthropic) _anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  return _anthropic
}

// Divide texto en chunks coherentes respetando párrafos
export function chunkText(text: string, maxChunkChars = 500): string[] {
  const paragraphs = text.split(/\n{2,}/).map(p => p.trim()).filter(Boolean)
  const chunks: string[] = []
  let current = ''

  for (const para of paragraphs) {
    const candidate = current ? `${current}\n\n${para}` : para
    if (candidate.length > maxChunkChars && current) {
      chunks.push(current)
      current = para
    } else {
      current = candidate
    }
  }
  if (current) chunks.push(current)

  // Partir chunks que siguen siendo muy largos (por oraciones)
  const result: string[] = []
  for (const chunk of chunks) {
    if (chunk.length <= maxChunkChars) {
      result.push(chunk)
    } else {
      const sentences = chunk.match(/[^.!?\n]+[.!?\n]+/g) || [chunk]
      let sub = ''
      for (const s of sentences) {
        if ((sub + s).length > maxChunkChars && sub) {
          result.push(sub.trim())
          sub = s
        } else {
          sub += s
        }
      }
      if (sub.trim()) result.push(sub.trim())
    }
  }

  return result.filter(c => c.length >= 20)
}

export interface MatchResult {
  id: string
  content: string
  metadata: Record<string, unknown>
  score: number
}

// Guarda texto como conocimiento del chatbot (chunkeado, sin embeddings)
export async function addKnowledge(params: {
  chatbot_id: string
  text: string
  source?: string
  metadata?: Record<string, unknown>
}): Promise<{ inserted: number; chunks: string[] }> {
  const db = createAdminClient()
  const chunks = chunkText(params.text)

  const rows = chunks.map(content => ({
    chatbot_id: params.chatbot_id,
    content,
    source: params.source || null,
    metadata: params.metadata || {},
    // embedding queda NULL — no se usa, FTS cubre el retrieval
  }))

  const { error } = await db.from('chatbot_knowledge').insert(rows)
  if (error) throw error

  return { inserted: rows.length, chunks }
}

// Paso 1 — Full-text search con PostgreSQL (español)
async function ftsSearch(chatbot_id: string, query: string, limit = 8): Promise<MatchResult[]> {
  const db = createAdminClient()

  const { data, error } = await db.rpc('search_chatbot_knowledge', {
    search_query: query,
    match_chatbot_id: chatbot_id,
    match_count: limit,
  })

  if (error || !data) return []

  return (data as Array<{ id: string; content: string; metadata: Record<string, unknown>; rank: number }>)
    .map(r => ({ id: r.id, content: r.content, metadata: r.metadata ?? {}, score: r.rank }))
}

// Paso 2 — Reranking con Claude Haiku (selecciona los chunks realmente útiles)
async function rerankWithClaude(
  query: string,
  candidates: MatchResult[],
  maxResults = 3
): Promise<MatchResult[]> {
  if (candidates.length === 0) return []
  if (candidates.length <= maxResults) return candidates

  try {
    const numbered = candidates.map((c, i) => `[${i + 1}] ${c.content}`).join('\n\n')
    const msg = await getAnthropic().messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 60,
      messages: [{
        role: 'user',
        content: `Pregunta del usuario: "${query}"

Fragmentos disponibles:
${numbered}

¿Cuáles son los ${maxResults} fragmentos más relevantes para responder esa pregunta? Respondé SOLO con los números separados por coma. Ejemplo: 2,4,1`,
      }],
    })

    const text = msg.content[0].type === 'text' ? msg.content[0].text : ''
    const indices = text.match(/\d+/g)?.map(n => parseInt(n) - 1).filter(i => i >= 0 && i < candidates.length) ?? []
    const selected = indices.slice(0, maxResults).map(i => candidates[i])
    return selected.length > 0 ? selected : candidates.slice(0, maxResults)
  } catch {
    return candidates.slice(0, maxResults)
  }
}

// Búsqueda semántica completa: FTS → reranking Haiku
export async function retrieveKnowledge(params: {
  chatbot_id: string
  query: string
  match_count?: number
}): Promise<MatchResult[]> {
  const candidates = await ftsSearch(params.chatbot_id, params.query, 10)
  if (candidates.length === 0) return []
  return rerankWithClaude(params.query, candidates, params.match_count ?? 3)
}

// Comprueba si un chatbot tiene knowledge base
export async function hasKnowledge(chatbot_id: string): Promise<boolean> {
  const db = createAdminClient()
  const { count } = await db
    .from('chatbot_knowledge')
    .select('id', { count: 'exact', head: true })
    .eq('chatbot_id', chatbot_id)
  return (count ?? 0) > 0
}

// Borra todo el conocimiento de un chatbot
export async function clearKnowledge(chatbot_id: string): Promise<void> {
  const db = createAdminClient()
  await db.from('chatbot_knowledge').delete().eq('chatbot_id', chatbot_id)
}
