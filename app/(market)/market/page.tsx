import { createAdminClient } from '@/lib/supabase'
import MarketClient from './MarketClient'

// ─── Tipos ───────────────────────────────────────────────────────────────────

export interface Comercio {
  id: string
  slug: string
  nombre: string
  descripcion: string | null
  direccion: string | null
  rubro: string
  emoji: string
  delivery: boolean
  delivery_whatsapp: string | null
}

export interface Oficio {
  nombre: string
  oficio: string
  zona: string
  precio: string
  disponible: boolean
  wa: string
}

// ─── Demo data ────────────────────────────────────────────────────────────────

const DEMO_COMERCIOS: Comercio[] = [
  {
    id: '1',
    slug: 'la-esquina-pizzeria',
    nombre: 'La Esquina Pizzería',
    descripcion: 'Las mejores pizzas a la piedra de San Luis.',
    direccion: 'Av. Illia 450, San Luis',
    rubro: 'Pizzerías',
    emoji: '🍕',
    delivery: true,
    delivery_whatsapp: '5492664100001',
  },
  {
    id: '2',
    slug: 'cafe-central',
    nombre: 'Café Central',
    descripcion: 'Café de especialidad y repostería artesanal.',
    direccion: 'San Martín 320, San Luis',
    rubro: 'Cafeterías',
    emoji: '☕',
    delivery: false,
    delivery_whatsapp: null,
  },
  {
    id: '3',
    slug: 'burger-bros',
    nombre: 'Burger Bros',
    descripcion: 'Hamburguesas artesanales con papas fritas caseras.',
    direccion: 'Colón 550, San Luis',
    rubro: 'Restaurantes',
    emoji: '🍔',
    delivery: true,
    delivery_whatsapp: '5492664100003',
  },
  {
    id: '4',
    slug: 'farmacia-del-centro',
    nombre: 'Farmacia del Centro',
    descripcion: 'Farmacia con atención personalizada y envío a domicilio.',
    direccion: 'Pringles 180, San Luis',
    rubro: 'Farmacias',
    emoji: '💊',
    delivery: true,
    delivery_whatsapp: '5492664100004',
  },
  {
    id: '5',
    slug: 'gym-evolve',
    nombre: 'Gym Evolve',
    descripcion: 'Entrenamiento funcional, musculación y clases grupales.',
    direccion: 'Av. España 900, San Luis',
    rubro: 'Gimnasios',
    emoji: '🏋️',
    delivery: false,
    delivery_whatsapp: null,
  },
  {
    id: '6',
    slug: 'veterinaria-amigos',
    nombre: 'Veterinaria Amigos',
    descripcion: 'Atención veterinaria, vacunas y peluquería canina.',
    direccion: 'Rivadavia 240, San Luis',
    rubro: 'Veterinarias',
    emoji: '🐾',
    delivery: false,
    delivery_whatsapp: null,
  },
  {
    id: '7',
    slug: 'heladeria-polar',
    nombre: 'Heladería Polar',
    descripcion: 'Helados artesanales con sabores únicos de la región.',
    direccion: 'Belgrano 670, San Luis',
    rubro: 'Heladerías',
    emoji: '🍦',
    delivery: true,
    delivery_whatsapp: '5492664100007',
  },
  {
    id: '8',
    slug: 'optica-vision',
    nombre: 'Óptica Visión',
    descripcion: 'Anteojos, lentes de contacto y exámenes visuales.',
    direccion: 'Chacabuco 150, San Luis',
    rubro: 'Ópticas',
    emoji: '👓',
    delivery: false,
    delivery_whatsapp: null,
  },
  {
    id: '9',
    slug: 'rotiseria-la-familia',
    nombre: 'Rotisería La Familia',
    descripcion: 'Comidas caseras, empanadas y minutas a toda hora.',
    direccion: 'Justo Daract 420, San Luis',
    rubro: 'Rotiserías',
    emoji: '🥘',
    delivery: true,
    delivery_whatsapp: '5492664100009',
  },
  {
    id: '10',
    slug: 'ferreteria-el-tornillo',
    nombre: 'Ferretería El Tornillo',
    descripcion: 'Todo en herramientas, materiales y artículos del hogar.',
    direccion: 'Naciones Unidas 55, San Luis',
    rubro: 'Ferreterías',
    emoji: '🔧',
    delivery: false,
    delivery_whatsapp: null,
  },
]

const DEMO_OFICIOS: Oficio[] = [
  { nombre: 'Martín Electricista', oficio: 'Electricidad', zona: 'Centro', precio: 'desde $5.000', disponible: true, wa: '5492664000001' },
  { nombre: 'Pablo Plomero', oficio: 'Plomería', zona: 'Villa Mercedes', precio: 'desde $4.000', disponible: true, wa: '5492664000002' },
  { nombre: 'Lucas Pintor', oficio: 'Pintura', zona: 'Toda la ciudad', precio: 'desde $8.000 x ambiente', disponible: false, wa: '5492664000003' },
  { nombre: 'Sol Limpieza', oficio: 'Limpieza del hogar', zona: 'Norte', precio: '$3.500/hora', disponible: true, wa: '5492664000004' },
  { nombre: 'Diego IT', oficio: 'Informática', zona: 'Capital', precio: 'desde $6.000', disponible: true, wa: '5492664000005' },
  { nombre: 'Ana Jardines', oficio: 'Jardín y paisajismo', zona: 'Sur', precio: 'desde $5.500', disponible: true, wa: '5492664000006' },
  { nombre: 'Carlos Gas', oficio: 'Gas', zona: 'Centro / Este', precio: 'desde $7.000', disponible: false, wa: '5492664000007' },
  { nombre: 'Laura Masajes', oficio: 'Masajes a domicilio', zona: 'Capital', precio: '$4.000/hora', disponible: true, wa: '5492664000008' },
]

// ─── Page (server) ─────────────────────────────────────────────────────────

export default async function MarketPage() {
  const db = createAdminClient()

  // Intentar cargar desde DB; si falla, usar demo
  const { data: comerciosRaw } = await db
    .from('mp_comercios')
    .select('id, slug, nombre, descripcion, direccion, rubro, emoji, delivery, delivery_whatsapp')
    .eq('activo', true)
    .order('created_at', { ascending: false })

  const { data: oficiosRaw } = await db
    .from('mp_oficios')
    .select('nombre, oficio, zona, precio, disponible, whatsapp')
    .eq('activo', true)
    .order('created_at', { ascending: false })

  const comercios: Comercio[] =
    comerciosRaw && comerciosRaw.length > 0
      ? (comerciosRaw as unknown as Comercio[])
      : DEMO_COMERCIOS

  const oficios: Oficio[] =
    oficiosRaw && oficiosRaw.length > 0
      ? oficiosRaw.map((o: Record<string, unknown>) => ({
          nombre: String(o.nombre ?? ''),
          oficio: String(o.oficio ?? ''),
          zona: String(o.zona ?? ''),
          precio: String(o.precio ?? ''),
          disponible: Boolean(o.disponible),
          wa: String(o.whatsapp ?? ''),
        }))
      : DEMO_OFICIOS

  return <MarketClient comercios={comercios} oficios={oficios} />
}
