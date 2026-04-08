/**
 * DIVINIA — BeforeAfterReel
 * Antes vs Después sin mockups. 20 seg / 600 frames / 30fps / 1080x1920
 */
import React from 'react'
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig, Sequence, Easing } from 'remotion'
import { crossFade, wipeTransition } from './transitions'

const C = { bg: '#09090b', purple: '#6366f1', white: '#ffffff', gray: '#a1a1aa', red: '#ef4444', green: '#22c55e' }
const F = 'system-ui, -apple-system, sans-serif'

const S1 = 70, S2 = 130, S3 = 130, S4 = 120, T = 14

function Glow({ color, frame }: { color: string; frame: number }) {
  const op = interpolate(frame, [0, 22], [0, 0.5], { extrapolateRight: 'clamp' })
  return <div style={{ position: 'absolute', inset: 0, opacity: op, background: `radial-gradient(ellipse at 50% 30%, ${color}33 0%, transparent 58%)`, pointerEvents: 'none' }} />
}

const SceneHook: React.FC<{ opacity: number }> = ({ opacity }) => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  const s = spring({ frame, fps, config: { damping: 12, stiffness: 100 }, from: 0.75, to: 1 })
  const op2 = interpolate(frame, [0, 14], [0, 1], { extrapolateRight: 'clamp' })
  return (
    <AbsoluteFill style={{ background: C.bg, justifyContent: 'center', alignItems: 'center', flexDirection: 'column', gap: 24, padding: '0 60px', opacity }}>
      <Glow color={C.purple} frame={frame} />
      <div style={{ textAlign: 'center', transform: `scale(${s})`, opacity: op2 }}>
        <div style={{ fontFamily: F, fontSize: 44, color: C.gray, fontWeight: 400, marginBottom: 8 }}>Tu negocio</div>
        <div style={{ fontFamily: F, fontSize: 104, fontWeight: 900, color: C.white, lineHeight: 1, letterSpacing: -4 }}>Antes<br /><span style={{ color: C.purple }}>vs</span><br />Después</div>
        <div style={{ fontFamily: F, fontSize: 30, color: C.gray, marginTop: 16 }}>de tener turnos online</div>
      </div>
      <div style={{ opacity: interpolate(frame, [32, 46], [0, 1], { extrapolateRight: 'clamp' }), fontFamily: F, fontSize: 24, color: `${C.gray}88`, display: 'flex', alignItems: 'center', gap: 8 }}>
        <span>👇</span> Deslizá para ver la diferencia
      </div>
    </AbsoluteFill>
  )
}

const SceneAntes: React.FC<{ opacity: number }> = ({ opacity }) => {
  const frame = useCurrentFrame()
  const items = [
    { icon: '📞', titulo: 'Teléfono sonando todo el día', detalle: 'Interrupciones mientras trabajás' },
    { icon: '📋', titulo: 'Agenda en papel o Excel', detalle: 'Errores, turnos dobles, caos' },
    { icon: '😓', titulo: 'Clientes que "ya llaman después"', detalle: 'Y se van a la competencia' },
    { icon: '🌙', titulo: 'Sin turnos fuera de horario', detalle: 'Perdés reservas de noche y fines de semana' },
  ]
  const opHeader = interpolate(frame, [0, 14], [0, 1], { extrapolateRight: 'clamp' })
  return (
    <AbsoluteFill style={{ background: '#100808', flexDirection: 'column', padding: '56px 48px', gap: 0, opacity }}>
      <Glow color={C.red} frame={frame} />
      <div style={{ marginBottom: 28, opacity: opHeader }}>
        <div style={{ fontFamily: F, fontSize: 26, color: C.red, fontWeight: 700, letterSpacing: 3, textTransform: 'uppercase', marginBottom: 4 }}>❌ Antes</div>
        <div style={{ fontFamily: F, fontSize: 54, fontWeight: 900, color: C.white, letterSpacing: -1, lineHeight: 1.1 }}>Sin turnos online</div>
        <div style={{ fontFamily: F, fontSize: 22, color: C.gray, marginTop: 6 }}>Así se ve tu día a día</div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18, flex: 1, justifyContent: 'center' }}>
        {items.map((item, i) => {
          const f = frame - (i * 14 + 20)
          const x = interpolate(f, [0, 20], [-100, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.back(1.2)) })
          const op = interpolate(f, [0, 14], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
          return (
            <div key={i} style={{ display: 'flex', gap: 16, alignItems: 'flex-start', background: `${C.red}0e`, border: `1px solid ${C.red}33`, borderRadius: 20, padding: '18px 20px', transform: `translateX(${x}px)`, opacity: op }}>
              <span style={{ fontSize: 36, flexShrink: 0 }}>{item.icon}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: F, fontSize: 24, fontWeight: 700, color: C.white, marginBottom: 3 }}>{item.titulo}</div>
                <div style={{ fontFamily: F, fontSize: 18, color: C.gray }}>{item.detalle}</div>
              </div>
              <span style={{ color: C.red, fontSize: 24, flexShrink: 0, alignSelf: 'center' }}>✕</span>
            </div>
          )
        })}
      </div>
    </AbsoluteFill>
  )
}

