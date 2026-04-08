/**
 * DIVINIA — HookReel
 * Para el scroll en 1 segundo. Pregunta → Dolor → Solución → CTA.
 * 15 seg / 450 frames / 30fps / 1080x1920
 */
import React from 'react'
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig, Sequence, Easing } from 'remotion'
import { crossFade } from './transitions'

const C = { bg: '#09090b', purple: '#6366f1', white: '#ffffff', gray: '#a1a1aa', green: '#22c55e', red: '#ef4444' }
const F = 'system-ui, -apple-system, sans-serif'

// Duración de cada escena y transiciones
const S1 = 90, S2 = 90, S3 = 90, S4 = 100
const T = 15 // duración de transición en frames

function PulsingBg({ frame, color = C.purple }: { frame: number; color?: string }) {
  const pulse = interpolate(Math.sin(frame / 18), [-1, 1], [0.25, 0.5])
  return <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse at 50% 35%, ${color}${Math.round(pulse * 255).toString(16).padStart(2,'0')} 0%, transparent 60%)`, pointerEvents: 'none' }} />
}

function WordByWord({ text, startFrame, frame, fps, fontSize = 80, color = C.white, stagger = 6 }: { text: string; startFrame: number; frame: number; fps: number; fontSize?: number; color?: string; stagger?: number }) {
  const words = text.split(' ')
  const localFrame = frame - startFrame
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25em', justifyContent: 'center', fontFamily: F }}>
      {words.map((word, i) => {
        const wf = localFrame - i * stagger
        const s = spring({ frame: wf, fps, config: { damping: 8, stiffness: 200 }, from: 0, to: 1 })
        const op = interpolate(wf, [0, 8], [0, 1], { extrapolateRight: 'clamp' })
        return <span key={i} style={{ display: 'inline-block', fontSize, fontWeight: 900, color, transform: `scale(${s})`, opacity: op, letterSpacing: -1, lineHeight: 1.1 }}>{word}</span>
      })}
    </div>
  )
}

// ——— ESCENA 1: Hook ———
const SceneHook: React.FC<{ opacity: number }> = ({ opacity }) => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  return (
    <AbsoluteFill style={{ background: C.bg, justifyContent: 'center', alignItems: 'center', flexDirection: 'column', gap: 20, padding: '0 60px', opacity }}>
      <PulsingBg frame={frame} />
      <div style={{ textAlign: 'center' }}>
        <WordByWord text="¿Cuántos turnos perdiste hoy" startFrame={0} frame={frame} fps={fps} fontSize={86} />
        <WordByWord text="por no atender el teléfono?" startFrame={18} frame={frame} fps={fps} fontSize={52} color={C.gray} stagger={5} />
      </div>
      <div style={{ marginTop: 24, opacity: interpolate(frame, [42, 56], [0, 1], { extrapolateRight: 'clamp' }), transform: `translateY(${interpolate(frame, [42, 56], [16, 0], { extrapolateRight: 'clamp' })}px)`, background: `${C.purple}22`, border: `1px solid ${C.purple}55`, borderRadius: 16, padding: '14px 28px', fontFamily: F, fontSize: 24, color: C.gray, textAlign: 'center' }}>
        📊 En Argentina: <strong style={{ color: C.white }}>+3 llamadas perdidas promedio por día</strong>
      </div>
    </AbsoluteFill>
  )
}

// ——— ESCENA 2: Dolor ———
const SceneDolor: React.FC<{ opacity: number }> = ({ opacity }) => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  const items = [
    { icon: '📞', text: 'Llamadas que no podés atender', color: C.red },
    { icon: '📋', text: 'Agenda de papel que se pierde', color: C.red },
    { icon: '😤', text: 'Clientes que van a la competencia', color: C.red },
  ]
  return (
    <AbsoluteFill style={{ background: C.bg, justifyContent: 'center', alignItems: 'center', flexDirection: 'column', padding: '0 56px', gap: 20, opacity }}>
      <PulsingBg frame={frame} color={C.red} />
      <WordByWord text="Así se ve un negocio sin turnos online" startFrame={0} frame={frame} fps={fps} fontSize={50} stagger={4} />
      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 18, marginTop: 12 }}>
        {items.map((item, i) => {
          const f = frame - (i * 14 + 22)
          const x = interpolate(f, [0, 20], [-90, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.back(1.3)) })
          const op = interpolate(f, [0, 14], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
          return (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 18, background: `${C.red}11`, border: `1px solid ${C.red}44`, borderRadius: 18, padding: '20px 24px', transform: `translateX(${x}px)`, opacity: op }}>
              <span style={{ fontSize: 38 }}>{item.icon}</span>
              <span style={{ fontFamily: F, fontSize: 28, color: C.white, fontWeight: 600, flex: 1 }}>{item.text}</span>
              <span style={{ color: C.red, fontSize: 26 }}>✕</span>
            </div>
          )
        })}
      </div>
    </AbsoluteFill>
  )
}

// ——— ESCENA 3: Solución ———
const SceneSolucion: React.FC<{ opacity: number }> = ({ opacity }) => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  const items = [
    { icon: '📱', text: 'Reservas online las 24hs' },
    { icon: '💬', text: 'Confirmación automática por WA' },
    { icon: '🔔', text: 'Recordatorio que evita ausencias' },
  ]
  return (
    <AbsoluteFill style={{ background: C.bg, justifyContent: 'center', alignItems: 'center', flexDirection: 'column', padding: '0 56px', gap: 20, opacity }}>
      <PulsingBg frame={frame} color={C.green} />
      <WordByWord text="Con DIVINIA tu negocio trabaja solo" startFrame={0} frame={frame} fps={fps} fontSize={52} stagger={4} />
      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 18, marginTop: 12 }}>
        {items.map((item, i) => {
          const s = spring({ frame: frame - (i * 12 + 24), fps, config: { damping: 10, stiffness: 160 }, from: 0.75, to: 1 })
          const op = interpolate(frame - (i * 12 + 24), [0, 12], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
          return (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 18, background: `${C.green}11`, border: `1px solid ${C.green}44`, borderRadius: 18, padding: '20px 24px', transform: `scale(${s})`, opacity: op }}>
              <span style={{ fontSize: 38 }}>{item.icon}</span>
              <span style={{ fontFamily: F, fontSize: 28, color: C.white, fontWeight: 600, flex: 1 }}>{item.text}</span>
              <span style={{ color: C.green, fontSize: 26 }}>✓</span>
            </div>
          )
        })}
      </div>
    </AbsoluteFill>
  )
}

// ——— ESCENA 4: CTA ———
const SceneCTA: React.FC<{ opacity: number }> = ({ opacity }) => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  const s = spring({ frame, fps, config: { damping: 10, stiffness: 120 }, from: 0.8, to: 1 })
  const pulse = 1 + interpolate(Math.sin(frame / 12), [-1, 1], [0, 0.035])
  return (
    <AbsoluteFill style={{ background: C.bg, justifyContent: 'center', alignItems: 'center', flexDirection: 'column', gap: 32, padding: '0 60px', opacity }}>
      <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse at 50% 50%, ${C.purple}44 0%, transparent 60%)` }} />
      <div style={{ textAlign: 'center', transform: `scale(${s})` }}>
        <div style={{ fontFamily: F, fontSize: 108, fontWeight: 900, color: C.white, letterSpacing: -4, lineHeight: 1 }}>14 días</div>
        <div style={{ fontFamily: F, fontSize: 108, fontWeight: 900, color: C.purple, letterSpacing: -4, lineHeight: 1 }}>gratis</div>
        <div style={{ fontFamily: F, fontSize: 28, color: C.gray, marginTop: 12 }}>Sin tarjeta. Sin compromiso.</div>
      </div>
      <div style={{ background: C.purple, borderRadius: 24, padding: '20px 56px', transform: `scale(${pulse})`, boxShadow: `0 0 60px ${C.purple}88` }}>
        <div style={{ fontFamily: F, fontSize: 30, fontWeight: 900, color: C.white }}>Escribinos por DM →</div>
      </div>
      <div style={{ fontFamily: F, fontSize: 20, color: `${C.gray}99` }}>@autom_atia · divinia.vercel.app</div>
    </AbsoluteFill>
  )
}

