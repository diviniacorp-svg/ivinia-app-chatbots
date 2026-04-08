'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Brain, Zap, Play, CheckCircle2, Clock, AlertCircle, ChevronRight,
  Users, ShieldCheck, Scale, TrendingUp, Palette, Youtube,
  Settings, DollarSign, UserPlus, RefreshCw, Cpu, Instagram,
  BarChart3, MessageSquare, FileText, Globe
} from 'lucide-react'

// ─── Definición de los 11 departamentos ─────────────────────────────────────

const departamentos = [
  {
    id: '01-ia',
    nombre: 'IA & Automatizaciones',
    director: 'Director de IA',
    icono: Brain,
    color: 'indigo',
    estado: 'activo',
    agentes: ['Dev de Agentes', 'Integrador API', 'Orquestador', 'Optimizador de Costos'],
    flujos: [
      { id: 'chatbot-nuevo', label: 'Crear chatbot para cliente', pasos: ['Brief del cliente', 'Elegir template', 'Configurar IA', 'Probar → Deploy'] },
      { id: 'automatizar-proceso', label: 'Automatizar proceso PYME', pasos: ['Mapear proceso actual', 'Diseñar flujo', 'Conectar APIs', 'QA'] },
      { id: 'pipeline-mensual', label: 'Pipeline contenido mensual', pasos: ['Estratega planifica', 'Creador genera ×3', 'Selector elige', 'Canva genera'] },
    ],
    metricas: { label: 'Chatbots activos', valor: '—', link: '/clientes' },
    accionRapida: { label: 'Ir a Agentes', href: '/agents' },
  },
  {
    id: '02-web',
    nombre: 'Web & Apps',
    director: 'Director de Desarrollo',
    icono: Globe,
    color: 'violet',
    estado: 'activo',
    agentes: ['Frontend Dev', 'Backend Dev', 'Mobile Dev', 'DevOps'],
    flujos: [
      { id: 'nueva-landing', label: 'Landing page cliente', pasos: ['Brief + logo', 'Generar en Next.js', 'Review con cliente', 'Deploy en Vercel'] },
      { id: 'nuevo-cliente-turnos', label: 'Onboarding cliente Turnero', pasos: ['Crear config', 'Personalizar horarios', 'Configurar servicios', 'Entregar link'] },
      { id: 'fix-produccion', label: 'Fix en producción', pasos: ['Identificar bug', 'Rama hotfix', 'Test + deploy', 'Comunicar al cliente'] },
    ],
    metricas: { label: 'Clientes Turnero', valor: '—', link: '/turnos' },
    accionRapida: { label: 'Nuevo cliente Turnero', href: '/turnos/config/nuevo' },
  },
  {
    id: '03-youtube',
    nombre: 'YouTube & Multimedia',
    director: 'Director Multimedia',
    icono: Youtube,
    color: 'red',
    estado: 'pendiente',
    agentes: ['Guionista IA', 'Productor AV', 'SEO YouTube', 'Multicanal'],
    flujos: [
      { id: 'video-tutorial', label: 'Video tutorial Turnero', pasos: ['Guion IA', 'Grabar demo en pantalla', 'Editar en CapCut', 'SEO + Publicar'] },
      { id: 'reel-instagram', label: 'Reel para Instagram', pasos: ['Brief de contenido', 'Grabación/Remotion', 'Música + subtítulos', 'Publicar @autom_atia'] },
    ],
    metricas: { label: 'Videos publicados', valor: '0', link: '/contenido' },
    accionRapida: { label: 'Fábrica de Contenidos', href: '/contenido' },
  },
  {
    id: '04-content',
    nombre: 'Content Factory',
    director: 'Director de Contenido',
    icono: Palette,
    color: 'amber',
    estado: 'activo',
    agentes: ['Copywriter IA', 'Diseñador IA (Canva)', 'Video Creator', 'Voice Creator'],
    flujos: [
      { id: 'post-instagram', label: 'Post Instagram @autom_atia', pasos: ['Pipeline IA (estratega+creador+selector)', 'Canva genera diseño', 'Revisión manual', 'Publicar'] },
      { id: 'pack-cliente', label: 'Pack contenido para cliente', pasos: ['Brief del cliente', 'Generar 30 posts', 'Diseño en Canva', 'Entregar + cobrar'] },
      { id: 'carrusel', label: 'Carrusel educativo', pasos: ['Elegir tema', 'Guion de slides', 'Diseñar en Canva', 'Revisar + publicar'] },
    ],
    metricas: { label: 'Posts publicados', valor: '0', link: '/calendario' },
    accionRapida: { label: 'Pipeline de contenido', href: '/contenido/pipeline' },
  },
  {
    id: '05-clientes',
    nombre: 'Clientes & Servicios',
    director: 'Director Comercial',
    icono: Users,
    color: 'emerald',
    estado: 'activo',
    agentes: ['CRM Manager', 'Vendedor IA', 'Project Delivery', 'Soporte Técnico'],
    flujos: [
      { id: 'nuevo-lead', label: 'Lead nuevo → Cierre', pasos: ['Apify scraping', 'Score automático', 'Email outreach', 'Follow-up → Propuesta → Cobrar 50%'] },
      { id: 'entrega-proyecto', label: 'Entrega de proyecto', pasos: ['QA interno', 'Demo al cliente', 'Aprobación Joaco', 'Cobrar 50% restante'] },
      { id: 'retencion', label: 'Retención de clientes', pasos: ['Monitor detecta trial venciendo', 'Email automático', 'Follow-up por WhatsApp', 'Convertir a pago'] },
    ],
    metricas: { label: 'Leads en pipeline', valor: '—', link: '/crm' },
    accionRapida: { label: 'Ver CRM', href: '/crm' },
  },
  {
    id: '06-avatares',
    nombre: 'Avatares IA',
    director: 'Director de Avatares',
    icono: UserPlus,
    color: 'pink',
    estado: 'pendiente',
    agentes: ['Diseñador de Avatares', 'Voice Cloner', 'Integrador Video', 'Vendedor Avatares'],
    flujos: [
      { id: 'avatar-corporativo', label: 'Avatar corporativo', pasos: ['Fotos/video del cliente', 'Clonar voz (ElevenLabs)', 'Generar avatar (HeyGen)', 'Pack de videos'] },
      { id: 'avatar-atencion', label: 'Avatar atención al cliente', pasos: ['Grabar guion base', 'Generar con D-ID', 'Integrar en web', 'Entregar + cobrar'] },
    ],
    metricas: { label: 'Avatares creados', valor: '0', link: '/agents' },
    accionRapida: { label: 'Ver Agentes', href: '/agents' },
  },
  {
    id: '07-legal',
    nombre: 'Legal & Compliance',
    director: 'Director Legal',
    icono: Scale,
    color: 'slate',
    estado: 'pendiente',
    agentes: ['Contratos IA', 'Compliance', 'Propiedad Intelectual'],
    flujos: [
      { id: 'contrato-cliente', label: 'Contrato para cliente nuevo', pasos: ['Completar datos del cliente', 'Generar contrato IA', 'Revisión Joaco', 'Firmar + archivar'] },
      { id: 'tos-producto', label: 'TOS para nuevo producto', pasos: ['Definir producto', 'Generar términos', 'Review legal', 'Publicar en web'] },
      { id: 'nda', label: 'NDA para colaborador', pasos: ['Datos del colaborador', 'Generar NDA', 'Firma digital', 'Archivar'] },
    ],
    metricas: { label: 'Contratos activos', valor: '0', link: '/agents' },
    accionRapida: { label: 'Generar contrato', href: '/agents' },
  },
  {
    id: '08-seguridad',
    nombre: 'Ciberseguridad',
    director: 'Director de Seguridad',
    icono: ShieldCheck,
    color: 'cyan',
    estado: 'pendiente',
    agentes: ['Security Agent', 'Infra Manager', 'Auditor'],
    flujos: [
      { id: 'auditoria-mensual', label: 'Auditoría mensual', pasos: ['Revisar API keys activas', 'Rotar las que vencen', 'Revisar logs de acceso', 'Reporte a Joaco'] },
      { id: 'onboarding-seguro', label: 'Onboarding seguro cliente', pasos: ['Crear credenciales únicas', 'Asignar permisos mínimos', 'Documentar accesos', 'Entregar de forma segura'] },
    ],
    metricas: { label: 'Alertas activas', valor: '0', link: '/agents' },
    accionRapida: { label: 'Panel seguridad', href: '/agents' },
  },
  {
    id: '09-finanzas',
    nombre: 'Contabilidad & Finanzas',
    director: 'Director Financiero',
    icono: DollarSign,
    color: 'green',
    estado: 'pendiente',
    agentes: ['Contador IA', 'Fiscal IA (AFIP)', 'Cash Flow', 'Facturador'],
    flujos: [
      { id: 'cobro-cliente', label: 'Cobrar a cliente', pasos: ['Generar link MercadoPago', 'Enviar al cliente', 'Confirmar pago', 'Registrar en sistema'] },
      { id: 'cierre-mensual', label: 'Cierre mensual', pasos: ['Consolidar ingresos', 'Revisar gastos (APIs, suscripciones)', 'Calcular margen', 'Reporte a Joaco'] },
      { id: 'presupuesto-ia', label: 'Control costos IA', pasos: ['Revisar uso Anthropic/OpenAI', 'Detectar endpoints caros', 'Optimizar modelos', 'Proyectar próximo mes'] },
    ],
    metricas: { label: 'Ingresos del mes', valor: '—', link: '/pagos' },
    accionRapida: { label: 'Generar cobro', href: '/pagos' },
  },
  {
    id: '10-rrhh',
    nombre: 'RRHH Digital',
    director: 'Director de RRHH',
    icono: Settings,
    color: 'orange',
    estado: 'pendiente',
    agentes: ['Agent Creator', 'Agent Trainer', 'Documentador'],
    flujos: [
      { id: 'nuevo-agente', label: 'Crear nuevo agente IA', pasos: ['Definir rol + objetivos', 'Escribir system prompt', 'Testear con casos reales', 'Deploy + documentar'] },
      { id: 'mejorar-agente', label: 'Mejorar agente existente', pasos: ['Revisar logs de errores', 'Identificar prompt débil', 'Iterar prompt', 'A/B test'] },
    ],
    metricas: { label: 'Agentes operativos', valor: '6', link: '/agents' },
    accionRapida: { label: 'Oficina de Agentes', href: '/agents' },
  },
  {
    id: '11-innovacion',
    nombre: 'Actualización & Innovación',
    director: 'Director de Innovación',
    icono: RefreshCw,
    color: 'teal',
    estado: 'pendiente',
    agentes: ['Tech Researcher', 'System Updater', 'Innovador'],
    flujos: [
      { id: 'tech-research', label: 'Research semanal de IA', pasos: ['Revisar releases Anthropic/Google/OpenAI', 'Evaluar nuevos modelos', 'Proponer actualizaciones', 'Implementar lo relevante'] },
      { id: 'nuevo-servicio', label: 'Lanzar nuevo servicio', pasos: ['Detectar oportunidad de mercado', 'MVP en 48hs', 'Testear con 1 cliente beta', 'Lanzar al catálogo'] },
    ],
    metricas: { label: 'Stack actualizado', valor: 'Next 14', link: '/agents' },
    accionRapida: { label: 'Ver agentes', href: '/agents' },
  },
]

