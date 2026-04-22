'use client'

import { useState, useMemo } from 'react'
import type { Comercio, Oficio } from './page'

// ─── Rubros Comercios ─────────────────────────────────────────────────────

const RUBROS_COMERCIOS = [
  'Todos',
  'Restaurantes', 'Cafeterías', 'Panaderías', 'Heladerías', 'Pizzerías',
  'Rotiserías', 'Almacenes', 'Dietéticas', 'Carnicerías', 'Verdulerías', 'Pescaderías',
  'Farmacias', 'Ópticas', 'Perfumerías', 'Peluquerías', 'Barberías', 'Estéticas',
  'Nail bars', 'Spa', 'Gimnasios', 'Yoga', 'Pilates',
  'Ferreterías', 'Pinturerías', 'Eléctricas', 'Plomerías', 'Madereras',
  'Ropa', 'Calzado', 'Accesorios', 'Deportes', 'Librerías', 'Jugueterías',
  'Electrónica', 'Celulares', 'Computación',
  'Veterinarias', 'Petshops',
  'Hoteles', 'Hosterías', 'Cabañas', 'Alojamientos',
  'Clínicas', 'Médicos', 'Dentistas', 'Psicólogos', 'Kinesiólogos',
  'Inmobiliarias', 'Estudios jurídicos', 'Contaduría',
  'Canchas de fútbol', 'Canchas de padel', 'Canchas de tenis', 'Natación',
  'Concesionarias', 'Talleres', 'Gomería', 'Lavaderos de autos',
]

// ─── Rubros Oficios ────────────────────────────────────────────────────────

const RUBROS_OFICIOS = [
  'Todos',
  'Plomería', 'Electricidad', 'Gas', 'Pintura', 'Albañilería', 'Carpintería',
  'Herrería', 'Soldadura', 'Refrigeración', 'AC', 'Cerrajería',
  'Jardín y paisajismo', 'Limpieza del hogar', 'Mudanzas', 'Fletes',
  'Informática', 'Cámaras de seguridad', 'Alarmas',
  'Clases particulares', 'Idiomas', 'Música',
  'Fotografía', 'Video', 'Diseño gráfico',
  'Cuidado de adultos mayores', 'Enfermería domiciliaria', 'Babysitting',
  'Entrenador personal', 'Nutricionista', 'Masajes a domicilio',
  'Reparación de electrodomésticos', 'Tapicería', 'Vidriería',
]

// ─── Componente Comercio Card ─────────────────────────────────────────────

