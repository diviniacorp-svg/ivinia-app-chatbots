'use client'
import { useState } from 'react'
import { Search, MessageCircle, Phone, MapPin, Clock, ChevronRight, Star, Filter, X, Send } from 'lucide-react'

// ── Tipos ────────────────────────────────────────────────────────────────────
interface NucleoItem {
  id: string
  titulo: string
  descripcion: string
  precio: number | null
  categoria: string
  estado: 'disponible' | 'vendido' | 'reservado'
  imagen?: string
  destacado?: boolean
  tags?: string[]
}

interface NucleoConfig {
  slug: string
  nombre: string
  rubro: string
  ciudad: string
  whatsapp: string
  descripcion: string
  accent: string
  logo?: string
  horarios?: string
  items: NucleoItem[]
  categorias: string[]
}

// ── Config demo (el vecino) ───────────────────────────────────────────────────
const DEMO_CONFIG: NucleoConfig = {
  slug: 'el-vecino-usados',
  nombre: 'El Vecino Usados',
  rubro: 'Compraventa',
  ciudad: 'San Luis Capital',
  whatsapp: '+5492664000000',
  descripcion: 'Compraventa de artículos usados en San Luis. Electrónica, muebles, herramientas y más.',
  accent: '#6366f1',
  horarios: 'Lun–Sáb 9–20hs',
  categorias: ['Electrónica', 'Muebles', 'Herramientas', 'Ropa', 'Deportes'],
  items: [
    {
      id: '1', titulo: 'Smart TV 50" Samsung', descripcion: 'Pantalla perfecta, con control y manual. 2 años de uso.',
      precio: 180000, categoria: 'Electrónica', estado: 'disponible', destacado: true,
      tags: ['smart', 'tv', 'samsung'],
    },
    {
      id: '2', titulo: 'Notebook HP 15"', descripcion: 'Core i5, 8GB RAM, 500GB SSD. Batería nueva.',
      precio: 320000, categoria: 'Electrónica', estado: 'disponible',
      tags: ['notebook', 'laptop', 'hp'],
    },
    {
      id: '3', titulo: 'Sofá 3 cuerpos', descripcion: 'Tapizado beige, sin manchas. Muy buen estado.',
      precio: 95000, categoria: 'Muebles', estado: 'disponible',
    },
    {
      id: '4', titulo: 'Taladro Bosch + accesorios', descripcion: 'Taladro percutor profesional con maletín y brocas.',
      precio: 45000, categoria: 'Herramientas', estado: 'vendido',
    },
    {
      id: '5', titulo: 'Bicicleta de montaña rodado 29', descripcion: 'Shimano 21 velocidades, frenos a disco. Lista para usar.',
      precio: 130000, categoria: 'Deportes', estado: 'disponible', destacado: true,
    },
    {
      id: '6', titulo: 'Lavarropas Drean automático', descripcion: '7kg, centrifugado, excelente estado. Con mangueras.',
      precio: 110000, categoria: 'Electrónica', estado: 'reservado',
    },
  ],
}

function formatARS(n: number) {
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0 }).format(n)
}

const ESTADO_STYLE: Record<NucleoItem['estado'], { label: string; color: string; bg: string }> = {
  disponible: { label: 'Disponible', color: '#4ade80', bg: 'rgba(74,222,128,0.1)' },
  vendido:    { label: 'Vendido',    color: '#f87171', bg: 'rgba(248,113,113,0.1)' },
  reservado:  { label: 'Reservado', color: '#fb923c', bg: 'rgba(251,146,60,0.1)' },
}

