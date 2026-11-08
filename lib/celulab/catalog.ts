// Technical categories stay outside the public accessories catalogue.
export function isTechnicalCategory(category: string) {
  return /herramient|repuesto|servicio\s*t[eé]cnico|^st$|insumos?\s*(t[eé]cnicos?|reparaci[oó]n)/i.test(category)
}