function ComercioCard({ c }: { c: Comercio }) {
  const waMsg = encodeURIComponent('Hola! Vi tu comercio en DIVINIA Market y quiero hacer un pedido')
  return (
    <div
      style={{
        borderRadius: 16,
        overflow: 'hidden',
        border: '1px solid #E8E0D8',
        background: 'white',
        display: 'flex',
        flexDirection: 'column',
        transition: 'box-shadow 0.2s',
      }}
      onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 8px 32px rgba(255,107,53,0.12)')}
      onMouseLeave={e => (e.currentTarget.style.boxShadow = 'none')}
    >
      {/* Banner */}
      <div
        style={{
          height: 140,
          background: 'linear-gradient(135deg, #FF6B35 0%, #FF8C42 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
        }}
      >
        <span style={{ fontSize: 48 }}>{c.emoji ?? '🏪'}</span>
        {c.delivery && (
          <span
            style={{
              position: 'absolute',
              top: 10,
              right: 10,
              background: '#16A34A',
              color: 'white',
              borderRadius: 100,
              padding: '3px 10px',
              fontFamily: 'var(--f-mono)',
              fontSize: 10,
              letterSpacing: '0.06em',
              fontWeight: 700,
            }}
          >
            • Delivery
          </span>
        )}
      </div>

      {/* Info */}
      <div style={{ padding: '14px 18px 18px', flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
        <div
          style={{
            fontFamily: 'var(--f-mono)',
            fontSize: 10,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: '#FF6B35',
          }}
        >
          {c.rubro ?? 'Comercio'}
        </div>
        <div
          style={{
            fontFamily: 'var(--f-display)',
            fontWeight: 700,
            fontSize: 17,
            color: '#1A1A1A',
            lineHeight: 1.2,
          }}
        >
          {c.nombre}
        </div>
        {c.descripcion && (
          <div
            style={{
              fontFamily: 'var(--f-display)',
              fontSize: 13,
              color: '#6B6B6B',
              lineHeight: 1.5,
              flex: 1,
            }}
          >
            {c.descripcion.slice(0, 72)}…
          </div>
        )}
        {c.direccion && (
          <div style={{ fontFamily: 'var(--f-mono)', fontSize: 11, color: '#9B9B9B' }}>
            📍 {c.direccion.split(',')[0]}
          </div>
        )}

        {/* Botones */}
        <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
          <a
            href={`/market/${c.slug}`}
            style={{
              flex: 1,
              textAlign: 'center',
              padding: '9px 0',
              borderRadius: 8,
              border: '1.5px solid #FF6B35',
              color: '#FF6B35',
              fontFamily: 'var(--f-mono)',
              fontSize: 11,
              letterSpacing: '0.06em',
              textDecoration: 'none',
              fontWeight: 700,
            }}
          >
            Ver →
          </a>
          {c.delivery && c.delivery_whatsapp && (
            <a
              href={`https://wa.me/${c.delivery_whatsapp}?text=${waMsg}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                flex: 1,
                textAlign: 'center',
                padding: '9px 0',
                borderRadius: 8,
                background: '#16A34A',
                color: 'white',
                fontFamily: 'var(--f-mono)',
                fontSize: 11,
                letterSpacing: '0.06em',
                textDecoration: 'none',
                fontWeight: 700,
              }}
            >
              Pedir delivery →
            </a>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Componente Oficio Card ────────────────────────────────────────────────

function OficioCard({ o }: { o: Oficio }) {
  const inicial = o.nombre.charAt(0).toUpperCase()
  const waMsg = encodeURIComponent(`Hola ${o.nombre}! Vi tu perfil en DIVINIA Market y me gustaría contratarte.`)
  return (
    <div
      style={{
        borderRadius: 16,
        border: '1px solid #E0EEF8',
        background: 'white',
        padding: '20px 20px 18px',
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        transition: 'box-shadow 0.2s',
      }}
      onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 8px 32px rgba(14,165,233,0.12)')}
      onMouseLeave={e => (e.currentTarget.style.boxShadow = 'none')}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        {/* Avatar inicial */}
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #0EA5E9 0%, #38BDF8 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: 'var(--f-display)',
            fontWeight: 800,
            fontSize: 20,
            color: 'white',
            flexShrink: 0,
          }}
        >
          {inicial}
        </div>
        <div style={{ flex: 1 }}>
          <div
            style={{
              fontFamily: 'var(--f-display)',
              fontWeight: 700,
              fontSize: 16,
              color: '#1A1A1A',
              lineHeight: 1.2,
            }}
          >
            {o.nombre}
          </div>
          <div
            style={{
              fontFamily: 'var(--f-mono)',
              fontSize: 11,
              color: '#0EA5E9',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              marginTop: 2,
            }}
          >
            {o.oficio}
          </div>
        </div>
        {/* Badge disponible */}
        <span
          style={{
            padding: '3px 10px',
            borderRadius: 100,
            background: o.disponible ? '#F0FDF4' : '#F5F5F5',
            color: o.disponible ? '#16A34A' : '#9B9B9B',
            fontFamily: 'var(--f-mono)',
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: '0.05em',
            flexShrink: 0,
          }}
        >
          {o.disponible ? '● Disponible' : '○ Ocupado'}
        </span>
      </div>

      <div style={{ display: 'flex', gap: 16 }}>
        <span style={{ fontFamily: 'var(--f-mono)', fontSize: 11, color: '#6B6B6B' }}>
          📍 {o.zona}
        </span>
        <span style={{ fontFamily: 'var(--f-mono)', fontSize: 11, color: '#1A1A1A', fontWeight: 700 }}>
          {o.precio}
        </span>
      </div>

      <a
        href={`https://wa.me/${o.wa}?text=${waMsg}`}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          display: 'block',
          textAlign: 'center',
          padding: '10px 0',
          borderRadius: 8,
          background: '#0EA5E9',
          color: 'white',
          fontFamily: 'var(--f-mono)',
          fontSize: 11,
          letterSpacing: '0.06em',
          textDecoration: 'none',
          fontWeight: 700,
          marginTop: 2,
        }}
      >
        Contactar →
      </a>
    </div>
  )
}

// ─── Componente Principal (client) ────────────────────────────────────────

interface Props {
  comercios: Comercio[]
  oficios: Oficio[]
}

export default function MarketClient({ comercios, oficios }: Props) {
  const [seccion, setSeccion] = useState<'comercios' | 'oficios'>('comercios')
  const [rubroComercio, setRubroComercio] = useState('Todos')
  const [rubroOficio, setRubroOficio] = useState('Todos')
  const [busqueda, setBusqueda] = useState('')

  const comerciosFiltrados = useMemo(() => {
    let lista = comercios
    if (rubroComercio !== 'Todos') {
      lista = lista.filter(c => c.rubro === rubroComercio)
    }
    if (busqueda.trim()) {
      const q = busqueda.toLowerCase()
      lista = lista.filter(
        c =>
          c.nombre.toLowerCase().includes(q) ||
          c.rubro?.toLowerCase().includes(q) ||
          c.descripcion?.toLowerCase().includes(q)
      )
    }
    return lista
  }, [comercios, rubroComercio, busqueda])

  const oficiosFiltrados = useMemo(() => {
    let lista = oficios
    if (rubroOficio !== 'Todos') {
      lista = lista.filter(o => o.oficio === rubroOficio)
    }
    if (busqueda.trim()) {
      const q = busqueda.toLowerCase()
      lista = lista.filter(
        o =>
          o.nombre.toLowerCase().includes(q) ||
          o.oficio?.toLowerCase().includes(q) ||
          o.zona?.toLowerCase().includes(q)
      )
    }
    return lista
  }, [oficios, rubroOficio, busqueda])

  const accentColor = seccion === 'comercios' ? '#FF6B35' : '#0EA5E9'

  return (
    <div style={{ fontFamily: 'var(--f-display)', background: '#FFFBF5', minHeight: '100vh' }}>

      {/* ── NAVBAR ───────────────────────────────────────────────────── */}
      <nav
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 50,
          background: 'rgba(255,251,245,0.95)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid #E8E0D8',
          padding: '12px 0',
        }}
      >
        <div
          style={{
            maxWidth: 1200,
            margin: '0 auto',
            padding: '0 24px',
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            flexWrap: 'wrap',
          }}
        >
          {/* Logo */}
          <a href="/market" style={{ textDecoration: 'none', flexShrink: 0 }}>
            <span
              style={{
                fontFamily: 'var(--f-mono)',
                fontSize: 16,
                fontWeight: 700,
                color: '#1A1A1A',
                letterSpacing: '-0.02em',
              }}
            >
              DIVINIA
            </span>
            <span style={{ fontFamily: 'var(--f-mono)', fontSize: 16, color: '#FF6B35' }}>
              {' '}market
            </span>
            <span
              style={{
                display: 'inline-block',
                width: 7,
                height: 7,
                borderRadius: '50%',
                background: '#FF6B35',
                marginLeft: 3,
                verticalAlign: 'middle',
              }}
            />
          </a>

          {/* Toggle Comercios / Oficios */}
          <div
            style={{
              display: 'flex',
              gap: 4,
              background: '#F0EAE2',
              borderRadius: 10,
              padding: 4,
              flexShrink: 0,
            }}
          >
            {(['comercios', 'oficios'] as const).map(s => (
              <button
                key={s}
                onClick={() => { setSeccion(s); setBusqueda('') }}
                style={{
                  padding: '8px 20px',
                  borderRadius: 7,
                  border: 'none',
                  background: seccion === s ? (s === 'comercios' ? '#FF6B35' : '#0EA5E9') : 'transparent',
                  color: seccion === s ? 'white' : '#6B6B6B',
                  fontFamily: 'var(--f-mono)',
                  fontSize: 12,
                  fontWeight: 700,
                  letterSpacing: '0.05em',
                  textTransform: 'capitalize',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
              >
                {s === 'comercios' ? '🏪 Comercios' : '🔧 Oficios'}
              </button>
            ))}
          </div>

          {/* Buscador */}
          <div
            style={{
              flex: 1,
              minWidth: 200,
              display: 'flex',
              border: '1.5px solid #E8E0D8',
              borderRadius: 10,
              overflow: 'hidden',
              background: 'white',
            }}
          >
            <span style={{ padding: '0 12px', display: 'flex', alignItems: 'center', fontSize: 16 }}>
              🔍
            </span>
            <input
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
              placeholder={
                seccion === 'comercios' ? '¿Qué comercio buscás?' : '¿Qué oficio necesitás?'
              }
              style={{
                flex: 1,
                padding: '10px 12px 10px 0',
                border: 'none',
                outline: 'none',
                fontFamily: 'var(--f-display)',
                fontSize: 14,
                background: 'transparent',
                color: '#1A1A1A',
              }}
            />
          </div>

          {/* CTA */}
          <a
            href={seccion === 'oficios' ? '/market/oficios/registrarse' : '/market/unirse'}
            style={{ textDecoration: 'none', flexShrink: 0 }}
          >
            <button
              style={{
                background: accentColor,
                color: 'white',
                borderRadius: 8,
                padding: '10px 18px',
                fontFamily: 'var(--f-mono)',
                fontSize: 11,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                border: 'none',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              {seccion === 'oficios' ? 'Registrá tu oficio →' : 'Sumá tu negocio →'}
            </button>
          </a>
        </div>
      </nav>

      {/* ── HERO ────────────────────────────────────────────────────────── */}
      <div style={{ maxWidth: 700, margin: '0 auto', padding: '110px 24px 56px', textAlign: 'center' }}>
        <div
          style={{
            fontFamily: 'var(--f-mono)',
            fontSize: 11,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: accentColor,
            marginBottom: 16,
            transition: 'color 0.2s',
          }}
        >
          San Luis Capital — Beta
        </div>
        <h1
          style={{
            fontFamily: 'var(--f-display)',
            fontWeight: 800,
            fontSize: 'clamp(38px, 6vw, 76px)',
            color: '#1A1A1A',
            letterSpacing: '-0.04em',
            lineHeight: 1.05,
            margin: '0 0 20px',
          }}
        >
          {seccion === 'comercios' ? (
            <>Todo San Luis<br />en un solo lugar.</>
          ) : (
            <>Oficios y servicios<br />de tu ciudad.</>
          )}
        </h1>
        <p
          style={{
            fontFamily: 'var(--f-display)',
            fontSize: 17,
            color: '#6B6B6B',
            lineHeight: 1.6,
            margin: '0 auto',
            maxWidth: '44ch',
          }}
        >
          {seccion === 'comercios'
            ? 'Pedí a tus comercios favoritos y apoyá los negocios locales de San Luis.'
            : 'Encontrá electricistas, plomeros, pintores y más — vecinos de tu ciudad.'}
        </p>
      </div>

      {/* ── PILLS FILTRO ─────────────────────────────────────────────────── */}
      <div
        style={{
          borderTop: '1px solid #E8E0D8',
          borderBottom: '1px solid #E8E0D8',
          background: 'white',
          position: 'sticky',
          top: 65,
          zIndex: 40,
        }}
      >
        <div
          style={{
            maxWidth: 1200,
            margin: '0 auto',
            padding: '12px 24px',
            display: 'flex',
            gap: 8,
            overflowX: 'auto',
            scrollbarWidth: 'none',
          }}
        >
          {(seccion === 'comercios' ? RUBROS_COMERCIOS : RUBROS_OFICIOS).map(rubro => {
            const activo = seccion === 'comercios' ? rubroComercio === rubro : rubroOficio === rubro
            return (
              <button
                key={rubro}
                onClick={() =>
                  seccion === 'comercios' ? setRubroComercio(rubro) : setRubroOficio(rubro)
                }
                style={{
                  flexShrink: 0,
                  padding: '7px 16px',
                  borderRadius: 100,
                  border: `1.5px solid ${activo ? accentColor : '#E8E0D8'}`,
                  background: activo ? accentColor : 'white',
                  color: activo ? 'white' : '#4B4B4B',
                  fontFamily: 'var(--f-mono)',
                  fontSize: 11,
                  letterSpacing: '0.04em',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                  whiteSpace: 'nowrap',
                }}
              >
                {rubro}
              </button>
            )
          })}
        </div>
      </div>

      {/* ── CONTENIDO ────────────────────────────────────────────────────── */}
      <section style={{ maxWidth: 1200, margin: '0 auto', padding: '48px 24px 120px' }}>

        {/* Contador */}
        <div
          style={{
            fontFamily: 'var(--f-mono)',
            fontSize: 11,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: '#9B9B9B',
            marginBottom: 28,
          }}
        >
          {seccion === 'comercios'
            ? `${comerciosFiltrados.length} comercio${comerciosFiltrados.length !== 1 ? 's' : ''} en San Luis`
            : `${oficiosFiltrados.length} prestador${oficiosFiltrados.length !== 1 ? 'es' : ''} disponible${oficiosFiltrados.length !== 1 ? 's' : ''}`}
        </div>

        {/* Grid COMERCIOS */}
        {seccion === 'comercios' && (
          <>
            {comerciosFiltrados.length > 0 ? (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(min(280px, 100%), 1fr))',
                  gap: 20,
                }}
              >
                {comerciosFiltrados.map(c => (
                  <ComercioCard key={c.id} c={c} />
                ))}
              </div>
            ) : (
              <EmptyState tipo="comercios" rubro={rubroComercio} />
            )}
          </>
        )}

        {/* Grid OFICIOS */}
        {seccion === 'oficios' && (
          <>
            {oficiosFiltrados.length > 0 ? (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(min(300px, 100%), 1fr))',
                  gap: 16,
                  marginBottom: 48,
                }}
              >
                {oficiosFiltrados.map((o, i) => (
                  <OficioCard key={i} o={o} />
                ))}
              </div>
            ) : (
              <EmptyState tipo="oficios" rubro={rubroOficio} />
            )}

            {/* CTA Registrarse como prestador */}
            <div
              style={{
                borderRadius: 20,
                border: '2px dashed #BAE6FD',
                background: '#F0F9FF',
                padding: '40px 32px',
                textAlign: 'center',
                marginTop: 32,
              }}
            >
              <div style={{ fontSize: 40, marginBottom: 12 }}>🔧</div>
              <div
                style={{
                  fontFamily: 'var(--f-display)',
                  fontWeight: 700,
                  fontSize: 22,
                  color: '#0C4A6E',
                  marginBottom: 8,
                }}
              >
                ¿Ofrecés un servicio?
              </div>
              <p
                style={{
                  fontFamily: 'var(--f-display)',
                  fontSize: 15,
                  color: '#0369A1',
                  lineHeight: 1.6,
                  margin: '0 0 24px',
                }}
              >
                Registrate gratis y empezá a recibir clientes de San Luis hoy mismo.
              </p>
              <a
                href="/market/oficios/registrarse"
                style={{
                  display: 'inline-block',
                  background: '#0EA5E9',
                  color: 'white',
                  textDecoration: 'none',
                  borderRadius: 10,
                  padding: '13px 32px',
                  fontFamily: 'var(--f-mono)',
                  fontSize: 12,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  fontWeight: 700,
                }}
              >
                Registrate gratis →
              </a>
            </div>
          </>
        )}
      </section>

      {/* ── FOOTER ───────────────────────────────────────────────────────── */}
      <footer
        style={{
          background: '#1A1A1A',
          color: 'rgba(255,255,255,0.45)',
          padding: '40px 24px',
          textAlign: 'center',
          fontFamily: 'var(--f-mono)',
          fontSize: 11,
          letterSpacing: '0.06em',
        }}
      >
        DIVINIA Market · San Luis Capital · 2026
      </footer>
    </div>
  )
}

// ─── Empty State ──────────────────────────────────────────────────────────

function EmptyState({ tipo, rubro }: { tipo: string; rubro: string }) {
  return (
    <div
      style={{
        padding: '80px 40px',
        textAlign: 'center',
        borderRadius: 20,
        border: '1px dashed #E8E0D8',
        background: 'white',
      }}
    >
      <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
      <div
        style={{
          fontFamily: 'var(--f-display)',
          fontWeight: 700,
          fontSize: 20,
          color: '#1A1A1A',
          marginBottom: 8,
        }}
      >
        Sin resultados para &quot;{rubro}&quot;
      </div>
      <p
        style={{
          fontFamily: 'var(--f-display)',
          fontSize: 15,
          color: '#6B6B6B',
          lineHeight: 1.6,
        }}
      >
        Todavía no hay {tipo} de este rubro en el marketplace.
        <br />
        ¡Sé el primero en sumarte!
      </p>
    </div>
  )
}
