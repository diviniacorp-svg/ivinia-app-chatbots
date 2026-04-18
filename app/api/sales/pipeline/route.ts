/**
 * DIVINIA NUCLEUS — Sales Pipeline API
 * POST /api/sales/pipeline
 *
 * Maneja todo el flujo de ventas:
 *   score    → califica un lead (0-100)
 *   outreach → genera mensaje WA + email por rubro
 *   propuesta → genera propuesta comercial completa
 *   followup  → genera mensaje de seguimiento
 *   upsell    → genera oferta de producto siguiente
 */

import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { supabaseAdmin } from '@/lib/supabase'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })

const BRAND = `
DIVINIA = empresa de IA para PYMEs argentinas. Español argentino. Sin corporativo.
Productos: Turnero ($43k/mes o $100k único), Chatbot WA ($150k-$250k), Content Factory ($80k-$150k/mes), NUCLEUS (OS completo desde $800k).
Prohibido: "soluciones", "innovador", "robusto", "plataforma", "revolucionario".
Target: dueños de negocios locales 30-55 años, San Luis → Argentina.
`.trim()

// ─── Calificador de Leads ─────────────────────────────────────────────────────

async function scoreLead(lead: {
  rubro?: string
  tiene_instagram?: boolean
  tiene_web?: boolean
  ciudad?: string
  telefono?: string
  email?: string
}) {
  const msg = await anthropic.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 200,
    system: `Sos el calificador de leads de DIVINIA. Calculás un score 0-100.
Criterios: rubro alta demanda (peluquería, estética, odontología, gym) +30pts | tiene Instagram activo +20pts | no tiene sistema de turnos online +25pts | ciudad San Luis/Cuyo +15pts | tiene email +10pts.
Devolvé SOLO JSON: {"score": 0-100, "razon": "1 oración", "accion_inmediata": "contactar_ya|nurturing|descartar"}`,
    messages: [{ role: 'user', content: JSON.stringify(lead) }],
  })
  try {
    const text = msg.content[0].type === 'text' ? msg.content[0].text : '{}'
    return JSON.parse(text.match(/\{[\s\S]*\}/)?.[0] || '{}')
  } catch { return { score: 50, razon: 'Score promedio', accion_inmediata: 'nurturing' } }
}

// ─── Redactor de Outreach ─────────────────────────────────────────────────────

async function generarOutreach(lead: {
  negocio?: string
  rubro?: string
  nombre_contacto?: string
  ciudad?: string
}, tipo: 'wa' | 'email' | 'ambos') {
  const msg = await anthropic.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 600,
    system: `${BRAND}
Sos el redactor de outreach. Generás primer contacto personalizado por rubro.
WA: máximo 3 líneas, incluye link demo del rubro, tono humano y directo.
Email: asunto impactante + 4 párrafos max + CTA claro.
Links demo por rubro: peluquería → /reservas/rufina | estética → /reservas/estetica | odontología → /reservas/odontologia | gimnasio → /reservas/gimnasio | (otros) → /reservas/rufina
URL base: https://divinia.vercel.app
Devolvé SOLO JSON: {"wa": "mensaje wa", "email_asunto": "asunto", "email_cuerpo": "cuerpo del email"}`,
    messages: [{
      role: 'user',
      content: `Negocio: ${lead.negocio || 'el negocio'} | Rubro: ${lead.rubro || 'general'} | Ciudad: ${lead.ciudad || 'San Luis'} | Tipo: ${tipo}`,
    }],
  })
  try {
    const text = msg.content[0].type === 'text' ? msg.content[0].text : '{}'
    return JSON.parse(text.match(/\{[\s\S]*\}/)?.[0] || '{}')
  } catch { return { wa: 'Error generando mensaje', email_asunto: '', email_cuerpo: '' } }
}

// ─── Generador de Propuestas ──────────────────────────────────────────────────

