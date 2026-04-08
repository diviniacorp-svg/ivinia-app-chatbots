// ============================================================
// DIVINIA — Reel: Demo del Producto
// Muestra el sistema de turnos funcionando en un mockup de celular
// Duración: 30 segundos a 30fps = 900 frames
// Formato: 1080x1920 (vertical Instagram Reel)
// ============================================================

import React from 'react'
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
  Sequence,
  Easing,
} from 'remotion'

// ——— Colores de marca DIVINIA ———
const COLORS = {
  bg: '#09090b',
  bgCard: '#18181b',
  purple: '#6366f1',
  purpleLight: '#818cf8',
  purpleDim: '#3730a3',
  white: '#ffffff',
  gray: '#a1a1aa',
  grayLight: '#d4d4d8',
  green: '#22c55e',
  border: '#27272a',
}

// ——— Tipografía ———
const FONT = 'system-ui, -apple-system, sans-serif'

interface ReelConfig {
  rubro: string
  emoji: string
  headline: string
  steps: { icon: string; text: string; detail: string }[]
  ctaText: string
}

const RUBRO_CONFIGS: Record<string, ReelConfig> = {
  peluqueria: {
    rubro: 'Peluquería',
    emoji: '💇',
    headline: 'Tu peluquería con turnos online',
    steps: [
      { icon: '📱', text: 'Cliente reserva desde el celu', detail: 'Cualquier hora, sin llamadas' },
      { icon: '✅', text: 'Confirmación automática por WA', detail: 'Instantáneo, sin que hagas nada' },
      { icon: '🔔', text: 'Recordatorio 24hs antes', detail: 'Cero cancelaciones de último momento' },
    ],
    ctaText: '14 días gratis',
  },
  clinica: {
    rubro: 'Clínica',
    emoji: '🩺',
    headline: 'Tu consultorio en modo automático',
    steps: [
      { icon: '📱', text: 'Paciente reserva online 24hs', detail: 'Sin ocupar la línea de recepción' },
      { icon: '✅', text: 'Turno confirmado al instante', detail: 'Con datos completos del paciente' },
      { icon: '🔔', text: 'Recordatorio automático', detail: 'Menos ausencias, más consultas' },
    ],
    ctaText: '14 días gratis',
  },
  veterinaria: {
    rubro: 'Veterinaria',
    emoji: '🐾',
    headline: 'Tu veterinaria con agenda digital',
    steps: [
      { icon: '📱', text: 'Dueño reserva desde casa', detail: '24hs, cualquier día' },
      { icon: '✅', text: 'WhatsApp automático confirmando', detail: 'Con datos de la mascota incluidos' },
      { icon: '🔔', text: 'Recordatorio antes del turno', detail: 'Se reducen las faltas a la mitad' },
    ],
    ctaText: '14 días gratis',
  },
  taller: {
    rubro: 'Taller Mecánico',
    emoji: '🔧',
    headline: 'Tu taller sin perder tiempo al teléfono',
    steps: [
      { icon: '📱', text: 'Cliente reserva el servicio', detail: 'Elige fecha, hora y tipo de trabajo' },
      { icon: '✅', text: 'Confirmación automática', detail: 'Vos te enterás sin atender el teléfono' },
      { icon: '🔔', text: 'Recordatorio al cliente', detail: 'Llegan en horario, sin llamadas extra' },
    ],
    ctaText: '14 días gratis',
  },
}

