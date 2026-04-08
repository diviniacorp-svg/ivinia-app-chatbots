'use client'

import { useEffect, useState } from 'react'

interface Props {
  compositionId: string
  frames: number
  fps: number
}

// Mapa de composición → componente lazy
const COMP_MAP: Record<string, () => Promise<{ default: React.ComponentType<Record<string, unknown>> }>> = {
  'HookReel': () => import('@/remotion/compositions/HookReel').then(m => ({ default: m.HookReel as React.ComponentType<Record<string, unknown>> })),
  'StatsReel': () => import('@/remotion/compositions/StatsReel').then(m => ({ default: m.StatsReel as React.ComponentType<Record<string, unknown>> })),
  'BeforeAfterReel': () => import('@/remotion/compositions/BeforeAfterReel').then(m => ({ default: m.BeforeAfterReel as React.ComponentType<Record<string, unknown>> })),
  'TextAnim-Dolor': () => import('@/remotion/compositions/TextAnimReel').then(m => ({ default: (props: Record<string, unknown>) => { const C = m.TextAnimReel; return <C variant="dolor" {...props} /> } })),
  'TextAnim-Stats': () => import('@/remotion/compositions/TextAnimReel').then(m => ({ default: (props: Record<string, unknown>) => { const C = m.TextAnimReel; return <C variant="stats" {...props} /> } })),
  'TextAnim-Urgencia': () => import('@/remotion/compositions/TextAnimReel').then(m => ({ default: (props: Record<string, unknown>) => { const C = m.TextAnimReel; return <C variant="urgencia" {...props} /> } })),
  'Nano-Turnero-Hook': () => import('@/remotion/compositions/NanoReel').then(m => ({ default: (props: Record<string, unknown>) => { const C = m.NanoReel; return <C videoFile="turnero-fondo-9x16.mp4" headline="¿Cuántos turnos perdiste hoy?" subtext="Tu negocio puede reservar solo, las 24hs." cta="Probalo gratis →" {...props} /> } })),
  'Nano-Turnero-CTA': () => import('@/remotion/compositions/NanoReel').then(m => ({ default: (props: Record<string, unknown>) => { const C = m.NanoReel; return <C videoFile="turnero-fondo-9x16.mp4" headline="Tu Turnero personalizado" subtext="Pago único. Setup en 48hs. Sin mensualidades." cta="Escribinos por DM →" {...props} /> } })),
  'Demo-Peluqueria': () => import('@/remotion/compositions/ProductDemoReel').then(m => ({ default: (props: Record<string, unknown>) => { const C = m.ProductDemoReel; return <C rubro="peluqueria" {...props} /> } })),
  'Demo-Clinica': () => import('@/remotion/compositions/ProductDemoReel').then(m => ({ default: (props: Record<string, unknown>) => { const C = m.ProductDemoReel; return <C rubro="clinica" {...props} /> } })),
  'Demo-Veterinaria': () => import('@/remotion/compositions/ProductDemoReel').then(m => ({ default: (props: Record<string, unknown>) => { const C = m.ProductDemoReel; return <C rubro="veterinaria" {...props} /> } })),
  'Demo-Taller': () => import('@/remotion/compositions/ProductDemoReel').then(m => ({ default: (props: Record<string, unknown>) => { const C = m.ProductDemoReel; return <C rubro="taller" {...props} /> } })),
}

export default function RemotionPreview({ compositionId, frames, fps }: Props) {
  const [PlayerComponent, setPlayerComponent] = useState<React.ComponentType<Record<string, unknown>> | null>(null)
  const [Comp, setComp] = useState<React.ComponentType<Record<string, unknown>> | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Carga el Player de Remotion
    import('@remotion/player').then(m => {
      setPlayerComponent(() => m.Player as unknown as React.ComponentType<Record<string, unknown>>)
    }).catch(err => {
      setError('No se pudo cargar el player: ' + err.message)
    })
  }, [])

  useEffect(() => {
    setComp(null)
    setError(null)
    const loader = COMP_MAP[compositionId]
    if (!loader) {
      setError(`Composición no encontrada: ${compositionId}`)
      return
    }
    loader().then(m => {
      setComp(() => m.default)
    }).catch(err => {
      setError('Error cargando composición: ' + err.message)
    })
  }, [compositionId])

  if (error) {
    return (
      <div className="w-full aspect-[9/16] bg-gray-900 border border-red-900/40 rounded-xl flex items-center justify-center p-4">
        <p className="text-xs text-red-400 text-center">{error}</p>
      </div>
    )
  }

  if (!PlayerComponent || !Comp) {
    return (
      <div className="w-full aspect-[9/16] bg-gray-900 rounded-xl flex items-center justify-center">
        <div className="text-center">
          <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <p className="text-[10px] text-gray-500">Cargando composición...</p>
        </div>
      </div>
    )
  }

  const Player = PlayerComponent as React.ComponentType<{
    component: React.ComponentType<Record<string, unknown>>
    durationInFrames: number
    fps: number
    compositionWidth: number
    compositionHeight: number
    style: React.CSSProperties
    controls: boolean
    loop: boolean
  }>

  return (
    <div className="w-full rounded-xl overflow-hidden border border-gray-700">
      <Player
        component={Comp}
        durationInFrames={frames}
        fps={fps}
        compositionWidth={1080}
        compositionHeight={1920}
        style={{ width: '100%', aspectRatio: '9/16' }}
        controls
        loop
      />
    </div>
  )
}
