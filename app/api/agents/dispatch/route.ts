/**
 * DIVINIA — Mobile Dispatch Agent
 * Control total desde el celular. Un mensaje → toda la fábrica se activa.
 *
 * POST /api/agents/dispatch
 * Body: { command: string, clientId?: string, rubro?: string, platform?: string }
 *
 * Comandos naturales:
 *   "generar reel para peluquería El Buen Corte"
 *   "crear post San Luis lanzamiento"
 *   "pipeline completo para estética Rosa"
 *   "status agentes"
 *   "cuántos clientes tenemos"
 */

import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })

// ─── DIVINIA Brand DNA (compacto, token-efficient) ────────────────────────────
const BRAND_DNA = `
DIVINIA = IA para PYMEs argentinas. Hero: "Todo DIVINIA" (Turnero IA + Chatbot 24hs + Contenido IA).
Paleta: #0A0A0A negro, #8B5CF6 violeta, #EC4899 rosa, #10B981 verde.
Tono: amiga tech argentina — directo, cálido, sin corporativo.
Prohibido: "soluciones", "innovador", "robusto", "plataforma".
Mercado: peluquerías, estéticas, negocios locales. San Luis → Cuyo → Nacional.
Precio: Turnero $43.000 ARS/mes (o $100.000 único), Chatbot básico $150.000, Pro $250.000. Sin free trial. Demo + cierre en el día.
`.trim()

// ─── Intent Parser (Haiku — mínimo tokens) ───────────────────────────────────
async function parseIntent(command: string): Promise<{
  action: 'generate_reel' | 'generate_post' | 'full_pipeline' | 'status' | 'freepik_prompt' | 'sales_message' | 'unknown'
  clientName?: string
  rubro?: string
  topic?: string
  platform?: string
  engine?: 'seedance' | 'kling'
}> {
  const msg = await anthropic.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 200,
    system: `Sos un parser de intenciones para DIVINIA. Dado un comando en español, devolvé SOLO JSON válido.
Acciones posibles: generate_reel, generate_post, full_pipeline, status, freepik_prompt, sales_message, unknown.
Seedance = rápido/demo. Kling = cinemático/storytelling.
Ejemplo: {"action":"generate_reel","clientName":"El Buen Corte","rubro":"peluquería","engine":"seedance"}`,
    messages: [{ role: 'user', content: command }],
  })

  try {
    const text = msg.content[0].type === 'text' ? msg.content[0].text : '{}'
    const json = text.match(/\{[\s\S]*\}/)?.[0] || '{}'
    return JSON.parse(json)
  } catch {
    return { action: 'unknown' }
  }
}

// ─── Copy Agent (Haiku) ───────────────────────────────────────────────────────
async function runCopyAgent(params: {
  action: string
  clientName: string
  rubro: string
  topic?: string
  platform?: string
}): Promise<{ caption: string; hashtags: string; reelScript: string; freepikPrompt: string }> {

  const { caption, hashtags, reelScript, freepikPrompt } = await anthropic.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 600,
    system: `Sos el Copy Agent de DIVINIA. Escribís contenido viral para PYMEs argentinas.
${BRAND_DNA}
Devolvé SOLO JSON: {"caption":"...","hashtags":"...","reelScript":"...","freepikPrompt":"..."}
freepikPrompt: máximo 120 palabras, inglés, para Freepik Seedance/Kling 9:16 vertical, sin texto en pantalla.`,
    messages: [{
      role: 'user',
      content: `Cliente: ${params.clientName} | Rubro: ${params.rubro} | Acción: ${params.action} | Topic: ${params.topic || 'turno automático + chatbot'} | Plataforma: ${params.platform || 'instagram'}`,
    }],
  }).then(r => {
    const text = r.content[0].type === 'text' ? r.content[0].text : '{}'
    const json = text.match(/\{[\s\S]*\}/)?.[0] || '{}'
    return JSON.parse(json)
  })

  return { caption, hashtags, reelScript, freepikPrompt }
}

