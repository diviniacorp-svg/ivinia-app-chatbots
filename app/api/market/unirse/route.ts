/**
 * DIVINIA Market San Luis — Registro de comercio
 * POST /api/market/unirse
 *
 * Flujo autónomo:
 *   1. Recibe datos del formulario del comercio
 *   2. Calcula score de calificación por rubro + datos
 *   3. Crea lead en Supabase `leads`
 *   4. Envía WA de bienvenida via Twilio (inmediato)
 *   5. Notifica a Joaco por email (Resend) si score ≥ 50
 */

import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase'
import { sendWhatsAppMessage } from '@/lib/twilio'

export const dynamic = 'force-dynamic'

// Rubros con alta probabilidad de conversión a Turnero
const RUBROS_HOT: Record<string, number> = {
  peluqueria: 25, barberia: 25, nails: 25, uñas: 25,
  estetica: 20, spa: 20,
  odontologia: 22, dental: 22, clinica: 20, medico: 18,
  veterinaria: 20,
  gimnasio: 18, pilates: 18, yoga: 15,
  taller: 15, mecanica: 15,
  hotel: 12, hospedaje: 12,
}

function calcularScore(rubro: string, email: string, telefono: string): number {
  let score = 30 // base

  const rubroLower = rubro.toLowerCase()
  const bonusRubro = Object.entries(RUBROS_HOT).find(([k]) => rubroLower.includes(k))
  if (bonusRubro) score += bonusRubro[1]

  if (email && email.includes('@')) score += 15
  if (telefono && telefono.length >= 8) score += 10

  return Math.min(score, 100)
}

function mensajeWA(nombre: string, rubro: string): string {
  return `¡Hola! 👋 Gracias por registrar *${nombre}* en Market San Luis.

Tu negocio ya está visible para miles de vecinos de la ciudad.

Por cierto: vemos que sos ${rubro} — ¿sabías que podés recibir turnos online 24hs de forma automática, sin que te llamen y sin responder WhatsApp?

👉 *Turnero DIVINIA* toma los turnos solo, los confirma, y manda recordatorio al cliente. Todo automatizado.

¿Querés que te mostremos cómo quedaría para tu negocio? Es gratis verlo 🙌`
}

function htmlEmailJoaco(lead: {
  company_name: string; rubro: string; phone: string; email: string; score: number
}): string {
  const urgencia = lead.score >= 70 ? '🔴 CALIENTE' : lead.score >= 50 ? '🟡 TIBIO' : '⚪ FRÍO'
  return `
    <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px">
      <h2 style="margin:0 0 4px">${urgencia} Nuevo lead Market San Luis</h2>
      <p style="color:#666;margin:0 0 20px;font-size:13px">Score: <strong>${lead.score}/100</strong></p>
      <table style="width:100%;border-collapse:collapse;font-size:14px">
        <tr><td style="padding:8px 0;border-bottom:1px solid #f0f0f0;color:#888;width:120px">Negocio</td><td style="padding:8px 0;border-bottom:1px solid #f0f0f0"><strong>${lead.company_name}</strong></td></tr>
        <tr><td style="padding:8px 0;border-bottom:1px solid #f0f0f0;color:#888">Rubro</td><td style="padding:8px 0;border-bottom:1px solid #f0f0f0">${lead.rubro}</td></tr>
        <tr><td style="padding:8px 0;border-bottom:1px solid #f0f0f0;color:#888">Teléfono</td><td style="padding:8px 0;border-bottom:1px solid #f0f0f0">${lead.phone || '—'}</td></tr>
        <tr><td style="padding:8px 0;color:#888">Email</td><td style="padding:8px 0">${lead.email || '—'}</td></tr>
      </table>
      <a href="https://divinia.vercel.app/comercial" style="display:inline-block;margin-top:20px;padding:10px 20px;background:#C6FF3D;color:#09090B;border-radius:8px;text-decoration:none;font-weight:700;font-size:13px">
        Ver en CRM →
      </a>
      <p style="margin-top:12px;font-size:12px;color:#aaa">Ya le mandamos un WA de bienvenida automático.</p>
    </div>
  `
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { nombre, rubro, telefono, email } = body as {
      nombre: string; rubro: string; telefono?: string; email?: string
    }

    if (!nombre || !rubro) {
      return NextResponse.json({ error: 'nombre y rubro son requeridos' }, { status: 400 })
    }

    const score = calcularScore(rubro, email ?? '', telefono ?? '')
    const db = createAdminClient()

    // 1. Crear/actualizar lead en Supabase
    const { data: lead, error: leadError } = await db
      .from('leads')
      .upsert({
        company_name: nombre,
        rubro,
        phone: telefono ?? '',
        email: email ?? '',
        city: 'San Luis',
        score,
        status: 'nuevo',
        source: 'market-san-luis',
        notes: `Registro automático desde Market San Luis. Score: ${score}/100.`,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'company_name,city,rubro' })
      .select('id, company_name, rubro, phone, email, score')
      .single()

    if (leadError) {
      console.error('[market/unirse] lead upsert error:', leadError)
    }

    // 2. WA de bienvenida — no bloqueante
    if (telefono) {
      const digitos = telefono.replace(/\D/g, '')
      const e164 = digitos.startsWith('54') ? `+${digitos}` : `+54${digitos}`
      sendWhatsAppMessage(e164, mensajeWA(nombre, rubro)).catch(e =>
        console.error('[market/unirse] WA send error:', e)
      )
    }

    // 3. Email a Joaco si score ≥ 50 — no bloqueante
    if (score >= 50 && lead) {
      ;(async () => {
        try {
          const { Resend } = await import('resend')
          const resend = new Resend(process.env.RESEND_API_KEY)
          const urgencia = score >= 70 ? '🔴 CALIENTE' : '🟡 TIBIO'
          await resend.emails.send({
            from: 'DIVINIA Leads <noreply@divinia.ar>',
            to: ['diviniacorp@gmail.com'],
            subject: `${urgencia} Nuevo lead Market: ${nombre} (score ${score})`,
            html: htmlEmailJoaco(lead),
          })
        } catch (e) {
          console.error('[market/unirse] email error:', e)
        }
      })()
    }

    return NextResponse.json({
      ok: true,
      lead_id: lead?.id,
      score,
      wa_sent: !!telefono,
    })

  } catch (e) {
    console.error('[market/unirse]', e)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
