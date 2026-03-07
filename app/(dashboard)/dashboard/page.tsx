export const dynamic = 'force-dynamic'

import { createAdminClient } from '@/lib/supabase'
import { Users, UserCheck, CreditCard, TrendingUp } from 'lucide-react'
import Link from 'next/link'

async function getMetrics() {
  const db = createAdminClient()
  const [leadsRes, clientsRes, paymentsRes] = await Promise.all([
    db.from('leads').select('id, status, score', { count: 'exact' }),
    db.from('clients').select('id, status', { count: 'exact' }),
    db.from('payments').select('amount, status'),
  ])

  const leads = leadsRes.data || []
  const clients = clientsRes.data || []
  const payments = paymentsRes.data || []

  const totalRevenue = payments
    .filter(p => p.status === 'approved')
    .reduce((sum, p) => sum + (p.amount || 0), 0)

  return {
    totalLeads: leadsRes.count || 0,
    newLeads: leads.filter(l => l.status === 'nuevo').length,
    totalClients: clientsRes.count || 0,
    activeClients: clients.filter(c => c.status === 'active').length,
    trialClients: clients.filter(c => c.status === 'trial').length,
    totalRevenue,
  }
}

export default async function DashboardPage() {
  let metrics = { totalLeads: 0, newLeads: 0, totalClients: 0, activeClients: 0, trialClients: 0, totalRevenue: 0 }

  try {
    metrics = await getMetrics()
  } catch {
    // DB no configurada aún
  }

  const cards = [
    { label: 'Total Leads', value: metrics.totalLeads, sub: `${metrics.newLeads} nuevos`, icon: Users, color: 'bg-blue-500', href: '/leads' },
    { label: 'Clientes Activos', value: metrics.activeClients, sub: `${metrics.trialClients} en trial`, icon: UserCheck, color: 'bg-green-500', href: '/clientes' },
    { label: 'Ingresos (ARS)', value: `$${metrics.totalRevenue.toLocaleString('es-AR')}`, sub: 'pagos aprobados', icon: CreditCard, color: 'bg-purple-500', href: '/pagos' },
    { label: 'Conversion Rate', value: metrics.totalLeads > 0 ? `${Math.round((metrics.totalClients / metrics.totalLeads) * 100)}%` : '0%', sub: 'leads → clientes', icon: TrendingUp, color: 'bg-amber-500', href: '/crm' },
  ]

  const quickActions = [
    { label: 'Buscar leads con Apify', href: '/leads', emoji: '🔍' },
    { label: 'Enviar campaña email', href: '/outreach', emoji: '📧' },
    { label: 'Crear nuevo cliente', href: '/clientes', emoji: '➕' },
    { label: 'Generar link de pago', href: '/pagos', emoji: '💳' },
  ]

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-black text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">Resumen operativo de DIVINIA</p>
      </div>

      {/* Métricas */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {cards.map((card) => (
          <Link key={card.label} href={card.href}>
            <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5 cursor-pointer">
              <div className="flex items-start justify-between mb-3">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{card.label}</p>
                <div className={`w-8 h-8 ${card.color} bg-opacity-15 rounded-lg flex items-center justify-center`}>
                  <card.icon size={16} className={`${card.color.replace('bg-', 'text-')}`} />
                </div>
              </div>
              <p className="text-2xl font-black text-gray-900">{card.value}</p>
              <p className="text-xs text-gray-400 mt-1">{card.sub}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Acciones rápidas */}
      <div className="grid sm:grid-cols-2 gap-4 mb-8">
        <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
          <h2 className="font-bold text-gray-900 mb-4">Acciones rápidas</h2>
          <div className="grid grid-cols-2 gap-3">
            {quickActions.map((action) => (
              <Link
                key={action.label}
                href={action.href}
                className="flex flex-col items-center gap-2 p-4 bg-gray-50 hover:bg-indigo-50 rounded-xl text-center transition-colors group"
              >
                <span className="text-2xl">{action.emoji}</span>
                <span className="text-xs font-semibold text-gray-600 group-hover:text-indigo-700 leading-tight">{action.label}</span>
              </Link>
            ))}
          </div>
        </div>

        <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-xl p-6 text-white">
          <h2 className="font-bold mb-3">💡 Tip del día</h2>
          <p className="text-indigo-200 text-sm leading-relaxed mb-4">
            Buscá negocios en San Luis con Apify, generá emails personalizados con IA y enviálos en batch.
            Cada campaña puede generar 5-10 leads calificados.
          </p>
          <Link
            href="/leads"
            className="inline-block bg-white text-indigo-700 font-semibold text-sm px-4 py-2 rounded-lg hover:bg-indigo-50 transition-colors"
          >
            Ir al buscador de leads →
          </Link>
        </div>
      </div>

      {/* Acceso a la BD */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
        <strong>⚠️ Primer uso:</strong> Asegurate de configurar las variables de entorno en{' '}
        <code className="bg-amber-100 px-1 rounded">.env.local</code> y correr el SQL de{' '}
        <code className="bg-amber-100 px-1 rounded">supabase-schema.sql</code> en tu Supabase.
        Después ejecutá <code className="bg-amber-100 px-1 rounded">GET /api/seed</code> para cargar los templates.
      </div>
    </div>
  )
}
