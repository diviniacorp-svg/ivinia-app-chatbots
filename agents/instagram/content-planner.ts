// ============================================================
// DIVINIA — Content Planner Agent
// Genera calendario de contenido mensual para Instagram
// ============================================================

import Anthropic from '@anthropic-ai/sdk'
import type { ContentCalendar, CalendarEntry, MarketResearch } from './types'

const SYSTEM_PROMPT = `Sos el Agente Planificador de Contenido de DIVINIA, empresa de IA de San Luis, Argentina.
Creás calendarios de contenido para Instagram orientados a vender sistemas de turnos a PYMEs.

MIX DE CONTENIDO OBLIGATORIO:
- 40% Educativo: dolores del cliente, soluciones, tips de gestión
- 30% Demo/Producto: mostrar el sistema funcionando por rubro
- 20% Prueba social: testimoniales, resultados, casos de éxito
- 10% Oferta/CTA: promociones, trial gratis, contacto directo

PRINCIPIOS:
- Cada post tiene un objetivo claro (educar, demostrar, cerrar)
- Los lunes y miércoles son los mejores días para educativo/demo
- Los viernes son buenos para CTAs y ofertas
- Los posts deben tener coherencia visual entre sí
- Siempre pensás en el embudo: awareness → consideración → decisión

Respondés en JSON estructurado y en español argentino.`

function getClient(): Anthropic {
  return new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
}

export async function planMonth(
  month: string,
  research?: MarketResearch,
  focusRubro?: string
): Promise<ContentCalendar> {
  const client = getClient()

  const researchContext = research
    ? `Investigación de mercado disponible:
- Mejores hashtags: ${research.bestHashtags.slice(0, 10).join(', ')}
- Mejores horarios: ${research.bestPostTimes.join(' | ')}
- Ideas identificadas: ${research.contentIdeas.slice(0, 5).join(' | ')}
- Oportunidades: ${research.opportunities.slice(0, 3).join(' | ')}`
    : 'No hay investigación previa disponible.'

  const prompt = `Creá un calendario de contenido para Instagram de DIVINIA para el mes ${month}.
${focusRubro ? `Foco especial en el rubro: ${focusRubro}` : 'Cubrir todos los rubros (peluquería, clínica, veterinaria, taller, odontología).'}

${researchContext}

Generá exactamente 20 posts para el mes (5 por semana, de lunes a viernes).

Devolvé un JSON con esta estructura:
{
  "posts": [
    {
      "dayOfMonth": 1,
      "dayOfWeek": "Lunes",
      "postType": "educativo",
      "format": "post",
      "rubro": "general",
      "idea": "título/concepto del post",
      "captionDraft": "caption completo listo para publicar, en español argentino, con llamada a la acción",
      "hashtags": ["#hashtag1", "#hashtag2"],
      "canvaPrompt": "descripción detallada en inglés para generar el diseño en Canva",
      "scheduledTime": "10:00",
      "priority": "alta"
    }
  ]
}

Reglas para los captions:
- Máximo 2200 caracteres
- Empezar con un hook (pregunta, dato impactante o frase poderosa)
- Incluir emoji moderado (no más de 5 por post)
- CTA claro al final
- Usar "vos/sos/tenés" (español argentino)
- Para posts de demo, mencionar el rubro específico

Reglas para canvaPrompt:
- En inglés
- Descripción visual detallada: colores, tipografía, elementos, mood
- Siempre incluir: dark background, purple/violet #6366f1 accents, minimalist tech aesthetic

Solo devolvé el JSON, sin texto extra.`

  const response = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 4000,
    messages: [{ role: 'user', content: prompt }],
    system: SYSTEM_PROMPT,
  })

  const text = response.content[0].type === 'text' ? response.content[0].text : ''
  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (!jsonMatch) throw new Error('No se pudo parsear el JSON del calendario')

  const data = JSON.parse(jsonMatch[0])

  return {
    month,
    posts: data.posts as CalendarEntry[],
  }
}

export async function planWeek(
  weekNumber: number,
  month: string,
  previousPerformance?: { bestPostType: string; bestRubro: string }
): Promise<CalendarEntry[]> {
  const client = getClient()

  const perfContext = previousPerformance
    ? `La semana pasada funcionó mejor: tipo "${previousPerformance.bestPostType}", rubro "${previousPerformance.bestRubro}". Aprovechalo.`
    : ''

  const prompt = `Creá el plan de contenido para la semana ${weekNumber} de ${month} en Instagram de DIVINIA.
${perfContext}

Generá 5 posts (lunes a viernes) en JSON:
{
  "posts": [ ... ]
}

Seguí el mix: 2 educativos, 1-2 demos de rubro, 1 social proof o CTA.
Misma estructura que el plan mensual. Solo el JSON.`

  const response = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 2000,
    messages: [{ role: 'user', content: prompt }],
    system: SYSTEM_PROMPT,
  })

  const text = response.content[0].type === 'text' ? response.content[0].text : ''
  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (!jsonMatch) throw new Error('No se pudo parsear el JSON de la semana')

  const data = JSON.parse(jsonMatch[0])
  return data.posts as CalendarEntry[]
}
