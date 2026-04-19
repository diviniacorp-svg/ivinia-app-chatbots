export const TURNERO_PLANS = [
  {
    id: 'starter',
    nombre: 'Starter',
    precio: 35000,
    color: '#6B7280',
    descripcion: 'Para negocios chicos que arrancan',
    popular: false,
    features: [
      'Hasta 100 turnos/mes',
      'Página de reservas pública',
      'Recordatorios por WhatsApp (manual)',
      'Panel básico del negocio',
      'Soporte por email',
    ],
    limites: {
      turnos_mes: 100,
      profesionales: 1,
      recordatorios_auto: false,
      sena_online: false,
      chatbot: false,
    },
  },
  {
    id: 'pro',
    nombre: 'Pro',
    precio: 65000,
    color: '#C6FF3D',
    descripcion: 'El más popular — todo lo que necesitás',
    popular: true,
    features: [
      'Turnos ilimitados',
      'Hasta 3 profesionales',
      'Recordatorios automáticos WhatsApp',
      'Seña online vía MercadoPago',
      'Panel avanzado con estadísticas',
      'QR imprimible para el local',
      'Soporte prioritario',
    ],
    limites: {
      turnos_mes: -1,
      profesionales: 3,
      recordatorios_auto: true,
      sena_online: true,
      chatbot: false,
    },
  },
  {
    id: 'enterprise',
    nombre: 'Enterprise',
    precio: 120000,
    color: '#818CF8',
    descripcion: 'Para clínicas y negocios con múltiples sedes',
    popular: false,
    features: [
      'Todo lo del plan Pro',
      'Profesionales ilimitados',
      'Chatbot IA para WhatsApp incluido',
      'Múltiples sedes',
      'Reportes avanzados exportables',
      'Integración con Google Calendar',
      'Onboarding personalizado',
      'Soporte 24/7 WhatsApp',
    ],
    limites: {
      turnos_mes: -1,
      profesionales: -1,
      recordatorios_auto: true,
      sena_online: true,
      chatbot: true,
    },
  },
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
