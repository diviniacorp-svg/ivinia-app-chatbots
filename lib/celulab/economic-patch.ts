type EconomicFields = {
  total_ars?: number | null
  part_cost_ars?: number | null
  commission_pct?: number | null
  commission_ars?: number | null
}

const fields = ['total_ars', 'part_cost_ars', 'commission_pct'] as const

/** Calculate from the saved order, never from a default or today's partner rate. */
export function economicPatch(previous: EconomicFields, patch: Record<string, unknown>): EconomicFields {
  const result: EconomicFields = {}
  let changed = false
  for (const field of fields) {
    if (!Object.hasOwn(patch, field)) continue
    const value = patch[field]
    if (value !== null && (typeof value !== 'number' || !Number.isFinite(value) || value < 0 || (field === 'commission_pct' && value > 100))) {
      throw new Error(`Valor inválido para ${field}`)
    }
    if (field === 'commission_pct' && value === null) throw new Error('El porcentaje no puede quedar vacío')
    result[field] = value as number | null
    if (value !== previous[field]) changed = true
  }
  // A status-only update or an unchanged budget must preserve the saved amount.
  if (!changed) return result
  const merged = { ...previous, ...result }
  if (fields.some(field => merged[field] === null || merged[field] === undefined)) {
    result.commission_ars = null
  } else {
    for (const field of fields) {
      const value = merged[field]!
      if (!Number.isFinite(value) || value < 0 || (field === 'commission_pct' && value > 100)) throw new Error('La orden contiene importes o porcentaje inválidos')
    }
    result.commission_ars = Math.round((merged.total_ars! - merged.part_cost_ars!) * merged.commission_pct! / 100)
  }
  return result
}
