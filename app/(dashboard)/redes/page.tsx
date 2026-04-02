'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Instagram,
  CalendarDays,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
  MessageCircle,
  Info,
  ExternalLink,
  TrendingUp,
  Users,
  Clock,
  Send,
} from 'lucide-react'

// ─── Tipos ───────────────────────────────────────────────────────────────────

type PostStatus = 'PUBLICADO' | 'PROGRAMADO' | 'BORRADOR'
type PostType = 'POST' | 'STORY' | 'REEL'

interface Post {
  id: number
  dia: string
  fecha: string
  hora: string
  tipo: PostType
  titulo: string
  status: PostStatus
  caption: string
}

interface DmTemplate {
  rubro: string
  emoji: string
  template: string
}

interface DmRow {
  negocio: string
  rubro: string
  estado: string
  fecha: string
  notas: string
}

// ─── Datos hardcodeados ───────────────────────────────────────────────────────

const posts: Post[] = [
  {
    id: 1,
    dia: 'Lunes',
    fecha: '31 Marzo',
    hora: '20:00 ART',
    tipo: 'POST',
    titulo: '¿Cómo tomás turnos hoy?',
    status: 'PUBLICADO',
    caption: `Una pregunta rápida para los dueños de negocio que me leen 👇

¿Cómo tomás turnos hoy?

A) Por WhatsApp (y a veces se te olvida)
B) Por llamada (y no siempre podés atender)
C) En papel o agenda (clásico)
D) Ya tengo sistema online (capo/a 🙌)

Si respondiste A, B o C… este perfil es para vos. [...]`,
  },
  {
    id: 2,
    dia: 'Martes',
    fecha: '1 Abril',
    hora: '20:00 ART',
    tipo: 'POST',
    titulo: 'Esta semana perdiste 3 a 8 turnos',
    status: 'PROGRAMADO',
    caption: `¿Cuántos turnos perdiste hoy?

No es una pregunta retórica. Es matemática.

Cada vez que un cliente llama y no atendés → turno perdido.
Cada vez que un mensaje de WhatsApp queda sin respuesta → turno perdido.
Cada vez que alguien quiere reservar a las 11 de la noche y no puede → turno perdido. [...]`,
  },
  {
    id: 3,
    dia: 'Miércoles',
    fecha: '2 Abril',
    hora: '12:00 ART',
    tipo: 'POST',
    titulo: 'Antes vs Después de Turnero',
    status: 'PROGRAMADO',
    caption: `Antes vs Después de tener Turnero. Y así se ven los dos lados 👇

ANTES:
→ Teléfono que suena en el peor momento
→ WhatsApp sin responder a las 11 de la noche
→ Clientes que "ya llaman" y nunca llaman

DESPUÉS:
→ Tus clientes reservan solos desde el celular
→ Confirmación y recordatorio automático por WhatsApp [...]`,
  },
  {
    id: 4,
    dia: 'Jueves',
    fecha: '3 Abril',
    hora: '20:00 ART',
    tipo: 'POST',
    titulo: '3 pasos para tener turnos online',
    status: 'PROGRAMADO',
    caption: `¿Cómo funciona Turnero? En 3 pasos 👇

PASO 1 — Tu cliente entra al link
Compartís un link único de tu negocio por WhatsApp, redes o el cartel de tu local. Tu cliente lo abre desde el celular.

PASO 2 — Elige día, hora y servicio
Ve tu disponibilidad en tiempo real. Elige lo que necesita. Completa nombre y teléfono. Listo — reservado. [...]`,
  },
  {
    id: 5,
    dia: 'Viernes',
    fecha: '4 Abril',
    hora: '18:00 ART',
    tipo: 'POST',
    titulo: 'Pago único $80.000 ARS',
    status: 'PROGRAMADO',
    caption: `Sí, leyeron bien. Pago único 👇

Mientras todos cobran mensualidades, nosotros ofrecemos esto:

✓ Plan Básico: $80.000 ARS — pago único
✓ Plan Pro: $150.000 ARS — pago único
✓ Plan Enterprise: $200.000 ARS — pago único

Los primeros 5 en escribirme esta semana tienen descuento de lanzamiento.

DM abierto 👇 [...]`,
  },
]

