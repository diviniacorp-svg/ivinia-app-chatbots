/**
 * DIVINIA — InstaReel
 * Composición genérica: video de fondo (Freepik) + texto animado estilo MTV 2016
 * 9:16 / 1080x1920 / 30fps
 *
 * Props:
 *   videoFile: nombre del archivo en public/reels/ (sin path)
 *   audioFile: nombre del archivo en public/audio/ (sin path, opcional)
 *   audioVolume: volumen del audio 0-1 (default: 0.4)
 *   showOverlay: mostrar textos encima (default: true)
 *   headline: texto principal (grande, bold, animado)
 *   subtext: texto secundario
 *   badge: texto del badge pill (ej: "Pagos", "Gestión")
 *   cta: texto del CTA (ej: "DM para empezar →")
 *   ctaColor: color del CTA pill (default: violeta)
 *   overlayStart: frame en que aparece el overlay (default: 0, útil para antes/después)
 */
import React from 'react'
import {
  AbsoluteFill, Video, Audio, interpolate, spring,
  useCurrentFrame, useVideoConfig, staticFile,
} from 'remotion'

const C = {
  bg: '#09090b',
  purple: '#8B5CF6',
  pink: '#EC4899',
  green: '#10B981',
  white: '#ffffff',
  gray: '#a1a1aa',
}
const F = 'system-ui, -apple-system, BlinkMacSystemFont, sans-serif'

// ——— Círculo decorativo (MTV-style: rota lento) ———
function DecoCircle({ frame, color, size, x, y, opacity = 0.35 }: {
  frame: number; color: string; size: number
  x: string; y: string; opacity?: number
}) {
  const rot = (frame / 8) % 360
  return (
    <div style={{
      position: 'absolute', left: x, top: y,
      width: size, height: size, borderRadius: '50%',
      background: color, opacity,
      transform: `rotate(${rot}deg)`,
      filter: 'blur(40px)',
      pointerEvents: 'none',
    }} />
  )
}

// ——— Badge pill con entrada bounce ———
function BadgePill({ text, frame, startFrame = 0, color = C.purple }: {
  text: string; frame: number; startFrame?: number; color?: string
}) {
  const { fps } = useVideoConfig()
  const lf = frame - startFrame
  const s = spring({ frame: lf, fps, config: { damping: 7, stiffness: 260 }, from: 0, to: 1 })
  const op = interpolate(lf, [0, 6], [0, 1], { extrapolateRight: 'clamp' })
  return (
    <div style={{
      display: 'inline-block',
      background: `${color}22`,
      border: `1.5px solid ${color}60`,
      borderRadius: 999,
      padding: '10px 28px',
      fontFamily: F, fontSize: 26, fontWeight: 700,
      color: color, letterSpacing: '0.04em',
      transform: `scale(${s})`, opacity: op,
    }}>
      {text}
    </div>
  )
}

// ——— Texto principal con animación letra por letra (MTV bounce) ———
function BounceText({ text, frame, startFrame = 0, fontSize = 90, color = C.white, stagger = 3 }: {
  text: string; frame: number; startFrame?: number
  fontSize?: number; color?: string; stagger?: number
}) {
  const { fps } = useVideoConfig()
  const lf = frame - startFrame
  const words = text.split(' ')
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.2em', justifyContent: 'center', fontFamily: F }}>
      {words.map((word, i) => {
        const wf = lf - i * stagger
        // Overshoot MTV: llega a 1.2 antes de asentarse en 1
        const s = spring({ frame: wf, fps, config: { damping: 6, stiffness: 300 }, from: 0, to: 1 })
        const op = interpolate(wf, [0, 5], [0, 1], { extrapolateRight: 'clamp' })
        return (
          <span key={i} style={{
            display: 'inline-block',
            fontSize, fontWeight: 900,
            color, letterSpacing: -2, lineHeight: 1.05,
            transform: `scale(${s})`,
            opacity: op,
            textShadow: `0 0 40px ${color}44`,
          }}>
            {word}
          </span>
        )
      })}
    </div>
  )
}

// ——— Subtexto ———
function SubText({ text, frame, startFrame = 20 }: { text: string; frame: number; startFrame?: number }) {
  const lf = frame - startFrame
  const op = interpolate(lf, [0, 20], [0, 1], { extrapolateRight: 'clamp' })
  const y = interpolate(lf, [0, 20], [20, 0], { extrapolateRight: 'clamp' })
  return (
    <div style={{
      fontFamily: F, fontSize: 32, color: C.gray, fontWeight: 500,
      textAlign: 'center', lineHeight: 1.4, maxWidth: 800,
      opacity: op, transform: `translateY(${y}px)`,
      paddingTop: 12,
    }}>
      {text}
    </div>
  )
}