const SceneDespues: React.FC<{ opacity: number; clipPath?: string }> = ({ opacity, clipPath }) => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  const items = [
    { icon: '📱', titulo: 'Reservas online las 24hs', detalle: 'Tus clientes reservan cuando quieran' },
    { icon: '💬', titulo: 'WhatsApp automático', detalle: 'Confirmación y recordatorio sin vos' },
    { icon: '📊', titulo: 'Panel de gestión claro', detalle: 'Todos tus turnos en un lugar' },
    { icon: '🌙', titulo: 'Turnos fuera de horario', detalle: 'Tu negocio trabaja mientras dormís' },
  ]
  const opHeader = interpolate(frame, [0, 14], [0, 1], { extrapolateRight: 'clamp' })
  return (
    <AbsoluteFill style={{ background: '#080f08', flexDirection: 'column', padding: '56px 48px', gap: 0, opacity, clipPath }}>
      <Glow color={C.green} frame={frame} />
      <div style={{ marginBottom: 28, opacity: opHeader }}>
        <div style={{ fontFamily: F, fontSize: 26, color: C.green, fontWeight: 700, letterSpacing: 3, textTransform: 'uppercase', marginBottom: 4 }}>✓ Después</div>
        <div style={{ fontFamily: F, fontSize: 54, fontWeight: 900, color: C.white, letterSpacing: -1, lineHeight: 1.1 }}>Con DIVINIA</div>
        <div style={{ fontFamily: F, fontSize: 22, color: C.gray, marginTop: 6 }}>Tu negocio en modo automático</div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18, flex: 1, justifyContent: 'center' }}>
        {items.map((item, i) => {
          const s = spring({ frame: frame - (i * 12 + 18), fps, config: { damping: 10, stiffness: 150 }, from: 0.8, to: 1 })
          const op = interpolate(frame - (i * 12 + 18), [0, 12], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
          return (
            <div key={i} style={{ display: 'flex', gap: 16, alignItems: 'flex-start', background: `${C.green}0e`, border: `1px solid ${C.green}33`, borderRadius: 20, padding: '18px 20px', transform: `scale(${s})`, opacity: op }}>
              <span style={{ fontSize: 36, flexShrink: 0 }}>{item.icon}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: F, fontSize: 24, fontWeight: 700, color: C.white, marginBottom: 3 }}>{item.titulo}</div>
                <div style={{ fontFamily: F, fontSize: 18, color: C.gray }}>{item.detalle}</div>
              </div>
              <span style={{ color: C.green, fontSize: 24, flexShrink: 0, alignSelf: 'center' }}>✓</span>
            </div>
          )
        })}
      </div>
    </AbsoluteFill>
  )
}

