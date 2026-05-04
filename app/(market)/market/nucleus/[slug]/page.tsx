import { createAdminClient } from '@/lib/supabase'
import { notFound } from 'next/navigation'
import NucleusAdminClient from './_components/NucleusAdminClient'

export const dynamic = 'force-dynamic'

async function getClientBySlug(slug: string) {
  const db = createAdminClient()

  // Try chatbot_id first (exact match)
  const { data: byId } = await db
    .from('clients')
    .select('id, company_name, custom_config, chatbot_id')
    .eq('chatbot_id', slug)
    .maybeSingle()

  if (byId) return byId

  // Fallback: match nucleus_slug inside custom_config JSONB
  const { data: bySlug } = await db
    .from('clients')
    .select('id, company_name, custom_config, chatbot_id')
    .filter('custom_config->>nucleus_slug', 'eq', slug)
    .maybeSingle()

  return bySlug
}

export default async function NucleusAdminPage({ params }: { params: { slug: string } }) {
  const client = await getClientBySlug(params.slug)
  if (!client) notFound()

  const cfg = client.custom_config as Record<string, string> ?? {}
  const pin = cfg.nucleus_panel_pin || '0000'

  return (
    <NucleusAdminClient
      clientId={client.id}
      companyName={client.company_name}
      pin={pin}
      color={cfg.color || '#2563eb'}
    />
  )
}
