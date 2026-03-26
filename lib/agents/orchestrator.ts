import OpenAI from 'openai'
import { createAdminClient } from '@/lib/supabase'
import { ProspectorAgent } from './prospector'
import { SalesAgent } from './sales'
import { MonitorAgent } from './monitor'
import { ReporterAgent } from './reporter'
import { FollowUpAgent } from './followup'

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

const BASE_SYSTEM_PROMPT = `Sos el Agente Orquestador de DIVINIA, empresa de IA para PYMEs argentinas fundada por Joaco en San Luis, Argentina.

## Sobre DIVINIA
- Vende chatbots con IA (desde $150.000 ARS), sistemas de turnos online ($150.000-$400.000) y automatizaciones
- Clientes target: PYMEs de San Luis y toda Argentina (restaurantes, clínicas, estéticas, talleres, hoteles, etc.)
- Cobro: MercadoPago (50% adelanto, 50% entrega). Precios en ARS.
- Trial gratuito: 14 días sin tarjeta
- Stack: Next.js, Supabase, OpenRouter, Resend, Apify, MercadoPago

## Sub-agentes disponibles
- **Prospector** 🔍: busca leads nuevos en Google Maps por rubro + ciudad usando Apify.
- **Ventas** 📧: genera emails de outreach con IA y los envía a leads sin contactar.
- **Monitor** 📊: revisa clientes con trials venciendo en 3 días o ya expirados.
- **Reporter** 📋: genera reporte completo del estado de DIVINIA (clientes, leads, turnos, KPIs).
- **Seguimiento** 🔄: detecta leads contactados hace +3 días sin respuesta y genera mensajes de follow-up.

## Cómo delegar
Cuando Joaco pida algo que requiera un agente:
1. Indicá qué agente vas a activar y por qué
2. Ejecutalo (el resultado aparece en el mismo mensaje)
3. Interpretá el resultado y sugerí el próximo paso accionable

## Conocimiento del negocio
Podés responder sobre:
- Estrategias de ventas para PYMEs argentinas
- Cómo vender chatbots y sistemas de turnos
- Qué rubros tienen más potencial (estéticas, clínicas, restaurantes, talleres)
- Pricing y propuestas comerciales
- Cómo hacer seguimiento de leads
- Qué decir en un primer contacto por WhatsApp o email

Usá español argentino (vos, sos, tenés). Sé directo, breve y accionable.`

async function getDiviniaContext(): Promise<string> {
  try {
    const db = createAdminClient()
    const today = new Date().toISOString().split('T')[0]

    const [{ data: clients }, { data: leads }] = await Promise.all([
      db.from('clients').select('status, trial_end'),
      db.from('leads').select('status, outreach_sent, score'),
    ])

    const activeClients = clients?.filter(c => c.status === 'active').length ?? 0
    const trialClients = clients?.filter(c => c.status === 'trial').length ?? 0
    const expiringIn3 = clients?.filter(c => {
      if (c.status !== 'trial' || !c.trial_end) return false
      const days = Math.ceil((new Date(c.trial_end).getTime() - Date.now()) / 86400000)
      return days >= 0 && days <= 3
    }).length ?? 0

    const newLeads = leads?.filter(l => l.status === 'new' && !l.outreach_sent).length ?? 0
    const highScore = leads?.filter(l => (l.score ?? 0) >= 70).length ?? 0
    const totalLeads = leads?.length ?? 0

    return `\n\n## Estado actual de DIVINIA (${today})
- Clientes activos: ${activeClients} | En trial: ${trialClients}${expiringIn3 > 0 ? ` | ⚠️ ${expiringIn3} trial(s) vencen en 3 días` : ''}
- Leads totales: ${totalLeads} | Sin contactar: ${newLeads} | Score ≥70: ${highScore}`
  } catch {
    return ''
  }
}

export async function* chat(userMessage: string): AsyncGenerator<string> {
  const db = createAdminClient()
  await db.from('agent_chats').insert({ role: 'user', content: userMessage })

  const [{ data: history }, context] = await Promise.all([
    db.from('agent_chats')
      .select('role, content')
      .order('created_at', { ascending: false })
      .limit(20),
    getDiviniaContext(),
  ])

  const messages = (history ?? []).reverse()
  const systemPrompt = BASE_SYSTEM_PROMPT + context

  const agentAction = detectAgentAction(userMessage)

  let agentOutput = ''
  if (agentAction) {
    yield `> Activando **${agentAction.label}**...\n\n`
    agentOutput = await runAgent(agentAction)
    yield agentOutput
    yield '\n\n---\n\n'
  }

  const stream = await getOpenRouter().chat.completions.create({
    model: 'meta-llama/llama-3.3-70b-instruct:free',
    max_tokens: 1200,
    stream: true,
    messages: [
      { role: 'system', content: systemPrompt + (agentOutput ? `\n\nResultado del agente:\n${agentOutput}` : '') },
      ...messages.map(m => ({ role: m.role as 'user' | 'assistant', content: m.content })),
    ],
  })

  let fullResponse = agentOutput
    ? `> Activando **${agentAction?.label}**...\n\n${agentOutput}\n\n---\n\n`
    : ''

  for await (const chunk of stream) {
    const text = chunk.choices[0]?.delta?.content ?? ''
    if (text) {
      fullResponse += text
      yield text
    }
  }

  await db.from('agent_chats').insert({ role: 'assistant', content: fullResponse })
}

