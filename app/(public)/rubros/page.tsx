import Link from 'next/link'
import { ArrowRight, ArrowLeft } from 'lucide-react'


const RUBROS = [
  {
    emoji: '✂️',
    name: 'Peluquería / Barbería',
    desc: 'Cortes, coloración, keratina',
    color: '#ec4899',
    slug: 'peluqueria',
    demo: 'rufina-nails-demo',
  },
  {
    emoji: '💅',
    name: 'Nail Bar / Manicura',
    desc: 'Uñas, semipermanente, gel',
    color: '#d63384',
    slug: 'nails',
    demo: 'rufina-nails-demo',
  },
  {
    emoji: '💆',
    name: 'Estética / Spa',
    desc: 'Faciales, masajes, depilación',
    color: '#9333ea',
    slug: 'estetica',
    demo: 'rufina-nails-demo',
  },
  {
    emoji: '💪',
    name: 'Gimnasio / Fitness',
    desc: 'Clases, entrenamiento personal',
    color: '#f59e0b',
    slug: 'gimnasio',
    demo: 'rufina-nails-demo',
  },
  {
    emoji: '🦷',
    name: 'Odontología',
    desc: 'Consultas, limpiezas, tratamientos',
    color: '#0284c7',
    slug: 'odontologia',
    demo: 'fa-faby-demo',
  },
  {
    emoji: '🏥',
    name: 'Clínica / Médico',
    desc: 'Consultas, especialidades, análisis',
    color: '#16a34a',
    slug: 'clinica',
    demo: 'fa-faby-demo',
  },
  {
    emoji: '🐾',
    name: 'Veterinaria',
    desc: 'Consultas, vacunas, grooming',
    color: '#65a30d',
    slug: 'veterinaria',
    demo: 'fa-faby-demo',
  },
  {
    emoji: '🧘',
    name: 'Yoga / Pilates',
    desc: 'Clases individuales y grupales',
    color: '#6366f1',
    slug: 'yoga',
    demo: 'rufina-nails-demo',
  },
  {
    emoji: '📊',
    name: 'Contador / Abogado',
    desc: 'Consultas, asesoramiento, trámites',
    color: '#7c3aed',
    slug: 'contabilidad',
    demo: 'fa-faby-demo',
  },
  {
    emoji: '🏨',
    name: 'Hotel / Apart Hotel',
    desc: 'Check-in, servicios, spa',
    color: '#92400e',
    slug: 'hotel',
    demo: 'cantera-boutique-hotel-demo',
  },
  {
    emoji: '🌴',
    name: 'Complejo / Cabañas',
    desc: 'Reservas, actividades, pileta',
    color: '#0284c7',
    slug: 'complejo',
    demo: 'complejo-paraisos-demo',
  },
  {
    emoji: '🏔️',
    name: 'Hostería / Turismo',
    desc: 'Alojamiento, excursiones, aventura',
    color: '#16a34a',
    slug: 'aventura',
    demo: 'hosteria-mininco-demo',
  },
  {
    emoji: '🏊',
    name: 'Piscinas / Mantenimiento',
    desc: 'Limpieza, reparación, equipos',
    color: '#1d4ed8',
    slug: 'mantenimiento',
    demo: 'top-quality-demo',
  },
  {
    emoji: '🔧',
    name: 'Taller Mecánico',
    desc: 'Revisiones, reparaciones, service',
    color: '#374151',
    slug: 'taller',
    demo: 'fa-faby-demo',
  },
  {
    emoji: '🎨',
    name: 'Tatuajes / Piercing',
    desc: 'Consultas, sesiones, diseños',
    color: '#dc2626',
    slug: 'tatuajes',
    demo: 'rufina-nails-demo',
  },
  {
    emoji: '📸',
    name: 'Fotógrafo / Videógrafo',
    desc: 'Sesiones, bodas, eventos',
    color: '#0891b2',
    slug: 'fotografia',
    demo: 'fa-faby-demo',
  },
  {
    emoji: '🎭',
    name: 'Psicólogo / Terapeuta',
    desc: 'Sesiones, talleres, consultas',
    color: '#7c3aed',
    slug: 'psicologia',
    demo: 'fa-faby-demo',
  },
  {
    emoji: '🦴',
    name: 'Kinesiología / Fisio',
    desc: 'Rehabilitación, masajes terapéuticos',
    color: '#059669',
    slug: 'kinesiologia',
    demo: 'fa-faby-demo',
  },
  {
    emoji: '🍽️',
    name: 'Restaurante / Catering',
    desc: 'Reservas de mesa, eventos privados',
    color: '#b45309',
    slug: 'restaurante',
    demo: 'complejo-paraisos-demo',
  },
  {
    emoji: '🚀',
    name: 'Agencia / Consultoría',
    desc: 'Reuniones, propuestas, onboarding',
    color: '#4f46e5',
    slug: 'agencia',
    demo: 'fa-faby-demo',
  },
]

