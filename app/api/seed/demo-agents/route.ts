/**
 * GET /api/seed/demo-agents
 * Crea runs de demo para que la Oficina de Agentes se vea viva.
 * Solo para desarrollo / demo.
 */

import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase'

const DEMO_RUNS = [
  { agent: 'luna',   department: 'clientes',  status: 'running',   action: 'Calificando 3 leads nuevos de San Luis' },
  { agent: 'nico',   department: 'clientes',  status: 'running',   action: 'Enviando propuesta a peluquería El Estilo' },
  { agent: 'copy',   department: 'contenido', status: 'success',   action: 'Caption Instagram para estética Rosa' },
  { agent: 'nova',   department: 'ia-auto',   status: 'success',   action: 'Researching Claude Design API updates' },
  { agent: 'max',    department: 'web-apps',  status: 'running',   action: 'Deploy fix en /reservas/[id]' },
  { agent: 'franco', department: 'finanzas',  status: 'success',   action: 'Reporte financiero semana del 14/04' },
  { agent: 'flow',   department: 'ia-auto',   status: 'running',   action: 'Diseñando flujo de WhatsApp para odontología' },
  { agent: 'reel',   department: 'contenido', status: 'success',   action: 'Prompts Freepik para turnero estética' },
  { agent: 'closer', department: 'clientes',  status: 'running',   action: 'Follow-up cliente gimnasio San Luis' },
]

export async function GET() {
  const db = createAdminClient()

  const now = new Date()
  const runs = DEMO_RUNS.map((r, i) => ({
    agent: r.agent,
    department: r.department,
    action: r.action,
    status: r.status,
    duration_ms: r.status === 'success' ? Math.floor(Math.random() * 3000) + 500 : null,
    created_at: new Date(now.getTime() - (i * 4 + 1) * 60000).toISOString(),
  }))

  const { error } = await db.from('agent_runs').insert(runs)

  if (error) {
    return NextResponse.json({
      ok: false,
      error: error.message,
      hint: 'Corré el schema SQL en Supabase primero',
    }, { status: 500 })
  }

  // CEO plan demo
  await db.from('agent_logs').upsert({
    agent: 'ceo-orchestrator',
    action: 'daily_plan',
    date: now.toISOString().split('T')[0],
    payload: {
      resumen: 'DIVINIA tiene 3 leads calientes en San Luis. Nico está en contacto con una peluquería de alto potencial. Prioridad: cerrar al menos 1 Turnero hoy.',
      prioridad_joaco: 'Llamar a María García de Peluquería El Estilo — mostrar demo en vivo',
      tareas_agentes: [
        { agente: 'ventas', tarea: 'Seguir up con 3 leads', urgencia: 'alta' },
        { agente: 'contenido', tarea: 'Publicar Post 1 Instagram', urgencia: 'media' },
      ],
      alertas: ['0 cierres esta semana — urgente activar ventas'],
      metricas: { leads_hoy: 3, clientes_activos: 1, reservas_hoy: 7 },
    },
    created_at: now.toISOString(),
  }, { onConflict: 'agent,date' })

  return NextResponse.json({ ok: true, runs_creados: runs.length, mensaje: 'Demo activo — recargá /agents' })
}
