import { notFound } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase'

interface PageProps {
  params: { slug: string }
}

interface Categoria {
  nombre: string
  emoji: string
}

interface Comercio {
  id: string
  slug: string
  nombre: string
  descripcion: string | null
  direccion: string | null
  telefono: string | null
  mp_categorias: Categoria | null
}

interface Producto {
  id: string
  nombre: string
  descripcion: string | null
  precio: number | null
  imagen_url: string | null
  disponible: boolean
}

export default async function ComercioPage({ params }: PageProps) {
  const db = createAdminClient()

  const { data: comercio, error } = await db
    .from('mp_comercios')
    .select('*, mp_categorias(nombre, emoji)')
    .eq('slug', params.slug)
    .single()

  if (error || !comercio) {
    notFound()
  }

  const c = comercio as unknown as Comercio

  const { data: productosRaw } = await db
    .from('mp_productos')
    .select('*')
    .eq('comercio_id', c.id)
    .eq('disponible', true)
    .order('orden')

  const productos = productosRaw as unknown as Producto[] | null

  return (
    <div style={{ fontFamily: 'var(--f-display)', background: '#FFFBF5', minHeight: '100vh' }}>
      {/* NAVBAR simple */}
      <nav
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 50,
          background: 'rgba(255,251,245,0.92)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid #E8E0D8',
          padding: '16px 0',
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
          }}
        >
          <a
            href="/market"
            style={{
              fontFamily: 'var(--f-mono)',
              fontSize: 12,
              color: '#6B6B6B',
              textDecoration: 'none',
              letterSpacing: '0.04em',
            }}
          >
            ← Volver al marketplace
          </a>
          <span style={{ color: '#E8E0D8' }}>|</span>
          <span
            style={{
              fontFamily: 'var(--f-mono)',
              fontSize: 12,
              color: '#1A1A1A',
              fontWeight: 700,
            }}
          >
            DIVINIA
          </span>
          <span style={{ fontFamily: 'var(--f-mono)', fontSize: 12, color: '#FF6B35' }}>
            Market
          </span>
        </div>
      </nav>

      {/* HEADER del comercio */}
      <div style={{ paddingTop: 65 }}>
        {/* Banner */}
        <div
          style={{
            height: 200,
            background: 'linear-gradient(135deg, #FF6B35 0%, #FF8C42 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <span style={{ fontSize: 72 }}>{c.mp_categorias?.emoji ?? '🏪'}</span>
        </div>

        {/* Info del comercio */}
        <div style={{ maxWidth: 900, margin: '0 auto', padding: '32px 24px 40px' }}>
          <div
            style={{
              fontFamily: 'var(--f-mono)',
              fontSize: 11,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: '#FF6B35',
              marginBottom: 8,
            }}
          >
            {c.mp_categorias?.nombre ?? 'Comercio'}
          </div>
          <h1
            style={{
              fontFamily: 'var(--f-display)',
              fontWeight: 800,
              fontSize: 'clamp(32px, 5vw, 56px)',
              color: '#1A1A1A',
              letterSpacing: '-0.03em',
              lineHeight: 1.1,
              margin: '0 0 12px',
            }}
          >
            {c.nombre}
          </h1>
          {c.descripcion && (
            <p
              style={{
                fontFamily: 'var(--f-display)',
                fontSize: 16,
                color: '#6B6B6B',
                lineHeight: 1.6,
                margin: '0 0 20px',
                maxWidth: '60ch',
              }}
            >
              {c.descripcion}
            </p>
          )}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
            {c.direccion && (
              <span
                style={{
                  fontFamily: 'var(--f-mono)',
                  fontSize: 12,
                  color: '#6B6B6B',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                📍 {c.direccion}
              </span>
            )}
            {c.telefono && (
              <a
                href={`tel:${c.telefono}`}
                style={{
                  fontFamily: 'var(--f-mono)',
                  fontSize: 12,
                  color: '#FF6B35',
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                📞 {c.telefono}
              </a>
            )}
          </div>
        </div>
      </div>

      {/* PRODUCTOS */}
      <section style={{ maxWidth: 900, margin: '0 auto', padding: '0 24px 120px' }}>
        <div
          style={{
            borderTop: '1px solid #E8E0D8',
            paddingTop: 40,
          }}
        >
          <div
            style={{
              fontFamily: 'var(--f-mono)',
              fontSize: 11,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: '#6B6B6B',
              marginBottom: 32,
            }}
          >
            Menú
          </div>

          {productos && productos.length > 0 ? (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
                gap: 16,
              }}
            >
              {productos.map((p) => (
                <div
                  key={p.id}
                  style={{
                    borderRadius: 12,
                    border: '1px solid #E8E0D8',
                    background: 'white',
                    overflow: 'hidden',
                  }}
                >
                  {p.imagen_url ? (
                    <img
                      src={p.imagen_url}
                      alt={p.nombre}
                      style={{ width: '100%', height: 140, objectFit: 'cover', display: 'block' }}
                    />
                  ) : (
                    <div
                      style={{
                        height: 100,
                        background: '#F5F0EA',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 32,
                      }}
                    >
                      {c.mp_categorias?.emoji ?? '🍽️'}
                    </div>
                  )}
                  <div style={{ padding: '14px 16px 16px' }}>
                    <div
                      style={{
                        fontFamily: 'var(--f-display)',
                        fontWeight: 700,
                        fontSize: 16,
                        color: '#1A1A1A',
                        marginBottom: 4,
                      }}
                    >
                      {p.nombre}
                    </div>
                    {p.descripcion && (
                      <div
                        style={{
                          fontFamily: 'var(--f-display)',
                          fontSize: 13,
                          color: '#6B6B6B',
                          lineHeight: 1.5,
                          marginBottom: 12,
                        }}
                      >
                        {p.descripcion}
                      </div>
                    )}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      {p.precio != null && (
                        <span
                          style={{
                            fontFamily: 'var(--f-mono)',
                            fontSize: 15,
                            fontWeight: 700,
                            color: '#1A1A1A',
                          }}
                        >
                          ${p.precio.toLocaleString('es-AR')}
                        </span>
                      )}
                      <button
                        style={{
                          background: '#FF6B35',
                          color: 'white',
                          border: 'none',
                          borderRadius: 8,
                          padding: '8px 16px',
                          fontFamily: 'var(--f-mono)',
                          fontSize: 11,
                          letterSpacing: '0.06em',
                          cursor: 'pointer',
                        }}
                      >
                        Agregar
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div
              style={{
                padding: '60px 40px',
                textAlign: 'center',
                borderRadius: 16,
                border: '1px dashed #E8E0D8',
                background: 'white',
              }}
            >
              <div style={{ fontSize: 48, marginBottom: 16 }}>🚧</div>
              <div
                style={{
                  fontFamily: 'var(--f-display)',
                  fontWeight: 700,
                  fontSize: 20,
                  color: '#1A1A1A',
                  marginBottom: 8,
                }}
              >
                Menú en construcción
              </div>
              <p
                style={{
                  fontFamily: 'var(--f-display)',
                  fontSize: 15,
                  color: '#6B6B6B',
                  lineHeight: 1.6,
                  marginBottom: 24,
                }}
              >
                Contactá al comercio directamente para hacer tu pedido.
              </p>
              {c.telefono && (
                <a
                  href={`tel:${c.telefono}`}
                  style={{
                    display: 'inline-block',
                    background: '#FF6B35',
                    color: 'white',
                    textDecoration: 'none',
                    borderRadius: 10,
                    padding: '12px 28px',
                    fontFamily: 'var(--f-mono)',
                    fontSize: 12,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                  }}
                >
                  📞 Llamar a {c.nombre}
                </a>
              )}
            </div>
          )}
        </div>
      </section>

      {/* FOOTER */}
      <footer
        style={{
          background: '#1A1A1A',
          color: 'rgba(255,255,255,0.5)',
          padding: '40px 24px',
          textAlign: 'center',
          fontFamily: 'var(--f-mono)',
          fontSize: 11,
        }}
      >
        DIVINIA Market · San Luis Capital · 2026
      </footer>
    </div>
  )
}