export default function NucleoVitrina({ params }: { params: { slug: string } }) {
  const config = DEMO_CONFIG // TODO: fetch from DB by params.slug
  const [busqueda, setBusqueda] = useState('')
  const [categoriaActiva, setCategoriaActiva] = useState('Todos')
  const [consultaItem, setConsultaItem] = useState<NucleoItem | null>(null)
  const [mensajeConsulta, setMensajeConsulta] = useState('')

  const itemsFiltrados = config.items.filter(item => {
    const matchBusqueda = !busqueda ||
      item.titulo.toLowerCase().includes(busqueda.toLowerCase()) ||
      item.descripcion.toLowerCase().includes(busqueda.toLowerCase()) ||
      item.tags?.some(t => t.includes(busqueda.toLowerCase()))
    const matchCategoria = categoriaActiva === 'Todos' || item.categoria === categoriaActiva
    return matchBusqueda && matchCategoria
  })

  const destacados = itemsFiltrados.filter(i => i.destacado && i.estado === 'disponible')
  const resto = itemsFiltrados.filter(i => !i.destacado || i.estado !== 'disponible')

  function abrirConsulta(item: NucleoItem) {
    setConsultaItem(item)
    setMensajeConsulta(`Hola! Vi "${item.titulo}" en tu catálogo${item.precio ? ` por ${formatARS(item.precio)}` : ''}. ¿Está disponible?`)
  }

  function enviarConsulta() {
    if (!consultaItem) return
    const wa = config.whatsapp.replace(/\D/g, '')
    window.open(`https://wa.me/${wa}?text=${encodeURIComponent(mensajeConsulta)}`, '_blank')
    setConsultaItem(null)
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0f0f0f', color: '#fff', fontFamily: 'system-ui, sans-serif' }}>

      {/* Header */}
      <header style={{
        background: '#141414',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
        position: 'sticky', top: 0, zIndex: 10,
      }}>
        <div style={{ maxWidth: 900, margin: '0 auto', padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 16 }}>
          {/* Logo / nombre */}
          <div style={{
            width: 40, height: 40, borderRadius: 10, flexShrink: 0,
            background: `linear-gradient(135deg, ${config.accent}33 0%, ${config.accent}66 100%)`,
            border: `1px solid ${config.accent}44`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 20,
          }}>🏪</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 700, fontSize: 16, letterSpacing: '-0.02em' }}>{config.nombre}</div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', display: 'flex', gap: 10, alignItems: 'center' }}>
              <span style={{ display: 'flex', gap: 4, alignItems: 'center' }}><MapPin size={11} />{config.ciudad}</span>
              {config.horarios && <span style={{ display: 'flex', gap: 4, alignItems: 'center' }}><Clock size={11} />{config.horarios}</span>}
            </div>
          </div>
          <a
            href={`https://wa.me/${config.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent('Hola! Vi tu catálogo en línea y quiero consultar.')}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              background: '#25D366', color: '#fff', borderRadius: 8,
              padding: '8px 14px', textDecoration: 'none',
              fontSize: 13, fontWeight: 600, flexShrink: 0,
            }}
          >
            <MessageCircle size={15} />
            Consultar
          </a>
        </div>
      </header>

      <main style={{ maxWidth: 900, margin: '0 auto', padding: '24px 20px' }}>

        {/* Búsqueda */}
        <div style={{ position: 'relative', marginBottom: 20 }}>
          <Search size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.3)' }} />
          <input
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
            placeholder="Buscar en el catálogo..."
            style={{
              width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 12, padding: '11px 14px 11px 40px', color: '#fff', fontSize: 14,
              outline: 'none', boxSizing: 'border-box',
            }}
          />
        </div>

        {/* Categorías */}
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4, marginBottom: 24, scrollbarWidth: 'none' }}>
          {['Todos', ...config.categorias].map(cat => (
            <button
              key={cat}
              onClick={() => setCategoriaActiva(cat)}
              style={{
                padding: '6px 14px', borderRadius: 20, border: 'none', cursor: 'pointer', flexShrink: 0,
                background: categoriaActiva === cat ? config.accent : 'rgba(255,255,255,0.07)',
                color: categoriaActiva === cat ? '#fff' : 'rgba(255,255,255,0.5)',
                fontSize: 13, fontWeight: categoriaActiva === cat ? 600 : 400,
                transition: 'all 0.15s',
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Destacados */}
        {destacados.length > 0 && !busqueda && categoriaActiva === 'Todos' && (
          <div style={{ marginBottom: 32 }}>
            <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', marginBottom: 12 }}>
              ⭐ Destacados
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 14 }}>
              {destacados.map(item => <ItemCard key={item.id} item={item} accent={config.accent} onConsultar={abrirConsulta} />)}
            </div>
          </div>
        )}

        {/* Todos los items */}
        <div>
          {(busqueda || categoriaActiva !== 'Todos') && (
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', marginBottom: 12 }}>
              {itemsFiltrados.length} resultado{itemsFiltrados.length !== 1 ? 's' : ''}
            </div>
          )}
          {!busqueda && categoriaActiva === 'Todos' && resto.length > 0 && (
            <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', marginBottom: 12 }}>
              Todo el catálogo
            </div>
          )}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 14 }}>
            {(busqueda || categoriaActiva !== 'Todos' ? itemsFiltrados : resto).map(item => (
              <ItemCard key={item.id} item={item} accent={config.accent} onConsultar={abrirConsulta} />
            ))}
          </div>
          {itemsFiltrados.length === 0 && (
            <div style={{ textAlign: 'center', padding: '48px 20px', color: 'rgba(255,255,255,0.3)' }}>
              <div style={{ fontSize: 32, marginBottom: 12 }}>🔍</div>
              <div style={{ fontSize: 15 }}>No encontramos "{busqueda}"</div>
              <div style={{ fontSize: 13, marginTop: 6 }}>Podés consultarnos directamente por WhatsApp</div>
            </div>
          )}
        </div>

        {/* CTA WhatsApp */}
        <div style={{
          marginTop: 48, background: 'rgba(37,211,102,0.08)', border: '1px solid rgba(37,211,102,0.2)',
          borderRadius: 16, padding: '24px', textAlign: 'center',
        }}>
          <div style={{ fontSize: 28, marginBottom: 10 }}>💬</div>
          <div style={{ fontWeight: 700, fontSize: 17, marginBottom: 6 }}>¿No encontrás lo que buscás?</div>
          <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', marginBottom: 18 }}>
            Contanos qué necesitás y te avisamos cuando tengamos algo.
          </div>
          <a
            href={`https://wa.me/${config.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent('Hola! Estoy buscando algo específico y no lo vi en el catálogo...')}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: '#25D366', color: '#fff', borderRadius: 10,
              padding: '12px 24px', textDecoration: 'none', fontWeight: 700, fontSize: 14,
            }}
          >
            <MessageCircle size={16} />
            Escribirnos por WhatsApp
          </a>
        </div>

        {/* Footer */}
        <div style={{ textAlign: 'center', marginTop: 32, paddingTop: 20, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.2)', letterSpacing: '0.06em' }}>
            Impulsado por{' '}
            <a href="https://divinia.vercel.app" target="_blank" rel="noopener noreferrer" style={{ color: 'rgba(198,255,61,0.6)', textDecoration: 'none' }}>
              DIVINIA IA
            </a>
          </div>
        </div>
      </main>

      {/* Modal consulta */}
      {consultaItem && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 50, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}
          onClick={e => { if (e.target === e.currentTarget) setConsultaItem(null) }}
        >
          <div style={{
            background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '20px 20px 0 0', padding: '24px 20px', width: '100%', maxWidth: 480,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: 16 }}>Consultar item</div>
                <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', marginTop: 2 }}>{consultaItem.titulo}</div>
              </div>
              <button onClick={() => setConsultaItem(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.4)', padding: 4 }}>
                <X size={18} />
              </button>
            </div>
            <textarea
              value={mensajeConsulta}
              onChange={e => setMensajeConsulta(e.target.value)}
              style={{
                width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 10, padding: '12px', color: '#fff', fontSize: 14,
                outline: 'none', resize: 'vertical', minHeight: 80, boxSizing: 'border-box',
              }}
            />
            <button
              onClick={enviarConsulta}
              style={{
                width: '100%', marginTop: 12, padding: '13px',
                background: '#25D366', color: '#fff', border: 'none', borderRadius: 10,
                fontWeight: 700, fontSize: 14, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              }}
            >
              <Send size={15} />
              Enviar por WhatsApp
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Card de item ──────────────────────────────────────────────────────────────
function ItemCard({ item, accent, onConsultar }: {
  item: NucleoItem
  accent: string
  onConsultar: (item: NucleoItem) => void
}) {
  const estado = ESTADO_STYLE[item.estado]
  const disponible = item.estado === 'disponible'

  return (
    <div style={{
      background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)',
      borderRadius: 14, overflow: 'hidden',
      opacity: disponible ? 1 : 0.6,
      transition: 'transform 0.15s, border-color 0.15s',
    }}
      onMouseEnter={e => {
        if (disponible) {
          (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'
          ;(e.currentTarget as HTMLElement).style.borderColor = accent + '44'
        }
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'
        ;(e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.07)'
      }}
    >
      {/* Imagen placeholder */}
      <div style={{
        height: 160, background: `linear-gradient(135deg, ${accent}11 0%, rgba(255,255,255,0.03) 100%)`,
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 48,
        borderBottom: '1px solid rgba(255,255,255,0.05)',
      }}>
        {item.categoria === 'Electrónica' ? '📱' :
          item.categoria === 'Muebles' ? '🪑' :
          item.categoria === 'Herramientas' ? '🔧' :
          item.categoria === 'Deportes' ? '🚴' : '📦'}
      </div>

      <div style={{ padding: '14px 16px' }}>
        {/* Estado */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <span style={{
            fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 20,
            background: estado.bg, color: estado.color, letterSpacing: '0.04em',
          }}>
            {estado.label}
          </span>
          <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>{item.categoria}</span>
        </div>

        <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 6, lineHeight: 1.3 }}>
          {item.titulo}
        </div>
        <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', lineHeight: 1.5, marginBottom: 12 }}>
          {item.descripcion}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontWeight: 700, fontSize: 17, color: disponible ? accent : 'rgba(255,255,255,0.3)' }}>
            {item.precio ? formatARS(item.precio) : 'Consultar'}
          </div>
          {disponible && (
            <button
              onClick={() => onConsultar(item)}
              style={{
                display: 'flex', alignItems: 'center', gap: 6, padding: '7px 12px',
                background: '#25D366', color: '#fff', border: 'none', borderRadius: 8,
                fontSize: 13, fontWeight: 600, cursor: 'pointer',
              }}
            >
              <MessageCircle size={13} />
              Consultar
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
