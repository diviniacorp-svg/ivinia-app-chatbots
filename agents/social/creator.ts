// ============================================================
// DIVINIA Social Agency — Content Creator Agent
// Generates multi-platform captions using Claude Sonnet
// Adapts tone, length, hashtags, and CTAs per platform
// ============================================================

import Anthropic from '@anthropic-ai/sdk'
import type { SocialClient, ContentPillar, PostFormat, Platform, CaptionPackage, MultiPlatformCaption } from './types'

let _client: Anthropic | null = null
function getClient() {
  if (!_client) _client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  return _client
}

const PLATFORM_RULES: Record<Platform, string> = {
  instagram: 'Máximo 2200 caracteres. Empieza con un hook fuerte en la primera línea. Usa saltos de línea para legibilidad. Incluye 10-15 hashtags al final. Habla de vos/tus (español argentino). CTA en la última línea.',
  tiktok: 'Máximo 150 caracteres en el texto visible. Muy directo, lenguaje de Gen Z pero también dueños de negocios. 3-5 hashtags de tendencia. Hook agresivo.',
  linkedin: 'Máximo 700 caracteres. Tono profesional pero humano. Sin hashtags dentro del texto. 3-5 hashtags al final. Incluye un dato o estadística si es posible. CTA a comentar o compartir.',
  twitter: 'Máximo 270 caracteres. Ultra conciso. Máximo 2-3 hashtags. Puede tener hilo (parte 1/3).',
  youtube: 'Descripción larga, SEO-optimizada. Incluye keywords naturalmente. Timestamps si aplica. Links. Mínimo 200 palabras.',
  facebook: 'Similar a Instagram pero más conversacional. Máximo 500 caracteres visibles. Pregunta al final para engagement.',
}

const PILAR_GUIDANCE: Record<ContentPillar, string> = {
  educativo: 'Enseña algo útil y accionable. Estructura: problema → enseñanza → aplicación. No vender directamente.',
  entretenimiento: 'Entretiene mientras educa. Puede ser humor, curiosidades, comparaciones. Emocional.',
  venta: 'Muestra el valor concreto. Precio, beneficio, CTA claro. Sin rodeos. Urgencia si aplica.',
  comunidad: 'Genera conversación. Pregunta, comparte experiencia, hace partícipe a la audiencia.',
  detras_escena: 'Muestra el proceso real. Auténtico, sin pulir. Humaniza la marca.',
}

export async function generateCaptions(
  client: SocialClient,
  idea: string,
  pilar: ContentPillar,
  formato: PostFormat,
  platforms: Platform[],
): Promise<CaptionPackage> {
  const claude = getClient()

  const prompt = `Sos un experto en marketing de redes sociales para PYMEs argentinas. Generás contenido de alta calidad y engagement.

## Cliente
Nombre: ${client.nombre}
Rubro: ${client.rubro}
Propuesta de valor: ${client.brandVoice.propuestaValor}
Target: ${client.brandVoice.target}
Tono de marca: ${client.brandVoice.tono}
Palabras prohibidas: ${client.brandVoice.palabrasProhibidas.join(', ') || 'ninguna'}
Palabras clave: ${client.brandVoice.palabrasClave.join(', ')}
Nivel de emojis: ${client.brandVoice.emojiLevel}

## Contenido a crear
Idea/tema: ${idea}
Pilar de contenido: ${pilar} — ${PILAR_GUIDANCE[pilar]}
Formato: ${formato}

## Plataformas
${platforms.map(p => `### ${p.toUpperCase()}\n${PLATFORM_RULES[p]}`).join('\n\n')}

## Tarea
Genera las captions para cada plataforma. Adaptá el mensaje al contexto de cada plataforma manteniendo la esencia de la idea.
También generá:
- Un prompt en inglés para Freepik Mystic para generar la imagen visual del post
- La composición Remotion más apropiada si es un reel (opciones: TextAnim-Dolor, TextAnim-Stats, TextAnim-Urgencia, StatsReel, HookReel, BeforeAfterReel, Demo-Peluqueria, Demo-Clinica)

## Formato de respuesta (JSON estricto)
{
  "captions": [
    {
      "platform": "instagram",
      "hook": "primera línea gancho",
      "caption": "texto completo del post",
      "hashtags": ["#tag1", "#tag2"],
      "cta": "texto del llamado a la acción",
      "characterCount": 0
    }
  ],
  "freepikPrompt": "prompt en inglés para imagen",
  "remotionComposition": "nombre de la composición o null",
  "remotionProps": {}
}`

  const msg = await claude.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 3000,
    messages: [{ role: 'user', content: prompt }],
  })

  const text = (msg.content[0] as { text: string }).text
  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (!jsonMatch) throw new Error('El agente no devolvió JSON válido')

  const parsed = JSON.parse(jsonMatch[0]) as {
    captions: MultiPlatformCaption[]
    freepikPrompt: string
    remotionComposition?: string
    remotionProps?: Record<string, unknown>
  }

  return {
    idea,
    pilar,
    captions: parsed.captions,
    freepikPrompt: parsed.freepikPrompt,
    remotionComposition: parsed.remotionComposition,
    remotionProps: parsed.remotionProps ?? {},
  }
}

export async function generateMonthlyIdeas(
  client: SocialClient,
  month: string,
  postsPerWeek: number = 5
): Promise<{ fecha: string; idea: string; pilar: ContentPillar; formato: PostFormat; platforms: Platform[] }[]> {
  const claude = getClient()
  const totalPosts = postsPerWeek * 4

  const prompt = `Sos estratega de redes sociales para ${client.nombre} (${client.rubro}).
Target: ${client.brandVoice.target}
Propuesta de valor: ${client.brandVoice.propuestaValor}
Mix deseado: ${JSON.stringify(client.contentStrategy.mix)}
Plataformas: instagram, tiktok, linkedin

Generá ${totalPosts} ideas de contenido para ${month}.
Mix: 40% educativo, 30% entretenimiento, 20% venta, 10% comunidad.
Variedad de formatos: posts, reels, carruseles.
Ideas concretas y específicas al rubro, no genéricas.

Responde JSON:
[{
  "fecha": "YYYY-MM-DD",
  "idea": "descripción concreta de la idea",
  "pilar": "educativo|entretenimiento|venta|comunidad|detras_escena",
  "formato": "post|reel|carrusel|story",
  "platforms": ["instagram","tiktok"]
}]`

  const msg = await claude.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 4000,
    messages: [{ role: 'user', content: prompt }],
  })

  const text = (msg.content[0] as { text: string }).text
  const jsonMatch = text.match(/\[[\s\S]*\]/)
  if (!jsonMatch) throw new Error('El agente no devolvió lista JSON válida')

  return JSON.parse(jsonMatch[0])
}
