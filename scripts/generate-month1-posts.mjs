// ============================================================
// DIVINIA — Generador de Mes 1 (28 Abr – 23 May 2026)
// 20 posts estratégicos con imágenes, captions y hashtags
// Run: node scripts/generate-month1-posts.mjs
// ============================================================

import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY
const FREEPIK_KEY = process.env.FREEPIK_API_KEY
const SOCIAL_CLIENT_ID = '857cef01-16a1-4034-8286-1b9e44dcfda3'
const STORAGE_BUCKET = 'instagram-media'
const STORAGE_BASE = `${SUPABASE_URL}/storage/v1/object/public/${STORAGE_BUCKET}`

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)
const claude = new Anthropic({ apiKey: ANTHROPIC_KEY })

// ── 20-post plan ─────────────────────────────────────────────
const MONTH1_PLAN = [
  // SEMANA 1: EL PROBLEMA
  { fecha: '2026-04-28', tipo: 'reel',     pilar: 'educativo',      slug: 'w1-problema-hook',      concepto: 'Hook viral: "Tu competencia te está ganando… y vos ni lo sabés." Dolor: negocios sin IA pierden clientes porque nadie responde WhatsApp de noche, no hay sistema de turnos, todo es manual y caótico.' },
  { fecha: '2026-04-29', tipo: 'post',     pilar: 'educativo',      slug: 'w1-clientes-perdidos',  concepto: '3 tipos de cliente que perdiste hoy sin saberlo: el que preguntó a las 11pm, el que llamó y no atendiste, el que buscó turno y no encontró cómo sacar.' },
  { fecha: '2026-04-30', tipo: 'carrusel', pilar: 'educativo',      slug: 'w1-costo-sin-chatbot',  concepto: 'Cálculo real: ¿cuánto cuesta NO tener un chatbot? 5 slides con el cálculo: clientes perdidos × ticket promedio = plata que se va cada mes.' },
  { fecha: '2026-05-01', tipo: 'post',     pilar: 'comunidad',      slug: 'w1-pregunta-dolor',     concepto: 'Pregunta de engagement: "¿Cuál es tu mayor dolor administrando tu negocio?" con 4 opciones: A) Turnos B) WhatsApp C) Redes D) Todos.' },
  { fecha: '2026-05-02', tipo: 'reel',     pilar: 'entretenimiento', slug: 'w1-dia-sin-vs-con',    concepto: 'Comparativa divertida: "Un día en el negocio SIN IA" (caos, estrés, cosas sin responder) vs "CON IA" (todo fluye, el dueño sonríe). Tono cercano y algo de humor.' },
  // SEMANA 2: LA SOLUCIÓN
  { fecha: '2026-05-05', tipo: 'post',     pilar: 'educativo',      slug: 'w2-divinia-llego',      concepto: 'Presentación oficial de DIVINIA en San Luis: "La primera agencia de IA para PYMEs de San Luis". Qué hacemos, para quién, y por qué ahora.' },
  { fecha: '2026-05-06', tipo: 'reel',     pilar: 'educativo',      slug: 'w2-demo-turnero',       concepto: 'Demo del Turnero IA: paso a paso en pantalla — cliente pide turno por WhatsApp, sistema confirma automáticamente, recordatorio 24h antes, seña por MercadoPago.' },
  { fecha: '2026-05-07', tipo: 'carrusel', pilar: 'venta',          slug: 'w2-3-productos',        concepto: '3 productos DIVINIA en 3 slides: Turnero IA (para negocios con turnos), Chatbot 24hs (para cualquier negocio), Contenido IA (para redes sociales). Precio y beneficio de cada uno.' },
  { fecha: '2026-05-08', tipo: 'post',     pilar: 'entretenimiento', slug: 'w2-10-horas',          concepto: '¿Qué harías con 10 horas más por semana? Pregunta aspiracional con respuestas divertidas. Generar comentarios. Conectar con la solución al final.' },
  { fecha: '2026-05-09', tipo: 'reel',     pilar: 'educativo',      slug: 'w2-chatbot-3am',        concepto: 'El chatbot que trabaja mientras dormís: demo mostrando WhatsApp a las 3am, cliente pregunta, chatbot responde al instante. "Tu negocio nunca cierra."' },
  // SEMANA 3: LOS RESULTADOS
  { fecha: '2026-05-12', tipo: 'post',     pilar: 'educativo',      slug: 'w3-caso-peluqueria',    concepto: 'Caso de uso peluquería con Turnero IA: 0 turnos perdidos, 40% menos ausencias, el dueño ya no atiende el teléfono todo el día. Resultados concretos.' },
  { fecha: '2026-05-13', tipo: 'carrusel', pilar: 'educativo',      slug: 'w3-5-cosas-chatbot',    concepto: '5 cosas que tu chatbot DIVINIA hace mientras dormís: 1) Responde consultas 2) Toma turnos 3) Califica leads 4) Envía precios 5) Agenda reuniones.' },
  { fecha: '2026-05-14', tipo: 'reel',     pilar: 'entretenimiento', slug: 'w3-reaccion-clinica',  concepto: 'Reacción en vivo: probamos el chatbot DIVINIA en una clínica de San Luis. Estilo "unboxing". Dueño reacciona al ver su chatbot responder en tiempo real.' },
  { fecha: '2026-05-15', tipo: 'post',     pilar: 'comunidad',      slug: 'w3-historia-martina',   concepto: 'Historia de Martina: dueña de centro estético en San Luis. Storytelling en primera persona sobre cómo DIVINIA cambió su semana.' },
  { fecha: '2026-05-16', tipo: 'carrusel', pilar: 'venta',          slug: 'w3-antes-despues',      concepto: 'Antes/Después: negocio sin DIVINIA vs con DIVINIA. 6 slides: atención al cliente, agenda, redes, costos, tiempo libre, crecimiento.' },
  // SEMANA 4: LA OFERTA
  { fecha: '2026-05-19', tipo: 'post',     pilar: 'venta',          slug: 'w4-precio-claro',       concepto: 'Post de precio directo: "Todo DIVINIA. 14 días gratis. Sin tarjeta." Diseño editorial limpio. Tono sin rodeos. Precio claro. Beneficios puntuales.' },
  { fecha: '2026-05-20', tipo: 'reel',     pilar: 'venta',          slug: 'w4-14-dias',            concepto: '14 días gratis, sin tarjeta, sin contrato. ¿Por qué no probarlo? Reel rápido con objeciones y respuestas directas. CTA fuerte al final.' },
  { fecha: '2026-05-21', tipo: 'carrusel', pilar: 'venta',          slug: 'w4-vs-empleado',        concepto: 'DIVINIA vs contratar un empleado: 5 slides comparando costos, disponibilidad 24/7 vs 8hs, escalabilidad, sin RRHH, ROI al mes 3.' },
  { fecha: '2026-05-22', tipo: 'post',     pilar: 'comunidad',      slug: 'w4-san-luis-para-vos',  concepto: '"San Luis, esto es para vos." Pedir que etiqueten el negocio local que necesita DIVINIA. Tono cercano, sanlimense. Generar menciones.' },
  { fecha: '2026-05-23', tipo: 'reel',     pilar: 'venta',          slug: 'w4-cierre-mes1',        concepto: 'Cierre del primer mes: agradecimiento a la comunidad, resumen de lo que es DIVINIA, y CTA final poderoso. Tono emocional-motivacional. "El camino empieza hoy."' },
]

