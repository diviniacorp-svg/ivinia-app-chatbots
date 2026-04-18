/**
 * DIVINIA — Freepik Video Agent API
 * Genera videos/imágenes vía Freepik API y hace polling del status.
 *
 * POST /api/agents/freepik   — iniciar generación
 * GET  /api/agents/freepik?jobId=xxx&engine=seedance — polling status
 *
 * Token-efficient: prompts máx 120 palabras, batch de 3 variaciones,
 * re-uso de base prompts con subject swap.
 */

import { NextRequest, NextResponse } from 'next/server'

const BASE = 'https://api.freepik.com/v1'

function headers() {
  const key = process.env.FREEPIK_API_KEY
  if (!key) throw new Error('FREEPIK_API_KEY no configurada')
  return { 'X-Freepik-API-Key': key, 'Content-Type': 'application/json', 'Accept': 'application/json' }
}

// ─── DIVINIA Prompt Templates (token-efficient base prompts) ──────────────────
// Estrategia: anchor descriptors reutilizables + subject swap
// Cada prompt: <80 palabras para máximo calidad/token ratio

const DIVINIA_PROMPT_TEMPLATES = {
  // Template base que funciona para cualquier negocio local
  phone_notification: (business: string) =>
    `Smartphone on counter at night, WhatsApp notification glows: unread message. Pan to empty ${business} waiting area. Soft violet light sweep. Counter shows "missed appointment". Dramatic shift: phone screen shows AI auto-reply sent. Dark cinematic, #0A0A0A background, violet #8B5CF6 accent, 9:16 vertical, no text overlays, no people.`,

  // Para mostrar el antes/después de tener DIVINIA
  transformation: (rubro: string) =>
    `Split screen vertical transition. Left: overwhelmed ${rubro} owner surrounded by sticky notes, ringing phone, chaos. Right: same space calm and organized, phone showing automated replies, violet glow on screen. Smooth morphing transition. Cinematic, dark aesthetic, purple-black palette, 9:16.`,

  // Para reel de estadísticas/números
  stats_counter: (stat: string, rubro: string) =>
    `Dark minimalist ${rubro} interior. Floating holographic numbers counting up: "${stat}". Violet particle effects. Slow zoom out revealing the business at night running on autopilot. Cinematic quality, #0A0A0A background, #8B5CF6 glow, 9:16 vertical, no logos, no text.`,

  // Para mostrar turnero
  booking_flow: (rubro: string) =>
    `Close-up of hands scrolling phone, booking appointment at ${rubro}. Screen shows sleek AI booking interface, violet theme. Confirmation animation. Cut to: empty salon chair, then the same chair with customer sitting. Time-lapse of successful day. Modern, clean, dark aesthetic, 9:16.`,

  // Para horario 24hs / chatbot
  night_automation: (rubro: string) =>
    `${rubro} storefront at 2am, lights off, closed sign. Smartphone nearby glows: incoming WhatsApp. AI bot icon pulses violet, types response, sends. Map shows satisfied customer location. City time-lapse. Dark, moody, neon violet accents, cinematic, 9:16 vertical, no people.`,

  // Para contenido y redes
  content_creation: () =>
    `Time-lapse of Instagram feed filling with professional posts. Each post appears with violet sparkle animation. Engagement numbers climbing. Phone floats in dark space, content generating itself. Futuristic, violet-pink gradient particles, dark background, 9:16, no faces, no text.`,
}

// ─── Engine Selection Logic ───────────────────────────────────────────────────
function selectEngine(params: {
  topic?: string
  duration?: number
  quality?: 'fast' | 'cinematic'
}): 'seedance' | 'kling' {
  const topic = (params.topic || '').toLowerCase()
  const cinematic = ['historia', 'story', 'antes y después', 'transformación', 'emotional']
  const fast = ['demo', 'estadística', 'número', 'tutorial', 'proceso', 'booking']

  if (params.quality === 'cinematic') return 'kling'
  if (params.quality === 'fast') return 'seedance'
  if (cinematic.some(k => topic.includes(k))) return 'kling'
  if (fast.some(k => topic.includes(k))) return 'seedance'
  return 'seedance' // default: más rápido
}

// ─── Optimizar prompt (token-efficient) ──────────────────────────────────────
function optimizePrompt(prompt: string): string {
  // Eliminar palabras redundantes, máx 120 palabras
  const words = prompt.split(/\s+/)
  if (words.length <= 120) return prompt

  // Truncar inteligentemente en oración completa
  let truncated = words.slice(0, 120).join(' ')
  const lastPeriod = truncated.lastIndexOf('.')
  if (lastPeriod > 80) truncated = truncated.substring(0, lastPeriod + 1)
  return truncated
}

