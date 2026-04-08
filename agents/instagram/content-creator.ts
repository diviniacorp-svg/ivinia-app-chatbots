// ============================================================
// DIVINIA — Content Creator Agent
// Genera captions, hashtags y prompts para Canva
// ============================================================

import Anthropic from '@anthropic-ai/sdk'
import type { InstagramPost, CaptionVariants, Rubro } from './types'

const BRAND_VOICE = `VOZ DE MARCA DIVINIA:
- Tono: profesional pero cercano, como un amigo que sabe de tecnología
- Idioma: español argentino (vos, sos, tenés, podés, hacés)
- Emoji: moderado, máximo 5 por post, solo donde agreguen valor
- Estructura: hook impactante → problema/solución → beneficios concretos → CTA claro
- Evitar: tecnicismos innecesarios, promesas exageradas, anglicismos sin traducción
- Incluir siempre: un dato específico, una acción concreta, o una pregunta que invite a comentar
- Precios siempre en ARS cuando se mencionen
- Target: dueños de PYMEs en Argentina que no tienen tiempo que perder`

const SYSTEM_PROMPT = `Sos el Agente Creador de Contenido de DIVINIA, empresa de IA de San Luis, Argentina.
Creás contenido para Instagram orientado a vender sistemas de turnos a PYMEs.

${BRAND_VOICE}

Generás 3 variantes de caption para hacer A/B testing:
- Variante A: enfoque en el PROBLEMA del cliente
- Variante B: enfoque en los BENEFICIOS/RESULTADOS
- Variante C: enfoque en la OFERTA/URGENCIA`

function getClient(): Anthropic {
  return new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
}

export async function generateCaptions(
  idea: string,
  rubro: Rubro | 'general',
  postType: string,
  format: string
): Promise<CaptionVariants> {
  const client = getClient()

  const prompt = `Generá 3 variantes de caption para Instagram de DIVINIA.

Datos del post:
- Idea/concepto: ${idea}
- Rubro objetivo: ${rubro}
- Tipo de post: ${postType}
- Formato: ${format}

Devolvé un JSON con esta estructura:
{
  "A": "caption completo variante A (enfoque problema)",
  "B": "caption completo variante B (enfoque beneficios)",
  "C": "caption completo variante C (enfoque oferta/urgencia)",
  "hashtags": ["#hashtag1", ..., "#hashtag20"],
  "canvaPrompt": "descripción visual detallada en inglés para Canva"
}

Para los captions:
- Máximo 2200 caracteres cada uno
- Hook en la primera línea (lo que se ve antes del "ver más")
- CTA específico al final (ej: "Escribinos por DM", "Probalo gratis en el link de la bio")
- Para el rubro ${rubro}: mencioná situaciones específicas de ese negocio

Para los hashtags (20 total):
- 5 hashtags de nicho específico del rubro
- 5 hashtags de Argentina/negocio local
- 5 hashtags de tecnología/IA/automatización
- 5 hashtags de alta popularidad

Para el canvaPrompt:
- Describir el visual ideal para este post
- Siempre: dark background, purple/violet #6366f1 accents, DIVINIA branding
- Mencionar textos que deben aparecer en el diseño

Solo devolvé el JSON.`

  const response = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 1500,
    messages: [{ role: 'user', content: prompt }],
    system: SYSTEM_PROMPT,
  })

  const text = response.content[0].type === 'text' ? response.content[0].text : ''
  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (!jsonMatch) throw new Error('No se pudo parsear el JSON del caption')

  return JSON.parse(jsonMatch[0]) as CaptionVariants
}

export async function generateHashtags(
  rubro: Rubro | 'general',
  postType: string,
  count: number = 20
): Promise<string[]> {
  const client = getClient()

  const prompt = `Generá ${count} hashtags de Instagram para DIVINIA vendiendo sistemas de turnos a ${rubro} en Argentina.

Combiná:
- Hashtags específicos del rubro ${rubro} en Argentina
- Hashtags de sistemas de turnos / agenda online
- Hashtags de tecnología IA para negocios
- Hashtags de emprendedores y PYMEs argentinas

Devolvé solo un array JSON de strings: ["#hashtag1", "#hashtag2", ...]
Sin texto extra.`

  const response = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 400,
    messages: [{ role: 'user', content: prompt }],
  })

  const text = response.content[0].type === 'text' ? response.content[0].text : ''
  const jsonMatch = text.match(/\[[\s\S]*\]/)
  if (!jsonMatch) return []

  return JSON.parse(jsonMatch[0]) as string[]
}

export async function improveCaption(caption: string, feedback: string): Promise<string> {
  const client = getClient()

  const prompt = `Mejorá este caption de Instagram de DIVINIA según el feedback dado.

Caption original:
${caption}

Feedback:
${feedback}

Devolvé solo el caption mejorado, sin explicaciones.`

  const response = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 800,
    messages: [{ role: 'user', content: prompt }],
    system: SYSTEM_PROMPT,
  })

  return response.content[0].type === 'text' ? response.content[0].text : caption
}
