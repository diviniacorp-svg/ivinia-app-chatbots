// ============================================================
// DIVINIA — Prompt Factory Agent
// El traductor central entre briefs estratégicos y herramientas
//
// Cada herramienta de producción habla un idioma diferente:
// - Canva MCP: necesita layout, jerarquía, colores exactos, texto
// - Higgsfield: piensa en cinematografía, movimiento, emoción
// - Remotion: specs técnicas, componentes, duración, keyframes
// - DALL-E/Midjourney: composición fotográfica, estilo artístico
//
// El Prompt Factory convierte un brief de contenido en el
// prompt óptimo para cada herramienta, con el brand system
// de DIVINIA/Turnero incorporado en cada uno.
// ============================================================

import Anthropic from '@anthropic-ai/sdk'

// ============================================================
// BRAND CONSTANTS — Single source of truth
// ============================================================

export const TURNERO_BRAND = {
  name: 'Turnero',
  fullName: 'Turnero by DIVINIA',
  colors: {
    indigoPrimary: '#4f46e5',
    indigoDark: '#3730a3',
    indigoLight: '#818cf8',
    lavanda: '#c4b5fd',
    lavandaBg: '#e0e7ff',
    lavandaSoft: '#f0f4ff',
    white: '#ffffff',
    textMain: '#1e1b4b',
    textSecondary: '#6b7280',
    success: '#10b981',
    accent: '#fbbf24',
  },
  font: 'Ubuntu',
  fontWeights: {
    headline: 700,
    subtitle: 500,
    body: 400,
    light: 300,
  },
  style: 'clean white background, 3D lavender puff balls, Ubuntu Bold, indigo accents, friendly SaaS',
  prohibitions: [
    'No dark backgrounds',
    'No stock photos',
    'No more than 3 colors per piece',
    'No mixed fonts',
    'No corporate language',
    'No ALL CAPS',
  ],
} as const

export const DIVINIA_BRAND = {
  name: 'DIVINIA',
  colors: {
    bg: '#09090b',
    accent: '#6366f1',
    text: '#ffffff',
    secondary: '#a1a1aa',
  },
  style: 'dark premium SaaS, minimal, Linear/Vercel aesthetic',
  font: 'system-ui, sans-serif',
} as const

// ============================================================
// TIPOS
// ============================================================

export type ContentBrand = 'turnero' | 'divinia'
export type PostFormat = 'post' | 'carousel' | 'story' | 'reel' | 'video'
export type PostType = 'hook' | 'educativo' | 'demo' | 'before_after' | 'stats' | 'cta' | 'testimonial'
export type ToolTarget = 'canva_static' | 'canva_video' | 'canva_carousel' | 'higgsfield' | 'remotion'

export interface ContentBrief {
  brand: ContentBrand
  format: PostFormat
  postType: PostType
  rubro: string           // peluqueria, clinica, veterinaria, etc.
  headline: string        // texto principal
  subtext?: string        // texto secundario
  caption: string         // caption completo para Instagram
  keyMessage: string      // el mensaje que debe quedar grabado
  targetEmotion: 'dolor' | 'alivio' | 'confianza' | 'urgencia' | 'curiosidad'
  cta: string             // call to action específico
  canvaSlides?: CarouselSlide[]  // solo si format === 'carousel'
}

export interface CarouselSlide {
  numero: number
  titulo: string
  subtitulo?: string
  cuerpo?: string
  elementoVisual: string
}

export interface CanvaPrompt {
  tool: 'canva_static' | 'canva_video' | 'canva_carousel'
  designType: string      // instagram_post, your_story, logo
  query: string           // el prompt para generate-design
  slidesContent?: string  // para carruseles: contenido por slide
  exportFormat: 'png' | 'jpg' | 'mp4' | 'gif'
  brandNotes: string      // instrucciones para el brand reviewer
}

export interface HiggsfieldPrompt {
  tool: 'higgsfield'
  concept: string         // concepto visual en 1 oración
  prompt: string          // prompt cinematográfico completo en inglés
  style: string           // estilo visual específico
  duration: string        // '15s' | '30s' | '60s'
  aspectRatio: '9:16' | '16:9' | '1:1'
  motion: string          // descripción del movimiento de cámara
  lighting: string        // descripción de la iluminación
  mood: string            // el mood emocional del video
  manualSteps: string[]   // pasos que Joaco tiene que hacer en la web
}

