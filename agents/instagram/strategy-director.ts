// ============================================================
// DIVINIA — Strategy Director Agent
// Orquestador de más alto nivel del sistema de Instagram
// Coordina todos los agentes y toma decisiones estratégicas
// ============================================================

import Anthropic from '@anthropic-ai/sdk'
import { researchMarket } from './market-researcher'
import { planWeek } from './content-planner'
import { generateCaptions } from './content-creator'
import type {
  InstagramPost,
  PostMetrics,
  CalendarEntry,
  MarketResearch,
  CaptionVariants,
  Rubro,
} from './types'

// ============================================================
// Tipos específicos del Strategy Director
// ============================================================

export interface WeeklyPlan {
  generatedAt: Date
  weekNumber: number
  month: string
  posts: WeeklyPostPlan[]
  strategicNotes: string
  topPriority: string
  estimatedReach: string
}

export interface WeeklyPostPlan {
  entry: CalendarEntry
  captions: CaptionVariants
  recommendedPostTime: string
  strategicRationale: string
}

export interface PerformanceInsights {
  analyzedAt: Date
  totalPosts: number
  avgEngagementRate: number
  topPerformingPosts: InstagramPost[]
  bestRubros: { rubro: string; avgEngagement: number }[]
  bestPostTypes: { type: string; avgEngagement: number }[]
  worstPerforming: InstagramPost[]
  recommendations: string[]
  contentMixAdjustment: {
    educativo: number
    demo: number
    testimonial: number
    oferta: number
    entretenimiento: number
  }
}

export interface ContentBrief {
  generatedAt: Date
  rubro: string
  objective: string
  research: MarketResearch
  angle: string
  keyMessage: string
  caption: string
  hashtags: string[]
  canvaPrompt: string
  postType: string
  format: string
  recommendedTime: string
  strategicNotes: string
}

export interface PostTimeRecommendation {
  recommendedTime: string
  dayOfWeek: string
  timezone: string
  rationale: string
  alternativeTimes: string[]
  contentTypeOptimal: Record<string, string>
}

export interface MonthlyReport {
  generatedAt: Date
  month: string
  summary: string
  totalPosts: number
  totalReach: number
  totalImpressions: number
  avgEngagementRate: number
  topPosts: { post: PostMetrics; position: number; reason: string }[]
  objectivesComparison: {
    objective: string
    target: number
    achieved: number
    status: 'cumplido' | 'parcial' | 'no_cumplido'
  }[]
  nextMonthStrategy: string
  specificRecommendations: string[]
  contentAdjustments: string[]
}

export interface PipelineOutput {
  generatedAt: Date
  inputBrief: string
  research: MarketResearch
  selectedAngle: string
  caption: string
  hashtags: string[]
  canvaPrompt: string
  postType: string
  format: string
  rubro: string
  recommendedTime: string
  readyToPublish: boolean
  approvalNotes: string
}

// ============================================================
// System Prompt del Strategy Director
// ============================================================

const SYSTEM_PROMPT = `Sos el Director de Estrategia Digital de DIVINIA, empresa de inteligencia artificial de San Luis, Argentina.
Sos el agente de más alto nivel del sistema de Instagram. Coordinás todos los demás agentes y tomás decisiones estratégicas.

CONTEXTO DE DIVINIA:
- Vendemos sistemas de turnos/agenda online con IA para PYMEs argentinas
- Target: dueños de peluquerías, clínicas, veterinarias, talleres, odontología
- Instagram: @autom_atia (cuenta nueva, arrancando desde cero, 0 seguidores)
- Precios: $150.000 - $350.000 ARS según el plan
- Objetivo Instagram: generar leads que terminen en ventas reales

TU ROL COMO CMO DIGITAL:
- Pensás como un Chief Marketing Officer que conoce PYMEs argentinas al dedillo
- Cada decisión estratégica tiene un "por qué" orientado a ventas
- Priorizás siempre acciones que generen ingresos directos
- Entendés que los dueños de PYMEs son personas ocupadas, no quieren pasar tiempo en redes
- Tu métrica de éxito es DMs → demos → ventas, no likes o seguidores

PRINCIPIOS ESTRATÉGICOS:
1. El contenido educativo construye autoridad y trust
2. Los demos muestran el valor real del producto
3. Los testimoniales derribar la objeción de "¿funciona realmente?"
4. Las ofertas/CTAs convierten el interés en acción
5. La consistencia gana la guerra de largo plazo en Instagram
6. Los rubros con más dolor (peluquerías y clínicas) son la puerta de entrada

IDIOMA Y TONO:
- Siempre en español argentino: vos, sos, tenés, podés, hacés
- Directo y ejecutable: nada de vaguedades
- Orientado a resultados concretos y medibles`

