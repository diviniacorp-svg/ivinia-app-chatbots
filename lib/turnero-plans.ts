// FUENTE DE VERDAD de precios DIVINIA. Nunca hardcodear precios en componentes.
// Precios en ARS. Última actualización: abril 2026.

export const TURNERO_PLANS = [
  {
    id: 'mensual',
    nombre: 'Mensual',
    precio: 45000,
    billing: '/mes',
    color: '#6B7280',
    descripcion: 'Sin permanencia. Cancelás cuando querés.',
    popular: false,
    features: [
      'Página de reservas pública personalizada',
      'Hasta 3 servicios',
      'Panel del negocio incluido',
      'QR imprimible para el local',
      'Confirmación por WhatsApp',
      'Soporte por email',
    ],
    limites: {
      servicios: 3,
      profesionales: 1,
      recordatorios_auto: false,
      sena_online: false,
      chatbot: false,
    },
  },
  {
    id: 'anual',
    nombre: 'Anual',
    precio: 35000,
    billing: '/mes (facturado $420.000/año)',
    color: '#C6FF3D',
    descripcion: '2 meses gratis vs el plan mensual.',
    popular: true,
    features: [
      'Todo del plan Mensual',
      'Servicios y profesionales ilimitados',
      'Recordatorios automáticos WhatsApp',
      'Estadísticas avanzadas',
      'Prioridad en soporte',
    ],
    limites: {
      servicios: -1,
      profesionales: -1,
      recordatorios_auto: true,
      sena_online: false,
      chatbot: false,
    },
  },
  {
    id: 'unico',
    nombre: 'Pago Único',
    precio: 120000,
    billing: 'pago único',
    color: '#818CF8',
    descripcion: 'Pagás una vez, el sistema es tuyo.',
    popular: false,
    features: [
      'Todo del plan Anual',
      'Cobro de seña via MercadoPago',
      'Múltiples profesionales',
      'Bloqueo de horarios',
      '6 meses de soporte incluido',
      'Actualizaciones del sistema',
    ],
    limites: {
      servicios: -1,
      profesionales: -1,
      recordatorios_auto: true,
      sena_online: true,
      chatbot: false,
    },
  },
  {
    id: 'enterprise',
    nombre: 'Todo DIVINIA',
    precio: 120000,
    billing: '/mes',
    color: '#FF5E3A',
    descripcion: 'Turnero + Chatbot WA + Contenido IA.',
    popular: false,
    features: [
      'Turnero completo ilimitado',
      'Chatbot WhatsApp 24hs con IA',
      '12 posts mensuales con IA',
      'Captions + hashtags + diseño',
      'Múltiples sucursales',
      'Soporte dedicado WhatsApp',
    ],
    limites: {
      servicios: -1,
      profesionales: -1,
      recordatorios_auto: true,
      sena_online: true,
      chatbot: true,
    },
  },
]

// Planes de mantenimiento (para clientes con pago único)
export const MAINTENANCE_PLANS = [
  { id: 'mant-basico', nombre: 'Básico', precio: 40000, features: ['1 ajuste/mes', 'Monitoreo mensual', 'Respuesta 48hs'] },
  { id: 'mant-pro',    nombre: 'Pro',    precio: 70000, features: ['Ajustes ilimitados', 'Monitoreo semanal', 'Respuesta 24hs'] },
]

export function getPlan(id: string) {
  return TURNERO_PLANS.find(p => p.id === id) ?? TURNERO_PLANS[0]
}

export function formatPrecio(precio: number) {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0,
  }).format(precio)
}