// ── Helpers ───────────────────────────────────────────────────
const delay = ms => new Promise(r => setTimeout(r, ms))

function log(emoji, msg) {
  console.log(`${emoji} ${msg}`)
}

async function uploadToSupabase(buffer, filename, contentType = 'image/jpeg') {
  const path = `posts/month1/${filename}`
  const res = await fetch(`${SUPABASE_URL}/storage/v1/object/${STORAGE_BUCKET}/${path}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${SUPABASE_KEY}`,
      'Content-Type': contentType,
      'x-upsert': 'true',
    },
    body: buffer,
  })
  if (!res.ok) {
    const txt = await res.text()
    throw new Error(`Supabase upload failed: ${txt}`)
  }
  return `${STORAGE_BASE}/${path}`
}

async function freepikGenerate(prompt) {
  const res = await fetch('https://api.freepik.com/v1/ai/mystic', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-freepik-api-key': FREEPIK_KEY,
    },
    body: JSON.stringify({
      prompt,
      aspect_ratio: 'square_1_1',
      output_format: 'JPG',
      num_images: 1,
    }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(`Freepik start failed: ${JSON.stringify(data)}`)
  const taskId = data?.data?.task_id ?? data?.data?.id
  if (!taskId) throw new Error(`No task ID from Freepik: ${JSON.stringify(data)}`)
  return taskId
}

async function freepikPoll(taskId) {
  for (let i = 0; i < 30; i++) {
    await delay(5000)
    const res = await fetch(`https://api.freepik.com/v1/ai/mystic/${taskId}`, {
      headers: { 'x-freepik-api-key': FREEPIK_KEY },
    })
    const data = await res.json()
    const inner = data?.data ?? data
    const status = inner?.status
    log('  ↻', `Poll ${i + 1}: ${status}`)
    if (status === 'COMPLETED') {
      const generated = inner?.generated
      if (!generated?.length) throw new Error('Freepik: no generated images')
      const item = generated[0]
      const url = typeof item === 'string' ? item : item?.url ?? item?.base64
      if (!url) throw new Error(`Freepik: unexpected item format: ${JSON.stringify(item)}`)
      return url
    }
    if (status === 'FAILED' || status === 'ERROR') throw new Error(`Freepik task failed: ${JSON.stringify(data)}`)
  }
  throw new Error('Freepik timeout after 2.5 min')
}

async function generateImage(prompt, slug) {
  log('🎨', `Generando imagen: ${slug}`)
  const taskId = await freepikGenerate(prompt)
  log('⏳', `Task ${taskId} — esperando resultado...`)
  const imageUrlOrBase64 = await freepikPoll(taskId)

  let buffer
  if (imageUrlOrBase64.startsWith('data:')) {
    // base64
    const base64Data = imageUrlOrBase64.split(',')[1]
    buffer = Buffer.from(base64Data, 'base64')
  } else {
    // URL — download it
    const imgRes = await fetch(imageUrlOrBase64)
    if (!imgRes.ok) throw new Error(`Failed to download image: ${imgRes.status}`)
    buffer = Buffer.from(await imgRes.arrayBuffer())
  }

  const publicUrl = await uploadToSupabase(buffer, `${slug}.jpg`)
  log('✅', `Subida: ${publicUrl}`)
  return publicUrl
}

// ── Step 1: Generate captions with Claude (in batches) ────────
const BRAND_CONTEXT = `Sos un experto en marketing de redes sociales para PYMEs argentinas. Generás contenido de alta calidad para DIVINIA.

## DIVINIA — Contexto de marca
- Empresa: Agencia de IA para PYMEs argentinas
- Misión: Automatizar el caos de los negocios locales con IA (turnos, chatbots, contenido)
- Target: Dueños de PYMEs en San Luis (peluquerías, clínicas, restaurantes, comercios, etc.)
- Tono: Directo, cercano, inteligente. Habla de vos/sos/tenés. Sin formal. Sin corporativo.
- Productos: Turnero IA, Chatbot 24hs, Contenido IA. Plan Todo DIVINIA: $19.900/mes
- CTA principal: "Probá 14 días gratis en divinia.vercel.app"
- Emojis: usar moderadamente, máx 5 por post

## Reglas por formato
- POST: hook fuerte en línea 1, cuerpo con valor, CTA al final. Máx 2200 chars. 10-15 hashtags.
- REEL: caption corto máx 150 chars. Hook brutal. 3-5 hashtags.
- CARRUSEL: caption con "deslizá →". 8-12 hashtags.`

async function generateBatch(posts, offset) {
  const items = posts.map((p, i) => ({
    n: offset + i + 1,
    fecha: p.fecha,
    tipo: p.tipo,
    pilar: p.pilar,
    concepto: p.concepto.slice(0, 200),
  }))

  const prompt = `${BRAND_CONTEXT}

## Posts a generar (${posts.length} items)
${items.map(p => `${p.n}. [${p.tipo}/${p.pilar}] ${p.fecha}: ${p.concepto}`).join('\n')}

## Respuesta: JSON array, sin markdown, sin texto extra
Devolvé ÚNICAMENTE el array JSON. Cada item:
{
  "n": number,
  "caption": "texto en español argentino (sin comillas dobles internas — usá comillas simples si necesitás)",
  "hashtags": ["#tag1","#tag2"],
  "cta": "llamado a la acción corto",
  "freepikPrompt": "scene in english: dark studio background, lime green neon light accents, [specific visual for this post], modern tech aesthetic, cinematic lighting, square format"
}`

  const msg = await claude.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 6000,
    messages: [{ role: 'user', content: prompt }],
  })

  const text = msg.content[0].text
  // Try to extract JSON array
  const jsonMatch = text.match(/\[[\s\S]*\]/)
  if (!jsonMatch) {
    console.error('Respuesta raw:\n', text.slice(0, 800))
    throw new Error('Claude no devolvió JSON array')
  }
  try {
    return JSON.parse(jsonMatch[0])
  } catch (err) {
    // Try to sanitize — sometimes Claude uses unescaped quotes in values
    const sanitized = jsonMatch[0]
      .replace(/[ -]/g, ' ') // strip control chars
    return JSON.parse(sanitized)
  }
}