type AgentAction =
  | { type: 'prospector'; label: string; params: Record<string, unknown> }
  | { type: 'sales'; label: string; params: Record<string, unknown> }
  | { type: 'monitor'; label: string; params: Record<string, unknown> }
  | { type: 'reporter'; label: string; params: Record<string, unknown> }
  | { type: 'followup'; label: string; params: Record<string, unknown> }

function detectAgentAction(message: string): AgentAction | null {
  const lower = message.toLowerCase()

  // Reporter
  if (/\b(reporte|report|resumen|estado|kpi|dashboard|cómo estamos|como estamos|mostrá|mostra)\b/.test(lower) &&
      /\b(divinia|negocio|semana|hoy|clientes|leads|turnos|general|todo)\b/.test(lower)) {
    return { type: 'reporter', label: 'Agente Reporter 📋', params: {} }
  }

  // Seguimiento / Follow-up
  if (/\b(seguimiento|follow.?up|seguí|segui|contactar de nuevo|re.?contact|sin respuesta|no respondieron)\b/.test(lower)) {
    return { type: 'followup', label: 'Agente de Seguimiento 🔄', params: {} }
  }

  // Prospector
  if (/\b(busca|buscá|prospecta|prospectá|scrapea|scrapeá|encontrá|trae|traé|conseguí)\b/.test(lower) &&
      /\b(lead|negocio|empresa|contacto|cliente|restau|clínic|comerci|farmaci|veterina|hotel|peluqu|taller|odont|gimnas|inmobi|empresa)\b/.test(lower)) {
    const rubroM = lower.match(/(?:de|para)\s+([\w\s]+?)\s+en\b/)
    const ciudadM = lower.match(/\ben\s+([\w\s]+?)(?:\s*$|\s*[,.]|\s+(?:limit|\d))/)
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

  // Ventas
  if (/\b(enviá|envia|manda|mandá|lanzá|lanza|ejecutá|ejecuta)\b/.test(lower) &&
      /\b(email|outreach|campaña|emails|contacto)\b/.test(lower)) {
    const limitM = lower.match(/(\d+)\s+(?:email|lead|contact)/)
    return {
      type: 'sales',
      label: 'Agente de Ventas 📧',
      params: { limit: limitM ? parseInt(limitM[1]) : 5 },
    }
  }

  // Monitor
  if (/\b(monitorea|monitoreá|chequea|chequeá|revisa|revisá|verificá|verifica)\b/.test(lower) &&
      /\b(trial|triales|vencimiento|vence|expirac|cliente|clientes)\b/.test(lower)) {
    return { type: 'monitor', label: 'Agente Monitor 📊', params: {} }
  }

  return null
}

async function runAgent(action: AgentAction): Promise<string> {
  try {
    switch (action.type) {
      case 'reporter': {
        const result = await new ReporterAgent().run()
        return result.message
      }
      case 'followup': {
        const result = await new FollowUpAgent().run()
        return result.message
      }
      case 'prospector': {
        const p = action.params as unknown as { rubro: string; ciudad: string; limit?: number }
        const result = await new ProspectorAgent().run({
          rubro: p.rubro ?? 'negocios',
          ciudad: p.ciudad ?? 'San Luis',
          limit: p.limit,
        })
        return `**Prospector:** ${result.message}`
      }
      case 'sales': {
        const p = action.params as unknown as { limit?: number }
        const result = await new SalesAgent().run({ limit: p.limit })
        return `**Ventas:** ${result.message}`
      }
      case 'monitor': {
        const result = await new MonitorAgent().run()
        if (result.data) {
          const d = result.data as { expiring_list?: { name: string; trial_end: string }[]; expired_list?: { name: string; trial_end: string }[] }
          let detail = `**Monitor:** ${result.message}`
          if (d.expiring_list?.length) {
            detail += '\n\nVencen pronto:\n' + d.expiring_list.map(c => `  • ${c.name} (${c.trial_end})`).join('\n')
          }
          if (d.expired_list?.length) {
            detail += '\n\nYa vencidos:\n' + d.expired_list.map(c => `  • ${c.name}`).join('\n')
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
