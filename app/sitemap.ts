import { MetadataRoute } from 'next'

const BASE = 'https://divinia.vercel.app'

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = [
    { url: BASE, priority: 1.0, changeFrequency: 'weekly' as const },
    { url: `${BASE}/precios`, priority: 0.9, changeFrequency: 'monthly' as const },
    { url: `${BASE}/turnero`, priority: 0.9, changeFrequency: 'monthly' as const },
    { url: `${BASE}/rubros`, priority: 0.8, changeFrequency: 'monthly' as const },
    { url: `${BASE}/academy`, priority: 0.8, changeFrequency: 'weekly' as const },
    { url: `${BASE}/onboarding`, priority: 0.8, changeFrequency: 'monthly' as const },
    { url: `${BASE}/auditoria`, priority: 0.7, changeFrequency: 'monthly' as const },
    { url: `${BASE}/terminos`, priority: 0.3, changeFrequency: 'yearly' as const },
    { url: `${BASE}/privacidad`, priority: 0.3, changeFrequency: 'yearly' as const },
  ]

  const rubros = [
    'peluqueria', 'nails', 'clinica', 'odontologia', 'gimnasio',
    'spa', 'veterinaria', 'hotel', 'restaurante', 'psicologia',
  ]

  const rubroRoutes = rubros.map(r => ({
    url: `${BASE}/rubros#${r}`,
    priority: 0.6,
    changeFrequency: 'monthly' as const,
  }))

  return [
    ...staticRoutes,
    ...rubroRoutes,
  ].map(r => ({
    ...r,
    lastModified: new Date(),
  }))
}
