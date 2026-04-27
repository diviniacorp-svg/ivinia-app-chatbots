import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

/**
 * GET /api/content/next-post
 * Devuelve el próximo post del content_calendar listo para publicar.
 * n8n llama este endpoint al comienzo del workflow.
 *
 * Criterios: status = 'listo', fecha <= hoy, plataforma = 'instagram'
 * Orden: fecha ASC (publica el más viejo primero, catch-up automático)
 */
export async function GET() {
  const db = createAdminClient()
  const today = new Date().toISOString().split('T')[0]

  const { data, error } = await db
    .from('content_calendar')
    .select('id, titulo, caption, hashtags, prompt_imagen, imagen_url, tipo, fecha')
    .eq('status', 'listo')
    .eq('plataforma', 'instagram')
    .lte('fecha', today)
    .order('fecha', { ascending: true })
    .limit(1)
    .single()

  if (error || !data) {
    return NextResponse.json({ post: null, message: 'No hay posts listos para publicar' })
  }

  return NextResponse.json({ post: data })
}
