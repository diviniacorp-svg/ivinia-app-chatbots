import Anthropic from '@anthropic-ai/sdk'

export interface BrandReviewInput {
  pieceType: 'post' | 'carousel_slide' | 'story' | 'reel' | 'logo'
  client: string  // ej: "Turnero", "DIVINIA"
  description: string  // descripción visual de la pieza
  copyText: string  // todo el texto que aparece
  canvaDesignId?: string
}

export interface BrandIssue {
  severity: 'blocker' | 'major' | 'minor'
  category: 'color' | 'typography' | 'tone' | 'copy' | 'structure' | 'brand_identity'
  description: string
  fix: string
}

export interface BrandReviewResult {
  approved: boolean
  score: number  // 0-100
  issues: BrandIssue[]
  fixes: string[]  // qué cambiar exactamente
  approvedVersion?: string  // si hay ajustes menores, la versión corregida del copy
  summary: string
}

export interface WeeklyQCReport {
  client: string
  week: number
  totalPieces: number
  approved: number
  rejected: number
  pieces: { id: string; title: string; result: BrandReviewResult }[]
  overallBrandConsistency: number
  recommendations: string[]
}

const TURNERO_BRAND = `
IDENTIDAD DE MARCA — TURNERO (el producto):
- Paleta: fondo claro/blanco, azul indigo (#4f46e5) como acento principal, lavanda (#c4b5fd) como acento secundario
- Tipografía: Ubuntu, redondeada, amigable — NO fuentes corporativas frías ni serifas
- Elementos visuales: pelotas puff 3D flotando, emojis de calendario, almanaque, elementos lúdicos
- Estilo: MTV 2012 + SaaS amigable — energético, colorido pero ordenado, nunca oscuro
- Tono de voz: argentino, cercano, directo — "vos, sos, tenés, podés"
- Marca en pieza: "Turnero by DIVINIA" debe aparecer en todas las piezas

PROHIBIDO para Turnero:
- Fondos oscuros o dark mode
- Estilo corporativo frío o minimalista extremo
- Stock photos genéricos
- Mezcla de paletas (no agregar colores fuera de la paleta definida)
- Lenguaje formal o distante ("usted", "su empresa", "estimado cliente")
- Omitir "Turnero by DIVINIA" en la pieza
`.trim()

const DIVINIA_BRAND = `
IDENTIDAD DE MARCA — DIVINIA (la empresa, comunicaciones B2B):
- Paleta: fondo #09090b (negro casi puro), acento #6366f1 (indigo/purple), texto #ffffff, secundario #a1a1aa
- Estilo: dark premium SaaS. Minimalista. Sin gradientes baratos. Sin stock photos.
- Referencia: Linear, Vercel, Notion — adaptado al mercado argentino
- Tipografía: system-ui, peso 900 para títulos, 400-500 para cuerpo
- Tono: directo, sin relleno, cercano pero profesional. Español argentino.
- Target: dueños de PYMEs de San Luis y Argentina

PROHIBIDO para DIVINIA:
- Fondos claros en piezas de marca DIVINIA
- Gradientes coloridos o elementos decorativos excesivos
- Lenguaje de "gurú" o marketinero vacío
- Stock photos genéricas
`.trim()

const SYSTEM_PROMPT = `Sos el Director de Control de Calidad de Marca de DIVINIA, empresa de inteligencia artificial de San Luis, Argentina.

Tu trabajo es revisar piezas de contenido antes de que se publiquen, garantizando coherencia de identidad visual y estratégica.

Manejás dos identidades de marca distintas:

${TURNERO_BRAND}

---

${DIVINIA_BRAND}

---

CRITERIOS DE EVALUACIÓN (score 0-100):
- Color y paleta (25 pts): ¿usa los colores correctos para el cliente? ¿hay colores prohibidos?
- Tipografía (15 pts): ¿es la fuente correcta? ¿el peso y tamaño son apropiados?
- Tono de copy (25 pts): ¿habla en argentino? ¿es cercano y directo? ¿no suena corporativo?
- Copy y mensaje (20 pts): ¿es claro, conciso, sin relleno? ¿tiene un objetivo comunicacional definido?
- Estructura visual (10 pts): ¿la jerarquía visual tiene sentido? ¿el layout es funcional?
- Identidad de marca (5 pts): ¿aparece la marca correctamente? ¿el estilo es reconocible?

APROBACIÓN:
- Score >= 75 → aprobado
- Score < 75 → rechazado (requiere correcciones antes de publicar)

Severidad de issues:
- blocker: impide publicación (paleta totalmente incorrecta, ausencia de marca, tono completamente equivocado)
- major: degradación seria de marca, requiere corrección obligatoria
- minor: ajuste recomendado, no impide publicación si el score >= 75`

function getClient(): Anthropic {
  return new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
}

function parseJson<T>(text: string): T {
  const match = text.match(/\{[\s\S]*\}|\[[\s\S]*\]/)
  if (!match) throw new Error(`No se encontró JSON válido en la respuesta`)
  return JSON.parse(match[0]) as T
}

