// ============================================================
// DIVINIA — Genera imágenes para los 20 posts del Mes 1
// Corre en background: node scripts/generate-month1-images.mjs
// Lee los prompt_imagen del DB, genera con Freepik, sube a Storage, actualiza DB.
// ============================================================

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://dsekibwfbbxnglvcirso.supabase.co'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRzZWtpYndmYmJ4bmdsdmNpcnNvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjU4NzI5NSwiZXhwIjoyMDg4MTYzMjk1fQ.xvXr3io984MXhGFWkDHfYIO406uwcG0buO-rn0Vy6co'
const FREEPIK_KEY = 'FPSX325d002fb05215d6e80b10fce8caf1cf'
const STORAGE_BUCKET = 'instagram-media'
const STORAGE_BASE = `${SUPABASE_URL}/storage/v1/object/public/${STORAGE_BUCKET}`

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)
const delay = ms => new Promise(r => setTimeout(r, ms))

function log(msg) { process.stdout.write(msg + '\n') }

async function freepikStart(prompt) {
  const res = await fetch('https://api.freepik.com/v1/ai/mystic', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-freepik-api-key': FREEPIK_KEY },
    body: JSON.stringify({
      prompt,
      aspect_ratio: 'square_1_1',
      output_format: 'JPG',
      num_images: 1,
      model: 'realism',
      engine: 'magnific_sharpy',
    }),
  })
  const data = await res.json()
  const taskId = data?.data?.task_id ?? data?.data?.id
  if (!taskId) throw new Error(`No task_id: ${JSON.stringify(data).slice(0, 200)}`)
  return taskId
}

async function freepikPoll(taskId, maxPolls = 90) {
  for (let i = 1; i <= maxPolls; i++) {
    await delay(5000)
    const res = await fetch(`https://api.freepik.com/v1/ai/mystic/${taskId}`, {
      headers: { 'x-freepik-api-key': FREEPIK_KEY },
    })
    const data = await res.json()
    const inner = data?.data ?? data
    const status = inner?.status
    if (i % 5 === 0) log(`  ↻ Poll ${i}: ${status}`)
    if (status === 'COMPLETED') {
      const gen = inner?.generated
      if (!gen?.length) throw new Error('COMPLETED but no images')
      const item = gen[0]
      return typeof item === 'string' ? item : (item?.url ?? item?.base64)
    }
    if (status === 'FAILED' || status === 'ERROR') throw new Error(`Freepik failed: ${JSON.stringify(inner)}`)
  }
  throw new Error(`Timeout after ${maxPolls * 5}s`)
}

async function uploadToStorage(buffer, slug) {
  const path = `posts/month1/${slug}.jpg`
  const res = await fetch(`${SUPABASE_URL}/storage/v1/object/${STORAGE_BUCKET}/${path}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'image/jpeg',
      'x-upsert': 'true',
    },
    body: buffer,
  })
  if (!res.ok) throw new Error(`Storage upload: ${await res.text()}`)
  return `${STORAGE_BASE}/${path}`
}

async function processPost(row) {
  log(`\n[${row.fecha}] ${row.titulo}`)
  log(`  Prompt: ${row.prompt_imagen.slice(0, 80)}...`)

  const taskId = await freepikStart(row.prompt_imagen)
  log(`  Task: ${taskId}`)

  const imgUrlOrBase64 = await freepikPoll(taskId)

  let buffer
  if (imgUrlOrBase64.startsWith('data:')) {
    buffer = Buffer.from(imgUrlOrBase64.split(',')[1], 'base64')
  } else {
    const imgRes = await fetch(imgUrlOrBase64)
    if (!imgRes.ok) throw new Error(`Download failed: ${imgRes.status}`)
    buffer = Buffer.from(await imgRes.arrayBuffer())
  }
  log(`  Downloaded: ${Math.round(buffer.length / 1024)}KB`)

  const publicUrl = await uploadToStorage(buffer, row.titulo)
  log(`  Uploaded: ${publicUrl}`)

  const { error } = await supabase
    .from('content_calendar')
    .update({ imagen_url: publicUrl, status: 'listo', updated_at: new Date().toISOString() })
    .eq('id', row.id)
  if (error) throw new Error(`DB update: ${error.message}`)
  log(`  ✅ Listo!`)
  return publicUrl
}

async function main() {
  log('🎨 Generando imágenes para posts Mes 1...\n')

  const { data: posts, error } = await supabase
    .from('content_calendar')
    .select('id, fecha, titulo, prompt_imagen')
    .eq('social_client_id', '857cef01-16a1-4034-8286-1b9e44dcfda3')
    .is('imagen_url', null)
    .not('prompt_imagen', 'is', null)
    .gte('fecha', '2026-04-28')
    .lte('fecha', '2026-05-23')
    .order('fecha')

  if (error) throw new Error(`DB query: ${error.message}`)
  log(`${posts.length} posts sin imagen encontrados\n`)

  const results = { ok: 0, failed: 0, errors: [] }

  for (let i = 0; i < posts.length; i++) {
    const row = posts[i]
    log(`[${i + 1}/${posts.length}]`)
    try {
      await processPost(row)
      results.ok++
    } catch (err) {
      log(`  ❌ Error: ${err.message}`)
      results.failed++
      results.errors.push(`${row.titulo}: ${err.message}`)
    }
    // Respect Freepik rate limits
    if (i < posts.length - 1) await delay(3000)
  }

  log('\n' + '='.repeat(50))
  log(`✅ ${results.ok} imágenes generadas`)
  log(`❌ ${results.failed} errores`)
  if (results.errors.length) {
    log('\nErrores:')
    results.errors.forEach(e => log('  - ' + e))
  }
}

main().catch(err => { log(`Fatal: ${err.message}`); process.exit(1) })
