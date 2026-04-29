// ============================================================
// DIVINIA — Render imágenes Mes 1 con Remotion (InstaPost-Gen)
// Mucho más rápido que Freepik: ~15s por imagen, branding DIVINIA consistente
// Run: node scripts/render-month1-images.mjs
// ============================================================

import { createClient } from '@supabase/supabase-js'
import { execSync } from 'child_process'
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs'
import { join } from 'path'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SUPABASE_KEY) { console.error('❌ Faltan SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY en .env.local'); process.exit(1) }
const SOCIAL_CLIENT_ID = '857cef01-16a1-4034-8286-1b9e44dcfda3'
const STORAGE_BUCKET = 'instagram-media'
const STORAGE_BASE = `${SUPABASE_URL}/storage/v1/object/public/${STORAGE_BUCKET}`
const TMP_DIR = 'C:\\divinia\\tmp\\posts'

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

// Map pilar → accent color para InstaPost
const PILAR_ACCENT = {
  educativo: 'violet',
  venta: 'lime',
  entretenimiento: 'coral',
  comunidad: 'lime',
  detras_escena: 'violet',
}

const PILAR_BADGE = {
  educativo: 'Sabías que',
  venta: 'Oferta DIVINIA',
  entretenimiento: 'Esto te pasa',
  comunidad: 'Para vos',
  detras_escena: 'Así trabajamos',
}

function makeHeadline(caption, pilar) {
  // Get first meaningful line (non-empty, > 5 chars)
  const lines = caption.split('\n').map(l => l.trim()).filter(l => l.length > 3)
  const firstLine = lines[0] ?? 'DIVINIA'

  // Remove trailing punctuation types that don't look good in big text
  const clean = firstLine.replace(/^#+\s*/, '').trim()

  // Target: max 30 chars, split into 2 lines at a word boundary ~15 chars
  if (clean.length <= 18) return clean

  // Find best split point
  const words = clean.split(' ')
  let line1 = ''
  let line2 = ''
  for (let i = 0; i < words.length; i++) {
    const attempt = [...words.slice(0, i + 1)].join(' ')
    if (attempt.length <= 16) {
      line1 = attempt
    } else {
      line2 = words.slice(i).join(' ')
      break
    }
  }

  if (!line2) return clean.slice(0, 30)

  // Truncate line2 if needed
  if (line2.length > 22) line2 = line2.slice(0, 20) + '…'
  return `${line1}\n${line2}`
}

function makeSub(caption, pilar) {
  const lines = caption.split('\n').map(l => l.trim()).filter(l => l.length > 3)
  // Use second line if available
  const sub = lines[1] ?? lines[0] ?? ''
  if (sub.length > 55) return sub.slice(0, 52) + '…'
  return sub
}

async function uploadToStorage(filePath, slug) {
  const buffer = readFileSync(filePath)
  const storagePath = `posts/month1/${slug}.png`
  const res = await fetch(`${SUPABASE_URL}/storage/v1/object/${STORAGE_BUCKET}/${storagePath}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'image/png',
      'x-upsert': 'true',
    },
    body: buffer,
  })
  if (!res.ok) {
    const txt = await res.text()
    throw new Error(`Storage upload failed: ${txt}`)
  }
  return `${STORAGE_BASE}/${storagePath}`
}

async function renderPost(row) {
  const { id, titulo, caption, pilar, fecha } = row
  const slug = titulo.replace(/[^a-z0-9]/gi, '-').slice(0, 30).toLowerCase() || id.slice(0, 8)

  // Build props
  const headline = makeHeadline(caption ?? titulo, pilar)
  const sub = makeSub(caption ?? '', pilar)
  const badge = PILAR_BADGE[pilar] ?? 'DIVINIA'
  const accent = PILAR_ACCENT[pilar] ?? 'lime'

  const propsObj = { headline, sub, badge, accent, dark: true }
  const outFile = join(TMP_DIR, `${fecha}-${slug}.png`)
  const propsFile = join(TMP_DIR, `${fecha}-${slug}-props.json`)

  console.log(`  headline: "${headline.replace(/\n/, ' / ')}"`)
  console.log(`  sub: "${sub.slice(0, 50)}"`)

  // Write props to JSON file (avoids Windows quote escaping issues)
  writeFileSync(propsFile, JSON.stringify(propsObj), 'utf8')

  // Render with Remotion — use props file path
  const cmd = `npx remotion still remotion/Root.tsx InstaPost-Gen --output "${outFile}" --props "${propsFile}"`
  execSync(cmd, { timeout: 120000, stdio: 'pipe', cwd: 'C:/divinia' })

  if (!existsSync(outFile)) throw new Error(`Remotion did not produce output file: ${outFile}`)

  // Upload to Supabase Storage
  const publicUrl = await uploadToStorage(outFile, `${fecha}-${slug}`)
  console.log(`  uploaded: ${publicUrl}`)

  // Update DB
  const { error } = await supabase
    .from('content_calendar')
    .update({ imagen_url: publicUrl, status: 'listo', updated_at: new Date().toISOString() })
    .eq('id', id)
  if (error) throw new Error(`DB update: ${error.message}`)

  return publicUrl
}

async function main() {
  // Ensure tmp dir
  if (!existsSync(TMP_DIR)) mkdirSync(TMP_DIR, { recursive: true })

  console.log('🎨 Renderizando imágenes con Remotion (InstaPost-Gen)...\n')

  // Query posts without images
  const { data: posts, error } = await supabase
    .from('content_calendar')
    .select('id, titulo, caption, pilar, fecha, tipo')
    .eq('social_client_id', SOCIAL_CLIENT_ID)
    .is('imagen_url', null)
    .gte('fecha', '2026-04-28')
    .lte('fecha', '2026-05-23')
    .order('fecha')

  if (error) throw new Error(`DB query: ${error.message}`)
  console.log(`📋 ${posts.length} posts sin imagen\n`)

  let ok = 0, failed = 0
  const errors = []

  for (let i = 0; i < posts.length; i++) {
    const row = posts[i]
    console.log(`[${i + 1}/${posts.length}] ${row.fecha} — ${row.pilar} — ${row.tipo}`)
    try {
      await renderPost(row)
      console.log(`  ✅ Listo!\n`)
      ok++
    } catch (err) {
      console.log(`  ❌ Error: ${err.message}\n`)
      failed++
      errors.push(`${row.fecha}: ${err.message}`)
    }
  }

  console.log('='.repeat(50))
  console.log(`✅ ${ok} imágenes renderizadas`)
  console.log(`❌ ${failed} errores`)
  if (errors.length) errors.forEach(e => console.log(`  - ${e}`))
  console.log('\n✅ Ver resultados en: http://localhost:4000/redes')
}

main().catch(err => { console.error('Fatal:', err.message); process.exit(1) })