export interface RemotionPrompt {
  tool: 'remotion'
  compositionId: string   // nombre del componente React
  duration: number        // en frames (30fps)
  width: number
  height: number
  props: Record<string, unknown>  // props para la composición
  animationNotes: string  // qué animar y cómo
  colors: Record<string, string>
}

export type ToolPrompt = CanvaPrompt | HiggsfieldPrompt | RemotionPrompt

export interface FactoryOutput {
  brief: ContentBrief
  prompts: {
    canva?: CanvaPrompt
    higgsfield?: HiggsfieldPrompt
    remotion?: RemotionPrompt
  }
  recommendedTool: ToolTarget
  productionNotes: string
  estimatedTime: string
}

// ============================================================
// LAZY ANTHROPIC CLIENT
// ============================================================

function getClient(): Anthropic {
  return new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
}

// ============================================================
// BRAND SYSTEM PROMPT para el agente
// ============================================================

const BRAND_SYSTEM = `Sos el Prompt Factory Agent de DIVINIA.
Tu trabajo es traducir briefs de contenido en prompts técnicamente optimizados para cada herramienta de producción.

IDENTIDAD DE TURNERO (producto):
- Paleta: blanco base (#ffffff), indigo (#4f46e5), lavanda (#c4b5fd)
- Font: Ubuntu Bold para títulos, Ubuntu Regular para cuerpo
- Elemento signature: puff balls 3D flotantes, estilo MTV 2012 / Duolingo
- Estilo: amigable, fresco, argentino — nunca oscuro, nunca corporativo
- Target: dueños de PYMEs argentinos (peluqueros, médicos, veterinarios, mecánicos)
- Tone: vos/tenés/podés, directo, cercano, sin relleno

IDENTIDAD DE DIVINIA (empresa):
- Paleta: fondo oscuro (#09090b), indigo/purple (#6366f1), blanco
- Font: system-ui, minimalista premium
- Estilo: dark SaaS, Linear/Vercel aesthetic
- Solo para comunicaciones B2B/corporativas

CONOCIMIENTO DE HERRAMIENTAS:
- CANVA: Mejor para static posts, carruseles, stories con texto. Limitado en animación. Brand kit disponible. Export PNG/MP4.
- HIGGSFIELD: Mejor para videos cinematográficos de alta calidad con personas, movimiento de cámara, efectos de luz. Requiere prompts en inglés muy descriptivos y cinematográficos. No tiene API — Joaco lo ejecuta manualmente.
- REMOTION: Mejor para animaciones de texto programáticas, data visualization en movimiento, videos con números cambiando. Requiere specs técnicas (componentes, duraciones, props).

REGLA DE SELECCIÓN DE HERRAMIENTA:
- Post de feed con texto → Canva static
- Carrusel multi-slide → Canva carousel
- Story/Reel con animación de texto → Canva video (your_story → mp4)
- Video cinematográfico con personas/locales → Higgsfield
- Video con números animados, stats, data → Remotion
- Video combinado (fondo Higgsfield + texto Remotion) → ambos

Siempre generá el prompt más técnicamente preciso posible. No uses descripciones vagas. Especificá colores, tamaños, posiciones, duración, movimientos.`

// ============================================================
// 1. generateCanvaPrompt()
// Genera prompt optimizado para Canva MCP
// ============================================================

