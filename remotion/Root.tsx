import React from 'react'
import { Composition, registerRoot } from 'remotion'
import { HookReel } from './compositions/HookReel'
import { StatsReel } from './compositions/StatsReel'
import { BeforeAfterReel } from './compositions/BeforeAfterReel'
import { ProductDemoReel } from './compositions/ProductDemoReel'
import { TextAnimReel } from './compositions/TextAnimReel'
import { NanoReel } from './compositions/NanoReel'
import { InstaReel } from './compositions/InstaReel'
import { InstaPost } from './compositions/InstaPost'

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

    {/* ——— InstaReel — posts Instagram mes 1 ——— */}
    {/* Video de fondo va en public/reels/ · Audio en public/audio/ */}

    {/* POST 1 — "El alivio" estética: manos estresadas → manos relajadas */}
    <Composition id="Insta-Estetica-Alivio" component={InstaReel} durationInFrames={300} fps={FPS} width={W} height={H}
      defaultProps={{
        videoFile: 'estetica-alivio.mp4',
        audioFile: 'ambient-chill.mp3',
        audioVolume: 0.35,
        overlayStart: 150,
        badge: '¿Te suena esto?',
        headline: 'Tu agenda, llena sola.',
        subtext: 'Mientras vos trabajás · 24 horas · Sin WhatsApp',
        cta: 'DM → probalo gratis',
        ctaColor: '#8B5CF6',
      }}
    />

    {/* POST 2 — "La dueña libre": trabaja sin mirar el teléfono */}
    <Composition id="Insta-Duena-Libre" component={InstaReel} durationInFrames={360} fps={FPS} width={W} height={H}
      defaultProps={{
        videoFile: 'duena-libre.mp4',
        audioFile: 'ambient-chill.mp3',
        audioVolume: 0.35,
        overlayStart: 180,
        badge: 'Turnero',
        headline: 'Llegaron 3 turnos. Vos ni miraste el celular.',
        subtext: '$43.000/mes · Setup en 24hs · Sin permanencia',
        cta: 'Escribinos →',
        ctaColor: '#8B5CF6',
      }}
    />

    {/* POST 3 — "El antes": hook puro, sin overlay de texto */}
    <Composition id="Insta-Hook-Antes" component={InstaReel} durationInFrames={240} fps={FPS} width={W} height={H}
      defaultProps={{
        videoFile: 'hook-antes.mp4',
        audioFile: 'ambient-chill.mp3',
        audioVolume: 0.2,
        showOverlay: false,
      }}
    />

    {/* Composiciones originales mes 1 — activar cuando lleguen los clips */}
    <Composition id="Insta-Post4-Demo" component={InstaReel} durationInFrames={240} fps={FPS} width={W} height={H}
      defaultProps={{ videoFile: 'post4-demo-reserva.mp4', badge: 'Demo real', headline: 'Reservá en 30 segundos', subtext: 'Sin llamar. Sin WhatsApp. Sin esperar.', cta: 'DM para tu demo →' }}
    />
    <Composition id="Insta-Post7-Toggle" component={InstaReel} durationInFrames={240} fps={FPS} width={W} height={H}
      defaultProps={{ videoFile: 'post7-toggle.mp4', badge: 'La diferencia', headline: 'Estrés OFF. Turnero ON.', subtext: 'Tus clientes reservan solos las 24hs.', cta: 'Escribinos hoy →' }}
    />
    <Composition id="Insta-Post13-Rubros" component={InstaReel} durationInFrames={240} fps={FPS} width={W} height={H}
      defaultProps={{ videoFile: 'post13-rubros.mp4', badge: '¿Para quién?', headline: 'Si tenés agenda, es para vos', subtext: '✂️ 💅 🦷 🐾 💪 🧘 🔧 📸 y más', cta: 'Comentá tu rubro →' }}
    />
    <Composition id="Insta-Post15-CTA" component={InstaReel} durationInFrames={240} fps={FPS} width={W} height={H}
      defaultProps={{ videoFile: 'post15-mockup-giro.mp4', badge: 'Mes 1 cerrado', headline: 'Tu turno', subtext: '$43.000/mes · Setup 24hs · Sin permanencia', cta: 'Escribinos ahora →', ctaColor: '#EC4899' }}
    />

    {/* ——— InstaPost — imágenes estáticas 1:1 ——— */}
    <Composition id="Post-Llegamos" component={InstaPost} durationInFrames={1} fps={FPS} width={1080} height={1080}
      defaultProps={{ headline: '¡Llegamos!\na San Luis.', sub: 'El Turnero IA que tu negocio estaba esperando.', badge: 'Novedad', accent: 'lime', dark: true }}
    />
    <Composition id="Post-Precio" component={InstaPost} durationInFrames={1} fps={FPS} width={1080} height={1080}
      defaultProps={{ headline: '$45.000\npor mes.', sub: 'Setup en 48hs · Sin permanencia · Turnos 24hs automáticos', badge: 'Precio', accent: 'lime', dark: true }}
    />
    {/* ——— InstaPost-Gen — composición genérica para render con props dinámicos ——— */}
    <Composition id="InstaPost-Gen" component={InstaPost} durationInFrames={1} fps={FPS} width={1080} height={1080}
      defaultProps={{ headline: 'DIVINIA', sub: '', badge: 'IA', accent: 'lime', dark: true }}
    />

    {/* ——— ProductDemo — 4 rubros ——— */}
    <Composition id="Demo-Peluqueria" component={ProductDemoReel} durationInFrames={270} fps={FPS} width={W} height={H} defaultProps={{ rubro: 'peluqueria' }} />
    <Composition id="Demo-Clinica" component={ProductDemoReel} durationInFrames={270} fps={FPS} width={W} height={H} defaultProps={{ rubro: 'clinica' }} />
    <Composition id="Demo-Veterinaria" component={ProductDemoReel} durationInFrames={270} fps={FPS} width={W} height={H} defaultProps={{ rubro: 'veterinaria' }} />
    <Composition id="Demo-Taller" component={ProductDemoReel} durationInFrames={270} fps={FPS} width={W} height={H} defaultProps={{ rubro: 'taller' }} />
  </>
)

registerRoot(RemotionRoot)
