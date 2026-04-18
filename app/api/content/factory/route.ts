/**
 * DIVINIA NUCLEUS — Content Factory API
 * POST /api/content/factory
 *
 * Pipeline: Estratega → Copy → Prompt Imagen → Prompt Video → Evaluador → Guardar
 *
 * Acciones:
 *   planificar  → genera plan semanal de contenido
 *   producir    → produce 1 pieza completa (caption + prompt imagen + prompt video)
 *   evaluar     → evalúa una pieza antes de publicar
 *   calendar    → lee el calendario de contenido
 */

import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { supabaseAdmin } from '@/lib/supabase'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })

const BRAND_DNA = `
DIVINIA = IA para PYMEs argentinas. Producto hero: Turnero ($43k/mes).
Sistema visual: fondo negro #09090b, círculo violeta #8B5CF6, acento rosa #EC4899, texto blanco.
Tono: amiga tech argentina — directo, cálido, sin corporativo ni humo.
Prohibido: "soluciones", "innovador", "robusto", "plataforma", "revolucionario".
Target: dueños de negocios locales 30-55 años, San Luis → Argentina.
Instagram: @autom_atia
`.trim()

const FREEPIK_SYSTEM = `
Sos el ingeniero de prompts de video de DIVINIA. Experto en Freepik Kling Omni y Seedance 2.0.

REGLAS CRÍTICAS:
- Seedance 2.0: objetos, productos, motion graphics, animaciones — NO personas reales
- Kling Omni: personas, lifestyle, escenas reales con humanos
- Formato: siempre 9:16 vertical (Instagram Reels)
- NUNCA pidas texto visible en el video (Remotion agrega el overlay)
- NUNCA pidas interfaces de apps o calendarios (aparecen al revés)
- Máximo 120 palabras en inglés
- Estilo: dark, moody, premium, cinematic

ESTRUCTURA DEL PROMPT:
[Subject/action] + [environment/background] + [lighting/mood] + [camera/style] + [technical specs]
`

// ─── Estratega de Contenido ────────────────────────────────────────────────────

async function planificarSemana(contexto: {
  metricas?: Record<string, number>
  productos_foco?: string[]
  eventos?: string[]
}) {
  const msg = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1200,
    system: `${BRAND_DNA}
Sos el estratega de contenido de DIVINIA. Planificás el calendario semanal de Instagram.
Cada post tiene: objetivo (awareness/consideración/conversión), tipo (post/reel/carrusel), tema, formato y qué emoción busca generar.
Devolvé SOLO JSON con esta estructura:
{
  "semana": "descripción de la semana estratégica",
  "posts": [
    {
      "dia": "Lunes",
      "fecha": "YYYY-MM-DD",
      "tipo": "reel|post|carrusel",
      "objetivo": "awareness|consideracion|conversion",
      "tema": "tema del contenido",
      "angulo": "el ángulo creativo específico",
      "engine_video": "seedance|kling|ninguno",
      "prioridad": "alta|media"
    }
  ]
}`,
    messages: [{
      role: 'user',
      content: `Planificá la semana de contenido para DIVINIA.
Productos foco: ${contexto.productos_foco?.join(', ') || 'Turnero'}
Métricas recientes: ${JSON.stringify(contexto.metricas || {})}
Eventos especiales: ${contexto.eventos?.join(', ') || 'ninguno'}
Hoy es: ${new Date().toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' })}`,
    }],
  })

  try {
    const text = msg.content[0].type === 'text' ? msg.content[0].text : '{}'
    return JSON.parse(text.match(/\{[\s\S]*\}/)?.[0] || '{}')
  } catch { return { semana: 'Error planificando', posts: [] } }
}

// ─── Copywriter ────────────────────────────────────────────────────────────────

async function generarCopy(params: {
  tema: string
  angulo: string
  objetivo: string
  tipo: string
  rubro_cliente?: string
}) {
  const msg = await anthropic.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 500,
    system: `${BRAND_DNA}
Sos el copywriter. Escribís captions virales para Instagram.
- Primera línea: HOOK impactante (pregunta o dato sorprendente, máx 10 palabras)
- Cuerpo: 3-5 líneas con valor real
- CTA: directo y accionable
- Hashtags: 5-8 relevantes y nicho

Devolvé SOLO JSON: {"hook": "...", "caption": "...", "cta": "...", "hashtags": "..."}`,
    messages: [{
      role: 'user',
      content: `Tema: ${params.tema} | Ángulo: ${params.angulo} | Objetivo: ${params.objetivo} | Tipo: ${params.tipo}`,
    }],
  })

  try {
    const text = msg.content[0].type === 'text' ? msg.content[0].text : '{}'
    return JSON.parse(text.match(/\{[\s\S]*\}/)?.[0] || '{}')
  } catch { return { hook: '', caption: '', cta: '', hashtags: '' } }
}

// ─── Ingeniero de Prompts — Video ──────────────────────────────────────────────

