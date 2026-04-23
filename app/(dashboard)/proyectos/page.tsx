'use client'

import Link from 'next/link'
import { useState } from 'react'

type Proyecto = {
  id: string
  nombre: string
  tagline: string
  descripcion: string
  status: 'activo' | 'en-desarrollo' | 'idea' | 'pausado'
  icon: string
  color: string
  progreso: number
  href?: string
  proximos: string[]
  kpis?: { label: string; valor: string }[]
  categoria: 'producto-divinia' | 'app-propia'
}

const PROYECTOS: Proyecto[] = [
  {
    id: 'turnero',
    nombre: 'Turnero IA',
    tagline: 'Sistema de reservas inteligente para PYMEs',
    descripcion: 'Producto hero de DIVINIA. Sistema de turnos con IA, confirmaciones automáticas y panel de gestión. Activo y en venta desde San Luis. Cliente real: Estética tuEspacio (Romina).',
    status: 'activo',
    icon: '📅',
    color: '#C6FF3D',
    progreso: 85,
    href: '/turnos',
    categoria: 'producto-divinia',
    proximos: ['Integración MercadoPago', 'Notificaciones WhatsApp', 'App móvil (PWA)', 'Analytics por rubro'],
    kpis: [
      { label: 'Clientes', valor: 'Romina + demos' },
      { label: 'Precio desde', valor: '$45k/mes' },
      { label: 'Setup', valor: '48hs' },
    ],
  },
  {
    id: 'nucleus',
    nombre: 'NUCLEUS IA',
    tagline: 'Cerebro IA para negocios — memoria, agentes, automatización total',
    descripcion: 'El producto más diferenciador. Cerebro IA que automatiza el negocio completo del cliente. Primer cierre: Shopping del Usado. En desarrollo para Dorotea (Santiago Peral).',
    status: 'en-desarrollo',
    icon: '🧠',
    color: '#A78BFA',
    progreso: 40,
    href: '/nucleo',
    categoria: 'producto-divinia',
    proximos: ['Cerrar Shopping del Usado', 'Entregar Dorotea (Santiago Peral)', 'Memory store en Supabase', 'Agente comercial autónomo'],
    kpis: [
      { label: 'Primer cliente', valor: 'Shopping del Usado' },
      { label: 'En desarrollo', valor: 'Dorotea' },
      { label: 'Modelo', valor: 'Claude Sonnet' },
    ],
  },
  {
    id: 'market-sl',
    nombre: 'Market San Luis',
    tagline: 'Super app comercio local — marketplace + delivery + oficios',
    descripcion: 'Webapp independiente para la comunidad de San Luis. Comercios, delivery, oficios y loyalty en una sola app. Primer ciudad, luego escalable a todo el país.',
    status: 'en-desarrollo',
    icon: '🗺️',
    color: '#38BDF8',
    progreso: 20,
    href: '/market',
    categoria: 'producto-divinia',
    proximos: ['Landing pública propia', 'Reclutar 10 comercios piloto', 'Sistema de delivery básico', 'Loyalty por QR', 'Integrar ECOSL reciclaje'],
    kpis: [
      { label: 'Comercios objetivo', valor: '50 en 6 meses' },
      { label: 'Modelo', valor: 'Comisión + suscripción' },
      { label: 'Ciudad piloto', valor: 'San Luis Capital' },
    ],
  },
  {
    id: 'content-factory',
    nombre: 'Content Factory',
    tagline: 'Producción masiva de contenido IA para clientes DIVINIA',
    descripcion: 'Sistema para producir y programar contenido de redes sociales. Base: SocialFlow (Next.js + Prisma + BullMQ). Reels, posts, copys, calendarios en minutos.',
    status: 'activo',
    icon: '✨',
    color: '#F59E0B',
    progreso: 60,
    categoria: 'producto-divinia',
    href: '/contenido',
    proximos: ['Publicación directa a Instagram', 'Templates por rubro', 'Aprobación del cliente vía link', 'Generación de avatares por cliente'],
    kpis: [
      { label: 'Formatos', valor: 'Reels, posts, copys' },
      { label: 'Pipeline', valor: 'IA → Remotion → Canva' },
      { label: 'Base', valor: 'SocialFlow' },
    ],
  },
  {
    id: 'youtube-empire',
    nombre: 'YouTube Empire',
    tagline: '15 canales faceless virales en español, full automatizado',
    descripcion: 'Proyecto personal de Joaco. 15 nichos virales producidos con IA: Claude para guiones, ElevenLabs para voz, Remotion para montaje, YouTube API para subida. Sin aparecer en cámara.',
    status: 'en-desarrollo',
    icon: '🎬',
    color: '#EF4444',
    progreso: 10,
    href: '/youtube',
    categoria: 'app-propia',
    proximos: ['Lanzar canal #1 (La Mente Oscura)', 'Setup ElevenLabs voice clone', 'Pipeline Remotion automático', 'Primeros 10 videos x canal'],
    kpis: [
      { label: 'Canales planificados', valor: '15' },
      { label: 'Proyección mes 12', valor: '$10-20k USD' },
      { label: 'Inversión mensual', valor: '~$37 USD' },
    ],
  },
  {
    id: 'ecosl',
    nombre: 'ECOSL — Reciclaje SL',
    tagline: 'App de reciclaje gamificada para San Luis',
    descripcion: 'MVP funcional. Mapas de puntos de reciclaje, scanner QR, puntos/rewards, MercadoPago. Contactos de recicladores y supermercados identificados.',
    status: 'en-desarrollo',
    icon: '♻️',
    color: '#84CC16',
    progreso: 35,
    categoria: 'app-propia',
    proximos: ['Migrar a Supabase/Vercel', 'Configurar Google Maps API', 'Contactar recicladores (NOVA SRL, Reciclados Rurales)', 'Integrar en Market SL'],
    kpis: [
      { label: 'Stack', valor: 'React PWA + Node.js' },
      { label: 'Modelo', valor: 'Publicidad + Premium' },
      { label: 'Mercado', valor: 'San Luis → ciudades' },
    ],
  },
  {
    id: 'sl-parking',
    nombre: 'SL-Parking',
    tagline: 'App de estacionamiento para San Luis',
    descripcion: 'App de gestión de estacionamiento San Luis. Potencial como módulo de Market SL o producto independiente para municipios.',
    status: 'idea',
    icon: '🅿️',
    color: '#06B6D4',
    progreso: 15,
    categoria: 'app-propia',
    proximos: ['Explorar código existente', 'Definir si va en Market SL o es producto separado', 'Evaluar modelo de negocio'],
    kpis: [],
  },
  {
    id: 'oneiric',
    nombre: 'Oneiric — App de Sueños',
    tagline: 'Registro e interpretación de sueños con IA',
    descripcion: 'App Next.js para registrar y analizar sueños. Nicho de bienestar/psicología. Candidata a monetización con Claude para interpretación.',
    status: 'idea',
    icon: '🌙',
    color: '#6366F1',
    progreso: 20,
    categoria: 'app-propia',
    proximos: ['Explorar funcionalidades', 'Evaluar mercado', 'Agregar interpretación con Claude'],
    kpis: [
      { label: 'Stack', valor: 'Next.js + Supabase' },
    ],
  },
]

