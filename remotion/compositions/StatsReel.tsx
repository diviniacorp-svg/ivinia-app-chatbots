/**
 * DIVINIA — StatsReel
 * Números que cuentan solos. 18 seg / 540 frames / 30fps / 1080x1920
 */
import React from 'react'
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig, Sequence, Easing } from 'remotion'
import { crossFade, wipeTransition } from './transitions'

const C = { bg: '#09090b', purple: '#6366f1', white: '#ffffff', gray: '#71717a', grayLight: '#a1a1aa', green: '#22c55e' }
const F = 'system-ui, -apple-system, sans-serif'

const S1 = 70, S2 = 100, S3 = 100, S4 = 100, S5 = 110, T = 12

function GridBg({ frame }: { frame: number }) {
  const op = interpolate(frame, [0, 20], [0, 0.06], { extrapolateRight: 'clamp' })
  return <div style={{ position: 'absolute', inset: 0, opacity: op, backgroundImage: `linear-gradient(${C.purple} 1px, transparent 1px), linear-gradient(90deg, ${C.purple} 1px, transparent 1px)`, backgroundSize: '80px 80px', pointerEvents: 'none' }} />
}

function Glow({ frame, color = C.purple }: { frame: number; color?: string }) {
  const op = interpolate(frame, [0, 20], [0, 0.6], { extrapolateRight: 'clamp' })
  return <div style={{ position: 'absolute', inset: 0, opacity: op, background: `radial-gradient(ellipse at 50% 40%, ${color}2a 0%, transparent 60%)`, pointerEvents: 'none' }} />
}

function CountUp({ frame, from, to, start, end, fontSize = 180, prefix = '', suffix = '', color = C.purple }: { frame: number; from: number; to: number; start: number; end: number; fontSize?: number; prefix?: string; suffix?: string; color?: string }) {
  const progress = interpolate(frame, [start, end], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.exp) })
  const value = Math.round(from + (to - from) * progress)
  const op = interpolate(frame, [start, start + 10], [0, 1], { extrapolateRight: 'clamp' })
  const s = spring({ frame: frame - start, fps: 30, config: { damping: 12, stiffness: 100 }, from: 0.5, to: 1 })
  return <span style={{ fontFamily: F, fontSize, fontWeight: 900, color, opacity: op, display: 'inline-block', transform: `scale(${s})`, letterSpacing: -4 }}>{prefix}{value}{suffix}</span>
}

function Bar({ frame, start, duration, color = C.purple }: { frame: number; start: number; duration: number; color?: string }) {
  const w = interpolate(frame, [start, start + duration], [0, 100], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic) })
  return (
    <div style={{ width: '100%', height: 14, background: `${color}22`, borderRadius: 7, overflow: 'hidden', marginTop: 40 }}>
      <div style={{ width: `${w}%`, height: '100%', background: color, borderRadius: 7, boxShadow: `0 0 24px ${color}99` }} />
    </div>
  )
}

// ——— ESCENAS ———

const SceneIntro: React.FC<{ opacity: number }> = ({ opacity }) => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  const s = spring({ frame, fps, config: { damping: 12, stiffness: 100 }, from: 0.8, to: 1 })
  const op2 = interpolate(frame, [0, 15], [0, 1], { extrapolateRight: 'clamp' })
  return (
    <AbsoluteFill style={{ background: C.bg, justifyContent: 'center', alignItems: 'center', flexDirection: 'column', gap: 16, padding: '0 60px', opacity }}>
      <GridBg frame={frame} /><Glow frame={frame} />
      <div style={{ textAlign: 'center', transform: `scale(${s})`, opacity: op2 }}>
        <div style={{ fontFamily: F, fontSize: 32, color: C.grayLight, fontWeight: 400, marginBottom: 8, letterSpacing: 4, textTransform: 'uppercase' }}>Los números hablan</div>
        <div style={{ fontFamily: F, fontSize: 82, fontWeight: 900, color: C.white, lineHeight: 1.1, letterSpacing: -2 }}>Esto es lo que<br /><span style={{ color: C.purple }}>DIVINIA</span><br />hace por tu negocio</div>
      </div>
    </AbsoluteFill>
  )
}

