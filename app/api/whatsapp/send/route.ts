/**
 * POST /api/whatsapp/send — envío proactivo de WhatsApp via Twilio
 * Usado para follow-ups automáticos, notificaciones de turno, etc.
 */

import { NextRequest, NextResponse } from 'next/server'
import {
  sendWhatsAppMessage,
  sendWhatsAppBulk,
  buildFollowUpMessage,
  buildProposalMessage,
  buildTurneroConfirmation,
} from '@/lib/twilio'
import { generateFollowUp } from '@/agents/comercial/follow-up'
import { createAdminClient } from '@/lib/supabase'
import type { Lead } from '@/agents/comercial/types'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { tipo } = body

    switch (tipo) {

      case 'directo': {
        // Envío directo con mensaje pre-armado
        const { to, message } = body
        if (!to || !message) {
          return NextResponse.json({ error: 'to y message requeridos' }, { status: 400 })
        }
        const result = await sendWhatsAppMessage(to, message)
        return NextResponse.json({ ok: result.success, ...result })
      }

      case 'follow-up': {
        // Genera el mensaje con IA y lo envía
        const { lead_id, company_name, rubro, city, phone, dias_sin_respuesta, contexto } = body
        if (!company_name || !phone) {
          return NextResponse.json({ error: 'company_name y phone requeridos' }, { status: 400 })
        }

        const lead: Lead = {
          id: lead_id,
          company_name,
          rubro: rubro || 'negocio',
          city: city || 'San Luis',
          phone,
          stage: 'propuesta_enviada',
          score: 0,
          source: 'manual',
        }

        const followUp = await generateFollowUp(lead, dias_sin_respuesta || 2, contexto)
        const messageText = followUp.mensaje || buildFollowUpMessage(
          company_name,
          `https://wa.me/5492664000000?text=Hola%20Joaco`
        )

        const result = await sendWhatsAppMessage(phone, messageText)

        // Log
        const db = createAdminClient()
        Promise.resolve(db.from('agent_runs').insert({
          agent: 'follow-up',
          department: 'clientes',
          action: `Follow-up WA enviado a ${company_name}`,
          status: result.success ? 'success' : 'error',
          metadata: { lead_id, phone, sid: result.sid, tono: (followUp as any).tono },
        })).catch(() => {})

        return NextResponse.json({
          ok: result.success,
          sid: result.sid,
          message_sent: messageText,
          tono: followUp.tono,
          error: result.error,
        })
      }

      case 'propuesta': {
        // Notifica que se envió una propuesta
        const { to, company_name, proposal_url } = body
        if (!to || !company_name || !proposal_url) {
          return NextResponse.json({ error: 'to, company_name y proposal_url requeridos' }, { status: 400 })
        }
        const message = buildProposalMessage(company_name, proposal_url)
        const result = await sendWhatsAppMessage(to, message)
        return NextResponse.json({ ok: result.success, ...result })
      }

      case 'turno': {
        // Confirmación de turno desde Turnero
        const { to, client_name, service, date, time, business_name, panel_url } = body
        if (!to || !client_name || !date || !time) {
          return NextResponse.json({ error: 'to, client_name, date y time requeridos' }, { status: 400 })
        }
        const message = buildTurneroConfirmation({
          clientName: client_name,
          service: service || 'turno',
          date,
          time,
          businessName: business_name || 'el negocio',
          panelUrl: panel_url || '',
        })
        const result = await sendWhatsAppMessage(to, message)
        return NextResponse.json({ ok: result.success, ...result })
      }

      case 'bulk': {
        // Envío masivo (máximo 50)
        const { messages } = body
        if (!Array.isArray(messages) || messages.length === 0) {
          return NextResponse.json({ error: 'messages[] requerido' }, { status: 400 })
        }
        if (messages.length > 50) {
          return NextResponse.json({ error: 'Máximo 50 mensajes por bulk' }, { status: 400 })
        }
        const results = await sendWhatsAppBulk(messages)
        const succeeded = results.filter(r => r.success).length
        return NextResponse.json({
          ok: succeeded === results.length,
          total: results.length,
          succeeded,
          failed: results.length - succeeded,
          results,
        })
      }

      default:
        return NextResponse.json({
          error: `tipo inválido. Opciones: directo, follow-up, propuesta, turno, bulk`,
        }, { status: 400 })
    }

  } catch (err) {
    console.error('[whatsapp/send]', err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({
    api: 'DIVINIA WhatsApp Send',
    tipos: {
      directo: '{ tipo: "directo", to: "+5492661234567", message: "..." }',
      'follow-up': '{ tipo: "follow-up", company_name, phone, rubro?, dias_sin_respuesta? }',
      propuesta: '{ tipo: "propuesta", to, company_name, proposal_url }',
      turno: '{ tipo: "turno", to, client_name, service, date, time, business_name }',
      bulk: '{ tipo: "bulk", messages: [{ to, body }] }',
    },
  })
}
