import React from 'react'
import { Composition, registerRoot } from 'remotion'
import { HookReel } from './compositions/HookReel'
import { StatsReel } from './compositions/StatsReel'
import { BeforeAfterReel } from './compositions/BeforeAfterReel'
import { ProductDemoReel } from './compositions/ProductDemoReel'
import { TextAnimReel } from './compositions/TextAnimReel'
import { NanoReel } from './compositions/NanoReel'

const W = 1080, H = 1920, FPS = 30

export const RemotionRoot: React.FC = () => (
  <>
    {/* ——— Reels de texto / hook ——— */}
    <Composition id="HookReel" component={HookReel} durationInFrames={370} fps={FPS} width={W} height={H} />
    <Composition id="StatsReel" component={StatsReel} durationInFrames={510} fps={FPS} width={W} height={H} />
    <Composition id="BeforeAfterReel" component={BeforeAfterReel} durationInFrames={464} fps={FPS} width={W} height={H} />

    {/* ——— TextAnim — 3 variantes ——— */}
    <Composition id="TextAnim-Dolor" component={TextAnimReel} durationInFrames={390} fps={FPS} width={W} height={H} defaultProps={{ variant: 'dolor' }} />
    <Composition id="TextAnim-Stats" component={TextAnimReel} durationInFrames={360} fps={FPS} width={W} height={H} defaultProps={{ variant: 'stats' }} />
    <Composition id="TextAnim-Urgencia" component={TextAnimReel} durationInFrames={350} fps={FPS} width={W} height={H} defaultProps={{ variant: 'urgencia' }} />

    {/* ——— NanoReel — fondo Nanobanana + texto Remotion ——— */}
    <Composition id="Nano-Turnero-Hook" component={NanoReel} durationInFrames={450} fps={FPS} width={W} height={H}
      defaultProps={{ videoFile: 'turnero-fondo-9x16.mp4', headline: '¿Cuántos turnos perdiste hoy?', subtext: 'Tu negocio puede reservar solo, las 24hs.', cta: 'Probalo gratis →' }}
    />
    <Composition id="Nano-Turnero-CTA" component={NanoReel} durationInFrames={300} fps={FPS} width={W} height={H}
      defaultProps={{ videoFile: 'turnero-fondo-9x16.mp4', headline: 'Tu Turnero personalizado', subtext: 'Pago único. Setup en 48hs. Sin mensualidades.', cta: 'Escribinos por DM →' }}
    />

    {/* ——— ProductDemo — 4 rubros ——— */}
    <Composition id="Demo-Peluqueria" component={ProductDemoReel} durationInFrames={270} fps={FPS} width={W} height={H} defaultProps={{ rubro: 'peluqueria' }} />
    <Composition id="Demo-Clinica" component={ProductDemoReel} durationInFrames={270} fps={FPS} width={W} height={H} defaultProps={{ rubro: 'clinica' }} />
    <Composition id="Demo-Veterinaria" component={ProductDemoReel} durationInFrames={270} fps={FPS} width={W} height={H} defaultProps={{ rubro: 'veterinaria' }} />
    <Composition id="Demo-Taller" component={ProductDemoReel} durationInFrames={270} fps={FPS} width={W} height={H} defaultProps={{ rubro: 'taller' }} />
  </>
)

registerRoot(RemotionRoot)
