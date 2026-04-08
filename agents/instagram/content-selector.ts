// ============================================================
// DIVINIA — Content Selector Agent
// Evalúa múltiples variantes de caption y elige la mejor
// basándose en calidad de texto, estrategia y potencial de engagement
// ============================================================

import Anthropic from '@anthropic-ai/sdk'
import type { CaptionVariants, CalendarEntry } from './types'

export interface SelectionCriteria {
  textQuality: number      // 0-10: ortografía, gramática, claridad
  originality: number      // 0-10: sin repeticiones vs otros posts del mes
  hookStrength: number     // 0-10: fuerza del primer párrafo
  strategicFit: number     // 0-10: alineación con objetivo del post
  ctaClarity: number       // 0-10: claridad del llamado a la acción
  brandVoice: number       // 0-10: voz de marca (español arg, tono correcto)
  totalScore: number       // promedio ponderado
}

export interface EvaluatedVariant {
  variant: 'A' | 'B' | 'C'
  caption: string
  criteria: SelectionCriteria
  issues: string[]           // errores tipográficos, frases repetidas, etc.
  strengths: string[]        // qué hace bien
  suggestion?: string        // mejora puntual si no es perfecta
}

export interface SelectionResult {
  winner: 'A' | 'B' | 'C'
  winnerCaption: string
  winnerHashtags: string[]
  winnerCanvaPrompt: string
  evaluations: EvaluatedVariant[]
  selectionReasoning: string
  improvedCaption?: string   // versión mejorada si se encontraron issues leves
  qualityApproved: boolean   // false si ninguna variante supera score 7
  rejectionReason?: string   // si qualityApproved=false, por qué se rechaza todo
}

const SYSTEM_PROMPT = `Sos el Agente Selector de Contenido de DIVINIA, empresa de IA de San Luis, Argentina.
Tu rol es evaluar múltiples variantes de captions para Instagram y elegir la mejor con criterios profesionales.

CRITERIOS DE EVALUACIÓN:
1. CALIDAD DE TEXTO (peso: 25%): Sin errores tipográficos, ortografía correcta, gramática española argentina.
   Penalizá: palabras pegadas, tildes faltantes, puntuación mal usada, repetición de palabras en el mismo párrafo.

2. ORIGINALIDAD (peso: 20%): La frase de apertura (hook) debe ser única.
   Penalizá frases genéricas: "¿Sabías que...?", "Hoy te quiero hablar de...", "Muchos negocios...".
   Premiá: datos concretos, preguntas específicas del rubro, escenarios vivenciales.

3. FUERZA DEL HOOK (peso: 20%): El primer párrafo visible (antes del "ver más") determina si alguien lee el post.
   Debe generar curiosidad, identificación o urgencia en menos de 125 caracteres.

4. FIT ESTRATÉGICO (peso: 15%): El post debe cumplir su objetivo (educar, demostrar, vender) sin intentar hacer todo a la vez.

5. CLARIDAD DEL CTA (peso: 10%): El llamado a la acción debe ser específico y único.
   Penalizá: múltiples CTAs, CTAs vagos ("¡Seguinos!"), CTAs que no tienen sentido para el objetivo.

6. VOZ DE MARCA (peso: 10%): Español argentino genuino (vos/sos/tenés), tono profesional-cercano, no corporativo ni excesivamente informal.

ERRORES QUE DESCALIFICAN UNA VARIANTE:
- Mezcla de "tú/vos" en el mismo post
- Más de 3 emojis consecutivos sin texto
- Cap en MAYÚSCULAS para énfasis (permitido solo en siglas)
- Hashtags dentro del cuerpo del caption (van al final)
- Precio sin contexto
- Promesas que DIVINIA no puede garantizar

Respondés SIEMPRE en JSON válido.`

function getClient(): Anthropic {
  return new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
}