// ─── QA Agent (Haiku) ─────────────────────────────────────────────────────────
async function runQAAgent(copy: {
  caption: string
  hashtags: string
  reelScript: string
  freepikPrompt: string
}): Promise<{ approved: boolean; score: number; feedback: string; improved?: string }> {

  const result = await anthropic.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 300,
    system: `QA Agent DIVINIA. Revisás copy para Instagram. Penalizás: palabras prohibidas (soluciones/innovador/robusto/plataforma), claims falsos (free trial ya no existe), tono corporativo.
Devolvé SOLO JSON: {"approved":bool,"score":0-100,"feedback":"...","improved":"caption mejorado si score<80"}`,
    messages: [{
      role: 'user',
      content: `Caption: ${copy.caption}\nHashtags: ${copy.hashtags}\nScript: ${copy.reelScript}`,
    }],
  }).then(r => {
    const text = r.content[0].type === 'text' ? r.content[0].text : '{}'
    const json = text.match(/\{[\s\S]*\}/)?.[0] || '{}'
    return JSON.parse(json)
  })

  return result
}

// ─── Freepik Video Agent ──────────────────────────────────────────────────────
async function triggerFreepikVideo(params: {
  prompt: string
  engine?: 'seedance' | 'kling'
  clientName: string
}): Promise<{ jobId: string; engine: string; status: string; estimatedMinutes: number }> {

  const FREEPIK_KEY = process.env.FREEPIK_API_KEY
  if (!FREEPIK_KEY) {
    return { jobId: 'mock-' + Date.now(), engine: params.engine || 'seedance', status: 'mock_no_key', estimatedMinutes: 2 }
  }

  const engineOrder = params.engine === 'kling'
    ? ['kling', 'seedance', 'mystic']
    : ['seedance', 'kling', 'mystic']

  const BASE = 'https://api.freepik.com/v1'
  const headers = { 'X-Freepik-API-Key': FREEPIK_KEY, 'Content-Type': 'application/json' }
  const body = {
    prompt: params.prompt,
    negative_prompt: 'blurry, text, watermark, low quality, amateur, distorted',
    aspect_ratio: '9:16',
    duration: 5,
    resolution: '1080p',
    style: params.engine === 'kling' ? 'cinematic' : 'realistic',
  }

  for (const eng of engineOrder) {
    try {
      const res = await fetch(`${BASE}/ai/video/${eng}/text-to-video`, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
      })
      if (!res.ok) continue
      const data = await res.json()
      const jobId = data.data?.task_id || data.task_id || data.id
      if (!jobId) continue
      return {
        jobId,
        engine: eng,
        status: 'processing',
        estimatedMinutes: eng === 'kling' ? 5 : 2,
      }
    } catch { continue }
  }

  return { jobId: 'error-' + Date.now(), engine: 'none', status: 'failed', estimatedMinutes: 0 }
}

// ─── Status Agent ─────────────────────────────────────────────────────────────
function getSystemStatus() {
  return {
    agents: {
      director: { status: 'online', model: 'claude-sonnet-4-6' },
      copy: { status: 'online', model: 'claude-haiku-4-5-20251001' },
      qa: { status: 'online', model: 'claude-haiku-4-5-20251001' },
      video: { status: process.env.FREEPIK_API_KEY ? 'online' : 'needs_key', engine: 'seedance+kling' },
      design: { status: process.env.CANVA_API_KEY ? 'online' : 'needs_key', engine: 'canva' },
      instagram: { status: process.env.META_ACCESS_TOKEN ? 'online' : 'needs_key' },
    },
    pipeline: 'Brief → Copy (Haiku) → QA (Haiku) → Freepik (Seedance/Kling) → Approval → Publish',
    costs: {
      per_reel_copy_qa: '$0.002 USD',
      per_reel_video: '~0.5 Freepik credits',
      per_client_month: '~$0.55 USD',
      margin: '97%+',
    },
    pricing: {
      mensual: '$43.000 ARS/mes — cancela cuando quiere',
      unico: '$100.000 ARS — pago único, para siempre',
      chatbot_basico: '$150.000 ARS',
      chatbot_pro: '$250.000 ARS',
      landing: '$100.000 ARS',
      free_trial: 'ELIMINADO — se cobra desde el día 1',
    },
  }
}

