'use client'

import { useState } from 'react'
import {
  Calendar, Film, Image, Clock, CheckCircle2, Circle,
  ExternalLink, Copy, Check, Play, Package, Palette,
  Clapperboard, FileText, ChevronDown, ChevronUp, Video
} from 'lucide-react'

// ─── Datos Semana 1 ──────────────────────────────────────────────────────────

const calendarioSemana1 = [
  {
    dia: 'Lun',
    fecha: '31 Mar',
    items: [
      { tipo: 'post', hora: '20:00', titulo: 'Post 01 — Bienvenida / Hook', status: 'publicado' },
    ],
  },
  {
    dia: 'Mar',
    fecha: '1 Abr',
    items: [
      { tipo: 'story', hora: '12:00', titulo: 'Story — Encuesta turnos', status: 'programado' },
      { tipo: 'post', hora: '20:00', titulo: 'Post 02 — Dolor (3-8 turnos)', status: 'programado' },
    ],
  },
  {
    dia: 'Mié',
    fecha: '2 Abr',
    items: [
      { tipo: 'post', hora: '12:00', titulo: 'Post 03 — Antes vs Después', status: 'programado' },
      { tipo: 'story', hora: '18:00', titulo: 'Story — Slider antes/después', status: 'borrador' },
    ],
  },
  {
    dia: 'Jue',
    fecha: '3 Abr',
    items: [
      { tipo: 'post', hora: '20:00', titulo: 'Post 04 — Cómo funciona (3 pasos)', status: 'programado' },
    ],
  },
  {
    dia: 'Vie',
    fecha: '4 Abr',
    items: [
      { tipo: 'post', hora: '18:00', titulo: 'Post 05 — CTA Oferta ($80k)', status: 'programado' },
      { tipo: 'reel', hora: '20:00', titulo: 'Reel 01 — Hook animado (pendiente)', status: 'borrador' },
    ],
  },
  {
    dia: 'Sáb',
    fecha: '5 Abr',
    items: [
      { tipo: 'reel', hora: '11:00', titulo: 'Reel 02 — Joaco en cámara', status: 'borrador' },
    ],
  },
  {
    dia: 'Dom',
    fecha: '6 Abr',
    items: [],
  },
]

// ─── Composiciones Remotion ───────────────────────────────────────────────────

const composicionesRemotion = [
  { id: 'HookReel', frames: 370, desc: 'Reel gancho animado con texto', requiere: null },
  { id: 'StatsReel', frames: 510, desc: 'Stats animadas en pantalla', requiere: null },
  { id: 'BeforeAfterReel', frames: 464, desc: 'Antes vs Después split', requiere: null },
  { id: 'TextAnim-Dolor', frames: 300, desc: 'Texto animado — mensaje dolor', requiere: null },
  { id: 'TextAnim-Stats', frames: 300, desc: 'Texto animado — estadísticas', requiere: null },
  { id: 'TextAnim-Urgencia', frames: 300, desc: 'Texto animado — urgencia CTA', requiere: null },
  { id: 'Nano-Turnero-Hook', frames: 450, desc: 'Hook con fondo 3D Nanobanana', requiere: 'turnero-fondo-9x16.mp4' },
  { id: 'Nano-Turnero-CTA', frames: 300, desc: 'CTA con fondo 3D Nanobanana', requiere: 'turnero-fondo-9x16.mp4' },
  { id: 'Demo-Peluqueria', frames: 360, desc: 'Demo producto — peluquería', requiere: null },
  { id: 'Demo-Clinica', frames: 360, desc: 'Demo producto — clínica', requiere: null },
  { id: 'Demo-Veterinaria', frames: 360, desc: 'Demo producto — veterinaria', requiere: null },
  { id: 'Demo-Taller', frames: 360, desc: 'Demo producto — taller mecánico', requiere: null },
]

// ─── Prompt Chrome Extension ─────────────────────────────────────────────────

