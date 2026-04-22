'use client'

import { useState } from 'react'
import Link from 'next/link'

const DEPTS = [
  {
    id: '01-ia', num: '01', nombre: 'IA & Automatizaciones', director: 'Director de IA',
    color: '#C6FF3D', estado: 'activo',
    agentes: ['Dev de Agentes', 'Integrador API', 'Orquestador', 'Optimizador de Costos'],
    flujos: [
      { label: 'Crear chatbot para cliente', pasos: ['Brief del cliente', 'Elegir template', 'Configurar IA', 'Deploy'] },
      { label: 'Automatizar proceso PYME', pasos: ['Mapear proceso', 'Diseñar flujo', 'Conectar APIs', 'QA'] },
    ],
    href: '/agents',
  },
  {
    id: '02-web', num: '02', nombre: 'Web & Apps', director: 'Director de Desarrollo',
    color: '#38BDF8', estado: 'activo',
    agentes: ['Frontend Dev', 'Backend Dev', 'Mobile Dev', 'DevOps'],
    flujos: [
      { label: 'Landing page cliente', pasos: ['Brief + logo', 'Next.js', 'Review', 'Vercel'] },
      { label: 'Onboarding Turnero', pasos: ['Crear config', 'Horarios', 'Servicios', 'Entregar link'] },
    ],
    href: '/clientes',
  },
  {
    id: '03-youtube', num: '03', nombre: 'YouTube & Multimedia', director: 'Director Multimedia',
    color: '#FF6B35', estado: 'pendiente',
    agentes: ['Guionista IA', 'Productor AV', 'SEO YouTube', 'Multicanal'],
    flujos: [
      { label: 'Video tutorial', pasos: ['Guion Claude', 'Grabar demo', 'CapCut', 'SEO + publicar'] },
      { label: 'Reel para Instagram', pasos: ['Brief', 'Grabación', 'Música + subs', 'Publicar'] },
    ],
    href: '/youtube',
  },
  {
    id: '04-content', num: '04', nombre: 'Content Factory', director: 'Director de Contenido',
    color: '#E879F9', estado: 'activo',
    agentes: ['Copywriter IA', 'Diseñador IA', 'Video Creator', 'Voice Creator'],
    flujos: [
      { label: 'Post Instagram DIVINIA', pasos: ['Pipeline IA', 'Canva diseño', 'Revisión', 'Publicar'] },
      { label: 'Pack contenido cliente', pasos: ['Brief', 'Generar 30 posts', 'Diseño Canva', 'Entregar'] },
    ],
    href: '/contenido',
  },
  {
    id: '05-clientes', num: '05', nombre: 'Clientes & Servicios', director: 'Director Comercial',
    color: '#10B981', estado: 'activo',
    agentes: ['CRM Manager', 'Vendedor IA', 'Project Delivery', 'Soporte Técnico'],
    flujos: [
      { label: 'Lead nuevo → Cierre', pasos: ['Apify scraping', 'Score IA', 'Propuesta', 'Cobrar 50%'] },
      { label: 'Entrega de proyecto', pasos: ['QA interno', 'Demo cliente', 'Aprobación Joaco', 'Cobrar 50%'] },
    ],
    href: '/crm',
  },
  {
    id: '06-avatares', num: '06', nombre: 'Avatares IA', director: 'Director de Avatares',
    color: '#818CF8', estado: 'activo',
    agentes: ['Diseñador Avatares', 'Voice Cloner', 'Integrador Video', 'Vendedor Avatares'],
    flujos: [
      { label: 'Avatar corporativo', pasos: ['Fotos/video', 'Voz ElevenLabs', 'HeyGen avatar', 'Pack videos'] },
      { label: 'Avatar atención al cliente', pasos: ['Guion base', 'D-ID animación', 'Integrar web', 'Entregar'] },
    ],
    href: '/avatares',
  },
  {
    id: '07-legal', num: '07', nombre: 'Legal & Compliance', director: 'Director Legal',
    color: '#94A3B8', estado: 'pendiente',
    agentes: ['Contratos IA', 'Compliance', 'Propiedad Intelectual'],
    flujos: [
      { label: 'Contrato para cliente', pasos: ['Datos del cliente', 'Generar contrato IA', 'Review Joaco', 'Firmar'] },
    ],
    href: '/agents',
  },
  {
    id: '08-seguridad', num: '08', nombre: 'Ciberseguridad', director: 'Director de Seguridad',
    color: '#06B6D4', estado: 'pendiente',
    agentes: ['Security Agent', 'Infra Manager', 'Auditor'],
    flujos: [
      { label: 'Auditoría mensual', pasos: ['API keys', 'Rotar vencidas', 'Revisar logs', 'Reporte'] },
    ],
    href: '/agents',
  },
  {
    id: '09-finanzas', num: '09', nombre: 'Contabilidad & Finanzas', director: 'Director Financiero',
    color: '#FCD34D', estado: 'activo',
    agentes: ['Contador IA', 'Fiscal IA AFIP', 'Cash Flow', 'Facturador'],
    flujos: [
      { label: 'Cobrar a cliente', pasos: ['Link MercadoPago', 'Enviar', 'Confirmar pago', 'Registrar'] },
      { label: 'Cierre mensual', pasos: ['Ingresos', 'Gastos APIs', 'Calcular margen', 'Reporte Joaco'] },
    ],
    href: '/finanzas',
  },
  {
    id: '10-rrhh', num: '10', nombre: 'RRHH Digital', director: 'Director de RRHH',
    color: '#FB923C', estado: 'pendiente',
    agentes: ['Agent Creator', 'Agent Trainer', 'Documentador'],
    flujos: [
      { label: 'Crear nuevo agente IA', pasos: ['Definir rol', 'System prompt', 'Testear', 'Deploy + doc'] },
    ],
    href: '/agents',
  },
  {
    id: '11-innovacion', num: '11', nombre: 'Actualización & Innovación', director: 'Director de Innovación',
    color: '#2DD4BF', estado: 'pendiente',
    agentes: ['Tech Researcher', 'System Updater', 'Innovador'],
    flujos: [
      { label: 'Research semanal IA', pasos: ['Releases Anthropic/Google', 'Evaluar modelos', 'Proponer updates', 'Implementar'] },
    ],
    href: '/agents',
  },
]