// ─── POST: iniciar generación ─────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      prompt,
      template,        // nombre del template (opcional)
      templateParams,  // params para el template
      engine,          // 'seedance' | 'kling' | 'auto'
      type = 'video',  // 'video' | 'image'
      format = '9:16',
      duration = 5,
      style,
      variations = 1,  // generar N variaciones (1-3, cuida tokens)
      topic,
      quality,
    } = body

    // Construir prompt final
    let finalPrompt = prompt

    if (!finalPrompt && template && templateParams) {
      const templateFn = DIVINIA_PROMPT_TEMPLATES[template as keyof typeof DIVINIA_PROMPT_TEMPLATES]
      if (typeof templateFn === 'function') {
        // @ts-ignore — params dinámicos
        finalPrompt = templateFn(...(Array.isArray(templateParams) ? templateParams : [templateParams]))
      }
    }

    if (!finalPrompt) {
      return NextResponse.json({ error: 'prompt o template requerido' }, { status: 400 })
    }

    // Optimizar prompt (token-efficient)
    finalPrompt = optimizePrompt(finalPrompt)

    // Seleccionar motor
    const selectedEngine = engine === 'auto' || !engine
      ? selectEngine({ topic, quality })
      : (engine as 'seedance' | 'kling')

    const h = headers()

    if (type === 'image') {
      // Generar imagen (sync o async según Freepik)
      const imgBody = {
        prompt: finalPrompt,
        negative_prompt: 'blurry, low quality, watermark, text overlay, amateur, distorted face',
        num_images: Math.min(variations, 4),
        image: {
          size: format === '9:16'
            ? { width: 768, height: 1366 }
            : format === '1:1'
            ? { width: 1024, height: 1024 }
            : { width: 1366, height: 768 },
        },
        guidance_scale: 7,
        styling: { style: style || 'photo' },
      }

      const res = await fetch(`${BASE}/ai/text-to-image`, {
        method: 'POST', headers: h, body: JSON.stringify(imgBody),
      })

      if (!res.ok) {
        const err = await res.text()
        return NextResponse.json({ error: `Freepik error: ${err}` }, { status: res.status })
      }

      const data = await res.json()
      const jobId = data.data?.task_id || data.task_id || data.id

      // Respuesta síncrona
      if (data.data?.base64 || data.images) {
        const imgs = data.data?.base64 ? [data.data.base64] : data.images
        return NextResponse.json({
          success: true, type: 'image', engine: 'mystic', sync: true,
          images: imgs.map((b64: string) => `data:image/jpeg;base64,${b64}`),
          jobId: jobId || 'sync',
        })
      }

      return NextResponse.json({
        success: true, type: 'image', engine: 'mystic', sync: false,
        jobId, pollUrl: `/api/agents/freepik?jobId=${jobId}&engine=image`,
        estimatedSeconds: 30,
      })
    }

    // VIDEO — intentar engines en orden
    const engineOrder = selectedEngine === 'kling'
      ? [`kling`, `seedance`, `mystic`]
      : [`seedance`, `kling`, `mystic`]

    const videoBody = {
      prompt: finalPrompt,
      negative_prompt: 'amateur, blurry, distorted, ugly, watermark, on-screen text, subtitles, nsfw',
      duration: Math.min(duration, 10) as 5 | 8 | 10,
      aspect_ratio: format,
      style: style || (selectedEngine === 'kling' ? 'cinematic' : 'realistic'),
      resolution: '1080p',
    }

    for (const eng of engineOrder) {
      try {
        const res = await fetch(`${BASE}/ai/video/${eng}/text-to-video`, {
          method: 'POST', headers: h, body: JSON.stringify(videoBody),
        })
        if (res.status === 404 || res.status === 422) continue
        if (!res.ok) continue

        const data = await res.json()
        const jobId = data.data?.task_id || data.task_id || data.id || data.job_id
        if (!jobId) continue

        return NextResponse.json({
          success: true,
          type: 'video',
          engine: eng,
          jobId,
          promptUsed: finalPrompt,
          promptWords: finalPrompt.split(/\s+/).length,
          estimatedMinutes: eng === 'kling' ? 5 : 2,
          pollUrl: `/api/agents/freepik?jobId=${jobId}&engine=${eng}`,
        })
      } catch { continue }
    }

    return NextResponse.json({ error: 'Todos los engines fallaron' }, { status: 500 })

  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}

// ─── GET: polling status ──────────────────────────────────────────────────────
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const jobId = searchParams.get('jobId')
  const engine = searchParams.get('engine') || 'seedance'

  if (!jobId) {
    // Sin jobId → devolver info de templates disponibles
    return NextResponse.json({
      agent: 'DIVINIA Freepik Agent',
      templates: Object.keys(DIVINIA_PROMPT_TEMPLATES),
      engines: { seedance: 'fast (2min, demo/UI)', kling: 'cinematic (5min, storytelling)' },
      usage: {
        start: 'POST /api/agents/freepik { prompt, engine, format }',
        poll: 'GET /api/agents/freepik?jobId=xxx&engine=seedance',
        template: 'POST /api/agents/freepik { template: "phone_notification", templateParams: ["peluquería"] }',
      },
    })
  }

  try {
    const h = headers()
    const pollEndpoints = engine === 'image'
      ? [`${BASE}/ai/text-to-image/${jobId}`]
      : [`${BASE}/ai/video/${engine}/text-to-video/${jobId}`, `${BASE}/ai/text-to-video/${jobId}`]

    for (const endpoint of pollEndpoints) {
      try {
        const res = await fetch(endpoint, { headers: h })
        if (!res.ok) continue
        const data = await res.json()

        const status = (data.data?.status || data.status || data.state || '').toLowerCase()
        const outputUrl = data.data?.output_url || data.output_url || data.data?.video_url || data.video_url

        if (['completed', 'success', 'done'].includes(status)) {
          return NextResponse.json({
            jobId, engine, status: 'completed', outputUrl,
            ready: true,
          })
        }

        if (['failed', 'error', 'cancelled'].includes(status)) {
          return NextResponse.json({
            jobId, engine, status: 'failed',
            error: data.data?.error || data.error || 'Job falló',
            ready: false,
          })
        }

        return NextResponse.json({
          jobId, engine, status: 'processing',
          progress: data.data?.progress || data.progress || null,
          ready: false,
        })
      } catch { continue }
    }

    return NextResponse.json({ jobId, engine, status: 'unknown', ready: false })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
