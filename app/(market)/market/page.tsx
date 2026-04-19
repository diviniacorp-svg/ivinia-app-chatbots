import { createAdminClient } from '@/lib/supabase'

const DEMO_COMERCIOS = [
  {
    id: '1',
    slug: 'la-esquina-pizzeria',
    nombre: 'La Esquina Pizzería',
    descripcion: 'Las mejores pizzas a la piedra de San Luis.',
    direccion: 'Av. Illia 450, San Luis',
    mp_categorias: { nombre: 'Pizzerías', emoji: '🍕' },
  },
  {
    id: '2',
    slug: 'sushi-nakama',
    nombre: 'Sushi Nakama',
    descripcion: 'Rolls artesanales con ingredientes frescos.',
    direccion: 'San Martín 780, San Luis',
    mp_categorias: { nombre: 'Sushi', emoji: '🍱' },
  },
  {
    id: '3',
    slug: 'burger-bros',
    nombre: 'Burger Bros',
    descripcion: 'Hamburguesas artesanales con papas fritas caseras.',
    direccion: 'Colón 550, San Luis',
    mp_categorias: { nombre: 'Hamburguesas', emoji: '🍔' },
  },
]

function ComercioCard({ comercio }: { comercio: typeof DEMO_COMERCIOS[0] & Record<string, unknown> }) {
  const categorias = comercio.mp_categorias as { nombre?: string; emoji?: string } | null
  return (
    <a
      href={`/market/${comercio.slug}`}
      style={{
        textDecoration: 'none',
        display: 'block',
        borderRadius: 16,
        overflow: 'hidden',
        border: '1px solid #E8E0D8',
        background: 'white',
        transition: 'box-shadow 0.2s',
      }}
    >
      {/* Banner placeholder */}
      <div
        style={{
          height: 160,
          background: 'linear-gradient(135deg, #FF6B35 0%, #FF8C42 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <span style={{ fontSize: 48 }}>{categorias?.emoji ?? '🏪'}</span>
      </div>
      {/* Info */}
      <div style={{ padding: '16px 20px 20px' }}>
        <div
          style={{
            fontFamily: 'var(--f-mono)',
            fontSize: 10,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: '#FF6B35',
            marginBottom: 6,
          }}
        >
          {categorias?.nombre ?? 'Comercio'}
        </div>
        <div
          style={{
            fontFamily: 'var(--f-display)',
            fontWeight: 700,
            fontSize: 18,
            color: '#1A1A1A',
            marginBottom: 6,
            lineHeight: 1.2,
          }}
        >
          {comercio.nombre}
        </div>
        <div
          style={{
            fontFamily: 'var(--f-display)',
            fontSize: 13,
            color: '#6B6B6B',
            lineHeight: 1.5,
            marginBottom: 12,
          }}
        >
          {comercio.descripcion
            ? String(comercio.descripcion).slice(0, 80) + '...'
            : ''}
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <span style={{ fontFamily: 'var(--f-mono)', fontSize: 11, color: '#6B6B6B' }}>
            📍 {comercio.direccion ? String(comercio.direccion).split(',')[0] : ''}
          </span>
          <span
            style={{
              fontFamily: 'var(--f-mono)',
              fontSize: 11,
              color: '#FF6B35',
              fontWeight: 700,
            }}
          >
            Ver →
          </span>
        </div>
      </div>
    </a>
  )
}

export default async function MarketPage() {
  const db = createAdminClient()

  const { data: comerciosRaw } = await db
    .from('mp_comercios')
    .select('*, mp_categorias(nombre, emoji, tipo)')
    .eq('activo', true)
    .order('created_at', { ascending: false })

  const { data: categorias } = await db.from('mp_categorias').select('*').order('orden')

  const comercios = (comerciosRaw as typeof DEMO_COMERCIOS & Record<string, unknown>[] | null) ?? DEMO_COMERCIOS

  return (
    <div style={{ fontFamily: 'var(--f-display)' }}>
      {/* NAVBAR */}
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
            justifyContent: 'space-between',
          }}
        >
          <a href="/market" style={{ textDecoration: 'none' }}>
            <span
              style={{
                fontFamily: 'var(--f-mono)',
                fontSize: 14,
                fontWeight: 700,
                color: '#1A1A1A',
                letterSpacing: '-0.02em',
              }}
            >
              DIVINIA
            </span>
            <span style={{ fontFamily: 'var(--f-mono)', fontSize: 14, color: '#FF6B35' }}>
              {' '}Market
            </span>
          </a>
          <span
            className="hidden-mobile"
            style={{
              fontFamily: 'var(--f-mono)',
              fontSize: 11,
              textTransform: 'uppercase',
              color: '#6B6B6B',
              letterSpacing: '0.08em',
            }}
          >
            San Luis Capital
          </span>
          <a href="/market/unirse" style={{ textDecoration: 'none' }}>
            <button
              style={{
                background: '#FF6B35',
                color: 'white',
                borderRadius: 8,
                padding: '8px 18px',
                fontFamily: 'var(--f-mono)',
                fontSize: 11,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              Sumá tu negocio →
            </button>
          </a>
        </div>
      </nav>

      {/* HERO */}
      <div style={{ maxWidth: 700, margin: '0 auto', padding: '120px 24px 80px', textAlign: 'center' }}>
        <div
          style={{
            fontFamily: 'var(--f-mono)',
            fontSize: 11,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: '#FF6B35',
            marginBottom: 20,
          }}
        >
          San Luis Capital — Beta
        </div>
        <h1
          style={{
            fontFamily: 'var(--f-display)',
            fontWeight: 800,
            fontSize: 'clamp(44px, 7vw, 88px)',
            color: '#1A1A1A',
            letterSpacing: '-0.04em',
            lineHeight: 1.05,
            marginBottom: 24,
            margin: '0 0 24px',
          }}
        >
          Todo San Luis
          <br />
          en un solo lugar.
        </h1>
        <p
          style={{
            fontFamily: 'var(--f-display)',
            fontSize: 18,
            color: '#6B6B6B',
            lineHeight: 1.6,
            marginBottom: 40,
            maxWidth: '44ch',
            margin: '0 auto 40px',
          }}
        >
          Pedí a tus comercios favoritos, contratá servicios y apoyá los negocios locales de tu
          ciudad.
        </p>
        {/* Barra de búsqueda decorativa */}
        <div
          style={{
            display: 'flex',
            gap: 0,
            maxWidth: 480,
            margin: '0 auto',
            borderRadius: 12,
            overflow: 'hidden',
            border: '1.5px solid #E8E0D8',
            background: 'white',
          }}
        >
          <input
            placeholder="¿Qué querés pedir hoy?"
            style={{
              flex: 1,
              padding: '16px 20px',
              border: 'none',
              outline: 'none',
              fontFamily: 'var(--f-display)',
              fontSize: 15,
              background: 'transparent',
            }}
          />
          <button
            style={{
              padding: '16px 24px',
              background: '#FF6B35',
              color: 'white',
              border: 'none',
              fontFamily: 'var(--f-mono)',
              fontSize: 12,
              letterSpacing: '0.06em',
              cursor: 'pointer',
            }}
          >
            Buscar
          </button>
        </div>
      </div>

      {/* CATEGORÍAS */}
      <div style={{ borderBottom: '1px solid #E8E0D8' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px 60px' }}>
          <div style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 8 }}>
            {/* Pill "Todo" */}
            <button
              style={{
                flexShrink: 0,
                padding: '10px 20px',
                borderRadius: 100,
                border: '1.5px solid #1A1A1A',
                background: '#1A1A1A',
                color: 'white',
                fontFamily: 'var(--f-mono)',
                fontSize: 12,
                cursor: 'pointer',
              }}
            >
              Todo
            </button>
            {categorias?.map((cat: Record<string, unknown>) => (
              <button
                key={cat.id as string}
                style={{
                  flexShrink: 0,
                  padding: '10px 20px',
                  borderRadius: 100,
                  border: '1.5px solid #E8E0D8',
                  background: 'white',
                  color: '#1A1A1A',
                  fontFamily: 'var(--f-mono)',
                  fontSize: 12,
                  cursor: 'pointer',
                }}
              >
                {cat.emoji as string} {cat.nombre as string}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* GRID DE COMERCIOS */}
      <section style={{ maxWidth: 1200, margin: '0 auto', padding: '60px 24px 120px' }}>
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
          {comercios?.length ?? 0} negocios en San Luis
        </div>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(min(280px, 100%), 1fr))',
            gap: 20,
          }}
        >
          {(comercios ?? DEMO_COMERCIOS).map((c) => (
            <ComercioCard key={c.id} comercio={c as typeof DEMO_COMERCIOS[0] & Record<string, unknown>} />
          ))}
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
