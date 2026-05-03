/**
 * DIVINIA Content Factory — Generación por cliente
 * POST /api/content-factory/client
 *
 * Genera el paquete mensual de contenido personalizado para un cliente de Content Factory.
 * Guarda en `social_posts` con client_id para que el cliente lo apruebe en /contenido/[clientId]
 */

import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createAdminClient } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })

interface GenerateRequest {
  client_id: string
  business_name: string
  rubro: string
  servicios?: string[]       // ej: ["Uñas en gel", "Nail art", "Depilación"]
  precio_desde?: string      // ej: "$15.000"
  ciudad?: string            // ej: "San Luis"
  ig_handle?: string         // ej: "@rufina.nails"
  mes?: string               // ej: "Mayo 2026" — si no se pasa, se usa el mes actual
  cantidad?: number          // cuántos posts generar (default 12)
}

// Mix estratégico 40/30/20/10
const PLAN_MES = [
  { tipo: 'carrusel', pilar: 'educativo',       objetivo: 'awareness' },
  { tipo: 'reel',     pilar: 'venta',           objetivo: 'conversion' },
  { tipo: 'post',     pilar: 'educativo',       objetivo: 'awareness' },
  { tipo: 'post',     pilar: 'comunidad',       objetivo: 'awareness' },
  { tipo: 'carrusel', pilar: 'venta',           objetivo: 'conversion' },
  { tipo: 'reel',     pilar: 'educativo',       objetivo: 'awareness' },
  { tipo: 'post',     pilar: 'venta',           objetivo: 'conversion' },
  { tipo: 'carrusel', pilar: 'comunidad',       objetivo: 'awareness' },
  { tipo: 'reel',     pilar: 'venta',           objetivo: 'conversion' },
  { tipo: 'post',     pilar: 'educativo',       objetivo: 'awareness' },
  { tipo: 'post',     pilar: 'entretenimiento', objetivo: 'awareness' },
  { tipo: 'carrusel', pilar: 'venta',           objetivo: 'conversion' },
]

function buildSystemPrompt(req: GenerateRequest): string {
  const serviciosStr = req.servicios?.join(', ') || 'sus servicios'
  return `Sos el copywriter de DIVINIA generando contenido para un cliente nuestro.

NEGOCIO CLIENTE:
- Nombre: ${req.business_name}
- Rubro: ${req.rubro}
- Servicios: ${serviciosStr}
- Precio desde: ${req.precio_desde || 'consultar'}
- Ciudad: ${req.ciudad || 'San Luis'}
- Instagram: ${req.ig_handle || '@' + req.business_name.toLowerCase().replace(/\s+/g, '')}

VOZ: Directa, cálida, local. Español argentino (vos, sos, tenés). Habla como el dueño del negocio, no como una corporación.
PROHIBIDO: "soluciones", "innovador", "plataforma", "revolucionario", frases genéricas.

Devolvé SOLO JSON válido, sin markdown ni texto extra.`
}

function buildPostPrompt(plan: typeof PLAN_MES[0], negocio: GenerateRequest, num: number): string {
  const pilares: Record<string, string> = {
    educativo:      'Educá al cliente sobre el servicio, el proceso, cómo prepararse, qué esperar. Tips útiles.',
    venta:          'Mostrá el servicio con precio, CTA directo para reservar. Testimonios, resultados, urgencia real.',
    comunidad:      'Detrás de escena del negocio: el equipo, el local, cómo se trabaja, una historia real.',
    entretenimiento:'Algo ligero y humano: meme del rubro, algo gracioso que pasó, contenido que humaniza la marca.',
  }

  const formatos: Record<string, string> = {
    post:    'Post estático 1080x1080. Caption 200-350 caracteres. Máx 5 hashtags.',
    reel:    'Reel 30-45 segundos. Guion con hooks en pantalla, instrucciones de edición.',
    carrusel:'Carrusel 5-7 slides. Slide 1 = hook que para el scroll. Último slide = CTA.',
  }

  return `Generá el post #${num} para ${negocio.business_name} (${negocio.rubro}).

FORMATO: ${plan.tipo} — ${formatos[plan.tipo]}
PILAR: ${plan.pilar} — ${pilares[plan.pilar]}
OBJETIVO: ${plan.objetivo}

Devolvé este JSON exacto:
{
  "titulo": "nombre interno del post (max 50 chars, no va a IG)",
  "caption": "texto completo del post con emojis y saltos naturales, hashtags al final",
  "hashtags": ["hashtag1", "hashtag2", "hashtag3"],
  "hook": "primera línea del caption, tiene que parar el scroll",
  "visual_prompt": "descripción en español de qué debería tener el diseño visual (colores, imágenes, texto en pantalla, composición)",
  "herramienta": "canva|freepik|remotion",
  "notas_cliente": "explicación breve de por qué este post funciona para su negocio"
}`
}

