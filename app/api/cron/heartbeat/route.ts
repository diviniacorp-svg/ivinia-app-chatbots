/**
 * DIVINIA NUCLEUS — CEO Orchestrator Heartbeat v2
 * Vercel Cron: 9am Argentina (12 UTC)
 * GET /api/cron/heartbeat
 *
 * 1. Lee el estado completo de DIVINIA desde Supabase
 * 2. Claude decide las 3 prioridades del día
 * 3. Activa agentes automáticamente según el estado
 * 4. Guarda el plan en Supabase (lo muestra el dashboard)
 * 5. Envía email con el plan diario a Joaco (Resend)
 */

import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { Resend } from 'resend'
import { supabaseAdmin } from '@/lib/supabase'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })
const resend = new Resend(process.env.RESEND_API_KEY!)

// ─── 1. Estado completo de DIVINIA ────────────────────────────────────────────

async function getDIVINIAState() {
  const today = new Date().toISOString().split('T')[0]

  try {
    // Usar la vista ceo_metrics si existe, sino calcular manualmente
    const [metricsRes, leadsRes, clientsRes, memoryRes, contentRes] = await Promise.all([
      supabaseAdmin.from('ceo_metrics').select('*').single(),
      supabaseAdmin.from('leads')
        .select('id, negocio, rubro, score, status, ciudad, telefono, ultimo_contacto')
        .in('status', ['nuevo', 'contactado'])
        .order('score', { ascending: false })
        .limit(5),
      supabaseAdmin.from('clients')
        .select('id, company_name, rubro, status, mrr, trial_end, created_at')
        .in('status', ['active', 'trial'])
        .limit(10),
      supabaseAdmin.from('nucleus_memory')
        .select('contenido, tipo, importancia')
        .eq('activo', true)
        .order('importancia', { ascending: false })
        .limit(5),
      supabaseAdmin.from('content_calendar')
        .select('tipo, plataforma, status, titulo')
        .eq('fecha', today)
        .limit(3),
    ])

    const metrics = metricsRes.data || {}
    const topLeads = leadsRes.data || []
    const clientes = clientsRes.data || []
    const memoria = memoryRes.data || []
    const contenidoHoy = contentRes.data || []

    // Clientes con trial venciendo en 3 días
    const trialsVenciendo = clientes.filter(c => {
      if (c.status !== 'trial' || !c.trial_end) return false
      const dias = Math.ceil((new Date(c.trial_end).getTime() - Date.now()) / 86400000)
      return dias >= 0 && dias <= 3
    })

    return {
      fecha: today,
      hora: new Date().toLocaleTimeString('es-AR', { timeZone: 'America/Argentina/Buenos_Aires', hour: '2-digit', minute: '2-digit' }),
      metrics: {
        leads_nuevos: (metrics as Record<string,number>).leads_nuevos || topLeads.length,
        leads_calientes: (metrics as Record<string,number>).leads_calientes || topLeads.filter(l => l.score >= 70).length,
        clientes_activos: (metrics as Record<string,number>).clientes_activos || clientes.filter(c => c.status === 'active').length,
        en_trial: (metrics as Record<string,number>).en_trial || clientes.filter(c => c.status === 'trial').length,
        mrr_actual: (metrics as Record<string,number>).mrr_actual || 0,
        reservas_hoy: (metrics as Record<string,number>).reservas_hoy || 0,
        contenido_hoy: contenidoHoy.length,
        trials_venciendo: trialsVenciendo.length,
      },
      top_leads: topLeads.slice(0, 3),
      trials_venciendo: trialsVenciendo,
      memoria_reciente: memoria,
      contenido_hoy: contenidoHoy,
    }
  } catch (err) {
    console.error('[Heartbeat] Error leyendo estado:', err)
    return {
      fecha: today,
      hora: '09:00',
      metrics: { leads_nuevos: 0, leads_calientes: 0, clientes_activos: 0, en_trial: 0, mrr_actual: 0, reservas_hoy: 0, contenido_hoy: 0, trials_venciendo: 0 },
      top_leads: [],
      trials_venciendo: [],
      memoria_reciente: [],
      contenido_hoy: [],
    }
  }
}

// ─── 2. CEO decide el plan del día ────────────────────────────────────────────

