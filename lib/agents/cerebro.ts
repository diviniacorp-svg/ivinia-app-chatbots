import Anthropic from '@anthropic-ai/sdk'
import { Resend } from 'resend'
import { createAdminClient } from '@/lib/supabase'
import { BaseAgent } from './base-agent'
import type { AgentResult } from './types'

const MODEL = 'claude-sonnet-4-6'
const MAX_TURNS = 6

export class CerebroAgent extends BaseAgent {
  constructor() {
    super('cerebro')
  }

  async run(_params?: unknown): Promise<AgentResult> {
    await this.logStart()
    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })
    const db = createAdminClient()
    const today = new Date().toISOString().split('T')[0]

    const tools: Anthropic.Tool[] = [
      {
        name: 'get_leads_stats',
        description: 'Estadísticas de leads: total, por status, leads calientes (score ≥70), nuevos hoy',
        input_schema: { type: 'object' as const, properties: {}, required: [] },
      },
      {
        name: 'get_clients_stats',
        description: 'Estadísticas de clientes: activos, pendientes de pago, distribución por plan',
        input_schema: { type: 'object' as const, properties: {}, required: [] },
      },
      {
        name: 'get_subscriptions_stats',
        description: 'Suscripciones activas, MRR estimado en ARS, pendientes de confirmar',
        input_schema: { type: 'object' as const, properties: {}, required: [] },
      },
      {
        name: 'get_agent_activity',
        description: 'Últimas corridas de agentes del sistema (agent_runs)',
        input_schema: {
          type: 'object' as const,
          properties: {
            limit: { type: 'number', description: 'Cantidad de runs (default 8)' },
          },
          required: [],
        },
      },
      {
        name: 'get_pending_content',
        description: 'Posts del calendario de contenido pendientes para los próximos 7 días',
        input_schema: { type: 'object' as const, properties: {}, required: [] },
      },
      {
        name: 'get_hot_leads_detail',
        description: 'Detalle de leads con score ≥ 70 que no fueron contactados',
        input_schema: { type: 'object' as const, properties: {}, required: [] },
      },
    ]

    const executeTool = async (name: string, input: Record<string, unknown>): Promise<unknown> => {
      switch (name) {
        case 'get_leads_stats': {
          const { data: leads } = await db.from('leads').select('status, score, created_at, rubro')
          const byStatus = leads?.reduce((acc: Record<string, number>, l) => {
            acc[l.status] = (acc[l.status] || 0) + 1
            return acc
          }, {}) ?? {}
          const hot = leads?.filter(l => (l.score || 0) >= 70).length ?? 0
          const newToday = leads?.filter(l => l.created_at?.startsWith(today)).length ?? 0
          const rubros: Record<string, number> = {}
          leads?.forEach(l => { if (l.rubro) rubros[l.rubro] = (rubros[l.rubro] || 0) + 1 })
          return { total: leads?.length ?? 0, by_status: byStatus, hot_leads: hot, new_today: newToday, top_rubros: rubros }
        }

        case 'get_clients_stats': {
          const { data: clients } = await db.from('clients').select('status, plan, created_at')
          const active = clients?.filter(c => c.status === 'active').length ?? 0
          const pending = clients?.filter(c => c.status === 'pending_payment').length ?? 0
          const plans: Record<string, number> = {}
          clients?.forEach(c => { if (c.plan) plans[c.plan] = (plans[c.plan] || 0) + 1 })
          return { total: clients?.length ?? 0, active, pending_payment: pending, by_plan: plans }
        }

        case 'get_subscriptions_stats': {
          const { data: subs } = await db.from('subscriptions').select('estado, plan, monto_ars')
          const active = subs?.filter(s => s.estado === 'active' || s.estado === 'authorized').length ?? 0
          const mrr = subs
            ?.filter(s => s.estado === 'active' || s.estado === 'authorized')
            .reduce((sum, s) => sum + (s.monto_ars || 0), 0) ?? 0
          const pending = subs?.filter(s => s.estado === 'pending').length ?? 0
          return { total: subs?.length ?? 0, active, pending, mrr_ars: mrr }
        }

        case 'get_agent_activity': {
          const limit = (input.limit as number) || 8
          const { data } = await db
            .from('agent_runs')
            .select('agent, status, created_at, error_msg')
            .order('created_at', { ascending: false })
            .limit(limit)
          return data ?? []
        }

        case 'get_pending_content': {
          const weekEnd = new Date()
          weekEnd.setDate(weekEnd.getDate() + 7)
          const { data } = await db
            .from('content_calendar')
            .select('fecha, tipo, titulo, status, pilar, plataforma')
            .gte('fecha', today)
            .lte('fecha', weekEnd.toISOString().split('T')[0])
            .order('fecha', { ascending: true })
          return data ?? []
        }

        case 'get_hot_leads_detail': {
          const { data } = await db
            .from('leads')
            .select('company_name, rubro, city, score, status, email, phone, created_at')
            .gte('score', 70)
            .neq('status', 'closed')
            .neq('status', 'lost')
            .order('score', { ascending: false })
            .limit(10)
          return data ?? []
        }

        default:
          return { error: `Tool desconocida: ${name}` }
      }
    }

    const dateStr = new Date().toLocaleDateString('es-AR', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
    })

    const messages: Anthropic.MessageParam[] = [
      {
        role: 'user',
        content: `Hoy es ${dateStr}. Usá las herramientas para analizar el estado actual de DIVINIA y decidí las 3 acciones prioritarias para las próximas 24 horas. Priorizá siempre lo que genera ingresos.`,
      },
    ]

    const systemPrompt = `Sos el CEO autónomo de DIVINIA — empresa de IA para PYMEs argentinas.
Vendemos: Turnero IA ($45k/mes), Central IA Chatbot ($90-150k/mes), Content Factory ($80-150k/mes), servicios a medida desde $100k.

Tu misión: leé el estado real del negocio con las herramientas disponibles, identificá las 3 oportunidades más urgentes y decidí las acciones concretas para las próximas 24 horas.

Prioridades siempre en este orden:
1. Cerrar ventas (leads calientes sin contactar = dinero esperando)
2. Retener clientes activos (churn = pérdida directa de MRR)
3. Generar leads nuevos y contenido

Al final del análisis, respondé con este formato exacto:

## ESTADO DIVINIA — [fecha]

### 📊 Resumen ejecutivo
[3-4 líneas con los números más importantes]

### 🎯 3 Prioridades del Día
1. **[Acción concreta 1]** — [por qué es prioritaria]
2. **[Acción concreta 2]** — [por qué es prioritaria]
3. **[Acción concreta 3]** — [por qué es prioritaria]

### ⚡ Alertas
[Si hay algo urgente: leads calientes sin contactar, clientes en riesgo, pagos pendientes, etc. Si no hay alertas, escribí "Sin alertas críticas"]

Español argentino, directo, sin vueltas.`

    // Fase 1: recolección de datos con herramientas
    const gatheredData: Record<string, unknown> = {}
    let turn = 0

    while (turn < MAX_TURNS) {
      const response = await anthropic.messages.create({
        model: MODEL,
        max_tokens: 2000,
        system: systemPrompt,
        tools,
        messages,
      })

      messages.push({ role: 'assistant', content: response.content })

      if (response.stop_reason === 'end_turn') break

      if (response.stop_reason === 'tool_use') {
        const toolResults: Anthropic.ToolResultBlockParam[] = []
        for (const block of response.content) {
          if (block.type === 'tool_use') {
            await this.logProgress(`tool:${block.name}`, block.input)
            const result = await executeTool(block.name, block.input as Record<string, unknown>)
            gatheredData[block.name] = result
            toolResults.push({
              type: 'tool_result',
              tool_use_id: block.id,
              content: JSON.stringify(result),
            })
          }
        }
        messages.push({ role: 'user', content: toolResults })
      }

      turn++
    }

    // Fase 2: síntesis con Extended Thinking para análisis estratégico profundo
    let finalReport = ''
    try {
      const synthesisResponse = await (anthropic.messages.create as Function)({
        model: MODEL,
        max_tokens: 16000,
        thinking: { type: 'enabled', budget_tokens: 8000 },
        system: systemPrompt,
        messages: [
          ...messages,
          {
            role: 'user',
            content: `Con todos los datos recolectados, generá el reporte diario estratégico completo. Pensá profundamente en qué es lo MÁS importante y por qué antes de responder.`,
          },
        ],
      })

      finalReport = (synthesisResponse.content as Anthropic.ContentBlock[])
        .filter((b): b is Anthropic.TextBlock => b.type === 'text')
        .map(b => b.text)
        .join('\n')
    } catch {
      // Fallback si Extended Thinking no está disponible
      finalReport = messages
        .filter(m => m.role === 'assistant')
        .flatMap(m => (Array.isArray(m.content) ? m.content : []))
        .filter((b): b is Anthropic.TextBlock => typeof b === 'object' && b.type === 'text')
        .map(b => b.text)
        .join('\n') || '## Estado DIVINIA\nAnálisis completado.'
    }

    await this.sendDailyReport(finalReport, today)
    await this.logComplete({ report: finalReport, turns: turn })

    return { success: true, message: finalReport, data: { turns: turn, date: today } }
  }

  private async sendDailyReport(report: string, date: string): Promise<void> {
    const fromEmail = process.env.RESEND_FROM_EMAIL || 'noreply@divinia.ar'
    const resend = new Resend(process.env.RESEND_API_KEY)

    const htmlReport = report
      .split('\n')
      .map(line => {
        if (line.startsWith('## ')) return `<h2 style="color:#09090b;font-size:19px;font-weight:800;margin:20px 0 10px;letter-spacing:-0.02em">${line.slice(3)}</h2>`
        if (line.startsWith('### ')) return `<h3 style="color:#374151;font-size:14px;font-weight:700;margin:18px 0 8px;text-transform:uppercase;letter-spacing:0.05em">${line.slice(4)}</h3>`
        if (/^\d\./.test(line)) return `<div style="display:flex;gap:10px;margin:8px 0;align-items:flex-start"><span style="min-width:6px;height:6px;background:#C6FF3D;border-radius:50%;margin-top:6px;flex-shrink:0;display:block"></span><p style="margin:0;color:#374151;font-size:14px;line-height:1.6">${line.replace(/^\d\.\s*/, '')}</p></div>`
        if (line.startsWith('**') || line.includes('**')) return `<p style="margin:4px 0;color:#374151;font-size:14px;line-height:1.6">${line.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')}</p>`
        return line.trim() ? `<p style="margin:4px 0;color:#4b5563;font-size:14px;line-height:1.6">${line}</p>` : '<div style="height:6px"></div>'
      })
      .join('')

    await resend.emails.send({
      from: `DIVINIA Cerebro <${fromEmail}>`,
      to: ['diviniacorp@gmail.com'],
      subject: `🧠 DIVINIA Daily — ${date}`,
      html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif">
<div style="max-width:600px;margin:0 auto;padding:20px">
  <div style="background:#06060A;border-radius:14px 14px 0 0;padding:22px 28px;display:flex;justify-content:space-between;align-items:center">
    <div>
      <div style="color:#C6FF3D;font-weight:900;font-size:18px;letter-spacing:-0.03em">DIVINIA.</div>
      <div style="color:rgba(255,255,255,0.45);font-size:10px;font-family:monospace;letter-spacing:0.1em;margin-top:3px">CEREBRO · REPORTE DIARIO · ${date.toUpperCase()}</div>
    </div>
    <div style="background:rgba(198,255,61,0.12);color:#C6FF3D;border-radius:8px;padding:6px 12px;font-family:monospace;font-size:10px;font-weight:700;letter-spacing:0.06em">🧠 NUCLEUS</div>
  </div>
  <div style="background:#fff;border:1px solid #e4e4e7;border-top:none;padding:28px 32px;border-radius:0 0 14px 14px">
    ${htmlReport}
    <div style="margin-top:28px;padding-top:16px;border-top:1px solid #f3f4f6">
      <p style="margin:0;color:#9ca3af;font-size:11px;font-family:monospace">
        Generado por NUCLEUS Cerebro · ${new Date().toLocaleTimeString('es-AR')} · ${new Date().toLocaleDateString('es-AR')}
      </p>
    </div>
  </div>
</div>
</body>
</html>
      `,
    }).catch(e => console.error('[cerebro-report-email]', e))
  }
}