const CHROME_PROMPT = `# MEGA PROMPT — Setup completo Instagram @autom_atia
## Para pegar en la extensión Claude de Chrome

---

## INSTRUCCIONES PARA CLAUDE CHROME

Tenés que hacer TODO esto en orden, paso a paso, en Instagram.com.
No te saltes ningún paso. Confirmame cuando cada uno esté listo.

---

## PASO 1 — PERFIL: Foto, Bio y Link

Ve a instagram.com/@autom_atia → Editar perfil y configurá esto:

**Nombre de usuario**: autom_atia (verificar que esté activo)

**Nombre**: Turnero by DIVINIA

**Bio** (copiá exacto — son 150 caracteres):
\`\`\`
📅 Turnos online para tu negocio
Sin llamadas. Sin olvidos. 24hs.
🏙️ San Luis, Argentina
👇 Probá 14 días gratis
\`\`\`

**Link en bio**: https://divinia.vercel.app/trial

**Categoría**: Software (o Producto/Servicio si no aparece)

**Botón de contacto → WhatsApp**: +54 9 266 4000000

---

## PASO 2 — FOTO DE PERFIL

Subí una foto de perfil con estas características (si tenés el logo de Turnero listo, usalo. Si no, usá estas instrucciones para elegir cuál sube):

El logo que buscás es: letras "Turnero" en tipografía Ubuntu Bold, color indigo #4f46e5, sobre fondo blanco o fondo circular blanco. Debe verse legible en 40x40px.

Si no tenés el logo final todavía, subí temporalmente cualquier imagen con las letras "T" en círculo indigo y cambiala cuando elijas el logo de la carpeta de Canva.

---

## PASO 3 — HIGHLIGHTS (Historias fijas en el perfil)

Creá estos 4 Highlights vacíos (los iremos llenando con stories):

1. **"¿Qué es?"** — cover: ícono de calendario en indigo
2. **"Cómo funciona"** — cover: ícono de teléfono con check
3. **"Precios"** — cover: ícono de precio/tag
4. **"Casos reales"** — cover: ícono de estrella

Por ahora creá los highlights con stories temporales (una imagen de texto plano). Los cubrimos con diseños después.

---

## PASO 4 — POST 01 (Publicar AHORA)

Cargá una imagen y publicá este post:

**Imagen**: Fondo blanco, texto centrado grande en color indigo #4f46e5 que diga:
"¿Cómo tomás turnos hoy?"
Abajo más pequeño en gris: "A) WhatsApp B) Llamada C) Papel D) Sistema online"
Esquina inferior derecha: una pelota circular lavanda (#c4b5fd) decorativa, grande, semi-recortada.
Logo "Turnero" pequeño arriba a la izquierda en indigo.

Caption:
\`\`\`
Una pregunta rápida para los dueños de negocio que me leen 👇

¿Cómo tomás turnos hoy?

A) Por WhatsApp (y a veces se te olvida)
B) Por llamada (y no siempre podés atender)
C) En papel o agenda (clásico)
D) Ya tengo sistema online (capo/a 🙌)

Si respondiste A, B o C… este perfil es para vos.

Me llamo Joaco, soy de San Luis, y armé Turnero para resolver exactamente ese problema. Un sistema simple donde tus clientes reservan solos, vos recibís la notificación y listo.

Sin complicaciones. Sin pagar un sueldo extra.

En esta cuenta voy a mostrar cómo funciona, casos reales, y cómo la IA puede hacer el trabajo tedioso por vos.

Seguime y escribime por DM si querés saber más 🙌

#turneroonline #sistemadeterminos #sanluisargentina #pymesargentinas #peluqueria #clinica #veterinaria #automatizacion #divinia #emprendedoresargentinos
\`\`\`

**Horario**: Publicar ahora si es entre 9-11hs o 18-21hs ART. Si no, programar para las 20:00 de hoy.

---

## PASO 5 — POST 02 (Programar para mañana Martes 20:00)

Caption:
\`\`\`
¿Cuántos turnos perdiste hoy?

No es una pregunta retórica. Es matemática.

Cada vez que un cliente llama y no atendés → turno perdido.
Cada vez que un mensaje de WhatsApp queda sin respuesta → turno perdido.
Cada vez que alguien quiere reservar a las 11 de la noche y no puede → turno perdido (y se lo llevó la competencia).

Nuestros clientes perdían entre 3 y 8 turnos por semana antes de Turnero. En una peluquería que cobra $8.000 por corte, eso son hasta $64.000 por semana que se iban a la nada.

¿La solución? Que tus clientes puedan reservar solos, a cualquier hora, sin que vos estés presente.

Eso es exactamente lo que hace Turnero.

¿Cuántos turnos calculás que perdés vos por semana? 👇

#turneroonline #turnosdigitales #peluqueria #clinica #veterinaria #sanluisargentina #pymesargentinas #sistematurnos #automatizacion
\`\`\`

**Programar**: Martes, 20:00 ART

---

## PASO 6 — POST 03 (Programar Miércoles 12:00)

Caption:
\`\`\`
Antes vs Después de tener Turnero. Y así se ven los dos lados 👇

ANTES:
→ Teléfono que suena en el peor momento
→ WhatsApp sin responder a las 11 de la noche
→ Clientes que "ya llaman" y nunca llaman
→ Agenda en papel con turnos dobles

DESPUÉS:
→ Tus clientes reservan solos desde el celular
→ Confirmación y recordatorio automático por WhatsApp
→ Panel donde ves todos los turnos del día
→ Tu negocio trabaja mientras dormís

¿Cuánto tiempo perdés por semana atendiendo el teléfono para turnos?

Si son más de 2hs, Turnero se paga solo en el primer mes.

Escribime por DM y te cuento cómo funciona para tu rubro 👇

#turneroonline #antesdespues #sistematurnos #peluqueria #clinica #veterinaria #sanluisargentina #automatizacion #pymesargentinas
\`\`\`

**Programar**: Miércoles, 12:00 ART

---

## PASO 7 — POST 04 (Programar Jueves 20:00)

Caption:
\`\`\`
¿Cómo funciona Turnero? En 3 pasos 👇

PASO 1 — Tu cliente entra al link
Compartís un link único de tu negocio por WhatsApp, redes o el cartel de tu local. Tu cliente lo abre desde el celular.

PASO 2 — Elige día, hora y servicio
Ve tu disponibilidad en tiempo real. Elige lo que necesita. Completa nombre y teléfono. Listo — reservado.

PASO 3 — Vos recibís la notificación
Te llega un aviso por WhatsApp con los datos del turno. Sin llamadas. Sin mensajes de "¿tenés lugar el jueves?".

Y a las 24hs del turno, el sistema le manda un recordatorio automático al cliente para que no falte.

Setup en 48hs. Sin código. Sin instalaciones.

¿Querés ver cómo quedaría para tu negocio específicamente? Escribime por DM 🙌

#turneroonline #sistematurnos #comofunciona #peluqueria #clinica #veterinaria #sanluisargentina #automatizacion #pymesargentinas #divinia
\`\`\`

**Programar**: Jueves, 20:00 ART

---

## PASO 8 — POST 05 (Programar Viernes 18:00)

Caption:
\`\`\`
Sí, leyeron bien. Pago único 👇

Mientras todos cobran mensualidades, nosotros ofrecemos esto:

✓ Plan Básico: $80.000 ARS — pago único
✓ Plan Pro: $150.000 ARS — pago único
✓ Plan Enterprise: $200.000 ARS — pago único

¿Qué incluye?
→ Tu sistema de turnos online personalizado para tu rubro
→ Link para compartir con tus clientes
→ Panel de gestión para vos
→ Recordatorios automáticos por WhatsApp
→ Setup completo en 48hs
→ 3 meses de soporte incluido

Sin mensualidades. Sin letra chica. Sin sorpresas.

Somos de San Luis, Argentina. Conocemos los negocios de acá y no queremos que pagués un abono eterno por algo que simplemente tiene que funcionar.

Los primeros 5 en escribirme esta semana tienen descuento de lanzamiento.

DM abierto 👇

#turneroonline #preciojusto #sistematurnos #sanluisargentina #pymesargentinas #peluqueria #clinica #veterinaria #automatizacion #divinia #emprendedoresargentinos
\`\`\`

**Programar**: Viernes, 18:00 ART

---

## PASO 9 — SEGUIR A ESTOS TIPOS DE CUENTAS

Buscá y seguí 20 cuentas de:
- Peluquerías y barberías de San Luis, Argentina
- Clínicas y consultorios de San Luis
- Veterinarias de San Luis
- Negocios locales de San Luis con Instagram activo
- 5 cuentas de tecnología/IA para PYMES en Argentina

---

## PASO 10 — CONFIRMAR COMPLETADO

Cuando termines todos los pasos, confirmame:
- ✓ Perfil configurado (foto, bio, link)
- ✓ 4 Highlights creados
- ✓ Post 01 publicado
- ✓ Posts 02-05 programados (martes a viernes)
- ✓ 20 cuentas seguidas

Decime si algo no te dejó hacer.`