async function generateAllCaptions(plan) {
  log('🤖', 'Generando captions con Claude (2 batches de 10)...')
  const batch1 = await generateBatch(plan.slice(0, 10), 0)
  log('✅', `Batch 1 ok (${batch1.length} captions)`)
  await delay(3000)
  const batch2 = await generateBatch(plan.slice(10), 10)
  log('✅', `Batch 2 ok (${batch2.length} captions)`)
  return [...batch1, ...batch2]
}

// ── Step 2: Insert into content_calendar ─────────────────────
async function insertPost({ post, caption, hashtags, freepikPrompt, imageUrl }) {
  const hashtagStr = Array.isArray(hashtags) ? hashtags.join(' ') : hashtags
  // Publish at noon Argentina time (UTC-3 = 15:00 UTC)
  const publishAt = `${post.fecha}T15:00:00Z`
  const { error } = await supabase.from('content_calendar').insert({
    social_client_id: SOCIAL_CLIENT_ID,
    fecha: post.fecha,
    plataforma: 'instagram',
    tipo: post.tipo,
    pilar: post.pilar,
    titulo: post.concepto.slice(0, 100),
    caption,
    hashtags: hashtagStr,
    prompt_imagen: freepikPrompt ?? null,
    imagen_url: imageUrl ?? null,
    status: imageUrl ? 'listo' : 'planificado',
    generado_por: 'ia',
    publish_at: publishAt,
  })
  if (error) throw new Error(`DB insert error: ${error.message}`)
  log('💾', `Guardado: ${post.fecha} — ${post.slug}`)
}

