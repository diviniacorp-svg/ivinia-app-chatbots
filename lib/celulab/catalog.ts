// Technical categories stay outside the public accessories catalogue.
export function isTechnicalCategory(category: string) {
  return /herramient|repuesto|servicio\s*t[eé]cnico|^st$|insumos?\s*(t[eé]cnicos?|reparaci[oó]n)/i.test(category)
}

export function searchable(value: string) {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()
}

function isRepairBattery(category: string, name: string) {
  const label = searchable(category + ' ' + name)
  if (/\b(power ?banks?|portatil|extern[ao]s?|recargables? aa)\b/.test(label)) return false
  return /\bbaterias?\b/.test(label) && (/^baterias?( |$)/.test(searchable(category)) || /\b(iphone|samsung|motorola|moto|xiaomi|redmi|galaxy|interna|repuesto)\b/.test(label))
}

export function isAccessoryProduct(category: string, name: string){
 return !isTechnicalCategory(category) && !isRepairBattery(category,name)
}
export function accessoryFinalPrice(cost:number,markup:number){
 return Math.round(cost*(1+markup/100))
}
