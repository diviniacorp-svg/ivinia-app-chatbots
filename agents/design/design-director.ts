import Anthropic from '@anthropic-ai/sdk'
import type {
  PostType,
  Duracion,
  DesignBrief,
  WeeklyPlan,
  WeeklyFeedPost,
  WeeklyStory,
  ReelIdea,
  VideoScript,
  CarouselSlide,
  DesignCritique,
} from './types'

const BRAND_SYSTEM = `
BRAND SYSTEM DE DIVINIA:
- Paleta: fondo #09090b (negro casi puro), acento principal #6366f1 (purple/indigo), texto #ffffff (blanco), texto secundario #a1a1aa (gris), éxito #22c55e (verde), error #ef4444 (rojo)
- Tipografía: system-ui. Títulos en weight 900 (black), cuerpo en weight 400-500 (regular/medium). Sin fuentes decorativas.
- Estilo visual: dark premium SaaS. Minimal. Sin gradientes baratos. Sin stock photos. Sin marcos redondeados excesivos. Sin sombras coloridas.
- Referencia visual: Linear, Vercel, Notion — adaptado al mercado argentino
- Composición: espacios generosos, tipografía como protagonista, color usado con criterio (no como decoración)
- Diferenciador de marca: somos de San Luis, Argentina. Eso genera cercanía y confianza en un mercado donde "lo local" importa.
`.trim()

const BRAND_TONE = `
TONO Y VOZ DE DIVINIA:
- Español argentino: vos, sos, tenés, podés, hacés — siempre
- Directo y sin relleno. Si algo puede decirse en 5 palabras, no se dice en 10.
- Cercano pero profesional. No somos una agencia de Buenos Aires que habla desde arriba.
- Sin "¡¡¡" ni emojis en exceso. Máximo 1-2 emojis por pieza, y solo si agregan algo.
- Target: dueños de PYMEs de servicios (peluquerías, clínicas, veterinarias, talleres, estéticas). Personas ocupadas que no tienen tiempo para contenido vago.
`.trim()

const SYSTEM_PROMPT = `Sos el Director de Diseño de DIVINIA, empresa de inteligencia artificial de San Luis, Argentina.

Tu trabajo es generar briefs de diseño, planes de contenido y guiones que le permitan a Joaco producir contenido de Instagram de nivel premium para vender servicios de IA a PYMEs argentinas.

${BRAND_SYSTEM}

${BRAND_TONE}

PRINCIPIOS DE DISEÑO:
1. La jerarquía visual guía el ojo — el orden importa más que la estética
2. El copy es diseño — las palabras ocupan espacio y tienen peso visual
3. El contraste es tu herramienta más poderosa (oscuro/claro, grande/chico, simple/complejo)
4. Cada decisión de diseño tiene un "por qué" anclado en comunicación, no en preferencia personal
5. Si no genera una reacción (detención del scroll, lectura, click), no sirve

OBJETIVOS DE INSTAGRAM DE DIVINIA:
- Vender sistemas de IA a PYMEs: chatbots, automatizaciones, web apps
- Construir autoridad como referente de IA en Argentina (especialmente para PYMEs)
- Generar DMs → demos → ventas reales
- La métrica que importa: conversiones, no likes`

function getClient(): Anthropic {
  return new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
}

function parseJson<T>(text: string): T {
  const match = text.match(/\{[\s\S]*\}|\[[\s\S]*\]/)
  if (!match) throw new Error(`No se encontró JSON válido en la respuesta`)
  return JSON.parse(match[0]) as T
}

export async function generatePostBrief(
  postType: PostType,
  objetivo: string,
  rubro?: string
): Promise<DesignBrief> {
  const client = getClient()

  const prompt = `Generá un brief de diseño completo para un post de Instagram de DIVINIA.

PARÁMETROS:
- Tipo de post: ${postType}
- Objetivo de comunicación: ${objetivo}
${rubro ? `- Rubro del cliente objetivo: ${rubro}` : ''}

Tipos de post disponibles y su función:
- hook: captura atención en los primeros 0.5 segundos del scroll, pregunta disruptiva o dato sorprendente
- educativo: enseña algo útil relacionado a IA/automatización para PYMEs
- cta: convierte el interés en acción (DM, link, prueba gratis)
- before_after: muestra transformación (antes sin IA, después con IA)
- stats: datos y números que generan credibilidad
- carousel_slide: slide dentro de un carrusel (pensar en flujo narrativo)
- story: efímero, más informal, ideal para mostrar el detrás de escena o encuestas
- reel_script: guión para un reel corto, energético, de alta retención

Devolvé JSON con esta estructura exacta:
{
  "concepto": "la idea central del post en 1-2 oraciones — qué se comunica y cómo",
  "jerarquiaVisual": {
    "primario": "el elemento más importante visualmente — lo primero que debe leer el ojo",
    "secundario": "el segundo elemento en orden de lectura",
    "terciario": "elemento de soporte, puede ser null si no aplica"
  },
  "copyPrincipal": "el texto de mayor peso tipográfico — headline o gancho",
  "copySecundario": "el texto de soporte — subtítulo, descripción breve o CTA",
  "colores": [
    {
      "color": "nombre del color",
      "hex": "#xxxxxx",
      "uso": "dónde se usa exactamente en esta pieza",
      "porQue": "por qué este color en este elemento y no otro"
    }
  ],
  "composicion": {
    "estilo": "descripción del estilo compositivo general",
    "layout": "descripción del layout — cómo se organizan los elementos en el espacio",
    "elementosVisuales": ["elemento 1", "elemento 2", "..."],
    "porQue": "por qué esta composición comunica mejor el objetivo"
  },
  "razonamiento": {
    "porQueElConcepto": "justificación del concepto elegido",
    "porQueLaJerarquia": "justificación del orden visual elegido",
    "porQueLaComposicion": "justificación de las decisiones compositivas"
  }
}

Solo el JSON.`

  const response = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1200,
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: prompt }],
  })

  const text = response.content[0].type === 'text' ? response.content[0].text : '{}'
  const data = parseJson<Omit<DesignBrief, 'generatedAt' | 'postType' | 'objetivo' | 'rubro'>>(text)

  return {
    generatedAt: new Date(),
    postType,
    objetivo,
    rubro,
    ...data,
  }
}

