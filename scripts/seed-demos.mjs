// Standalone seed script — run with: node scripts/seed-demos.mjs
import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { resolve } from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const envPath = resolve(__dirname, '../.env.local')

// Parse .env.local manually
const envContent = readFileSync(envPath, 'utf8')
const env = {}
for (const line of envContent.split('\n')) {
  const trimmed = line.trim()
  if (!trimmed || trimmed.startsWith('#')) continue
  const eqIdx = trimmed.indexOf('=')
  if (eqIdx < 0) continue
  const key = trimmed.slice(0, eqIdx).trim()
  const val = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, '')
  env[key] = val
}

const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL || env.SUPABASE_URL
const SERVICE_ROLE_KEY = env.SUPABASE_SERVICE_ROLE_KEY
const APP_URL = env.NEXT_PUBLIC_APP_URL || 'https://divinia.vercel.app'

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('Faltan SUPABASE_URL o SERVICE_ROLE_KEY en .env.local')
  process.exit(1)
}

const db = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
})

const DEMOS = [
  {
    chatbot_id: 'cancha-los-pinos',
    company_name: 'Canchas Los Pinos',
    contact_name: 'Héctor',
    rubro: 'canchasfutbol',
    ciudad: 'San Luis Capital',
    whatsapp: '5492664600001',
    pin: '7711',
    color: '#16a34a',
    intro_emoji: '⚽',
    intro_tagline: 'Reservá tu cancha online · 24hs',
    slot_duration_minutes: 60,
    advance_booking_days: 30,
    schedule: {
      lun: { open: '08:00', close: '23:00' },
      mar: { open: '08:00', close: '23:00' },
      mie: { open: '08:00', close: '23:00' },
      jue: { open: '08:00', close: '23:00' },
      vie: { open: '08:00', close: '23:00' },
      sab: { open: '07:00', close: '23:00' },
      dom: { open: '08:00', close: '22:00' },
    },
    services: [
      { name: 'Fútbol 5 — Cancha 1 (1hs)', category: 'Canchas', duration_minutes: 60, price_ars: 28000, deposit_percentage: 50 },
      { name: 'Fútbol 5 — Cancha 2 (1hs)', category: 'Canchas', duration_minutes: 60, price_ars: 28000, deposit_percentage: 50 },
      { name: 'Fútbol 7 — Cancha 3 (1hs)', category: 'Canchas', duration_minutes: 60, price_ars: 38000, deposit_percentage: 50 },
      { name: 'Fútbol 5 Nocturna (1hs · con luz)', category: 'Canchas nocturnas', duration_minutes: 60, price_ars: 34000, deposit_percentage: 50 },
    ],
  },
  {
    chatbot_id: 'estetica-luna-llena',
    company_name: 'Centro de Estética Luna Llena',
    contact_name: 'Sil',
    rubro: 'estetica',
    ciudad: 'San Luis Capital',
    whatsapp: '5492664600002',
    pin: '3388',
    color: '#EC4899',
    intro_emoji: '✨',
    intro_tagline: 'Reservá tu turno de belleza',
    slot_duration_minutes: 30,
    advance_booking_days: 60,
    schedule: {
      lun: null,
      mar: { open: '09:00', close: '20:00' },
      mie: { open: '09:00', close: '20:00' },
      jue: { open: '09:00', close: '20:00' },
      vie: { open: '09:00', close: '20:00' },
      sab: { open: '09:00', close: '18:00' },
      dom: null,
    },
    services: [
      { name: 'Facial hidratante (60 min)', category: 'Facial', duration_minutes: 60, price_ars: 32000, deposit_percentage: 30 },
      { name: 'Limpieza facial profunda', category: 'Facial', duration_minutes: 75, price_ars: 38000, deposit_percentage: 30 },
      { name: 'Depilación láser — axilas', category: 'Depilación', duration_minutes: 30, price_ars: 22000, deposit_percentage: 0 },
      { name: 'Depilación láser — piernas', category: 'Depilación', duration_minutes: 60, price_ars: 55000, deposit_percentage: 50 },
      { name: 'Masaje relajante (60 min)', category: 'Masajes', duration_minutes: 60, price_ars: 30000, deposit_percentage: 30 },
      { name: 'Maquillaje artístico / evento', category: 'Maquillaje', duration_minutes: 90, price_ars: 45000, deposit_percentage: 50 },
      { name: 'Solarium (20 min)', category: 'Bronceado', duration_minutes: 20, price_ars: 8000, deposit_percentage: 0 },
    ],
  },
  {
    chatbot_id: 'tattoo-ink-house',
    company_name: 'Ink House Tattoo & Piercing',
    contact_name: 'Facu',
    rubro: 'tatuajes',
    ciudad: 'San Luis Capital',
    whatsapp: '5492664600003',
    pin: '6666',
    color: '#DC2828',
    intro_emoji: '🎨',
    intro_tagline: 'Reservá tu sesión de tattoo',
    slot_duration_minutes: 60,
    advance_booking_days: 45,
    schedule: {
      lun: null,
      mar: { open: '11:00', close: '20:00' },
      mie: { open: '11:00', close: '20:00' },
      jue: { open: '11:00', close: '20:00' },
      vie: { open: '11:00', close: '20:00' },
      sab: { open: '10:00', close: '18:00' },
      dom: null,
    },
    services: [
      { name: 'Consulta + diseño (sin costo)', category: 'Consultas', duration_minutes: 60, price_ars: 0, deposit_percentage: 0 },
      { name: 'Sesión de tatuaje (1hs)', category: 'Tattoo', duration_minutes: 60, price_ars: 50000, deposit_percentage: 50 },
      { name: 'Sesión de tatuaje (2hs)', category: 'Tattoo', duration_minutes: 120, price_ars: 95000, deposit_percentage: 50 },
      { name: 'Sesión de tatuaje (4hs · pieza grande)', category: 'Tattoo', duration_minutes: 240, price_ars: 180000, deposit_percentage: 50 },
      { name: 'Piercing (oreja, nariz, ombligo)', category: 'Piercing', duration_minutes: 30, price_ars: 20000, deposit_percentage: 0 },
    ],
  },
  {
    chatbot_id: 'clinica-integral-vida',
    company_name: 'Centro Médico Integral Vida',
    contact_name: 'Recepción',
    rubro: 'clinica',
    ciudad: 'San Luis Capital',
    whatsapp: '5492664600004',
    pin: '2244',
    color: '#0090FF',
    intro_emoji: '🩺',
    intro_tagline: 'Pedí tu turno médico online',
    slot_duration_minutes: 30,
    advance_booking_days: 60,
    schedule: {
      lun: { open: '07:00', close: '20:00' },
      mar: { open: '07:00', close: '20:00' },
      mie: { open: '07:00', close: '20:00' },
      jue: { open: '07:00', close: '20:00' },
      vie: { open: '07:00', close: '18:00' },
      sab: { open: '08:00', close: '13:00' },
      dom: null,
    },
    services: [
      { name: 'Consulta médica general', category: 'Medicina', duration_minutes: 30, price_ars: 35000, deposit_percentage: 0 },
      { name: 'Consulta clínica con ObraSocial', category: 'Medicina', duration_minutes: 30, price_ars: 15000, deposit_percentage: 0 },
      { name: 'Sesión de kinesiología (45 min)', category: 'Kinesiología', duration_minutes: 45, price_ars: 25000, deposit_percentage: 0 },
      { name: 'Sesión de fonoaudiología', category: 'Fonoaudiología', duration_minutes: 45, price_ars: 22000, deposit_percentage: 0 },
      { name: 'Consulta oftalmológica', category: 'Oftalmología', duration_minutes: 30, price_ars: 40000, deposit_percentage: 0 },
      { name: 'Consulta podológica', category: 'Podología', duration_minutes: 30, price_ars: 18000, deposit_percentage: 0 },
    ],
  },
  {
    chatbot_id: 'nutricionista-sofia-sl',
    company_name: 'Lic. Sofía Peralta — Nutrición',
    contact_name: 'Sofía',
    rubro: 'nutricionista',
    ciudad: 'San Luis Capital',
    whatsapp: '5492664600005',
    pin: '8899',
    color: '#64DC3C',
    intro_emoji: '🥗',
    intro_tagline: 'Pedí tu consulta de nutrición',
    slot_duration_minutes: 30,
    advance_booking_days: 60,
    schedule: {
      lun: { open: '09:00', close: '18:00' },
      mar: { open: '09:00', close: '18:00' },
      mie: { open: '09:00', close: '18:00' },
      jue: { open: '09:00', close: '18:00' },
      vie: { open: '09:00', close: '15:00' },
      sab: null,
      dom: null,
    },
    services: [
      { name: 'Primera consulta (90 min)', category: 'Consultas', duration_minutes: 90, price_ars: 40000, deposit_percentage: 0 },
      { name: 'Consulta de seguimiento', category: 'Seguimiento', duration_minutes: 45, price_ars: 25000, deposit_percentage: 0 },
      { name: 'Plan de alimentación deportivo', category: 'Especialidades', duration_minutes: 60, price_ars: 35000, deposit_percentage: 0 },
      { name: 'Consulta virtual (video)', category: 'Online', duration_minutes: 45, price_ars: 20000, deposit_percentage: 0 },
    ],
  },
  {
    chatbot_id: 'vet-mascotas-felices',
    company_name: 'Mascotas Felices Veterinaria',
    contact_name: 'Dr. Rivas',
    rubro: 'veterinaria',
    ciudad: 'San Luis Capital',
    whatsapp: '5492664600006',
    pin: '4141',
    color: '#6464FF',
    intro_emoji: '🐾',
    intro_tagline: 'Turno para tu mascota',
    slot_duration_minutes: 30,
    advance_booking_days: 30,
    schedule: {
      lun: { open: '09:00', close: '20:00' },
      mar: { open: '09:00', close: '20:00' },
      mie: { open: '09:00', close: '20:00' },
      jue: { open: '09:00', close: '20:00' },
      vie: { open: '09:00', close: '20:00' },
      sab: { open: '09:00', close: '15:00' },
      dom: null,
    },
    services: [
      { name: 'Consulta veterinaria', category: 'Consultas', duration_minutes: 30, price_ars: 22000, deposit_percentage: 0 },
      { name: 'Vacunación anual', category: 'Preventiva', duration_minutes: 20, price_ars: 28000, deposit_percentage: 0 },
      { name: 'Baño y corte — Pequeño (hasta 10kg)', category: 'Peluquería canina', duration_minutes: 90, price_ars: 18000, deposit_percentage: 30 },
      { name: 'Baño y corte — Mediano (10–25kg)', category: 'Peluquería canina', duration_minutes: 120, price_ars: 25000, deposit_percentage: 30 },
      { name: 'Baño y corte — Grande (+25kg)', category: 'Peluquería canina', duration_minutes: 150, price_ars: 35000, deposit_percentage: 30 },
      { name: 'Clase de adiestramiento (1hs)', category: 'Adiestramiento', duration_minutes: 60, price_ars: 25000, deposit_percentage: 0 },
    ],
  },
  {
    chatbot_id: 'yoga-centro-paz-sl',
    company_name: 'Centro de Yoga & Bienestar Paz',
    contact_name: 'Laura',
    rubro: 'yoga',
    ciudad: 'San Luis Capital',
    whatsapp: '5492664600007',
    pin: '5577',
    color: '#8C64FF',
    intro_emoji: '🧘',
    intro_tagline: 'Reservá tu clase de yoga',
    slot_duration_minutes: 60,
    advance_booking_days: 14,
    schedule: {
      lun: { open: '07:00', close: '21:00' },
      mar: { open: '07:00', close: '21:00' },
      mie: { open: '07:00', close: '21:00' },
      jue: { open: '07:00', close: '21:00' },
      vie: { open: '07:00', close: '20:00' },
      sab: { open: '08:00', close: '13:00' },
      dom: null,
    },
    services: [
      { name: 'Clase grupal de yoga (60 min)', category: 'Grupales', duration_minutes: 60, price_ars: 9000, deposit_percentage: 0 },
      { name: 'Clase grupal de pilates', category: 'Grupales', duration_minutes: 60, price_ars: 9500, deposit_percentage: 0 },
      { name: 'Clase privada de yoga (1 persona)', category: 'Privadas', duration_minutes: 60, price_ars: 28000, deposit_percentage: 0 },
      { name: 'Clase privada de pilates', category: 'Privadas', duration_minutes: 60, price_ars: 30000, deposit_percentage: 0 },
      { name: 'Meditación guiada (45 min)', category: 'Bienestar', duration_minutes: 45, price_ars: 7000, deposit_percentage: 0 },
    ],
  },
  {
    chatbot_id: 'padel-club-villa',
    company_name: 'Club de Pádel & Tenis Villa',
    contact_name: 'Caro',
    rubro: 'padel',
    ciudad: 'San Luis Capital',
    whatsapp: '5492664600008',
    pin: '3322',
    color: '#50DC00',
    intro_emoji: '🎾',
    intro_tagline: 'Reservá tu cancha de pádel online',
    slot_duration_minutes: 60,
    advance_booking_days: 14,
    schedule: {
      lun: { open: '07:00', close: '23:00' },
      mar: { open: '07:00', close: '23:00' },
      mie: { open: '07:00', close: '23:00' },
      jue: { open: '07:00', close: '23:00' },
      vie: { open: '07:00', close: '23:00' },
      sab: { open: '07:00', close: '23:00' },
      dom: { open: '08:00', close: '22:00' },
    },
    services: [
      { name: 'Pádel — Cancha 1 (1hs)', category: 'Canchas pádel', duration_minutes: 60, price_ars: 22000, deposit_percentage: 30 },
      { name: 'Pádel — Cancha 2 (1hs)', category: 'Canchas pádel', duration_minutes: 60, price_ars: 22000, deposit_percentage: 30 },
      { name: 'Tenis — Cancha (1hs)', category: 'Canchas tenis', duration_minutes: 60, price_ars: 18000, deposit_percentage: 30 },
      { name: 'Clase de pádel (profesor)', category: 'Clases', duration_minutes: 60, price_ars: 35000, deposit_percentage: 50 },
      { name: 'Clase de tenis (profesor)', category: 'Clases', duration_minutes: 60, price_ars: 32000, deposit_percentage: 50 },
    ],
  },
  {
    chatbot_id: 'crossfit-box-titan-sl',
    company_name: 'Box Titán CrossFit',
    contact_name: 'Mauro',
    rubro: 'crossfit',
    ciudad: 'San Luis Capital',
    whatsapp: '5492664600009',
    pin: '9090',
    color: '#FF5000',
    intro_emoji: '🔥',
    intro_tagline: 'Reservá tu WOD',
    slot_duration_minutes: 60,
    advance_booking_days: 14,
    schedule: {
      lun: { open: '06:00', close: '21:00' },
      mar: { open: '06:00', close: '21:00' },
      mie: { open: '06:00', close: '21:00' },
      jue: { open: '06:00', close: '21:00' },
      vie: { open: '06:00', close: '20:00' },
      sab: { open: '08:00', close: '13:00' },
      dom: null,
    },
    services: [
      { name: 'WOD clase grupal', category: 'CrossFit', duration_minutes: 60, price_ars: 8500, deposit_percentage: 0 },
      { name: 'Clase de fuerza (powerlifting)', category: 'CrossFit', duration_minutes: 60, price_ars: 9000, deposit_percentage: 0 },
      { name: 'Entrenamiento personal (1hs)', category: 'Personal Trainer', duration_minutes: 60, price_ars: 30000, deposit_percentage: 0 },
      { name: 'Clase de boxeo', category: 'Artes Marciales', duration_minutes: 60, price_ars: 9000, deposit_percentage: 0 },
      { name: 'Clase de kickboxing', category: 'Artes Marciales', duration_minutes: 60, price_ars: 9500, deposit_percentage: 0 },
    ],
  },
  {
    chatbot_id: 'academia-danza-sol',
    company_name: 'Academia de Danza Sol',
    contact_name: 'Angie',
    rubro: 'danza',
    ciudad: 'San Luis Capital',
    whatsapp: '5492664600010',
    pin: '1199',
    color: '#FF50B4',
    intro_emoji: '💃',
    intro_tagline: 'Inscribite a tus clases de danza',
    slot_duration_minutes: 60,
    advance_booking_days: 30,
    schedule: {
      lun: { open: '09:00', close: '21:00' },
      mar: { open: '09:00', close: '21:00' },
      mie: { open: '09:00', close: '21:00' },
      jue: { open: '09:00', close: '21:00' },
      vie: { open: '09:00', close: '20:00' },
      sab: { open: '09:00', close: '14:00' },
      dom: null,
    },
    services: [
      { name: 'Tango (principiante)', category: 'Tango', duration_minutes: 60, price_ars: 9000, deposit_percentage: 0 },
      { name: 'Tango (avanzado)', category: 'Tango', duration_minutes: 60, price_ars: 10000, deposit_percentage: 0 },
      { name: 'Salsa & Bachata', category: 'Ritmos latinos', duration_minutes: 60, price_ars: 9000, deposit_percentage: 0 },
      { name: 'Danza contemporánea', category: 'Contemporáneo', duration_minutes: 60, price_ars: 9500, deposit_percentage: 0 },
      { name: 'Hip Hop / Urban', category: 'Urban', duration_minutes: 60, price_ars: 9000, deposit_percentage: 0 },
    ],
  },
  {
    chatbot_id: 'taller-mecanico-primo',
    company_name: 'Taller Mecánico El Primo',
    contact_name: 'Gustavo',
    rubro: 'taller',
    ciudad: 'San Luis Capital',
    whatsapp: '5492664600011',
    pin: '7744',
    color: '#B48C3C',
    intro_emoji: '🔧',
    intro_tagline: 'Pedí turno en el taller',
    slot_duration_minutes: 60,
    advance_booking_days: 14,
    schedule: {
      lun: { open: '08:00', close: '18:00' },
      mar: { open: '08:00', close: '18:00' },
      mie: { open: '08:00', close: '18:00' },
      jue: { open: '08:00', close: '18:00' },
      vie: { open: '08:00', close: '18:00' },
      sab: { open: '08:00', close: '13:00' },
      dom: null,
    },
    services: [
      { name: 'Service completo (aceite + filtros)', category: 'Service', duration_minutes: 90, price_ars: 45000, deposit_percentage: 0 },
      { name: 'Diagnóstico computarizado', category: 'Diagnóstico', duration_minutes: 60, price_ars: 20000, deposit_percentage: 0 },
      { name: 'Cambio y balanceo de neumáticos (4)', category: 'Gomería', duration_minutes: 60, price_ars: 15000, deposit_percentage: 0 },
      { name: 'Lavado completo interior + exterior', category: 'Lavado', duration_minutes: 90, price_ars: 28000, deposit_percentage: 0 },
      { name: 'Detailing profesional (pulido + cera)', category: 'Detailing', duration_minutes: 240, price_ars: 90000, deposit_percentage: 50 },
    ],
  },
  {
    chatbot_id: 'academia-oxford-sl',
    company_name: 'Academia Oxford San Luis',
    contact_name: 'Recepción',
    rubro: 'idiomas',
    ciudad: 'San Luis Capital',
    whatsapp: '5492664600012',
    pin: '4488',
    color: '#28A0FF',
    intro_emoji: '🌍',
    intro_tagline: 'Clase de prueba gratis',
    slot_duration_minutes: 60,
    advance_booking_days: 30,
    schedule: {
      lun: { open: '08:00', close: '21:00' },
      mar: { open: '08:00', close: '21:00' },
      mie: { open: '08:00', close: '21:00' },
      jue: { open: '08:00', close: '21:00' },
      vie: { open: '08:00', close: '20:00' },
      sab: { open: '09:00', close: '14:00' },
      dom: null,
    },
    services: [
      { name: 'Inglés — Clase de prueba (gratis)', category: 'Inglés', duration_minutes: 60, price_ars: 0, deposit_percentage: 0 },
      { name: 'Inglés grupal (hasta 6 alumnos)', category: 'Inglés', duration_minutes: 60, price_ars: 12000, deposit_percentage: 0 },
      { name: 'Inglés particular (1:1)', category: 'Inglés', duration_minutes: 60, price_ars: 25000, deposit_percentage: 0 },
      { name: 'Portugués grupal', category: 'Portugués', duration_minutes: 60, price_ars: 12000, deposit_percentage: 0 },
      { name: 'Clases de guitarra', category: 'Música', duration_minutes: 60, price_ars: 22000, deposit_percentage: 0 },
      { name: 'Clases de piano', category: 'Música', duration_minutes: 60, price_ars: 22000, deposit_percentage: 0 },
      { name: 'Clases de manejo — Auto escuela', category: 'Auto escuela', duration_minutes: 60, price_ars: 20000, deposit_percentage: 0 },
    ],
  },
  {
    chatbot_id: 'camping-rio-claro-sl',
    company_name: 'Camping & Aventura Río Claro',
    contact_name: 'Romi',
    rubro: 'camping',
    ciudad: 'Merlo, San Luis',
    whatsapp: '5492664600013',
    pin: '2266',
    color: '#50B43C',
    intro_emoji: '⛺',
    intro_tagline: 'Reservá tu lugar en el camping',
    slot_duration_minutes: 60,
    advance_booking_days: 90,
    schedule: {
      lun: { open: '08:00', close: '20:00' },
      mar: { open: '08:00', close: '20:00' },
      mie: { open: '08:00', close: '20:00' },
      jue: { open: '08:00', close: '20:00' },
      vie: { open: '08:00', close: '21:00' },
      sab: { open: '07:00', close: '21:00' },
      dom: { open: '08:00', close: '20:00' },
    },
    services: [
      { name: 'Parcela carpa (1 noche, hasta 4 personas)', category: 'Camping', duration_minutes: 60, price_ars: 18000, deposit_percentage: 30 },
      { name: 'Parcela motorhome / autocaravana', category: 'Camping', duration_minutes: 60, price_ars: 25000, deposit_percentage: 30 },
      { name: 'Alquiler de kayak (2hs)', category: 'Alquiler', duration_minutes: 120, price_ars: 20000, deposit_percentage: 30 },
      { name: 'Alquiler de bicicleta (día completo)', category: 'Alquiler', duration_minutes: 480, price_ars: 18000, deposit_percentage: 0 },
      { name: 'Tour en cuatriciclo (1hs)', category: 'Actividades', duration_minutes: 60, price_ars: 30000, deposit_percentage: 50 },
    ],
  },
  {
    chatbot_id: 'estudio-legal-borges',
    company_name: 'Estudio Jurídico Borges & Asociados',
    contact_name: 'Dr. Borges',
    rubro: 'abogado',
    ciudad: 'San Luis Capital',
    whatsapp: '5492664600014',
    pin: '6677',
    color: '#B4A064',
    intro_emoji: '⚖️',
    intro_tagline: 'Pedí tu consulta legal online',
    slot_duration_minutes: 60,
    advance_booking_days: 30,
    schedule: {
      lun: { open: '09:00', close: '18:00' },
      mar: { open: '09:00', close: '18:00' },
      mie: { open: '09:00', close: '18:00' },
      jue: { open: '09:00', close: '18:00' },
      vie: { open: '09:00', close: '16:00' },
      sab: null,
      dom: null,
    },
    services: [
      { name: 'Consulta legal (60 min)', category: 'Consultas', duration_minutes: 60, price_ars: 50000, deposit_percentage: 0 },
      { name: 'Consulta derecho laboral', category: 'Especialidades', duration_minutes: 60, price_ars: 50000, deposit_percentage: 0 },
      { name: 'Consulta escribanía / escrituras', category: 'Escribanía', duration_minutes: 45, price_ars: 40000, deposit_percentage: 0 },
      { name: 'Consulta contable (AFIP, monotributo)', category: 'Contabilidad', duration_minutes: 60, price_ars: 35000, deposit_percentage: 0 },
      { name: 'Reunión de consultoría empresarial', category: 'Consultoría', duration_minutes: 90, price_ars: 80000, deposit_percentage: 50 },
    ],
  },
  {
    chatbot_id: 'salon-los-olivos-sl',
    company_name: 'Salón de Eventos Los Olivos',
    contact_name: 'Marcela',
    rubro: 'salon',
    ciudad: 'San Luis Capital',
    whatsapp: '5492664600015',
    pin: '8833',
    color: '#FF64C8',
    intro_emoji: '🎉',
    intro_tagline: 'Reservá tu fecha · Eventos & Fiestas',
    slot_duration_minutes: 60,
    advance_booking_days: 180,
    schedule: {
      lun: { open: '09:00', close: '18:00' },
      mar: { open: '09:00', close: '18:00' },
      mie: { open: '09:00', close: '18:00' },
      jue: { open: '09:00', close: '18:00' },
      vie: { open: '09:00', close: '18:00' },
      sab: { open: '09:00', close: '15:00' },
      dom: null,
    },
    services: [
      { name: 'Reunión de asesoramiento (sin costo)', category: 'Consultas', duration_minutes: 60, price_ars: 0, deposit_percentage: 0 },
      { name: 'Salón hasta 100 personas (sábado)', category: 'Salón', duration_minutes: 480, price_ars: 500000, deposit_percentage: 30 },
      { name: 'Salón hasta 50 personas (semana)', category: 'Salón', duration_minutes: 480, price_ars: 300000, deposit_percentage: 30 },
      { name: 'Sesión fotográfica (2hs + edición)', category: 'Fotografía', duration_minutes: 120, price_ars: 120000, deposit_percentage: 50 },
      { name: 'Catering — Menú por persona (mín. 20)', category: 'Catering', duration_minutes: 60, price_ars: 25000, deposit_percentage: 30 },
    ],
  },
  {
    chatbot_id: 'escape-room-enigma-sl',
    company_name: 'Escape Room Enigma',
    contact_name: 'Nata',
    rubro: 'escaperoom',
    ciudad: 'San Luis Capital',
    whatsapp: '5492664600016',
    pin: '1357',
    color: '#C83C00',
    intro_emoji: '🔐',
    intro_tagline: 'Reservá tu sala · 1hs de pura adrenalina',
    slot_duration_minutes: 60,
    advance_booking_days: 30,
    schedule: {
      lun: null,
      mar: { open: '14:00', close: '22:00' },
      mie: { open: '14:00', close: '22:00' },
      jue: { open: '14:00', close: '22:00' },
      vie: { open: '14:00', close: '23:00' },
      sab: { open: '11:00', close: '23:00' },
      dom: { open: '12:00', close: '22:00' },
    },
    services: [
      { name: 'La Mansión del Terror (hasta 5 personas)', category: 'Salas', duration_minutes: 60, price_ars: 60000, deposit_percentage: 50 },
      { name: 'El Laboratorio Secreto (hasta 6 personas)', category: 'Salas', duration_minutes: 60, price_ars: 65000, deposit_percentage: 50 },
      { name: 'El Banco (hasta 4 personas · fácil)', category: 'Salas', duration_minutes: 60, price_ars: 50000, deposit_percentage: 50 },
      { name: 'Cumpleaños + sala privada (2hs)', category: 'Eventos', duration_minutes: 120, price_ars: 100000, deposit_percentage: 50 },
    ],
  },
  {
    chatbot_id: 'karting-san-luis',
    company_name: 'Kartódromo San Luis',
    contact_name: 'Diego',
    rubro: 'karting',
    ciudad: 'San Luis Capital',
    whatsapp: '5492664600017',
    pin: '2468',
    color: '#FF5000',
    intro_emoji: '🏎️',
    intro_tagline: 'Reservá tu tanda de karting',
    slot_duration_minutes: 30,
    advance_booking_days: 14,
    schedule: {
      lun: null,
      mar: { open: '14:00', close: '21:00' },
      mie: { open: '14:00', close: '21:00' },
      jue: { open: '14:00', close: '21:00' },
      vie: { open: '14:00', close: '22:00' },
      sab: { open: '10:00', close: '22:00' },
      dom: { open: '10:00', close: '21:00' },
    },
    services: [
      { name: 'Tanda individual (10 min)', category: 'Tandas', duration_minutes: 30, price_ars: 18000, deposit_percentage: 0 },
      { name: 'Pack 3 tandas (30 min)', category: 'Packs', duration_minutes: 60, price_ars: 45000, deposit_percentage: 0 },
      { name: 'Cumpleaños — karting + merienda (2hs)', category: 'Eventos', duration_minutes: 120, price_ars: 200000, deposit_percentage: 50 },
      { name: 'Campeonato privado (1hs · hasta 10)', category: 'Eventos', duration_minutes: 60, price_ars: 150000, deposit_percentage: 50 },
    ],
  },
  {
    chatbot_id: 'restaurante-la-italiana-sl',
    company_name: 'La Italiana — Restaurante',
    contact_name: 'Recepción',
    rubro: 'restaurante',
    ciudad: 'San Luis Capital',
    whatsapp: '5492664600018',
    pin: '9988',
    color: '#FF8C00',
    intro_emoji: '🍴',
    intro_tagline: 'Reservá tu mesa online',
    slot_duration_minutes: 60,
    advance_booking_days: 30,
    schedule: {
      lun: null,
      mar: { open: '12:00', close: '15:00' },
      mie: { open: '12:00', close: '15:00' },
      jue: { open: '12:00', close: '15:00' },
      vie: { open: '12:00', close: '15:30' },
      sab: { open: '12:00', close: '16:00' },
      dom: { open: '12:00', close: '15:30' },
    },
    services: [
      { name: 'Mesa para 2 personas (almuerzo)', category: 'Mesas almuerzo', duration_minutes: 90, price_ars: 0, deposit_percentage: 0 },
      { name: 'Mesa para 4 personas', category: 'Mesas almuerzo', duration_minutes: 90, price_ars: 0, deposit_percentage: 0 },
      { name: 'Mesa para 6 personas', category: 'Mesas almuerzo', duration_minutes: 90, price_ars: 0, deposit_percentage: 0 },
      { name: 'Salón privado (evento hasta 20 personas)', category: 'Eventos', duration_minutes: 180, price_ars: 150000, deposit_percentage: 30 },
    ],
  },
]