// ─── Main Handler ─────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  const startMs = Date.now()

  try {
    const body = await req.json()
    const { command, clientId, rubro, topic, platform } = body

    if (!command) {
      return NextResponse.json({ error: 'command requerido' }, { status: 400 })
    }

    // 1. Parse intent
    const intent = await parseIntent(command)

    // STATUS
    if (intent.action === 'status') {
      return NextResponse.json({
        success: true,
        action: 'status',
        result: getSystemStatus(),
        durationMs: Date.now() - startMs,
      })
    }

    // FREEPIK PROMPT ONLY
    if (intent.action === 'freepik_prompt') {
      const copy = await runCopyAgent({
        action: 'freepik_prompt',
        clientName: intent.clientName || clientId || 'DIVINIA Demo',
        rubro: intent.rubro || rubro || 'negocio local',
        topic: intent.topic || topic,
        platform: intent.platform || platform || 'instagram',
      })
      return NextResponse.json({
        success: true,
        action: 'freepik_prompt',
        result: { freepikPrompt: copy.freepikPrompt },
        durationMs: Date.now() - startMs,
      })
    }

    // GENERATE POST or REEL
    if (['generate_post', 'generate_reel', 'full_pipeline', 'sales_message'].includes(intent.action)) {
      const clientName = intent.clientName || clientId || 'Tu Negocio'
      const clientRubro = intent.rubro || rubro || 'negocio local'

      // Copy Agent
      const copy = await runCopyAgent({
        action: intent.action,
        clientName,
        rubro: clientRubro,
        topic: intent.topic || topic,
        platform: intent.platform || platform || 'instagram',
      })

      // QA Agent
      const qa = await runQAAgent(copy)

      // Final caption
      const finalCaption = (!qa.approved && qa.improved) ? qa.improved : copy.caption

      // Video Agent (async — no bloqueamos la respuesta)
      let videoJob: Awaited<ReturnType<typeof triggerFreepikVideo>> | null = null
      if (intent.action === 'generate_reel' || intent.action === 'full_pipeline') {
        videoJob = await triggerFreepikVideo({
          prompt: copy.freepikPrompt,
          engine: intent.engine || 'seedance',
          clientName,
        })
      }

      return NextResponse.json({
        success: true,
        action: intent.action,
        client: { name: clientName, rubro: clientRubro },
        result: {
          caption: finalCaption,
          hashtags: copy.hashtags,
          reelScript: copy.reelScript,
          freepikPrompt: copy.freepikPrompt,
        },
        qa: {
          approved: qa.approved,
          score: qa.score,
          feedback: qa.feedback,
        },
        video: videoJob ? {
          jobId: videoJob.jobId,
          engine: videoJob.engine,
          status: videoJob.status,
          estimatedMinutes: videoJob.estimatedMinutes,
          pollUrl: `/api/agents/freepik?jobId=${videoJob.jobId}&engine=${videoJob.engine}`,
        } : null,
        durationMs: Date.now() - startMs,
      })
    }

    // Unknown command — respond naturally
    const fallback = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 300,
      system: `Sos el asistente de DIVINIA. ${BRAND_DNA}\nRespondés consultas del founder (Joaco) sobre el sistema. Breve y directo.`,
      messages: [{ role: 'user', content: command }],
    })

    return NextResponse.json({
      success: true,
      action: 'chat',
      result: { message: fallback.content[0].type === 'text' ? fallback.content[0].text : 'OK' },
      durationMs: Date.now() - startMs,
    })

  } catch (err) {
    console.error('[Dispatch] Error:', err)
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({
    agent: 'DIVINIA Dispatch',
    version: '2.0',
    status: 'online',
    commands: [
      'generar reel para [rubro] [nombre]',
      'crear post [tema]',
      'pipeline completo para [cliente]',
      'status agentes',
      'prompt freepik para [rubro]',
    ],
  })
}
