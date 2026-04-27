import Link from 'next/link'
import { Check, ArrowRight, ExternalLink } from 'lucide-react'

export const metadata = {
  title: 'Propuesta para FA Peluquería — Turnero IA | DIVINIA',
  description: 'Propuesta personalizada de sistema de turnos online para FA Peluquería, San Luis.',
}

const RESERVAS_URL = 'https://divinia.vercel.app/reservas/fa-faby-demo'
const PANEL_URL = 'https://divinia.vercel.app/panel/fa-faby-demo'
const WA_URL = 'https://wa.me/5492665286110?text=Hola%20Joaco%2C%20quiero%20activar%20el%20Turnero%20para%20FA%20Peluquer%C3%ADa'

export default function PropuestaFaPeluqueria() {
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
            <strong style={{ color: '#09090b', display: 'block', fontSize: 13 }}>FA Peluquería</strong>
            San Luis Capital · Propuesta exclusiva
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 800, margin: '0 auto', padding: '0 24px 64px' }}>

        {/* Hero */}
        <div style={{ background: '#09090b', borderRadius: 20, padding: '48px 40px', margin: '32px 0', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: -80, right: -80, width: 220, height: 220, background: '#8B5CF6', opacity: 0.12, borderRadius: '50%' }} />
          <div style={{ position: 'absolute', bottom: -40, left: 40, width: 120, height: 120, background: '#c6ff3d', opacity: 0.07, borderRadius: '50%' }} />
          <div style={{ position: 'relative' }}>
            <div style={{ display: 'inline-block', background: 'rgba(198,255,61,0.12)', color: '#c6ff3d', fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', padding: '4px 12px', borderRadius: 999, marginBottom: 20, border: '1px solid rgba(198,255,61,0.2)' }}>
              Propuesta personalizada · 27 Abr 2026
            </div>
            <h1 style={{ color: '#fff', fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 900, lineHeight: 1.1, letterSpacing: '-1px', marginBottom: 16 }}>
              FA Peluquería<br />
              <span style={{ color: '#c6ff3d' }}>con agenda online.</span>
            </h1>
            <p style={{ color: '#a1a1aa', fontSize: 16, marginBottom: 32, maxWidth: 520 }}>
              Tus clientas reservan cuando quieren, desde el celular, incluso a las 11 de la noche. Sin mensajes sin responder. Sin turnos perdidos. Tu agenda organizada sola.
            </p>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <a href={RESERVAS_URL} target="_blank" rel="noopener noreferrer"
                style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#c6ff3d', color: '#09090b', fontWeight: 800, fontSize: 14, padding: '12px 24px', borderRadius: 10, textDecoration: 'none' }}>
                Ver cómo reservan tus clientas <ArrowRight size={15} />
              </a>
              <a href={PANEL_URL} target="_blank" rel="noopener noreferrer"
                style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.08)', color: '#fff', fontWeight: 700, fontSize: 14, padding: '12px 24px', borderRadius: 10, textDecoration: 'none', border: '1px solid rgba(255,255,255,0.12)' }}>
                Ver panel de gestión <ExternalLink size={14} />
              </a>
            </div>
          </div>
        </div>

        {/* Precio */}
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

        {/* Demo links */}
        <div style={{ background: '#fff', border: '1px solid #e4e4e7', borderRadius: 16, padding: '28px 32px', marginBottom: 48 }}>
          <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#71717a', marginBottom: 16 }}>Dos links que te entregamos</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, padding: '16px 20px', background: '#fafaf9', borderRadius: 12, border: '1px solid #f0f0f0' }}>
              <div style={{ width: 32, height: 32, background: '#09090b', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <span style={{ color: '#c6ff3d', fontSize: 16 }}>✂️</span>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 2 }}>Link de reservas para tus clientas</div>
                <div style={{ fontSize: 12, color: '#71717a', marginBottom: 8 }}>Lo ponés en el bio de Instagram, en el WhatsApp Business, en las stories. La clienta entra y reserva sola.</div>
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
                <div style={{ fontSize: 12, color: '#71717a', marginBottom: 8 }}>Ves todos los turnos del día, podés confirmar, cancelar o reprogramar. Acceso con PIN privado.</div>
                <a href={PANEL_URL} target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, color: '#09090b', fontFamily: 'monospace', textDecoration: 'underline', wordBreak: 'break-all' }}>
                  {PANEL_URL}
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Problema vs Solución */}
        <h2 style={{ fontSize: 26, fontWeight: 900, letterSpacing: '-0.5px', marginBottom: 8 }}>El problema de hoy</h2>
        <p style={{ color: '#71717a', marginBottom: 24, fontSize: 14 }}>Lo que pasa sin el sistema.</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16, marginBottom: 48 }}>
          <div style={{ background: '#09090b', borderRadius: 16, padding: '28px 24px' }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#52525b', marginBottom: 20 }}>Sin Turnero</div>
            {[
              'Estás con una clienta y llega un mensaje pidiendo turno — lo dejás, se olvida, se va',
              'Las 11pm: "¿Tenés para el sábado?" — no hay nadie para responder',
              'Sin recordatorio: no vino, ese hueco en el día no se recupera',
              'Agenda en el cuaderno o de cabeza — turnos dobles, errores, caos',
              'No sabés cuántas clientas perdiste esta semana',
            ].map(item => (
              <div key={item} style={{ display: 'flex', gap: 12, marginBottom: 10 }}>
                <span style={{ color: '#3f3f46', fontWeight: 900, marginTop: 1, flexShrink: 0 }}>—</span>
                <span style={{ fontSize: 13, color: '#a1a1aa', lineHeight: 1.5 }}>{item}</span>
              </div>
            ))}
          </div>
          <div style={{ background: '#09090b', borderRadius: 16, padding: '28px 24px', border: '1px solid rgba(198,255,61,0.2)' }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#c6ff3d', marginBottom: 20 }}>Con Turnero FA</div>
            {[
              'La clienta reserva sola desde el celular — vos seguís atendiendo',
              'Reservas de madrugada, de fin de semana — siempre disponible',
              'Recordatorio automático 24hs antes → ausencias casi a cero',
              'Panel digital en tiempo real — agenda impecable sin esfuerzo',
              'Llegás el lunes con el día ya organizado',
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
              body: 'Te entregamos un link único de FA Peluquería. Lo ponés en el bio de Instagram, en las stories, en el WhatsApp Business, como respuesta automática o incluso en las tarjetas. La clienta lo abre desde su celular y ve tu disponibilidad en tiempo real — sin llamarte, sin mensajes de ida y vuelta.',
            },
            {
              n: '02', title: 'La clienta elige servicio, día y hora',
              body: 'La pantalla muestra todos tus servicios (corte, coloración, alisado, brushing, tratamientos) con la duración de cada uno. La clienta elige lo que necesita, ve los horarios disponibles con tu agenda real y confirma en menos de un minuto.',
            },
            {
              n: '03', title: 'Confirmación automática por WhatsApp',
              body: 'Cuando la clienta confirma, le llega al instante un mensaje de WhatsApp con todos los datos: servicio, día, hora y precio si corresponde. Vos recibís una notificación inmediata con los datos del turno. Sin hacer nada.',
            },
            {
              n: '04', title: 'Recordatorio 24 horas antes',
              body: 'El sistema le manda automáticamente un recordatorio a la clienta el día anterior. Las ausencias bajan drásticamente porque ella recibe el aviso justo cuando tiene tiempo de cancelar o confirmar. Vos no tenés que mandar nada.',
            },
            {
              n: '05', title: 'Panel de gestión desde el celular',
              body: 'Con tu PIN privado entrás al panel y ves toda tu agenda: los turnos del día, los de la semana, el historial. Podés confirmar un turno, cancelarlo, reprogramarlo o contactar a la clienta directo por WhatsApp — todo desde el mismo lugar, sin app que descargar.',
            },
            {
              n: '06', title: 'Tus servicios y horarios configurados a medida',
              body: 'Antes del lanzamiento configuramos juntos todos tus servicios con nombre, duración y precio, tus horarios de atención, los días que trabajás y cualquier bloqueo de agenda. El sistema refleja tu disponibilidad real y no te permite reservas que no podés atender.',
            },
            {
              n: '07', title: 'Sin app para descargar',
              body: 'Ni vos ni tus clientas necesitan descargar nada. El link de reservas abre directo en el navegador. El panel también. Funciona en iPhone, Android y cualquier dispositivo. Simple y rápido.',
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

        {/* Servicios FA */}
        <div style={{ background: '#09090b', borderRadius: 16, padding: '32px 28px', marginBottom: 48 }}>
          <div style={{ color: '#c6ff3d', fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 6 }}>Tus servicios ya cargados</div>
          <div style={{ color: '#fff', fontWeight: 800, fontSize: 18, marginBottom: 4 }}>Configurados para FA Peluquería</div>
          <div style={{ color: '#71717a', fontSize: 13, marginBottom: 24 }}>Los ajustamos juntas antes del lanzamiento.</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 10 }}>
            {[
              { nombre: 'Corte de pelo', detalle: 'Dama / Caballero / Niños' },
              { nombre: 'Coloración completa', detalle: 'Tinte + retoque + mechas' },
              { nombre: 'Alisado o keratina', detalle: 'Tratamiento completo' },
              { nombre: 'Peinado y brushing', detalle: 'Para eventos o diario' },
              { nombre: 'Tratamiento capilar', detalle: 'Hidratación + reconstrucción' },
              { nombre: 'Ondas y rizado', detalle: 'Permanente o temporal' },
              { nombre: 'Corte + color', detalle: 'Servicio combinado' },
              { nombre: 'Balayage / Californianas', detalle: 'Técnicas especiales' },
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
            { n: '02', title: 'Setup en 48 horas', desc: 'Cargamos tus servicios, horarios y configuramos el panel. En dos días FA Peluquería toma turnos sola.' },
            { n: '03', title: 'Compartís el link', desc: 'Lo ponés en el bio de Instagram y en el WhatsApp. Los turnos empiezan a entrar mientras atendés.' },
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
                'Sistema personalizado FA Peluquería',
                'Tus servicios y precios cargados',
                'Tus horarios de atención configurados',
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
              Somos de San Luis. Estamos disponibles cuando nos necesitás. No desaparecemos después de la venta.
            </p>
          </div>
        </div>

        {/* CTA */}
        <div style={{ textAlign: 'center', padding: '48px 24px', background: '#09090b', borderRadius: 20, marginBottom: 40 }}>
          <div style={{ color: '#c6ff3d', fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 16 }}>Próximo paso</div>
          <h2 style={{ color: '#fff', fontSize: 'clamp(22px, 4vw, 32px)', fontWeight: 900, letterSpacing: '-0.5px', marginBottom: 12 }}>
            ¿Lo probamos juntas ahora?
          </h2>
          <p style={{ color: '#a1a1aa', fontSize: 15, marginBottom: 32, maxWidth: 440, margin: '0 auto 32px' }}>
            El demo de FA Peluquería ya está listo. Abrilo desde el celular antes de decidir — es exactamente lo que van a ver tus clientas.
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
        Propuesta preparada por DIVINIA para FA Peluquería · San Luis ·{' '}
        <Link href="/" style={{ color: '#09090b', textDecoration: 'underline' }}>divinia.vercel.app</Link>
      </div>
    </main>
  )
}
