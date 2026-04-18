/**
 * POST /api/leads/capture
 * Recibe leads del formulario de la landing y los guarda en Supabase.
 * Automáticamente score el lead y activa outreach si score ≥70.
 */

import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { negocio, rubro, telefono, ciudad, email, instagram, canal_entrada } = body

    if (!negocio || !telefono) {
      return NextResponse.json({ error: 'negocio y telefono requeridos' }, { status: 400 })
    }

    // Calcular score básico en el momento
    let score = 20
    if (rubro && ['peluquería', 'estética', 'odontología', 'gimnasio', 'spa', 'masajes'].some(r => rubro.toLowerCase().includes(r))) score += 30
    if (instagram) score += 20
    if (ciudad?.toLowerCase().includes('san luis')) score += 15
    if (email) score += 10
    if (telefono) score += 5

    const { data: lead, error } = await supabaseAdmin
      .from('leads')
      .insert({
        negocio,
        rubro,
        telefono,
        ciudad: ciudad || 'San Luis',
        email: email || null,
        instagram: instagram || null,
        canal_entrada: canal_entrada || 'landing',
        score,
        status: 'nuevo',
      })
      .select('id, score')
      .single()

    if (error) throw error

    // Si score ≥70 → activar pipeline de ventas automáticamente
    if (lead && lead.score >= 70) {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_URL || 'https://divinia.vercel.app'
        // Fire and forget — no bloqueamos la respuesta
        fetch(`${baseUrl}/api/sales/pipeline`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ accion: 'outreach', lead_id: lead.id, tipo: 'wa' }),
        }).catch(() => {})
      } catch { /* no bloqueante */ }
    }

    return NextResponse.json({
      success: true,
      lead_id: lead?.id,
      score: lead?.score,
      mensaje: '¡Gracias! Te contactamos en menos de 1 hora.',
    })

  } catch (err) {
    console.error('[Lead Capture]', err)
    return NextResponse.json({ error: 'Error guardando lead' }, { status: 500 })
  }
}
