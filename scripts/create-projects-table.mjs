// Run: node scripts/create-projects-table.mjs
import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const env = {}
readFileSync(resolve(__dirname, '../.env.local'), 'utf8').split('\n').forEach(line => {
  const eq = line.indexOf('=')
  if (eq > 0) env[line.slice(0, eq).trim()] = line.slice(eq + 1).trim().replace(/^["']|["']$/g, '')
})

const db = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
})

async function run() {
  console.log('Creando tabla projects...')

  // Verificar si ya existe
  const { data: existing } = await db.from('projects').select('id').limit(1)
  if (existing !== null) {
    console.log('✅ Tabla projects ya existe')
  } else {
    console.log('❌ Tabla projects no existe — correr supabase-strategy-schema.sql manualmente en el SQL Editor de Supabase')
    console.log('\nURL: https://supabase.com/dashboard/project/dsekibwfbbxnglvcirso/sql')
    return
  }

  // Add estrategia column to clients (attempt via update)
  console.log('\nVerificando columna estrategia en clients...')
  const { data: testClient } = await db.from('clients').select('id, estrategia').limit(1)
  if (testClient && 'estrategia' in (testClient[0] ?? {})) {
    console.log('✅ Columna clients.estrategia ya existe')
  } else {
    console.log('⚠️  Columna clients.estrategia no existe — agregar manualmente:')
    console.log('   ALTER TABLE clients ADD COLUMN IF NOT EXISTS estrategia JSONB DEFAULT \'{}\';')
  }

  // Seed DIVINIA product projects
  console.log('\nSeeding proyectos internos de DIVINIA...')
  const seeds = [
    {
      nombre: 'Turnero IA',
      tagline: 'Sistema de reservas inteligente para PYMEs',
      descripcion: 'Producto hero de DIVINIA. Sistema de turnos con IA, confirmaciones automáticas y panel de gestión. Activo y en venta desde San Luis.',
      tipo: 'producto-divinia', categoria: 'turnero', status: 'activo',
      icon: '📅', color: '#C6FF3D', progreso: 85, href: '/turnos',
      estrategia: { objetivo: 'Llegar a 20 clientes pagos antes de agosto 2026', mercado: 'PYMEs con turnos: estéticas, peluquerías, médicos, veterinarias, talleres', diferencial: 'Setup en 24hs, sin hardware, con seña automática MP', geo: 'San Luis → Cuyo → Nacional', precio_desde: 43000 },
      proximos: ['Integración recordatorios WhatsApp', 'Analytics por rubro', 'App PWA para clientes', 'Demo videos por rubro'],
      kpis: [{ label: 'Clientes activos', valor: '1 (Romina)', meta: '20' }, { label: 'MRR', valor: '$43k', meta: '$860k' }, { label: 'Setup', valor: '24-48hs' }],
    },
    {
      nombre: 'NUCLEUS IA',
      tagline: 'Cerebro IA para negocios — memoria, agentes, automatización total',
      descripcion: 'El producto más diferenciador. Sistema operativo IA que automatiza el negocio completo del cliente.',
      tipo: 'producto-divinia', categoria: 'nucleus', status: 'en-desarrollo',
      icon: '🧠', color: '#A78BFA', progreso: 40, href: '/nucleo',
      estrategia: { objetivo: 'Cerrar primer cliente enterprise antes de junio 2026', mercado: 'Empresas y organismos con procesos repetitivos', precio_desde: 800000 },
      proximos: ['Cerrar Shopping del Usado', 'Entregar Dorotea (Santiago Peral)', 'Memory store en Supabase', 'Agente comercial autónomo'],
      kpis: [{ label: 'Primer cliente', valor: 'En negociación' }, { label: 'Precio base', valor: '$800k' }, { label: 'Agentes', valor: '43 definidos' }],
    },
    {
      nombre: 'Market San Luis',
      tagline: 'Super app comercio local — marketplace + delivery + oficios',
      descripcion: 'Webapp independiente para la comunidad de San Luis. Comercios, delivery, oficios y loyalty en una sola app.',
      tipo: 'producto-divinia', categoria: 'marketplace', status: 'en-desarrollo',
      icon: '🗺️', color: '#38BDF8', progreso: 20, href: '/market',
      estrategia: { objetivo: '50 comercios activos en San Luis para fin de 2026', modelo: 'Comisión por transacción + suscripción mensual', escala: 'San Luis → Cuyo → Nacional' },
      proximos: ['Landing propia de Market SL', 'Reclutar 10 comercios piloto', 'Sistema de delivery básico', 'Loyalty por QR'],
      kpis: [{ label: 'Comercios objetivo', valor: '50 en 6 meses' }, { label: 'Ciudad piloto', valor: 'San Luis Capital' }],
    },
    {
      nombre: 'Content Factory',
      tagline: 'Producción masiva de contenido IA para clientes DIVINIA',
      descripcion: 'Sistema para producir y programar contenido de redes sociales. Reels, posts, copys, calendarios en minutos.',
      tipo: 'producto-divinia', categoria: 'content_factory', status: 'activo',
      icon: '🎬', color: '#F472B6', progreso: 65, href: '/contenido',
      estrategia: { objetivo: 'Ofrecer plan de contenido IA a todos los clientes Turnero como upsell', modelo: '$80k básico / $120k pro / $150k full mensual' },
      proximos: ['Templates de contenido por rubro', 'Publicación automática Instagram', 'Generador de reels con Remotion'],
      kpis: [{ label: 'Precio desde', valor: '$80k/mes' }, { label: 'Automatización', valor: '80%' }],
    },
  ]

  let created = 0
  for (const seed of seeds) {
    const { error } = await db.from('projects').upsert(seed, { onConflict: 'nombre' })
    if (error) {
      console.log(`❌ ${seed.nombre}: ${error.message}`)
    } else {
      console.log(`✅ ${seed.nombre}`)
      created++
    }
  }

  console.log(`\n── ${created}/${seeds.length} proyectos creados`)
}

run().catch(console.error)
