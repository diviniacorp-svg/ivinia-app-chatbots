'use client'
import { useState } from 'react'
import Link from 'next/link'
import Orb from '@/components/public/Orb'

const WA = 'https://wa.me/5492665286110?text=Hola%2C%20quiero%20el%20Turnero%20para%20mi%20negocio'
const DEMO_ID = 'rufina-nails-demo'

interface Rubro {
  emoji: string
  nombre: string
  desc: string
  color: string
  slug: string
  wa: string
}

const CATEGORIAS: { id: string; label: string; emoji: string; rubros: Rubro[] }[] = [
  {
    id: 'belleza',
    label: 'Belleza & Cuidado',
    emoji: '💅',
    rubros: [
      { emoji: '💈', nombre: 'Barbería', desc: 'Cortes, afeitado, barba', color: '#DC5028', slug: 'barberia', wa: 'Hola%2C%20tengo%20una%20barber%C3%ADa%20y%20quiero%20el%20Turnero' },
      { emoji: '✂️', nombre: 'Peluquería', desc: 'Cortes, coloración, keratina', color: '#B464FF', slug: 'peluqueria', wa: 'Hola%2C%20tengo%20una%20peluquer%C3%ADa%20y%20quiero%20el%20Turnero' },
      { emoji: '💅', nombre: 'Nail Bar', desc: 'Uñas, semipermanente, gel, acrílico', color: '#FF50A0', slug: 'nails', wa: 'Hola%2C%20tengo%20un%20nail%20bar%20y%20quiero%20el%20Turnero' },
      { emoji: '✨', nombre: 'Estética', desc: 'Faciales, depilación, tratamientos', color: '#FF50A0', slug: 'estetica', wa: 'Hola%2C%20tengo%20un%20centro%20de%20est%C3%A9tica%20y%20quiero%20el%20Turnero' },
      { emoji: '🌸', nombre: 'Spa & Wellness', desc: 'Masajes, aromaterapia, relajación', color: '#50C878', slug: 'spa', wa: 'Hola%2C%20tengo%20un%20spa%20y%20quiero%20el%20Turnero' },
      { emoji: '💆', nombre: 'Masajes', desc: 'Terapéuticos, deportivos, relajantes', color: '#50C878', slug: 'masajes', wa: 'Hola%2C%20doy%20masajes%20y%20quiero%20el%20Turnero' },
      { emoji: '🌟', nombre: 'Depilación Láser', desc: 'Láser, luz pulsada, definitiva', color: '#FFB0D0', slug: 'depilacion', wa: 'Hola%2C%20tengo%20un%20centro%20de%20depilaci%C3%B3n%20y%20quiero%20el%20Turnero' },
      { emoji: '☀️', nombre: 'Bronceado / Solarium', desc: 'Camas solares, autobronceante', color: '#FFB400', slug: 'bronceado', wa: 'Hola%2C%20tengo%20un%20solarium%20y%20quiero%20el%20Turnero' },
      { emoji: '💄', nombre: 'Maquillaje', desc: 'Maquillaje artístico, novias, eventos', color: '#FF3060', slug: 'maquillaje', wa: 'Hola%2C%20soy%20maquilladora%20y%20quiero%20el%20Turnero' },
      { emoji: '🎨', nombre: 'Tatuajes & Piercing', desc: 'Sesiones, consultas, diseños', color: '#DC2828', slug: 'tatuajes', wa: 'Hola%2C%20tengo%20un%20estudio%20de%20tatuajes%20y%20quiero%20el%20Turnero' },
    ],
  },
  {
    id: 'salud',
    label: 'Salud',
    emoji: '🏥',
    rubros: [
      { emoji: '🩺', nombre: 'Médico / Clínica', desc: 'Consultas, especialidades médicas', color: '#0090FF', slug: 'clinica', wa: 'Hola%2C%20tengo%20una%20cl%C3%ADnica%20y%20quiero%20el%20Turnero' },
      { emoji: '🦷', nombre: 'Odontología', desc: 'Consultas, limpiezas, ortodoncia', color: '#50B4FF', slug: 'odontologia', wa: 'Hola%2C%20tengo%20un%20consultorio%20odontol%C3%B3gico%20y%20quiero%20el%20Turnero' },
      { emoji: '🧠', nombre: 'Psicología / Terapia', desc: 'Sesiones individuales y grupales', color: '#9650FF', slug: 'psicologia', wa: 'Hola%2C%20soy%20psic%C3%B3logo%20y%20quiero%20el%20Turnero' },
      { emoji: '🦴', nombre: 'Kinesiología / Fisio', desc: 'Rehabilitación, masajes terapéuticos', color: '#00C878', slug: 'kinesiologia', wa: 'Hola%2C%20soy%20kinesiol%C3%B3go%20y%20quiero%20el%20Turnero' },
      { emoji: '🥗', nombre: 'Nutricionista', desc: 'Planes alimentarios, seguimiento', color: '#64DC3C', slug: 'nutricionista', wa: 'Hola%2C%20soy%20nutricionista%20y%20quiero%20el%20Turnero' },
      { emoji: '👁️', nombre: 'Oftalmología', desc: 'Consultas, lentes de contacto', color: '#3CA0FF', slug: 'oftalmologia', wa: 'Hola%2C%20tengo%20un%20consultorio%20de%20oftalmolog%C3%ADa%20y%20quiero%20el%20Turnero' },
      { emoji: '🦶', nombre: 'Podología', desc: 'Tratamientos de pies, uñas encarnadas', color: '#28C864', slug: 'podologia', wa: 'Hola%2C%20soy%20podolog%C3%B3logo%20y%20quiero%20el%20Turnero' },
      { emoji: '🗣️', nombre: 'Fonoaudiología', desc: 'Sesiones de lenguaje y voz', color: '#0090FF', slug: 'fonoaudiologia', wa: 'Hola%2C%20soy%20fonoaudi%C3%B3logo%20y%20quiero%20el%20Turnero' },
    ],
  },
  {
    id: 'mascotas',
    label: 'Mascotas',
    emoji: '🐾',
    rubros: [
      { emoji: '🐾', nombre: 'Veterinaria', desc: 'Consultas, vacunas, cirugías', color: '#6464FF', slug: 'veterinaria', wa: 'Hola%2C%20tengo%20una%20veterinaria%20y%20quiero%20el%20Turnero' },
      { emoji: '🐶', nombre: 'Peluquería Canina', desc: 'Baño, corte, deslanado, spa canino', color: '#8CC83C', slug: 'peluqueriacanina', wa: 'Hola%2C%20tengo%20una%20peluquer%C3%ADa%20canina%20y%20quiero%20el%20Turnero' },
      { emoji: '🏠', nombre: 'Hotel de Mascotas', desc: 'Guardería, hospedaje, paseos', color: '#7864FF', slug: 'hotelmascotas', wa: 'Hola%2C%20tengo%20un%20hotel%20de%20mascotas%20y%20quiero%20el%20Turnero' },
      { emoji: '🦮', nombre: 'Adiestramiento Canino', desc: 'Entrenamiento, obediencia, socialización', color: '#78C83C', slug: 'adiestramiento', wa: 'Hola%2C%20soy%20adiestrador%20canino%20y%20quiero%20el%20Turnero' },
    ],
  },
  {
    id: 'fitness',
    label: 'Fitness & Deporte',
    emoji: '💪',
    rubros: [
      { emoji: '🏋️', nombre: 'Gimnasio', desc: 'Musculación, cardio, clases grupales', color: '#DCC800', slug: 'gimnasio', wa: 'Hola%2C%20tengo%20un%20gimnasio%20y%20quiero%20el%20Turnero' },
      { emoji: '🧘', nombre: 'Yoga & Pilates', desc: 'Clases individuales y grupales', color: '#8C64FF', slug: 'yoga', wa: 'Hola%2C%20doy%20clases%20de%20yoga%20y%20quiero%20el%20Turnero' },
      { emoji: '🏃', nombre: 'Personal Trainer', desc: 'Entrenamiento personalizado', color: '#FFB400', slug: 'personaltrainer', wa: 'Hola%2C%20soy%20personal%20trainer%20y%20quiero%20el%20Turnero' },
      { emoji: '🔥', nombre: 'CrossFit', desc: 'Clases funcionales, WODs, box', color: '#FF5000', slug: 'crossfit', wa: 'Hola%2C%20tengo%20un%20box%20de%20crossfit%20y%20quiero%20el%20Turnero' },
      { emoji: '🏊', nombre: 'Natación', desc: 'Clases para adultos y niños', color: '#00B4FF', slug: 'natacion', wa: 'Hola%2C%20doy%20clases%20de%20nataci%C3%B3n%20y%20quiero%20el%20Turnero' },
      { emoji: '🎾', nombre: 'Padel / Tenis', desc: 'Reserva de canchas y clases', color: '#50DC00', slug: 'padel', wa: 'Hola%2C%20tengo%20canchas%20de%20padel%20y%20quiero%20el%20Turnero' },
      { emoji: '🥋', nombre: 'Artes Marciales', desc: 'Judo, karate, BJJ, MMA, box', color: '#C83C00', slug: 'artesmarciales', wa: 'Hola%2C%20doy%20clases%20de%20artes%20marciales%20y%20quiero%20el%20Turnero' },
      { emoji: '💃', nombre: 'Escuela de Danza', desc: 'Tango, salsa, contemporáneo, urban', color: '#FF50B4', slug: 'danza', wa: 'Hola%2C%20tengo%20una%20escuela%20de%20danza%20y%20quiero%20el%20Turnero' },
    ],
  },
  {
    id: 'automotriz',
    label: 'Automotriz',
    emoji: '🚗',
    rubros: [
      { emoji: '🔧', nombre: 'Taller Mecánico', desc: 'Service, reparaciones, diagnóstico', color: '#B48C3C', slug: 'taller', wa: 'Hola%2C%20tengo%20un%20taller%20mec%C3%A1nico%20y%20quiero%20el%20Turnero' },
      { emoji: '🚗', nombre: 'Lavado de Autos', desc: 'Express, completo, interior, detailing', color: '#00A0FF', slug: 'lavadoautos', wa: 'Hola%2C%20tengo%20un%20lavadero%20de%20autos%20y%20quiero%20el%20Turnero' },
      { emoji: '🛞', nombre: 'Gomería', desc: 'Cambio, balanceo, neumáticos', color: '#A08C50', slug: 'gomeria', wa: 'Hola%2C%20tengo%20una%20gomer%C3%ADa%20y%20quiero%20el%20Turnero' },
      { emoji: '✨', nombre: 'Detailing / Car Wash', desc: 'Pulido, encerado, nano cerámica', color: '#DCB400', slug: 'detailing', wa: 'Hola%2C%20tengo%20un%20negocio%20de%20detailing%20y%20quiero%20el%20Turnero' },
    ],
  },
  {
    id: 'educacion',
    label: 'Educación',
    emoji: '📚',
    rubros: [
      { emoji: '📚', nombre: 'Clases Particulares', desc: 'Matemáticas, física, materias exactas', color: '#3C8CFF', slug: 'clases', wa: 'Hola%2C%20doy%20clases%20particulares%20y%20quiero%20el%20Turnero' },
      { emoji: '🌍', nombre: 'Academia de Idiomas', desc: 'Inglés, portugués, francés, alemán', color: '#28A0FF', slug: 'idiomas', wa: 'Hola%2C%20tengo%20una%20academia%20de%20idiomas%20y%20quiero%20el%20Turnero' },
      { emoji: '🎵', nombre: 'Escuela de Música', desc: 'Guitarra, piano, canto, batería', color: '#C864FF', slug: 'musica', wa: 'Hola%2C%20doy%20clases%20de%20m%C3%BAsica%20y%20quiero%20el%20Turnero' },
      { emoji: '🚘', nombre: 'Auto Escuela', desc: 'Clases de manejo y renovación de carnet', color: '#3CC850', slug: 'autoescuela', wa: 'Hola%2C%20tengo%20una%20auto%20escuela%20y%20quiero%20el%20Turnero' },
    ],
  },
  {
    id: 'alojamiento',
    label: 'Alojamiento & Turismo',
    emoji: '🏨',
    rubros: [
      { emoji: '🏨', nombre: 'Hotel / Apart Hotel', desc: 'Habitaciones, spa, servicios', color: '#DCB43C', slug: 'hotel', wa: 'Hola%2C%20tengo%20un%20hotel%20y%20quiero%20el%20Turnero' },
      { emoji: '🌿', nombre: 'Hostería / B&B', desc: 'Alojamiento boutique, desayuno incluido', color: '#50C850', slug: 'hosteria', wa: 'Hola%2C%20tengo%20una%20hoster%C3%ADa%20y%20quiero%20el%20Turnero' },
      { emoji: '🏕️', nombre: 'Cabañas / Complejo', desc: 'Reservas de cabañas y parcelas', color: '#64C850', slug: 'cabanas', wa: 'Hola%2C%20tengo%20un%20complejo%20de%20caba%C3%B1as%20y%20quiero%20el%20Turnero' },
      { emoji: '⛺', nombre: 'Camping', desc: 'Parcelas, carpas, motorhome', color: '#50B43C', slug: 'camping', wa: 'Hola%2C%20tengo%20un%20camping%20y%20quiero%20el%20Turnero' },
      { emoji: '🗺️', nombre: 'Turismo / Excursiones', desc: 'Tours, guías, aventura', color: '#3CB4FF', slug: 'turismo', wa: 'Hola%2C%20tengo%20una%20agencia%20de%20turismo%20y%20quiero%20el%20Turnero' },
      { emoji: '🚴', nombre: 'Alquiler de Vehículos', desc: 'Bicicletas, kayaks, cuatriciclos, autos', color: '#3CC878', slug: 'alquilervehiculos', wa: 'Hola%2C%20tengo%20un%20servicio%20de%20alquiler%20y%20quiero%20el%20Turnero' },
    ],
  },
  {
    id: 'profesionales',
    label: 'Profesionales',
    emoji: '💼',
    rubros: [
      { emoji: '⚖️', nombre: 'Estudio Jurídico', desc: 'Consultas, asesoramiento legal', color: '#B4A064', slug: 'abogado', wa: 'Hola%2C%20soy%20abogado%20y%20quiero%20el%20Turnero' },
      { emoji: '📊', nombre: 'Contador / Impositivo', desc: 'Monotributo, AFIP, asesoramiento', color: '#00C878', slug: 'contabilidad', wa: 'Hola%2C%20soy%20contador%20y%20quiero%20el%20Turnero' },
      { emoji: '🏗️', nombre: 'Arquitectura & Diseño', desc: 'Consultas, proyectos, renders', color: '#6478FF', slug: 'arquitectura', wa: 'Hola%2C%20soy%20arquitecto%20y%20quiero%20el%20Turnero' },
      { emoji: '📋', nombre: 'Escribanía', desc: 'Certificaciones, escrituras, trámites', color: '#A09664', slug: 'escribano', wa: 'Hola%2C%20tengo%20una%20escriban%C3%ADa%20y%20quiero%20el%20Turnero' },
      { emoji: '🚀', nombre: 'Consultoría', desc: 'Reuniones, diagnóstico, asesoramiento', color: '#7850FF', slug: 'consultoria', wa: 'Hola%2C%20soy%20consultor%20y%20quiero%20el%20Turnero' },
    ],
  },
  {
    id: 'entretenimiento',
    label: 'Entretenimiento & Eventos',
    emoji: '🎉',
    rubros: [
      { emoji: '📸', nombre: 'Fotografía & Video', desc: 'Sesiones, bodas, productos, eventos', color: '#B4B4B4', slug: 'fotografia', wa: 'Hola%2C%20soy%20fot%C3%B3grafo%20y%20quiero%20el%20Turnero' },
      { emoji: '🎉', nombre: 'Salón de Fiestas', desc: 'Cumpleaños, casamientos, corporativos', color: '#FF64C8', slug: 'salon', wa: 'Hola%2C%20tengo%20un%20sal%C3%B3n%20de%20fiestas%20y%20quiero%20el%20Turnero' },
      { emoji: '🔐', nombre: 'Escape Room', desc: 'Reservas por sala y horario', color: '#C83C00', slug: 'escaperoom', wa: 'Hola%2C%20tengo%20un%20escape%20room%20y%20quiero%20el%20Turnero' },
      { emoji: '🏎️', nombre: 'Karting', desc: 'Tandas, cumpleaños, campeonatos', color: '#FF5000', slug: 'karting', wa: 'Hola%2C%20tengo%20un%20kartódromo%20y%20quiero%20el%20Turnero' },
    ],
  },
  {
    id: 'gastronomia',
    label: 'Gastronomía',
    emoji: '🍽️',
    rubros: [
      { emoji: '🍴', nombre: 'Restaurante', desc: 'Reservas de mesa, eventos privados', color: '#FF8C00', slug: 'restaurante', wa: 'Hola%2C%20tengo%20un%20restaurante%20y%20quiero%20el%20Turnero' },
      { emoji: '🥘', nombre: 'Catering & Eventos', desc: 'Cotizaciones, degustaciones, eventos', color: '#FFA028', slug: 'catering', wa: 'Hola%2C%20tengo%20un%20servicio%20de%20catering%20y%20quiero%20el%20Turnero' },
    ],
  },
]

