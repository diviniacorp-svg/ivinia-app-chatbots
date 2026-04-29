export type BillingCycle = 'mensual' | 'anual' | 'unico'

export interface PlanPrice {
  ars: number
  cycle: BillingCycle
  label: string
}

export interface ProductPlan {
  id: string
  name: string
  description: string
  price: PlanPrice
  features: string[]
  highlighted?: boolean
}

export interface ProductAddon {
  id: string
  name: string
  price: PlanPrice
}

// ─── TURNERO IA ──────────────────────────────────────────────────────────────
// Agenda online + recordatorios automáticos + seña MercadoPago

export const TURNERO_PLANS: ProductPlan[] = [
  {
    id: 'turnero-mensual',
    name: 'Mensual',
    description: 'Ideal para empezar. Cancelás cuando quieras.',
    price: { ars: 45_000, cycle: 'mensual', label: '$45.000/mes' },
    features: [
      'Agenda online 24/7',
      'Hasta 3 servicios',
      'Recordatorios automáticos por WhatsApp',
      'Panel de administración',
      'Seña online con MercadoPago',
      'Soporte por WhatsApp',
    ],
  },
  {
    id: 'turnero-anual',
    name: 'Anual',
    description: '2 meses gratis vs. mensual. El más elegido.',
    price: { ars: 35_000, cycle: 'mensual', label: '$35.000/mes (facturado $420.000/año)' },
    features: [
      'Todo lo del plan mensual',
      'Servicios ilimitados',
      'Ahorro de $120.000 vs. pago mensual',
      'Prioridad en soporte',
    ],
    highlighted: true,
  },
  {
    id: 'turnero-unico',
    name: 'Pago Único',
    description: 'Pagás una vez, el sistema es tuyo para siempre.',
    price: { ars: 120_000, cycle: 'unico', label: '$120.000 pago único' },
    features: [
      'Todo lo del plan anual',
      'Sin pagos recurrentes',
      'Código personalizado para tu marca',
      'Dominio propio incluido 1 año',
      'Capacitación 1:1 incluida',
    ],
  },
]

export const TURNERO_ADDONS: ProductAddon[] = [
  {
    id: 'mantenimiento-basico',
    name: 'Mantenimiento Básico',
    price: { ars: 40_000, cycle: 'mensual', label: '$40.000/mes' },
  },
  {
    id: 'mantenimiento-pro',
    name: 'Mantenimiento Pro',
    price: { ars: 70_000, cycle: 'mensual', label: '$70.000/mes' },
  },
]

// ─── LANDING PAGE ────────────────────────────────────────────────────────────
// Sitio web profesional para PYMEs — pago único + hosting opcional

export const LANDING_PLANS: ProductPlan[] = [
  {
    id: 'landing-basico',
    name: 'Básico',
    description: 'Presencia online profesional. Rápido y efectivo.',
    price: { ars: 150_000, cycle: 'unico', label: '$150.000 pago único' },
    features: [
      'Diseño personalizado 1 página',
      'Secciones: Hero · Servicios · Sobre nosotros · Contacto',
      'Formulario de contacto',
      'Integración WhatsApp',
      'Optimizado para Google (SEO básico)',
      'Entrega en 5 días hábiles',
    ],
  },
  {
    id: 'landing-pro',
    name: 'Pro',
    description: 'Para negocios que quieren destacar y vender más.',
    price: { ars: 280_000, cycle: 'unico', label: '$280.000 pago único' },
    features: [
      'Todo lo del plan Básico',
      'Hasta 5 páginas',
      'Blog o sección de novedades',
      'Galería de productos/servicios',
      'Integración Google Analytics',
      'Chat de WhatsApp flotante',
      'Entrega en 10 días hábiles',
    ],
    highlighted: true,
  },
]

