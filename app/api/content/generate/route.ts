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
    descripcion: 'Chatbot de WhatsApp que responde solo 24hs: da precios, agenda turnos, responde preguntas frecuentes, cobra señas, avisa al dueño cuando hay algo importante.',
    precio: '$90.000/mes básico | $180.000 único',
    cta: 'Empezá con 14 días gratis — sin tarjeta',
  },
  content: {
    nombre: 'CONTENT FACTORY',
    descripcion: 'Pack mensual de contenido listo para publicar: posts diseñados, captions con tono propio, hashtags, reels, planificación editorial. Solo aprobar y publicar.',
    precio: '$80.000/mes (12 posts) | $150.000/mes completo',
    cta: 'El primer mes con 30% off para nuevos clientes',
  },
  avatares: {
    nombre: 'AVATARES IA',
    descripcion: 'Presentador virtual con cara, voz y personalidad propia. Graba videos de producto, atiende en video, presenta novedades. Sin filmar, sin actores. Mundos 3D de fondo.',
    precio: '$200.000-$600.000 setup | $100.000/mes pack videos',
    cta: 'Mirá ejemplos reales — link en bio',
  },
  nucleus: {
    nombre: 'NUCLEUS IA',
    descripcion: 'Sistema de inteligencia artificial a medida: agentes coordinados que automatizan el core del negocio. Turnos + seguimiento + facturación + redes + reportes. Todo junto.',
    precio: 'desde $800.000 | proyecto a medida',
    cta: 'Agendá una consulta gratuita — sin compromiso',
  },
}

const PILARES: Record<string, string> = {
  problema: 'Mostrar el dolor/problema ANTES del producto. Hook emocional, situación real, pérdida de dinero o tiempo concreta.',
  demo: 'Mostrar el producto en acción. Paso a paso visual, qué hace exactamente, experiencia del cliente y del dueño.',
  resultado: 'Casos de éxito, métricas, testimonios, antes/después. Números concretos. Qué cambió en el negocio.',
  educacion: 'Explicar la tecnología de forma simple. Cómo funciona la IA, por qué es diferente, conceptos que el cliente no sabe.',
  behind: 'Detrás de escena: cómo DIVINIA construye, proceso de setup, el equipo IA trabajando, decisiones de diseño.',
  cta: 'Llamado a acción directo. Precio visible, oferta limitada, urgencia real. Convertir seguidor en cliente.',
}

const TIPOS: Record<string, string> = {
  post: 'Post estático Instagram 1080x1080. Caption 300-500 caracteres. Hook visual en el diseño.',
  carrusel: 'Carrusel Instagram 5-7 slides. Slide 1 = hook, último = CTA. Caption 200-300 chars.',
  reel: 'Guion Reel 30-45 segundos. Texto hablado + instrucciones de edición. Cortes cada 3-5 seg.',
  story: 'Secuencia 3 Stories. Texto corto, sticker/poll/link en swipe up. Narrativa que lleva al DM.',
}

const HERRAMIENTAS: Record<string, string> = {
  canva: `Canva AI (generación de imagen estática).
Especificaciones: fondo negro puro #09090b, elementos decorativos con círculos difusos violeta y rosa, tipografía bold blanca, badge pill arriba centrado, logo "◉ DIVINIA" abajo centrado.
Prompt para Canva: query de diseño en inglés, dark SaaS aesthetic, sin fotos de stock, solo elementos gráficos y tipografía.`,

  mystic: `Freepik Mystic (generación de imágenes IA fotorrealistas o artísticas).
Especificaciones: alta resolución, estilo cinematográfico, iluminación dramática.
Prompt: descripción detallada de la imagen con estilo, iluminación, ángulo de cámara, atmósfera. Incluí: aspect ratio 1:1 para posts, 9:16 para stories.`,

  seedance: `Freepik Seedance 2.0 (video IA de movimiento realista, hasta 8 seg).
Especificaciones: movimientos sutiles y orgánicos, cámara lenta, loops posibles, fondo oscuro.
Prompt: describe el objeto principal, su movimiento, iluminación, fondo. Seedance es ideal para: productos flotando, mockups animados, logos que brillan, partículas ambientales.`,

  kling: `Freepik Kling Omni (video IA creativo con física y movimientos complejos, hasta 10 seg).
Especificaciones: física realista, movimientos con inercia y rebote, puede tener personajes o elementos interactivos.
Prompt: describe la acción completa con física (cae, rebota, gira, explota), ángulo de cámara, transiciones, atmósfera. Kling es ideal para: transiciones de producto, reveals dramáticos, animaciones de UI, efectos impactantes.`,

  spaces: `Freepik Spaces (mundos 3D interactivos y escenas tridimensionales).
Especificaciones: entornos 3D completos con profundidad, materiales (metálico, vidrio, neón), iluminación volumétrica, cámara con perspectiva.
Prompt: describe el mundo/escena completo: qué hay en primer plano, plano medio, fondo. Materiales de cada objeto. Fuentes de luz. Color de ambiente. Cámara: ángulo, lente (wide/macro), movimiento. Freepik Spaces es ideal para: salas de control futuristas, mundos de datos, escenas tech abstractas, backgrounds de marca premium.`,
}

