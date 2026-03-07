import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase'

export async function GET() {
  try {
    const db = createAdminClient()
    const { data, error } = await db
      .from('templates')
      .select('id, name, rubro, description, color_primary, price_monthly, trial_days, welcome_message, system_prompt, faqs')
      .eq('is_active', true)
      .order('rubro')

    if (error) throw error
    return NextResponse.json({ templates: data })
  } catch (error) {
    return NextResponse.json({ templates: [] })
  }
}
