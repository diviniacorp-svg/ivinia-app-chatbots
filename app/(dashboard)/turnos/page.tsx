'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { CalendarCheck, Plus, Settings, ExternalLink, Copy, Check, Bot, Link2, Clock, Users } from 'lucide-react'

interface TurnosClient {
  id: string
  client_id: string
  is_active: boolean
  slot_duration_minutes: number
  owner_pin: string
  owner_phone: string
  services: { id: string; name: string; duration_minutes: number; price_ars: number }[]
  created_at: string
  clients: {
    id: string
    company_name: string
    contact_name: string
    chatbot_id: string | null
    status: string
  }
}

interface Appointment {
  id: string
  client_id: string
  service_name: string
  service_duration_minutes: number
  appointment_date: string
  appointment_time: string
  customer_name: string
  customer_phone: string
  customer_notes: string
  status: string
  clients?: { company_name: string }
}

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  confirmed: { label: 'Confirmado', color: 'bg-green-100 text-green-700' },
  cancelled: { label: 'Cancelado', color: 'bg-red-100 text-red-700' },
  completed: { label: 'Completado', color: 'bg-blue-100 text-blue-700' },
  no_show: { label: 'No vino', color: 'bg-gray-100 text-gray-600' },
}

export default function TurnosDashboard() {
  const [tab, setTab] = useState<'clientes' | 'agenda'>('clientes')
  const [turnosClients, setTurnosClients] = useState<TurnosClient[]>([])
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('confirmed')
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [copiedPanel, setCopiedPanel] = useState<string | null>(null)

  const fetchTurnosClients = useCallback(async () => {
    setLoading(true)
    const res = await fetch('/api/bookings/configs')
    const data = await res.json()
    setTurnosClients(data.configs || [])
    setLoading(false)
  }, [])

  const fetchAppointments = useCallback(async () => {
    setLoading(true)
    const res = await fetch(`/api/bookings/appointments${filter !== 'all' ? `?status=${filter}` : ''}`)
    const data = await res.json()
    setAppointments(data.appointments || [])
    setLoading(false)
  }, [filter])

  useEffect(() => {
    if (tab === 'clientes') fetchTurnosClients()
    else fetchAppointments()
  }, [tab, filter, fetchTurnosClients, fetchAppointments])

  async function updateStatus(id: string, status: string) {
    await fetch(`/api/bookings/appointments/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    fetchAppointments()
  }

  function copyLink(configId: string) {
    const url = `${window.location.origin}/reservas/${configId}`
    navigator.clipboard.writeText(url)
    setCopiedId(configId)
    setTimeout(() => setCopiedId(null), 2000)
  }

  function copyPanelAll(cfg: TurnosClient) {
    const origin = window.location.origin
    const pin = cfg.owner_pin || '1234'
    const msg =
      `¡Hola! Acá están los links de tu sistema de turnos 🎉\n\n` +
      `📅 *Link para que tus clientes reserven:*\n${origin}/reservas/${cfg.id}\n\n` +
      `⚙️ *Tu panel de administración:*\n${origin}/panel/${cfg.id}\n\n` +
      `🔑 PIN de acceso: ${pin}\n\n` +
      `Guardá estos links, son tuyos para siempre.`
    navigator.clipboard.writeText(msg)
    setCopiedPanel(cfg.id)
    setTimeout(() => setCopiedPanel(null), 2000)
  }

  const today = new Date().toISOString().split('T')[0]
  const todayAppts = appointments.filter(a => a.appointment_date === today)
  const upcomingAppts = appointments.filter(a => a.appointment_date > today)

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <CalendarCheck size={24} className="text-purple-600" />
          <div>
            <h1 className="text-2xl font-black text-gray-900">Sistema de Turnos</h1>
            <p className="text-gray-500 text-sm">Gestioná turnos online para tus clientes</p>
          </div>
        </div>
        <Link
          href="/turnos/config/nuevo"
          className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2.5 rounded-xl text-sm font-bold transition-colors"
        >
          <Plus size={16} /> Nuevo cliente de turnos
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-gray-100 rounded-xl p-1 w-fit">
        {[
          { key: 'clientes', label: 'Clientes', icon: Users },
          { key: 'agenda', label: 'Agenda', icon: Clock },
        ].map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setTab(key as 'clientes' | 'agenda')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
              tab === key ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Icon size={15} /> {label}
          </button>
        ))}
      </div>

      {/* TAB: CLIENTES */}
      {tab === 'clientes' && (
        loading ? (
          <p className="text-gray-400 text-center py-12">Cargando...</p>
        ) : turnosClients.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl border border-dashed border-gray-200">
            <CalendarCheck size={40} className="text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">Todavía no hay clientes con turnos</p>
            <p className="text-gray-400 text-sm mt-1">Creá el primero o vinculá un cliente de chatbot existente</p>
            <Link
              href="/turnos/config/nuevo"
              className="inline-flex items-center gap-2 mt-4 bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-purple-700"
            >
              <Plus size={14} /> Crear primer cliente
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {turnosClients.map(cfg => (
              <div key={cfg.id} className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-gray-900 text-lg">
                        {cfg.clients?.company_name || 'Sin nombre'}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${cfg.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                        {cfg.is_active ? 'Activo' : 'Inactivo'}
                      </span>
                      {cfg.clients?.chatbot_id && (
                        <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <Bot size={10} /> Tiene chatbot
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 mt-0.5">
                      {cfg.services?.length || 0} servicio{cfg.services?.length !== 1 ? 's' : ''} · Slots de {cfg.slot_duration_minutes} min
                    </p>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {cfg.services?.slice(0, 4).map(s => (
                        <span key={s.id} className="text-xs bg-purple-50 text-purple-700 px-2 py-0.5 rounded-full">
                          {s.name} {s.price_ars > 0 ? `· $${s.price_ars.toLocaleString('es-AR')}` : ''}
                        </span>
                      ))}
                      {(cfg.services?.length || 0) > 4 && (
                        <span className="text-xs text-gray-400">+{cfg.services.length - 4} más</span>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5 shrink-0">
                    <Link
                      href={`/turnos/config/${cfg.client_id}`}
                      className="flex items-center gap-1.5 text-xs bg-gray-50 text-gray-700 border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-100 font-medium"
                    >
                      <Settings size={12} /> Configurar
                    </Link>
                    <button
                      onClick={() => copyLink(cfg.id)}
                      className="flex items-center gap-1.5 text-xs bg-purple-50 text-purple-700 border border-purple-100 px-3 py-1.5 rounded-lg hover:bg-purple-100 font-medium"
                    >
                      {copiedId === cfg.id ? <><Check size={12} /> Copiado</> : <><Copy size={12} /> Link reservas</>}
                    </button>
                    <a
                      href={`/panel/${cfg.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-xs bg-amber-50 text-amber-700 border border-amber-100 px-3 py-1.5 rounded-lg hover:bg-amber-100 font-medium"
                    >
                      <ExternalLink size={12} /> Panel dueño
                    </a>
                    <button
                      onClick={() => copyPanelAll(cfg)}
                      className="flex items-center gap-1.5 text-xs bg-green-50 text-green-700 border border-green-100 px-3 py-1.5 rounded-lg hover:bg-green-100 font-medium"
                    >
                      {copiedPanel === cfg.id ? <><Check size={12} /> Copiado!</> : <><Copy size={12} /> Copiar todo</>}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {/* TAB: AGENDA */}
      {tab === 'agenda' && (
        <div>
          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-5">
            <div className="bg-white rounded-xl border border-gray-100 p-4">
              <p className="text-sm text-gray-500">Hoy</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{todayAppts.length}</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 p-4">
              <p className="text-sm text-gray-500">Próximos</p>
              <p className="text-3xl font-bold text-purple-600 mt-1">{upcomingAppts.length}</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 p-4">
              <p className="text-sm text-gray-500">Total</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{appointments.length}</p>
            </div>
          </div>

          {/* Filtros */}
          <div className="flex gap-2 mb-4 flex-wrap">
            {[['confirmed', 'Confirmados'], ['completed', 'Completados'], ['cancelled', 'Cancelados'], ['all', 'Todos']].map(([val, label]) => (
              <button
                key={val}
                onClick={() => setFilter(val)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  filter === val ? 'bg-purple-600 text-white' : 'bg-white text-gray-600 border border-gray-200'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {loading ? (
            <p className="text-gray-400 text-center py-12">Cargando...</p>
          ) : appointments.length === 0 ? (
            <div className="text-center py-12 text-gray-400">No hay turnos</div>
          ) : (
            <div className="space-y-3">
              {appointments.map(appt => {
                const statusInfo = STATUS_LABELS[appt.status] || { label: appt.status, color: 'bg-gray-100 text-gray-600' }
                return (
                  <div key={appt.id} className="bg-white border border-gray-100 rounded-xl p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-gray-900">{appt.customer_name}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${statusInfo.color}`}>
                            {statusInfo.label}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mt-0.5">{appt.service_name} · {appt.service_duration_minutes} min</p>
                        <p className="text-sm font-medium text-purple-600 mt-0.5">
                          📅 {appt.appointment_date.split('-').reverse().join('/')} · ⏰ {appt.appointment_time}
                        </p>
                        {appt.clients?.company_name && (
                          <p className="text-xs text-gray-400 mt-0.5">Negocio: {appt.clients.company_name}</p>
                        )}
                        {appt.customer_phone && (
                          <a
                            href={`https://wa.me/${appt.customer_phone.replace(/\D/g, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-green-600 mt-1 inline-block"
                          >
                            📱 {appt.customer_phone}
                          </a>
                        )}
                        {appt.customer_notes && (
                          <p className="text-xs text-gray-400 mt-1 italic">&ldquo;{appt.customer_notes}&rdquo;</p>
                        )}
                      </div>
                      {appt.status === 'confirmed' && (
                        <div className="flex flex-col gap-1">
                          <button
                            onClick={() => updateStatus(appt.id, 'completed')}
                            className="text-xs bg-blue-50 text-blue-600 px-3 py-1.5 rounded-lg hover:bg-blue-100"
                          >
                            Completar
                          </button>
                          <button
                            onClick={() => updateStatus(appt.id, 'cancelled')}
                            className="text-xs bg-red-50 text-red-600 px-3 py-1.5 rounded-lg hover:bg-red-100"
                          >
                            Cancelar
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