export async function generateCanvaPrompt(
  brief: ContentBrief,
  targetFormat: 'static' | 'story' | 'carousel' = 'static'
): Promise<CanvaPrompt> {
  const client = getClient()

  const brand = brief.brand === 'turnero' ? TURNERO_BRAND : DIVINIA_BRAND

  const prompt = `Generá un prompt optimizado para Canva MCP que produzca un diseño de alta calidad.

BRIEF:
- Marca: ${brief.brand === 'turnero' ? 'Turnero by DIVINIA' : 'DIVINIA'}
- Formato: ${targetFormat === 'carousel' ? 'carrusel Instagram (1080x1080px)' : targetFormat === 'story' ? 'story/reel vertical (1080x1920px)' : 'post Instagram cuadrado (1080x1080px)'}
- Tipo de post: ${brief.postType}
- Rubro objetivo: ${brief.rubro}
- Headline: "${brief.headline}"
- Subtexto: "${brief.subtext ?? 'no aplica'}"
- Emoción objetivo: ${brief.targetEmotion}
- CTA: "${brief.cta}"

BRAND SYSTEM:
- Paleta: ${brief.brand === 'turnero' ? 'blanco #ffffff + indigo #4f46e5 + lavanda #c4b5fd' : 'negro #09090b + indigo #6366f1 + blanco #ffffff'}
- Font: ${brand.font}
- Estilo: ${brief.brand === 'turnero' ? '3D puff balls lavanda, clean white background, friendly SaaS' : 'dark premium minimal'}
${targetFormat === 'carousel' && brief.canvaSlides ? `
SLIDES DEL CARRUSEL:
${brief.canvaSlides.map(s => `  Slide ${s.numero}: "${s.titulo}" | ${s.subtitulo ?? ''} | Visual: ${s.elementoVisual}`).join('\n')}
` : ''}

Generá el query prompt para Canva en inglés. Debe ser:
1. Muy específico sobre colores, layout, tipografía
2. Mencionar explícitamente los textos que deben aparecer
3. Describir los elementos visuales con precisión
4. Incluir el brand feel correcto
5. Para carrusel: describir cada slide en secuencia

Devolvé JSON:
{
  "query": "el prompt completo para Canva en inglés (mínimo 150 palabras)",
  "brandNotes": "notas para el brand reviewer sobre qué verificar en este diseño (español)"
}

Solo el JSON.`

  const response = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 800,
    system: BRAND_SYSTEM,
    messages: [{ role: 'user', content: prompt }],
  })

  const text = response.content[0].type === 'text' ? response.content[0].text : '{}'
  const match = text.match(/\{[\s\S]*\}/)
  const data = match ? JSON.parse(match[0]) : { query: text, brandNotes: 'Verificar paleta y tipografía' }

  const designTypeMap = {
    static: 'instagram_post',
    story: 'your_story',
    carousel: 'instagram_post',
  }

  return {
    tool: targetFormat === 'carousel' ? 'canva_carousel' : targetFormat === 'story' ? 'canva_video' : 'canva_static',
    designType: designTypeMap[targetFormat],
    query: data.query,
    slidesContent: brief.canvaSlides ? JSON.stringify(brief.canvaSlides) : undefined,
    exportFormat: targetFormat === 'story' ? 'mp4' : 'png',
    brandNotes: data.brandNotes,
  }
}

// ============================================================
// 2. generateHiggsfieldPrompt()
// Genera brief cinematográfico para Higgsfield
// ============================================================

export async function generateHiggsfieldPrompt(
  brief: ContentBrief
): Promise<HiggsfieldPrompt> {
  const client = getClient()

  const durationMap: Record<PostFormat, string> = {
    post: '15s',
    carousel: '30s',
    story: '15s',
    reel: '30s',
    video: '60s',
  }

  const prompt = `Generá un prompt cinematográfico para Higgsfield AI.

BRIEF:
- Marca: Turnero by DIVINIA (sistema de turnos para PYMEs argentinas)
- Rubro del cliente mostrado: ${brief.rubro}
- Mensaje clave: "${brief.keyMessage}"
- Emoción objetivo: ${brief.targetEmotion}
- Duración: ${durationMap[brief.format]}
- Formato: vertical 9:16 (para Instagram Reels)

CONCEPTO A MOSTRAR:
El dolor: dueño de ${brief.rubro} agobiado por teléfono/WhatsApp lleno de mensajes.
La solución: el mismo dueño, tranquilo, mirando el sistema de turnos organizado en su celular.
La transformación: de caos a control.

ESTÉTICA ARGENTINA:
- Local de ${brief.rubro} argentino típico (San Luis/interior)
- Iluminación cálida, natural — no estudio
- Personas reales, no modelos
- Fondo reconocible para dueños de ${brief.rubro}

Generá el prompt cinematográfico en INGLÉS y también las instrucciones en español para que Joaco lo ejecute en higgsfield.ai.

Devolvé JSON:
{
  "concept": "concepto en 1 oración en español",
  "prompt": "el prompt cinematográfico completo en INGLÉS (mínimo 100 palabras, muy específico sobre camera movement, lighting, composition, emotion, style)",
  "style": "estilo visual en inglés (ej: warm argentinian aesthetic, natural lighting, realistic)",
  "motion": "descripción del movimiento de cámara en inglés",
  "lighting": "descripción de la iluminación en inglés",
  "mood": "el mood emocional en inglés",
  "manualSteps": [
    "Paso 1: ...",
    "Paso 2: ...",
    "Paso 3: ..."
  ]
}

Solo el JSON.`

  const response = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1000,
    system: BRAND_SYSTEM,
    messages: [{ role: 'user', content: prompt }],
  })

  const text = response.content[0].type === 'text' ? response.content[0].text : '{}'
  const match = text.match(/\{[\s\S]*\}/)
  if (!match) throw new Error('No se pudo generar el prompt de Higgsfield')
  const data = JSON.parse(match[0])

  return {
    tool: 'higgsfield',
    concept: data.concept,
    prompt: data.prompt,
    style: data.style,
    duration: durationMap[brief.format],
    aspectRatio: '9:16',
    motion: data.motion,
    lighting: data.lighting,
    mood: data.mood,
    manualSteps: data.manualSteps,
  }
}