const dmTemplates: DmTemplate[] = [
  {
    rubro: 'Peluquería / Estética',
    emoji: '✂️',
    template: `Hola [nombre]! Vi tu peluquería en Instagram y me gustó mucho el trabajo 🙌

Te escribo porque armé Turnero, un sistema de turnos online para negocios como el tuyo.

La mayoría de las peluquerías pierden entre 3 y 8 turnos por semana porque el teléfono no llega o los mensajes de WhatsApp se acumulan. Turnero resuelve eso: tus clientes reservan solos, vos recibís la notificación.

Pago único $80.000 ARS. Lo configuro yo en 48hs.

¿Tenés 5 minutos para contarme cómo manejás los turnos hoy? 👇`,
  },
  {
    rubro: 'Clínica / Consultorio',
    emoji: '🏥',
    template: `Hola [nombre]! Vi tu consultorio en Instagram y quería contarte algo que puede ayudarte.

Soy Joaco, de San Luis, y armé Turnero: un sistema donde tus pacientes reservan turno online a cualquier hora, sin que vos tengas que atender el teléfono.

Especialmente útil para consultorios: los pacientes eligen día, hora y especialidad. Vos recibís la notificación. El sistema manda recordatorio automático 24hs antes para reducir inasistencias.

Pago único $80.000 ARS. Sin mensualidades.

¿Cuántos turnos manejan por semana? 👇`,
  },
  {
    rubro: 'Veterinaria',
    emoji: '🐾',
    template: `Hola [nombre]! Vi la veterinaria en Instagram, muy buena presencia tienen 👏

Te escribo porque creé Turnero, un sistema de turnos online pensado para negocios como el tuyo.

Sé que en veterinarias la agenda se complica: urgencias, turnos programados, baños, grooming... Turnero centraliza todo: los dueños de mascotas reservan desde el celular, vos ves todo en un panel.

Pago único $80.000 ARS. Lo dejo funcionando en 48hs, sin que tengas que tocar nada técnico.

¿Querés que te cuente cómo quedaría para tu veterinaria específicamente? 👇`,
  },
  {
    rubro: 'Taller',
    emoji: '🔧',
    template: `Hola [nombre]! Vi el taller en Instagram.

Te cuento: armé Turnero, un sistema de turnos online para talleres mecánicos y de servicios.

El problema que resuelve: los clientes llaman cuando estás abajo del auto, o mandan mensajes que se acumulan. Con Turnero, ellos reservan el servicio online (cambio de aceite, revisión, etc.), eligen horario, y vos recibís el aviso. Sin interrupciones.

Pago único $80.000 ARS. Setup en 48hs, yo me encargo de todo.

¿Cuántos ingresos por día manejan en el taller? 👇`,
  },
]

const dmRows: DmRow[] = [
  {
    negocio: 'Rufina Estética',
    rubro: 'Estética',
    estado: 'CLIENTE ACTIVO',
    fecha: '28 Mar',
    notas: 'Plan Base activo. Pago recibido.',
  },
]

const promptRespuestaComentarios = `Sos el community manager de @autom_atia, la cuenta de Instagram de Turnero, un sistema de turnos online para negocios argentinos.

Cuando alguien comenta en alguno de los posts, respondé con estas reglas:

1. Siempre respondé en menos de 30 minutos del comentario (es lo que pide el algoritmo)
2. Usá su nombre si está disponible en el perfil (@usuario)
3. Si dicen su rubro → Personalizá la respuesta mencionando ese rubro específico
4. Si hacen una pregunta → Respondela brevemente y terminá con una pregunta para continuar la conversación
5. Si se quejan o dudan → Validá la queja y explicá cómo Turnero la resuelve
6. Si ya son clientes potenciales → Invitalos a mandarte un DM para hablar

Tono: cercano, argentino, sin ser forzado. Nada de "Hola! Espero que estés bien" genérico.

Comentario a responder: [PEGAR COMENTARIO ACÁ]

Generá 2 opciones de respuesta (una más corta, una más completa) y decime cuál recomendás según el contexto.`