const SceneStat1: React.FC<{ opacity: number }> = ({ opacity }) => {
  const frame = useCurrentFrame()
  const op2 = interpolate(frame, [32, 46], [0, 1], { extrapolateRight: 'clamp' })
  return (
    <AbsoluteFill style={{ background: C.bg, justifyContent: 'center', alignItems: 'center', flexDirection: 'column', padding: '0 80px', opacity }}>
      <GridBg frame={frame} /><Glow frame={frame} />
      <div style={{ textAlign: 'center', width: '100%' }}>
        <div style={{ fontFamily: F, fontSize: 26, color: C.grayLight, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 4, opacity: interpolate(frame, [0, 14], [0, 1], { extrapolateRight: 'clamp' }) }}>Recuperás</div>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: 6 }}>
          <CountUp frame={frame} from={0} to={2} start={5} end={65} fontSize={210} prefix="+" />
          <span style={{ fontFamily: F, fontSize: 90, fontWeight: 900, color: C.white, opacity: interpolate(frame, [8, 22], [0, 1], { extrapolateRight: 'clamp' }) }}>hs</span>
        </div>
        <div style={{ fontFamily: F, fontSize: 42, fontWeight: 700, color: C.white, opacity: op2 }}>libres cada día</div>
        <div style={{ fontFamily: F, fontSize: 24, color: C.gray, marginTop: 12, opacity: op2 }}>Antes las perdías atendiendo el teléfono</div>
        <Bar frame={frame} start={42} duration={50} />
      </div>
    </AbsoluteFill>
  )
}

const SceneStat2: React.FC<{ opacity: number }> = ({ opacity }) => {
  const frame = useCurrentFrame()
  const op2 = interpolate(frame, [38, 52], [0, 1], { extrapolateRight: 'clamp' })
  return (
    <AbsoluteFill style={{ background: C.bg, justifyContent: 'center', alignItems: 'center', flexDirection: 'column', padding: '0 80px', opacity }}>
      <GridBg frame={frame} /><Glow frame={frame} color={C.green} />
      <div style={{ textAlign: 'center', width: '100%' }}>
        <div style={{ fontFamily: F, fontSize: 26, color: C.grayLight, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 4, opacity: interpolate(frame, [0, 14], [0, 1], { extrapolateRight: 'clamp' }) }}>Turnos perdidos</div>
        <CountUp frame={frame} from={47} to={0} start={5} end={60} fontSize={210} color={C.green} />
        <div style={{ fontFamily: F, fontSize: 42, fontWeight: 700, color: C.white, opacity: op2 }}>por falta de respuesta</div>
        <div style={{ fontFamily: F, fontSize: 24, color: C.gray, marginTop: 12, opacity: op2 }}>El sistema responde solo, las 24hs</div>
        <Bar frame={frame} start={44} duration={50} color={C.green} />
      </div>
    </AbsoluteFill>
  )
}

const SceneStat3: React.FC<{ opacity: number }> = ({ opacity }) => {
  const frame = useCurrentFrame()
  return (
    <AbsoluteFill style={{ background: C.bg, justifyContent: 'center', alignItems: 'center', flexDirection: 'column', padding: '0 80px', opacity }}>
      <GridBg frame={frame} /><Glow frame={frame} />
      <div style={{ textAlign: 'center', width: '100%' }}>
        <div style={{ fontFamily: F, fontSize: 26, color: C.grayLight, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 4, opacity: interpolate(frame, [0, 14], [0, 1], { extrapolateRight: 'clamp' }) }}>Automatizado</div>
        <CountUp frame={frame} from={0} to={100} start={5} end={65} fontSize={210} suffix="%" />
        <div style={{ fontFamily: F, fontSize: 38, fontWeight: 700, color: C.white, opacity: interpolate(frame, [35, 50], [0, 1], { extrapolateRight: 'clamp' }) }}>sin que hagas nada</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 24 }}>
          {['Reserva online', 'Confirmación WA', 'Recordatorio', 'Gestión de cancelaciones'].map((item, i) => {
            const f = frame - (i * 8 + 42)
            return (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, justifyContent: 'center', opacity: interpolate(f, [0, 12], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }), transform: `translateX(${interpolate(f, [0, 14], [30, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic) })}px)` }}>
                <span style={{ color: C.green, fontSize: 22, fontWeight: 700 }}>✓</span>
                <span style={{ fontFamily: F, fontSize: 24, color: C.grayLight }}>{item}</span>
              </div>
            )
          })}
        </div>
      </div>
    </AbsoluteFill>
  )
}

