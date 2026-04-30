/**
 * Seed 9 Instagram posts into content_calendar
 * Run: node scripts/seed-instagram-posts.mjs
 */

const SUPABASE_URL = 'https://dsekibwfbbxnglvcirso.supabase.co'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRzZWtpYndmYmJ4bmdsdmNpcnNvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjU4NzI5NSwiZXhwIjoyMDg4MTYzMjk1fQ.xvXr3io984MXhGFWkDHfYIO406uwcG0buO-rn0Vy6co'
const SOCIAL_CLIENT_ID = '857cef01-16a1-4034-8286-1b9e44dcfda3'

const BASE = new Date('2026-04-30')
const date = (n) => { const d = new Date(BASE); d.setDate(d.getDate() + n); return d.toISOString().split('T')[0] }
const post = (overrides) => ({
  tipo: 'post', plataforma: 'instagram', status: 'listo',
  generado_por: 'ia', social_client_id: SOCIAL_CLIENT_ID,
  carousel_items: [], metadata: {}, remotion_props: {},
  ...overrides,
})

const POSTS = [
  post({
    titulo: '01 — DIVINIA: IA para tu negocio',
    caption: `Somos DIVINIA. 🇦🇷\nIA para negocios argentinos — Turnero, Chatbot 24/7 y Contenido en piloto automático.\nNacimos en San Luis. Trabajamos en todo el país.\n👉 Link en bio: divinia.vercel.app`,
    hashtags: '#IA #Turnero #PYMEs #Argentina #SanLuis #Automatizacion #NegociosDigitales',
    pilar: 'comunidad', fecha: date(0),
    imagen_url: 'https://divinia.vercel.app/posts/instagram/01-brand.png',
    prompt_imagen: 'dark editorial — DIVINIA bold white on black, lime green accent line',
  }),
  post({
    titulo: '02 — Turnero: tus clientes reservan solos',
    caption: `Tu negocio no debería perder turnos por no contestar.\nCon Turnero IA: tus clientes reservan solos, vos recibís la notificación.\n$45.000/mes · Setup en 24hs 📅\n¿De qué rubro sos? Te muestro el demo de tu negocio 👇`,
    hashtags: '#Turnero #Peluqueria #Estetica #Clinica #Turnos #Argentina',
    pilar: 'venta', fecha: date(1),
    imagen_url: 'https://divinia.vercel.app/posts/instagram/02-turnero.png',
    prompt_imagen: 'phone with calendar dark — turnero IA booking system',
  }),
  post({
    titulo: '03 — Pain: ¿cuántos turnos perdiste hoy?',
    caption: `1.6 turnos perdidos por día = $320.000 por mes que se van solos. 💸\nNo es mala suerte. Es que el sistema no está diseñado para funcionar sin vos.\nEso tiene arreglo.\n14 días gratis → divinia.vercel.app`,
    hashtags: '#Turnos #PYMEs #Argentina #IA #AutomatizacionNegocios',
    pilar: 'educativo', fecha: date(2),
    imagen_url: 'https://divinia.vercel.app/posts/instagram/03-pain.png',
    prompt_imagen: 'dramatic dark — large white question, glowing red number 3',
  }),
  post({
    titulo: '04 — Central IA: tu WA responde solo 24/7',
    caption: `Tu WhatsApp, respondiendo solo a las 2am. 🤖\nCentral IA: entrenamos un chatbot con tu negocio — precios, servicios, turnos, todo.\nTus clientes sienten que les estás respondiendo vos.\n¿Querés una demo? Escribime 👇`,
    hashtags: '#ChatbotIA #WhatsApp #Automatizacion #Argentina #IA',
    pilar: 'venta', fecha: date(3),
    imagen_url: 'https://divinia.vercel.app/posts/instagram/04-central-ia.png',
    prompt_imagen: 'dark — floating WhatsApp bubbles neon green, Tu WhatsApp responde solo 24/7',
  }),
  post({
    titulo: '05 — Content Factory: 30 posts al mes',
    caption: `30 posts en Instagram sin que vos toques nada. 📱\nContent Factory: diseño con tu identidad, captions en tu voz, hashtags optimizados.\nVos aprobás. Nosotros publicamos.\n$80.000/mes → divinia.vercel.app`,
    hashtags: '#ContentMarketing #Redes #Instagram #Argentina #PYMEs #MarketingDigital',
    pilar: 'venta', fecha: date(4),
    imagen_url: 'https://divinia.vercel.app/posts/instagram/05-content.png',
    prompt_imagen: 'dark — social media grid mockup, purple glow, 30 posts stat',
  }),
  post({
    titulo: '06 — Proceso: así de simple en 3 pasos',
    caption: `Sin complicaciones. Sin contratos raros.\n01 → Me escribís\n02 → Configuramos juntos\n03 → Tu negocio funciona solo\nEntregamos funcionando antes de cobrar.\nAsí de simple. 👇 divinia.vercel.app`,
    hashtags: '#DIVINIA #Turnero #IA #Argentina #SetupRapido',
    pilar: 'educativo', fecha: date(5),
    imagen_url: null,
    prompt_imagen: 'off-white background — 3 numbered steps editorial layout',
  }),
  post({
    titulo: '07 — Testimonial: peluquería San Luis',
    caption: `"No tuve que hacer nada. El sistema tomó mis turnos mientras yo atendía."\n— Peluquería San Luis 💬\n\nEsto nos dijo una clienta después de su primer mes con Turnero IA.\n¿Te imaginas no tener que confirmar turnos por WhatsApp nunca más?\n¿De qué negocio sos? Te cuento cómo quedaría para vos 👇`,
    hashtags: '#Testimonial #Turnero #Peluqueria #SanLuis #ClienteFeliz',
    pilar: 'comunidad', fecha: date(6),
    imagen_url: null,
    prompt_imagen: 'dark editorial — large lime quote marks, italic white text testimonial',
  }),
  post({
    titulo: '08 — San Luis: nacimos acá',
    caption: `Orgullosamente de San Luis. 🤎\nEmpezamos en casa. Crecemos para todo el país.\nSi tenés un negocio en Argentina y querés que funcione solo — hablemos.\n👉 divinia.vercel.app`,
    hashtags: '#SanLuis #Argentina #PYMEs #Emprendedores #IA #Local',
    pilar: 'comunidad', fecha: date(7),
    imagen_url: 'https://divinia.vercel.app/posts/instagram/07-san-luis.png',
    prompt_imagen: 'split — off-white top / ink bottom, NACIMOS EN SAN LUIS, Argentina map',
  }),
  post({
    titulo: '09 — CTA: 14 días gratis sin tarjeta',
    caption: `14 días gratis. Sin tarjeta. Sin letra chica. Sin trampa. ✅\nSolo escribinos, configuramos tu sistema en 24hs y empezás a ver resultados.\nSi no te gusta, no pagás nada. Punto.\n👉 divinia.vercel.app`,
    hashtags: '#GratisYSin #Turnero #PYMEs #Argentina #14DiasGratis',
    pilar: 'venta', fecha: date(8),
    imagen_url: 'https://divinia.vercel.app/posts/instagram/08-cta.png',
    prompt_imagen: 'lime green background — huge 14 number, bold guarantees list',
  }),
]

async function seed() {
  console.log('🌱 Seeding Instagram posts to content_calendar...\n')

  const checkRes = await fetch(
    `${SUPABASE_URL}/rest/v1/content_calendar?titulo=like.0*&select=titulo`,
    { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` } }
  )
  const existing = await checkRes.json()
  const existingTitles = new Set(Array.isArray(existing) ? existing.map(r => r.titulo) : [])

  let inserted = 0, skipped = 0

  for (const p of POSTS) {
    if (existingTitles.has(p.titulo)) {
      console.log(`  ⏭  Skipped: ${p.titulo}`)
      skipped++
      continue
    }
    const res = await fetch(`${SUPABASE_URL}/rest/v1/content_calendar`, {
      method: 'POST',
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal',
      },
      body: JSON.stringify(p),
    })
    if (res.ok || res.status === 201 || res.status === 204) {
      console.log(`  ✅ ${p.titulo}`)
      inserted++
    } else {
      const err = await res.text()
      console.log(`  ❌ ${p.titulo.slice(0, 40)} → ${err.slice(0, 120)}`)
    }
  }

  console.log(`\n✅ Done: ${inserted} inserted, ${skipped} skipped`)
}

seed().catch(console.error)