// ─── Componentes pequeños ─────────────────────────────────────────────────────

function StatusBadge({ status }: { status: PostStatus }) {
  const styles: Record<PostStatus, string> = {
    PUBLICADO: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
    PROGRAMADO: 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30',
    BORRADOR: 'bg-gray-500/20 text-gray-400 border border-gray-500/30',
  }
  return (
    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${styles[status]}`}>
      {status}
    </span>
  )
}

function TypeBadge({ tipo }: { tipo: PostType }) {
  const styles: Record<PostType, string> = {
    POST: 'bg-blue-500/20 text-blue-400',
    STORY: 'bg-pink-500/20 text-pink-400',
    REEL: 'bg-orange-500/20 text-orange-400',
  }
  return (
    <span className={`text-xs font-semibold px-2 py-0.5 rounded ${styles[tipo]}`}>
      {tipo}
    </span>
  )
}

function DmEstadoBadge({ estado }: { estado: string }) {
  if (estado === 'CLIENTE ACTIVO')
    return <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">{estado}</span>
  if (estado === 'CONTACTADO')
    return <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">{estado}</span>
  return <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-gray-500/20 text-gray-400 border border-gray-500/30">{estado}</span>
}

function CopyButton({ text, label = 'Copiar' }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button
      onClick={handleCopy}
      className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all ${
        copied
          ? 'bg-emerald-500/20 text-emerald-400'
          : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
      }`}
    >
      {copied ? <Check size={13} /> : <Copy size={13} />}
      {copied ? 'Copiado' : label}
    </button>
  )
}

// ─── Página principal ─────────────────────────────────────────────────────────

