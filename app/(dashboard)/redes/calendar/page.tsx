'use client'

import { useEffect, useState, useMemo } from 'react'
import Link from 'next/link'
import { ChevronLeft, ChevronRight, ArrowLeft, Instagram, Image as ImageIcon } from 'lucide-react'

const DIVINIA_CLIENT_ID = '857cef01-16a1-4034-8286-1b9e44dcfda3'

const PILAR_COLOR: Record<string, string> = {
  educativo: '#8B5CF6',
  venta: '#84CC16',
  entretenimiento: '#F97316',
  comunidad: '#22D3EE',
  detras_escena: '#EC4899',
}

const PILAR_LABEL: Record<string, string> = {
  educativo: 'Edu',
  venta: 'Venta',
  entretenimiento: 'Fun',
  comunidad: 'Com',
  detras_escena: 'BTS',
}

const STATUS_STYLE: Record<string, string> = {
  planificado: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
  listo: 'bg-lime-500/20 text-lime-300 border-lime-500/40',
  publicado: 'bg-green-500/20 text-green-300 border-green-500/40',
  borrador: 'bg-gray-500/20 text-gray-300 border-gray-500/40',
}

const TIPO_ICON: Record<string, string> = {
  reel: '🎬',
  post: '📸',
  carrusel: '🎠',
  story: '⭕',
}

interface ContentPost {
  id: string
  titulo: string
  caption: string | null
  fecha: string
  tipo: string | null
  status: string
  pilar: string | null
  imagen_url: string | null
  hashtags: string | null
  publish_at: string | null
}

const MONTH_NAMES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']
const DAY_NAMES = ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb']

function getMonthGrid(year: number, month: number) {
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const cells: (number | null)[] = []
  for (let i = 0; i < firstDay; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)
  while (cells.length % 7 !== 0) cells.push(null)
  return cells
}