async function generarPropuesta(params: {
  negocio: string
  rubro: string
  ciudad: string
  productos: string[]
  dolor_especifico?: string
}) {
  const precios: Record<string, string> = {
    turnero_mensual: '$43.000/mes (cancela cuando quiere)',
    turnero_unico: '$100.000 pago único (para siempre)',
    chatbot_basico: '$150.000 (48hs)',
    chatbot_pro: '$250.000 (1 semana)',
    content_factory: '$80.000-$150.000/mes',
    nucleus: 'Desde $800.000 (cotizar)',
  }

  const productosTexto = params.productos.map(p => `- ${p}: ${precios[p] || 'a cotizar'}`).join('\n')

  const msg = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1000,
    system: `${BRAND}
Sos el generador de propuestas comerciales. Creás propuestas en markdown que se pueden enviar por WA o email.
Estructura: 1) El problema actual del negocio (específico al rubro) 2) La solución DIVINIA 3) Qué incluye 4) Precio 5) ROI estimado en ARS 6) Próximos pasos (demo → pago → entrega en 48hs).
Tono: confiado, claro, sin promesas imposibles. Argentino.`,
    messages: [{
      role: 'user',
      content: `Negocio: ${params.negocio}
Rubro: ${params.rubro}
Ciudad: ${params.ciudad}
Productos: \n${productosTexto}
Dolor específico: ${params.dolor_especifico || 'no especificado'}

Generá la propuesta completa en markdown.`,
    }],
  })

  const contenido = msg.content[0].type === 'text' ? msg.content[0].text : ''

  // Calcular precio total
  const precioMap: Record<string, number> = {
    turnero_mensual: 43000,
    turnero_unico: 100000,
    chatbot_basico: 150000,
    chatbot_pro: 250000,
    content_factory: 80000,
  }
  const total = params.productos.reduce((sum, p) => sum + (precioMap[p] || 0), 0)

  return {
    contenido,
    precio_total: total,
    precio_adelanto: Math.round(total * 0.5),
  }
}

// ─── Generador de Follow-up ────────────────────────────────────────────────────

async function generarFollowup(lead: {
  negocio?: string
  rubro?: string
  intentos: number
  ultimo_mensaje?: string
}) {
  const tipoMap: Record<number, string> = {
    1: 'recordatorio suave (24h sin respuesta)',
    2: 'nuevo ángulo de valor (48h sin respuesta)',
    3: 'último intento con oferta especial (7 días)',
  }
  const tipo = tipoMap[lead.intentos] || 'reactivación'

  const msg = await anthropic.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 300,
    system: `${BRAND} Generás mensajes de follow-up para leads sin respuesta. Cada intento tiene un ángulo diferente. Devolvé SOLO JSON: {"wa": "mensaje", "tipo": "tipo del mensaje"}`,
    messages: [{
      role: 'user',
      content: `Negocio: ${lead.negocio} | Rubro: ${lead.rubro} | Tipo: ${tipo} | Intento #${lead.intentos}`,
    }],
  })

  try {
    const text = msg.content[0].type === 'text' ? msg.content[0].text : '{}'
    return JSON.parse(text.match(/\{[\s\S]*\}/)?.[0] || '{}')
  } catch { return { wa: 'Hola, ¿pudiste ver el mensaje anterior? Cualquier consulta estoy acá.', tipo } }
}

