// ============================================================
// DIVINIA — Reel: Texto Animado (hook rápido)
// Para frases de impacto / dolor del cliente
// Duración: 15 segundos a 30fps = 450 frames
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

const COLORS = {
  bg: '#09090b',
  purple: '#6366f1',
  purpleLight: '#818cf8',
  white: '#ffffff',
  gray: '#71717a',
}

interface TextSlide {
  text: string
  highlight?: string
  sub?: string
  duration: number
}

const SLIDE_CONFIGS: Record<string, TextSlide[]> = {
  dolor: [
    { text: '¿Cuántas llamadas\nperdiste hoy?', duration: 90 },
    { text: 'Cada llamada perdida\nes un turno que\nse va a la competencia.', highlight: 'se va a la competencia.', duration: 100 },
    { text: 'Con DIVINIA\ntus clientes reservan\na cualquier hora', highlight: 'a cualquier hora', sub: 'sin que vos atiendas el teléfono', duration: 110 },
    { text: '14 días\ngratis', sub: 'Sin tarjeta. Sin vueltas.', duration: 90 },
  ],
  stats: [
    { text: '+2hs por día', sub: 'recuperadas en promedio', duration: 90 },
    { text: '0 turnos\nperdidos', sub: 'por falta de respuesta', duration: 90 },
    { text: 'Tus clientes\nvuelven solos', sub: 'con recordatorios automáticos', duration: 90 },
    { text: 'Probalo\ngratis', sub: '14 días sin compromiso', duration: 90 },
  ],
  urgencia: [
    { text: 'Tu competencia\nya lo tiene.', duration: 80 },
    { text: 'Turnos online\n24 horas.', highlight: '24 horas.', duration: 80 },
    { text: 'Confirmaciones\npor WhatsApp\nautomáticas.', highlight: 'automáticas.', duration: 90 },
    { text: '¿Vos cuándo\nempezás?', sub: 'Escribinos por DM →', duration: 100 },
  ],
}

function AnimatedSlide({ slide, frame, fps }: { slide: TextSlide; frame: number; fps: number }) {
  const opacity = interpolate(frame, [0, 12, slide.duration - 12, slide.duration], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  })

  const scale = spring({ frame, fps, config: { damping: 20, stiffness: 120 }, from: 0.9, to: 1 })

  const lines = slide.text.split('\n')

  return (
    <AbsoluteFill
      style={{
        justifyContent: 'center',
        alignItems: 'center',
        opacity,
        transform: `scale(${scale})`,
        padding: '0 60px',
        flexDirection: 'column',
        gap: 0,
      }}
    >
      <div style={{ textAlign: 'center' }}>
        {lines.map((line, i) => {
          const isHighlight = slide.highlight && line.includes(slide.highlight.split(' ')[0])
          return (
            <div
              key={i}
              style={{
                fontFamily: 'system-ui, -apple-system, sans-serif',
                fontSize: 72,
                fontWeight: 900,
                lineHeight: 1.1,
                letterSpacing: -2,
                color: isHighlight ? COLORS.purple : COLORS.white,
                marginBottom: i < lines.length - 1 ? 4 : 0,
              }}
            >
              {line}
            </div>
          )
        })}
        {slide.sub && (
          <div
            style={{
              fontFamily: 'system-ui, sans-serif',
              fontSize: 26,
              color: COLORS.gray,
              marginTop: 20,
              fontWeight: 400,
              opacity: interpolate(frame, [20, 35], [0, 1], { extrapolateRight: 'clamp' }),
            }}
          >
            {slide.sub}
          </div>
        )}
      </div>
    </AbsoluteFill>
  )
}

export const TextAnimReel: React.FC<{ variant?: keyof typeof SLIDE_CONFIGS }> = ({
  variant = 'dolor',
}) => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  const slides = SLIDE_CONFIGS[variant] || SLIDE_CONFIGS.dolor

  let accumulated = 0
  const slideStarts = slides.map((s) => {
    const start = accumulated
    accumulated += s.duration
    return start
  })

  const glowOpacity = interpolate(frame, [0, 20], [0, 0.5], { extrapolateRight: 'clamp' })

  return (
    <AbsoluteFill style={{ background: COLORS.bg }}>
      {/* Glow */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: `radial-gradient(ellipse at center, ${COLORS.purple}22 0%, transparent 65%)`,
        opacity: glowOpacity,
      }} />

      {slides.map((slide, i) => {
        const startFrame = slideStarts[i]
        const localFrame = frame - startFrame
        if (localFrame < 0 || localFrame > slide.duration) return null
        return (
          <Sequence key={i} from={startFrame} durationInFrames={slide.duration}>
            <AnimatedSlide slide={slide} frame={localFrame} fps={fps} />
          </Sequence>
        )
      })}

      {/* DIVINIA watermark */}
      <div style={{
        position: 'absolute',
        bottom: 60,
        left: 0,
        right: 0,
        textAlign: 'center',
        fontFamily: 'system-ui',
        fontSize: 18,
        fontWeight: 700,
        letterSpacing: 4,
        color: COLORS.purple,
        opacity: 0.7,
      }}>
        DIVINIA
      </div>
    </AbsoluteFill>
  )
}
