import { NextRequest } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { AGENT_MAP } from '@/lib/agents/roster'
import { createAdminClient } from '@/lib/supabase'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
export const maxDuration = 60

const MODEL_IDS: Record<string, string> = {
  haiku: 'claude-haiku-4-5-20251001',
  sonnet: 'claude-sonnet-4-6',
  opus: 'claude-opus-4-7',
}

export async function POST(req: NextRequest) {
  const t0 = Date.now()
  const { agentId, message, history = [] } = await req.json()

  if (!agentId || !message?.trim()) {
    return new Response('agentId y message requeridos', { status: 400 })
  }

  const agent = AGENT_MAP[agentId]
  if (!agent) {
    return new Response(`Agente "${agentId}" no encontrado`, { status: 404 })
  }

  const client = new Anthropic()
  const modelId = MODEL_IDS[agent.model] ?? MODEL_IDS.sonnet

  const messages: Anthropic.MessageParam[] = [
    ...history.map((m: { role: string; content: string }) => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    })),
    { role: 'user', content: message },
  ]

  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    async start(controller) {
      try {
        const response = await client.messages.create({
          model: modelId,
          max_tokens: 1500,
          system: agent.systemPrompt,
          messages,
          stream: true,
        })

        for await (const event of response) {
          if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text: event.delta.text })}\n\n`))
          }
        }

        controller.enqueue(encoder.encode('data: [DONE]\n\n'))

        // Log fire-and-forget
        const db = createAdminClient()
        Promise.resolve(db.from('agent_runs').insert({
          agent: agentId,
          department: agent.depto,
          action: `Chat: ${message.slice(0, 80)}`,
          status: 'success',
          duration_ms: Date.now() - t0,
          metadata: { model: agent.model },
        })).catch(() => {})

      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Error del agente'
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: msg })}\n\n`))
      } finally {
        controller.close()
      }
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  })
}