// ============================================================
// 3. generateRemotionPrompt()
// Genera specs para animación programática
// ============================================================

export async function generateRemotionPrompt(
  brief: ContentBrief
): Promise<RemotionPrompt> {
  const client = getClient()

  const prompt = `Generá las specs técnicas para una animación Remotion (React video library).

BRIEF:
- Tipo: ${brief.postType}
- Rubro: ${brief.rubro}
- Headline: "${brief.headline}"
- Mensaje: "${brief.keyMessage}"
- Emoción: ${brief.targetEmotion}
- Formato: vertical 1080x1920px para Reels

CASOS DE USO DE REMOTION:
- Stats: números que suben animados (ej: "47 mensajes → 0 llamadas")
- Before/After: split screen con transición animada
- Counter: contador regresivo o acumulador
- Ticker: texto en loop animado
- Data viz: gráficos animados simples

Basándote en el tipo de post, elegí la composición Remotion más adecuada.

Devolvé JSON:
{
  "compositionId": "nombre del componente (PascalCase, ej: TurneroStats, BeforeAfterSplit)",
  "durationSeconds": 15,
  "props": {
    // props de React para la composición
    // incluí todos los textos, números, colores que necesita
  },
  "animationNotes": "descripción detallada de qué animar: elementos, timing, easing, transiciones (español)",
  "colors": {
    "background": "#ffffff",
    "accent": "#4f46e5"
    // solo los colores usados
  }
}

Solo el JSON.`

  const response = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 600,
    system: BRAND_SYSTEM,
    messages: [{ role: 'user', content: prompt }],
  })

  const text = response.content[0].type === 'text' ? response.content[0].text : '{}'
  const match = text.match(/\{[\s\S]*\}/)
  if (!match) throw new Error('No se pudo generar el prompt de Remotion')
  const data = JSON.parse(match[0])

  return {
    tool: 'remotion',
    compositionId: data.compositionId,
    duration: (data.durationSeconds ?? 15) * 30, // 30fps
    width: 1080,
    height: 1920,
    props: data.props,
    animationNotes: data.animationNotes,
    colors: data.colors,
  }
}

// ============================================================
// 4. selectBestTool()
// Decide qué herramienta usar para cada brief
// ============================================================

export function selectBestTool(brief: ContentBrief): ToolTarget[] {
  const tools: ToolTarget[] = []

  if (brief.format === 'carousel') {
    tools.push('canva_carousel')
    return tools
  }

  if (brief.format === 'story' || brief.format === 'reel') {
    // Videos con personas → Higgsfield
    // Videos con texto animado → Remotion o Canva video
    // Stats/números → Remotion
    if (brief.postType === 'stats' || brief.postType === 'before_after') {
      tools.push('remotion')
      tools.push('higgsfield') // alternativa cinematográfica
    } else if (brief.postType === 'demo' || brief.postType === 'hook') {
      tools.push('higgsfield') // mostrar el producto en acción
      tools.push('canva_video') // alternativa si no hay Higgsfield
    } else {
      tools.push('canva_video')
    }
    return tools
  }

  // Post de feed: siempre Canva static
  tools.push('canva_static')
  return tools
}