async function run() {
  console.log(`Conectando a Supabase: ${SUPABASE_URL}`)
  console.log(`Seeding ${DEMOS.length} demos...\n`)
  const resultados = []

  for (const demo of DEMOS) {
    try {
      const customConfig = {
        rubro: demo.rubro,
        ciudad: demo.ciudad,
        whatsapp: demo.whatsapp,
        source: 'demo_seed_rubros',
        color: demo.color,
        intro_emoji: demo.intro_emoji,
        intro_tagline: demo.intro_tagline,
      }

      const { data: client, error: clientError } = await db
        .from('clients')
        .upsert({
          chatbot_id: demo.chatbot_id,
          company_name: demo.company_name,
          contact_name: demo.contact_name,
          email: `demo-${demo.chatbot_id}@divinia.demo`,
          phone: demo.whatsapp,
          plan: 'pro',
          status: 'active',
          mrr: 45000,
          custom_config: customConfig,
        }, { onConflict: 'chatbot_id' })
        .select('id')
        .single()

      if (clientError || !client) {
        console.log(`❌ ${demo.company_name}: ${clientError?.message}`)
        resultados.push({ nombre: demo.company_name, ok: false, error: clientError?.message })
        continue
      }

      const clientId = client.id
      const services = demo.services.map(s => ({
        id: crypto.randomUUID(),
        category: s.category,
        name: s.name,
        description: '',
        duration_minutes: s.duration_minutes,
        price_ars: s.price_ars,
        deposit_percentage: s.deposit_percentage ?? 0,
      }))

      const cfgPayload = {
        client_id: clientId,
        is_active: true,
        slot_duration_minutes: demo.slot_duration_minutes ?? 30,
        advance_booking_days: demo.advance_booking_days ?? 60,
        blocked_dates: [],
        owner_phone: demo.whatsapp,
        owner_pin: demo.pin,
        schedule: demo.schedule,
        services,
      }

      const { data: existingCfg } = await db
        .from('booking_configs')
        .select('id')
        .eq('client_id', clientId)
        .limit(1)
        .maybeSingle()

      let configId

      if (existingCfg) {
        configId = existingCfg.id
        await db.from('booking_configs').update(cfgPayload).eq('id', configId)
      } else {
        const { data: newCfg, error: cfgErr } = await db.from('booking_configs').insert(cfgPayload).select('id').single()
        if (cfgErr || !newCfg) {
          console.log(`❌ ${demo.company_name} (config): ${cfgErr?.message}`)
          resultados.push({ nombre: demo.company_name, ok: false, error: cfgErr?.message })
          continue
        }
        configId = newCfg.id
      }

      const turneroUrl = `${APP_URL}/reservas/${demo.chatbot_id}`
      const panelUrl = `${APP_URL}/panel/${configId}`

      await db.from('clients').update({
        custom_config: {
          ...customConfig,
          turnero_url: turneroUrl,
          panel_url: panelUrl,
          panel_pin: demo.pin,
          provisioned_at: new Date().toISOString(),
        },
      }).eq('id', clientId)

      console.log(`✅ ${demo.company_name} → ${turneroUrl}`)
      resultados.push({ nombre: demo.company_name, ok: true, url: turneroUrl })
    } catch (e) {
      console.log(`❌ ${demo.company_name}: ${e}`)
      resultados.push({ nombre: demo.company_name, ok: false, error: String(e) })
    }
  }

  const ok = resultados.filter(r => r.ok).length
  const fail = resultados.filter(r => !r.ok).length
  console.log(`\n──────────────────────────────────────`)
  console.log(`✅ ${ok} exitosos  ❌ ${fail} errores`)
}

run().catch(console.error)
