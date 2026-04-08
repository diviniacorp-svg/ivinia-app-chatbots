/**
 * DIVINIA — Transiciones manuales para Remotion
 * Evita bugs de @remotion/transitions con ciertas configs.
 * Usa frame math puro para máximo control.
 */
import { interpolate, Easing } from 'remotion'

/** Fade entre dos escenas. Devuelve { opacityA, opacityB } */
export function crossFade(frame: number, transitionStart: number, duration: number) {
  const progress = interpolate(frame, [transitionStart, transitionStart + duration], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.inOut(Easing.quad),
  })
  return { opacityA: 1 - progress, opacityB: progress }
}

/** Slide horizontal. Devuelve translateX para cada escena (en %) */
export function slideTransition(frame: number, transitionStart: number, duration: number, direction: 'left' | 'right' = 'right') {
  const progress = interpolate(frame, [transitionStart, transitionStart + duration], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  })
  const sign = direction === 'right' ? -1 : 1
  return {
    xA: `${sign * progress * 100}%`,
    xB: `${sign * (progress - 1) * 100}%`,
  }
}

/** Wipe horizontal. Devuelve clipPath para la escena entrante */
export function wipeTransition(frame: number, transitionStart: number, duration: number) {
  const progress = interpolate(frame, [transitionStart, transitionStart + duration], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.inOut(Easing.cubic),
  })
  return {
    clipPathB: `inset(0 ${(1 - progress) * 100}% 0 0)`,
    progress,
  }
}