export default function RedesSocialesPage() {
  const [expandedPost, setExpandedPost] = useState<number | null>(null)
  const [activeTab, setActiveTab] = useState(0)

  const toggleCaption = (id: number) => {
    setExpandedPost(expandedPost === id ? null : id)
  }

  return (
    <div className="space-y-8 pb-12">

      {/* ── Header con stats ────────────────────────────────────────────────── */}
      <div>
        <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-9 h-9 bg-gradient-to-br from-pink-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Instagram size={18} className="text-white" />
              </div>
              <div>
                <h1 className="text-xl font-black text-white">Redes Sociales</h1>
                <p className="text-gray-400 text-xs">Instagram @autom_atia</p>
              </div>
            </div>
          </div>
          <span className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-yellow-500/15 text-yellow-400 border border-yellow-500/30">
            <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
            Configurando perfil
          </span>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Seguidores', value: '0', icon: Users, color: 'text-pink-400', bg: 'bg-pink-500/10' },
            { label: 'Posts publicados', value: '0', icon: TrendingUp, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
            { label: 'Programados', value: '5', icon: Clock, color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
            { label: 'Semana actual', value: '1', icon: CalendarDays, color: 'text-purple-400', bg: 'bg-purple-500/10' },
          ].map((s) => (
            <div key={s.label} className="bg-gray-800 border border-gray-700 rounded-xl p-4 flex items-center gap-3">
              <div className={`w-9 h-9 ${s.bg} rounded-lg flex items-center justify-center shrink-0`}>
                <s.icon size={16} className={s.color} />
              </div>
              <div>
                <p className="text-lg font-black text-white">{s.value}</p>
                <p className="text-xs text-gray-500">{s.label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Calendario semana 1 ─────────────────────────────────────────────── */}
      <div className="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-700 flex items-center gap-2">
          <CalendarDays size={16} className="text-indigo-400" />
          <h2 className="font-bold text-white text-sm">Calendario de publicaciones — Semana 1</h2>
        </div>

        <div className="divide-y divide-gray-700/60">
          {posts.map((post) => (
            <div key={post.id} className="px-5 py-4">
              {/* Fila principal */}
              <div className="flex flex-wrap items-center gap-3">
                {/* Día + hora */}
                <div className="w-32 shrink-0">
                  <p className="text-sm font-semibold text-white">{post.dia} {post.fecha}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{post.hora}</p>
                </div>

                {/* Badges */}
                <div className="flex items-center gap-2 shrink-0">
                  <TypeBadge tipo={post.tipo} />
                  <StatusBadge status={post.status} />
                </div>

                {/* Título */}
                <p className="flex-1 text-sm text-gray-200 font-medium min-w-0">
                  {post.titulo}
                </p>

                {/* Botón ver caption */}
                <button
                  onClick={() => toggleCaption(post.id)}
                  className="flex items-center gap-1 text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors shrink-0"
                >
                  {expandedPost === post.id ? (
                    <><ChevronUp size={14} /> Cerrar</>
                  ) : (
                    <><ChevronDown size={14} /> Ver caption</>
                  )}
                </button>
              </div>

              {/* Caption expandido */}
              {expandedPost === post.id && (
                <div className="mt-3 ml-0 sm:ml-36">
                  <div className="bg-gray-900/60 border border-gray-700 rounded-lg p-4 relative">
                    <pre className="text-xs text-gray-300 whitespace-pre-wrap font-sans leading-relaxed">
                      {post.caption}
                    </pre>
                    <div className="mt-3 flex justify-end">
                      <CopyButton text={post.caption} label="Copiar caption" />
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ── Cómo publicar ───────────────────────────────────────────────────── */}
      <div className="bg-gray-800 border border-gray-700 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Info size={16} className="text-indigo-400" />
          <h2 className="font-bold text-white text-sm">¿Cómo publicar estos posts?</h2>
        </div>

        <div className="space-y-3 mb-5">
          {[
            { n: 1, text: 'Abrí Instagram en Chrome (instagram.com)' },
            { n: 2, text: 'Activá la extensión Claude desde el ícono de la barra del navegador' },
            { n: 3, text: 'Copiá el prompt de la sección de Fábrica de Contenidos → Prompts Chrome' },
            { n: 4, text: 'Pegalo en Claude Chrome y seguí las instrucciones paso a paso' },
          ].map((step) => (
            <div key={step.n} className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center shrink-0 mt-0.5">
                <span className="text-xs font-bold text-white">{step.n}</span>
              </div>
              <p className="text-sm text-gray-300">{step.text}</p>
            </div>
          ))}
        </div>

        <Link
          href="/contenido"
          className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm px-5 py-2.5 rounded-xl transition-colors"
        >
          <ExternalLink size={15} />
          Ir a Fábrica de Contenidos → Prompts Chrome
        </Link>
      </div>

      {/* ── DMs de Prospección ──────────────────────────────────────────────── */}
      <div className="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-700">
          <div className="flex items-center gap-2 mb-1">
            <MessageCircle size={16} className="text-emerald-400" />
            <h2 className="font-bold text-white text-sm">DMs para cerrar ventas esta semana</h2>
          </div>
          <p className="text-xs text-gray-400">Meta: 3 cierres antes del viernes</p>
        </div>

        {/* Tabs de rubros */}
        <div className="flex overflow-x-auto border-b border-gray-700">
          {dmTemplates.map((dm, i) => (
            <button
              key={i}
              onClick={() => setActiveTab(i)}
              className={`flex items-center gap-1.5 px-4 py-3 text-xs font-semibold whitespace-nowrap transition-colors border-b-2 ${
                activeTab === i
                  ? 'border-indigo-500 text-indigo-400 bg-indigo-500/10'
                  : 'border-transparent text-gray-400 hover:text-gray-200'
              }`}
            >
              <span>{dm.emoji}</span>
              {dm.rubro}
            </button>
          ))}
        </div>

        {/* Template activo */}
        <div className="p-5">
          <div className="bg-gray-900/60 border border-gray-700 rounded-lg p-4">
            <pre className="text-xs text-gray-300 whitespace-pre-wrap font-sans leading-relaxed">
              {dmTemplates[activeTab].template}
            </pre>
          </div>
          <div className="mt-3 flex justify-end">
            <CopyButton text={dmTemplates[activeTab].template} label="Copiar DM" />
          </div>
        </div>

        {/* Tracker de DMs */}
        <div className="px-5 pb-5">
          <div className="flex items-center gap-2 mb-3">
            <Send size={14} className="text-gray-500" />
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Tracker de DMs enviados</p>
          </div>
          <div className="border border-gray-700 rounded-lg overflow-hidden">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-gray-900/50 text-gray-500 uppercase tracking-wider">
                  <th className="text-left px-4 py-2.5 font-semibold">Negocio</th>
                  <th className="text-left px-4 py-2.5 font-semibold">Rubro</th>
                  <th className="text-left px-4 py-2.5 font-semibold">Estado</th>
                  <th className="text-left px-4 py-2.5 font-semibold hidden sm:table-cell">Fecha</th>
                  <th className="text-left px-4 py-2.5 font-semibold hidden md:table-cell">Notas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700/60">
                {dmRows.map((row, i) => (
                  <tr key={i} className="text-gray-300">
                    <td className="px-4 py-3 font-medium">{row.negocio}</td>
                    <td className="px-4 py-3 text-gray-400">{row.rubro}</td>
                    <td className="px-4 py-3">
                      <DmEstadoBadge estado={row.estado} />
                    </td>
                    <td className="px-4 py-3 text-gray-400 hidden sm:table-cell">{row.fecha}</td>
                    <td className="px-4 py-3 text-gray-500 hidden md:table-cell">{row.notas}</td>
                  </tr>
                ))}
                {/* Filas vacías para llenar */}
                {Array.from({ length: 4 }).map((_, i) => (
                  <tr key={`empty-${i}`} className="text-gray-700">
                    <td className="px-4 py-3">—</td>
                    <td className="px-4 py-3">—</td>
                    <td className="px-4 py-3">—</td>
                    <td className="px-4 py-3 hidden sm:table-cell">—</td>
                    <td className="px-4 py-3 hidden md:table-cell">—</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-gray-600 mt-2">Actualizá este tracker a medida que enviás DMs.</p>
        </div>
      </div>

      {/* ── Responder comentarios ────────────────────────────────────────────── */}
      <div className="bg-gray-800 border border-gray-700 rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <MessageCircle size={16} className="text-purple-400" />
            <h2 className="font-bold text-white text-sm">Responder comentarios</h2>
          </div>
          <CopyButton text={promptRespuestaComentarios} label="Copiar prompt" />
        </div>

        <p className="text-xs text-gray-400 mb-3">
          Pegá este prompt en la extensión Claude de Chrome cuando quieras responder comentarios. Reemplazá el texto al final con el comentario real.
        </p>

        <div className="bg-gray-900/60 border border-gray-700 rounded-lg p-4">
          <pre className="text-xs text-gray-300 whitespace-pre-wrap font-sans leading-relaxed">
            {promptRespuestaComentarios}
          </pre>
        </div>

        <div className="mt-4 flex items-start gap-2 bg-purple-500/10 border border-purple-500/20 rounded-lg px-4 py-3">
          <Info size={14} className="text-purple-400 shrink-0 mt-0.5" />
          <p className="text-xs text-purple-300">
            Respondé TODOS los comentarios en los primeros 30 minutos post-publicación. El algoritmo de Instagram premia la actividad temprana en el post.
          </p>
        </div>
      </div>

    </div>
  )
}
