// ============================================================
// DIVINIA — Content Pipeline Agent
// Orquestador de plan semanal completo en una sola llamada
// ============================================================

import Anthropic from '@anthropic-ai/sdk'

// ============================================================
// Tipos
// ============================================================

export interface WeeklyInput {
  weekNumber: number
  salesGoal: number
  focusRubro?: string
  previousWeekPerformance?: {
    bestPost: string
    worstPost: string
    totalReach: number
  }
}

export interface FullPost {
  day: string
  time: string
  type: 'hook' | 'educativo' | 'before_after' | 'stats' | 'cta' | 'carousel'
  designBrief: string
  nanobananaPrompt: string
  caption: string
  hashtags: string[]
  salesIntent: string
  callToAction: string
}

export interface StoryPlan {
  day: string
  time: string
  format: 'texto' | 'video_joaco' | 'encuesta' | 'cuenta_regresiva'
  content: string
  salesLink: boolean
}

export interface ReelPlan {
  type: 'grabado_joaco' | 'remotion_animado'
  title: string
  script?: string
  remotionComposition?: string
  nanobananaPrompt?: string
  hook: string
  duration: string
}

export interface OutreachMessage {
  platform: 'instagram_dm' | 'whatsapp'
  targetRubro: string
  message: string
  followUp: string
}

export interface FullWeekPlan {
  weekNumber: number
  generatedAt: string
  strategy: string
  salesNarrative: string
  weeklyHook: string
  bestPostingTimes: { day: string; time: string; reason: string }[]
  posts: FullPost[]
  stories: StoryPlan[]
  reels: ReelPlan[]
  outreachMessages: OutreachMessage[]
}

// ============================================================
// Lazy client
// ============================================================

function getClient(): Anthropic {
  return new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
}

// ============================================================
// System prompt
// ============================================================

const SYSTEM_PROMPT = `Sos el Orquestador de Contenido de DIVINIA, empresa de inteligencia artificial de San Luis, Argentina.
Generás planes de contenido completos para Instagram orientados a cerrar ventas reales del producto "Turnero".

PRODUCTO QUE VENDEMOS — TURNERO:
- Sistema de turnos online con IA para PYMEs argentinas
- Planes de pago único (sin mensualidad): $80.000 ARS (básico), $150.000 ARS (profesional), $200.000 ARS (premium)
- El cliente paga una vez y tiene el sistema para siempre
- Instalación en 48hs, soporte incluido, demo gratis
- Diferenciador clave: PAGO ÚNICO. No hay cuotas ni suscripciones.
- Target: peluquerías, clínicas, veterinarias, talleres mecánicos, odontología, estéticas, consultorios, gimnasios

INSTAGRAM: @autom_atia
- Cuenta nueva, arrancando desde cero
- La métrica que importa: DMs recibidos → demos coordinadas → ventas cerradas

BRAND SYSTEM VISUAL:
- Fondo: #09090b (negro casi puro)
- Acento: #6366f1 (purple/indigo)
- Texto: #ffffff blanco, secundario #a1a1aa gris
- Estilo: dark premium SaaS, minimal, sin gradientes baratos, tipografía protagonista
- Referencia: Linear, Vercel, Notion — adaptado al mercado argentino

TONO Y VOZ:
- Español argentino siempre: vos, sos, tenés, podés, hacés
- Directo, sin relleno. Si algo puede decirse en 5 palabras, no se dice en 10.
- Cercano pero profesional. No somos una agencia de Buenos Aires que habla desde arriba.
- Máximo 1-2 emojis por pieza y solo si agregan algo real
- Los dueños de PYMEs son personas ocupadas. Sin vaguedades.

PRINCIPIOS ESTRATÉGICOS:
1. Cada pieza de contenido tiene un objetivo claro en el embudo: awareness → consideración → decisión
2. El educativo construye autoridad y trust
3. Los demos muestran el valor real del producto
4. El social proof derriba la objeción "¿funciona de verdad?"
5. El CTA convierte el interés en DM o llamada
6. La narrativa de la semana es un arco que cierra el viernes con conversión
7. Rubros con más dolor visible: peluquerías y clínicas son la puerta de entrada

HORARIOS ÓPTIMOS EN ARGENTINA (ART UTC-3):
- Los dueños de PYMEs revisan el celular a las 8:00-9:00 (antes de abrir), 12:30-14:00 (almuerzo), 20:00-22:00 (después del trabajo)
- Martes, miércoles y jueves tienen mayor actividad
- Los lunes la gente arranca la semana (menos receptivos)
- Los viernes el engagement baja después de las 15:00

Respondés SOLO en JSON estructurado y válido. Sin texto extra antes ni después del JSON.`

// ============================================================
// Helpers
// ============================================================

function parseJson<T>(text: string): T {
  const match = text.match(/\{[\s\S]*\}|\[[\s\S]*\]/)
  if (!match) throw new Error('No se encontró JSON válido en la respuesta del modelo')
  return JSON.parse(match[0]) as T
}

// ============================================================
// generateFullWeekPlan()
// ============================================================