// ============================================================
// Lazy initialization del cliente Anthropic
// ============================================================

function getClient(): Anthropic {
  return new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
}

// ============================================================
// 1. runWeeklyStrategy()
// Ejecuta la estrategia semanal completa
// ============================================================

export async function runWeeklyStrategy(
  weekNumber?: number,
  month?: string
): Promise<WeeklyPlan> {
  const client = getClient()

  const now = new Date()
  const currentMonth = month ?? `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  const currentWeek = weekNumber ?? Math.ceil(now.getDate() / 7)

  // Paso 1: Refrescar tendencias del mercado (rubro más importante: general + peluqueria)
  const research = await researchMarket('general')

  // Paso 2: Planificar la semana con el content planner
  const weekEntries = await planWeek(currentWeek, currentMonth)

  // Paso 3: Generar captions para cada entry del plan semanal
  const weeklyPostPlans: WeeklyPostPlan[] = await Promise.all(
    weekEntries.map(async (entry) => {
      const captions = await generateCaptions(
        entry.idea,
        entry.rubro,
        entry.postType,
        entry.format
      )

      return {
        entry,
        captions,
        recommendedPostTime: entry.scheduledTime,
        strategicRationale: `Post ${entry.postType} para ${entry.rubro} en día ${entry.dayOfWeek} — prioridad ${entry.priority}`,
      }
    })
  )

  // Paso 4: Decisión estratégica de alto nivel para la semana
  const strategicPrompt = `Revisá este plan de contenido para la semana ${currentWeek} de ${currentMonth} en Instagram de DIVINIA.

Posts planificados:
${weekEntries.map((e) => `- ${e.dayOfWeek}: ${e.postType} para ${e.rubro} — "${e.idea}"`).join('\n')}

Tendencias detectadas esta semana:
${research.trends.slice(0, 3).join('\n')}

Oportunidades identificadas:
${research.opportunities.slice(0, 3).join('\n')}

Como Director de Estrategia, respondé en JSON:
{
  "strategicNotes": "notas estratégicas para la semana, qué hacer y por qué (máximo 200 palabras)",
  "topPriority": "el post más importante de la semana y por qué",
  "estimatedReach": "estimación realista del alcance esperado considerando cuenta nueva"
}`

  const strategicResponse = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 600,
    messages: [{ role: 'user', content: strategicPrompt }],
    system: SYSTEM_PROMPT,
  })

  const strategicText =
    strategicResponse.content[0].type === 'text' ? strategicResponse.content[0].text : '{}'
  const strategicJson = strategicText.match(/\{[\s\S]*\}/)
  const strategic = strategicJson ? JSON.parse(strategicJson[0]) : {}

  return {
    generatedAt: new Date(),
    weekNumber: currentWeek,
    month: currentMonth,
    posts: weeklyPostPlans,
    strategicNotes: strategic.strategicNotes ?? 'Sin notas estratégicas generadas.',
    topPriority: strategic.topPriority ?? weekEntries[0]?.idea ?? '',
    estimatedReach: strategic.estimatedReach ?? '500-1.500 cuentas alcanzadas',
  }
}

// ============================================================
// 2. analyzePerformance()
// Analiza qué está funcionando en base a posts publicados
// ============================================================

export async function analyzePerformance(posts: InstagramPost[]): Promise<PerformanceInsights> {
  const client = getClient()

  const postsWithMetrics = posts.filter((p) => p.metrics !== undefined)

  if (postsWithMetrics.length === 0) {
    return {
      analyzedAt: new Date(),
      totalPosts: 0,
      avgEngagementRate: 0,
      topPerformingPosts: [],
      bestRubros: [],
      bestPostTypes: [],
      worstPerforming: [],
      recommendations: [
        'No hay datos de performance aún. Publicá los primeros posts y volvé en una semana.',
        'Empezá con posts educativos para peluquerías — son el rubro con más dolor visible.',
        'Publicá al menos 3 posts antes de medir resultados.',
      ],
      contentMixAdjustment: {
        educativo: 40,
        demo: 30,
        testimonial: 20,
        oferta: 5,
        entretenimiento: 5,
      },
    }
  }

  // Calcular métricas básicas
  const totalEngagement = postsWithMetrics.reduce((acc, p) => {
    const m = p.metrics!
    return acc + m.likes + m.comments + m.shares + m.saves
  }, 0)

  const totalReach = postsWithMetrics.reduce((acc, p) => acc + (p.metrics?.reach ?? 0), 0)
  const avgEngagementRate = totalReach > 0 ? (totalEngagement / totalReach) * 100 : 0

  // Ordenar por engagement total
  const sortedByEngagement = [...postsWithMetrics].sort((a, b) => {
    const engA = (a.metrics?.likes ?? 0) + (a.metrics?.comments ?? 0) + (a.metrics?.shares ?? 0) + (a.metrics?.saves ?? 0)
    const engB = (b.metrics?.likes ?? 0) + (b.metrics?.comments ?? 0) + (b.metrics?.shares ?? 0) + (b.metrics?.saves ?? 0)
    return engB - engA
  })

  const topPerformingPosts = sortedByEngagement.slice(0, 3)
  const worstPerforming = sortedByEngagement.slice(-2)

  // Calcular engagement por rubro
  const rubroMap: Record<string, { total: number; count: number }> = {}
  postsWithMetrics.forEach((p) => {
    const rubro = p.rubro
    const eng = (p.metrics?.likes ?? 0) + (p.metrics?.comments ?? 0) + (p.metrics?.shares ?? 0) + (p.metrics?.saves ?? 0)
    if (!rubroMap[rubro]) rubroMap[rubro] = { total: 0, count: 0 }
    rubroMap[rubro].total += eng
    rubroMap[rubro].count += 1
  })

  const bestRubros = Object.entries(rubroMap)
    .map(([rubro, data]) => ({ rubro, avgEngagement: data.total / data.count }))
    .sort((a, b) => b.avgEngagement - a.avgEngagement)

  // Calcular engagement por tipo de post
  const typeMap: Record<string, { total: number; count: number }> = {}
  postsWithMetrics.forEach((p) => {
    const type = p.postType
    const eng = (p.metrics?.likes ?? 0) + (p.metrics?.comments ?? 0) + (p.metrics?.shares ?? 0) + (p.metrics?.saves ?? 0)
    if (!typeMap[type]) typeMap[type] = { total: 0, count: 0 }
    typeMap[type].total += eng
    typeMap[type].count += 1
  })

  const bestPostTypes = Object.entries(typeMap)
    .map(([type, data]) => ({ type, avgEngagement: data.total / data.count }))
    .sort((a, b) => b.avgEngagement - a.avgEngagement)

  // Generar recomendaciones estratégicas con IA
  const analysisPrompt = `Analizá la performance de Instagram de DIVINIA y generá recomendaciones estratégicas.

DATOS DE PERFORMANCE:
- Posts analizados: ${postsWithMetrics.length}
- Engagement rate promedio: ${avgEngagementRate.toFixed(2)}%
- Mejores rubros por engagement: ${bestRubros.slice(0, 3).map((r) => `${r.rubro} (${r.avgEngagement.toFixed(0)} eng/post)`).join(', ')}
- Mejores tipos de post: ${bestPostTypes.slice(0, 3).map((t) => `${t.type} (${t.avgEngagement.toFixed(0)} eng/post)`).join(', ')}
- Top post: "${topPerformingPosts[0]?.caption?.substring(0, 100) ?? 'N/A'}..."
- Post más flojo: "${worstPerforming[0]?.caption?.substring(0, 100) ?? 'N/A'}..."

Devolvé JSON:
{
  "recommendations": [
    "recomendación accionable 1",
    "recomendación accionable 2",
    "recomendación accionable 3",
    "recomendación accionable 4",
    "recomendación accionable 5"
  ],
  "contentMixAdjustment": {
    "educativo": 40,
    "demo": 30,
    "testimonial": 20,
    "oferta": 5,
    "entretenimiento": 5
  }
}

El contentMixAdjustment debe sumar 100. Ajustalo según los datos reales.
Solo el JSON.`

  const aiResponse = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 600,
    messages: [{ role: 'user', content: analysisPrompt }],
    system: SYSTEM_PROMPT,
  })

  const aiText = aiResponse.content[0].type === 'text' ? aiResponse.content[0].text : '{}'
  const aiJson = aiText.match(/\{[\s\S]*\}/)
  const aiData = aiJson
    ? JSON.parse(aiJson[0])
    : {
        recommendations: ['Seguí posteando y acumulá más datos para análisis más precisos.'],
        contentMixAdjustment: { educativo: 40, demo: 30, testimonial: 20, oferta: 5, entretenimiento: 5 },
      }

  return {
    analyzedAt: new Date(),
    totalPosts: postsWithMetrics.length,
    avgEngagementRate: Number(avgEngagementRate.toFixed(2)),
    topPerformingPosts,
    bestRubros,
    bestPostTypes,
    worstPerforming,
    recommendations: aiData.recommendations,
    contentMixAdjustment: aiData.contentMixAdjustment,
  }
}

// ============================================================
// 3. generateContentBrief()
// Brief completo para un post de un rubro específico
// ============================================================

export async function generateContentBrief(
  rubro: string,
  objective: string
): Promise<ContentBrief> {
  const client = getClient()

  // Paso 1: Investigar tendencias del rubro
  const research = await researchMarket(rubro)

  // Paso 2: Generar el brief estratégico completo con IA
  const briefPrompt = `Generá un brief completo de contenido para Instagram de DIVINIA.

DATOS:
- Rubro objetivo: ${rubro}
- Objetivo del post: ${objective}
- Tendencias del mercado: ${research.trends.slice(0, 3).join(' | ')}
- Mejores hashtags disponibles: ${research.bestHashtags.slice(0, 10).join(', ')}
- Ideas de contenido identificadas: ${research.contentIdeas.slice(0, 3).join(' | ')}
- Oportunidades detectadas: ${research.opportunities.slice(0, 2).join(' | ')}

Generá un brief estratégico completo en JSON:
{
  "angle": "el ángulo elegido para este post y por qué va a funcionar (máximo 50 palabras)",
  "keyMessage": "el mensaje central que debe quedar grabado en la mente del lector (1 oración)",
  "caption": "el caption final completo, listo para publicar (en español argentino, con hook + desarrollo + CTA, máximo 2200 caracteres)",
  "hashtags": ["#hashtag1", "#hashtag2", "...20 hashtags en total"],
  "canvaPrompt": "descripción visual detallada en inglés para generar el diseño en Canva, incluyendo: dark background, purple/violet #6366f1 accents, DIVINIA branding, textos que deben aparecer",
  "postType": "educativo|demo|testimonial|oferta|entretenimiento",
  "format": "post|reel|story|carrusel",
  "strategicNotes": "por qué este enfoque va a funcionar para vender sistemas de turnos a ${rubro} (máximo 100 palabras)"
}

Solo el JSON.`

  const response = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1500,
    messages: [{ role: 'user', content: briefPrompt }],
    system: SYSTEM_PROMPT,
  })

  const text = response.content[0].type === 'text' ? response.content[0].text : '{}'
  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (!jsonMatch) throw new Error('No se pudo generar el brief de contenido')

  const brief = JSON.parse(jsonMatch[0])

  // Determinar el mejor horario para este rubro
  const timeRecommendation = await decideBestPostTime()

  return {
    generatedAt: new Date(),
    rubro,
    objective,
    research,
    angle: brief.angle,
    keyMessage: brief.keyMessage,
    caption: brief.caption,
    hashtags: brief.hashtags,
    canvaPrompt: brief.canvaPrompt,
    postType: brief.postType,
    format: brief.format,
    recommendedTime: timeRecommendation.recommendedTime,
    strategicNotes: brief.strategicNotes,
  }
}

// ============================================================
// 4. decideBestPostTime()
// Recomienda el mejor horario para publicar
// ============================================================

export async function decideBestPostTime(
  contentType?: string,
  performanceHistory?: PostMetrics[]
): Promise<PostTimeRecommendation> {
  const client = getClient()

  const now = new Date()
  // Convertir a ART (UTC-3)
  const artOffset = -3 * 60
  const artNow = new Date(now.getTime() + (artOffset - now.getTimezoneOffset()) * 60000)
  const dayOfWeek = artNow.toLocaleDateString('es-AR', { weekday: 'long' })
  const currentHour = artNow.getHours()

  const historyContext = performanceHistory && performanceHistory.length > 0
    ? `Historial de performance disponible con ${performanceHistory.length} posts.`
    : 'Sin historial de performance aún (cuenta nueva).'

  const timePrompt = `Recomendá el mejor horario para publicar en Instagram de DIVINIA.

CONTEXTO:
- Día actual en Argentina (ART, UTC-3): ${dayOfWeek}, ${currentHour}:00 hs
- Tipo de contenido a publicar: ${contentType ?? 'general'}
- ${historyContext}
- Audiencia: dueños de PYMEs en Argentina (peluqueros, médicos, veterinarios, mecánicos)
- Esta audiencia revisa Instagram durante breaks del trabajo, en la mañana temprano, o a la noche

Considerá:
- Los dueños de PYMEs tienen horarios de trabajo intensos (8:00-20:00)
- Los mejores momentos de consumo en Argentina son: 8:00-9:00 (antes de abrir), 12:30-14:00 (almuerzo), 20:00-22:00 (después del trabajo)
- Los días de mayor actividad son martes, miércoles y jueves
- Los lunes la gente está arrancando la semana (menos receptivos a publicidad)
- Los viernes el engagement baja después de las 15:00

Devolvé JSON:
{
  "recommendedTime": "HH:MM en ART",
  "dayOfWeek": "día recomendado para el próximo post",
  "timezone": "ART (UTC-3)",
  "rationale": "por qué este horario es el mejor (máximo 80 palabras)",
  "alternativeTimes": ["HH:MM", "HH:MM", "HH:MM"],
  "contentTypeOptimal": {
    "educativo": "HH:MM",
    "demo": "HH:MM",
    "testimonial": "HH:MM",
    "oferta": "HH:MM"
  }
}

Solo el JSON.`

  const response = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 400,
    messages: [{ role: 'user', content: timePrompt }],
    system: SYSTEM_PROMPT,
  })

  const text = response.content[0].type === 'text' ? response.content[0].text : '{}'
  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (!jsonMatch) {
    return {
      recommendedTime: '09:00',
      dayOfWeek: 'Martes',
      timezone: 'ART (UTC-3)',
      rationale: 'Horario default recomendado para PYMEs argentinas.',
      alternativeTimes: ['12:30', '20:00'],
      contentTypeOptimal: {
        educativo: '09:00',
        demo: '12:30',
        testimonial: '09:00',
        oferta: '20:00',
      },
    }
  }

  return JSON.parse(jsonMatch[0]) as PostTimeRecommendation
}

// ============================================================
// 5. generateMonthlyReport()
// Reporte mensual completo de performance
// ============================================================

export async function generateMonthlyReport(
  metrics: PostMetrics[],
  month?: string
): Promise<MonthlyReport> {
  const client = getClient()

  const now = new Date()
  const reportMonth =
    month ??
    `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`

  if (metrics.length === 0) {
    return {
      generatedAt: new Date(),
      month: reportMonth,
      summary: 'No hay datos suficientes para generar el reporte mensual. Publicá contenido regularmente y volvé al fin del mes.',
      totalPosts: 0,
      totalReach: 0,
      totalImpressions: 0,
      avgEngagementRate: 0,
      topPosts: [],
      objectivesComparison: [],
      nextMonthStrategy: 'Publicar al menos 15 posts en el próximo mes para tener datos estadísticamente significativos. Focalizarse en educativo y demos.',
      specificRecommendations: [
        'Establecé una cadencia de publicación de al menos 3 posts por semana.',
        'Empezá con rubros de alto dolor: peluquerías y clínicas.',
        'Activá respuestas automáticas a comentarios para aumentar el engagement.',
      ],
      contentAdjustments: ['Mantener el mix estándar hasta tener datos reales.'],
    }
  }

  // Calcular totales
  const totalReach = metrics.reduce((acc, m) => acc + m.reach, 0)
  const totalImpressions = metrics.reduce((acc, m) => acc + m.impressions, 0)
  const totalEngagement = metrics.reduce(
    (acc, m) => acc + m.likes + m.comments + m.shares + m.saves,
    0
  )
  const avgEngagementRate = totalReach > 0 ? (totalEngagement / totalReach) * 100 : 0

  // Top 3 posts por engagement
  const sortedMetrics = [...metrics].sort(
    (a, b) =>
      b.likes + b.comments + b.shares + b.saves -
      (a.likes + a.comments + a.shares + a.saves)
  )
  const topMetrics = sortedMetrics.slice(0, 3)

  const reportPrompt = `Generá el reporte mensual de Instagram de DIVINIA para ${reportMonth}.

MÉTRICAS DEL MES:
- Total de posts: ${metrics.length}
- Alcance total: ${totalReach.toLocaleString('es-AR')} personas
- Impresiones totales: ${totalImpressions.toLocaleString('es-AR')}
- Engagement rate promedio: ${avgEngagementRate.toFixed(2)}%
- Engagement total: ${totalEngagement.toLocaleString('es-AR')} interacciones

TOP 3 POSTS (por engagement):
${topMetrics
  .map(
    (m, i) =>
      `${i + 1}. ${m.likes} likes, ${m.comments} comentarios, ${m.shares} compartidos, ${m.saves} guardados`
  )
  .join('\n')}

Generá el reporte en JSON:
{
  "summary": "resumen ejecutivo del mes en 3-4 oraciones, qué funcionó y qué no (español argentino)",
  "topPosts": [
    {
      "position": 1,
      "reason": "por qué fue el mejor post del mes"
    },
    {
      "position": 2,
      "reason": "..."
    },
    {
      "position": 3,
      "reason": "..."
    }
  ],
  "objectivesComparison": [
    {
      "objective": "Engagement rate mensual",
      "target": 3.0,
      "achieved": ${avgEngagementRate.toFixed(2)},
      "status": "${avgEngagementRate >= 3 ? 'cumplido' : avgEngagementRate >= 1.5 ? 'parcial' : 'no_cumplido'}"
    },
    {
      "objective": "Posts publicados",
      "target": 20,
      "achieved": ${metrics.length},
      "status": "${metrics.length >= 20 ? 'cumplido' : metrics.length >= 10 ? 'parcial' : 'no_cumplido'}"
    }
  ],
  "nextMonthStrategy": "estrategia concreta para el mes siguiente basada en los datos (máximo 150 palabras)",
  "specificRecommendations": [
    "recomendación 1 con número concreto o acción específica",
    "recomendación 2",
    "recomendación 3",
    "recomendación 4"
  ],
  "contentAdjustments": [
    "ajuste al mix de contenido 1",
    "ajuste 2"
  ]
}

Solo el JSON.`

  const response = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1000,
    messages: [{ role: 'user', content: reportPrompt }],
    system: SYSTEM_PROMPT,
  })

  const text = response.content[0].type === 'text' ? response.content[0].text : '{}'
  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (!jsonMatch) throw new Error('No se pudo generar el reporte mensual')

  const reportData = JSON.parse(jsonMatch[0])

  return {
    generatedAt: new Date(),
    month: reportMonth,
    summary: reportData.summary,
    totalPosts: metrics.length,
    totalReach,
    totalImpressions,
    avgEngagementRate: Number(avgEngagementRate.toFixed(2)),
    topPosts: topMetrics.map((m, i) => ({
      post: m,
      position: i + 1,
      reason: reportData.topPosts?.[i]?.reason ?? 'Post de alto rendimiento.',
    })),
    objectivesComparison: reportData.objectivesComparison,
    nextMonthStrategy: reportData.nextMonthStrategy,
    specificRecommendations: reportData.specificRecommendations,
    contentAdjustments: reportData.contentAdjustments,
  }
}

// ============================================================
// 6. orchestrateFullPipeline()
// Pipeline completo desde brief simple hasta post listo
// ============================================================

export async function orchestrateFullPipeline(brief: string): Promise<PipelineOutput> {
  const client = getClient()

  // Paso 1: Interpretar el brief y extraer parámetros estratégicos
  const interpretPrompt = `Interpretá este brief de contenido para Instagram de DIVINIA y extraé los parámetros estratégicos.

Brief recibido: "${brief}"

DIVINIA vende sistemas de turnos/agenda para PYMEs (peluquerías, clínicas, veterinarias, talleres, odontología).

Devolvé JSON:
{
  "rubro": "peluqueria|estetica|clinica|consultorio|veterinaria|taller|odontologia|gimnasio|farmacia|general",
  "postType": "educativo|demo|testimonial|oferta|entretenimiento",
  "format": "post|reel|story|carrusel",
  "mainFocus": "descripción del foco principal del post en 1 oración",
  "targetPain": "el dolor específico del cliente que este post va a tocar"
}

Solo el JSON.`

  const interpretResponse = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 200,
    messages: [{ role: 'user', content: interpretPrompt }],
    system: SYSTEM_PROMPT,
  })

  const interpretText =
    interpretResponse.content[0].type === 'text' ? interpretResponse.content[0].text : '{}'
  const interpretJson = interpretText.match(/\{[\s\S]*\}/)
  const params = interpretJson
    ? JSON.parse(interpretJson[0])
    : { rubro: 'general', postType: 'educativo', format: 'post', mainFocus: brief, targetPain: 'gestión de turnos manual' }

  // Paso 2: Investigar el mercado para el rubro detectado
  const research = await researchMarket(params.rubro)

  // Paso 3: Generar captions con el content creator
  const captions = await generateCaptions(
    params.mainFocus,
    params.rubro as Rubro,
    params.postType,
    params.format
  )

  // Paso 4: Decisión estratégica del ángulo y caption final
  const finalPrompt = `Sos el Director de Estrategia de DIVINIA. Elegí el mejor caption y generá el post final.

Brief original: "${brief}"
Rubro: ${params.rubro}
Foco: ${params.mainFocus}
Dolor del cliente: ${params.targetPain}

OPCIONES DE CAPTION GENERADAS:
Variante A (problema): ${captions.A}

Variante B (beneficios): ${captions.B}

Variante C (oferta/urgencia): ${captions.C}

Tendencias del mercado: ${research.trends.slice(0, 2).join(' | ')}
Oportunidades: ${research.opportunities.slice(0, 2).join(' | ')}

Elegí la mejor variante o combinala para crear el caption final. Devolvé JSON:
{
  "selectedAngle": "por qué elegiste este ángulo y no los otros (máximo 60 palabras)",
  "caption": "el caption final, puede ser una de las variantes o una combinación mejorada",
  "approvalNotes": "qué debe revisar Joaco antes de publicar (máximo 80 palabras)"
}

Solo el JSON.`

  const finalResponse = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 800,
    messages: [{ role: 'user', content: finalPrompt }],
    system: SYSTEM_PROMPT,
  })

  const finalText = finalResponse.content[0].type === 'text' ? finalResponse.content[0].text : '{}'
  const finalJson = finalText.match(/\{[\s\S]*\}/)
  const finalData = finalJson
    ? JSON.parse(finalJson[0])
    : { selectedAngle: 'Variante B por foco en beneficios', caption: captions.B, approvalNotes: 'Revisá que el caption sea apropiado para el rubro.' }

  // Paso 5: Obtener el mejor horario
  const timeRecommendation = await decideBestPostTime(params.postType)

  return {
    generatedAt: new Date(),
    inputBrief: brief,
    research,
    selectedAngle: finalData.selectedAngle,
    caption: finalData.caption,
    hashtags: captions.hashtags,
    canvaPrompt: captions.canvaPrompt,
    postType: params.postType,
    format: params.format,
    rubro: params.rubro,
    recommendedTime: timeRecommendation.recommendedTime,
    readyToPublish: true,
    approvalNotes: finalData.approvalNotes,
  }
}
