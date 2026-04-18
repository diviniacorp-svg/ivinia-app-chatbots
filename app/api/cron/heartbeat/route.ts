/**
 * DIVINIA — CEO Orchestrator Heartbeat
 * Vercel Cron: se ejecuta cada día a las 9am
 * GET /api/cron/heartbeat
 *
 * El CEO Orchestrator lee el estado de Supabase y decide qué hacer:
 * - Leads sin contactar → activa Agente de Ventas
 * - Clientes activos → genera contenido semanal
 * - Facturas pendientes → genera links MercadoPago
 * - Nuevas herramientas disponibles → actualiza departamentos
 */

import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { supabaseAdmin } from '@/lib/supabase'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })

// ─── Recolectar estado actual de DIVINIA ─────────────────────────────────────
async function getDIVINIAState() {
  const today = new Date().toISOString().split('T')[0]
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()

  try {
    const [leadsRes, clientsRes, bookingsRes] = await Promise.all([
      // Leads sin contactar en los últimos 3 días
      supabaseAdmin
        .from('leads')
        .select('id, name, business_name, rubro, score, status, created_at')
        .eq('status', 'nuevo')
        .order('score', { ascending: false })
        .limit(10),

      // Clientes activos
      supabaseAdmin
        .from('booking_configs')
        .select('config_id, business_name, rubro, created_at')
        .eq('active', true)
        .limit(20),

      // Reservas de hoy
      supabaseAdmin
        .from('bookings')
        .select('id, status, created_at')
        .gte('created_at', today)
        .limit(50),
    ])

    return {
      leads: {
        sinContactar: leadsRes.data?.length || 0,
        top: leadsRes.data?.slice(0, 3) || [],
      },
      clientes: {
        activos: clientsRes.data?.length || 0,
        lista: clientsRes.data || [],
      },
      reservasHoy: bookingsRes.data?.length || 0,
      fecha: today,
    }
  } catch (err) {
    console.error('[Heartbeat] Error leyendo estado:', err)
    return {
      leads: { sinContactar: 0, top: [] },
      clientes: { activos: 0, lista: [] },
      reservasHoy: 0,
      fecha: today,
    }
  }
}

// ─── CEO Orchestrator — Decide qué hacer hoy ────────────────────────────────
async function runCEOOrchestrator(state: Awaited<ReturnType<typeof getDIVINIAState>>) {
  const systemPrompt = `
Sos el CEO de DIVINIA, empresa de IA para PYMEs argentinas.
Producto hero: Turnero ($43.000/mes o $100.000 único).
Otros: Chatbot WA ($150k-$250k), Landing ($100k), Pack 3 automatizaciones ($300k).
Tono: directo, argentino, orientado a resultados.

Tu trabajo: analizar el estado actual y generar un plan de acción concreto para hoy.
Cada acción debe ser ejecutable por un agente de Claude.

Devolvé JSON con esta estructura exacta:
{
  "resumen": "1-2 oraciones del estado de DIVINIA hoy",
  "prioridad_joaco": "la única tarea que Joaco debe hacer HOY (acción física)",
  "tareas_agentes": [
    {
      "agente": "ventas|contenido|dev|diseño|legal",
      "tarea": "descripción concreta",
      "urgencia": "alta|media|baja",
      "comando_dispatch": "el comando exacto para enviar al dispatch API"
    }
  ],
  "alertas": ["alerta1", "alerta2"],
  "metricas": {
    "leads_hoy": 0,
    "clientes_activos": 0,
    "reservas_hoy": 0
  }
}
`.trim()

  const msg = await anthropic.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 800,
    system: systemPrompt,
    messages: [{
      role: 'user',
      content: `Estado DIVINIA ${state.fecha}:
- Leads sin contactar: ${state.leads.sinContactar}
- Top leads: ${JSON.stringify(state.leads.top)}
- Clientes activos: ${state.clientes.activos}
- Reservas hoy: ${state.reservasHoy}

Generá el plan de acción de hoy.`,
    }],
  })

  try {
    const text = msg.content[0].type === 'text' ? msg.content[0].text : '{}'
    const json = text.match(/\{[\s\S]*\}/)?.[0] || '{}'
    return JSON.parse(json)
  } catch {
    return {
      resumen: 'Error procesando estado',
      prioridad_joaco: 'Verificar conexión a Supabase',
      tareas_agentes: [],
      alertas: ['Error en CEO Orchestrator'],
      metricas: { leads_hoy: 0, clientes_activos: 0, reservas_hoy: 0 },
    }
  }
}

// ─── Guardar plan del día en Supabase ────────────────────────────────────────
async function saveDailyPlan(plan: object, date: string) {
  try {
    await supabaseAdmin
      .from('agent_logs')
      .insert({
        agent: 'ceo-orchestrator',
        action: 'daily_plan',
        payload: plan,
        created_at: new Date().toISOString(),
        date,
      })
  } catch {
    // La tabla puede no existir aún — no es bloqueante
  }
}

// ─── Handler principal ───────────────────────────────────────────────────────
export async function GET(req: NextRequest) {
  // Verificar que es Vercel Cron o una llamada autorizada
  const authHeader = req.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    // En producción verificar el secret. En dev, permitir sin auth.
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
  }

  const startMs = Date.now()

  try {
    // 1. Leer estado actual
    const state = await getDIVINIAState()

    // 2. CEO decide qué hacer
    const plan = await runCEOOrchestrator(state)

    // 3. Guardar plan del día
    await saveDailyPlan(plan, state.fecha)

    // 4. Retornar plan (el dashboard lo lee para mostrar la oficina)
    return NextResponse.json({
      success: true,
      orchestrator: 'CEO DIVINIA',
      fecha: state.fecha,
      estado: state,
      plan,
      durationMs: Date.now() - startMs,
      proximaEjecucion: 'mañana 9am',
    })

  } catch (err) {
    console.error('[Heartbeat] Error:', err)
    return NextResponse.json({
      success: false,
      error: String(err),
      durationMs: Date.now() - startMs,
    }, { status: 500 })
  }
}

// POST — permite disparar manualmente desde el celular
export async function POST(req: NextRequest) {
  return GET(req)
}
