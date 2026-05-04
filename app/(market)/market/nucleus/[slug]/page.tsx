import { createAdminClient } from '@/lib/supabase'
import { notFound } from 'next/navigation'
import NucleusAdminClient from './_components/NucleusAdminClient'

export const dynamic = 'force-dynamic'

async function getClientBySlug(slug: string) {
  const db = createAdminClient()
  const { data } = await db
    .from('clients')
    .select('id, company_name, custom_config, chatbot_id')
    .or(`chatbot_id.eq.${slug},custom_config->>nucleus_slug.eq.${slug}`)
    .single()
  return data
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
