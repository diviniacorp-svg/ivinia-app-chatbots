/**
 * DIVINIA — NanoReel
 * Fondo Nanobanana (9:16) + capas de texto Turnero encima.
 */
import React from 'react'
import {
  AbsoluteFill,
  Video,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
  staticFile,
  Easing,
} from 'remotion'

const F = 'system-ui, -apple-system, sans-serif'
const C = {
  white: '#ffffff',
  indigo: '#4f46e5',
  indigoLight: '#818cf8',
  dark: 'rgba(0,0,0,0.72)',
}

export interface NanoReelProps {
  videoFile: string
  headline: string
  subtext?: string
  cta?: string
}

// ——— Logo pill arriba centrado ———
function LogoPill({ frame }: { frame: number }) {
  const op = interpolate(frame, [5, 20], [0, 1], { extrapolateRight: 'clamp' })
  const y = interpolate(frame, [5, 20], [-20, 0], { extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic) })
  return (
    <div style={{
      position: 'absolute',
      top: 64,
      left: 0, right: 0,
      display: 'flex',
      justifyContent: 'center',
      opacity: op,
      transform: `translateY(${y}px)`,
    }}>
      <div style={{
        background: 'rgba(255,255,255,0.18)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderRadius: 100,
        paddingTop: 10, paddingBottom: 10,
        paddingLeft: 28, paddingRight: 28,
        border: '1.5px solid rgba(255,255,255,0.35)',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
      }}>
        <span style={{ fontFamily: F, fontSize: 28, fontWeight: 900, color: C.white, letterSpacing: 0.5 }}>
          Turnero
        </span>
        <span style={{ width: 1, height: 18, background: 'rgba(255,255,255,0.3)' }} />
        <span style={{ fontFamily: F, fontSize: 14, color: 'rgba(255,255,255,0.65)', letterSpacing: 1 }}>
          by DIVINIA
        </span>
      </div>
    </div>
  )
}

// ——— Headline: cada palabra aparece con spring ———
function AnimHeadline({ text, frame, fps }: { text: string; frame: number; fps: number }) {
  const words = text.split(' ')
  return (
    <div style={{
      display: 'flex',
      flexWrap: 'wrap',
      justifyContent: 'center',
      alignItems: 'center',
      gap: 16,           // gap generoso entre palabras
      rowGap: 8,
      padding: '0 48px',
      textAlign: 'center',
    }}>
      {words.map((word, i) => {
        const wf = frame - i * 6
        const s = spring({ frame: wf, fps, config: { damping: 9, stiffness: 160 }, from: 0.6, to: 1 })
        const op = interpolate(wf, [0, 10], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
        return (
          <span key={i} style={{
            display: 'inline-block',
            fontFamily: F,
            fontSize: 88,
            fontWeight: 900,
            color: C.white,
            lineHeight: 1.05,
            letterSpacing: -1,
            transform: `scale(${s})`,
            opacity: op,
            textShadow: '0 3px 24px rgba(0,0,0,0.7), 0 1px 4px rgba(0,0,0,0.9)',
          }}>
            {word}
          </span>
        )
      })}
    </div>
  )
}

// ——— Subtítulo ———
function Subtext({ text, frame }: { text: string; frame: number }) {
  const op = interpolate(frame, [0, 18], [0, 1], { extrapolateRight: 'clamp' })
  const y = interpolate(frame, [0, 18], [14, 0], { extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic) })
  return (
    <div style={{
      fontFamily: F,
      fontSize: 32,
      fontWeight: 500,
      color: 'rgba(255,255,255,0.88)',
      textAlign: 'center',
      padding: '0 64px',
      lineHeight: 1.4,
      opacity: op,
      transform: `translateY(${y}px)`,
      textShadow: '0 2px 12px rgba(0,0,0,0.7)',
    }}>
      {text}
    </div>
  )
}

// ——— Botón CTA inferior ———
function CTAButton({ text, frame, fps }: { text: string; frame: number; fps: number }) {
  const s = spring({ frame, fps, config: { damping: 10, stiffness: 130 }, from: 0.75, to: 1 })
  const op = interpolate(frame, [0, 12], [0, 1], { extrapolateRight: 'clamp' })
  const pulse = 1 + interpolate(Math.sin(frame / 16), [-1, 1], [0, 0.028])
  return (
    <div style={{
      opacity: op,
      transform: `scale(${s * pulse})`,
      background: C.indigo,
      borderRadius: 32,
      paddingTop: 22, paddingBottom: 22,
      paddingLeft: 72, paddingRight: 72,
      boxShadow: `0 8px 48px ${C.indigo}99`,
    }}>
      <span style={{ fontFamily: F, fontSize: 32, fontWeight: 900, color: C.white }}>
        {text}
      </span>
    </div>
  )
}

// ——— Composición principal ———
export const NanoReel: React.FC<NanoReelProps> = ({
  videoFile,
  headline,
  subtext,
  cta = 'Escribinos por DM →',
}) => {
  const frame = useCurrentFrame()
  const { fps, durationInFrames } = useVideoConfig()

  const headlineStart = 18
  const subtextStart = headlineStart + headline.split(' ').length * 6 + 10
  const ctaStart = durationInFrames - 100

  return (
    <AbsoluteFill style={{ background: '#e8e8f0', overflow: 'hidden' }}>

      {/* CAPA 1 — Video Nanobanana de fondo */}
      <AbsoluteFill>
        <Video
          src={staticFile(`nanobanana/${videoFile}`)}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          loop
          muted
        />
      </AbsoluteFill>

      {/* CAPA 2 — Overlay gradiente para legibilidad del texto */}
      <AbsoluteFill style={{
        background: 'linear-gradient(to bottom, rgba(0,0,0,0.08) 0%, rgba(0,0,0,0.20) 30%, rgba(0,0,0,0.55) 60%, rgba(0,0,0,0.75) 100%)',
      }} />

      {/* CAPA 3 — Logo pill (top) */}
      <LogoPill frame={frame} />

      {/* CAPA 4 — Headline + subtext (centro) */}
      <AbsoluteFill style={{
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column',
        gap: 28,
        paddingTop: 120,   // deja espacio al logo
        paddingBottom: 160, // deja espacio al CTA
      }}>
        <AnimHeadline text={headline} frame={frame - headlineStart} fps={fps} />
        {subtext && frame > subtextStart && (
          <Subtext text={subtext} frame={frame - subtextStart} />
        )}
      </AbsoluteFill>

      {/* CAPA 5 — CTA (bottom) */}
      {frame >= ctaStart && (
        <AbsoluteFill style={{ justifyContent: 'flex-end', alignItems: 'center', paddingBottom: 96 }}>
          <CTAButton text={cta} frame={frame - ctaStart} fps={fps} />
          <div style={{
            position: 'absolute',
            bottom: 44,
            fontFamily: F,
            fontSize: 18,
            fontWeight: 500,
            color: 'rgba(255,255,255,0.5)',
            letterSpacing: 0.5,
          }}>
            @autom_atia · divinia.vercel.app
          </div>
        </AbsoluteFill>
      )}

    </AbsoluteFill>
  )
}