// ─── Handler principal ────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  const startMs = Date.now()

  try {
    const body = await req.json()
    const { accion, lead_id, ...params } = body

    if (!accion) return NextResponse.json({ error: 'accion requerida' }, { status: 400 })

    // Cargar lead si hay lead_id
    let leadData: Record<string, unknown> = params
    if (lead_id) {
      const { data } = await supabaseAdmin.from('leads').select('*').eq('id', lead_id).single()
      if (data) leadData = { ...data, ...params }
    }

    switch (accion) {

      case 'score': {
        const resultado = await scoreLead({
          rubro: leadData.rubro as string,
          tiene_instagram: !!(leadData.instagram as string),
          tiene_web: !!(leadData.web as string),
          ciudad: leadData.ciudad as string,
          telefono: leadData.telefono as string,
          email: leadData.email as string,
        })

        // Guardar score en Supabase
        if (lead_id) {
          await supabaseAdmin.from('leads').update({
            score: resultado.score,
            status: resultado.accion_inmediata === 'descartar' ? 'perdido' :
                    resultado.accion_inmediata === 'contactar_ya' ? 'nuevo' : 'nurturing',
            updated_at: new Date().toISOString(),
          }).eq('id', lead_id)
        }

        return NextResponse.json({ success: true, accion: 'score', resultado, durationMs: Date.now() - startMs })
      }

      case 'outreach': {
        const tipo = (params.tipo as 'wa' | 'email' | 'ambos') || 'wa'
        const resultado = await generarOutreach({
          negocio: leadData.negocio as string || leadData.nombre as string,
          rubro: leadData.rubro as string,
          nombre_contacto: leadData.nombre_contacto as string,
          ciudad: leadData.ciudad as string,
        }, tipo)

        // Guardar mensaje generado
        if (lead_id) {
          await supabaseAdmin.from('outreach_messages').insert({
            lead_id,
            canal: tipo === 'ambos' ? 'whatsapp' : tipo,
            tipo: 'primer_contacto',
            contenido: resultado.wa || resultado.email_cuerpo,
            status: 'generado',
          })
        }

        return NextResponse.json({ success: true, accion: 'outreach', resultado, durationMs: Date.now() - startMs })
      }

      case 'propuesta': {
        const productos = (params.productos as string[]) || ['turnero_mensual']
        const propuesta = await generarPropuesta({
          negocio: leadData.negocio as string || leadData.nombre as string || 'Tu negocio',
          rubro: leadData.rubro as string || 'negocio local',
          ciudad: leadData.ciudad as string || 'San Luis',
          productos,
          dolor_especifico: params.dolor as string,
        })

        // Guardar propuesta en Supabase
        let proposalId: string | null = null
        if (lead_id) {
          const { data } = await supabaseAdmin.from('proposals').insert({
            lead_id,
            rubro: leadData.rubro as string,
            productos,
            precio_total: propuesta.precio_total,
            precio_adelanto: propuesta.precio_adelanto,
            contenido: propuesta.contenido,
            status: 'borrador',
          }).select('id').single()
          proposalId = data?.id || null

          // Avanzar lead en pipeline
          await supabaseAdmin.from('leads').update({
            status: 'propuesta',
            updated_at: new Date().toISOString(),
          }).eq('id', lead_id)
        }

        return NextResponse.json({
          success: true,
          accion: 'propuesta',
          proposal_id: proposalId,
          resultado: propuesta,
          durationMs: Date.now() - startMs,
        })
      }

      case 'followup': {
        const intentos = (leadData.intentos_contacto as number) || 1
        const resultado = await generarFollowup({
          negocio: leadData.negocio as string,
          rubro: leadData.rubro as string,
          intentos,
        })

        if (lead_id) {
          await supabaseAdmin.from('outreach_messages').insert({
            lead_id,
            canal: 'whatsapp',
            tipo: `followup_${intentos}` as 'followup_1' | 'followup_2' | 'followup_final',
            contenido: resultado.wa,
            status: 'generado',
          })

          await supabaseAdmin.from('leads').update({
            intentos_contacto: intentos + 1,
            proximo_followup: new Date(Date.now() + (intentos >= 3 ? 30 : intentos === 2 ? 7 : 2) * 86400000).toISOString(),
            updated_at: new Date().toISOString(),
          }).eq('id', lead_id)
        }

        return NextResponse.json({ success: true, accion: 'followup', resultado, durationMs: Date.now() - startMs })
      }

      default:
        return NextResponse.json({ error: `Acción desconocida: ${accion}. Opciones: score, outreach, propuesta, followup` }, { status: 400 })
    }

  } catch (err) {
    console.error('[Sales Pipeline] Error:', err)
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({
    api: 'DIVINIA Sales Pipeline',
    acciones: {
      score: 'POST { accion: "score", rubro, tiene_instagram, ciudad }',
      outreach: 'POST { accion: "outreach", lead_id, tipo: "wa|email|ambos" }',
      propuesta: 'POST { accion: "propuesta", lead_id, productos: ["turnero_mensual"] }',
      followup: 'POST { accion: "followup", lead_id }',
    },
  })
}
