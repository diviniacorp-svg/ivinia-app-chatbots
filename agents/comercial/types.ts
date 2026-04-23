export type LeadStage =
  | 'nuevo'
  | 'contactado'
  | 'demo_enviada'
  | 'propuesta_enviada'
  | 'negociacion'
  | 'cerrado'
  | 'perdido'

export type LeadSource = 'market' | 'instagram' | 'en_persona' | 'referido' | 'apify' | 'manual' | 'otro'

export interface Lead {
  id?: string
  company_name: string
  rubro: string
  city?: string
  phone?: string
  email?: string
  website?: string
  instagram?: string
  source: LeadSource
  stage: LeadStage
  score: number           // 0-100
  notes?: string
  created_at?: string
  updated_at?: string
}

export interface LeadScore {
  score: number
  nivel: 'caliente' | 'tibio' | 'frio'
  razones: string[]            // por qué ese score
  dolor_principal: string
  servicio_recomendado: string
  precio_estimado: number
  proxima_accion: string       // qué hacer exactamente ahora
  mensaje_wa: string           // mensaje WA listo para copiar y enviar
}

export interface FollowUpMessage {
  canal: 'whatsapp' | 'email'
  asunto?: string              // solo para email
  mensaje: string
  tono: 'amigable' | 'urgente' | 'valor'
  dias_sin_respuesta: number
}

export interface PipelineHealth {
  total_leads: number
  por_etapa: Record<LeadStage, number>
  score_promedio: number
  leads_calientes: number      // score >= 70
  conversion_rate: number      // cerrados / total
  mrr_potencial: number        // suma de precio_estimado de leads activos
  alertas: string[]            // leads que necesitan acción urgente
  recomendaciones: string[]    // qué hacer esta semana para cerrar más
}

export interface ProposalLink {
  lead_id: string
  url: string                  // /propuesta/[leadId]
  expires_at: string
  viewed_at?: string
  clicked_mp?: boolean
}
