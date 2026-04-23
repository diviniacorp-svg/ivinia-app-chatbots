import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const PRODUCTOS: Record<string, { nombre: string; descripcion: string; precio: string; cta: string }> = {
  turnero: {
    nombre: 'TURNERO',
    descripcion: 'Sistema de turnos online para PYMEs. El cliente reserva solo, paga la seña por MercadoPago, recibe confirmación automática. El dueño ve todo desde su panel. QR para el local.',
    precio: '$45.000/mes o $120.000 único',
    cta: 'Pedí tu demo gratuita por DM o WhatsApp',
  },
  central: {
    nombre: 'CENTRAL IA',
    descripcion: 'Chatbot de WhatsApp que responde solo 24hs: da precios, agenda turnos, responde las 20 preguntas más frecuentes, cobra señas, avisa al dueño cuando hay algo importante.',
    precio: '$90.000/mes básico | $180.000 único',
    cta: 'Empezá con 14 días gratis — sin tarjeta',
  },
  content: {
    nombre: 'CONTENT FACTORY',
    descripcion: 'Pack mensual de contenido listo para publicar: posts diseñados con el branding del cliente, captions con su tono, hashtags, reels, planificación editorial. Solo aprobar y publicar.',
    precio: '$80.000/mes (12 posts) | $150.000/mes completo',
    cta: 'El primer mes con 30% off para nuevos clientes',
  },
  avatares: {
    nombre: 'AVATARES IA',
    descripcion: 'Presentador virtual con cara, voz y personalidad propia. Graba videos de producto, atiende en video, presenta novedades. No requiere filmar, no requiere actores.',
    precio: '$200.000-$600.000 setup | $100.000/mes pack videos',
    cta: 'Mirá ejemplos reales — link en bio',
  },
  nucleus: {
    nombre: 'NUCLEUS IA',
    descripcion: 'Sistema de inteligencia artificial hecho a medida: varios agentes coordinados que automatizan el core del negocio. Turnos + seguimiento + facturación + redes + reportes. Todo junto, todo automático.',
    precio: 'desde $800.000 | proyecto a medida',
    cta: 'Agendá una consulta gratuita — sin compromiso',
  },
}

const PILARES: Record<string, string> = {
  problema: 'Mostrar el dolor/problema que tiene el cliente ANTES de usar el producto. Hook emocional, situación real, pérdida de dinero o tiempo.',
  demo: 'Mostrar el producto en acción. Paso a paso visual, qué hace exactamente, cómo se ve desde el cliente y desde el dueño del negocio.',
  resultado: 'Casos de éxito, métricas, testimonios, antes/después. Números concretos. Qué cambió en el negocio después de implementarlo.',
  educacion: 'Explicar la tecnología de forma simple. Cómo funciona la IA detrás, por qué es diferente a otras soluciones, conceptos que el cliente no sabe.',
  behind: 'Detrás de escena: cómo DIVINIA construye los productos, el proceso de setup para un cliente, el equipo de IA trabajando, decisiones de diseño.',
  cta: 'Llamado a acción directo. Precio visible, oferta limitada, urgencia real. Foco 100% en convertir al seguidor en cliente.',
}

const TIPOS: Record<string, string> = {
  post: 'Post estático de Instagram (imagen cuadrada 1080x1080). Caption de 300-500 caracteres. Hook visual en el diseño.',
  carrusel: 'Carrusel de Instagram de 5-7 slides. Cada slide tiene su propio texto corto. El primero es el hook, el último es el CTA. Caption de 200-300 chars.',
  reel: 'Guion para Reel de 30-45 segundos. Texto hablado + instrucciones de edición + subtítulos. Ritmo rápido, cortes cada 3-5 seg.',
  story: 'Secuencia de 3 Stories. Cada una con texto corto y sticker/poll/link. Narrativa que lleva al swipe up o DM.',
}

export async function POST(req: NextRequest) {
  const { producto, pilar, tipo, customHint } = await req.json()

  if (!producto || !pilar || !tipo) {
    return NextResponse.json({ error: 'Faltan parámetros' }, { status: 400 })
  }

  const prod = PRODUCTOS[producto]
  const pilarDesc = PILARES[pilar]
  const tipoDesc = TIPOS[tipo]

  if (!prod || !pilarDesc || !tipoDesc) {
    return NextResponse.json({ error: 'Parámetros inválidos' }, { status: 400 })
  }

  const systemPrompt = `Sos el Director de Contenidos de DIVINIA, una empresa de IA para PYMEs argentinas con base en San Luis, Argentina.

DIVINIA es una empresa real que automatiza negocios con IA. No es una agencia genérica. Habla de forma directa, sin poses de gurú, sin humo. Usás lenguaje argentino (vos, sos, tenés, hacés). Usás ejemplos concretos de negocios reales: peluquerías, clínicas, nails, gimnasios, restaurantes.

IDENTIDAD VISUAL:
- Fondo siempre negro (#09090b)
- Acento violeta (#8B5CF6) o rosa (#EC4899)
- Tipografía bold, blanca, impactante
- Estética dark premium SaaS

CUENTA: @autom_atia en Instagram

TU TAREA: Generar contenido de Instagram que posicione a DIVINIA como la empresa de IA más real y accesible para PYMEs argentinas. El contenido tiene que hacer que el dueño de una peluquería en San Luis piense "esto es para mí".`

  const userPrompt = `Generá contenido para Instagram de DIVINIA con estas especificaciones:

PRODUCTO: ${prod.nombre}
DESCRIPCIÓN: ${prod.descripcion}
PRECIO: ${prod.precio}
CTA: ${prod.cta}

PILAR DE CONTENIDO: ${pilarDesc}

FORMATO: ${tipoDesc}

${customHint ? `CONTEXTO ADICIONAL: ${customHint}` : ''}

Respondé EXCLUSIVAMENTE en este formato JSON (sin markdown, sin explicaciones, solo el JSON):
{
  "titulo": "título corto para identificar el post internamente (max 60 chars)",
  "caption": "caption completo listo para publicar en Instagram, con emojis, saltos de línea, hashtags al final separados",
  "hashtags": ["array", "de", "20", "hashtags", "sin", "el", "simbolo"],
  "brief": "brief visual para el diseñador: qué debe mostrar el diseño, qué texto va en la imagen, colores, estilo. 3-5 oraciones.",
  "canvaPrompt": "prompt en inglés para generar el diseño con Canva AI o Freepik. Dark aesthetic, specific visual elements.",
  "freepikPrompt": "prompt en inglés para generar video con Freepik Seedance/Kling si aplica al formato (si no aplica, string vacío)"
}`

  const message = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 1200,
    system: systemPrompt,
    messages: [{ role: 'user', content: userPrompt }],
  })

  const raw = message.content[0].type === 'text' ? message.content[0].text : '{}'

  try {
    const parsed = JSON.parse(raw)
    return NextResponse.json(parsed)
  } catch {
    return NextResponse.json({ error: 'Error generando contenido', raw }, { status: 500 })
  }
}