export async function POST(req: NextRequest) {
  try {
    const body: GenerateRequest = await req.json()
    const { client_id, business_name, rubro } = body

    if (!client_id || !business_name || !rubro) {
      return NextResponse.json(
        { error: 'client_id, business_name y rubro son requeridos' },
        { status: 400 }
      )
    }

    const db = createAdminClient()
    const cantidad = Math.min(body.cantidad ?? 12, 20)
    const mes = body.mes ?? new Date().toLocaleDateString('es-AR', { month: 'long', year: 'numeric' })
    const systemPrompt = buildSystemPrompt(body)

    // Generar posts en paralelo (batches de 4 para no sobrecargar la API)
    const plan = PLAN_MES.slice(0, cantidad)
    const posts: Array<{
      client_id: string
      titulo: string
      caption: string
      hashtags: string
      tipo: string
      pilar: string
      objetivo: string
      hook: string
      visual_prompt: string
      herramienta: string
      notas_cliente: string
      mes: string
      approval_status: string
      created_at: string
    }> = []

    for (let i = 0; i < plan.length; i += 4) {
      const batch = plan.slice(i, i + 4)
      const results = await Promise.all(
        batch.map(async (item, batchIdx) => {
          const num = i + batchIdx + 1
          const msg = await anthropic.messages.create({
            model: 'claude-sonnet-4-6',
            max_tokens: 800,
            system: systemPrompt,
            messages: [{ role: 'user', content: buildPostPrompt(item, body, num) }],
          })

          const text = msg.content[0].type === 'text' ? msg.content[0].text.trim() : '{}'
          const clean = text.replace(/^```json\n?/, '').replace(/\n?```$/, '')
          const parsed = JSON.parse(clean)

          return {
            client_id,
            titulo: parsed.titulo ?? `Post #${num} - ${item.pilar}`,
            caption: parsed.caption ?? '',
            hashtags: Array.isArray(parsed.hashtags) ? parsed.hashtags.join(' ') : '',
            tipo: item.tipo,
            pilar: item.pilar,
            objetivo: item.objetivo,
            hook: parsed.hook ?? '',
            visual_prompt: parsed.visual_prompt ?? '',
            herramienta: parsed.herramienta ?? 'canva',
            notas_cliente: parsed.notas_cliente ?? '',
            mes,
            approval_status: 'pending',
            created_at: new Date().toISOString(),
          }
        })
      )
      posts.push(...results)
    }

    // Guardar en Supabase
    const { data, error } = await db
      .from('social_posts')
      .insert(posts)
      .select('id, titulo, tipo, approval_status')

    if (error) {
      // Si la tabla no existe, devolver los posts generados sin guardar
      if (error.code === '42P01') {
        return NextResponse.json({
          ok: false,
          error: 'La tabla social_posts no existe. Corré la migración SQL primero.',
          migration_needed: true,
          posts_generated: posts.length,
          preview: posts.slice(0, 2),
        }, { status: 503 })
      }
      throw error
    }

    return NextResponse.json({
      ok: true,
      client_id,
      business_name,
      mes,
      posts_generados: posts.length,
      posts: data,
      panel_url: `/contenido/${client_id}`,
    })

  } catch (e) {
    console.error('[content-factory/client]', e)
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Error interno' },
      { status: 500 }
    )
  }
}

// GET /api/content-factory/client?client_id=xxx — estado del mes actual
export async function GET(req: NextRequest) {
  const clientId = req.nextUrl.searchParams.get('client_id')
  if (!clientId) return NextResponse.json({ error: 'client_id requerido' }, { status: 400 })

  const db = createAdminClient()
  const mes = new Date().toLocaleDateString('es-AR', { month: 'long', year: 'numeric' })

  const { data, error } = await db
    .from('social_posts')
    .select('id, titulo, tipo, pilar, approval_status, created_at, media_url')
    .eq('client_id', clientId)
    .eq('mes', mes)
    .order('created_at', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const total = data?.length ?? 0
  const aprobados = data?.filter(p => p.approval_status === 'approved').length ?? 0
  const pendientes = data?.filter(p => p.approval_status === 'pending').length ?? 0
  const con_cambios = data?.filter(p => p.approval_status === 'needs_revision').length ?? 0

  return NextResponse.json({ client_id: clientId, mes, total, aprobados, pendientes, con_cambios, posts: data ?? [] })
}