// ============================================================
// 5. runFactory()
// Función principal — brief → todos los prompts
// ============================================================

export async function runFactory(brief: ContentBrief): Promise<FactoryOutput> {
  const recommendedTools = selectBestTool(brief)
  const primaryTool = recommendedTools[0]

  const prompts: FactoryOutput['prompts'] = {}

  // Siempre generar Canva como base
  const canvaTarget =
    brief.format === 'carousel'
      ? 'carousel'
      : brief.format === 'story' || brief.format === 'reel'
      ? 'story'
      : 'static'

  const [canvaPrompt, higgsfieldPrompt, remotionPrompt] = await Promise.all([
    generateCanvaPrompt(brief, canvaTarget),
    // Solo generar Higgsfield si el brief lo requiere
    (brief.format === 'reel' || brief.format === 'video' || brief.format === 'story')
      ? generateHiggsfieldPrompt(brief)
      : Promise.resolve(undefined),
    // Solo generar Remotion si es stats o before_after
    (brief.postType === 'stats' || brief.postType === 'before_after')
      ? generateRemotionPrompt(brief)
      : Promise.resolve(undefined),
  ])

  prompts.canva = canvaPrompt
  if (higgsfieldPrompt) prompts.higgsfield = higgsfieldPrompt
  if (remotionPrompt) prompts.remotion = remotionPrompt

  const timeMap: Record<ToolTarget, string> = {
    canva_static: '2-3 minutos (automático)',
    canva_video: '3-5 minutos (automático + export MP4)',
    canva_carousel: '5-8 minutos (automático, slide por slide)',
    higgsfield: '10-20 minutos (Joaco ejecuta manualmente en higgsfield.ai)',
    remotion: '15-30 minutos (render programático)',
  }

  return {
    brief,
    prompts,
    recommendedTool: primaryTool,
    productionNotes: `Herramienta recomendada: ${primaryTool}. ${
      prompts.higgsfield
        ? '\n⚠️ Higgsfield requiere ejecución manual — ver manualSteps en higgsfield prompt.'
        : ''
    }`,
    estimatedTime: timeMap[primaryTool],
  }
}

// ============================================================
// 6. buildBriefFromPlan()
// Convierte el output del strategy-director en ContentBrief
// ============================================================

export function buildBriefFromPlan(
  plan: {
    headline: string
    subtext?: string
    caption: string
    postType: string
    format: string
    rubro: string
    keyMessage?: string
    cta?: string
  },
  brand: ContentBrand = 'turnero'
): ContentBrief {
  // Mapear tipos del strategy-director a tipos del factory
  const postTypeMap: Record<string, PostType> = {
    educativo: 'educativo',
    demo: 'demo',
    hook: 'hook',
    oferta: 'cta',
    testimonial: 'testimonial',
    entretenimiento: 'hook',
    before_after: 'before_after',
    stats: 'stats',
  }

  const formatMap: Record<string, PostFormat> = {
    post: 'post',
    carrusel: 'carousel',
    story: 'story',
    reel: 'reel',
    video: 'video',
  }

  // Detectar emoción basada en el tipo de post
  const emotionMap: Record<string, ContentBrief['targetEmotion']> = {
    hook: 'curiosidad',
    educativo: 'confianza',
    demo: 'alivio',
    cta: 'urgencia',
    testimonial: 'confianza',
    before_after: 'alivio',
    stats: 'dolor',
  }

  const mappedType = postTypeMap[plan.postType] ?? 'educativo'

  return {
    brand,
    format: formatMap[plan.format] ?? 'post',
    postType: mappedType,
    rubro: plan.rubro,
    headline: plan.headline,
    subtext: plan.subtext,
    caption: plan.caption,
    keyMessage: plan.keyMessage ?? plan.headline,
    targetEmotion: emotionMap[mappedType] ?? 'confianza',
    cta: plan.cta ?? 'Escribime por DM para tu demo gratis',
  }
}