export async function selectBestVariant(
  variants: CaptionVariants,
  entry: CalendarEntry,
  publishedCaptionsThisMonth: string[] = []
): Promise<SelectionResult> {
  const client = getClient()

  const previousPostsContext = publishedCaptionsThisMonth.length > 0
    ? `\nPosts ya planificados este mes (evitar repetir frases similares):\n${
        publishedCaptionsThisMonth.slice(-5).map((c, i) => `POST ${i + 1}: "${c.substring(0, 200)}..."`).join('\n')
      }`
    : '\nEste es el primer post del mes, sin contexto previo.'

  const prompt = `Evaluá estas 3 variantes de caption para Instagram de DIVINIA.

CONTEXTO DEL POST:
- Idea/concepto: ${entry.idea}
- Tipo: ${entry.postType} | Formato: ${entry.format}
- Rubro objetivo: ${entry.rubro}
- Horario programado: ${entry.dayOfWeek} ${entry.scheduledTime}
- Prioridad estratégica: ${entry.priority}
${previousPostsContext}

VARIANTE A:
${variants.A}

VARIANTE B:
${variants.B}

VARIANTE C:
${variants.C}

HASHTAGS DISPONIBLES:
${variants.hashtags.join(' ')}

CANVA PROMPT DISPONIBLE:
${variants.canvaPrompt}

INSTRUCCIONES:
1. Evaluá cada variante con los criterios del sistema
2. Identificá todos los issues (tipográficos, repeticiones, frases genéricas, etc.)
3. Elegí la ganadora
4. Si la ganadora tiene issues LEVES (score entre 7-8), generá una versión mejorada
5. Si NINGUNA variante supera score 6, marcá qualityApproved=false y explicá por qué

Devolvé EXACTAMENTE este JSON (sin texto adicional):
{
  "winner": "A" | "B" | "C",
  "winnerCaption": "el caption ganador exacto",
  "winnerHashtags": ["#hashtag1", ...],
  "winnerCanvaPrompt": "el canva prompt disponible",
  "evaluations": [
    {
      "variant": "A",
      "caption": "primeros 100 chars del caption...",
      "criteria": {
        "textQuality": 8,
        "originality": 7,
        "hookStrength": 9,
        "strategicFit": 8,
        "ctaClarity": 7,
        "brandVoice": 9,
        "totalScore": 8.1
      },
      "issues": ["lista de issues encontrados"],
      "strengths": ["lista de puntos fuertes"],
      "suggestion": "mejora puntual si aplica"
    }
  ],
  "selectionReasoning": "por qué esta variante gana sobre las otras (2-3 oraciones)",
  "improvedCaption": "versión mejorada si hubo issues leves, o null si no aplica",
  "qualityApproved": true,
  "rejectionReason": null
}`

  const response = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 3000,
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: prompt }],
  })

  const text = response.content[0].type === 'text' ? response.content[0].text : ''

  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (!jsonMatch) throw new Error('Selector: respuesta inválida del modelo')

  return JSON.parse(jsonMatch[0]) as SelectionResult
}

// Evalúa un caption ya existente (para posts creados manualmente)
export async function auditCaption(
  caption: string,
  context: { idea: string; rubro: string; postType: string }
): Promise<{ score: number; issues: string[]; improvedVersion: string }> {
  const client = getClient()

  const response = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1500,
    system: SYSTEM_PROMPT,
    messages: [{
      role: 'user',
      content: `Auditá este caption de Instagram para DIVINIA.

Contexto: ${context.idea} | Rubro: ${context.rubro} | Tipo: ${context.postType}

Caption:
${caption}

Devolvé JSON:
{
  "score": 8.5,
  "issues": ["issue1", "issue2"],
  "improvedVersion": "versión corregida del caption"
}`
    }],
  })

  const text = response.content[0].type === 'text' ? response.content[0].text : ''
  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (!jsonMatch) throw new Error('Audit: respuesta inválida')

  return JSON.parse(jsonMatch[0])
}
