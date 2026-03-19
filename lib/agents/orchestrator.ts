import OpenAI from 'openai'
import { createAdminClient } from '@/lib/supabase'
import { ProspectorAgent } from './prospector'
import { SalesAgent } from './sales'
import { MonitorAgent } from './monitor'

function getOpenRouter(): OpenAI {
  return new OpenAI({
    apiKey: process.env.OPENROUTER_API_KEY || '',
    baseURL: 'https://openrouter.ai/api/v1',
    defaultHeaders: {
      'HTTP-Referer': 'https://divinia.vercel.app',
      'X-Title': 'DIVINIA Orquestador',
    },
  })
}

const SYSTEM_PROMPT = `Sos el Agente Orquestador de DIVINIA, empresa de IA para PYMEs argentinas de San Luis.

Podés activar estos sub-agentes:
- **Prospector** 🔍: busca leads nuevos en Google Maps por rubro y ciudad. Pedí rubro y ciudad si no los tenés.
- **Ventas** 📧: genera y envía emails de outreach a leads nuevos sin contactar. Podés pedirle límite.
- **Monitor** 📊: revisa qué clientes tienen trials venciendo en 3 días o ya vencidos.

Cuando Joaco pida activar un agente:
1. Avisá que lo vas a ejecutar y qué va a hacer
2. Aclarale que el resultado va a aparecer en el mismo mensaje
3. Reportá el resultado de forma clara y accionable

También podés dar información sobre:
- Estado actual de los agentes y últimas ejecuciones
- Estrategias de ventas y outreach
- Consejos sobre cómo usar DIVINIA

Usá español argentino (vos, sos, tenés). Sé directo, útil y conciso.
Si algo está fuera de tu alcance, explicalo brevemente y sugerí alternativa.`

export async function* chat(userMessage: string): AsyncGenerator<string> {
  const db = createAdminClient()
  await db.from('agent_chats').insert({ role: 'user', content: userMessage })

  const { data: history } = await db
    .from('agent_chats')
    .select('role, content')
    .order('created_at', { ascending: false })
    .limit(20)

  const messages = (history ?? []).reverse()

  // Detect agent intent before streaming
  const agentAction = detectAgentAction(userMessage)

  let agentOutput = ''
  if (agentAction) {
    yield `\n> Activando **${agentAction.label}**...\n\n`
    const result = await runAgent(agentAction)
    agentOutput = result
    yield result
    yield '\n\n---\n\n'
  }

  const stream = await getOpenRouter().chat.completions.create({
    model: 'liquid/lfm-2.5-1.2b-instruct:free',
    max_tokens: 800,
    stream: true,
    messages: [
      { role: 'system', content: SYSTEM_PROMPT + (agentOutput ? `\n\nResultado del agente ejecutado:\n${agentOutput}` : '') },
      ...messages.map(m => ({ role: m.role as 'user' | 'assistant', content: m.content })),
    ],
  })

  let fullResponse = (agentOutput ? `> Activando **${agentAction?.label}**...\n\n${agentOutput}\n\n---\n\n` : '')

  for await (const chunk of stream) {
    const text = chunk.choices[0]?.delta?.content ?? ''
    if (text) {
      fullResponse += text
      yield text
    }
  }

  await db.from('agent_chats').insert({ role: 'assistant', content: fullResponse })
}

type AgentAction = { type: 'prospector'; label: string; params: Record<string, unknown> }
  | { type: 'sales'; label: string; params: Record<string, unknown> }
  | { type: 'monitor'; label: string; params: Record<string, unknown> }

function detectAgentAction(message: string): AgentAction | null {
  const lower = message.toLowerCase()

  if (/busca|prospecta|encontrá|scrape|lead/.test(lower)) {
    const rubroM = lower.match(/(?:de|para)\s+([\w\s]+?)\s+en\b/)
    const ciudadM = lower.match(/\ben\s+([\w\s]+?)(?:\s*$|\s*,|\s+limit|\s+\d)/)
    return {
      type: 'prospector',
      label: 'Agente Prospector 🔍',
      params: {
        rubro: rubroM?.[1]?.trim() ?? 'restaurantes',
        ciudad: ciudadM?.[1]?.trim() ?? 'San Luis',
        limit: 20,
      },
    }
  }

  if (/envía|email|outreach|contacta|mandá/.test(lower)) {
    const limitM = lower.match(/(\d+)\s+(?:email|lead|contact)/)
    return {
      type: 'sales',
      label: 'Agente de Ventas 📧',
      params: { limit: limitM ? parseInt(limitM[1]) : 5 },
    }
  }

  if (/monitor|trial|venc|chequea|revisa|expir/.test(lower)) {
    return { type: 'monitor', label: 'Agente Monitor 📊', params: {} }
  }

  return null
}

async function runAgent(action: AgentAction): Promise<string> {
  try {
    switch (action.type) {
      case 'prospector': {
        const agent = new ProspectorAgent()
        const p = action.params as unknown as { rubro: string; ciudad: string; limit?: number }
        const result = await agent.run({ rubro: p.rubro ?? 'negocios', ciudad: p.ciudad ?? 'San Luis', limit: p.limit })
        return `**Prospector:** ${result.message}`
      }
      case 'sales': {
        const agent = new SalesAgent()
        const p = action.params as unknown as { limit?: number }
        const result = await agent.run({ limit: p.limit })
        return `**Ventas:** ${result.message}`
      }
      case 'monitor': {
        const agent = new MonitorAgent()
        const result = await agent.run()
        if (result.data) {
          const d = result.data as { expiring_list?: {name:string;trial_end:string}[]; expired_list?: {name:string;trial_end:string}[] }
          let detail = `**Monitor:** ${result.message}`
          if (d.expiring_list?.length) {
            detail += '\n\nVencen pronto: ' + d.expiring_list.map(c => `${c.name} (${c.trial_end})`).join(', ')
          }
          if (d.expired_list?.length) {
            detail += '\nYa vencidos: ' + d.expired_list.map(c => c.name).join(', ')
          }
          return detail
        }
        return `**Monitor:** ${result.message}`
      }
    }
  } catch (err) {
    return `Error ejecutando agente: ${err instanceof Error ? err.message : 'Error desconocido'}`
  }
}
