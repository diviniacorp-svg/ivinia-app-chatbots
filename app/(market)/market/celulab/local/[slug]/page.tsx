import { createAdminClient } from '@/lib/supabase'
import { notFound } from 'next/navigation'
import LocalPartnerClient from './_components/LocalPartnerClient'

export const dynamic = 'force-dynamic'

export default async function LocalPartnerPage({ params }: { params: { slug: string } }) {
  const db = createAdminClient()
  const { data: partner } = await db
    .from('cl_partners')
    .select('id, name, address, phone, logo_url, pin, is_active, commission_pct')
    .eq('slug', params.slug)
    .single()

  if (!partner) notFound()

  return (
    <LocalPartnerClient
      partnerId={partner.id}
      partnerName={partner.name}
      partnerAddress={partner.address ?? ''}
      partnerPhone={partner.phone ?? ''}
      logoUrl={partner.logo_url ?? ''}
      pin={partner.pin}
      isActive={partner.is_active ?? true}
      commissionPct={partner.commission_pct ?? 33}
    />
  )
}