function toDateStr(year: number, month: number, day: number) {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

export default function RedesCalendarPage() {
  const today = new Date()
  const [year, setYear] = useState(2026)
  const [month, setMonth] = useState(3) // April = index 3
  const [posts, setPosts] = useState<ContentPost[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDay, setSelectedDay] = useState<string | null>(null)
  const [publishing, setPublishing] = useState<string | null>(null)
  const [publishMsg, setPublishMsg] = useState<Record<string, string>>({})

  useEffect(() => {
    const from = `${year}-${String(month + 1).padStart(2, '0')}-01`
    const lastDay = new Date(year, month + 1, 0).getDate()
    const to = `${year}-${String(month + 1).padStart(2, '0')}-${lastDay}`
    setLoading(true)
    fetch(`/api/social/calendar?socialClientId=${DIVINIA_CLIENT_ID}&from=${from}&to=${to}`)
      .then(r => r.json())
      .then(d => { setPosts(d.posts ?? []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [year, month])

  const postsByDate = useMemo(() => {
    const map: Record<string, ContentPost[]> = {}
    for (const p of posts) {
      if (!map[p.fecha]) map[p.fecha] = []
      map[p.fecha].push(p)
    }
    return map
  }, [posts])

  const cells = getMonthGrid(year, month)

  function prevMonth() {
    if (month === 0) { setYear(y => y - 1); setMonth(11) }
    else setMonth(m => m - 1)
    setSelectedDay(null)
  }
  function nextMonth() {
    if (month === 11) { setYear(y => y + 1); setMonth(0) }
    else setMonth(m => m + 1)
    setSelectedDay(null)
  }

  async function handlePublish(post: ContentPost) {
    setPublishing(post.id)
    try {
      const res = await fetch('/api/social/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId: post.id }),
      })
      const data = await res.json()
      if (res.ok) {
        setPublishMsg(m => ({ ...m, [post.id]: '✅ Publicado!' }))
        setPosts(ps => ps.map(p => p.id === post.id ? { ...p, status: 'publicado' } : p))
      } else {
        setPublishMsg(m => ({ ...m, [post.id]: `❌ ${data.error ?? 'Error'}` }))
      }
    } catch {
      setPublishMsg(m => ({ ...m, [post.id]: '❌ Error de red' }))
    } finally {
      setPublishing(null)
    }
  }

  const selectedPosts = selectedDay ? (postsByDate[selectedDay] ?? []) : []

  const stats = {
    total: posts.length,
    listo: posts.filter(p => p.status === 'listo').length,
    publicado: posts.filter(p => p.status === 'publicado').length,
    planificado: posts.filter(p => p.status === 'planificado').length,
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link href="/redes" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
          <ArrowLeft size={18} />
          <span className="text-sm">Redes</span>
        </Link>
        <div className="h-4 w-px bg-gray-700" />
        <Instagram size={20} className="text-pink-400" />
        <h1 className="text-xl font-bold">Calendario de Contenido</h1>
      </div>

      {/* Stats band */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Total', val: stats.total, color: 'text-white' },
          { label: 'Listos', val: stats.listo, color: 'text-lime-400' },
          { label: 'Publicados', val: stats.publicado, color: 'text-green-400' },
          { label: 'Planificados', val: stats.planificado, color: 'text-blue-400' },
        ].map(s => (
          <div key={s.label} className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-center">
            <div className={`text-2xl font-bold ${s.color}`}>{s.val}</div>
            <div className="text-xs text-gray-500 mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="flex gap-6">
        {/* Calendar */}
        <div className="flex-1 min-w-0">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
            {/* Month nav */}
            <div className="flex items-center justify-between p-4 border-b border-gray-800">
              <button onClick={prevMonth} className="p-2 hover:bg-gray-800 rounded-lg transition-colors">
                <ChevronLeft size={18} />
              </button>
              <h2 className="font-semibold text-lg">
                {MONTH_NAMES[month]} {year}
              </h2>
              <button onClick={nextMonth} className="p-2 hover:bg-gray-800 rounded-lg transition-colors">
                <ChevronRight size={18} />
              </button>
            </div>

            {/* Day headers */}
            <div className="grid grid-cols-7 border-b border-gray-800">
              {DAY_NAMES.map(d => (
                <div key={d} className="p-2 text-center text-xs text-gray-500 font-medium">{d}</div>
              ))}
            </div>

            {/* Grid */}
            {loading ? (
              <div className="p-12 text-center text-gray-500 text-sm">Cargando...</div>
            ) : (
              <div className="grid grid-cols-7">
                {cells.map((day, idx) => {
                  if (!day) return <div key={`empty-${idx}`} className="min-h-[90px] border-r border-b border-gray-800/50" />
                  const dateStr = toDateStr(year, month, day)
                  const dayPosts = postsByDate[dateStr] ?? []
                  const isToday = dateStr === today.toISOString().slice(0, 10)
                  const isSelected = dateStr === selectedDay

                  return (
                    <button
                      key={dateStr}
                      onClick={() => setSelectedDay(isSelected ? null : dateStr)}
                      className={`min-h-[90px] p-2 border-r border-b border-gray-800/50 text-left transition-all ${
                        isSelected ? 'bg-gray-800' : 'hover:bg-gray-800/50'
                      }`}
                    >
                      <div className={`text-xs font-medium mb-1.5 w-6 h-6 flex items-center justify-center rounded-full ${
                        isToday ? 'bg-lime-500 text-black' : 'text-gray-400'
                      }`}>
                        {day}
                      </div>
                      <div className="flex flex-col gap-1">
                        {dayPosts.slice(0, 3).map(p => (
                          <div
                            key={p.id}
                            className="flex items-center gap-1 text-[10px] rounded px-1 py-0.5"
                            style={{ backgroundColor: `${PILAR_COLOR[p.pilar ?? 'educativo']}22`, color: PILAR_COLOR[p.pilar ?? 'educativo'] }}
                          >
                            <span>{TIPO_ICON[p.tipo ?? 'post'] ?? '📌'}</span>
                            <span className="truncate">{PILAR_LABEL[p.pilar ?? 'educativo']}</span>
                            {p.status === 'listo' && <span className="ml-auto">●</span>}
                            {p.status === 'publicado' && <span className="ml-auto">✓</span>}
                          </div>
                        ))}
                        {dayPosts.length > 3 && (
                          <div className="text-[10px] text-gray-500">+{dayPosts.length - 3} más</div>
                        )}
                      </div>
                    </button>
                  )
                })}
              </div>
            )}
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-4 mt-4 px-1">
            {Object.entries(PILAR_COLOR).map(([pilar, color]) => (
              <div key={pilar} className="flex items-center gap-1.5 text-xs text-gray-400">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
                {pilar}
              </div>
            ))}
            <div className="flex items-center gap-3 ml-auto text-xs text-gray-500">
              <span>● listo</span>
              <span>✓ publicado</span>
            </div>
          </div>
        </div>

        {/* Day detail panel */}
        <div className="w-80 shrink-0">
          {selectedDay ? (
            <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden sticky top-6">
              <div className="p-4 border-b border-gray-800">
                <div className="text-sm font-semibold">
                  {new Date(selectedDay + 'T12:00:00').toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' })}
                </div>
                <div className="text-xs text-gray-500 mt-0.5">{selectedPosts.length} post{selectedPosts.length !== 1 ? 's' : ''}</div>
              </div>

              {selectedPosts.length === 0 ? (
                <div className="p-8 text-center text-gray-500 text-sm">
                  Sin posts este día
                </div>
              ) : (
                <div className="divide-y divide-gray-800 max-h-[70vh] overflow-y-auto">
                  {selectedPosts.map(post => (
                    <div key={post.id} className="p-4">
                      {/* Thumbnail */}
                      {post.imagen_url ? (
                        <img
                          src={post.imagen_url}
                          alt={post.titulo}
                          className="w-full aspect-square object-cover rounded-xl mb-3"
                        />
                      ) : (
                        <div className="w-full aspect-square bg-gray-800 rounded-xl flex items-center justify-center mb-3">
                          <div className="text-4xl">{TIPO_ICON[post.tipo ?? 'post'] ?? '📌'}</div>
                        </div>
                      )}

                      {/* Badges */}
                      <div className="flex flex-wrap gap-1.5 mb-2">
                        <span
                          className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                          style={{ backgroundColor: `${PILAR_COLOR[post.pilar ?? 'educativo']}33`, color: PILAR_COLOR[post.pilar ?? 'educativo'] }}
                        >
                          {post.pilar}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-800 text-gray-300">
                          {TIPO_ICON[post.tipo ?? 'post']} {post.tipo}
                        </span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full border ${STATUS_STYLE[post.status] ?? STATUS_STYLE.borrador}`}>
                          {post.status}
                        </span>
                      </div>

                      {/* Caption preview */}
                      {post.caption && (
                        <p className="text-xs text-gray-300 leading-relaxed line-clamp-4 mb-3">
                          {post.caption}
                        </p>
                      )}

                      {/* Publish time */}
                      {post.publish_at && (
                        <div className="text-[10px] text-gray-500 mb-3">
                          📅 {new Date(post.publish_at).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })} hs
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex gap-2">
                        <Link
                          href={`/redes/${post.id}`}
                          className="flex-1 text-center text-xs py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 transition-colors"
                        >
                          ✏️ Editar
                        </Link>
                        {(post.status === 'listo' || post.status === 'planificado') && (
                          <button
                            onClick={() => handlePublish(post)}
                            disabled={publishing === post.id}
                            className="flex-1 text-xs py-2 rounded-lg bg-pink-600 hover:bg-pink-500 disabled:opacity-50 transition-colors font-medium"
                          >
                            {publishing === post.id ? '...' : publishMsg[post.id] ?? '▶ Publicar'}
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="bg-gray-900/50 border border-gray-800/50 rounded-2xl p-8 text-center text-gray-600 text-sm sticky top-6">
              <div className="text-3xl mb-3">📅</div>
              Tocá un día del calendario para ver los posts
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
