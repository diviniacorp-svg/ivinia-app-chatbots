import { NextRequest, NextResponse } from 'next/server'
import { createHmac } from 'crypto'
import { supabaseAdmin } from '@/lib/supabase'
import { TEMPLATES_DATA } from '@/lib/templates-data'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const secret = process.env.ADMIN_SECRET || 'divinia2024'
  const token = createHmac('sha256', secret).update('divinia_session_v1').digest('hex')
  const apiKey = request.headers.get('x-api-key')
  const cookie = request.cookies.get('divinia_session')?.value
  if (apiKey !== secret && cookie !== token) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

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
    return NextResponse.json({ error: 'Error al cargar templates' }, { status: 500 })
  }
}