const COLOR_MAP: Record<string, { bg: string; border: string; text: string; badge: string; btn: string }> = {
  indigo: { bg: 'bg-indigo-950/30', border: 'border-indigo-800/40', text: 'text-indigo-400', badge: 'bg-indigo-900/40 text-indigo-300', btn: 'bg-indigo-600 hover:bg-indigo-500' },
  violet: { bg: 'bg-violet-950/30', border: 'border-violet-800/40', text: 'text-violet-400', badge: 'bg-violet-900/40 text-violet-300', btn: 'bg-violet-600 hover:bg-violet-500' },
  red:    { bg: 'bg-red-950/20',    border: 'border-red-800/30',    text: 'text-red-400',    badge: 'bg-red-900/40 text-red-300',    btn: 'bg-red-700 hover:bg-red-600' },
  amber:  { bg: 'bg-amber-950/20',  border: 'border-amber-800/30',  text: 'text-amber-400',  badge: 'bg-amber-900/40 text-amber-300',  btn: 'bg-amber-600 hover:bg-amber-500' },
  emerald:{ bg: 'bg-emerald-950/20',border: 'border-emerald-800/30',text: 'text-emerald-400',badge: 'bg-emerald-900/40 text-emerald-300',btn: 'bg-emerald-600 hover:bg-emerald-500' },
  pink:   { bg: 'bg-pink-950/20',   border: 'border-pink-800/30',   text: 'text-pink-400',   badge: 'bg-pink-900/40 text-pink-300',   btn: 'bg-pink-600 hover:bg-pink-500' },
  slate:  { bg: 'bg-slate-800/30',  border: 'border-slate-700/40',  text: 'text-slate-400',  badge: 'bg-slate-700/40 text-slate-300',  btn: 'bg-slate-600 hover:bg-slate-500' },
  cyan:   { bg: 'bg-cyan-950/20',   border: 'border-cyan-800/30',   text: 'text-cyan-400',   badge: 'bg-cyan-900/40 text-cyan-300',   btn: 'bg-cyan-700 hover:bg-cyan-600' },
  green:  { bg: 'bg-green-950/20',  border: 'border-green-800/30',  text: 'text-green-400',  badge: 'bg-green-900/40 text-green-300',  btn: 'bg-green-700 hover:bg-green-600' },
  orange: { bg: 'bg-orange-950/20', border: 'border-orange-800/30', text: 'text-orange-400', badge: 'bg-orange-900/40 text-orange-300', btn: 'bg-orange-600 hover:bg-orange-500' },
  teal:   { bg: 'bg-teal-950/20',   border: 'border-teal-800/30',   text: 'text-teal-400',   badge: 'bg-teal-900/40 text-teal-300',   btn: 'bg-teal-700 hover:bg-teal-600' },
}

