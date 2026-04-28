// ============================================================
// DIVINIA Social Agency — Strategist Agent
// Plans 30-day content calendar for any client
// ============================================================

import { createAdminClient } from '@/lib/supabase'
import { generateMonthlyIdeas, generateCaptions } from './creator'
import type { SocialClient, Platform, ContentPillar, PostFormat, MonthlyCalendarPlan, CalendarEntry } from './types'

export async function planMonthlyCalendar(
  client: SocialClient,
  month: string,  // "YYYY-MM"
  platforms: Platform[],
  postsPerWeek: number = 5,
): Promise<MonthlyCalendarPlan> {
  const db = createAdminClient()

  // Generate raw ideas
  const ideas = await generateMonthlyIdeas(client, month, postsPerWeek)

  const entries: CalendarEntry[] = []

  for (const idea of ideas) {
    const captionPkg = await generateCaptions(
      client,
      idea.idea,
      idea.pilar as ContentPillar,
      idea.formato as PostFormat,
      idea.platforms as Platform[],
    )

    const bestCaption = captionPkg.captions.find(c => c.platform === 'instagram')
      ?? captionPkg.captions[0]

    entries.push({
      dayOfMonth: parseInt(idea.fecha.split('-')[2]),
      dayOfWeek: new Date(idea.fecha).toLocaleDateString('es-AR', { weekday: 'long' }),
      fecha: idea.fecha,
      platforms: idea.platforms as Platform[],
      pilar: idea.pilar as ContentPillar,
      formato: idea.formato as PostFormat,
      idea: idea.idea,
      captionDraft: bestCaption?.caption ?? '',
      hashtags: bestCaption?.hashtags ?? [],
      remotionComposition: captionPkg.remotionComposition,
      scheduledTime: client.contentStrategy.postingTimes.instagram ?? '09:00',
      priority: idea.pilar === 'venta' ? 'alta' : idea.pilar === 'educativo' ? 'media' : 'baja',
    })

    // Insert into content_calendar
    const [hourStr, minStr] = (client.contentStrategy.postingTimes.instagram ?? '09:00').split(':')
    const publishAt = new Date(`${idea.fecha}T${hourStr.padStart(2,'0')}:${minStr.padStart(2,'0')}:00-03:00`)

    await db.from('content_calendar').insert({
      social_client_id: client.id,
      fecha: idea.fecha,
      publish_at: publishAt.toISOString(),
      plataforma: idea.platforms[0],
      tipo: idea.formato,
      pilar: idea.pilar,
      titulo: idea.idea.slice(0, 100),
      caption: bestCaption?.caption ?? '',
      hashtags: bestCaption?.hashtags.join(' ') ?? '',
      prompt_imagen: captionPkg.freepikPrompt,
      remotion_composition: captionPkg.remotionComposition,
      remotion_props: captionPkg.remotionProps ?? {},
      status: 'planificado',
      generado_por: 'ia',
    })
  }

  const mix = {
    educativo: Math.round((entries.filter(e => e.pilar === 'educativo').length / entries.length) * 100),
    entretenimiento: Math.round((entries.filter(e => e.pilar === 'entretenimiento').length / entries.length) * 100),
    venta: Math.round((entries.filter(e => e.pilar === 'venta').length / entries.length) * 100),
    comunidad: Math.round((entries.filter(e => e.pilar === 'comunidad').length / entries.length) * 100),
  }

  return {
    socialClientId: client.id,
    month,
    generatedAt: new Date(),
    posts: entries,
    strategicSummary: `Calendario de ${entries.length} posts para ${month}. Mix: ${JSON.stringify(mix)}.`,
    contentMix: mix,
  }
}
