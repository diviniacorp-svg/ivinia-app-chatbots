'use client'

import { useState } from 'react'
import { ExternalLink, Copy, Check, Calendar, TrendingUp, FileText, Video, Image, ChevronDown, ChevronUp } from 'lucide-react'

type TipoContenido = 'POST' | 'CARRUSEL' | 'REEL' | 'STORY'
type EstadoContenido = 'PUBLICADO' | 'PROGRAMADO' | 'PENDIENTE'

interface ItemCalendario {
  id: number
  semana: number
  dia: string
  hora: string
  tipo: TipoContenido
  titulo: string
  estado: EstadoContenido
  caption: string
}

const CALENDARIO: ItemCalendario[] = [
  // SEMANA 1
  { id: 1, semana: 1, dia: 'Lunes', hora: '9:00', tipo: 'POST', titulo: 'Son las 11 de la noche…', estado: 'PENDIENTE', caption: 'Son las 11 de la noche.\n\nTu cliente te manda un mensaje de WhatsApp preguntando si tenés turno el jueves a las 3.\n\nVos revisás la planilla. Contestás. El cliente dice "buenísimo, te confirmo mañana". Mañana confirma. Para el martes ya lo olvidó.\n\nEste martes vino otro cliente a esa hora.\n\nAsí perdés 8, 10, 12 turnos por mes.\n\nTurnero lo resuelve: tus clientes reservan solos, a cualquier hora, sin mandarte mensajes. Vos recibís la notificación y nada más.\n\n$80.000 ARS. Pago único.\n\n¿Lo querés ver funcionando? DM.\n\n#turneroapp #turnos #peluqueria #clinica #estetica #veterinaria #pymesargentinas #automatizacion #divinia #sanluis' },
  { id: 2, semana: 1, dia: 'Martes', hora: '12:00', tipo: 'POST', titulo: '¿Qué incluye Turnero? $80.000 ARS', estado: 'PENDIENTE', caption: '¿Qué incluye Turnero en el plan básico por $80.000?\n\n✅ Reservas online 24/7 (tus clientes reservan solos)\n✅ Recordatorios automáticos (día antes y hora antes)\n✅ Panel de administración (tu agenda siempre visible)\n✅ Gestión de cancelaciones automática\n✅ Link personalizado para tu negocio\n✅ Funciona desde el celular y la computadora\n✅ Configuración hecha por nosotros\n✅ Soporte directo con el equipo de DIVINIA\n\nSin cuota mensual. Sin contrato. Sin letra chica.\n\nUna vez lo pagás, es tuyo para siempre.\n\nDM si tenés dudas.\n\n#turneroapp #turnos #peluqueria #clinica #estetica #veterinaria #taller #pymesargentinas #divinia' },
  { id: 3, semana: 1, dia: 'Miércoles', hora: '18:00', tipo: 'POST', titulo: 'Una peluquería de San Luis nos escribió…', estado: 'PENDIENTE', caption: 'Una peluquería de San Luis nos escribió hace tres semanas.\n\nTenían el problema clásico: WhatsApp explotado, turnos mal anotados, clientes que llegaban en el horario equivocado.\n\nConfiguramos Turnero en 24 horas. Les dejamos el sistema con sus horarios, sus servicios y su nombre.\n\nHoy la dueña nos mandó un mensaje: "la semana pasada tuve cero dobles turnos por primera vez en años."\n\nEso es lo que busca Turnero: que vos tengas menos problemas, no más tecnología que manejar.\n\n$80.000 ARS. Pago único. Configuración incluida.\n\nDM para coordinar.\n\n#turneroapp #turnos #peluqueria #sanluis #pymesargentinas #automatizacion #divinia' },
  { id: 4, semana: 1, dia: 'Jueves', hora: '11:00', tipo: 'POST', titulo: '¿Cuánto te cuesta NO tener turnos online?', estado: 'PENDIENTE', caption: '¿Cuánto te cuesta NO tener un sistema de turnos?\n\nCalculemos rápido:\n\n• Si perdés 10 turnos por mes por desorganización\n• Y cada turno vale $5.000 ARS en promedio\n• Eso son $50.000 ARS por mes tirados\n\nEn un año: $600.000 ARS perdidos por no tener un sistema.\n\nTurnero cuesta $80.000 una sola vez.\n\nSe paga solo en menos de dos meses con los turnos que dejás de perder.\n\nNo es un gasto. Es una inversión que se amortiza sola.\n\nDM para verlo juntos.\n\n#turneroapp #turnos #pymesargentinas #inversion #automatizacion #peluqueria #clinica #estetica #divinia #sanluis' },
  { id: 5, semana: 1, dia: 'Viernes', hora: '16:00', tipo: 'POST', titulo: 'Este fin de semana perdés turnos', estado: 'PENDIENTE', caption: 'Este fin de semana tu negocio va a recibir mensajes de WhatsApp preguntando por turnos.\n\nAlgunos los vas a ver. Otros no. Los que no viste ya tienen turno en otro lado.\n\nCon Turnero, todos los que pregunten un sábado a las 10 de la noche van a poder reservar solos.\n\n📲 DM hoy\n💳 Pagás $80.000 ARS (pago único)\n⚙️ Nosotros lo configuramos en 24hs\n✅ El lunes ya estás funcionando\n\n¿Arrancamos?\n\n#turneroapp #turnos #pymesargentinas #peluqueria #clinica #estetica #veterinaria #automatizacion #divinia' },
  // SEMANA 2
  { id: 6, semana: 2, dia: 'Lunes', hora: '9:00', tipo: 'POST', titulo: '"Seguro es complicado" — la respuesta', estado: 'PENDIENTE', caption: '"Seguro es muy complicado de usar."\n\nEs la primera duda que nos dicen casi todos.\n\nLa respuesta: si sabés usar WhatsApp, sabés usar Turnero.\n\nEl panel de administración es una pantalla con tu calendario. Ves los turnos del día, de la semana, los próximos.\n\nPara tus clientes es todavía más simple: entran al link, eligen el día, eligen el horario, ponen su nombre, confirman. Tres pasos.\n\nY si algo no entienden, estamos nosotros.\n\n¿Lo ves funcionando antes de decidir? DM para demo gratuito.\n\n#turneroapp #turnos #facildeuso #pymesargentinas #peluqueria #clinica #estetica #divinia' },
  { id: 7, semana: 2, dia: 'Martes', hora: '12:00', tipo: 'POST', titulo: '3 planes. Todos pago único. Sin cuota.', estado: 'PENDIENTE', caption: 'Turnero tiene tres planes. Todos son pago único, sin cuota mensual.\n\n📌 Plan Básico — $80.000 ARS\nIdeal para negocios con 1 o 2 profesionales.\n\n📌 Plan Pro — $150.000 ARS\nPara negocios con equipo: múltiples profesionales, múltiples agendas.\n\n📌 Plan Enterprise — $200.000 ARS\nPara cadenas o negocios con varias sucursales.\n\nLos tres incluyen: configuración + soporte directo + actualizaciones.\n\n¿No sabés cuál es el tuyo? DM y te asesoramos sin compromiso.\n\n#turneroapp #planes #precios #pymesargentinas #peluqueria #clinica #estetica #veterinaria #divinia' },
  { id: 8, semana: 2, dia: 'Miércoles', hora: '18:00', tipo: 'POST', titulo: 'Esta semana configuramos 3 negocios', estado: 'PENDIENTE', caption: 'Esta semana configuramos tres negocios nuevos con Turnero.\n\nUna peluquería en San Luis.\nUna clínica estética en Mendoza.\nUna veterinaria en Córdoba.\n\nCada vez que configuramos un negocio, esa persona deja de perder turnos.\n\nNo hay "el momento perfecto para empezar". El momento perfecto era hace seis meses. El segundo mejor momento es hoy.\n\n$80.000 ARS. Pago único. Configuración en 24hs.\n\nDM para coordinar.\n\n#turneroapp #turnos #pymesargentinas #automatizacion #peluqueria #clinica #estetica #veterinaria #divinia #sanluis' },
  { id: 9, semana: 2, dia: 'Jueves', hora: '11:00', tipo: 'POST', titulo: 'Para peluquerías y barberías específicamente', estado: 'PENDIENTE', caption: 'Para peluquerías y barberías específicamente.\n\nEl problema clásico: clientes que llaman, mandan mensajes, preguntan por Instagram, y después igual llegan sin turno.\n\nTurnero le da a tu peluquería un link de reservas. Lo ponés en tu bio de Instagram, en tu estado de WhatsApp, en una tarjetita con QR en el negocio.\n\nEl cliente entra, ve los horarios disponibles, elige el que quiere. Si cancelás un turno, ese horario vuelve a estar disponible automáticamente.\n\nVos solo mirás el panel y atendés.\n\nPlan básico: $80.000 ARS.\n\nDM si tenés peluquería o barbería.\n\n#peluqueria #barberia #turnos #turneroapp #pymesargentinas #divinia #automatizacion' },
  { id: 10, semana: 2, dia: 'Viernes', hora: '17:00', tipo: 'POST', titulo: 'Resumen de la semana + CTA', estado: 'PENDIENTE', caption: 'Resumen de la semana para los que llegaron tarde:\n\n🔵 Turnero es un sistema de turnos online para tu negocio.\n🔵 Tus clientes reservan solos, 24/7.\n🔵 Vos recibís notificaciones y ves tu agenda desde el celular.\n🔵 Recordatorios automáticos. Cero dobles turnos. Sin WhatsApp.\n🔵 $80.000 ARS pago único. Sin cuota.\n\nAplica para: peluquerías, barberías, clínicas, estéticas, veterinarias, talleres y más.\n\nSomos de San Luis. Configuramos y damos soporte nosotros.\n\nDM abierto. Te respondemos hoy.\n\n#turneroapp #turnos #pymesargentinas #peluqueria #clinica #estetica #veterinaria #taller #divinia #sanluis' },
  // SEMANA 3
  { id: 11, semana: 3, dia: 'Lunes', hora: '9:00', tipo: 'CARRUSEL', titulo: '5 razones para tener turnos online', estado: 'PENDIENTE', caption: '5 razones para pasarte a los turnos online 👆\n\nNo es opcional en 2025. Es lo que diferencia un negocio organizado de uno que siempre está apagando incendios.\n\nTurnero, desde $80.000 ARS pago único. Configuración hecha por nosotros, soporte real, sin cuota mensual.\n\nDM si querés verlo funcionando para tu tipo de negocio.\n\n#turneroapp #turnos #peluqueria #clinica #estetica #veterinaria #pymesargentinas #divinia #sanluis' },
  { id: 12, semana: 3, dia: 'Martes', hora: '12:00', tipo: 'REEL', titulo: 'Reel: 47 mensajes — el sistema que trabaja solo', estado: 'PENDIENTE', caption: '¿Cuántos turnos perdés por semana por estar gestionando reservas a mano?\n\nTurnero los captura solos. $80.000 ARS, pago único. Configuración incluida.\n\nSomos de San Luis, lo configuramos en 24hs y te acompañamos.\n\nDM para que te lo mostremos 👇\n\n#turneroapp #turnos #peluqueria #clinica #estetica #veterinaria #taller #pymesargentinas #divinia #automatizacion' },
  { id: 13, semana: 3, dia: 'Miércoles', hora: '18:00', tipo: 'POST', titulo: 'DIVINIA: somos de San Luis, hacemos IA', estado: 'PENDIENTE', caption: 'Somos de San Luis Capital y hacemos software de IA para PYMEs de toda Argentina.\n\nNo somos una agencia de Buenos Aires con precios de Buenos Aires. Somos una empresa local que entiende lo que necesita un negocio real en el interior del país.\n\nSistema de turnos online, paneles de control, chatbots, automatizaciones. Todo diseñado para que vos puedas administrar tu negocio sin volverte loco.\n\nDM si querés saber más.\n\n#divinia #softwareargentino #sanluis #inteligenciaartificial #pymesargentinas #automatizacion' },
  { id: 14, semana: 3, dia: 'Jueves', hora: '11:00', tipo: 'CARRUSEL', titulo: 'Antes y Después de usar Turnero', estado: 'PENDIENTE', caption: 'Antes y después de Turnero 👆\n\nNo hace falta explicar mucho más. Si te identificaste con algún "antes", el "después" está a $80.000 ARS de distancia.\n\nPago único. Sin cuota. Configuración incluida. Soporte directo.\n\nDM para arrancar hoy.\n\n#turneroapp #antesydespues #turnos #peluqueria #clinica #estetica #veterinaria #pymesargentinas #divinia #sanluis' },
  { id: 15, semana: 3, dia: 'Viernes', hora: '16:00', tipo: 'REEL', titulo: 'Reel: 3 preguntas que tu negocio responde gratis', estado: 'PENDIENTE', caption: 'Tres preguntas que tu negocio responde gratis todos los días. Ese tiempo vale plata.\n\nTurnero responde la de turnos solo. Tus clientes reservan sin depender de vos.\n\n$80.000 ARS pago único. 24hs de configuración. Soporte real.\n\nDM directo o link en bio 👇\n\n#turneroapp #turnos #automatizacion #pymesargentinas #peluqueria #clinica #estetica #veterinaria #divinia #sanluis' },
  // SEMANA 4
  { id: 16, semana: 4, dia: 'Lunes', hora: '9:00', tipo: 'POST', titulo: 'Caso de uso: clínica y consultorio', estado: 'PENDIENTE', caption: 'Para clínicas y consultorios médicos.\n\nEl problema más común: pacientes que llaman para pedir turno mientras el médico está atendiendo. La recepcionista no puede atender el teléfono y la consulta al mismo tiempo.\n\nCon Turnero, el paciente saca el turno solo desde el celular. Elige el médico, el día y el horario disponible. Recibe confirmación automática.\n\nLa recepcionista solo ve el panel y confirma la agenda del día.\n\nPlan Pro: $150.000 ARS. Incluye múltiples profesionales.\n\nDM para demo.\n\n#clinica #consultorio #turnos #turneroapp #pymesargentinas #divinia #automatizacion #sanluis' },
  { id: 17, semana: 4, dia: 'Martes', hora: '12:00', tipo: 'POST', titulo: 'Caso de uso: veterinaria', estado: 'PENDIENTE', caption: 'Para veterinarias.\n\nLos dueños de mascotas quieren reservar a cualquier hora. Muchas veces a la noche, cuando recuerdan que tienen que llevar al perro al veterinario.\n\nCon Turnero, entran al link, eligen el tipo de consulta, el día y el horario. El sistema manda un recordatorio el día anterior para que no falten.\n\nVos atendés. El sistema gestiona.\n\nPlan Básico: $80.000 ARS.\n\nDM para verlo.\n\n#veterinaria #mascotas #turnos #turneroapp #pymesargentinas #divinia #automatizacion #sanluis' },
  { id: 18, semana: 4, dia: 'Miércoles', hora: '18:00', tipo: 'POST', titulo: 'Central — tu negocio online completo', estado: 'PENDIENTE', caption: 'Además de Turnero, estamos lanzando algo nuevo.\n\nSe llama Central: el panel de control de tu negocio digital.\n\nUna landing pública para tus clientes + un panel de administración para vos.\n\nTodo en un solo lugar, con tu marca, tu información y tus servicios.\n\nPróximamente. Si querés ser de los primeros en conocerlo, DM.\n\n#central #divinia #negociodigital #pymesargentinas #sanluis #automatizacion #softwareargentino' },
  { id: 19, semana: 4, dia: 'Jueves', hora: '11:00', tipo: 'POST', titulo: 'DIVINIA: qué hacemos y para quién', estado: 'PENDIENTE', caption: 'DIVINIA hace software con IA para que los negocios argentinos trabajen mejor.\n\nNo somos consultores. No vendemos cursos. Hacemos herramientas que funcionan.\n\nTurnero: sistema de turnos online para PYMEs.\nCentral: panel de control del negocio (próximamente).\nAutomatizaciones, chatbots y más.\n\nTodo desde San Luis, para toda Argentina.\n\nSeguinos si tenés un negocio y querés ver cómo la tecnología puede hacer el trabajo aburrido por vos.\n\n#divinia #softwareargentino #sanluis #pymesargentinas #ia #automatizacion #turneroapp' },
  { id: 20, semana: 4, dia: 'Viernes', hora: '17:00', tipo: 'POST', titulo: 'Cierre de mes + oferta de lanzamiento', estado: 'PENDIENTE', caption: 'Cerramos el mes con esto:\n\nSi arrancás con Turnero antes del domingo, te hacemos el setup en 24hs y te damos el primer mes de soporte prioritario sin costo.\n\nNo es una promo para siempre. Es para cerrar bien el mes.\n\n✅ $80.000 ARS pago único\n✅ Configuración en 24hs\n✅ Soporte prioritario el primer mes\n✅ Sin cuota mensual\n\nSomos de San Luis. Respondemos hoy.\n\nDM ahora.\n\n#turneroapp #oferta #turnos #pymesargentinas #peluqueria #clinica #estetica #veterinaria #divinia #sanluis' },
]