export async function generateFullWeekPlan(input: WeeklyInput): Promise<FullWeekPlan> {
  const client = getClient()

  const perfContext = input.previousWeekPerformance
    ? `SEMANA ANTERIOR:
- Mejor post: "${input.previousWeekPerformance.bestPost}"
- Peor post: "${input.previousWeekPerformance.worstPost}"
- Alcance total: ${input.previousWeekPerformance.totalReach.toLocaleString('es-AR')} personas
Aprovechá lo que funcionó y evitá lo que no.`
    : 'Es la primera semana o no hay datos previos disponibles.'

  const rubroContext = input.focusRubro
    ? `RUBRO DE FOCO ESTA SEMANA: ${input.focusRubro}. Todos los posts deben hablarle directamente a este rubro.`
    : 'Sin rubro específico — contenido para todos los rubros, con énfasis en peluquerías y clínicas como puerta de entrada.'

  const prompt = `Generá el plan de contenido completo para la semana ${input.weekNumber} de Instagram de DIVINIA (@autom_atia).

OBJETIVO DE VENTAS DE LA SEMANA: ${input.salesGoal} venta${input.salesGoal !== 1 ? 's' : ''} de Turnero.
${rubroContext}

${perfContext}

Generá un plan que maximice las chances de cerrar ${input.salesGoal} venta${input.salesGoal !== 1 ? 's' : ''} esta semana.
La narrativa de la semana debe ser un arco coherente: lunes arranca con educativo/hook, jueves/viernes cierra con demos y CTA fuerte.

Devolvé EXACTAMENTE este JSON (sin texto extra, sin markdown, solo el JSON):

{
  "strategy": "narrativa estratégica de la semana — qué historia contamos, cómo conecta cada pieza con las ventas, cuál es el arco narrativo de lunes a viernes (máximo 200 palabras)",
  "salesNarrative": "explicación concreta de cómo el contenido de esta semana va a generar las ${input.salesGoal} venta${input.salesGoal !== 1 ? 's' : ''} — qué post genera awareness, cuál genera interés, cuál convierte (máximo 150 palabras)",
  "weeklyHook": "el gancho narrativo central que une toda la semana en una sola idea potente — máximo 15 palabras, en español argentino",
  "bestPostingTimes": [
    {
      "day": "Lunes",
      "time": "09:00",
      "reason": "por qué este horario para este día (máximo 30 palabras)"
    },
    {
      "day": "Martes",
      "time": "20:00",
      "reason": "..."
    },
    {
      "day": "Miércoles",
      "time": "09:00",
      "reason": "..."
    },
    {
      "day": "Jueves",
      "time": "20:00",
      "reason": "..."
    },
    {
      "day": "Viernes",
      "time": "12:30",
      "reason": "..."
    }
  ],
  "posts": [
    {
      "day": "Lunes",
      "time": "09:00",
      "type": "hook",
      "designBrief": "instrucciones MUY específicas para Canva/Nanobanana: qué fondo usar (#09090b o variante), qué texto va en grande (headline), qué texto va chico (subtítulo), jerarquía visual exacta, si hay íconos o elementos gráficos y dónde van, tamaño relativo de cada elemento, márgenes y espaciado, qué contraste usar — describí como si le explicaras a un diseñador que no puede preguntarte nada",
      "nanobananaPrompt": "prompt en inglés para generar el fondo animado o estático en Nanobanana — describí: dark aesthetic, colores exactos, elementos visuales, mood, movimiento si es animado, sin texto (el texto se agrega arriba)",
      "caption": "caption completo listo para copiar y pegar en Instagram — hook en primera línea (lo que se ve antes del 'ver más'), desarrollo en 2-4 párrafos cortos, CTA claro al final — en español argentino, máximo 2200 caracteres",
      "hashtags": ["#hashtag1", "#hashtag2", "#hashtag3", "#hashtag4", "#hashtag5", "#hashtag6", "#hashtag7", "#hashtag8", "#hashtag9", "#hashtag10", "#hashtag11", "#hashtag12", "#hashtag13", "#hashtag14", "#hashtag15"],
      "salesIntent": "cómo este post específico mueve al prospecto hacia la venta — en qué parte del embudo actúa y qué acción esperamos que tome (máximo 60 palabras)",
      "callToAction": "el CTA exacto que va al final del caption — específico y directo"
    },
    {
      "day": "Martes",
      "time": "20:00",
      "type": "educativo",
      "designBrief": "...",
      "nanobananaPrompt": "...",
      "caption": "...",
      "hashtags": ["#hashtag1", "... 15 hashtags en total"],
      "salesIntent": "...",
      "callToAction": "..."
    },
    {
      "day": "Miércoles",
      "time": "09:00",
      "type": "before_after",
      "designBrief": "...",
      "nanobananaPrompt": "...",
      "caption": "...",
      "hashtags": ["#hashtag1", "... 15 hashtags en total"],
      "salesIntent": "...",
      "callToAction": "..."
    },
    {
      "day": "Jueves",
      "time": "20:00",
      "type": "stats",
      "designBrief": "...",
      "nanobananaPrompt": "...",
      "caption": "...",
      "hashtags": ["#hashtag1", "... 15 hashtags en total"],
      "salesIntent": "...",
      "callToAction": "..."
    },
    {
      "day": "Viernes",
      "time": "12:30",
      "type": "cta",
      "designBrief": "...",
      "nanobananaPrompt": "...",
      "caption": "...",
      "hashtags": ["#hashtag1", "... 15 hashtags en total"],
      "salesIntent": "...",
      "callToAction": "..."
    }
  ],
  "stories": [
    {
      "day": "Lunes",
      "time": "09:30",
      "format": "texto",
      "content": "qué poner en la story — texto completo o descripción de qué hacer, listo para ejecutar",
      "salesLink": false
    },
    {
      "day": "Miércoles",
      "time": "20:30",
      "format": "encuesta",
      "content": "pregunta de la encuesta + las dos opciones de respuesta — en español argentino",
      "salesLink": false
    },
    {
      "day": "Viernes",
      "time": "13:00",
      "format": "cuenta_regresiva",
      "content": "qué dice la story de cuenta regresiva — a qué cuenta regresiva, con qué copy de urgencia",
      "salesLink": true
    }
  ],
  "reels": [
    {
      "type": "grabado_joaco",
      "title": "título del reel para uso interno",
      "script": "guión completo para que Joaco se grabe — incluye: qué decir exactamente en los primeros 3 segundos (gancho), puntos a desarrollar con las palabras exactas que puede decir, CTA final natural. Tiene que sonar como Joaco hablando, no como un actor. En español argentino. Máximo 90 segundos de contenido hablado.",
      "hook": "exactamente qué dice/muestra en los primeros 3 segundos para detener el scroll",
      "duration": "30s"
    },
    {
      "type": "remotion_animado",
      "title": "título del reel animado para uso interno",
      "remotionComposition": "nombre de la composición de Remotion a usar o descripción del tipo de animación (stats animados, contador, comparación visual, etc.)",
      "nanobananaPrompt": "prompt en inglés para el fondo animado del reel — dark aesthetic, colores de DIVINIA, movimiento sutil, sin texto (el texto va en la animación de Remotion)",
      "hook": "qué aparece en los primeros 3 segundos de la animación para detener el scroll",
      "duration": "15s"
    }
  ],
  "outreachMessages": [
    {
      "platform": "instagram_dm",
      "targetRubro": "peluquería",
      "message": "mensaje DM completo listo para enviar — casual, directo, menciona un dolor específico del rubro, termina con pregunta abierta. Máximo 150 palabras. En español argentino. Sin emojis en exceso.",
      "followUp": "mensaje de seguimiento si no responden en 24hs — más corto, diferente ángulo, sin insistir agresivamente"
    },
    {
      "platform": "instagram_dm",
      "targetRubro": "clínica / consultorio",
      "message": "...",
      "followUp": "..."
    },
    {
      "platform": "whatsapp",
      "targetRubro": "veterinaria",
      "message": "...",
      "followUp": "..."
    },
    {
      "platform": "instagram_dm",
      "targetRubro": "taller mecánico",
      "message": "...",
      "followUp": "..."
    },
    {
      "platform": "whatsapp",
      "targetRubro": "odontología",
      "message": "...",
      "followUp": "..."
    }
  ]
}

REGLAS PARA LOS HASHTAGS (15 por post):
- 3 hashtags grandes (+1M posts): visibilidad masiva aunque baja precisión
- 6 hashtags medianos (100K-1M posts): balance entre alcance y relevancia
- 6 hashtags de nicho (<100K posts): audiencia muy relevante, alta probabilidad de DMs
- Variar entre posts — no repetir los mismos 15 en todos
- Incluir hashtags del rubro objetivo, de Argentina, de sistema de turnos, y de tecnología/IA

REGLAS PARA LOS CAPTIONS:
- Primera línea: hook que obligue a tocar "ver más" — pregunta, dato impactante o afirmación disruptiva
- Desarrollo: máximo 4 párrafos cortos, cada uno con una idea clara
- Sin tecnicismos innecesarios ni anglicismos sin traducción
- Mencionar el precio cuando sea relevante ($80.000 ARS pago único) — no esconder el precio
- CTA siempre al final y siempre específico ("escribinos al DM" es mejor que "contactanos")

Solo el JSON. Sin texto antes ni después.`

  const response = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 8000,
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: prompt }],
  })

  const text = response.content[0].type === 'text' ? response.content[0].text : ''
  const data = parseJson<Omit<FullWeekPlan, 'weekNumber' | 'generatedAt'>>(text)

  return {
    weekNumber: input.weekNumber,
    generatedAt: new Date().toISOString(),
    strategy: data.strategy,
    salesNarrative: data.salesNarrative,
    weeklyHook: data.weeklyHook,
    bestPostingTimes: data.bestPostingTimes,
    posts: data.posts,
    stories: data.stories,
    reels: data.reels,
    outreachMessages: data.outreachMessages,
  }
}