async function runCEO(state: Awaited<ReturnType<typeof getDIVINIAState>>) {
  const msg = await anthropic.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 1000,
    system: `Sos el CEO autónomo de DIVINIA — empresa de IA para PYMEs argentinas.

PRODUCTOS: Turnero ($43k/mes o $100k único), Chatbot WA ($150k-$250k), Content Factory ($80k-$150k/mes), NUCLEUS (sistema IA completo para empresas).

TU TRABAJO: Analizás el estado de la empresa y decidís las 3 acciones más importantes para HOY.
Priorizás SIEMPRE lo que genera ingresos directos.
Español argentino. Directo. Sin vueltas.

Devolvé SOLO JSON válido:
{
  "resumen": "2-3 oraciones del estado actual de DIVINIA",
  "estado_emoji": "🟢|🟡|🔴",
  "prioridad_joaco": "LA acción física más importante que Joaco debe hacer hoy",
  "agentes_a_activar": [
    {"agente": "id-del-agente", "razon": "por qué ahora", "urgencia": "alta|media|baja"}
  ],
  "tareas_autonomas": [
    {"tarea": "qué va a hacer el sistema solo", "responsable": "agente o depto"}
  ],
  "alertas": ["alerta crítica si existe"],
  "insight_del_dia": "algo relevante que Joaco debería saber",
  "metricas": {
    "mrr_actual": 0,
    "leads_calientes": 0,
    "clientes_activos": 0,
    "reservas_hoy": 0
  }
}`,
    messages: [{
      role: 'user',
      content: `Estado DIVINIA ${state.fecha} ${state.hora}:

MÉTRICAS:
- Leads nuevos sin contactar: ${state.metrics.leads_nuevos}
- Leads calientes (score≥70): ${state.metrics.leads_calientes}
- Clientes activos: ${state.metrics.clientes_activos}
- En trial: ${state.metrics.en_trial}
- MRR actual: $${state.metrics.mrr_actual.toLocaleString('es-AR')} ARS
- Reservas hoy: ${state.metrics.reservas_hoy}
- Trials venciendo en 3 días: ${state.metrics.trials_venciendo}

TOP LEADS:
${state.top_leads.map(l => `- ${l.negocio || 'Sin nombre'} (${l.rubro}) — Score: ${l.score} — ${l.ciudad}`).join('\n') || 'Ninguno todavía'}

TRIALS VENCIENDO:
${state.trials_venciendo.map((c: any) => `- ${c.company_name} (${c.rubro}) — vence: ${c.trial_end}`).join('\n') || 'Ninguno'}

MEMORIA RECIENTE:
${state.memoria_reciente.map(m => `- [${m.tipo}] ${m.contenido}`).join('\n') || 'Sin memoria previa'}

CONTENIDO HOY:
${state.contenido_hoy.map(c => `- ${c.tipo} en ${c.plataforma}: ${c.titulo || 'sin título'} (${c.status})`).join('\n') || 'Nada planificado'}

Generá el plan de acción de hoy.`,
    }],
  })

  try {
    const text = msg.content[0].type === 'text' ? msg.content[0].text : '{}'
    const json = text.match(/\{[\s\S]*\}/)?.[0] || '{}'
    return JSON.parse(json)
  } catch {
    return {
      resumen: 'DIVINIA despertó. Analizando estado del sistema.',
      estado_emoji: '🟡',
      prioridad_joaco: 'Verificar conexión a Supabase y cargar primeros leads',
      agentes_a_activar: [],
      tareas_autonomas: [{ tarea: 'Prospector busca leads en San Luis', responsable: 'prospector' }],
      alertas: [],
      insight_del_dia: 'El primer cliente Turnero está a un DM de distancia.',
      metricas: { mrr_actual: 0, leads_calientes: 0, clientes_activos: 0, reservas_hoy: 0 },
    }
  }
}

// ─── 3. Activar agentes automáticamente ──────────────────────────────────────

