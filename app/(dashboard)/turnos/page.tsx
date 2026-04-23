'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { Settings, ExternalLink, Copy, Check, Bot, Plus } from 'lucide-react'

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

const statusStyle = (status: string): React.CSSProperties => {
  const map: Record<string, React.CSSProperties> = {
    confirmed: { background: 'rgba(22,163,74,0.1)',   color: '#15803d', border: '1px solid rgba(22,163,74,0.25)' },
    completed: { background: 'rgba(59,130,246,0.1)',  color: '#1d4ed8', border: '1px solid rgba(59,130,246,0.25)' },
    cancelled: { background: 'var(--paper-2)',         color: 'var(--muted)', border: '1px solid var(--line)' },
    no_show:   { background: 'var(--paper-2)',         color: 'var(--muted)', border: '1px solid var(--line)' },
    active:    { background: 'rgba(198,255,61,0.15)', color: '#4a7c00', border: '1px solid rgba(198,255,61,0.4)' },
    inactive:  { background: 'var(--paper-2)',         color: 'var(--muted)', border: '1px solid var(--line)' },
  }
  return {
    ...map[status] || map.cancelled,
    borderRadius: 100,
    padding: '3px 10px',
    fontFamily: 'var(--f-mono)',
    fontSize: 9,
    letterSpacing: '0.08em',
    textTransform: 'uppercase' as const,
    display: 'inline-block',
  }
}

