import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { TEMPLATES_DATA } from '@/lib/templates-data'

export async function GET() {
  try {
    // Insertar templates (upsert por name)
    // Borrar templates existentes y reinsertar
    await supabaseAdmin.from('templates').delete().neq('id', '00000000-0000-0000-0000-000000000000')

    const { data, error } = await supabaseAdmin
      .from('templates')
      .insert(
        TEMPLATES_DATA.map(t => ({
          name: t.name,
          rubro: t.rubro,
          description: t.description,
          system_prompt: t.system_prompt,
          welcome_message: t.welcome_message,
          faqs: t.faqs,
          color_primary: t.color_primary,
          price_monthly: t.price_monthly,
          trial_days: t.trial_days,
          is_active: true,
        }))
      )
      .select()

    if (error) throw error

    return NextResponse.json({
      success: true,
      message: `${data?.length || 0} templates cargados correctamente`,
      templates: data?.map(t => ({ id: t.id, name: t.name, rubro: t.rubro })),
    })
  } catch (error) {
    console.error('SEED ERROR:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : String(error), details: JSON.stringify(error) },
      { status: 500 }
    )
  }
}
