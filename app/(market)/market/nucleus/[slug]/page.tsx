import { createAdminClient } from '@/lib/supabase'
import { notFound } from 'next/navigation'
import NucleusAdminClient from './_components/NucleusAdminClient'
import BuggiNucleusClient from './_components/BuggiNucleusClient'

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

  const publicUrl = `https://divinia.vercel.app/market/${params.slug}`

  if (client.chatbot_id === 'buggi-viajes') {
    return (
      <BuggiNucleusClient
        clientId={client.id}
        companyName={client.company_name}
        pin={pin}
        color={cfg.color || '#1d4ed8'}
        publicUrl={publicUrl}
      />
    )
  }

  return (
    <NucleusAdminClient
      clientId={client.id}
      companyName={client.company_name}
      pin={params.slug === 'celulab' ? undefined : pin}
      color={cfg.color || '#2563eb'}
      publicUrl={publicUrl}
    />
  )
}