const STATUS_LABELS: Record<string, string> = {
  confirmed: 'Confirmado',
  cancelled: 'Cancelado',
  completed: 'Completado',
  no_show: 'No vino',
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

  const tabBtnStyle = (active: boolean): React.CSSProperties => ({
    padding: '8px 16px',
    borderRadius: 8,
    border: 'none',
    cursor: 'pointer',
    fontFamily: 'var(--f-mono)',
    fontSize: 10,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    background: active ? 'var(--ink)' : 'transparent',
    color: active ? 'var(--paper)' : 'var(--muted)',
    transition: 'all 0.15s',
  })

  return (
    <div style={{ minHeight: '100vh', background: 'var(--paper-2)' }}>

      {/* Page header */}
      <div style={{ padding: '28px 32px 20px', borderBottom: '1px solid var(--line)', background: 'var(--paper)' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
          <div>
            <p style={{ fontFamily: 'var(--f-mono)', fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 6 }}>
              DIVINIA OS · Operaciones
            </p>
            <h1 style={{ fontFamily: 'var(--f-display)', fontWeight: 700, fontSize: 28, color: 'var(--ink)', margin: 0, letterSpacing: '-0.02em' }}>
              Turnero
            </h1>
          </div>
          <Link
            href="/turnos/config/nuevo"
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '9px 18px', borderRadius: 8, border: 'none',
              background: 'var(--ink)', color: 'var(--paper)',
              fontFamily: 'var(--f-mono)', fontSize: 11, letterSpacing: '0.08em',
              textTransform: 'uppercase', textDecoration: 'none',
            }}
          >
            <Plus size={13} /> Nuevo cliente
          </Link>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 4, marginTop: 20, background: 'var(--paper-2)', borderRadius: 10, padding: 4, width: 'fit-content' }}>
          <button style={tabBtnStyle(tab === 'clientes')} onClick={() => setTab('clientes')}>
            Clientes
          </button>
          <button style={tabBtnStyle(tab === 'agenda')} onClick={() => setTab('agenda')}>
            Agenda
          </button>
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: '24px 32px' }}>

        {/* TAB: CLIENTES */}
        {tab === 'clientes' && (
          loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[1, 2, 3].map(i => (
                <div key={i} style={{ background: 'var(--paper)', borderRadius: 12, border: '1px solid var(--line)', height: 100 }} />
              ))}
            </div>
          ) : turnosClients.length === 0 ? (
            <div style={{
              background: 'var(--paper)', borderRadius: 16, border: '1px dashed var(--line)',
              padding: '64px 40px', textAlign: 'center',
            }}>
              <p style={{ fontSize: 36, marginBottom: 12 }}>📅</p>
              <h3 style={{ fontFamily: 'var(--f-display)', fontWeight: 700, color: 'var(--ink)', marginBottom: 6 }}>
                Sin clientes de turnos todavía
              </h3>
              <p style={{ fontFamily: 'var(--f-display)', fontSize: 13, color: 'var(--muted-2)', marginBottom: 20 }}>
                Creá el primero o vinculá un cliente existente
              </p>
              <Link
                href="/turnos/config/nuevo"
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  padding: '10px 20px', borderRadius: 8, border: 'none',
                  background: 'var(--ink)', color: 'var(--paper)',
                  fontFamily: 'var(--f-mono)', fontSize: 11, letterSpacing: '0.08em',
                  textTransform: 'uppercase', textDecoration: 'none',
                }}
              >
                <Plus size={13} /> Crear primer cliente
              </Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {turnosClients.map(cfg => (
                <div
                  key={cfg.id}
                  style={{ background: 'var(--paper)', border: '1px solid var(--line)', borderRadius: 12, padding: '18px 20px' }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      {/* Name + status */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 4 }}>
                        <span style={{ fontFamily: 'var(--f-display)', fontWeight: 700, fontSize: 16, color: 'var(--ink)' }}>
                          {cfg.clients?.company_name || 'Sin nombre'}
                        </span>
                        <span style={statusStyle(cfg.is_active ? 'active' : 'inactive')}>
                          {cfg.is_active ? 'Activo' : 'Inactivo'}
                        </span>
                        {cfg.clients?.chatbot_id && (
                          <span style={{
                            display: 'inline-flex', alignItems: 'center', gap: 4,
                            background: 'rgba(99,102,241,0.1)', color: '#4338ca',
                            border: '1px solid rgba(99,102,241,0.25)',
                            borderRadius: 100, padding: '3px 10px',
                            fontFamily: 'var(--f-mono)', fontSize: 9, letterSpacing: '0.08em', textTransform: 'uppercase',
                          }}>
                            <Bot size={9} /> Chatbot
                          </span>
                        )}
                      </div>
                      {/* Meta */}
                      <p style={{ fontFamily: 'var(--f-mono)', fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
                        {cfg.services?.length || 0} servicio{cfg.services?.length !== 1 ? 's' : ''} · Slots {cfg.slot_duration_minutes} min
                      </p>
                      {/* Service tags */}
                      {cfg.services && cfg.services.length > 0 && (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                          {cfg.services.slice(0, 4).map(s => (
                            <span key={s.id} style={{
                              background: 'var(--paper-2)', border: '1px solid var(--line)',
                              borderRadius: 100, padding: '2px 10px',
                              fontFamily: 'var(--f-mono)', fontSize: 9, color: 'var(--muted-2)',
                              letterSpacing: '0.06em',
                            }}>
                              {s.name}{s.price_ars > 0 ? ` · $${s.price_ars.toLocaleString('es-AR')}` : ''}
                            </span>
                          ))}
                          {cfg.services.length > 4 && (
                            <span style={{ fontFamily: 'var(--f-mono)', fontSize: 9, color: 'var(--muted)', padding: '2px 4px' }}>
                              +{cfg.services.length - 4} más
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flexShrink: 0 }}>
                      <Link
                        href={`/turnos/config/${cfg.client_id}`}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 6,
                          padding: '6px 12px', borderRadius: 7, border: '1px solid var(--line)',
                          background: 'var(--paper-2)',
                          fontFamily: 'var(--f-mono)', fontSize: 10, letterSpacing: '0.06em',
                          color: 'var(--muted-2)', textDecoration: 'none',
                        }}
                      >
                        <Settings size={11} /> Configurar
                      </Link>
                      <button
                        onClick={() => copyLink(cfg.id)}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 6,
                          padding: '6px 12px', borderRadius: 7, border: '1px solid var(--line)',
                          background: 'var(--paper-2)', cursor: 'pointer',
                          fontFamily: 'var(--f-mono)', fontSize: 10, letterSpacing: '0.06em', color: 'var(--muted-2)',
                        }}
                      >
                        {copiedId === cfg.id ? <><Check size={11} /> Copiado</> : <><Copy size={11} /> Link reservas</>}
                      </button>
                      <a
                        href={`/panel/${cfg.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          display: 'flex', alignItems: 'center', gap: 6,
                          padding: '6px 12px', borderRadius: 7, border: '1px solid var(--line)',
                          background: 'var(--paper-2)',
                          fontFamily: 'var(--f-mono)', fontSize: 10, letterSpacing: '0.06em',
                          color: 'var(--muted-2)', textDecoration: 'none',
                        }}
                      >
                        <ExternalLink size={11} /> Panel dueño
                      </a>
                      <button
                        onClick={() => copyPanelAll(cfg)}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 6,
                          padding: '6px 12px', borderRadius: 7,
                          border: '1px solid rgba(198,255,61,0.35)',
                          background: 'rgba(198,255,61,0.08)', cursor: 'pointer',
                          fontFamily: 'var(--f-mono)', fontSize: 10, letterSpacing: '0.06em', color: '#4a7c00',
                        }}
                      >
                        {copiedPanel === cfg.id ? <><Check size={11} /> Copiado!</> : <><Copy size={11} /> Copiar todo</>}
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
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 20 }}>
              {[
                { label: 'Turnos hoy', value: todayAppts.length },
                { label: 'Próximos', value: upcomingAppts.length },
                { label: 'Total', value: appointments.length },
              ].map(s => (
                <div key={s.label} style={{ background: 'var(--paper)', borderRadius: 12, border: '1px solid var(--line)', padding: '16px 20px' }}>
                  <p style={{ fontFamily: 'var(--f-mono)', fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 6 }}>
                    {s.label}
                  </p>
                  <p style={{ fontFamily: 'var(--f-mono)', fontWeight: 700, fontSize: 28, color: 'var(--ink)', margin: 0 }}>
                    {s.value}
                  </p>
                </div>
              ))}
            </div>

            {/* Filtros */}
            <div style={{ display: 'flex', gap: 6, marginBottom: 16, flexWrap: 'wrap' }}>
              {[['confirmed', 'Confirmados'], ['completed', 'Completados'], ['cancelled', 'Cancelados'], ['all', 'Todos']].map(([val, label]) => (
                <button
                  key={val}
                  onClick={() => setFilter(val)}
                  style={{
                    padding: '7px 14px', borderRadius: 8, cursor: 'pointer',
                    fontFamily: 'var(--f-mono)', fontSize: 10, letterSpacing: '0.06em',
                    border: filter === val ? 'none' : '1px solid var(--line)',
                    background: filter === val ? 'var(--ink)' : 'var(--paper)',
                    color: filter === val ? 'var(--paper)' : 'var(--muted-2)',
                    transition: 'all 0.15s',
                  }}
                >
                  {label}
                </button>
              ))}
            </div>

            {loading ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[1, 2, 3].map(i => (
                  <div key={i} style={{ background: 'var(--paper)', borderRadius: 12, border: '1px solid var(--line)', height: 80 }} />
                ))}
              </div>
            ) : appointments.length === 0 ? (
              <div style={{
                background: 'var(--paper)', borderRadius: 12, border: '1px dashed var(--line)',
                padding: '48px 32px', textAlign: 'center',
              }}>
                <p style={{ fontFamily: 'var(--f-display)', fontSize: 14, color: 'var(--muted-2)' }}>No hay turnos con este filtro</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {appointments.map(appt => (
                  <div key={appt.id} style={{ background: 'var(--paper)', border: '1px solid var(--line)', borderRadius: 12, padding: '14px 18px' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
                          <span style={{ fontFamily: 'var(--f-display)', fontWeight: 600, fontSize: 14, color: 'var(--ink)' }}>
                            {appt.customer_name}
                          </span>
                          <span style={statusStyle(appt.status)}>
                            {STATUS_LABELS[appt.status] || appt.status}
                          </span>
                        </div>
                        <p style={{ fontFamily: 'var(--f-display)', fontSize: 13, color: 'var(--muted-2)', margin: '0 0 3px' }}>
                          {appt.service_name} · {appt.service_duration_minutes} min
                        </p>
                        <p style={{ fontFamily: 'var(--f-mono)', fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em', margin: 0 }}>
                          {appt.appointment_date.split('-').reverse().join('/')} · {appt.appointment_time}
                          {appt.clients?.company_name && ` · ${appt.clients.company_name}`}
                        </p>
                        {appt.customer_phone && (
                          <a
                            href={`https://wa.me/${appt.customer_phone.replace(/\D/g, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              display: 'inline-block', marginTop: 4,
                              fontFamily: 'var(--f-mono)', fontSize: 10,
                              color: '#16a34a', textDecoration: 'none',
                            }}
                          >
                            WA {appt.customer_phone}
                          </a>
                        )}
                        {appt.customer_notes && (
                          <p style={{ fontFamily: 'var(--f-display)', fontSize: 11, color: 'var(--muted)', fontStyle: 'italic', marginTop: 4 }}>
                            &ldquo;{appt.customer_notes}&rdquo;
                          </p>
                        )}
                      </div>
                      {appt.status === 'confirmed' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flexShrink: 0 }}>
                          <button
                            onClick={() => updateStatus(appt.id, 'completed')}
                            style={{
                              padding: '6px 12px', borderRadius: 7, cursor: 'pointer',
                              border: '1px solid rgba(59,130,246,0.25)',
                              background: 'rgba(59,130,246,0.08)',
                              fontFamily: 'var(--f-mono)', fontSize: 10, color: '#1d4ed8',
                            }}
                          >
                            Completar
                          </button>
                          <button
                            onClick={() => updateStatus(appt.id, 'cancelled')}
                            style={{
                              padding: '6px 12px', borderRadius: 7, cursor: 'pointer',
                              border: '1px solid rgba(239,68,68,0.25)',
                              background: 'rgba(239,68,68,0.08)',
                              fontFamily: 'var(--f-mono)', fontSize: 10, color: '#dc2626',
                            }}
                          >
                            Cancelar
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
