export type QuoteOrderSeed = {
  quoteId: string, revision: number, partnerId: string | null, customer: string, phone: string,
  device: string, jobs: string[]
}
export function splitDevice(value: string) {
  const combined = value.trim().replace(/^Apple\s+iPhone\s+/i, 'iPhone ')
  const [brand, ...model] = combined.split(/\s+/)
  return { device_brand: /^moto$/i.test(brand) ? 'Motorola' : brand, device_model: model.join(' ') }
}
export function quoteJobsToReview(jobs: string[], verified: string[]) {
  const key = (value: string) => value.trim().toLocaleLowerCase('es-AR')
  const confirmed = new Set(verified.map(key))
  return Array.from(new Set(jobs)).filter(job => !confirmed.has(key(job)))
}