const APPS_PROPIAS = PROYECTOS.filter(p => p.categoria === 'app-propia')
const PRODUCTOS_DIVINIA = PROYECTOS.filter(p => p.categoria === 'producto-divinia')

const STATUS_CONFIG = {
  activo: { label: 'Activo', color: '#10B981', bg: '#10B98115' },
  'en-desarrollo': { label: 'En desarrollo', color: '#38BDF8', bg: '#38BDF815' },
  idea: { label: 'Idea', color: '#A78BFA', bg: '#A78BFA15' },
  pausado: { label: 'Pausado', color: '#6B7280', bg: '#6B728015' },
}

export default function ProyectosPage() {
  const [seccion, setSeccion] = useState<'divinia' | 'apps'>('divinia')
  const activos = PRODUCTOS_DIVINIA.filter(p => p.status === 'activo').length
  const enDesarrollo = PRODUCTOS_DIVINIA.filter(p => p.status === 'en-desarrollo').length
  const lista = seccion === 'divinia' ? PRODUCTOS_DIVINIA : APPS_PROPIAS

  return (
    <div style={{ minHeight: '100vh', background: 'var(--paper-2)' }}>

      {/* Header */}
      <div style={{ padding: '36px 40px 28px', borderBottom: '1px solid var(--line)', background: 'var(--paper)' }}>
        <div style={{ fontFamily: 'var(--f-mono)', fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 8 }}>
          Laboratorio
        </div>
        <h1 style={{ fontFamily: 'var(--f-display)', fontStyle: 'italic', fontWeight: 700, fontSize: 'clamp(28px, 4vw, 42px)', color: 'var(--ink)', letterSpacing: '-0.04em', lineHeight: 1.1, margin: 0 }}>
          Proyectos
        </h1>
        <p style={{ marginTop: 8, fontFamily: 'var(--f-display)', fontSize: 14, color: 'var(--muted-2)', marginBottom: 0 }}>
          Todo lo que se está construyendo en el universo DIVINIA
        </p>
        <div style={{ display: 'flex', gap: 24, marginTop: 20, flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontFamily: 'var(--f-display)', fontStyle: 'italic', fontWeight: 700, fontSize: 24, color: '#10B981', letterSpacing: '-0.04em' }}>{activos}</div>
            <div style={{ fontFamily: 'var(--f-mono)', fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--muted)' }}>Activos</div>
          </div>
          <div>
            <div style={{ fontFamily: 'var(--f-display)', fontStyle: 'italic', fontWeight: 700, fontSize: 24, color: '#38BDF8', letterSpacing: '-0.04em' }}>{enDesarrollo}</div>
            <div style={{ fontFamily: 'var(--f-mono)', fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--muted)' }}>En desarrollo</div>
          </div>
          <div>
            <div style={{ fontFamily: 'var(--f-display)', fontStyle: 'italic', fontWeight: 700, fontSize: 24, color: '#A78BFA', letterSpacing: '-0.04em' }}>{APPS_PROPIAS.length}</div>
            <div style={{ fontFamily: 'var(--f-mono)', fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--muted)' }}>Apps propias</div>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 8, marginTop: 24 }}>
          {([
            { id: 'divinia', label: '🚀 Productos DIVINIA', desc: 'Lo que vendés' },
            { id: 'apps', label: '🔬 Apps propias', desc: 'Para integrar o lanzar' },
          ] as const).map(t => (
            <button key={t.id} onClick={() => setSeccion(t.id)}
              style={{
                padding: '8px 18px', borderRadius: 8, cursor: 'pointer', border: 'none',
                fontFamily: 'var(--f-mono)', fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase',
                background: seccion === t.id ? 'rgba(255,255,255,0.12)' : 'transparent',
                color: seccion === t.id ? 'var(--paper)' : 'rgba(255,255,255,0.35)',
                fontWeight: seccion === t.id ? 700 : 400,
              }}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Proyectos */}
      <div style={{ padding: '32px 40px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        {lista.map(p => {
          const st = STATUS_CONFIG[p.status]
          return (
            <div key={p.id} style={{
              background: 'var(--paper)',
              border: '1px solid var(--line)',
              borderRadius: 14,
              overflow: 'hidden',
            }}>
              {/* Top bar de progreso */}
              <div style={{ height: 3, background: 'var(--line)' }}>
                <div style={{ height: '100%', width: `${p.progreso}%`, background: p.color, transition: 'width 0.6s ease' }} />
              </div>

              <div style={{ padding: '28px 32px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 20, flexWrap: 'wrap', marginBottom: 20 }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
                    <div style={{
                      width: 44, height: 44, borderRadius: 10, flexShrink: 0,
                      background: p.color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 22,
                    }}>
                      {p.icon}
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                        <h2 style={{ fontFamily: 'var(--f-display)', fontWeight: 700, fontSize: 18, color: 'var(--ink)', margin: 0 }}>{p.nombre}</h2>
                        <span style={{
                          fontFamily: 'var(--f-mono)', fontSize: 9, letterSpacing: '0.1em',
                          textTransform: 'uppercase', color: st.color, background: st.bg,
                          border: `1px solid ${st.color}40`, borderRadius: 5, padding: '2px 8px',
                        }}>
                          {st.label}
                        </span>
                      </div>
                      <div style={{ fontFamily: 'var(--f-display)', fontSize: 13, color: 'var(--muted-2)', marginBottom: 8 }}>{p.tagline}</div>
                      <div style={{ fontFamily: 'var(--f-display)', fontSize: 13, color: 'var(--muted-2)', lineHeight: 1.6, maxWidth: '60ch' }}>{p.descripcion}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
                    <div style={{ fontFamily: 'var(--f-mono)', fontSize: 11, color: 'var(--muted)', textAlign: 'right' }}>
                      <span style={{ color: p.color, fontWeight: 700 }}>{p.progreso}%</span> completado
                    </div>
                    {p.href && (
                      <Link href={p.href} style={{
                        padding: '8px 16px', borderRadius: 8,
                        border: `1px solid ${p.color}50`, background: p.color + '10',
                        fontFamily: 'var(--f-mono)', fontSize: 10, letterSpacing: '0.08em',
                        textTransform: 'uppercase', color: p.color, textDecoration: 'none',
                        fontWeight: 700,
                      }}>
                        Abrir →
                      </Link>
                    )}
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 24, flexWrap: 'wrap' }}>
                  {/* Próximos pasos */}
                  <div>
                    <div style={{ fontFamily: 'var(--f-mono)', fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--muted)', marginBottom: 10 }}>
                      Próximos pasos
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                      {p.proximos.map(paso => (
                        <span key={paso} style={{
                          fontFamily: 'var(--f-display)', fontSize: 12, color: 'var(--muted-2)',
                          background: 'var(--paper-2)', border: '1px solid var(--line)',
                          borderRadius: 6, padding: '4px 10px',
                        }}>
                          {paso}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* KPIs */}
                  {p.kpis && (
                    <div style={{ display: 'flex', gap: 20, flexShrink: 0, flexWrap: 'wrap' }}>
                      {p.kpis.map(k => (
                        <div key={k.label} style={{ textAlign: 'right' }}>
                          <div style={{ fontFamily: 'var(--f-display)', fontWeight: 700, fontSize: 15, color: 'var(--ink)' }}>{k.valor}</div>
                          <div style={{ fontFamily: 'var(--f-mono)', fontSize: 8, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--muted)' }}>{k.label}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
