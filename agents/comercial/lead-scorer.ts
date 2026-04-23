// Wrapper sobre lib/anthropic.ts calificarLead + lógica de scoring local
import { calificarLead } from '@/lib/anthropic'
import type { Lead, LeadScore } from './types'

// Rubros con alta conversión para Turnero (más puntos)
const HIGH_VALUE_RUBROS = [
  'nails', 'estetica', 'peluqueria', 'spa',
  'psicologia', 'odontologia', 'clinica',
  'veterinaria', 'gimnasio',
]

export function scoreLocal(lead: Partial<Lead>): number {
  let score = 0
  if (lead.rubro && HIGH_VALUE_RUBROS.includes(lead.rubro)) score += 30
  if (lead.phone) score += 15
  if (lead.instagram) score += 10
  if (lead.website) score += 10
  if (lead.source === 'en_persona') score += 20
  if (lead.source === 'referido') score += 25
  if (lead.source === 'market') score += 15
  return Math.min(score, 100)
}

export async function scoreLead(lead: Lead): Promise<LeadScore> {
  const result = await calificarLead({
    company_name: lead.company_name,
    rubro: lead.rubro,
    city: lead.city ?? 'San Luis',
    phone: lead.phone,
    email: lead.email,
    website: lead.website,
    instagram: lead.instagram,
    notes: lead.notes,
  })

  // Combinar score IA con score local (60/40)
  const localScore = scoreLocal(lead)
  const combinedScore = Math.round(result.score * 0.6 + localScore * 0.4)

  return {
    score: combinedScore,
    nivel: combinedScore >= 70 ? 'caliente' : combinedScore >= 40 ? 'tibio' : 'frio',
    razones: [result.razon],
    dolor_principal: result.dolor_principal,
    servicio_recomendado: result.servicio_recomendado,
    precio_estimado: result.precio_estimado,
    proxima_accion: result.proxima_accion,
    mensaje_wa: result.mensaje_wa,
  }
}

export function shouldAutoPropose(score: number): boolean {
  return score >= 70
}