export async function POST(req: NextRequest) {
  const { producto, pilar, tipo, herramienta = 'canva', customHint } = await req.json()

  if (!producto || !pilar || !tipo) {
    return NextResponse.json({ error: 'Faltan parámetros' }, { status: 400 })
  }

  const prod = PRODUCTOS[producto]
  const pilarDesc = PILARES[pilar]
  const tipoDesc = TIPOS[tipo]
  const herramientaDesc = HERRAMIENTAS[herramienta] ?? HERRAMIENTAS.canva

  if (!prod || !pilarDesc || !tipoDesc) {
    return NextResponse.json({ error: 'Parámetros inválidos' }, { status: 400 })
  }

  const systemPrompt = `Sos el Director de Contenidos de DIVINIA, empresa de IA para PYMEs argentinas, con base en San Luis.

VOZ: Directa, sin poses de gurú, sin humo. Argentino real (vos, sos, tenés, hacés). Ejemplos concretos: peluquerías, clínicas, nails, gimnasios, restaurantes de San Luis y Argentina.

IDENTIDAD VISUAL: fondo negro (#09090b), acento violeta (#8B5CF6) o rosa (#EC4899), tipografía bold blanca, estética dark premium SaaS. Círculo violeta difuso top-right, círculo rosa difuso bottom-left. Siempre logo "◉ DIVINIA" al pie.

CUENTA: @autom_atia — Instagram.

OBJETIVO: que el dueño de una peluquería en San Luis piense "esto es para mí" y mande un DM.`

  const userPrompt = `Generá contenido para @autom_atia con estas especificaciones:

PRODUCTO: ${prod.nombre}
DESCRIPCIÓN: ${prod.descripcion}
PRECIO: ${prod.precio}
CTA: ${prod.cta}

PILAR: ${pilarDesc}
FORMATO: ${tipoDesc}
HERRAMIENTA VISUAL: ${herramientaDesc}
${customHint ? `CONTEXTO EXTRA: ${customHint}` : ''}

Respondé SOLO con este JSON (sin markdown, sin texto extra):
{
  "titulo": "nombre interno del post, max 60 chars",
  "caption": "caption completo para Instagram con emojis, saltos de línea naturales y hashtags al final separados del cuerpo por dos saltos de línea",
  "hashtags": ["20", "hashtags", "sin", "simbolo", "almohadilla"],
  "brief": "brief visual para el diseñador: qué aparece en la imagen/video, disposición de elementos, texto del diseño, jerarquía visual. Específico y accionable.",
  "visualPrompt": "prompt optimizado específicamente para la herramienta elegida (${herramienta}). En inglés. Muy detallado: sujeto principal, estilo, iluminación, ángulo de cámara, atmósfera, materiales, movimiento si aplica.",
  "secondaryPrompt": "si la herramienta es Spaces o Kling, incluí un segundo prompt para el plano de fondo o escena alternativa. Si no aplica, string vacío."
}`

  const message = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 1400,
    system: systemPrompt,
    messages: [{ role: 'user', content: userPrompt }],
  })

  const raw = message.content[0].type === 'text' ? message.content[0].text : '{}'

  // Strip markdown code fences if model wraps the JSON
  let jsonStr = raw.trim()
  const fenceMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)\s*```/)
  if (fenceMatch) jsonStr = fenceMatch[1].trim()
  // Grab the outermost JSON object in case there's leading/trailing text
  const start = jsonStr.indexOf('{')
  const end = jsonStr.lastIndexOf('}')
  if (start !== -1 && end !== -1) jsonStr = jsonStr.slice(start, end + 1)

  try {
    const parsed = JSON.parse(jsonStr)
    return NextResponse.json({ ...parsed, herramienta })
  } catch {
    return NextResponse.json({ error: 'Error generando contenido', raw }, { status: 500 })
  }
}
