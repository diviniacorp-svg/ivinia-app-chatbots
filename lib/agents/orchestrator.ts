import OpenAI from 'openai'
import Anthropic from '@anthropic-ai/sdk'
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

function getClaude(): Anthropic {
  return new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })
}

const BASE_SYSTEM_PROMPT = `Sos Orq, el Agente Orquestador de DIVINIA — empresa de IA para PYMEs argentinas fundada por Joaco en San Luis, Argentina.

## Productos DIVINIA
- Turnero: $43.000/mes o $100.000 único (reservas online + seña MercadoPago)
- Chatbot WhatsApp básico: $150.000 | pro: $250.000
- Pack automatizaciones: $300.000 | Landing: $100.000
- Content Factory: $80k-$150k/mes
- Avatares IA: $200k-$600k
- Clientes target: peluquerías, estéticas, odontología, gimnasios, San Luis → Argentina

## 37 Agentes disponibles (11 departamentos)
**Ventas/CRM:** Luna (CRM), Nico (vendedor), Closer (cierre), Prime (lead sales)
**Dev:** Max (full stack), Pixel (frontend), Nodo (backend), Mobi (mobile), Ops (devops)
**Marketing/Contenido:** Copy (captions), Dise (diseño, Claude Design, Canva), Reel (video, Freepik Kling/Seedance), Voz (audio)
**IA:** Flow (automatizaciones), Bot (chatbots WA), Api (integraciones), Orq (orquestador)
**Finanzas:** Franco, Mila (AFIP), Cash, Factu (MercadoPago)
**Proyectos:** ProjectX, Consul, Custom
**Legal:** Lex, IP, Norma
**Avatares:** Avatar, Clon, Director
**Innovación:** Nova (tech research)
**Admin:** Ada, Otto, Vera

## Agentes ejecutables desde acá
- **Prospector** 🔍: busca leads en Google Maps (Apify)
- **Ventas** 📧: envía emails de outreach a leads
- **Monitor** 📊: revisa trials venciendo
- **Reporter** 📋: reporte completo de DIVINIA
- **Seguimiento** 🔄: follow-up a leads sin respuesta
- **Contenido** 🎬: genera caption + prompt Freepik para Instagram (via Reel + Copy)

## Cómo delegar
1. Identificá qué agente ejecutar y por qué
2. Ejecutalo y mostrá resultado
3. Sugerí el próximo paso concreto

## Reglas
Español argentino (vos, sos, tenés). Breve, directo, accionable.
Sin "soluciones", sin "innovador", sin corporativo.
Precios siempre en ARS.`

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

  // Usar Claude Haiku si hay API key, sino OpenRouter como fallback
  const usesClaude = !!process.env.ANTHROPIC_API_KEY
  const systemFull = systemPrompt + (agentOutput ? `\n\nResultado del agente:\n${agentOutput}` : '')

  let streamSource: AsyncIterable<string>

  if (usesClaude) {
    const claude = getClaude()
    const claudeStream = await claude.messages.stream({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1000,
      system: systemFull,
      messages: messages.map(m => ({ role: m.role as 'user' | 'assistant', content: m.content })),
    })
    streamSource = (async function* () {
      for await (const chunk of claudeStream) {
        if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
          yield chunk.delta.text
        }
      }
    })()
  } else {
    const openRouterStream = await getOpenRouter().chat.completions.create({
      model: 'meta-llama/llama-3.3-70b-instruct:free',
      max_tokens: 1200,
      stream: true,
      messages: [
        { role: 'system', content: systemFull },
        ...messages.map(m => ({ role: m.role as 'user' | 'assistant', content: m.content })),
      ],
    })
    streamSource = (async function* () {
      for await (const chunk of openRouterStream) {
        const text = chunk.choices[0]?.delta?.content ?? ''
        if (text) yield text
      }
    })()
  }

  const stream = { [Symbol.asyncIterator]: () => streamSource[Symbol.asyncIterator]() }

  let fullResponse = agentOutput
    ? `> Activando **${agentAction?.label}**...\n\n${agentOutput}\n\n---\n\n`
    : ''

  for await (const text of stream) {
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
  | { type: 'content'; label: string; params: Record<string, unknown> }

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

  // Contenido / Reel / Post / Freepik / Claude Design
  if (/\b(genera|generá|crea|creá|hacé|hace|armá|arma)\b/.test(lower) &&
      /\b(reel|post|contenido|video|caption|freepik|diseño|diseño|imagen|foto|instagram|clip)\b/.test(lower)) {
    // Extraer cliente/rubro del mensaje
    const clientM = lower.match(/(?:para|de)\s+([\w\s]+?)(?:\s+rubro|\s+de\s+|\s*$)/)
    const rubroM = lower.match(/(?:peluquería|estética|odontología|gimnasio|clínica|veterinaria|farmacia|restaurante|taller|inmobiliaria|hotel|panadería|kiosco|spa|yoga|pilates|CrossFit)/)
    const isReel = /\b(reel|video|clip|freepik|kling|seedance)\b/.test(lower)
    return {
      type: 'content',
      label: isReel ? 'Agentes Reel + Copy 🎬' : 'Agentes Copy + Dise ✍️',
      params: {
        command: message,
        clientName: clientM?.[1]?.trim() || 'Tu Negocio',
        rubro: rubroM?.[0] || 'negocio local',
        action: isReel ? 'generate_reel' : 'generate_post',
      },
    }
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

      case 'content': {
        const p = action.params as { command: string; clientName: string; rubro: string; action: string }
        try {
          // Llamar al dispatch que ya tiene Copy + QA + Freepik integrado
          const baseUrl = process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'
          const res = await fetch(`${baseUrl}/api/agents/dispatch`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              command: p.command,
              clientId: p.clientName,
              rubro: p.rubro,
            }),
          })
          const data = await res.json()
          if (!data.success) return `❌ Error en el pipeline de contenido: ${data.error || 'desconocido'}`

          let output = `**Agentes Reel+Copy ejecutados para ${data.client?.name || p.clientName}:**\n\n`
          if (data.result?.caption) {
            output += `📝 **Caption:**\n${data.result.caption}\n\n`
          }
          if (data.result?.hashtags) {
            output += `#️⃣ **Hashtags:** ${data.result.hashtags}\n\n`
          }
          if (data.result?.freepikPrompt) {
            output += `🎬 **Prompt Freepik (copiar en Spaces):**\n\`\`\`\n${data.result.freepikPrompt}\n\`\`\`\n\n`
          }
          if (data.qa) {
            output += `✅ QA Score: ${data.qa.score}/100 ${data.qa.approved ? '— Aprobado' : '— Revisar'}\n`
            if (data.qa.feedback) output += `💬 ${data.qa.feedback}\n`
          }
          if (data.video?.jobId && !data.video.jobId.startsWith('mock')) {
            output += `\n🎥 Video generándose en Freepik (${data.video.engine}) — ID: ${data.video.jobId}`
          }
          return output
        } catch (err) {
          return `Error conectando con agentes de contenido: ${err instanceof Error ? err.message : 'Error'}`
        }
      }
    }
  } catch (err) {
    return `Error ejecutando agente: ${err instanceof Error ? err.message : 'Error desconocido'}`
  }
}