// ——— CTA pill con pulse ———
function CTAPill({ text, frame, startFrame = 30, color = C.purple }: {
  text: string; frame: number; startFrame?: number; color?: string
}) {
  const { fps } = useVideoConfig()
  const lf = frame - startFrame
  const s = spring({ frame: lf, fps, config: { damping: 8, stiffness: 200 }, from: 0.7, to: 1 })
  const pulse = 1 + interpolate(Math.sin((frame / 15)), [-1, 1], [0, 0.03])
  const op = interpolate(lf, [0, 10], [0, 1], { extrapolateRight: 'clamp' })
  return (
    <div style={{
      background: color, borderRadius: 20, padding: '18px 52px',
      fontFamily: F, fontSize: 30, fontWeight: 800, color: C.white,
      transform: `scale(${s * pulse})`, opacity: op,
      boxShadow: `0 0 50px ${color}66`,
      letterSpacing: -0.5,
    }}>
      {text}
    </div>
  )
}

// ——— Logo Turnero ———
function TurneroLogo({ frame, startFrame = 40 }: { frame: number; startFrame?: number }) {
  const lf = frame - startFrame
  const op = interpolate(lf, [0, 15], [0, 1], { extrapolateRight: 'clamp' })
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10,
      fontFamily: F, fontSize: 24, fontWeight: 800,
      color: `${C.white}80`, opacity: op,
      letterSpacing: -0.5,
    }}>
      <span style={{ fontSize: 20 }}>◉</span>
      <span>Turnero</span>
      <span style={{ color: `${C.white}40`, fontSize: 18, fontWeight: 400 }}>by DIVINIA</span>
    </div>
  )
}

// ——— COMPOSICIÓN PRINCIPAL ———
export interface InstaReelProps {
  videoFile?: string
  audioFile?: string
  audioVolume?: number
  showOverlay?: boolean
  overlayStart?: number
  badge?: string
  headline?: string
  subtext?: string
  cta?: string
  ctaColor?: string
}

export const InstaReel: React.FC<InstaReelProps> = ({
  videoFile = '',
  audioFile = '',
  audioVolume = 0.4,
  showOverlay = true,
  overlayStart = 0,
  badge = 'Turnero',
  headline = 'Turnos online para tu negocio',
  subtext = 'Reservas 24hs · Señas por MercadoPago · Sin llamadas',
  cta = 'Escribinos →',
  ctaColor = C.purple,
}) => {
  const frame = useCurrentFrame()
  const { durationInFrames, fps } = useVideoConfig()

  // Fade out audio en los últimos 20 frames
  const audioFade = interpolate(
    frame,
    [durationInFrames - 20, durationInFrames],
    [audioVolume, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  )

  return (
    <AbsoluteFill style={{ background: C.bg, overflow: 'hidden' }}>

      {/* Audio de fondo */}
      {audioFile && (
        <Audio
          src={staticFile(`audio/${audioFile}`)}
          volume={audioFade}
          loop
        />
      )}

      {/* Video de fondo (Freepik) */}
      {videoFile && (
        <AbsoluteFill>
          <Video
            src={staticFile(`reels/${videoFile}`)}
            style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.85 }}
            muted
          />
          {/* Overlay oscuro para legibilidad del texto */}
          {showOverlay && (
            <div style={{
              position: 'absolute', inset: 0,
              background: 'linear-gradient(to bottom, #09090bcc 0%, #09090b11 35%, #09090bbb 100%)',
            }} />
          )}
        </AbsoluteFill>
      )}

      {/* Círculos decorativos — solo si hay overlay */}
      {showOverlay && (
        <>
          <DecoCircle frame={frame} color={C.purple} size={700} x="55%" y="-20%" opacity={0.25} />
          <DecoCircle frame={frame} color={C.pink} size={350} x="-15%" y="72%" opacity={0.2} />
        </>
      )}

      {/* Contenido de texto — aparece en overlayStart */}
      {showOverlay && (
        <>
          <AbsoluteFill style={{
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            padding: '0 80px', gap: 28,
          }}>
            <BadgePill text={badge} frame={frame} startFrame={overlayStart} color={C.purple} />
            <BounceText text={headline} frame={frame} startFrame={overlayStart + 8} fontSize={88} />
            <SubText text={subtext} frame={frame} startFrame={overlayStart + 22} />
            <CTAPill text={cta} frame={frame} startFrame={overlayStart + 36} color={ctaColor} />
          </AbsoluteFill>

          {/* Logo abajo centrado */}
          <div style={{
            position: 'absolute', bottom: 60, left: 0, right: 0,
            display: 'flex', justifyContent: 'center',
          }}>
            <TurneroLogo frame={frame} startFrame={overlayStart + 45} />
          </div>
        </>
      )}

    </AbsoluteFill>
  )
}
