// ============================================================
// DIVINIA — Market Research Agent
// Analiza competencia, tendencias y oportunidades en Instagram
// ============================================================

import Anthropic from '@anthropic-ai/sdk'
import type { MarketResearch, Competitor } from './types'

const SYSTEM_PROMPT = `Sos el Agente de Investigación de Mercado de DIVINIA, una empresa de IA de San Luis, Argentina.
Tu trabajo es analizar el mercado de sistemas de turnos/agenda para PYMEs en Argentina, especialmente en Instagram.

DIVINIA vende sistemas de turnos con IA para:
- Peluquerías y estéticas
- Clínicas y consultorios médicos
- Veterinarias
- Talleres mecánicos
- Odontología
- Gimnasios
- Farmacias

Cuando analizás un rubro, buscás:
1. Quiénes son los competidores en Argentina que venden soluciones similares
2. Qué tipo de contenido funciona en Instagram para este nicho
3. Qué hashtags usan y cuáles tienen mejor engagement
4. Los mejores horarios para postear en Argentina (zona horaria ART, UTC-3)
5. Qué dolores/problemas del cliente resuenan más
6. Oportunidades de diferenciación para DIVINIA

Siempre respondés en JSON estructurado y en español argentino.
Usás "vos/sos/tenés" en los textos de marketing.
Priorizás acciones que generen ingresos directos.`

function getClient(): Anthropic {
  return new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
}

export async function researchMarket(rubro: string): Promise<MarketResearch> {
  const client = getClient()

  const prompt = `Analizá el mercado de sistemas de turnos online para ${rubro} en Argentina, con foco en Instagram.

Devolvé un JSON con esta estructura exacta:
{
  "competitors": [
    {
      "username": "@ejemplo",
      "estimatedFollowers": "5k-10k",
      "avgLikes": "50-100",
      "contentTypes": ["demos", "testimoniales", "educativo"],
      "postingFrequency": "3-4 veces/semana",
      "strengths": ["buen diseño", "casos reales"],
      "weaknesses": ["no muestran precios", "poca interacción"],
      "topHashtags": ["#turnos", "#agenda"]
    }
  ],
  "trends": [
    "descripción de tendencia 1",
    "descripción de tendencia 2"
  ],
  "bestHashtags": [
    "#turnos${rubro}",
    "#agendaonline",
    "#${rubro}argentina"
  ],
  "bestPostTimes": [
    "Lunes a Viernes: 9:00-11:00 y 19:00-21:00",
    "Sábados: 10:00-12:00"
  ],
  "contentIdeas": [
    "idea de contenido 1 con descripción detallada",
    "idea de contenido 2"
  ],
  "audienceInsights": [
    "insight sobre la audiencia 1",
    "insight sobre la audiencia 2"
  ],
  "opportunities": [
    "oportunidad de diferenciación 1",
    "oportunidad de diferenciación 2"
  ]
}

Incluí mínimo 3 competidores reales o representativos, 10 hashtags relevantes, 8 ideas de contenido y 5 oportunidades.
Solo devolvé el JSON, sin texto extra.`

  const response = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 2000,
    messages: [{ role: 'user', content: prompt }],
    system: SYSTEM_PROMPT,
  })

  const text = response.content[0].type === 'text' ? response.content[0].text : ''

  // Extraer JSON del response
  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (!jsonMatch) throw new Error('No se pudo parsear el JSON de investigación de mercado')

  const data = JSON.parse(jsonMatch[0])

  return {
    analyzedAt: new Date(),
    rubro,
    ...data,
  } as MarketResearch
}

export async function getCompetitorAnalysis(competitors: Competitor[]): Promise<string> {
  const client = getClient()

  const prompt = `Basándote en estos competidores que venden sistemas de turnos en Instagram:
${JSON.stringify(competitors, null, 2)}

Generá un análisis estratégico para DIVINIA con:
1. Sus principales fortalezas que debemos igualar o superar
2. Sus debilidades que podemos explotar
3. El gap de mercado donde DIVINIA puede destacarse
4. 3 acciones concretas para superar a la competencia en Instagram

Respondé en español argentino, directo y accionable. Máximo 400 palabras.`

  const response = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 600,
    messages: [{ role: 'user', content: prompt }],
  })

  return response.content[0].type === 'text' ? response.content[0].text : ''
}