const SceneComparacion: React.FC<{ opacity: number }> = ({ opacity }) => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  const s = spring({ frame, fps, config: { damping: 14, stiffness: 120 }, from: 0.9, to: 1 })
  const pairs = [
    { antes: 'Teléfono todo el día', despues: 'Cero interrupciones' },
    { antes: 'Agenda en papel', despues: 'Sistema digital' },
    { antes: 'Clientes perdidos', despues: 'Clientes que vuelven' },
    { antes: 'Solo en horario', despues: '24hs automático' },
  ]
  const ctaOp = interpolate(frame, [58, 72], [0, 1], { extrapolateRight: 'clamp' })
  const pulse = 1 + interpolate(Math.sin(frame / 14), [-1, 1], [0, 0.03])
  return (
    <AbsoluteFill style={{ background: C.bg, flexDirection: 'column', justifyContent: 'center', padding: '0 36px', gap: 16, opacity }}>
      <Glow color={C.purple} frame={frame} />
      <div style={{ textAlign: 'center', marginBottom: 8, transform: `scale(${s})` }}>
        <div style={{ fontFamily: F, fontSize: 50, fontWeight: 900, color: C.white, letterSpacing: -1 }}>La diferencia es clara</div>
      </div>
      <div style={{ display: 'flex', gap: 10, marginBottom: 4 }}>
        <div style={{ flex: 1, textAlign: 'center', fontFamily: F, fontSize: 18, color: C.red, fontWeight: 700, letterSpacing: 1 }}>SIN DIVINIA</div>
        <div style={{ width: 2, background: '#333' }} />
        <div style={{ flex: 1, textAlign: 'center', fontFamily: F, fontSize: 18, color: C.green, fontWeight: 700, letterSpacing: 1 }}>CON DIVINIA</div>
      </div>
      {pairs.map((pair, i) => {
        const f = frame - (i * 14 + 14)
        const op = interpolate(f, [0, 12], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
        const y = interpolate(f, [0, 14], [18, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic) })
        return (
          <div key={i} style={{ display: 'flex', gap: 10, opacity: op, transform: `translateY(${y}px)` }}>
            <div style={{ flex: 1, background: `${C.red}0d`, border: `1px solid ${C.red}22`, borderRadius: 14, padding: '16px 14px', textAlign: 'center', fontFamily: F, fontSize: 20, color: C.gray }}>{pair.antes}</div>
            <div style={{ width: 2, background: '#333', flexShrink: 0 }} />
            <div style={{ flex: 1, background: `${C.green}0d`, border: `1px solid ${C.green}22`, borderRadius: 14, padding: '16px 14px', textAlign: 'center', fontFamily: F, fontSize: 20, color: C.white, fontWeight: 600 }}>{pair.despues}</div>
          </div>
        )
      })}
      <div style={{ opacity: ctaOp, transform: `scale(${pulse})`, background: C.purple, borderRadius: 20, padding: '20px 0', textAlign: 'center', fontFamily: F, fontSize: 28, fontWeight: 900, color: C.white, boxShadow: `0 0 40px ${C.purple}66`, marginTop: 8 }}>
        Probalo gratis 14 días →
      </div>
    </AbsoluteFill>
  )
}

export const BeforeAfterReel: React.FC = () => {
  const frame = useCurrentFrame()

  const t1 = S1 - T, s2 = S1
  const t2 = s2 + S2 - T, s3 = s2 + S2
  const t3 = s3 + S3 - T, s4 = s3 + S3

  const { opacityA: o1a, opacityB: o2a } = crossFade(frame, t1, T)
  const { clipPathB } = wipeTransition(frame, t2, T)
  const { opacityA: o3a, opacityB: o4a } = crossFade(frame, t3, T)

  const o1 = frame < t1 ? 1 : o1a
  const o2 = frame < s2 ? 0 : o2a
  const o3 = frame < s3 ? 0 : frame < t3 ? 1 : o3a
  const o4 = frame < s4 ? 0 : o4a

  return (
    <AbsoluteFill style={{ background: C.bg }}>
      {o1 > 0 && <Sequence from={0} durationInFrames={S1 + T}><SceneHook opacity={o1} /></Sequence>}
      {o2 > 0 && <Sequence from={s2} durationInFrames={S2 + T}><SceneAntes opacity={o2} /></Sequence>}
      {frame >= s3 && <Sequence from={s3} durationInFrames={S3 + T}><SceneDespues opacity={1} clipPath={frame < s3 + T ? clipPathB : undefined} /></Sequence>}
      {o4 > 0 && <Sequence from={s4} durationInFrames={S4}><SceneComparacion opacity={o4} /></Sequence>}
    </AbsoluteFill>
  )
}