export default function OrquestacionPage() {
  const [expandido, setExpandido] = useState<string | null>(null)
  const [filtro, setFiltro] = useState<'todos' | 'activo' | 'pendiente'>('todos')

  const filtrados = departamentos.filter(d => filtro === 'todos' || d.estado === filtro)
  const activos = departamentos.filter(d => d.estado === 'activo').length

  return (
    <div className="min-h-screen bg-gray-950 text-white pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
              <Zap size={18} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-white">Orquestación DIVINIA</h1>
              <p className="text-gray-500 text-sm">11 departamentos — control central de la empresa</p>
            </div>
          </div>

          {/* Stats rápidas */}
          <div className="flex items-center gap-6 mt-4 ml-12">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span className="text-sm text-gray-400">{activos} activos</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-gray-600"></span>
              <span className="text-sm text-gray-400">{departamentos.length - activos} por activar</span>
            </div>
            <Link href="/agents" className="flex items-center gap-1.5 text-sm text-indigo-400 hover:text-indigo-300 transition-colors">
              <Cpu size={13} />
              Ir al orquestador IA
              <ChevronRight size={13} />
            </Link>
          </div>
        </div>

        {/* Filtros */}
        <div className="flex gap-2 mb-6">
          {(['todos', 'activo', 'pendiente'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFiltro(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                filtro === f
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:text-white'
              }`}
            >
              {f === 'todos' ? 'Todos' : f === 'activo' ? 'Activos' : 'Por activar'}
            </button>
          ))}
        </div>

        {/* Grid de departamentos */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtrados.map(dept => {
            const c = COLOR_MAP[dept.color]
            const Icon = dept.icono
            const isExpanded = expandido === dept.id

            return (
              <div key={dept.id} className={`border rounded-xl overflow-hidden ${c.bg} ${c.border}`}>
                {/* Header del card */}
                <div className="p-4">
                  <div className="flex items-start gap-3 mb-3">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${c.btn}`}>
                      <Icon size={16} className="text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-white text-sm truncate">{dept.nombre}</h3>
                        <span className={`shrink-0 text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                          dept.estado === 'activo'
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : 'bg-gray-700/60 text-gray-500'
                        }`}>
                          {dept.estado === 'activo' ? 'Activo' : 'Pendiente'}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 truncate">{dept.director}</p>
                    </div>
                  </div>

                  {/* Agentes */}
                  <div className="flex flex-wrap gap-1 mb-3">
                    {dept.agentes.slice(0, 3).map(a => (
                      <span key={a} className={`text-[10px] px-1.5 py-0.5 rounded ${c.badge}`}>{a}</span>
                    ))}
                    {dept.agentes.length > 3 && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-800 text-gray-500">+{dept.agentes.length - 3}</span>
                    )}
                  </div>

                  {/* Métrica */}
                  <div className="flex items-center justify-between mb-3">
                    <Link href={dept.metricas.link} className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-300 transition-colors">
                      <BarChart3 size={11} />
                      {dept.metricas.label}: <span className={`font-bold ${c.text}`}>{dept.metricas.valor}</span>
                    </Link>
                  </div>

                  {/* Acciones */}
                  <div className="flex gap-2">
                    <Link
                      href={dept.accionRapida.href}
                      className={`flex-1 flex items-center justify-center gap-1.5 text-xs font-medium text-white py-1.5 rounded-lg transition-colors ${c.btn}`}
                    >
                      <Play size={11} />
                      {dept.accionRapida.label}
                    </Link>
                    <button
                      onClick={() => setExpandido(isExpanded ? null : dept.id)}
                      className="flex items-center gap-1 text-xs text-gray-500 hover:text-white bg-gray-800 hover:bg-gray-700 px-2.5 py-1.5 rounded-lg transition-colors"
                    >
                      <FileText size={11} />
                      Flujos
                    </button>
                  </div>
                </div>

                {/* Flujos expandidos */}
                {isExpanded && (
                  <div className="border-t border-gray-800/60 px-4 pb-4 pt-3 space-y-3">
                    <p className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">Flujos de trabajo</p>
                    {dept.flujos.map(flujo => (
                      <div key={flujo.id} className="bg-gray-900/60 rounded-lg p-3">
                        <p className="text-xs font-medium text-white mb-2">{flujo.label}</p>
                        <div className="flex items-center gap-1 flex-wrap">
                          {flujo.pasos.map((paso, i) => (
                            <div key={i} className="flex items-center gap-1">
                              <span className="text-[9px] bg-gray-800 text-gray-400 px-1.5 py-0.5 rounded">{paso}</span>
                              {i < flujo.pasos.length - 1 && (
                                <ChevronRight size={9} className="text-gray-600 shrink-0" />
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Footer — links rápidos globales */}
        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'Buscar leads', href: '/leads', icon: Users, desc: 'Apify + Google Maps' },
            { label: 'Pipeline ventas', href: '/crm', icon: TrendingUp, desc: 'Nuevo → Cerrado' },
            { label: 'Instagram', href: '/redes', icon: Instagram, desc: '@autom_atia' },
            { label: 'Orquestador IA', href: '/agents', icon: MessageSquare, desc: 'Chat con el CEO IA' },
          ].map(item => {
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                className="bg-gray-900 border border-gray-800 hover:border-gray-600 rounded-xl p-4 flex items-center gap-3 transition-all group"
              >
                <div className="w-8 h-8 bg-gray-800 group-hover:bg-indigo-900/40 rounded-lg flex items-center justify-center shrink-0 transition-colors">
                  <Icon size={15} className="text-gray-400 group-hover:text-indigo-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white">{item.label}</p>
                  <p className="text-xs text-gray-500">{item.desc}</p>
                </div>
                <ChevronRight size={14} className="text-gray-600 group-hover:text-gray-400 ml-auto transition-colors" />
              </Link>
            )
          })}
        </div>

      </div>
    </div>
  )
}
