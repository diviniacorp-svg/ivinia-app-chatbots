import type { TURNERO_PLANS } from '@/lib/turnero-plans'

export type TurneroPlanId = 'mensual' | 'anual' | 'unico' | 'enterprise'

export type RubroTurnero =
  | 'peluqueria' | 'nails' | 'estetica' | 'spa'
  | 'clinica' | 'odontologia' | 'psicologia' | 'veterinaria'
  | 'gimnasio' | 'restaurante' | 'hotel' | 'hosteria'
  | 'abogado' | 'contabilidad' | 'default'

export interface TurneroLead {
  company_name: string
  rubro: RubroTurnero
  city?: string
  phone?: string
  instagram?: string
  nota?: string            // contexto adicional del vendedor
}

export interface DemoRecommendation {
  rubro: RubroTurnero
  demo_url: string
  pitch_opening: string          // frase de apertura para mostrar la demo
  pain_points: string[]          // 3 dolores específicos del rubro
  killer_question: string        // la pregunta que hace que el cliente diga "sí, eso me pasa"
  upsell_hint: string            // qué producto recomendar en mes 2
}

export interface ProposalContent {
  headline: string               // título de la propuesta (corto, impacta)
  subtitulo: string
  problema: string               // el dolor del cliente en sus propias palabras
  solucion: string               // qué hace el Turnero por este negocio específico
  que_incluye: string[]          // lista de lo que recibe
  resultado_esperado: string     // "en 30 días vas a..."
  plan_recomendado: TurneroPlanId
  precio_display: string         // "$45.000/mes" formateado
  precio_numerico: number
  adelanto: number               // 50% del precio
  cta_texto: string              // texto del botón de pago
  garantia: string               // frase de cierre que reduce riesgo
  mensaje_wa: string             // mensaje WA listo para enviar junto al link
}

export interface ObjectionResponse {
  objection: string              // la objeción detectada
  response: string               // respuesta personalizada (2-3 oraciones)
  follow_up_question: string     // pregunta para mantener la conversación viva
  close_attempt: string          // frase de cierre después de manejar la objeción
}