// ——— COMPOSICIÓN PRINCIPAL ———
export const HookReel: React.FC = () => {
  const frame = useCurrentFrame()

  // Puntos de inicio de cada transición
  const t1Start = S1 - T
  const s2Start = S1
  const t2Start = s2Start + S2 - T
  const s3Start = s2Start + S2
  const t3Start = s3Start + S3 - T
  const s4Start = s3Start + S3

  const { opacityA: op1, opacityB: op2a } = crossFade(frame, t1Start, T)
  const { opacityA: op2b, opacityB: op3a } = crossFade(frame, t2Start, T)
  const { opacityA: op3b, opacityB: op4 } = crossFade(frame, t3Start, T)

  // Opacidad final de cada escena (combinando fade out y fade in)
  const o1 = frame < t1Start ? 1 : op1
  const o2 = frame < s2Start ? 0 : frame < t2Start ? 1 : op2a * op2b
  const o3 = frame < s3Start ? 0 : frame < t3Start ? 1 : op3a * op3b
  const o4 = frame < s4Start ? 0 : op4

  return (
    <AbsoluteFill style={{ background: C.bg }}>
      {o1 > 0 && <Sequence from={0} durationInFrames={S1 + T}><SceneHook opacity={o1} /></Sequence>}
      {o2 > 0 && <Sequence from={s2Start} durationInFrames={S2 + T}><SceneDolor opacity={o2} /></Sequence>}
      {o3 > 0 && <Sequence from={s3Start} durationInFrames={S3 + T}><SceneSolucion opacity={o3} /></Sequence>}
      {o4 > 0 && <Sequence from={s4Start} durationInFrames={S4}><SceneCTA opacity={o4} /></Sequence>}
    </AbsoluteFill>
  )
}