export default function RubrosPage() {
  const [categoriaActiva, setCategoriaActiva] = useState('belleza')

  const categoria = CATEGORIAS.find(c => c.id === categoriaActiva) || CATEGORIAS[0]
  const totalRubros = CATEGORIAS.reduce((sum, c) => sum + c.rubros.length, 0)

  return (
    <div style={{ minHeight: '100vh', background: 'var(--paper)', color: 'var(--ink)' }}>

      {/* Nav */}
      <div style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
        backdropFilter: 'blur(20px)',
        background: 'rgba(246,245,242,0.92)',
        borderBottom: '1px solid var(--line)',
      }}>
        <div className="wrap-v2" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 0' }}>
          <Link href="/" style={{
            display: 'flex', alignItems: 'center', gap: 8,
            textDecoration: 'none', color: 'var(--muted-2)',
            fontFamily: 'var(--f-display)', fontSize: 14,
          }}>
            ← Inicio
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{
              fontFamily: 'var(--f-mono)', fontSize: 10,
              letterSpacing: '0.08em', textTransform: 'uppercase',
              color: 'var(--muted)', display: 'none',
            }}>
              {totalRubros} rubros disponibles
            </span>
            <a
              href={WA}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                background: 'var(--ink)', color: 'var(--paper)',
                borderRadius: 10, padding: '9px 18px',
                fontFamily: 'var(--f-mono)', fontWeight: 700,
                fontSize: 11, letterSpacing: '0.08em',
                textTransform: 'uppercase', textDecoration: 'none',
              }}
            >
              Quiero mi Turnero →
            </a>
          </div>
        </div>
      </div>

      <div className="wrap-v2" style={{ paddingTop: 100, paddingBottom: 80 }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 60, position: 'relative' }}>
          <div style={{ position: 'absolute', top: -60, left: '50%', transform: 'translateX(-50%)', zIndex: 0, pointerEvents: 'none' }}>
            <Orb size={400} color="#C6FF3D" colorDeep="#8AAA1A" shade="rgba(0,30,0,0.5)" float squash style={{ opacity: 0.15 }} />
          </div>
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: 'rgba(198,255,61,0.1)', border: '1px solid rgba(198,255,61,0.25)',
              borderRadius: 100, padding: '6px 18px', marginBottom: 24,
            }}>
              <span style={{ fontFamily: 'var(--f-mono)', fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--ink)' }}>
                🇦🇷 {totalRubros} rubros · turneros para PYMEs argentinas
              </span>
            </div>
            <h1 className="h-display" style={{ fontSize: 'clamp(44px, 7vw, 96px)', marginBottom: 20 }}>
              ¿Cuál es<br />
              <em>tu negocio?</em>
            </h1>
            <p style={{
              fontFamily: 'var(--f-display)', fontSize: 18,
              color: 'var(--muted-2)', maxWidth: '44ch', margin: '0 auto',
              lineHeight: 1.55,
            }}>
              Elegí tu rubro y te mostramos exactamente cómo queda tu sistema de turnos.
              Demo real, sin registrarte.
            </p>
          </div>
        </div>

        {/* Tabs de categoría */}
        <div style={{
          display: 'flex', gap: 8, flexWrap: 'wrap',
          justifyContent: 'center', marginBottom: 48,
        }}>
          {CATEGORIAS.map(cat => (
            <button
              key={cat.id}
              onClick={() => setCategoriaActiva(cat.id)}
              style={{
                padding: '8px 16px', borderRadius: 100,
                border: categoriaActiva === cat.id ? '1.5px solid var(--ink)' : '1.5px solid var(--line)',
                background: categoriaActiva === cat.id ? 'var(--ink)' : 'transparent',
                color: categoriaActiva === cat.id ? 'var(--paper)' : 'var(--muted-2)',
                fontFamily: 'var(--f-display)', fontSize: 13, fontWeight: 500,
                cursor: 'pointer', transition: 'all 0.18s ease',
                display: 'flex', alignItems: 'center', gap: 6,
              }}
            >
              <span>{cat.emoji}</span>
              <span>{cat.label}</span>
              <span style={{
                background: categoriaActiva === cat.id ? 'rgba(246,245,242,0.15)' : 'var(--line)',
                borderRadius: 100, padding: '1px 7px',
                fontFamily: 'var(--f-mono)', fontSize: 9,
                color: categoriaActiva === cat.id ? 'rgba(246,245,242,0.6)' : 'var(--muted)',
              }}>
                {cat.rubros.length}
              </span>
            </button>
          ))}
        </div>

        {/* Grid de rubros de la categoría activa */}
        <div
          key={categoriaActiva}
          style={{
            display: 'grid', gap: 12,
            marginBottom: 48,
            animation: 'fadeInGrid 0.3s ease',
          }}
          className="grid-cols-2-mobile-1 md:grid-cols-4 lg:grid-cols-5"
        >
          {categoria.rubros.map((rubro) => (
            <div key={rubro.slug} style={{ position: 'relative' }}>
              {/* Demo link (primary action) */}
              <Link
                href={`/reservas/${DEMO_ID}`}
                style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center',
                  textAlign: 'center', gap: 10,
                  background: 'var(--paper-2)', border: '1.5px solid var(--line)',
                  borderRadius: 16, padding: '24px 16px',
                  textDecoration: 'none', cursor: 'pointer',
                  transition: 'all 0.18s ease',
                  position: 'relative', overflow: 'hidden',
                }}
                className="rubro-card"
              >
                {/* Color accent top line */}
                <div style={{
                  position: 'absolute', top: 0, left: 0, right: 0, height: 2,
                  background: rubro.color,
                  borderRadius: '16px 16px 0 0',
                }} />

                {/* Emoji icon */}
                <div style={{
                  width: 52, height: 52, borderRadius: 14,
                  background: rubro.color + '15',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 26, transition: 'transform 0.18s ease',
                }}>
                  {rubro.emoji}
                </div>

                <div>
                  <div style={{
                    fontFamily: 'var(--f-display)', fontWeight: 700,
                    fontSize: 14, color: 'var(--ink)', letterSpacing: '-0.01em',
                    marginBottom: 3, lineHeight: 1.2,
                  }}>
                    {rubro.nombre}
                  </div>
                  <div style={{
                    fontFamily: 'var(--f-display)', fontSize: 11,
                    color: 'var(--muted)', lineHeight: 1.3,
                  }}>
                    {rubro.desc}
                  </div>
                </div>

                <div style={{
                  fontFamily: 'var(--f-mono)', fontSize: 9,
                  letterSpacing: '0.1em', textTransform: 'uppercase',
                  color: rubro.color, marginTop: 2,
                }}>
                  Ver demo →
                </div>
              </Link>

              {/* WA button (secondary, on hover) */}
              <a
                href={`https://wa.me/5492665286110?text=${rubro.wa}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  position: 'absolute', bottom: 8, right: 8,
                  background: '#25D366', color: '#fff',
                  borderRadius: 8, padding: '4px 8px',
                  fontFamily: 'var(--f-mono)', fontSize: 8,
                  letterSpacing: '0.08em', textTransform: 'uppercase',
                  textDecoration: 'none', opacity: 0,
                  transition: 'opacity 0.18s ease',
                  zIndex: 2,
                }}
                className="rubro-wa-btn"
              >
                WA →
              </a>
            </div>
          ))}
        </div>

        {/* Precio y CTA debajo del grid */}
        <div style={{
          display: 'grid', gap: 12,
          marginBottom: 48,
        }}
          className="grid-cols-2-mobile-1 md:grid-cols-[2fr_1fr]"
        >
          {/* Info de precio */}
          <div style={{
            background: 'var(--paper-2)', border: '1px solid var(--line)',
            borderRadius: 20, padding: '32px',
            display: 'flex', alignItems: 'center', gap: 32, flexWrap: 'wrap',
          }}>
            {[
              { val: '$45.000', label: '/mes', desc: 'Sin permanencia mínima' },
              { val: '$35.000', label: '/mes', desc: 'Plan anual · 2 meses gratis' },
              { val: '$120.000', label: 'único', desc: 'Pagás una vez, el sistema es tuyo' },
            ].map(p => (
              <div key={p.val} style={{ flex: '1 1 140px' }}>
                <div style={{
                  fontFamily: 'var(--f-display)', fontStyle: 'italic',
                  fontWeight: 700, fontSize: 28, color: 'var(--ink)',
                  letterSpacing: '-0.04em', lineHeight: 1,
                }}>
                  {p.val}
                  <span style={{ fontSize: 14, fontStyle: 'normal', color: 'var(--muted)', marginLeft: 2 }}>
                    {p.label}
                  </span>
                </div>
                <div style={{
                  fontFamily: 'var(--f-display)', fontSize: 12,
                  color: 'var(--muted-2)', marginTop: 2,
                }}>
                  {p.desc}
                </div>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div style={{
            background: 'var(--ink)', borderRadius: 20, padding: '32px',
            display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 16,
          }}>
            <div>
              <div style={{
                fontFamily: 'var(--f-display)', fontStyle: 'italic',
                fontWeight: 700, fontSize: 20, color: 'var(--paper)',
                letterSpacing: '-0.02em', lineHeight: 1.2, marginBottom: 8,
              }}>
                Setup en 24hs.<br />Garantía 90 días.
              </div>
              <div style={{
                fontFamily: 'var(--f-display)', fontSize: 12,
                color: 'rgba(246,245,242,0.4)', lineHeight: 1.55,
              }}>
                No encontrás tu rubro? Cualquier negocio con agenda funciona.
              </div>
            </div>
            <a
              href={WA}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'block', textAlign: 'center',
                padding: '13px 20px', borderRadius: 10,
                background: 'var(--lime)', color: 'var(--ink)',
                textDecoration: 'none', fontFamily: 'var(--f-mono)',
                fontWeight: 700, fontSize: 11, letterSpacing: '0.08em',
                textTransform: 'uppercase',
              }}
            >
              Escribinos →
            </a>
          </div>
        </div>

        {/* Todos los rubros — vista compacta */}
        <div style={{ borderTop: '1px solid var(--line)', paddingTop: 48 }}>
          <div style={{ marginBottom: 28 }}>
            <div className="eyebrow" style={{ marginBottom: 8 }}>Todos los rubros</div>
            <p style={{
              fontFamily: 'var(--f-display)', fontSize: 15,
              color: 'var(--muted-2)', maxWidth: '48ch', lineHeight: 1.5,
            }}>
              Lista completa de negocios con los que trabajamos. Si el tuyo no está, igual podemos armarlo.
            </p>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {CATEGORIAS.flatMap(c => c.rubros).map(r => (
              <Link
                key={r.slug}
                href={`/reservas/${DEMO_ID}`}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  padding: '7px 14px', borderRadius: 100,
                  border: '1px solid var(--line)',
                  background: 'var(--paper-2)',
                  textDecoration: 'none',
                  fontFamily: 'var(--f-display)', fontSize: 13,
                  color: 'var(--muted-2)', transition: 'all 0.15s ease',
                }}
              >
                <span>{r.emoji}</span>
                <span>{r.nombre}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeInGrid {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .rubro-card:hover {
          border-color: var(--ink) !important;
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(14,14,14,0.08);
        }
        .rubro-card:hover .rubro-wa-btn,
        .rubro-card + .rubro-wa-btn {
          opacity: 1 !important;
        }
        @media (hover: hover) {
          div:hover > a.rubro-wa-btn { opacity: 1 !important; }
        }
      `}</style>
    </div>
  )
}