export async function generateWeeklyContentPlan(
  week: number,
  focusRubro?: string
): Promise<WeeklyPlan> {
  const client = getClient()

  const prompt = `Generá el plan de contenido semanal completo para Instagram de DIVINIA.

PARÁMETROS:
- Semana número: ${week}
${focusRubro ? `- Rubro de foco esta semana: ${focusRubro}` : '- Sin rubro de foco específico — contenido general de DIVINIA'}

El plan debe incluir:
- 5 posts de feed (lunes a viernes)
- 3 stories (distribuidas en la semana)
- 2 ideas de reels: uno filmado por Joaco con guión (tipo tutorial o punto de vista), uno animado con Remotion (tipo stats, dato impactante o comparación visual)

Para cada pieza, pensá en la narrativa de la semana como un arco: de menos a más intensidad, cerrando con un CTA fuerte el viernes.

Devolvé JSON:
{
  "feedPosts": [
    {
      "dia": "Lunes",
      "objetivoEstrategico": "qué queremos lograr con este post (awareness, educación, conversión)",
      "copy": "copy completo del post — caption listo para publicar en español argentino",
      "briefVisual": "descripción del diseño — qué debe verse en la imagen/video",
      "mejorHorario": "HH:MM en ART",
      "hashtags": ["#hashtag1", "..."],
      "postType": "hook|educativo|cta|before_after|stats|carousel_slide|story|reel_script"
    }
  ],
  "stories": [
    {
      "dia": "Martes",
      "objetivoEstrategico": "...",
      "copy": "...",
      "briefVisual": "...",
      "mejorHorario": "HH:MM"
    }
  ],
  "reels": [
    {
      "tipo": "filmado",
      "tema": "tema del reel",
      "objetivoEstrategico": "...",
      "duracion": "30s",
      "briefVisual": "descripción de lo que se ve en pantalla, fondo, overlay de texto, montaje"
    },
    {
      "tipo": "animado",
      "tema": "tema del reel animado",
      "objetivoEstrategico": "...",
      "duracion": "15s",
      "briefVisual": "descripción de la animación — elementos, transiciones, tipografía en movimiento"
    }
  ],
  "notasEstrategicas": "contexto estratégico de la semana — qué narrativa conecta todas las piezas y por qué"
}

Solo el JSON.`

  const response = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 2500,
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: prompt }],
  })

  const text = response.content[0].type === 'text' ? response.content[0].text : '{}'
  const data = parseJson<{
    feedPosts: WeeklyFeedPost[]
    stories: WeeklyStory[]
    reels: ReelIdea[]
    notasEstrategicas: string
  }>(text)

  return {
    generatedAt: new Date(),
    semana: week,
    focusRubro,
    feedPosts: data.feedPosts,
    stories: data.stories,
    reels: data.reels,
    notasEstrategicas: data.notasEstrategicas,
  }
}