const WA = 'https://wa.me/5492665286110?text=Hola%2C%20quiero%20Turnero%20para%20mi%20negocio'

export default function RubrosPage() {
  return (
    <div className="min-h-screen bg-white">

      {/* Nav mínimo */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-gray-500 hover:text-gray-900 text-sm font-medium transition-colors">
            <ArrowLeft size={16} /> Volver al inicio
          </Link>
          <a
            href={WA}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold px-4 py-2 rounded-lg transition-colors"
          >
            Quiero mi Turnero — desde $43.000/mes
          </a>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 pt-28 pb-24">

        {/* Header */}
        <div className="text-center mb-16">
          <span className="inline-block bg-indigo-50 text-indigo-700 border border-indigo-100 px-5 py-2 rounded-full text-sm font-semibold mb-6">
            🇦🇷 Sistema de turnos para PYMEs argentinas
          </span>
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-gray-900 leading-[1.05] tracking-tight mb-6">
            ¿Cuál es<br />
            <span className="text-indigo-600">tu rubro?</span>
          </h1>
          <p className="text-xl text-gray-500 max-w-xl mx-auto leading-relaxed">
            Tocá tu rubro y veé exactamente cómo quedaría tu sistema de turnos.
            Demo real, sin registrarte.
          </p>
        </div>

        {/* Grid de rubros */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mb-20">
          {RUBROS.map(rubro => (
            <a
              key={rubro.slug}
              href={`/demo/${rubro.demo}`}
              className="group relative bg-white border-2 border-gray-100 hover:border-indigo-300 rounded-2xl p-5 flex flex-col items-center text-center gap-3 transition-all hover:shadow-lg hover:-translate-y-0.5"
            >
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl transition-all group-hover:scale-110"
                style={{ backgroundColor: `${rubro.color}15` }}
              >
                {rubro.emoji}
              </div>
              <div>
                <p className="font-bold text-gray-900 text-sm leading-tight mb-1">{rubro.name}</p>
                <p className="text-xs text-gray-400 leading-tight">{rubro.desc}</p>
              </div>
              <span className="absolute bottom-3 right-3 text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity">
                <ArrowRight size={14} />
              </span>
            </a>
          ))}
        </div>

        {/* CTA final */}
        <div className="bg-indigo-600 rounded-3xl px-8 py-12 text-center">
          <p className="text-indigo-300 text-sm font-bold uppercase tracking-wider mb-4">¿No encontrás tu rubro?</p>
          <h2 className="text-3xl sm:text-4xl font-black text-white mb-4">
            Funciona para cualquier negocio con agenda
          </h2>
          <p className="text-indigo-200 mb-8 max-w-md mx-auto">
            Contanos qué tipo de negocio tenés y te mostramos cómo quedaría.
            Setup en 24hs.
          </p>
          <a
            href={WA}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-white text-indigo-700 hover:bg-indigo-50 font-black px-8 py-4 rounded-2xl text-base transition-all shadow-xl"
          >
            Hablemos por WhatsApp <ArrowRight size={18} />
          </a>
          <p className="text-indigo-300/60 text-sm mt-4">
            $43.000/mes · o $100.000 pago único · Setup en 24hs
          </p>
        </div>

      </div>
    </div>
  )
}