export async function reviewPiece(input: BrandReviewInput): Promise<BrandReviewResult> {
  const client = getClient()

  const prompt = `Revisá esta pieza de contenido y evaluá si cumple con la identidad de marca del cliente.

DATOS DE LA PIEZA:
- Tipo: ${input.pieceType}
- Cliente/Marca: ${input.client}
- Descripción visual: ${input.description}
- Copy completo: ${input.copyText}
${input.canvaDesignId ? `- Canva Design ID: ${input.canvaDesignId}` : ''}

Revisá en base a la identidad de marca de "${input.client}" definida en tu sistema.

Devolvé JSON con esta estructura exacta:
{
  "approved": true,
  "score": 85,
  "issues": [
    {
      "severity": "minor",
      "category": "tone",
      "description": "descripción del problema encontrado",
      "fix": "exactamente qué cambiar para resolverlo"
    }
  ],
  "fixes": [
    "cambio concreto 1 — qué hacer exactamente",
    "cambio concreto 2"
  ],
  "approvedVersion": "si hay ajustes de copy menores (minor), el copy corregido listo para usar — null si no aplica o si fue rechazado por problemas visuales",
  "summary": "resumen en 2-3 oraciones — estado de la pieza, qué funciona bien y qué necesita atención"
}

Reglas:
- approved = true si score >= 75, false si < 75
- Si no hay issues, "issues" = [] y "fixes" = []
- Si hay solo issues minor y el copy puede corregirse fácil, incluí "approvedVersion" con el copy mejorado
- Sé específico en los fixes — no "mejorar el tono" sino "cambiar 'su empresa' por 'tu negocio'"
- Si la pieza es para un cliente que no es Turnero ni DIVINIA, evaluá con criterios generales de coherencia y calidad

Solo el JSON.`

  const response = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 900,
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: prompt }],
  })

  const text = response.content[0].type === 'text' ? response.content[0].text : '{}'
  return parseJson<BrandReviewResult>(text)
}

export async function reviewWeek(
  pieces: BrandReviewInput[],
  client: string,
  week: number
): Promise<WeeklyQCReport> {
  // Revisar todas las piezas en paralelo
  const results = await Promise.all(
    pieces.map((piece, index) =>
      reviewPiece(piece).then((result) => ({
        id: `${client.toLowerCase()}-w${week}-${index + 1}`,
        title: `${piece.pieceType} — ${piece.description.slice(0, 50)}${piece.description.length > 50 ? '...' : ''}`,
        result,
      }))
    )
  )

  const approved = results.filter((r) => r.result.approved).length
  const rejected = results.length - approved
  const overallBrandConsistency =
    results.length > 0
      ? Math.round(results.reduce((sum, r) => sum + r.result.score, 0) / results.length)
      : 0

  // Generar recomendaciones para la semana siguiente con IA
  const anthropicClient = getClient()

  const summaryPrompt = `Analizá los resultados del QC de marca de la semana ${week} para el cliente "${client}".

RESULTADOS:
- Total de piezas: ${pieces.length}
- Aprobadas: ${approved}
- Rechazadas: ${rejected}
- Score promedio de consistencia de marca: ${overallBrandConsistency}/100

ISSUES DETECTADOS EN LA SEMANA:
${results
  .flatMap((r) => r.result.issues)
  .map((issue) => `- [${issue.severity.toUpperCase()}] ${issue.category}: ${issue.description}`)
  .join('\n') || '- Sin issues detectados'}

Generá recomendaciones concretas para mejorar la consistencia de marca la semana siguiente.

Devolvé JSON:
{
  "recommendations": [
    "recomendación concreta 1 — accionable y específica",
    "recomendación concreta 2",
    "recomendación concreta 3"
  ]
}

Máximo 5 recomendaciones. Solo el JSON.`

  const response = await anthropicClient.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 400,
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: summaryPrompt }],
  })

  const text = response.content[0].type === 'text' ? response.content[0].text : '{}'
  const { recommendations } = parseJson<{ recommendations: string[] }>(text)

  return {
    client,
    week,
    totalPieces: pieces.length,
    approved,
    rejected,
    pieces: results,
    overallBrandConsistency,
    recommendations,
  }
}

export async function fixCopy(
  originalCopy: string,
  issues: BrandIssue[],
  client: string
): Promise<string> {
  const anthropicClient = getClient()

  const copyIssues = issues.filter((i) => ['tone', 'copy'].includes(i.category))

  if (copyIssues.length === 0) {
    return originalCopy
  }

  const prompt = `Corregí el copy de esta pieza de contenido para "${client}" aplicando los fixes indicados.

COPY ORIGINAL:
${originalCopy}

ISSUES A CORREGIR:
${copyIssues.map((issue) => `- [${issue.severity.toUpperCase()}] ${issue.category}: ${issue.description}\n  Fix: ${issue.fix}`).join('\n')}

INSTRUCCIONES:
- Mantené la intención y el mensaje original
- Aplicá todos los fixes listados
- Respetá la identidad de marca de "${client}" (tono argentino, cercano, directo)
- No agregues contenido nuevo que no estaba en el original
- El resultado debe ser el copy listo para usar, sin explicaciones

Devolvé solo el copy corregido, sin JSON ni formato adicional.`

  const response = await anthropicClient.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 500,
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: prompt }],
  })

  return response.content[0].type === 'text' ? response.content[0].text.trim() : originalCopy
}
