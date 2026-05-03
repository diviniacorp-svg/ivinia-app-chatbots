/**
 * DIVINIA — TurneroPromoReel
 * Muestra el flow real de reserva de turno con demos de rubros reales.
 * 3 demos: Rufina Nails · Barbería El Cuchillo · Dental Arce
 * 15 seg / 450 frames / 30fps / 1080x1920
 */
import React from 'react'
import {
  AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig,
  Sequence, Easing,
} from 'remotion'
import { loadFont as loadSerif } from '@remotion/google-fonts/DMSerifDisplay'
import { loadFont as loadMono } from '@remotion/google-fonts/DMMono'

const { fontFamily: SERIF } = loadSerif()
const { fontFamily: MONO } = loadMono()

// ── Paleta v2 ──
const C = {
  ink:    '#09090B',
  paper:  '#F6F5F2',
  lime:   '#C6FF3D',
  orange: '#FF6B2B',
  violet: '#8B5CF6',
  pink:   '#F472B6',
  muted:  'rgba(246,245,242,0.45)',
  card:   'rgba(246,245,242,0.06)',
  line:   'rgba(246,245,242,0.1)',
  limeGlow: 'rgba(198,255,61,0.15)',
  limeBorder: 'rgba(198,255,61,0.28)',
}

// ── Datos reales de demos ──
const DEMOS = [
  {
    id: 'rufina-nails-demo',
    name: 'Rufina Nails',
    rubro: 'Nail Bar',
    emoji: '💅',
    accent: '#F472B6',
    accentGlow: 'rgba(244,114,182,0.2)',
    service: { name: 'Uñas en gel', cat: 'Esculpidas', duration: 90, price: 28000, deposit: 30 },
    date: 'Mar 15 de Abril',
    time: '10:00',
    prof: 'Rufina',
  },
  {
    id: 'barberia-el-cuchillo',
    name: 'El Cuchillo',
    rubro: 'Barbería',
    emoji: '✂️',
    accent: '#C6FF3D',
    accentGlow: 'rgba(198,255,61,0.15)',
    service: { name: 'Corte + barba', cat: 'Combos', duration: 60, price: 14000, deposit: 0 },
    date: 'Jue 17 de Abril',
    time: '11:30',
    prof: 'Nico',
  },
  {
    id: 'clinica-dental-arce',
    name: 'Dental Arce',
    rubro: 'Odontología',
    emoji: '🦷',
    accent: '#38BDF8',
    accentGlow: 'rgba(56,189,248,0.15)',
    service: { name: 'Limpieza dental', cat: 'Preventiva', duration: 60, price: 22000, deposit: 50 },
    date: 'Vie 18 de Abril',
    time: '09:00',
    prof: 'Dra. Arce',
  },
]

// ── Helpers ──
function fade(f: number, from: number, to: number) {
  return interpolate(f, [from, to], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
}
function slideY(f: number, from: number, to: number, dist = 20) {
  return interpolate(f, [from, to], [dist, 0], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  })
}

// ── Orb flotante de fondo ──
function Orb({ cx, cy, r, color, frame, speed = 30 }: {
  cx: number; cy: number; r: number; color: string; frame: number; speed?: number
}) {
  const y = interpolate(Math.sin(frame / speed), [-1, 1], [-14, 14])
  return (
    <div style={{
      position: 'absolute',
      left: cx - r, top: cy - r + y,
      width: r * 2, height: r * 2,
      borderRadius: '50%',
      background: color,
      filter: `blur(${r * 0.6}px)`,
      opacity: 0.6,
      pointerEvents: 'none',
    }} />
  )
}

