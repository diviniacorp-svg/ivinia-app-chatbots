import { createClient, SupabaseClient } from '@supabase/supabase-js'

export function createAdminClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!
  return createClient(url, key)
}

export function createAnonClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  return createClient(url, key)
}

// Compatibilidad: objetos que crean cliente fresco en cada llamada
export const supabaseAdmin = { from: (...a: Parameters<SupabaseClient['from']>) => createAdminClient().from(...a) } as unknown as SupabaseClient
export const supabase = { from: (...a: Parameters<SupabaseClient['from']>) => createAnonClient().from(...a) } as unknown as SupabaseClient

export type Database = {
  templates: {
    id: string
    name: string
    rubro: string
    description: string
    system_prompt: string
    welcome_message: string
    faqs: { q: string; a: string }[]
    color_primary: string
    price_monthly: number
    trial_days: number
    is_active: boolean
    created_at: string
  }
  leads: {
    id: string
    company_name: string
    contact_name: string
    phone: string
    email: string
    website: string
    instagram: string
    city: string
    rubro: string
    score: number
    status: string
    notes: string
    source: string
    outreach_sent: boolean
    created_at: string
    updated_at: string
  }
  clients: {
    id: string
    lead_id: string
    template_id: string
    company_name: string
    contact_name: string
    email: string
    phone: string
    custom_config: Record<string, unknown>
    chatbot_id: string
    embed_code: string
    plan: string
    status: string
    trial_start: string
    trial_end: string
    mp_subscription_id: string
    created_at: string
  }
}