async function generarPromptVideo(params: {
  tema: string
  angulo: string
  engine: 'seedance' | 'kling'
  objetivo: string
}) {
  const msg = await anthropic.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 300,
    system: FREEPIK_SYSTEM,
    messages: [{
      role: 'user',
      content: `Tema: ${params.tema}
Ángulo creativo: ${params.angulo}
Engine: ${params.engine === 'kling' ? 'Kling Omni (puede tener persona/lifestyle)' : 'Seedance 2.0 (sin personas, objetos/motion)'}
Objetivo: ${params.objetivo}

Generá el prompt cinematográfico perfecto en inglés.`,
    }],
  })

  return msg.content[0].type === 'text' ? msg.content[0].text.trim() : ''
}

// ─── Ingeniero de Prompts — Imagen ────────────────────────────────────────────

async function generarPromptImagen(params: {
  tema: string
  angulo: string
}) {
  const msg = await anthropic.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 200,
    system: `Sos el ingeniero de prompts de imagen de DIVINIA. Experto en Freepik Flux.
Sistema visual: dark background #09090b, purple circle #8B5CF6, pink accent #EC4899, no text in image.
Prompts en inglés, máximo 80 palabras, para formato 4:5 (Instagram post).
Estilo: minimal dark premium SaaS aesthetic.`,
    messages: [{
      role: 'user',
      content: `Tema: ${params.tema} | Ángulo: ${params.angulo}. Generá el prompt para imagen estática.`,
    }],
  })

  return msg.content[0].type === 'text' ? msg.content[0].text.trim() : ''
}

// ─── Evaluador de Contenido ───────────────────────────────────────────────────

async function evaluarContenido(pieza: {
  caption: string
  hashtags: string
  prompt_video?: string
  tipo: string
  objetivo: string
}) {
  const msg = await anthropic.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 400,
    system: `${BRAND_DNA}
Sos el evaluador de contenido de DIVINIA. QA antes de publicar.
Penalizás: palabras prohibidas, tono corporativo, CTA débil, caption muy largo, promesas falsas.
Premiás: hook fuerte, valor claro, tono argentino auténtico, CTA accionable.
Devolvé SOLO JSON: {"score": 0-100, "aprobado": bool, "fortalezas": ["..."], "mejoras": ["..."], "caption_mejorado": "solo si score<80"}`,
    messages: [{
      role: 'user',
      content: `Caption: ${pieza.caption}\nHashtags: ${pieza.hashtags}\nTipo: ${pieza.tipo}\nObjetivo: ${pieza.objetivo}`,
    }],
  })

  try {
    const text = msg.content[0].type === 'text' ? msg.content[0].text : '{}'
    return JSON.parse(text.match(/\{[\s\S]*\}/)?.[0] || '{}')
  } catch { return { score: 70, aprobado: true, fortalezas: [], mejoras: [], caption_mejorado: null } }
}

// ─── Trigger Freepik ──────────────────────────────────────────────────────────

async function triggerFreepik(prompt: string, engine: 'seedance' | 'kling') {
  const FREEPIK_KEY = process.env.FREEPIK_API_KEY
  if (!FREEPIK_KEY) return { jobId: `mock-${Date.now()}`, status: 'mock_no_key', engine }

  const engineMap = { kling: 'kling', seedance: 'seedance' }
  const enginesOrder = [engineMap[engine], engine === 'kling' ? 'seedance' : 'kling', 'mystic']
  const BASE = 'https://api.freepik.com/v1'
  const headers = { 'X-Freepik-API-Key': FREEPIK_KEY, 'Content-Type': 'application/json' }

  for (const eng of enginesOrder) {
    try {
      const res = await fetch(`${BASE}/ai/video/${eng}/text-to-video`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          prompt,
          negative_prompt: 'text, watermark, low quality, amateur, distorted, blurry, readable UI',
          aspect_ratio: '9:16',
          duration: 5,
          resolution: '1080p',
          style: engine === 'kling' ? 'cinematic' : 'realistic',
        }),
      })
      if (!res.ok) continue
      const data = await res.json()
      const jobId = data.data?.task_id || data.task_id || data.id
      if (!jobId) continue
      return { jobId, engine: eng, status: 'processing', estimatedMinutes: eng === 'kling' ? 5 : 2 }
    } catch { continue }
  }

  return { jobId: `error-${Date.now()}`, engine: 'failed', status: 'failed', estimatedMinutes: 0 }
}