// ── Phone mockup con el flow de reserva ──
function PhoneMockup({ demo, frame }: { demo: typeof DEMOS[0]; frame: number }) {
  const phoneScale = spring({ frame, fps: 30, config: { damping: 14, stiffness: 90 }, from: 0.85, to: 1 })
  const phoneOp = fade(frame, 0, 12)

  // paso 1: servicio (0-40)
  // paso 2: fecha/hora (40-90)
  // paso 3: confirmacion + WA (90+)
  const step = frame < 40 ? 0 : frame < 90 ? 1 : 2

  const step1Op = fade(frame, 0, 14)
  const step2Op = fade(frame, 40, 54)
  const step3Op = fade(frame, 90, 104)
  const waOp    = fade(frame, 110, 124)
  const waY     = slideY(frame, 110, 124, 12)

  const { accent, accentGlow, service, date, time, prof } = demo

  return (
    <div style={{
      position: 'absolute',
      top: '50%', left: '50%',
      transform: `translate(-50%, -50%) scale(${phoneScale})`,
      width: 300, height: 580,
      background: C.ink,
      borderRadius: 44,
      border: `2.5px solid ${accent}55`,
      boxShadow: `0 0 80px ${accentGlow}, 0 40px 80px rgba(0,0,0,0.7)`,
      overflow: 'hidden',
      opacity: phoneOp,
    }}>
      {/* Notch */}
      <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: 90, height: 24, background: C.ink, borderRadius: '0 0 14px 14px', zIndex: 10 }} />

      {/* Contenido */}
      <div style={{ padding: '36px 20px 20px', height: '100%', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', gap: 12 }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, opacity: step1Op }}>
          <span style={{ fontSize: 28 }}>{demo.emoji}</span>
          <div>
            <div style={{ fontFamily: MONO, fontSize: 13, fontWeight: 700, color: C.paper, letterSpacing: '-0.01em' }}>{demo.name}</div>
            <div style={{ fontFamily: MONO, fontSize: 9, color: C.muted, letterSpacing: '0.08em', textTransform: 'uppercase' }}>{demo.rubro}</div>
          </div>
          <div style={{ marginLeft: 'auto', background: `${accent}22`, border: `1px solid ${accent}44`, borderRadius: 100, padding: '3px 10px' }}>
            <span style={{ fontFamily: MONO, fontSize: 9, color: accent, letterSpacing: '0.06em' }}>TURNERO IA</span>
          </div>
        </div>

        {/* Barra de progreso */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 0, opacity: step1Op }}>
          {['Servicio', 'Fecha', 'Listo'].map((label, i) => (
            <React.Fragment key={i}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{
                  width: 22, height: 22, borderRadius: '50%',
                  background: i <= step ? accent : 'rgba(246,245,242,0.08)',
                  border: `1.5px solid ${i <= step ? accent : 'rgba(246,245,242,0.12)'}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 10, fontFamily: MONO, color: i <= step ? C.ink : C.muted,
                  fontWeight: 700,
                  boxShadow: i === step ? `0 0 12px ${accent}66` : 'none',
                }}>
                  {i < step ? '✓' : i + 1}
                </div>
                <span style={{ fontFamily: MONO, fontSize: 7.5, color: i === step ? C.paper : C.muted, marginTop: 3, letterSpacing: '0.04em', textTransform: 'uppercase' }}>{label}</span>
              </div>
              {i < 2 && <div style={{ flex: 1, height: 1, background: i < step ? accent : C.line, marginBottom: 14 }} />}
            </React.Fragment>
          ))}
        </div>

        {/* PASO 1: Servicio */}
        {step < 2 && (
          <div style={{ opacity: step === 0 ? step1Op : step === 1 ? 1 : 0 }}>
            <div style={{ fontFamily: MONO, fontSize: 9, color: C.muted, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>Servicio</div>
            <div style={{
              background: `${accent}18`,
              border: `1.5px solid ${accent}40`,
              borderRadius: 14,
              padding: '12px 14px',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontFamily: MONO, fontSize: 13, fontWeight: 700, color: C.paper, marginBottom: 3 }}>{service.name}</div>
                  <div style={{ fontFamily: MONO, fontSize: 9, color: C.muted, letterSpacing: '0.06em' }}>{service.cat} · {service.duration} min</div>
                </div>
                <div style={{ fontFamily: SERIF, fontStyle: 'italic', fontSize: 16, color: accent, fontWeight: 400 }}>
                  ${service.price.toLocaleString('es-AR')}
                </div>
              </div>
              {service.deposit > 0 && (
                <div style={{ marginTop: 8, background: 'rgba(246,245,242,0.05)', borderRadius: 8, padding: '5px 8px' }}>
                  <span style={{ fontFamily: MONO, fontSize: 9, color: C.muted }}>Seña: {service.deposit}% al confirmar → </span>
                  <span style={{ fontFamily: MONO, fontSize: 9, color: accent }}>
                    ${Math.round(service.price * service.deposit / 100).toLocaleString('es-AR')} vía MercadoPago
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* PASO 2: Fecha + hora */}
        {step >= 1 && step < 2 && (
          <div style={{ opacity: step2Op }}>
            <div style={{ fontFamily: MONO, fontSize: 9, color: C.muted, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>Fecha y hora</div>
            {/* Mini calendar row */}
            <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
              {['Lun 14', 'Mar 15', 'Mié 16', 'Jue 17', 'Vie 18'].map((d, i) => {
                const sel = d === 'Mar 15' || (demo.id === 'barberia-el-cuchillo' && d === 'Jue 17') || (demo.id === 'clinica-dental-arce' && d === 'Vie 18')
                return (
                  <div key={d} style={{
                    flex: 1, background: sel ? accent : C.card, border: `1px solid ${sel ? accent : C.line}`,
                    borderRadius: 10, padding: '6px 0', textAlign: 'center',
                    boxShadow: sel ? `0 0 10px ${accent}55` : 'none',
                  }}>
                    <div style={{ fontFamily: MONO, fontSize: 7.5, color: sel ? C.ink : C.muted }}>{d.split(' ')[0]}</div>
                    <div style={{ fontFamily: MONO, fontSize: 11, fontWeight: 700, color: sel ? C.ink : C.paper }}>{d.split(' ')[1]}</div>
                  </div>
                )
              })}
            </div>
            {/* Horarios */}
            <div style={{ fontFamily: MONO, fontSize: 9, color: C.muted, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6 }}>Horarios disponibles</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {['09:00', '10:00', '11:30', '14:00', '16:30'].map((t) => {
                const sel = t === time
                return (
                  <div key={t} style={{
                    padding: '6px 10px', borderRadius: 10,
                    background: sel ? accent : C.card,
                    border: `1px solid ${sel ? accent : C.line}`,
                    fontFamily: MONO, fontSize: 11,
                    color: sel ? C.ink : C.paper, fontWeight: sel ? 700 : 400,
                    boxShadow: sel ? `0 0 8px ${accent}55` : 'none',
                  }}>
                    {t}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* PASO 3: Confirmado */}
        {step >= 2 && (
          <div style={{ opacity: step3Op, flex: 1, display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{
              background: `${accent}18`, border: `1.5px solid ${accent}44`, borderRadius: 14, padding: '14px',
            }}>
              <div style={{ fontFamily: MONO, fontSize: 9, color: accent, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>Turno confirmado ✓</div>
              <div style={{ fontFamily: SERIF, fontStyle: 'italic', fontSize: 18, color: C.paper, lineHeight: 1.2, marginBottom: 6 }}>{service.name}</div>
              <div style={{ fontFamily: MONO, fontSize: 10, color: C.muted }}>{date} · {time}hs · con {prof}</div>
            </div>

            {/* WhatsApp notification */}
            <div style={{
              background: 'rgba(22,101,52,0.85)',
              border: '1px solid rgba(74,222,128,0.3)',
              borderRadius: 12, padding: '10px 14px',
              opacity: waOp,
              transform: `translateY(${waY}px)`,
            }}>
              <div style={{ fontFamily: MONO, fontSize: 8, color: '#86efac', letterSpacing: '0.06em', marginBottom: 4 }}>WhatsApp · ahora</div>
              <div style={{ fontFamily: MONO, fontSize: 10, color: C.paper, lineHeight: 1.4 }}>
                ✅ Turno confirmado para el {date.replace('Abril', 'Abr')} a las {time}hs con {demo.name}.
                {service.deposit > 0 ? ` Seña de $${Math.round(service.price * service.deposit / 100).toLocaleString('es-AR')} recibida.` : ''}
              </div>
            </div>
          </div>
        )}

        {/* Botón confirmar (pasos 0 y 1) */}
        {step < 2 && (
          <div style={{
            marginTop: 'auto',
            background: step === 1 ? accent : `${accent}33`,
            border: `1.5px solid ${accent}${step === 1 ? '' : '44'}`,
            borderRadius: 14,
            padding: '12px',
            textAlign: 'center',
            opacity: step1Op,
            boxShadow: step === 1 ? `0 4px 24px ${accent}55` : 'none',
          }}>
            <span style={{ fontFamily: MONO, fontSize: 12, fontWeight: 700, color: step === 1 ? C.ink : C.muted, letterSpacing: '0.04em' }}>
              {step === 0 ? 'Elegir fecha →' : 'Confirmar turno →'}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Reel Badge del rubro ──
function RubroBadge({ demo, frame, delay }: { demo: typeof DEMOS[0]; frame: number; delay: number }) {
  const f = frame - delay
  const op = fade(f, 0, 16)
  const y  = slideY(f, 0, 16, 20)
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10,
      background: `${demo.accent}14`,
      border: `1.5px solid ${demo.accent}35`,
      borderRadius: 100,
      padding: '10px 20px',
      opacity: op,
      transform: `translateY(${y}px)`,
    }}>
      <span style={{ fontSize: 20 }}>{demo.emoji}</span>
      <div>
        <span style={{ fontFamily: MONO, fontSize: 14, fontWeight: 700, color: C.paper }}>{demo.name}</span>
        <span style={{ fontFamily: MONO, fontSize: 11, color: demo.accent, marginLeft: 8 }}>{demo.rubro}</span>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────
// ESCENA 1 — Intro (0-100)
// ─────────────────────────────────────────────────
const SceneIntro: React.FC<{ opacity: number }> = ({ opacity }) => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  return (
    <AbsoluteFill style={{ background: C.ink, justifyContent: 'center', alignItems: 'center', flexDirection: 'column', gap: 24, padding: '0 56px', opacity }}>
      <Orb cx={900} cy={300} r={260} color={C.limeGlow} frame={frame} speed={28} />
      <Orb cx={100} cy={1600} r={200} color="rgba(139,92,246,0.2)" frame={frame} speed={36} />

      {/* Label */}
      <div style={{ opacity: fade(frame, 0, 16) }}>
        <div style={{ fontFamily: MONO, fontSize: 20, letterSpacing: '0.14em', textTransform: 'uppercase', color: C.muted, textAlign: 'center' }}>
          DIVINIA · Turnero IA
        </div>
      </div>

      {/* Headline */}
      <div style={{ textAlign: 'center', opacity: fade(frame, 8, 30), transform: `translateY(${slideY(frame, 8, 30, 24)})` }}>
        <div style={{ fontFamily: SERIF, fontStyle: 'italic', fontSize: 82, fontWeight: 400, color: C.paper, lineHeight: 1.0, letterSpacing: '-0.03em', marginBottom: 12 }}>
          Así se reserva<br />un turno.
        </div>
        <div style={{ fontFamily: MONO, fontSize: 22, color: C.muted, letterSpacing: '0.02em' }}>
          Solo. Las 24hs. Sin que vos hagas nada.
        </div>
      </div>

      {/* Badges de los 3 demos */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14, width: '100%', marginTop: 8 }}>
        {DEMOS.map((demo, i) => (
          <RubroBadge key={demo.id} demo={demo} frame={frame} delay={32 + i * 14} />
        ))}
      </div>
    </AbsoluteFill>
  )
}

// ─────────────────────────────────────────────────
// ESCENA 2 — Demo Rufina Nails (100-220)
// ─────────────────────────────────────────────────
const SceneDemoNails: React.FC<{ opacity: number }> = ({ opacity }) => {
  const frame = useCurrentFrame()
  const demo = DEMOS[0]
  const labelOp = fade(frame, 0, 14)
  const labelY  = slideY(frame, 0, 14, 14)
  return (
    <AbsoluteFill style={{ background: C.ink, justifyContent: 'center', alignItems: 'center', flexDirection: 'column', opacity }}>
      <Orb cx={180} cy={500} r={220} color="rgba(244,114,182,0.18)" frame={frame} speed={30} />

      {/* Label flotante */}
      <div style={{ position: 'absolute', top: 80, left: 0, right: 0, textAlign: 'center', opacity: labelOp, transform: `translateY(${labelY}px)` }}>
        <div style={{ fontFamily: MONO, fontSize: 16, letterSpacing: '0.12em', textTransform: 'uppercase', color: demo.accent }}>
          {demo.emoji} {demo.name} · {demo.rubro}
        </div>
      </div>

      <PhoneMockup demo={demo} frame={frame} />

      {/* Copy debajo */}
      <div style={{ position: 'absolute', bottom: 80, left: 0, right: 0, textAlign: 'center', padding: '0 56px', opacity: fade(frame, 20, 40) }}>
        <div style={{ fontFamily: MONO, fontSize: 18, color: C.muted }}>
          La seña se cobra sola por <span style={{ color: demo.accent }}>MercadoPago</span>
        </div>
      </div>
    </AbsoluteFill>
  )
}

// ─────────────────────────────────────────────────
// ESCENA 3 — Demo Barbería (220-330)
// ─────────────────────────────────────────────────
const SceneDemoBarberia: React.FC<{ opacity: number }> = ({ opacity }) => {
  const frame = useCurrentFrame()
  const demo = DEMOS[1]
  const labelOp = fade(frame, 0, 14)
  const labelY  = slideY(frame, 0, 14, 14)
  return (
    <AbsoluteFill style={{ background: C.ink, justifyContent: 'center', alignItems: 'center', flexDirection: 'column', opacity }}>
      <Orb cx={860} cy={400} r={240} color={C.limeGlow} frame={frame} speed={26} />

      <div style={{ position: 'absolute', top: 80, left: 0, right: 0, textAlign: 'center', opacity: labelOp, transform: `translateY(${labelY}px)` }}>
        <div style={{ fontFamily: MONO, fontSize: 16, letterSpacing: '0.12em', textTransform: 'uppercase', color: demo.accent }}>
          {demo.emoji} {demo.name} · {demo.rubro}
        </div>
      </div>

      <PhoneMockup demo={demo} frame={frame} />

      <div style={{ position: 'absolute', bottom: 80, left: 0, right: 0, textAlign: 'center', padding: '0 56px', opacity: fade(frame, 20, 40) }}>
        <div style={{ fontFamily: MONO, fontSize: 18, color: C.muted }}>
          Reserva desde el celu. <span style={{ color: demo.accent }}>Sin llamar. Sin WhatsApp.</span>
        </div>
      </div>
    </AbsoluteFill>
  )
}

// ─────────────────────────────────────────────────
// ESCENA 4 — CTA (330-450)
// ─────────────────────────────────────────────────
const SceneCTA: React.FC<{ opacity: number }> = ({ opacity }) => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  const s = spring({ frame, fps, config: { damping: 10, stiffness: 100 }, from: 0.85, to: 1 })
  const pulse = 1 + interpolate(Math.sin(frame / 12), [-1, 1], [0, 0.025])

  return (
    <AbsoluteFill style={{ background: C.ink, justifyContent: 'center', alignItems: 'center', flexDirection: 'column', gap: 32, padding: '0 60px', opacity }}>
      <Orb cx={540} cy={700} r={340} color={C.limeGlow} frame={frame} speed={24} />

      {/* Headline */}
      <div style={{ textAlign: 'center', transform: `scale(${s})` }}>
        <div style={{ fontFamily: MONO, fontSize: 20, letterSpacing: '0.16em', textTransform: 'uppercase', color: C.muted, marginBottom: 10 }}>
          Probalo vos mismo
        </div>
        <div style={{ fontFamily: SERIF, fontStyle: 'italic', fontSize: 100, fontWeight: 400, color: C.lime, letterSpacing: '-0.04em', lineHeight: 1, marginBottom: 8 }}>
          14 días
        </div>
        <div style={{ fontFamily: SERIF, fontStyle: 'italic', fontSize: 56, fontWeight: 400, color: C.paper, letterSpacing: '-0.03em', lineHeight: 1 }}>
          gratis.
        </div>
        <div style={{ fontFamily: MONO, fontSize: 20, color: C.muted, marginTop: 12 }}>
          Sin tarjeta · Setup en 24hs · $45.000/mes
        </div>
      </div>

      {/* Demo live badge */}
      <div style={{
        background: C.limeGlow, border: `1px solid ${C.limeBorder}`,
        borderRadius: 14, padding: '14px 28px', textAlign: 'center',
        opacity: fade(frame, 20, 38),
        transform: `translateY(${slideY(frame, 20, 38, 16)})`,
      }}>
        <div style={{ fontFamily: MONO, fontSize: 14, color: C.lime, letterSpacing: '0.08em', marginBottom: 4 }}>
          Demo en vivo → probá reservar ahora
        </div>
        <div style={{ fontFamily: MONO, fontSize: 18, color: C.paper, fontWeight: 700 }}>
          divinia.vercel.app/reservas/rufina-nails-demo
        </div>
      </div>

      {/* CTA button */}
      <div style={{
        background: C.lime, borderRadius: 20, padding: '20px 56px',
        transform: `scale(${pulse})`,
        boxShadow: '0 0 56px rgba(198,255,61,0.4)',
        opacity: fade(frame, 14, 28),
      }}>
        <span style={{ fontFamily: MONO, fontSize: 28, fontWeight: 700, color: C.ink, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
          Escribinos hoy →
        </span>
      </div>

      {/* Trust signals */}
      <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', justifyContent: 'center', opacity: fade(frame, 28, 44) }}>
        {['⚡ 24hs setup', '📍 San Luis → todo ARG', '🤝 Sin contratos', '💳 50% al confirmar'].map(s => (
          <span key={s} style={{ fontFamily: MONO, fontSize: 16, color: C.muted, letterSpacing: '0.04em' }}>{s}</span>
        ))}
      </div>

      {/* Footer */}
      <div style={{ position: 'absolute', bottom: 52, fontFamily: MONO, fontSize: 18, color: 'rgba(246,245,242,0.18)', letterSpacing: '0.08em' }}>
        @divinia · divinia.vercel.app
      </div>
    </AbsoluteFill>
  )
}

// ─────────────────────────────────────────────────
// COMPOSICIÓN PRINCIPAL
// ─────────────────────────────────────────────────
// S1=100 · S2=120 · S3=110 · S4=120 · T=18 → total=450
const S1 = 100, S2 = 120, S3 = 110, S4 = 120, T = 18

function crossFade(frame: number, start: number, duration: number) {
  const opA = interpolate(frame, [start, start + duration], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.inOut(Easing.cubic) })
  const opB = interpolate(frame, [start, start + duration], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.inOut(Easing.cubic) })
  return { opA, opB }
}

export const TurneroPromoReel: React.FC = () => {
  const frame = useCurrentFrame()

  const t1 = S1 - T
  const s2 = S1
  const t2 = s2 + S2 - T
  const s3 = s2 + S2
  const t3 = s3 + S3 - T
  const s4 = s3 + S3

  const { opA: cf1a, opB: cf2a } = crossFade(frame, t1, T)
  const { opA: cf2b, opB: cf3a } = crossFade(frame, t2, T)
  const { opA: cf3b, opB: cf4  } = crossFade(frame, t3, T)

  const o1 = frame < t1 ? 1 : cf1a
  const o2 = frame < s2 ? 0 : frame < t2 ? 1 : cf2a * cf2b
  const o3 = frame < s3 ? 0 : frame < t3 ? 1 : cf3a * cf3b
  const o4 = frame < s4 ? 0 : cf4

  return (
    <AbsoluteFill style={{ background: C.ink }}>
      {o1 > 0 && <Sequence from={0}   durationInFrames={S1 + T}><SceneIntro      opacity={o1} /></Sequence>}
      {o2 > 0 && <Sequence from={s2}  durationInFrames={S2 + T}><SceneDemoNails  opacity={o2} /></Sequence>}
      {o3 > 0 && <Sequence from={s3}  durationInFrames={S3 + T}><SceneDemoBarberia opacity={o3} /></Sequence>}
      {o4 > 0 && <Sequence from={s4}  durationInFrames={S4}    ><SceneCTA        opacity={o4} /></Sequence>}
    </AbsoluteFill>
  )
}
