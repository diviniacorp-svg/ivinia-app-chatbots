import { redirect } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export default async function DemoRedirect({
  params,
}: {
  params: { chatbotId: string }
}) {
  const db = createAdminClient()

  // Buscar cliente por chatbot_id
  const { data: client } = await db
    .from('clients')
    .select('id')
    .eq('chatbot_id', params.chatbotId)
    .maybeSingle()

  if (!client) {
    redirect('/')
  }

  // Buscar booking config
  const { data: configs } = await db
    .from('booking_configs')
    .select('id')
    .eq('client_id', client.id)
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(1)

  const config = configs?.[0]

  if (!config) {
    redirect('/')
  }

  redirect(`/reservas/${config.id}`)
}