// ——— Componente: Mockup de teléfono ———
function PhoneMockup({
  frame,
  fps,
  rubro,
}: {
  frame: number
  fps: number
  rubro: string
}) {
  const config = RUBRO_CONFIGS[rubro] || RUBRO_CONFIGS.peluqueria

  const phoneScale = spring({ frame, fps, config: { damping: 15, stiffness: 80 }, from: 0.7, to: 1 })
  const phoneOpacity = interpolate(frame, [0, 15], [0, 1], { extrapolateRight: 'clamp' })

  // Simular pantalla del sistema de turnos
  const screenOpacity = interpolate(frame, [10, 25], [0, 1], { extrapolateRight: 'clamp' })
  const rowAnim = (delay: number) =>
    interpolate(frame, [20 + delay, 35 + delay], [0, 1], { extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic) })

  const timeSlots = ['09:00', '10:30', '12:00', '14:30', '16:00']
  const selectedSlot = 2

  return (
    <AbsoluteFill style={{ opacity: phoneOpacity }}>
      {/* Teléfono */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: `translate(-50%, -50%) scale(${phoneScale})`,
          width: 280,
          height: 560,
          background: '#1c1c1e',
          borderRadius: 44,
          border: `3px solid ${COLORS.border}`,
          boxShadow: `0 0 80px ${COLORS.purple}44, 0 40px 80px rgba(0,0,0,0.8)`,
          overflow: 'hidden',
        }}
      >
        {/* Notch */}
        <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: 100, height: 28, background: '#1c1c1e', borderRadius: '0 0 18px 18px', zIndex: 10 }} />

        {/* Screen */}
        <div style={{ width: '100%', height: '100%', background: COLORS.bg, opacity: screenOpacity, padding: '40px 16px 16px', boxSizing: 'border-box' }}>
          {/* Header app */}
          <div style={{ fontFamily: FONT, color: COLORS.white, fontSize: 14, fontWeight: 700, marginBottom: 4 }}>
            {config.rubro} {config.emoji}
          </div>
          <div style={{ fontFamily: FONT, color: COLORS.gray, fontSize: 11, marginBottom: 16 }}>
            Reservá tu turno
          </div>

          {/* Fecha */}
          <div style={{ background: COLORS.bgCard, borderRadius: 10, padding: '10px 12px', marginBottom: 12, opacity: rowAnim(0) }}>
            <div style={{ fontFamily: FONT, color: COLORS.gray, fontSize: 10, marginBottom: 4 }}>FECHA</div>
            <div style={{ fontFamily: FONT, color: COLORS.white, fontSize: 13, fontWeight: 600 }}>Martes 15 de Abril</div>
          </div>

          {/* Horarios */}
          <div style={{ fontFamily: FONT, color: COLORS.gray, fontSize: 10, marginBottom: 8, opacity: rowAnim(5) }}>HORARIOS DISPONIBLES</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, opacity: rowAnim(8) }}>
            {timeSlots.map((slot, i) => (
              <div
                key={slot}
                style={{
                  padding: '6px 10px',
                  borderRadius: 8,
                  background: i === selectedSlot ? COLORS.purple : COLORS.bgCard,
                  border: `1px solid ${i === selectedSlot ? COLORS.purple : COLORS.border}`,
                  fontFamily: FONT,
                  color: i === selectedSlot ? COLORS.white : COLORS.gray,
                  fontSize: 12,
                  fontWeight: i === selectedSlot ? 700 : 400,
                  transform: `scale(${i === selectedSlot ? interpolate(frame, [30, 40], [1, 1.05], { extrapolateRight: 'clamp' }) : 1})`,
                }}
              >
                {slot}
              </div>
            ))}
          </div>

          {/* Botón confirmar */}
          <div
            style={{
              marginTop: 16,
              background: COLORS.purple,
              borderRadius: 12,
              padding: '12px 0',
              textAlign: 'center',
              fontFamily: FONT,
              color: COLORS.white,
              fontSize: 13,
              fontWeight: 700,
              opacity: rowAnim(12),
              boxShadow: `0 4px 20px ${COLORS.purple}66`,
            }}
          >
            Confirmar turno ✓
          </div>

          {/* WhatsApp notification */}
          {frame > 50 && (
            <div
              style={{
                marginTop: 12,
                background: '#166534',
                borderRadius: 10,
                padding: '8px 12px',
                opacity: interpolate(frame, [50, 65], [0, 1], { extrapolateRight: 'clamp' }),
                transform: `translateY(${interpolate(frame, [50, 65], [10, 0], { extrapolateRight: 'clamp' })}px)`,
              }}
            >
              <div style={{ fontFamily: FONT, color: '#86efac', fontSize: 9, marginBottom: 2 }}>WhatsApp · ahora</div>
              <div style={{ fontFamily: FONT, color: COLORS.white, fontSize: 11 }}>✅ Turno confirmado para el Martes 15 a las 12:00hs</div>
            </div>
          )}
        </div>
      </div>
    </AbsoluteFill>
  )
}

// ——— Componente: Paso del proceso ———
function StepCard({
  step,
  index,
  startFrame,
  frame,
  fps,
}: {
  step: ReelConfig['steps'][0]
  index: number
  startFrame: number
  frame: number
  fps: number
}) {
  const localFrame = frame - startFrame
  const opacity = interpolate(localFrame, [0, 15], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const x = interpolate(localFrame, [0, 20], [-60, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.back(1.5)) })

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 14,
        opacity,
        transform: `translateX(${x}px)`,
        background: COLORS.bgCard,
        borderRadius: 16,
        padding: '14px 16px',
        border: `1px solid ${COLORS.border}`,
        marginBottom: 10,
      }}
    >
      <div
        style={{
          width: 44,
          height: 44,
          background: `${COLORS.purple}22`,
          borderRadius: 12,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 22,
          flexShrink: 0,
        }}
      >
        {step.icon}
      </div>
      <div>
        <div style={{ fontFamily: FONT, color: COLORS.white, fontSize: 16, fontWeight: 700, marginBottom: 2 }}>{step.text}</div>
        <div style={{ fontFamily: FONT, color: COLORS.gray, fontSize: 13 }}>{step.detail}</div>
      </div>
      <div
        style={{
          marginLeft: 'auto',
          width: 24,
          height: 24,
          background: COLORS.green,
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          fontSize: 12,
          color: COLORS.white,
        }}
      >
        ✓
      </div>
    </div>
  )
}

