import Link from 'next/link'
import { Check, ArrowRight, ExternalLink } from 'lucide-react'

export const metadata = {
  title: 'Propuesta para Quality Piscinas — Turnero IA | DIVINIA',
  description: 'Propuesta personalizada de sistema de turnos online para Quality Piscinas, San Luis.',
}

const RESERVAS_URL = 'https://divinia.vercel.app/reservas/0b0a91eb-b9fc-4dd3-babc-c2a1c4617f7f'
const PANEL_URL = 'https://divinia.vercel.app/panel/0b0a91eb-b9fc-4dd3-babc-c2a1c4617f7f'
const WA_URL = 'https://wa.me/5492665286110?text=Hola%20Joaco%2C%20soy%20de%20Quality%20Piscinas%2C%20quiero%20activar%20el%20Turnero'

export default function PropuestaQualityPiscinas() {
  return (
    <main style={{ background: '#fafaf9', color: '#09090b', fontFamily: 'system-ui, sans-serif', minHeight: '100vh' }}>

      {/* Header */}
      <div style={{ borderBottom: '1px solid #e4e4e7', background: '#fff' }}>
        <div style={{ maxWidth: 800, margin: '0 auto', padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 900, fontSize: 18, letterSpacing: '-0.5px' }}>
            <span style={{ width: 10, height: 10, background: '#c6ff3d', borderRadius: '50%', display: 'inline-block' }} />
            DIVINIA
          </div>
          <div style={{ fontSize: 12, color: '#71717a', textAlign: 'right' }}>
            <strong style={{ color: '#09090b', display: 'block', fontSize: 13 }}>Quality Piscinas</strong>
            San Luis Capital · Propuesta exclusiva
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 800, margin: '0 auto', padding: '0 24px 64px' }}>

        {/* Hero */}
        <div style={{ background: '#09090b', borderRadius: 20, padding: '48px 40px', margin: '32px 0', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: -80, right: -80, width: 220, height: 220, background: '#c6ff3d', opacity: 0.08, borderRadius: '50%' }} />
          <div style={{ position: 'absolute', bottom: -40, left: 40, width: 120, height: 120, background: '#c6ff3d', opacity: 0.05, borderRadius: '50%' }} />
          <div style={{ position: 'relative' }}>
            <div style={{ display: 'inline-block', background: 'rgba(198,255,61,0.12)', color: '#c6ff3d', fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', padding: '4px 12px', borderRadius: 999, marginBottom: 20, border: '1px solid rgba(198,255,61,0.2)' }}>
              Propuesta personalizada · 27 Abr 2026
            </div>
            <h1 style={{ color: '#fff', fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 900, lineHeight: 1.1, letterSpacing: '-1px', marginBottom: 16 }}>
              Quality Piscinas<br />
              <span style={{ color: '#c6ff3d' }}>con agenda online.</span>
            </h1>
            <p style={{ color: '#a1a1aa', fontSize: 16, marginBottom: 32, maxWidth: 520 }}>
              Tus clientes piden visita técnica cuando quieren, desde el celular. Sin llamadas. Sin turnos perdidos. Vos recibís el aviso por WhatsApp y tu agenda se organiza sola.
            </p>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <a href={RESERVAS_URL} target="_blank" rel="noopener noreferrer"
                style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#c6ff3d', color: '#09090b', fontWeight: 800, fontSize: 14, padding: '12px 24px', borderRadius: 10, textDecoration: 'none' }}>
                Ver cómo reservan tus clientes <ArrowRight size={15} />
              </a>
              <a href={PANEL_URL} target="_blank" rel="noopener noreferrer"
                style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.08)', color: '#fff', fontWeight: 700, fontSize: 14, padding: '12px 24px', borderRadius: 10, textDecoration: 'none', border: '1px solid rgba(255,255,255,0.12)' }}>
                Ver panel de gestión <ExternalLink size={14} />
              </a>
            </div>
          </div>
        </div>

        {/* Precio arriba */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 48 }}>
          <div style={{ border: '2px solid #09090b', borderRadius: 16, padding: '24px 28px' }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#71717a', marginBottom: 8 }}>Implementación</div>
            <div style={{ fontSize: 42, fontWeight: 900, letterSpacing: '-2px', lineHeight: 1 }}>$65.000</div>
            <div style={{ fontSize: 13, color: '#71717a', marginTop: 6 }}>pago único · el sistema es tuyo</div>
          </div>
          <div style={{ border: '1px solid #e4e4e7', borderRadius: 16, padding: '24px 28px', background: '#fff' }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#71717a', marginBottom: 8 }}>Soporte mensual</div>
            <div style={{ fontSize: 42, fontWeight: 900, letterSpacing: '-2px', lineHeight: 1 }}>$30.000<span style={{ fontSize: 16, fontWeight: 500, color: '#71717a' }}>/mes</span></div>
            <div style={{ fontSize: 13, color: '#71717a', marginTop: 6 }}>sin contrato · cancelás cuando querés</div>
          </div>
        </div>

        {/* Demo links destacados */}
        <div style={{ background: '#fff', border: '1px solid #e4e4e7', borderRadius: 16, padding: '28px 32px', marginBottom: 48 }}>
          <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#71717a', marginBottom: 16 }}>Dos links que te entregamos</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, padding: '16px 20px', background: '#fafaf9', borderRadius: 12, border: '1px solid #f0f0f0' }}>
              <div style={{ width: 32, height: 32, background: '#09090b', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <span style={{ color: '#c6ff3d', fontSize: 16 }}>📅</span>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 2 }}>Link de reservas para tus clientes</div>
                <div style={{ fontSize: 12, color: '#71717a', marginBottom: 8 }}>Lo ponés en Instagram, WhatsApp, la puerta del local. El cliente entra y reserva solo.</div>
                <a href={RESERVAS_URL} target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, color: '#09090b', fontFamily: 'monospace', textDecoration: 'underline', wordBreak: 'break-all' }}>
                  {RESERVAS_URL}
                </a>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, padding: '16px 20px', background: '#fafaf9', borderRadius: 12, border: '1px solid #f0f0f0' }}>
              <div style={{ width: 32, height: 32, background: '#c6ff3d', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <span style={{ fontSize: 16 }}>🗂️</span>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 2 }}>Panel de gestión (solo para vos)</div>
                <div style={{ fontSize: 12, color: '#71717a', marginBottom: 8 }}>Ves todos los turnos, confirmás, cancelás, mandás mensaje al cliente. Con PIN privado.</div>
                <a href={PANEL_URL} target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, color: '#09090b', fontFamily: 'monospace', textDecoration: 'underline', wordBreak: 'break-all' }}>
                  {PANEL_URL}
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Problema vs Solución */}
        <h2 style={{ fontSize: 26, fontWeight: 900, letterSpacing: '-0.5px', marginBottom: 8 }}>El problema de hoy</h2>
        <p style={{ color: '#71717a', marginBottom: 24, fontSize: 14 }}>Lo que pasa cuando no tenés el sistema.</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16, marginBottom: 48 }}>
          <div style={{ background: '#09090b', borderRadius: 16, padding: '28px 24px' }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#52525b', marginBottom: 20 }}>Sin Turnero</div>
            {[
              'El cliente llama mientras estás en una piscina — no atendés, llama a la competencia',
              'Turnos anotados en papel o de cabeza — se superponen, se olvidan',
              'De noche o el fin de semana no hay nadie para responder',
              'Sin recordatorio automático: el cliente no vino y ese hueco no se recupera',
              'No sabés cuántas visitas técnicas perdiste esta semana',
            ].map(item => (
              <div key={item} style={{ display: 'flex', gap: 12, marginBottom: 10 }}>
                <span style={{ color: '#3f3f46', fontWeight: 900, marginTop: 1, flexShrink: 0 }}>—</span>
                <span style={{ fontSize: 13, color: '#a1a1aa', lineHeight: 1.5 }}>{item}</span>
              </div>
            ))}
          </div>
          <div style={{ background: '#09090b', borderRadius: 16, padding: '28px 24px', border: '1px solid rgba(198,255,61,0.2)' }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#c6ff3d', marginBottom: 20 }}>Con Turnero Quality</div>
            {[
              'El cliente reserva la visita técnica solo desde el celular — sin llamarte',
              'La agenda se organiza sola en tiempo real — sin papeles, sin errores',
              'Reservas a las 11 de la noche o el domingo — siempre disponible',
              'Recordatorio automático 24hs antes → ausencias casi a cero',
              'Panel completo: ves todos los turnos antes de salir de casa',
            ].map(item => (
              <div key={item} style={{ display: 'flex', gap: 12, marginBottom: 10 }}>
                <Check size={14} style={{ color: '#c6ff3d', flexShrink: 0, marginTop: 2 }} />
                <span style={{ fontSize: 13, color: '#e4e4e7', lineHeight: 1.5 }}>{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Cómo funciona — detalle completo */}
        <h2 style={{ fontSize: 26, fontWeight: 900, letterSpacing: '-0.5px', marginBottom: 8 }}>Cómo funciona Turnero IA</h2>
        <p style={{ color: '#71717a', marginBottom: 28, fontSize: 14 }}>Todo lo que incluye el sistema, explicado paso a paso.</p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 48 }}>
          {[
            {
              n: '01', title: 'Link personalizado para reservas',
              body: 'Te entregamos un link único de Quality Piscinas. Lo compartís donde quieras: bio de Instagram, stories, grupos de WhatsApp, mensaje de respuesta automática, tarjetas de presentación o la puerta del local. El cliente lo abre desde el celular y ve tu disponibilidad en tiempo real.',
            },
            {
              n: '02', title: 'El cliente elige servicio, día y hora',
              body: 'La pantalla de reservas muestra todos tus servicios (limpieza, mantenimiento, diagnóstico, apertura de temporada, etc.) con su duración estimada. El cliente selecciona el que necesita, ve los horarios libres y confirma en menos de un minuto.',
            },
            {
              n: '03', title: 'Confirmación automática por WhatsApp',
              body: 'En el momento que el cliente confirma, le llega un mensaje de WhatsApp con todos los datos del turno: servicio, día, hora y la dirección si corresponde. Vos recibís al instante una notificación con los datos del cliente y el servicio solicitado.',
            },
            {
              n: '04', title: 'Recordatorio 24 horas antes',
              body: 'El sistema manda automáticamente un mensaje de recordatorio al cliente el día anterior. No tenés que hacer nada. Las ausencias bajan drásticamente porque el cliente recibe el aviso justo cuando tiene tiempo de cancelar o confirmar.',
            },
            {
              n: '05', title: 'Panel de gestión desde el celular',
              body: 'Con tu PIN privado entrás al panel y ves toda tu agenda: los turnos del día, los de la semana, el historial. Podés confirmar un turno, cancelarlo, reprogramarlo o mandar un mensaje directo al cliente — todo desde el mismo lugar, sin necesidad de entrar a ninguna app.',
            },
            {
              n: '06', title: 'Tus servicios y horarios configurados a medida',
              body: 'Antes del lanzamiento configuramos juntos todos tus servicios (con nombre, duración y precio), tus horarios de atención, los días que trabajás y cualquier bloqueo de agenda (vacaciones, feriados, turnos ocupados). El sistema respeta tu disponibilidad real.',
            },
            {
              n: '07', title: 'Sin app para descargar',
              body: 'Ni vos ni tus clientes necesitan descargar nada. El link de reservas abre directo en el navegador del celular. El panel de gestión también. Funciona en iPhone, Android y cualquier dispositivo.',
            },
          ].map(s => (
            <div key={s.n} style={{ display: 'flex', gap: 20, padding: '20px 24px', background: '#fff', borderRadius: 14, border: '1px solid #e4e4e7' }}>
              <div style={{ fontSize: 36, fontWeight: 900, color: '#f4f4f5', lineHeight: 1, flexShrink: 0, width: 40 }}>{s.n}</div>
              <div>
                <div style={{ fontWeight: 800, fontSize: 15, marginBottom: 4 }}>{s.title}</div>
                <div style={{ fontSize: 13, color: '#52525b', lineHeight: 1.6 }}>{s.body}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Servicios de Quality */}
        <div style={{ background: '#09090b', borderRadius: 16, padding: '32px 28px', marginBottom: 48 }}>
          <div style={{ color: '#c6ff3d', fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 6 }}>Tus servicios ya cargados</div>
          <div style={{ color: '#fff', fontWeight: 800, fontSize: 18, marginBottom: 4 }}>Configurados para Quality Piscinas</div>
          <div style={{ color: '#71717a', fontSize: 13, marginBottom: 24 }}>Los ajustamos juntos antes del lanzamiento.</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 10 }}>
            {[
              { nombre: 'Limpieza y aspirado completo', detalle: 'Fondo, paredes y skimmer' },
              { nombre: 'Desinfección de piscina', detalle: 'Tratamiento completo' },
              { nombre: 'Mantenimiento mensual', detalle: 'Químicos + revisión de equipos' },
              { nombre: 'Tratamiento de agua verde', detalle: 'Choque + algicida + limpieza' },
              { nombre: 'Instalación de bomba', detalle: 'Instalación y puesta en marcha' },
              { nombre: 'Cambio de cuarzo filtrante', detalle: 'Vaciado + recarga' },
              { nombre: 'Apertura de temporada', detalle: 'Puesta a punto para el verano' },
              { nombre: 'Cierre de temporada', detalle: 'Preparación para el invierno' },
              { nombre: 'Visita técnica de diagnóstico', detalle: 'Evaluación completa' },
              { nombre: 'Arreglos y reparaciones', detalle: 'Pérdidas, grietas y daños' },
            ].map(s => (
              <div key={s.nombre} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', padding: '12px 14px', background: 'rgba(255,255,255,0.04)', borderRadius: 10, border: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ width: 6, height: 6, background: '#c6ff3d', borderRadius: '50%', flexShrink: 0, marginTop: 5 }} />
                <div>
                  <div style={{ color: '#fff', fontWeight: 600, fontSize: 13 }}>{s.nombre}</div>
                  <div style={{ color: '#71717a', fontSize: 11 }}>{s.detalle}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Cómo arrancamos */}
        <h2 style={{ fontSize: 26, fontWeight: 900, letterSpacing: '-0.5px', marginBottom: 28 }}>Cómo arrancamos</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 48 }}>
          {[
            { n: '01', title: 'Confirmás hoy', desc: 'Transferencia o MercadoPago de $65.000. El sistema queda tuyo para siempre.' },
            { n: '02', title: 'Setup en 48 horas', desc: 'Cargamos tus servicios, horarios y configuramos el panel. En dos días Quality Piscinas toma turnos sola.' },
            { n: '03', title: 'Compartís el link', desc: 'Lo ponés en Instagram y WhatsApp. Los turnos empiezan a entrar mientras trabajás.' },
          ].map(s => (
            <div key={s.n} style={{ background: '#fff', border: '1px solid #e4e4e7', borderRadius: 14, padding: '24px 20px' }}>
              <div style={{ fontSize: 44, fontWeight: 900, color: '#f4f4f5', lineHeight: 1, marginBottom: 12 }}>{s.n}</div>
              <div style={{ fontWeight: 800, fontSize: 15, marginBottom: 6 }}>{s.title}</div>
              <div style={{ fontSize: 13, color: '#52525b', lineHeight: 1.6 }}>{s.desc}</div>
            </div>
          ))}
        </div>

        {/* Garantía */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16, marginBottom: 56 }}>
          <div style={{ background: '#09090b', borderRadius: 16, padding: '32px 28px', color: '#fff' }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#c6ff3d', marginBottom: 12 }}>Qué incluye</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                'Sistema personalizado Quality Piscinas',
                'Todos tus servicios cargados y configurados',
                'Tus horarios y disponibilidad real',
                'Notificaciones a tu WhatsApp por cada turno',
                'Panel de gestión con PIN privado',
                'Capacitación de 30 minutos incluida',
                '30 días de soporte post-lanzamiento',
              ].map(f => (
                <div key={f} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                  <Check size={13} style={{ color: '#c6ff3d', flexShrink: 0, marginTop: 2 }} />
                  <span style={{ fontSize: 13, color: '#d4d4d8' }}>{f}</span>
                </div>
              ))}
            </div>
          </div>
          <div style={{ background: '#fff', border: '1px solid #e4e4e7', borderRadius: 16, padding: '32px 28px' }}>
            <div style={{ fontSize: 32, marginBottom: 16 }}>🛡️</div>
            <div style={{ fontWeight: 900, fontSize: 20, marginBottom: 12 }}>30 días de garantía total.</div>
            <p style={{ fontSize: 13, color: '#52525b', lineHeight: 1.7, marginBottom: 12 }}>
              Si en 30 días el sistema no funciona como te prometemos o no te convence por cualquier motivo, te devolvemos el 100% de la implementación. Sin preguntas, sin vueltas.
            </p>
            <p style={{ fontSize: 13, color: '#52525b', lineHeight: 1.7 }}>
              Somos de San Luis. No somos una empresa de Buenos Aires que desaparece — estamos disponibles cuando nos necesitás.
            </p>
          </div>
        </div>

        {/* CTA */}
        <div style={{ textAlign: 'center', padding: '48px 24px', background: '#09090b', borderRadius: 20, marginBottom: 40 }}>
          <div style={{ color: '#c6ff3d', fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 16 }}>Próximo paso</div>
          <h2 style={{ color: '#fff', fontSize: 'clamp(22px, 4vw, 32px)', fontWeight: 900, letterSpacing: '-0.5px', marginBottom: 12 }}>
            ¿Lo probamos ahora?
          </h2>
          <p style={{ color: '#a1a1aa', fontSize: 15, marginBottom: 32, maxWidth: 440, margin: '0 auto 32px' }}>
            Los demos de Quality Piscinas ya están activos. Abrí el link de reservas desde el celular antes de decidir.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href={WA_URL} target="_blank" rel="noopener noreferrer"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 10, background: '#c6ff3d', color: '#09090b', fontWeight: 900, fontSize: 16, padding: '16px 32px', borderRadius: 12, textDecoration: 'none' }}>
              Confirmar por WhatsApp <ArrowRight size={18} />
            </a>
            <a href={RESERVAS_URL} target="_blank" rel="noopener noreferrer"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.06)', color: '#fff', fontWeight: 700, fontSize: 15, padding: '16px 28px', borderRadius: 12, textDecoration: 'none', border: '1px solid rgba(255,255,255,0.1)' }}>
              Ver demo reservas →
            </a>
            <a href={PANEL_URL} target="_blank" rel="noopener noreferrer"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.06)', color: '#fff', fontWeight: 700, fontSize: 15, padding: '16px 28px', borderRadius: 12, textDecoration: 'none', border: '1px solid rgba(255,255,255,0.1)' }}>
              Ver panel →
            </a>
          </div>
          <p style={{ color: '#52525b', fontSize: 13, marginTop: 24 }}>
            Joaco · DIVINIA · San Luis ·{' '}
            <a href="https://wa.me/5492665286110" style={{ color: '#a1a1aa' }}>(266) 528-6110</a>
          </p>
        </div>

      </div>

      <div style={{ borderTop: '1px solid #e4e4e7', padding: '24px', textAlign: 'center', fontSize: 12, color: '#a1a1aa' }}>
        Propuesta preparada por DIVINIA para Quality Piscinas · San Luis ·{' '}
        <Link href="/" style={{ color: '#09090b', textDecoration: 'underline' }}>divinia.vercel.app</Link>
      </div>
    </main>
  )
}