// ─── Helpers ─────────────────────────────────────────────────────────────────

const tipoIcono: Record<string, React.ReactNode> = {
  post: <Image size={12} />,
  story: <Film size={12} />,
  reel: <Clapperboard size={12} />,
}

const tipoColor: Record<string, string> = {
  post: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
  story: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
  reel: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
}

const statusBadge: Record<string, string> = {
  publicado: 'bg-green-500/20 text-green-400 border border-green-500/30',
  programado: 'bg-blue-500/20 text-blue-400 border border-blue-500/30',
  borrador: 'bg-gray-600/40 text-gray-400 border border-gray-600/40',
}

const statusLabel: Record<string, string> = {
  publicado: 'Publicado',
  programado: 'Programado',
  borrador: 'Borrador',
}

// ─── Componente principal ─────────────────────────────────────────────────────

export default function ContenidoPage() {
  const [copied, setCopied] = useState(false)
  const [promptExpanded, setPromptExpanded] = useState(false)
  const [renderInfo, setRenderInfo] = useState<string | null>(null)

  function copyPrompt() {
    navigator.clipboard.writeText(CHROME_PROMPT)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function showRender(id: string, frames: number, requiere: string | null) {
    const msg = requiere
      ? `npx remotion render ${id} out/${id}.mp4\n\nRequiere: /public/nanobanana/${requiere}`
      : `npx remotion render ${id} out/${id}.mp4`
    setRenderInfo(renderInfo === id ? null : msg)
    void id
  }

  // Stats semana 1
  const totalPosts = calendarioSemana1.flatMap(d => d.items).filter(i => i.tipo === 'post').length
  const totalStories = calendarioSemana1.flatMap(d => d.items).filter(i => i.tipo === 'story').length
  const reelsBorrador = calendarioSemana1.flatMap(d => d.items).filter(i => i.tipo === 'reel' && i.status === 'borrador').length
  const proximoPost = 'Martes 1 Abr, 20:00'

  return (
    <div className="min-h-screen bg-gray-950 text-white pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-9 h-9 bg-gradient-to-br from-pink-500 to-purple-600 rounded-xl flex items-center justify-center">
              <Package size={18} className="text-white" />
            </div>
            <h1 className="text-2xl font-black text-white">Fabrica de Contenidos</h1>
          </div>
          <p className="text-gray-400 ml-12">Instagram @autom_atia — Semana 1 — Turnero by DIVINIA</p>
        </div>

        {/* ── SECCION 1: Estado del Calendario ─────────────────────────────── */}
        <section className="mb-8">
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-4">
            Estado del Calendario — Semana 1
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {/* Posts programados */}
            <div className="bg-gray-800 border border-gray-700 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Posts</p>
                <CheckCircle2 size={15} className="text-green-400" />
              </div>
              <p className="text-2xl font-black text-white">{totalPosts}/5</p>
              <p className="text-xs text-green-400 mt-1">Semana completa</p>
            </div>

            {/* Stories */}
            <div className="bg-gray-800 border border-gray-700 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Stories</p>
                <Film size={15} className="text-amber-400" />
              </div>
              <p className="text-2xl font-black text-white">{totalStories}</p>
              <p className="text-xs text-amber-400 mt-1">Planificadas</p>
            </div>

            {/* Reels pendientes */}
            <div className="bg-gray-800 border border-gray-700 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Reels</p>
                <Clapperboard size={15} className="text-purple-400" />
              </div>
              <p className="text-2xl font-black text-white">{reelsBorrador}</p>
              <p className="text-xs text-purple-400 mt-1">Pendientes render</p>
            </div>

            {/* Proximo post */}
            <div className="bg-gray-800 border border-gray-700 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Proximo Post</p>
                <Clock size={15} className="text-blue-400" />
              </div>
              <p className="text-sm font-black text-white leading-tight">{proximoPost}</p>
              <p className="text-xs text-blue-400 mt-1">Dolor — 3-8 turnos</p>
            </div>
          </div>
        </section>

        {/* ── SECCION 2: Calendario Semanal ────────────────────────────────── */}
        <section className="mb-8">
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-4">
            Calendario Semanal — Lun 31 Mar al Dom 6 Abr
          </h2>
          <div className="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden">
            <div className="grid grid-cols-7 divide-x divide-gray-700">
              {calendarioSemana1.map((dia) => (
                <div key={dia.dia} className="flex flex-col">
                  {/* Header del día */}
                  <div className="bg-gray-750 border-b border-gray-700 px-2 py-2.5 text-center">
                    <p className="text-xs font-bold text-gray-200">{dia.dia}</p>
                    <p className="text-[10px] text-gray-500 mt-0.5">{dia.fecha}</p>
                  </div>
                  {/* Items del día */}
                  <div className="p-1.5 flex flex-col gap-1.5 min-h-[120px]">
                    {dia.items.length === 0 && (
                      <div className="flex items-center justify-center h-full">
                        <p className="text-[10px] text-gray-600">—</p>
                      </div>
                    )}
                    {dia.items.map((item, i) => (
                      <div
                        key={i}
                        className="rounded-lg p-1.5 bg-gray-900/60 border border-gray-700/50"
                      >
                        <div className="flex items-center gap-1 mb-1">
                          <span className={`inline-flex items-center gap-0.5 text-[9px] font-semibold px-1.5 py-0.5 rounded-full border ${tipoColor[item.tipo]}`}>
                            {tipoIcono[item.tipo]}
                            {item.tipo}
                          </span>
                        </div>
                        <p className="text-[9px] text-gray-300 leading-tight mb-1 line-clamp-2">{item.titulo}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-[9px] text-gray-500 flex items-center gap-0.5">
                            <Clock size={8} />{item.hora}
                          </span>
                          <span className={`text-[8px] px-1 py-0.5 rounded-full ${statusBadge[item.status]}`}>
                            {statusLabel[item.status]}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
          {/* Leyenda */}
          <div className="flex items-center gap-4 mt-2 px-1">
            {(['post', 'story', 'reel'] as const).map(t => (
              <div key={t} className={`inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full border ${tipoColor[t]}`}>
                {tipoIcono[t]}
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </div>
            ))}
            <div className="ml-auto flex items-center gap-3">
              {Object.entries(statusBadge).map(([k, cls]) => (
                <span key={k} className={`text-[9px] px-1.5 py-0.5 rounded-full ${cls}`}>{statusLabel[k]}</span>
              ))}
            </div>
          </div>
        </section>

        {/* ── SECCION 3: Herramientas de Produccion ────────────────────────── */}
        <section className="mb-8">
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-4">
            Herramientas de Produccion
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">

            {/* Card Canva */}
            <div className="bg-indigo-950 border border-indigo-800 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 bg-indigo-600 rounded-lg flex items-center justify-center">
                  <Palette size={18} className="text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-white">Canva — Diseño</h3>
                  <p className="text-indigo-300 text-xs">Carpetas del proyecto Turnero</p>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                {[
                  { label: 'Abrir carpeta Semana 1 Posts', url: 'https://www.canva.com/folder/FAHFpVAfEXc' },
                  { label: 'Abrir carpeta Carruseles', url: 'https://www.canva.com/folder/FAHFpcOd82M' },
                  { label: 'Abrir carpeta Historias', url: 'https://www.canva.com/folder/FAHFpd43YX4' },
                  { label: 'Abrir todos los logos', url: 'https://www.canva.com/folder/FAHFpa6KWII' },
                  { label: 'Planificador Canva', url: 'https://www.canva.com/content-planner/' },
                ].map(({ label, url }) => (
                  <a
                    key={label}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between gap-2 bg-indigo-900/50 hover:bg-indigo-800/60 border border-indigo-700/50 hover:border-indigo-600 rounded-lg px-3 py-2.5 text-sm text-indigo-200 hover:text-white transition-all group"
                  >
                    <span>{label}</span>
                    <ExternalLink size={13} className="text-indigo-400 group-hover:text-indigo-200 shrink-0" />
                  </a>
                ))}
              </div>
            </div>

            {/* Card Nanobanana */}
            <div className="bg-purple-950 border border-purple-800 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-1">
                <div className="w-9 h-9 bg-purple-600 rounded-lg flex items-center justify-center">
                  <Video size={18} className="text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-white">Nanobanana — Videos 3D</h3>
                  <p className="text-purple-300 text-xs">Fondos 3D animados para Remotion</p>
                </div>
              </div>
              <p className="text-purple-300/70 text-xs mb-4 leading-relaxed mt-2">
                Genera fondos 3D animados para Remotion. Exporta MP4 y colocalo en{' '}
                <code className="bg-purple-900/60 px-1 rounded text-purple-200">/public/nanobanana/</code>
              </p>

              {/* Badge video actual */}
              <div className="flex items-center gap-2 mb-4">
                <span className="inline-flex items-center gap-1.5 bg-green-500/15 border border-green-500/30 text-green-400 text-xs font-medium px-2.5 py-1 rounded-full">
                  <CheckCircle2 size={11} />
                  Video actual: turnero-fondo-9x16.mp4
                </span>
              </div>

              <a
                href="https://nanobanana.app"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 bg-purple-700 hover:bg-purple-600 rounded-lg px-4 py-2.5 text-sm font-semibold text-white transition-colors mb-4 group"
              >
                Abrir Nanobanana
                <ExternalLink size={13} className="group-hover:translate-x-0.5 transition-transform" />
              </a>

              {/* Instrucciones */}
              <div className="bg-purple-900/30 border border-purple-800/40 rounded-lg p-3">
                <p className="text-[10px] text-purple-400 font-semibold uppercase tracking-wide mb-2">Flujo de trabajo</p>
                <ol className="space-y-1">
                  {[
                    'Genera el fondo en Nanobanana',
                    'Exporta el MP4 desde la plataforma',
                    `Guarda en C:/divinia/public/nanobanana/`,
                    'Remotion lo usa automaticamente',
                  ].map((step, i) => (
                    <li key={i} className="flex items-start gap-2 text-[11px] text-purple-300">
                      <span className="w-4 h-4 rounded-full bg-purple-700 text-purple-200 flex items-center justify-center text-[9px] font-bold shrink-0 mt-0.5">
                        {i + 1}
                      </span>
                      {step}
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </div>
        </section>

        {/* ── SECCION 4: Remotion — Composiciones ──────────────────────────── */}
        <section className="mb-8">
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-4">
            Remotion — Composiciones disponibles
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {composicionesRemotion.map((comp) => {
              const isActive = renderInfo?.startsWith(`npx remotion render ${comp.id}`) ?? false
              return (
                <div
                  key={comp.id}
                  className="bg-gray-800 border border-gray-700 rounded-xl p-4 flex flex-col gap-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-bold text-white leading-tight">{comp.id}</p>
                      <p className="text-[10px] text-gray-500 font-mono mt-0.5">{comp.frames}f</p>
                    </div>
                    <div className="w-7 h-7 bg-gray-700 rounded-lg flex items-center justify-center shrink-0">
                      <Clapperboard size={13} className="text-gray-400" />
                    </div>
                  </div>
                  <p className="text-[11px] text-gray-400 leading-tight flex-1">{comp.desc}</p>
                  {comp.requiere && (
                    <div className="flex items-center gap-1">
                      <Circle size={8} className="text-amber-400 shrink-0" />
                      <p className="text-[9px] text-amber-400 truncate">{comp.requiere}</p>
                    </div>
                  )}
                  <button
                    onClick={() => showRender(comp.id, comp.frames, comp.requiere)}
                    className="flex items-center justify-center gap-1.5 bg-gray-700 hover:bg-indigo-600 border border-gray-600 hover:border-indigo-500 rounded-lg px-2 py-1.5 text-[11px] font-medium text-gray-300 hover:text-white transition-all"
                  >
                    <Play size={10} />
                    Previsualizar
                  </button>
                  {isActive && renderInfo && (
                    <div className="bg-gray-900 border border-gray-600 rounded-lg p-2 mt-1">
                      <pre className="text-[9px] text-green-400 font-mono whitespace-pre-wrap leading-relaxed">
                        {renderInfo}
                      </pre>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </section>

        {/* ── SECCION 5: Prompts Chrome Extension ──────────────────────────── */}
        <section>
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-4">
            Prompts Chrome Extension — Claude Instagram
          </h2>
          <div className="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden">
            {/* Header del prompt */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-700">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-violet-600 rounded-lg flex items-center justify-center">
                  <FileText size={15} className="text-white" />
                </div>
                <div>
                  <p className="text-sm font-bold text-white">Setup completo @autom_atia</p>
                  <p className="text-xs text-gray-400">Mega prompt — 10 pasos para configurar Instagram</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPromptExpanded(v => !v)}
                  className="flex items-center gap-1.5 bg-gray-700 hover:bg-gray-600 border border-gray-600 rounded-lg px-3 py-1.5 text-xs text-gray-300 hover:text-white transition-all"
                >
                  {promptExpanded ? <><ChevronUp size={12} /> Colapsar</> : <><ChevronDown size={12} /> Expandir</>}
                </button>
                <button
                  onClick={copyPrompt}
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all border ${
                    copied
                      ? 'bg-green-600 border-green-500 text-white'
                      : 'bg-indigo-600 hover:bg-indigo-500 border-indigo-500 text-white'
                  }`}
                >
                  {copied ? <><Check size={12} /> Copiado!</> : <><Copy size={12} /> Copiar al portapapeles</>}
                </button>
              </div>
            </div>

            {/* Instruccion de uso */}
            <div className="bg-amber-500/10 border-b border-amber-500/20 px-5 py-2.5">
              <p className="text-xs text-amber-300">
                <strong>Como usar:</strong> Copia el prompt, abre Instagram.com en Chrome, activa la extension de Claude y pega el prompt. El agente completara los 10 pasos en orden.
              </p>
            </div>

            {/* Textarea */}
            {promptExpanded && (
              <div className="p-4">
                <textarea
                  readOnly
                  value={CHROME_PROMPT}
                  className="w-full h-96 bg-gray-900 border border-gray-700 rounded-lg p-4 text-xs text-gray-300 font-mono resize-y focus:outline-none focus:border-indigo-500 leading-relaxed"
                />
              </div>
            )}

            {!promptExpanded && (
              <div className="px-5 py-3">
                <p className="text-xs text-gray-500 font-mono line-clamp-2">
                  {CHROME_PROMPT.split('\n').slice(0, 3).join(' ')}...
                </p>
              </div>
            )}
          </div>
        </section>

      </div>
    </div>
  )
}
