/**
 * GET /api/seed/demo-agents
 * Crea runs de demo para que la Oficina de Agentes se vea viva.
 * Solo para desarrollo / demo.
 */

import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase'

const DEMO_RUNS = [
  { agent_name: 'luna',   status: 'running',   task: 'Calificando 3 leads nuevos de San Luis' },
  { agent_name: 'nico',   status: 'running',   task: 'Enviando propuesta a peluquería El Estilo' },
  { agent_name: 'copy',   status: 'completed', task: 'Caption Instagram para estética Rosa' },
  { agent_name: 'nova',   status: 'completed', task: 'Researching Claude Design API updates' },
  { agent_name: 'max',    status: 'running',   task: 'Deploy fix en /reservas/[id]' },
  { agent_name: 'franco', status: 'completed', task: 'Reporte financiero semana del 14/04' },
  { agent_name: 'flow',   status: 'running',   task: 'Diseñando flujo de WhatsApp para odontología' },
  { agent_name: 'reel',   status: 'completed', task: 'Prompts Freepik para turnero estética' },
  { agent_name: 'closer', status: 'running',   task: 'Follow-up cliente gimnasio San Luis' },
]

export async function GET() {
  const db = createAdminClient()

  // Limpiar runs viejas de demo
  await db.from('agent_runs').delete().like('id', 'demo-%')

  const now = new Date()
  const runs = DEMO_RUNS.map((r, i) => ({
    id: `demo-${r.agent_name}-${Date.now()}`,
    agent_name: r.agent_name,
    status: r.status,
    started_at: new Date(now.getTime() - (i * 4 + 1) * 60000).toISOString(),
    completed_at: r.status === 'completed'
      ? new Date(now.getTime() - i * 60000).toISOString()
      : null,
    result: r.status === 'completed'
      ? { message: 'Completado OK', task: r.task }
      : null,
  }))

  const { error } = await db.from('agent_runs').insert(runs)

  if (error) {
    // Si la tabla no existe, intentar crearla y reintentar
    return NextResponse.json({
      ok: false,
      error: error.message,
      hint: 'Corré el schema SQL en Supabase primero',
    }, { status: 500 })
  }

  // También guardar un plan demo del CEO
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

  return NextResponse.json({ ok: true, runs_creados: runs.length, mensaje: 'Demo activo — recargá /dashboard/agents' })
}