// ── Main ──────────────────────────────────────────────────────
async function main() {
  log('🚀', `Generando ${MONTH1_PLAN.length} posts para Mes 1 DIVINIA...`)
  log('📅', `Período: 28 Abr – 23 May 2026`)
  console.log()

  // 1. Generate all captions in one shot
  const captions = await generateAllCaptions(MONTH1_PLAN)
  log('✅', `${captions.length} captions generados`)
  console.log()

  const results = []

  // 2. Process each post: generate image → upload → insert
  for (let i = 0; i < MONTH1_PLAN.length; i++) {
    const post = MONTH1_PLAN[i]
    const captionData = captions.find(c => c.n === i + 1) ?? captions[i]

    if (!captionData) {
      log('⚠️', `Sin caption para post ${i + 1}, saltando...`)
      continue
    }

    log('📝', `[${i + 1}/20] ${post.fecha} | ${post.tipo} | ${post.pilar} | ${post.slug}`)

    let imageUrl = null

    // Generate image for static posts (post, carrusel)
    // For reels we also generate a cover image
    try {
      imageUrl = await generateImage(captionData.freepikPrompt, post.slug)
    } catch (err) {
      log('⚠️', `Imagen falló para ${post.slug}: ${err.message}. Insertando sin imagen.`)
    }

    // Insert into DB
    try {
      await insertPost({
        post,
        caption: captionData.caption,
        hashtags: captionData.hashtags,
        freepikPrompt: captionData.freepikPrompt,
        imageUrl,
      })
    } catch (err) {
      log('❌', `DB error para ${post.slug}: ${err.message}`)
    }

    results.push({ slug: post.slug, imageUrl: imageUrl ?? 'MISSING', ok: !!imageUrl })

    // Rate limit between posts (Freepik allows ~2 req/s but let's be safe)
    if (i < MONTH1_PLAN.length - 1) {
      await delay(2000)
    }
    console.log()
  }

  // Summary
  console.log('\n' + '='.repeat(60))
  log('🎉', 'COMPLETADO')
  const ok = results.filter(r => r.ok).length
  const fail = results.filter(r => !r.ok).length
  log('✅', `${ok} posts con imagen`)
  log('⚠️', `${fail} posts sin imagen (insertados como planificado)`)
  console.log()
  console.log('Posts sin imagen:')
  results.filter(r => !r.ok).forEach(r => console.log('  -', r.slug))
  console.log('\nVisualizar en: http://localhost:4000/redes')
}

main().catch(err => {
  console.error('Error fatal:', err)
  process.exit(1)
})