export async function generatePersonalVideoScript(
  tema: string,
  duracion: Duracion
): Promise<VideoScript> {
  const client = getClient()

  const duracionSegundos = { '15s': 15, '30s': 30, '60s': 60 }[duracion]
  const palabrasAproximadas = { '15s': '30-40', '30s': '70-90', '60s': '150-180' }[duracion]

  const prompt = `Generá un guión para que Joaco se grabe a sí mismo en un video de Instagram de DIVINIA.

PARÁMETROS:
- Tema: ${tema}
- Duración: ${duracion} (${duracionSegundos} segundos, aproximadamente ${palabrasAproximadas} palabras habladas)

Joaco es el fundador de DIVINIA, empresa de IA de San Luis, Argentina. Es cercano, directo, sin poses de "gurú". Habla en argentino. No actúa — es él mismo.

El video debe:
- Arrancar con un gancho en los primeros 3 segundos que detenga el scroll (pregunta, afirmación disruptiva o dato)
- Desarrollar con puntos concretos, sin relleno
- Cerrar con un CTA claro y natural (no forzado)

Devolvé JSON:
{
  "ganchoApertura": "exactamente qué dice Joaco en los primeros 3 segundos — tiene que ser fuerte y directo",
  "puntosClave": [
    "punto 1 — lo que dice Joaco (guión hablado, en argentino)",
    "punto 2",
    "punto 3"
  ],
  "ctaFinal": "lo que dice Joaco al final para cerrar — debe ser natural, no de vendedor",
  "notasProduccion": {
    "quesMostrarEnPantalla": "qué texto overlay, gráficos o elementos aparecen mientras Joaco habla",
    "queFondoUsar": "descripción del fondo ideal — dónde grabarse, qué debe verse atrás",
    "tonoDeVoz": "descripción del tono, energía y ritmo de habla para este video",
    "vestuario": "qué ponerse — si aplica algo específico al tema",
    "extras": "cualquier nota adicional de producción que sea relevante"
  }
}

Solo el JSON.`

  const response = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 900,
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: prompt }],
  })

  const text = response.content[0].type === 'text' ? response.content[0].text : '{}'
  const data = parseJson<Omit<VideoScript, 'tema' | 'duracion'>>(text)

  return {
    tema,
    duracion,
    ...data,
  }
}

export async function generateCarouselContent(
  tema: string,
  slides: number
): Promise<CarouselSlide[]> {
  const client = getClient()

  const prompt = `Generá el contenido completo de un carousel de Instagram de DIVINIA.

PARÁMETROS:
- Tema: ${tema}
- Cantidad de slides: ${slides}

El carousel debe tener una narrativa clara con este arco:
- Slide 1 (intro): gancho que obligue a pasar al siguiente
- Slides intermedios (desarrollo): contenido de valor, un punto por slide
- Último slide (cta): cierre con llamado a la acción

Asigná la posición narrativa de cada slide:
- "intro" → primer slide
- "desarrollo" → slides intermedios
- "climax" → el slide más potente antes del cierre (revelación, estadística, ejemplo)
- "cta" → último slide

Devolvé JSON con un array de ${slides} objetos:
[
  {
    "numero": 1,
    "posicionNarrativa": "intro",
    "titulo": "texto grande, pocas palabras — máximo 6 palabras",
    "cuerpo": "texto de soporte — 1-3 líneas, complementa el título sin repetirlo",
    "elementoVisual": "qué elemento gráfico o visual debe acompañar este slide (icono, dato destacado, ilustración, etc)"
  }
]

Cada slide debe poder leerse solo pero también funcionar como parte del flujo. El usuario que no desliza igual entiende el punto del slide donde se detuvo.

Solo el JSON (array).`

  const response = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1500,
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: prompt }],
  })

  const text = response.content[0].type === 'text' ? response.content[0].text : '[]'
  return parseJson<CarouselSlide[]>(text)
}

export async function critiqueDesign(description: string): Promise<DesignCritique> {
  const client = getClient()

  const prompt = `Analizá el siguiente diseño de Instagram y dá feedback específico y accionable.

DESCRIPCIÓN DEL DISEÑO:
${description}

Evaluá en base al brand system de DIVINIA y principios de diseño para Instagram.

Puntaje: de 0 a 10, donde:
- 0-4: necesita rehacer
- 5-6: tiene potencial pero requiere cambios importantes
- 7-8: sólido, con ajustes menores
- 9-10: listo para publicar

Devolvé JSON:
{
  "jerarquia": {
    "puntaje": 7,
    "observaciones": "qué funciona y qué no en el orden de lectura visual",
    "mejoras": ["mejora concreta 1", "mejora concreta 2"]
  },
  "legibilidad": {
    "puntaje": 7,
    "observaciones": "análisis del contraste, tamaño tipográfico, espacio entre elementos",
    "mejoras": ["mejora concreta 1", "mejora concreta 2"]
  },
  "coherenciaMarca": {
    "puntaje": 7,
    "observaciones": "qué tan alineado está con el brand system de DIVINIA — paleta, tipografía, estilo",
    "mejoras": ["mejora concreta 1", "mejora concreta 2"]
  },
  "puntajeGlobal": 7,
  "veredicto": "resumen en 2-3 oraciones — estado actual del diseño y qué necesita para publicarse",
  "proximosPasos": [
    "paso concreto 1 — qué cambiar exactamente",
    "paso concreto 2",
    "paso concreto 3"
  ]
}

Solo el JSON.`

  const response = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 900,
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: prompt }],
  })

  const text = response.content[0].type === 'text' ? response.content[0].text : '{}'
  const data = parseJson<Omit<DesignCritique, 'descripcion'>>(text)

  return {
    descripcion: description,
    ...data,
  }
}
