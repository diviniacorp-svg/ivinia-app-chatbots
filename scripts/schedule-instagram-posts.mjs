/**
 * Asigna publish_at a los 9 posts de lanzamiento
 * Escalonados: 1 por día a las 9am ART (12:00 UTC)
 * Run: node scripts/schedule-instagram-posts.mjs
 */

const SUPABASE_URL = 'https://dsekibwfbbxnglvcirso.supabase.co'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRzZWtpYndmYmJ4bmdsdmNpcnNvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjU4NzI5NSwiZXhwIjoyMDg4MTYzMjk1fQ.xvXr3io984MXhGFWkDHfYIO406uwcG0buO-rn0Vy6co'

const headers = {
  apikey: SUPABASE_KEY,
  Authorization: `Bearer ${SUPABASE_KEY}`,
  'Content-Type': 'application/json',
}

// Horarios: 9am ART = 12:00 UTC (lun, mié, vie, lun, mié, vie, mar, jue, sáb)
// Empieza el 30/04/2026 (mié)
const SCHEDULE = [
  '2026-04-30T12:00:00+00:00', // 01 — miércoles
  '2026-05-02T12:00:00+00:00', // 02 — viernes
  '2026-05-04T12:00:00+00:00', // 03 — domingo (más tranquilo para posts de dolor)
  '2026-05-05T12:00:00+00:00', // 04 — lunes (empezar semana fuerte)
  '2026-05-07T12:00:00+00:00', // 05 — miércoles
  '2026-05-09T12:00:00+00:00', // 06 — viernes
  '2026-05-11T12:00:00+00:00', // 07 — domingo (testimonial)
  '2026-05-13T12:00:00+00:00', // 08 — martes
  '2026-05-15T12:00:00+00:00', // 09 — jueves (CTA final)
]

const POST_PATTERNS = [
  '01 — DIVINIA',
  '02 — Turnero',
  '03 — Pain',
  '04 — Central IA',
  '05 — Content Factory',
  '06 — Proceso',
  '07 — Testimonial',
  '08 — San Luis',
  '09 — CTA',
]

async function run() {
  console.log('📅 Asignando horarios de publicación...\n')

  // Fetch los posts que sembramos
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/content_calendar?titulo=like.0*&select=id,titulo&order=titulo.asc`,
    { headers }
  )
  const posts = await res.json()

  if (!Array.isArray(posts) || posts.length === 0) {
    console.log('❌ No se encontraron posts. Corré seed-instagram-posts.mjs primero.')
    return
  }

  // Ordenar por titulo para garantizar el orden
  const sorted = posts
    .filter(p => POST_PATTERNS.some(pat => p.titulo?.startsWith(pat.split('—')[0].trim())))
    .sort((a, b) => a.titulo.localeCompare(b.titulo))

  console.log(`Encontré ${sorted.length} posts:\n`)

  for (let i = 0; i < sorted.length && i < SCHEDULE.length; i++) {
    const post = sorted[i]
    const publishAt = SCHEDULE[i]

    const upd = await fetch(
      `${SUPABASE_URL}/rest/v1/content_calendar?id=eq.${post.id}`,
      {
        method: 'PATCH',
        headers: { ...headers, Prefer: 'return=minimal' },
        body: JSON.stringify({ publish_at: publishAt }),
      }
    )

    const date = new Date(publishAt).toLocaleString('es-AR', {
      weekday: 'short', day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit',
    })

    if (upd.ok || upd.status === 204) {
      console.log(`  ✅ ${post.titulo.slice(0, 45).padEnd(45)} → ${date}`)
    } else {
      const err = await upd.text()
      console.log(`  ❌ ${post.titulo.slice(0, 40)} → ${err.slice(0, 80)}`)
    }
  }

  console.log('\n✅ Listo — los posts se publicarán automáticamente en los horarios indicados.')
}

run().catch(console.error)
