import { NextRequest, NextResponse } from 'next/server'
import { sendOutreachEmail } from '@/lib/resend'
import { supabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const { to, subject, body, leadId, campaignId } = await request.json()

    if (!to || !subject || !body) {
      return NextResponse.json({ error: 'to, subject y body son requeridos' }, { status: 400 })
    }

    const result = await sendOutreachEmail({ to, subject, body })

    // Guardar registro del mensaje si hay leadId
    if (leadId) {
      await supabaseAdmin.from('outreach_messages').insert({
        lead_id: leadId,
        campaign_id: campaignId || null,
        channel: 'email',
        subject,
        message: body,
        status: 'sent',
        sent_at: new Date().toISOString(),
        resend_message_id: result.id,
      })

      // Marcar lead como contactado
      await supabaseAdmin
        .from('leads')
        .update({ status: 'contactado', outreach_sent: true, updated_at: new Date().toISOString() })
        .eq('id', leadId)
    }

    return NextResponse.json({ success: true, messageId: result.id })
  } catch (error) {
    console.error('Send email error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error al enviar email' },
      { status: 500 }
    )
  }
}