const SceneCTA: React.FC<{ opacity: number }> = ({ opacity }) => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  const s = spring({ frame, fps, config: { damping: 10, stiffness: 100 }, from: 0.85, to: 1 })
  const pulse = 1 + interpolate(Math.sin(frame / 14), [-1, 1], [0, 0.03])
  return (
    <AbsoluteFill style={{ background: C.bg, justifyContent: 'center', alignItems: 'center', flexDirection: 'column', gap: 28, padding: '0 60px', opacity }}>
      <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse at 50% 50%, ${C.purple}33 0%, transparent 60%)` }} />
      <GridBg frame={frame} />
      <div style={{ textAlign: 'center', transform: `scale(${s})` }}>
        <div style={{ fontFamily: F, fontSize: 46, fontWeight: 900, color: C.white, lineHeight: 1.2 }}>¿Querés estos números<br />en tu negocio?</div>
      </div>
      <div style={{ background: C.purple, borderRadius: 24, padding: '22px 60px', transform: `scale(${pulse})`, boxShadow: `0 0 80px ${C.purple}66` }}>
        <div style={{ fontFamily: F, fontSize: 32, fontWeight: 900, color: C.white }}>Probalo 14 días gratis</div>
      </div>
      <div style={{ fontFamily: F, fontSize: 22, color: C.gray }}>Sin tarjeta · Sin compromiso · 48hs de setup</div>
      <div style={{ fontFamily: F, fontSize: 18, color: `${C.gray}88` }}>@autom_atia · divinia.vercel.app</div>
    </AbsoluteFill>
  )
}

export const StatsReel: React.FC = () => {
  const frame = useCurrentFrame()
  const t1 = S1 - T, s2 = S1, t2 = s2 + S2 - T, s3 = s2 + S2, t3 = s3 + S3 - T, s4 = s3 + S3, t4 = s4 + S4 - T, s5 = s4 + S4

  const { opacityA: o1a, opacityB: o2a } = crossFade(frame, t1, T)
  const { progress: wp1 } = wipeTransition(frame, t2, T)
  const { progress: wp2 } = wipeTransition(frame, t3, T)
  const { opacityA: o4a, opacityB: o5a } = crossFade(frame, t4, T)

  const o1 = frame < t1 ? 1 : o1a
  const o2 = frame < s2 ? 0 : frame < t2 ? 1 : 1 - wp1
  const o3 = frame < s3 ? 0 : frame < t3 ? 1 : 1 - wp2
  const o4 = frame < s4 ? 0 : frame < t4 ? 1 : o4a
  const o5 = frame < s5 ? 0 : o5a

  return (
    <AbsoluteFill style={{ background: C.bg }}>
      {o1 > 0 && <Sequence from={0} durationInFrames={S1 + T}><SceneIntro opacity={o1} /></Sequence>}
      {o2 > 0 && <Sequence from={s2} durationInFrames={S2 + T}><SceneStat1 opacity={o2} /></Sequence>}
      {o3 > 0 && <Sequence from={s3} durationInFrames={S3 + T}><SceneStat2 opacity={o3} /></Sequence>}
      {o4 > 0 && <Sequence from={s4} durationInFrames={S4 + T}><SceneStat3 opacity={o4} /></Sequence>}
      {o5 > 0 && <Sequence from={s5} durationInFrames={S5}><SceneCTA opacity={o5} /></Sequence>}
    </AbsoluteFill>
  )
}