// ——— Componente principal ———
export const ProductDemoReel: React.FC<{ rubro?: string }> = ({ rubro = 'peluqueria' }) => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  const config = RUBRO_CONFIGS[rubro] || RUBRO_CONFIGS.peluqueria

  // Fases del video
  // 0-30:   Intro con headline + mockup
  // 30-150: Mockup + steps aparecen
  // 150-240: Vista completa con CTA
  // 240-270: CTA pulsante

  const headlineOpacity = interpolate(frame, [5, 25], [0, 1], { extrapolateRight: 'clamp' })
  const headlineY = interpolate(frame, [5, 25], [30, 0], { extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic) })

  const stepsVisible = frame > 80

  const ctaScale = spring({ frame: frame - 220, fps, config: { damping: 10, stiffness: 100 }, from: 0.8, to: 1 })
  const ctaOpacity = interpolate(frame, [220, 240], [0, 1], { extrapolateRight: 'clamp' })

  // Glow de fondo
  const glowOpacity = interpolate(frame, [0, 30], [0, 0.6], { extrapolateRight: 'clamp' })

  return (
    <AbsoluteFill style={{ background: COLORS.bg, fontFamily: FONT }}>

      {/* Glow de fondo */}
      <div style={{
        position: 'absolute',
        top: -200,
        left: '50%',
        transform: 'translateX(-50%)',
        width: 600,
        height: 600,
        background: `radial-gradient(circle, ${COLORS.purple}33 0%, transparent 70%)`,
        opacity: glowOpacity,
        pointerEvents: 'none',
      }} />

      {/* ——— FASE 1: Headline ——— */}
      <Sequence from={0} durationInFrames={270}>
        <AbsoluteFill>
          <div style={{
            position: 'absolute',
            top: 80,
            left: 0,
            right: 0,
            textAlign: 'center',
            opacity: headlineOpacity,
            transform: `translateY(${headlineY}px)`,
            padding: '0 40px',
          }}>
            <div style={{ fontSize: 56, marginBottom: 8 }}>{config.emoji}</div>
            <div style={{
              fontSize: 32,
              fontWeight: 900,
              color: COLORS.white,
              lineHeight: 1.2,
              letterSpacing: -0.5,
            }}>
              {config.headline}
            </div>
          </div>
        </AbsoluteFill>
      </Sequence>

      {/* ——— FASE 2: Mockup del teléfono ——— */}
      <Sequence from={10} durationInFrames={200}>
        <div style={{ position: 'absolute', top: 200, left: 0, right: 0, bottom: 0 }}>
          <PhoneMockup frame={frame - 10} fps={fps} rubro={rubro} />
        </div>
      </Sequence>

      {/* ——— FASE 3: Steps (aparecen sobre el mockup) ——— */}
      {stepsVisible && (
        <Sequence from={80} durationInFrames={190}>
          <div style={{
            position: 'absolute',
            bottom: 200,
            left: 40,
            right: 40,
          }}>
            {config.steps.map((step, i) => (
              <StepCard
                key={i}
                step={step}
                index={i}
                startFrame={i * 20}
                frame={frame - 80}
                fps={fps}
              />
            ))}
          </div>
        </Sequence>
      )}

      {/* ——— FASE 4: CTA ——— */}
      <Sequence from={220} durationInFrames={50}>
        <AbsoluteFill style={{ justifyContent: 'flex-end', alignItems: 'center', paddingBottom: 80 }}>
          <div style={{
            opacity: ctaOpacity,
            transform: `scale(${ctaScale})`,
            background: COLORS.purple,
            borderRadius: 24,
            padding: '18px 48px',
            boxShadow: `0 8px 40px ${COLORS.purple}88`,
          }}>
            <div style={{ color: COLORS.white, fontSize: 22, fontWeight: 900 }}>
              {config.ctaText} →
            </div>
          </div>
          <div style={{
            position: 'absolute',
            bottom: 40,
            color: COLORS.gray,
            fontSize: 14,
            opacity: ctaOpacity,
          }}>
            divinia.vercel.app
          </div>
        </AbsoluteFill>
      </Sequence>

      {/* Watermark DIVINIA */}
      <div style={{
        position: 'absolute',
        top: 40,
        right: 40,
        color: COLORS.purpleLight,
        fontSize: 16,
        fontWeight: 700,
        letterSpacing: 2,
        opacity: interpolate(frame, [10, 25], [0, 0.8], { extrapolateRight: 'clamp' }),
      }}>
        DIVINIA
      </div>
    </AbsoluteFill>
  )
}