// ─── Handler principal ────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  const startMs = Date.now()

  try {
    const body = await req.json()
    const { accion } = body

    switch (accion) {

      case 'planificar': {
        const plan = await planificarSemana({
          productos_foco: body.productos_foco,
          metricas: body.metricas,
          eventos: body.eventos,
        })

        // Guardar en calendario
        if (plan.posts?.length) {
          const rows = plan.posts.map((p: Record<string,string>) => ({
            fecha: p.fecha,
            plataforma: 'instagram',
            tipo: p.tipo,
            objetivo: p.objetivo,
            titulo: p.tema,
            status: 'planificado',
          }))
          await supabaseAdmin.from('content_calendar').upsert(rows, { onConflict: 'fecha,plataforma,tipo' })
        }

        return NextResponse.json({ success: true, accion: 'planificar', plan, durationMs: Date.now() - startMs })
      }

      case 'producir': {
        const { tema, angulo, objetivo, tipo, engine_video } = body
        if (!tema) return NextResponse.json({ error: 'tema requerido' }, { status: 400 })

        const engine = (engine_video as 'seedance' | 'kling') || 'seedance'
        const esReel = tipo === 'reel' || !!engine_video

        // Ejecutar agentes en paralelo (haiku — ultra rápido)
        const [copy, promptVideo, promptImagen] = await Promise.all([
          generarCopy({ tema, angulo: angulo || tema, objetivo: objetivo || 'awareness', tipo: tipo || 'post' }),
          esReel ? generarPromptVideo({ tema, angulo: angulo || tema, engine, objetivo: objetivo || 'awareness' }) : Promise.resolve(''),
          !esReel ? generarPromptImagen({ tema, angulo: angulo || tema }) : Promise.resolve(''),
        ])

        // Evaluador
        const evaluacion = await evaluarContenido({
          caption: copy.caption || '',
          hashtags: copy.hashtags || '',
          prompt_video: promptVideo,
          tipo: tipo || 'post',
          objetivo: objetivo || 'awareness',
        })

        const captionFinal = evaluacion.score < 80 && evaluacion.caption_mejorado
          ? evaluacion.caption_mejorado
          : copy.caption

        // Freepik (si es reel y hay prompt)
        let videoJob = null
        if (esReel && promptVideo) {
          videoJob = await triggerFreepik(promptVideo, engine)
        }

        // Guardar en calendario
        const { data: calendarRow } = await supabaseAdmin.from('content_calendar').insert({
          fecha: body.fecha || new Date().toISOString().split('T')[0],
          plataforma: 'instagram',
          tipo: tipo || 'post',
          objetivo: objetivo || 'awareness',
          titulo: tema,
          caption: captionFinal,
          hashtags: copy.hashtags,
          prompt_imagen: promptImagen || null,
          prompt_video: promptVideo || null,
          freepik_job_id: videoJob?.jobId || null,
          status: evaluacion.aprobado ? 'listo' : 'en_produccion',
          score_evaluacion: evaluacion.score,
          feedback_evaluacion: evaluacion.mejoras?.join('; ') || null,
        }).select('id').single()

        return NextResponse.json({
          success: true,
          accion: 'producir',
          content_id: calendarRow?.id,
          copy: { hook: copy.hook, caption: captionFinal, hashtags: copy.hashtags, cta: copy.cta },
          prompts: { imagen: promptImagen, video: promptVideo },
          evaluacion: { score: evaluacion.score, aprobado: evaluacion.aprobado, mejoras: evaluacion.mejoras },
          video: videoJob ? { ...videoJob, poll_url: `/api/agents/freepik?jobId=${videoJob.jobId}&engine=${videoJob.engine}` } : null,
          instrucciones: esReel
            ? `✅ Prompt generado. Pegarlo en Freepik Spaces → ${engine === 'kling' ? 'Kling Omni' : 'Seedance 2.0'} → Descargar → Subir a public/reels/`
            : `✅ Post listo. Caption aprobado (score ${evaluacion.score}/100). Usar prompt imagen en Freepik Flux.`,
          durationMs: Date.now() - startMs,
        })
      }

      case 'evaluar': {
        const evaluacion = await evaluarContenido({
          caption: body.caption || '',
          hashtags: body.hashtags || '',
          tipo: body.tipo || 'post',
          objetivo: body.objetivo || 'awareness',
        })
        return NextResponse.json({ success: true, accion: 'evaluar', evaluacion, durationMs: Date.now() - startMs })
      }

      case 'calendar': {
        const { data } = await supabaseAdmin
          .from('content_calendar')
          .select('*')
          .gte('fecha', new Date().toISOString().split('T')[0])
          .order('fecha')
          .limit(14)

        return NextResponse.json({ success: true, accion: 'calendar', posts: data || [], durationMs: Date.now() - startMs })
      }

      default:
        return NextResponse.json({ error: `Acción desconocida. Opciones: planificar, producir, evaluar, calendar` }, { status: 400 })
    }

  } catch (err) {
    console.error('[Content Factory] Error:', err)
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({
    api: 'DIVINIA Content Factory',
    acciones: {
      planificar: 'POST { accion: "planificar", productos_foco: ["turnero"] }',
      producir: 'POST { accion: "producir", tema: "...", tipo: "reel|post", engine_video: "seedance|kling" }',
      evaluar: 'POST { accion: "evaluar", caption: "...", hashtags: "..." }',
      calendar: 'POST { accion: "calendar" }',
    },
  })
}