export default function OrquestacionPage() {
  const [expandido, setExpandido] = useState<string | null>(null)
  const [filtro, setFiltro] = useState<'todos' | 'activo' | 'pendiente'>('todos')

  const filtrados = DEPTS.filter(d => filtro === 'todos' || d.estado === filtro)
  const activos = DEPTS.filter(d => d.estado === 'activo').length

  return (
    <div style={{ minHeight: '100vh', background: 'var(--paper-2)' }}>

      {/* Header */}
      <div style={{ padding: '36px 40px 28px', borderBottom: '1px solid var(--line)', background: 'var(--paper)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div style={{ fontFamily: 'var(--f-mono)', fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 8 }}>
              DIVINIA OS · 11 Departamentos
            </div>
            <h1 style={{ fontFamily: 'var(--f-display)', fontStyle: 'italic', fontWeight: 700, fontSize: 'clamp(28px, 4vw, 42px)', color: 'var(--ink)', letterSpacing: '-0.04em', lineHeight: 1.1, margin: 0 }}>
              Orquestación
            </h1>
            <p style={{ marginTop: 8, fontFamily: 'var(--f-display)', fontSize: 14, color: 'var(--muted-2)' }}>
              {activos} activos · {DEPTS.length - activos} por activar · control central de la empresa
            </p>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            {(['todos', 'activo', 'pendiente'] as const).map(f => (
              <button
                key={f}
                onClick={() => setFiltro(f)}
                style={{
                  padding: '8px 16px', borderRadius: 8, border: '1px solid var(--line)',
                  fontFamily: 'var(--f-mono)', fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase',
                  cursor: 'pointer', transition: 'all 0.15s',
                  background: filtro === f ? 'var(--ink)' : 'var(--paper)',
                  color: filtro === f ? 'var(--paper)' : 'var(--muted)',
                }}
              >
                {f === 'todos' ? 'Todos' : f === 'activo' ? 'Activos' : 'Pendientes'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid */}
      <div style={{ padding: '32px 40px', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 12 }}>
        {filtrados.map(dept => {
          const expanded = expandido === dept.id
          return (
            <div
              key={dept.id}
              style={{
                background: 'var(--paper)', border: '1px solid var(--line)', borderRadius: 12, overflow: 'hidden',
                borderLeft: `3px solid ${dept.color}`,
              }}
            >
              <div style={{ padding: '20px 20px 16px' }}>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                  <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                    <div style={{
                      fontFamily: 'var(--f-mono)', fontSize: 11, fontWeight: 700,
                      color: dept.color, letterSpacing: '0.06em', opacity: 0.9,
                    }}>
                      {dept.num}
                    </div>
                    <div>
                      <div style={{ fontFamily: 'var(--f-display)', fontWeight: 700, fontSize: 14, color: 'var(--ink)' }}>
                        {dept.nombre}
                      </div>
                      <div style={{ fontFamily: 'var(--f-display)', fontSize: 12, color: 'var(--muted-2)' }}>
                        {dept.director}
                      </div>
                    </div>
                  </div>
                  <span style={{
                    fontFamily: 'var(--f-mono)', fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase',
                    padding: '3px 8px', borderRadius: 4,
                    background: dept.estado === 'activo' ? dept.color + '20' : 'var(--paper-2)',
                    color: dept.estado === 'activo' ? dept.color : 'var(--muted)',
                  }}>
                    {dept.estado === 'activo' ? 'Activo' : 'Pendiente'}
                  </span>
                </div>

                {/* Agentes */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 14 }}>
                  {dept.agentes.map(a => (
                    <span key={a} style={{
                      fontFamily: 'var(--f-mono)', fontSize: 9, letterSpacing: '0.06em',
                      padding: '2px 8px', borderRadius: 4,
                      background: dept.color + '12', color: dept.color,
                    }}>
                      {a}
                    </span>
                  ))}
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: 8 }}>
                  <Link href={dept.href} style={{
                    flex: 1, padding: '8px 0', borderRadius: 8, textAlign: 'center',
                    background: dept.color, color: 'var(--ink)',
                    fontFamily: 'var(--f-mono)', fontSize: 10, letterSpacing: '0.08em',
                    textTransform: 'uppercase', textDecoration: 'none', fontWeight: 700,
                  }}>
                    Ir →
                  </Link>
                  <button
                    onClick={() => setExpandido(expanded ? null : dept.id)}
                    style={{
                      padding: '8px 14px', borderRadius: 8, border: '1px solid var(--line)',
                      background: 'transparent', cursor: 'pointer',
                      fontFamily: 'var(--f-mono)', fontSize: 10, letterSpacing: '0.08em',
                      textTransform: 'uppercase', color: 'var(--muted)',
                    }}
                  >
                    {expanded ? 'Cerrar' : 'Flujos'}
                  </button>
                </div>
              </div>

              {/* Flujos expandidos */}
              {expanded && (
                <div style={{ borderTop: '1px solid var(--line)', padding: '16px 20px', background: 'var(--paper-2)' }}>
                  <div style={{ fontFamily: 'var(--f-mono)', fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 12 }}>
                    Flujos de trabajo
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {dept.flujos.map(flujo => (
                      <div key={flujo.label} style={{ background: 'var(--paper)', borderRadius: 8, padding: '12px 14px', border: '1px solid var(--line)' }}>
                        <div style={{ fontFamily: 'var(--f-display)', fontWeight: 600, fontSize: 13, color: 'var(--ink)', marginBottom: 8 }}>
                          {flujo.label}
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, alignItems: 'center' }}>
                          {flujo.pasos.map((paso, i) => (
                            <span key={i} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                              <span style={{
                                fontFamily: 'var(--f-mono)', fontSize: 9, padding: '2px 7px', borderRadius: 4,
                                background: 'var(--paper-2)', color: 'var(--muted)',
                              }}>
                                {paso}
                              </span>
                              {i < flujo.pasos.length - 1 && (
                                <span style={{ color: 'var(--muted)', fontSize: 10 }}>→</span>
                              )}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

    </div>
  )
}
