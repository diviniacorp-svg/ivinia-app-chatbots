import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { generateChatbotId, generateEmbedCode } from '@/lib/utils'
import { TEMPLATES_DATA } from '@/lib/templates-data'
import { sendTrialNotification, sendWelcomeEmail } from '@/lib/resend'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('clients')
      .select('*, booking_configs(id, is_active)')
      .order('created_at', { ascending: false })

    if (error) throw error
    return NextResponse.json({ clients: data })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      company_name, contact_name, email, phone,
      rubro, city, template_id, plan = 'trial',
      custom_name, custom_horario, lead_id,
      products = ['chatbot'],  // ['chatbot', 'turnos'] | ['turnos'] | ['chatbot']
    } = body

    if (!company_name || !email) {
      return NextResponse.json({ error: 'company_name y email son requeridos' }, { status: 400 })
    }

    const wantsChatbot = (products as string[]).includes('chatbot')

    // Buscar template por ID o por rubro
    let templateData = null
    if (template_id) {
      const { data } = await supabaseAdmin.from('templates').select('*').eq('id', template_id).single()
      templateData = data
    } else if (rubro) {
      const { data } = await supabaseAdmin.from('templates').select('*').eq('rubro', rubro).eq('is_active', true).single()
      templateData = data
    }

    // Si no hay template en DB, usar datos locales
    if (!templateData && rubro) {
      const localTemplate = TEMPLATES_DATA.find(t => t.rubro === rubro)
      if (localTemplate) {
        templateData = {
          ...localTemplate,
          id: null,
          system_prompt: localTemplate.system_prompt
            .replace(/{NOMBRE_NEGOCIO}/g, company_name)
            .replace(/{CIUDAD}/g, city || 'Argentina')
            .replace(/{HORARIO}/g, custom_horario || 'Lunes a Viernes 9-18hs'),
          welcome_message: localTemplate.welcome_message
            .replace(/{NOMBRE_NEGOCIO}/g, company_name),
        }
      }
    }

    // Solo generar chatbot si lo eligieron
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://divinia.vercel.app'
    const chatbot_id = wantsChatbot ? generateChatbotId() : null
    const embed_code = wantsChatbot && chatbot_id ? generateEmbedCode(chatbot_id, appUrl) : null

    const custom_config = {
      company_name,
      city: city || '',
      rubro: rubro || '',
      horario: custom_horario || '',
      system_prompt: templateData?.system_prompt || `Sos el asistente de ${company_name}. Respondé consultas con amabilidad.`,
      welcome_message: templateData?.welcome_message || `¡Hola! Soy el asistente de ${company_name}. ¿En qué puedo ayudarte?`,
      faqs: templateData?.faqs || [],
      color: templateData?.color_primary || '#6366f1',
      products: (products as string[]).join(','),
    }

    const trialDays = templateData?.trial_days || 14
    const trial_start = new Date().toISOString()
    const trial_end = new Date(Date.now() + trialDays * 24 * 60 * 60 * 1000).toISOString()

    const { data, error } = await supabaseAdmin
      .from('clients')
      .insert({
        lead_id: lead_id || null,
        template_id: templateData?.id || null,
        company_name,
        contact_name: contact_name || '',
        email,
        phone: phone || '',
        custom_config,
        chatbot_id,
        embed_code,
        plan,
        status: plan === 'trial' ? 'trial' : 'active',
        trial_start,
        trial_end,
      })
      .select()
      .single()

    if (error) throw error

    // Notificaciones solo si tiene chatbot
    if (wantsChatbot && chatbot_id && embed_code) {
      Promise.all([
        sendTrialNotification({
          company_name, contact_name: contact_name || '',
          email, phone: phone || '', rubro: rubro || '', city: city || '', chatbot_id,
        }),
        sendWelcomeEmail({
          company_name, contact_name: contact_name || '',
          email, chatbot_id, embed_code, trial_end,
        }),
      ]).catch(err => console.error('Email notification error:', err))
    }

    return NextResponse.json({ client: data })
  } catch (error) {
    console.error('Create client error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error al crear cliente' },
      { status: 500 }
    )
  }
}