const TIPO_COLORS: Record<TipoContenido, string> = {
  POST: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
  CARRUSEL: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  REEL: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
  STORY: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
}

const ESTADO_COLORS: Record<EstadoContenido, string> = {
  PUBLICADO: 'bg-green-500/20 text-green-300 border-green-500/30',
  PROGRAMADO: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  PENDIENTE: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
}

const TIPO_ICONS: Record<TipoContenido, React.ReactNode> = {
  POST: <Image size={12} />,
  CARRUSEL: <FileText size={12} />,
  REEL: <Video size={12} />,
  STORY: <Calendar size={12} />,
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <button
      onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000) }}
      className="flex items-center gap-1 px-2 py-1 rounded bg-gray-700 hover:bg-gray-600 text-gray-400 hover:text-white text-xs transition-all"
    >
      {copied ? <Check size={11} className="text-green-400" /> : <Copy size={11} />}
      {copied ? 'Copiado' : 'Copiar caption'}
    </button>
  )
}

function PostCard({ item }: { item: ItemCalendario }) {
  const [open, setOpen] = useState(false)
  return (
    <div className={`rounded-lg border bg-gray-800/60 p-3 transition-all ${open ? 'border-indigo-500/40' : 'border-gray-700'}`}>
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-medium border ${TIPO_COLORS[item.tipo]}`}>
            {TIPO_ICONS[item.tipo]}{item.tipo}
          </span>
          <span className={`px-1.5 py-0.5 rounded text-xs border ${ESTADO_COLORS[item.estado]}`}>
            {item.estado}
          </span>
        </div>
        <span className="text-gray-500 text-xs shrink-0">{item.hora}</span>
      </div>
      <p className="text-gray-200 text-xs font-medium leading-snug mb-2">{item.titulo}</p>
      <div className="flex items-center gap-2">
        <span className="text-gray-600 text-xs">{item.dia}</span>
        <button
          onClick={() => setOpen(!open)}
          className="flex items-center gap-1 text-gray-500 hover:text-gray-300 text-xs transition-colors"
        >
          {open ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
          {open ? 'Cerrar' : 'Ver caption'}
        </button>
      </div>
      {open && (
        <div className="mt-3 space-y-2">
          <pre className="text-gray-400 text-xs whitespace-pre-wrap font-sans bg-gray-900/60 rounded p-3 max-h-48 overflow-y-auto leading-relaxed">
            {item.caption}
          </pre>
          <CopyButton text={item.caption} />
        </div>
      )}
    </div>
  )
}

export default function CalendarioPage() {
  const [semanaActiva, setSemanaActiva] = useState<number | null>(null)
  const publicados = CALENDARIO.filter(p => p.estado === 'PUBLICADO').length
  const programados = CALENDARIO.filter(p => p.estado === 'PROGRAMADO').length

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-white">Calendario de Contenido</h1>
          <p className="text-gray-400 mt-1">Turnero by DIVINIA · @autom_atia · Mes 1</p>
          <div className="flex items-center gap-2 mt-3 flex-wrap">
            {(['POST', 'CARRUSEL', 'REEL'] as TipoContenido[]).map(t => (
              <span key={t} className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs border ${TIPO_COLORS[t]}`}>
                {TIPO_ICONS[t]}{t === 'POST' ? '20 posts' : t === 'CARRUSEL' ? '2 carruseles' : '2 reels'}
              </span>
            ))}
          </div>
        </div>
        <a
          href="https://www.canva.com/folder/FAHFpaqUolk"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-colors"
        >
          <ExternalLink size={15} />
          Abrir en Canva
        </a>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total posts', value: CALENDARIO.length, color: 'text-white' },
          { label: 'Publicados', value: publicados, color: 'text-green-400' },
          { label: 'Programados', value: programados, color: 'text-blue-400' },
          { label: 'Pendientes', value: CALENDARIO.length - publicados - programados, color: 'text-gray-400' },
        ].map(s => (
          <div key={s.label} className="bg-gray-800 rounded-xl border border-gray-700 p-4">
            <p className="text-gray-500 text-xs mb-1">{s.label}</p>
            <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Progreso */}
      <div className="bg-gray-800 rounded-xl border border-gray-700 p-5">
        <div className="flex items-center justify-between mb-3">
          <p className="text-white font-medium text-sm">Progreso del mes</p>
          <p className="text-gray-400 text-xs">{publicados}/{CALENDARIO.length} publicados</p>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2">
          <div
            className="bg-indigo-500 h-2 rounded-full transition-all"
            style={{ width: `${(publicados / CALENDARIO.length) * 100}%` }}
          />
        </div>
        <p className="text-gray-500 text-xs mt-2">{Math.round((publicados / CALENDARIO.length) * 100)}% completado</p>
      </div>

      {/* Semanas */}
      {[1, 2, 3, 4].map(semana => {
        const posts = CALENDARIO.filter(p => p.semana === semana)
        const isOpen = semanaActiva === null || semanaActiva === semana
        return (
          <div key={semana} className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
            <button
              onClick={() => setSemanaActiva(semanaActiva === semana ? null : semana)}
              className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-750 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center">
                  <span className="text-indigo-400 font-bold text-sm">{semana}</span>
                </div>
                <div className="text-left">
                  <p className="text-white font-medium text-sm">Semana {semana}</p>
                  <p className="text-gray-500 text-xs">{posts.length} publicaciones</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex gap-1">
                  {posts.map(p => (
                    <div
                      key={p.id}
                      className={`w-2 h-2 rounded-full ${p.estado === 'PUBLICADO' ? 'bg-green-400' : p.estado === 'PROGRAMADO' ? 'bg-blue-400' : 'bg-gray-600'}`}
                    />
                  ))}
                </div>
                <ChevronDown size={16} className={`text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
              </div>
            </button>
            {isOpen && (
              <div className="px-5 pb-5 grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
                {posts.map(p => <PostCard key={p.id} item={p} />)}
              </div>
            )}
          </div>
        )
      })}

      {/* Acciones rápidas */}
      <div className="bg-gray-800 rounded-xl border border-gray-700 p-5">
        <h2 className="text-white font-semibold mb-4">Acciones rápidas</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { label: 'Template base', sub: 'Turnero — identidad oficial', href: 'https://www.canva.com/d/b_ISRU0aCGZg7nO', icon: <Image size={16} /> },
            { label: 'Carpeta Semana 1', sub: 'Posts diseñados', href: 'https://www.canva.com/folder/FAHFpVAfEXc', icon: <FileText size={16} /> },
            { label: 'Planificador Canva', sub: 'Programar publicaciones', href: 'https://www.canva.com/content-planner/', icon: <Calendar size={16} /> },
            { label: 'Redes Sociales', sub: 'DMs y publicación', href: '/redes', icon: <TrendingUp size={16} /> },
          ].map(a => (
            <a
              key={a.label}
              href={a.href}
              target={a.href.startsWith('http') ? '_blank' : undefined}
              rel="noopener noreferrer"
              className="flex items-center gap-3 px-4 py-3 rounded-lg bg-gray-700/50 hover:bg-gray-700 border border-gray-600 transition-colors group"
            >
              <div className="w-8 h-8 rounded-lg bg-indigo-600/20 flex items-center justify-center text-indigo-400 shrink-0">
                {a.icon}
              </div>
              <div>
                <p className="text-gray-200 text-xs font-medium">{a.label}</p>
                <p className="text-gray-500 text-xs">{a.sub}</p>
              </div>
              <ExternalLink size={12} className="text-gray-600 group-hover:text-gray-400 ml-auto" />
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}
