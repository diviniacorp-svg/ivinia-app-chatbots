import { ApifyClient } from 'apify-client'

const client = new ApifyClient({ token: process.env.APIFY_API_TOKEN })

export interface ScrapedLead {
  company_name: string
  contact_name: string
  phone: string
  email: string
  website: string
  instagram: string
  city: string
  rubro: string
  score: number
  rating?: number
  reviews?: number
  address?: string
}

function calculateScore(lead: Partial<ScrapedLead> & { rating?: number; reviews?: number }): number {
  let score = 0
  if (lead.email) score += 30
  if (lead.website) score += 20
  if (lead.rating && lead.rating >= 4) score += 20
  if (lead.reviews && lead.reviews >= 50) score += 15
  if (lead.instagram) score += 15
  return Math.min(score, 100)
}

export async function scrapeLeads(rubro: string, city: string, maxItems = 20): Promise<ScrapedLead[]> {
  const searchQuery = `${rubro} en ${city}`

  const run = await client.actor('apify/google-maps-scraper').call({
    searchStringsArray: [searchQuery],
    maxCrawledPlacesPerSearch: maxItems,
    language: 'es',
    countryCode: 'AR',
    includeHistogram: false,
    includeOpeningHours: false,
    includePeopleAlsoSearch: false,
    maxImages: 0,
    exportPlaceUrls: false,
    additionalInfo: false,
    scrapeDirectories: false,
    deeperCityScrape: false,
  })

  const { items } = await client.dataset(run.defaultDatasetId).listItems()

  return items.map((item: Record<string, unknown>) => {
    const lead: Partial<ScrapedLead> & { rating?: number; reviews?: number } = {
      company_name: (item.title as string) || '',
      phone: (item.phone as string) || '',
      email: (item.email as string) || '',
      website: (item.website as string) || '',
      city: city,
      rubro: rubro,
      rating: item.totalScore as number,
      reviews: item.reviewsCount as number,
      address: (item.address as string) || '',
      instagram: '',
    }

    // Extraer Instagram de redes sociales si está disponible
    const socialLinks = item.socialLinks as Record<string, string> || {}
    if (socialLinks.instagram) {
      lead.instagram = socialLinks.instagram
    }

    lead.score = calculateScore(lead)

    return lead as ScrapedLead
  }).filter((lead: ScrapedLead) => lead.company_name)
}