async function activarAgentes(plan: Record<string, unknown>, baseUrl: string) {
  const agentesActivar = (plan.agentes_a_activar as Array<{agente: string; urgencia: string}>) || []
  const resultados: string[] = []

  for (const { agente, urgencia } of agentesActivar) {
    if (urgencia !== 'alta') continue // Solo activamos urgencia alta automáticamente

    try {
      // Mapear agente a comando dispatch
      const comandosMap: Record<string, string> = {
        'prospector': 'buscá leads de peluquerías y estéticas en San Luis',
        'calificador-leads': 'calificá todos los leads nuevos',
        'redactor-outreach': 'generá mensajes de outreach para los leads calientes',
        'agente-seguimiento': 'hacé seguimiento de leads sin respuesta',
        'estratega-contenido': 'planificá el contenido de esta semana',
        'gestor-retencion': 'revisá clientes en riesgo',
      }

      const comando = comandosMap[agente]
      if (!comando) continue

      const res = await fetch(`${baseUrl}/api/agents/dispatch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command: comando }),
      })

      if (res.ok) {
        resultados.push(`✅ ${agente} activado`)
      }
    } catch {
      resultados.push(`⚠️ ${agente} no pudo activarse`)
    }
  }

  return resultados
}

// ─── 4. Email a Joaco ─────────────────────────────────────────────────────────

async function enviarEmailJoaco(plan: Record<string, unknown>, state: Awaited<ReturnType<typeof getDIVINIAState>>) {
  const m = plan.metricas as Record<string, number> || {}
  const agentes = (plan.agentes_a_activar as Array<{agente: string; razon: string; urgencia: string}>) || []
  const tareas = (plan.tareas_autonomas as Array<{tarea: string; responsable: string}>) || []
  const alertas = (plan.alertas as string[]) || []

  const emailHtml = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: -apple-system, sans-serif; max-width: 600px; margin: 0 auto; background: #09090b; color: #fafafa; padding: 24px;">

  <div style="text-align: center; margin-bottom: 32px;">
    <div style="font-size: 40px;">${plan.estado_emoji || '🧠'}</div>
    <h1 style="color: #8B5CF6; margin: 8px 0; font-size: 24px;">DIVINIA — Plan del día</h1>
    <p style="color: #6b7280; margin: 0;">${state.fecha} · ${state.hora} Buenos Aires</p>
  </div>

  <div style="background: #1a1a2e; border: 1px solid #8B5CF620; border-radius: 12px; padding: 20px; margin-bottom: 20px;">
    <p style="margin: 0; font-size: 16px; line-height: 1.6;">${plan.resumen || ''}</p>
  </div>

  ${alertas.length > 0 ? `
  <div style="background: #3b0000; border: 1px solid #ef4444; border-radius: 12px; padding: 16px; margin-bottom: 20px;">
    <p style="color: #ef4444; font-weight: bold; margin: 0 0 8px;">🚨 ALERTAS</p>
    ${alertas.map((a: string) => `<p style="margin: 4px 0; color: #fca5a5;">• ${a}</p>`).join('')}
  </div>` : ''}

  <div style="background: #0f2027; border: 1px solid #EC489940; border-radius: 12px; padding: 20px; margin-bottom: 20px;">
    <p style="color: #EC4899; font-weight: bold; margin: 0 0 8px;">🔴 TU TAREA HOY, JOACO</p>
    <p style="margin: 0; font-size: 16px; font-weight: 600;">${plan.prioridad_joaco || ''}</p>
  </div>

  <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 20px;">
    ${[
      { label: 'MRR', valor: `$${(m.mrr_actual || 0).toLocaleString('es-AR')} ARS` },
      { label: 'Leads calientes', valor: m.leads_calientes || 0 },
      { label: 'Clientes activos', valor: m.clientes_activos || 0 },
      { label: 'Reservas hoy', valor: m.reservas_hoy || 0 },
    ].map(({ label, valor }) => `
    <div style="background: #111827; border: 1px solid #374151; border-radius: 8px; padding: 12px; text-align: center;">
      <p style="color: #6b7280; font-size: 12px; margin: 0 0 4px;">${label}</p>
      <p style="color: #fafafa; font-size: 20px; font-weight: bold; margin: 0;">${valor}</p>
    </div>`).join('')}
  </div>

  ${tareas.length > 0 ? `
  <div style="background: #111827; border: 1px solid #374151; border-radius: 12px; padding: 16px; margin-bottom: 20px;">
    <p style="color: #8B5CF6; font-weight: bold; margin: 0 0 10px;">⚡ EL SISTEMA HACE SOLO</p>
    ${tareas.map((t: {tarea: string; responsable: string}) => `
    <div style="display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid #1f2937;">
      <span style="color: #d1d5db;">${t.tarea}</span>
      <span style="color: #8B5CF6; font-size: 12px;">${t.responsable}</span>
    </div>`).join('')}
  </div>` : ''}

  ${agentes.length > 0 ? `
  <div style="background: #111827; border: 1px solid #374151; border-radius: 12px; padding: 16px; margin-bottom: 20px;">
    <p style="color: #10B981; font-weight: bold; margin: 0 0 10px;">🤖 AGENTES ACTIVADOS</p>
    ${agentes.map((a: {agente: string; razon: string; urgencia: string}) => `
    <p style="margin: 4px 0; color: #d1d5db;">• <strong>${a.agente}</strong> — ${a.razon}</p>`).join('')}
  </div>` : ''}

  <div style="background: #0f2027; border: 1px solid #8B5CF640; border-radius: 12px; padding: 16px; margin-bottom: 24px;">
    <p style="color: #a78bfa; font-weight: bold; margin: 0 0 8px;">💡 INSIGHT DEL DÍA</p>
    <p style="margin: 0; color: #d1d5db;">${plan.insight_del_dia || ''}</p>
  </div>

  <div style="text-align: center;">
    <a href="https://divinia.vercel.app/dashboard/agents" style="display: inline-block; background: #8B5CF6; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; margin-right: 8px;">Ver Dashboard</a>
    <a href="https://divinia.vercel.app/api/cron/heartbeat" style="display: inline-block; background: #374151; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none;">Re-ejecutar</a>
  </div>

  <p style="text-align: center; color: #374151; font-size: 12px; margin-top: 24px;">DIVINIA OS — El sistema que trabaja mientras dormís</p>
</body>
</html>`

  try {
    await resend.emails.send({
      from: 'DIVINIA CEO <onboarding@resend.dev>',
      to: ['diviniacorp@gmail.com'],
      subject: `${plan.estado_emoji || '🧠'} DIVINIA ${state.fecha} — ${String(plan.prioridad_joaco || 'Plan del día listo').slice(0, 50)}`,
      html: emailHtml,
    })
    return true
  } catch (err) {
    console.error('[Heartbeat] Error enviando email:', err)
    return false
  }
}

// ─── 5. Guardar plan en Supabase ──────────────────────────────────────────────

async function guardarPlan(plan: object, state: Awaited<ReturnType<typeof getDIVINIAState>>) {
  try {
    await supabaseAdmin.from('agent_logs').upsert({
      agent: 'ceo-orchestrator',
      action: 'daily_plan',
      date: state.fecha,
      payload: plan,
      created_at: new Date().toISOString(),
    }, { onConflict: 'agent,date,action' })

    // Guardar en memoria del sistema
    await supabaseAdmin.from('nucleus_memory').insert({
      tipo: 'estado',
      agente: 'ceo-orchestrator',
      contenido: `Plan ${state.fecha}: ${(plan as Record<string,string>).resumen || ''}`,
      importancia: 7,
      tags: ['daily-plan', state.fecha],
    })
  } catch (err) {
    console.error('[Heartbeat] Error guardando plan:', err)
  }
}

// ─── Handler principal ────────────────────────────────────────────────────────

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET

  if (cronSecret && authHeader !== `Bearer ${cronSecret}` && process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const startMs = Date.now()
  const baseUrl = process.env.NEXT_PUBLIC_URL || 'https://divinia.vercel.app'

  try {
    const state = await getDIVINIAState()

    const plan = await runCEO(state)

    const [_guardado, _agentes, emailOk] = await Promise.all([
      guardarPlan(plan, state),
      activarAgentes(plan, baseUrl),
      enviarEmailJoaco(plan, state),
    ])

    return NextResponse.json({
      success: true,
      orchestrator: 'CEO DIVINIA v2',
      fecha: state.fecha,
      email_enviado: emailOk,
      estado: state.metrics,
      plan,
      durationMs: Date.now() - startMs,
    })

  } catch (err) {
    console.error('[CEO] Error crítico:', err)
    return NextResponse.json({
      success: false,
      error: String(err),
      durationMs: Date.now() - startMs,
    }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  return GET(req)
}