export const LANDING_ADDONS: ProductAddon[] = [
  {
    id: 'hosting-mensual',
    name: 'Hosting + Dominio',
    price: { ars: 15_000, cycle: 'mensual', label: '$15.000/mes' },
  },
  {
    id: 'updates-mensual',
    name: 'Actualizaciones mensuales',
    price: { ars: 25_000, cycle: 'mensual', label: '$25.000/mes' },
  },
]

// ─── NUCLEUS IA ──────────────────────────────────────────────────────────────
// Agente de IA privado para cada PYME — el cerebro del negocio

export const NUCLEUS_PLANS: ProductPlan[] = [
  {
    id: 'nucleus-basico',
    name: 'NUCLEUS Básico',
    description: 'Un agente de IA entrenado con tu negocio. Responde clientes, recuerda contexto.',
    price: { ars: 500_000, cycle: 'unico', label: '$500.000 setup' },
    features: [
      'Agente Claude entrenado con tu negocio',
      'Base de conocimiento personalizada',
      'Integración en tu web o WhatsApp',
      'Panel de control y configuración',
      'Capacitación al equipo',
      'Soporte 30 días post-entrega',
    ],
  },
  {
    id: 'nucleus-pro',
    name: 'NUCLEUS Pro',
    description: 'Múltiples agentes coordinados. Para negocios que quieren IA real.',
    price: { ars: 800_000, cycle: 'unico', label: '$800.000 setup' },
    features: [
      'Todo lo del plan Básico',
      'Hasta 3 agentes especializados (ventas, soporte, operaciones)',
      'Memoria persistente entre conversaciones',
      'Integraciones con sistema propio (CRM, ERP, agenda)',
      'Dashboard analítico de uso',
      'Soporte 60 días + reunión mensual',
    ],
    highlighted: true,
  },
]

export const NUCLEUS_MENSUAL: ProductAddon[] = [
  {
    id: 'nucleus-mantenimiento',
    name: 'Operación y mejoras continuas',
    price: { ars: 150_000, cycle: 'mensual', label: '$150.000/mes' },
  },
  {
    id: 'nucleus-mantenimiento-pro',
    name: 'Operación Pro (multi-agente)',
    price: { ars: 250_000, cycle: 'mensual', label: '$250.000/mes' },
  },
]

// ─── EXPORT CENTRAL ──────────────────────────────────────────────────────────

export const DIVINIA_PRODUCTS = {
  turnero: {
    id: 'turnero',
    name: 'Turnero IA',
    emoji: '📅',
    tagline: 'Tu agenda siempre abierta. Clientes que reservan solos.',
    description: 'Sistema de turnos online con recordatorios automáticos y cobro de señas. Funciona 24/7 sin que tengas que hacer nada.',
    plans: TURNERO_PLANS,
    addons: TURNERO_ADDONS,
    color: '#7C3AED',
    publicUrl: '/contratar/turnero',
    demoUrl: '/turnos/demo-rufina',
  },
  landing: {
    id: 'landing',
    name: 'Landing Page',
    emoji: '🌐',
    tagline: 'Tu negocio en internet. Profesional y que convierte.',
    description: 'Sitio web diseñado para convertir visitantes en clientes. Rápido, optimizado para Google y con tu identidad visual.',
    plans: LANDING_PLANS,
    addons: LANDING_ADDONS,
    color: '#0284C7',
    publicUrl: '/contratar/landing',
    demoUrl: null,
  },
  nucleus: {
    id: 'nucleus',
    name: 'NUCLEUS IA',
    emoji: '🧠',
    tagline: 'El cerebro de IA para tu PYME. Entrenado con tu negocio.',
    description: 'Agente de inteligencia artificial privado, entrenado con la información de tu empresa. Atiende clientes, recuerda contexto y mejora con el tiempo.',
    plans: NUCLEUS_PLANS,
    addons: NUCLEUS_MENSUAL,
    color: '#16A34A',
    publicUrl: '/contratar/nucleus',
    demoUrl: null,
  },
} as const

export type ProductId = keyof typeof DIVINIA_PRODUCTS
