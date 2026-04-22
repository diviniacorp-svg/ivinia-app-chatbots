'use client'

import { useState, useEffect } from 'react'

const BUBBLES = Array.from({ length: 12 }, (_, i) => ({
  size: 14 + ((i * 37) % 28),
  left: 4 + ((i * 73) % 88),
  delay: (i * 0.35) % 2.8,
  duration: 3.5 + ((i * 19) % 2.5),
  opacity: 0.55 + ((i * 7) % 30) / 100,
}))

const SPARKLES = ['✨', '💫', '⭐', '🌟', '✦', '✧']
const SPARKLE_POS = Array.from({ length: 10 }, (_, i) => ({
  top: 5 + ((i * 53) % 80),
  left: 3 + ((i * 71) % 90),
  delay: (i * 0.4) % 3,
  size: 12 + ((i * 13) % 16),
}))

type IntroStyle = 'bubbles' | 'sparkles' | 'petals' | 'waves'

// Mapping from introAnimation name → CSS keyframes definition
const INTRO_KEYFRAMES: Record<string, string> = {
  'intro-scissors': `
    @keyframes intro-scissors {
      0%, 100% { transform: rotate(-25deg) scale(1); }
      50% { transform: rotate(25deg) scale(1.1); }
    }
  `,
  'intro-bounce': `
    @keyframes intro-bounce {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-40px); }
    }
  `,
  'intro-spin-scale': `
    @keyframes intro-spin-scale {
      0% { transform: rotate(0deg) scale(1); }
      50% { transform: rotate(180deg) scale(1.15); }
      100% { transform: rotate(360deg) scale(1); }
    }
  `,
  'intro-pulse': `
    @keyframes intro-pulse {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.25); }
    }
  `,
  'intro-sway': `
    @keyframes intro-sway {
      0%, 100% { transform: translateX(0) rotate(-8deg); }
      50% { transform: translateX(20px) rotate(8deg); }
    }
  `,
  'intro-lift': `
    @keyframes intro-lift {
      0%, 100% { transform: translateY(0) scaleX(1); }
      50% { transform: translateY(-30px) scaleX(1.08); }
    }
  `,
  'intro-shine': `
    @keyframes intro-shine {
      0%, 100% { opacity: 1; filter: brightness(1); transform: scale(1); }
      50% { opacity: 1; filter: brightness(1.6) drop-shadow(0 0 16px #fff); transform: scale(1.2); }
    }
  `,
  'intro-sparkle': `
    @keyframes intro-sparkle {
      0%, 100% { transform: scale(1) rotate(0deg); opacity: 1; }
      25% { transform: scale(1.3) rotate(-10deg); opacity: 0.8; }
      75% { transform: scale(1.2) rotate(10deg); opacity: 0.9; }
    }
  `,
  'intro-balance': `
    @keyframes intro-balance {
      0%, 100% { transform: rotate(-12deg); }
      50% { transform: rotate(12deg); }
    }
  `,
  'intro-grow': `
    @keyframes intro-grow {
      0% { transform: scaleY(0.6) translateY(8px); }
      50% { transform: scaleY(1.1) translateY(-4px); }
      100% { transform: scaleY(0.6) translateY(8px); }
    }
  `,
  'intro-orbit': `
    @keyframes intro-orbit {
      0% { transform: rotate(0deg) translateX(8px) rotate(0deg); }
      100% { transform: rotate(360deg) translateX(8px) rotate(-360deg); }
    }
  `,
}

// Duration per animation (seconds)
const INTRO_DURATIONS: Record<string, string> = {
  'intro-scissors': '1.2s',
  'intro-bounce': '1s',
  'intro-spin-scale': '2.4s',
  'intro-pulse': '1.4s',
  'intro-sway': '1.6s',
  'intro-lift': '1.2s',
  'intro-shine': '1.8s',
  'intro-sparkle': '1.5s',
  'intro-balance': '2s',
  'intro-grow': '1.4s',
  'intro-orbit': '3s',
}

export default function SplashIntro({
  companyName,
  tagline,
  color,
  emoji,
  style: introStyle = 'bubbles',
  onDone,
  introAnimation,
}: {
  companyName: string
  tagline: string
  color: string
  emoji: string
  style?: IntroStyle | string
  onDone: () => void
  introAnimation?: string
}) {
  const [fading, setFading] = useState(false)

  // Soporte multi-emoji: "✂️,💇‍♀️,💈" → ['✂️', '💇‍♀️', '💈']
  const emojis = emoji.split(',').map(e => e.trim()).filter(Boolean)
  const mainEmoji = emojis[0] || '📅'

  function close() {
    if (fading) return
    setFading(true)
    setTimeout(onDone, 750)
  }

  useEffect(() => {
    const t = setTimeout(close, 4000)
    return () => clearTimeout(t)
  }, [])

  // Determine animation to use for central icon
  const animName = introAnimation || 'intro-pulse'
  const animKeyframes = INTRO_KEYFRAMES[animName] || INTRO_KEYFRAMES['intro-pulse']
  const animDuration = INTRO_DURATIONS[animName] || '1.4s'

  return (
    <>
      <style>{`
        @keyframes bubble-rise {
          0%   { transform: translateY(0) scale(1); opacity: var(--op); }
          80%  { opacity: var(--op); }
          100% { transform: translateY(-110vh) scale(0.7); opacity: 0; }
        }
        @keyframes sparkle-float {
          0%, 100% { transform: translateY(0) rotate(0deg); opacity: var(--op); }
          50%       { transform: translateY(-18px) rotate(15deg); opacity: calc(var(--op) * 1.6); }
        }
        @keyframes splash-name {
          0%   { opacity: 0; transform: translateY(24px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes splash-sub {
          0%   { opacity: 0; }
          100% { opacity: 0.82; }
        }
        @keyframes splash-hint {
          0%, 100% { opacity: 0.35; }
          50%       { opacity: 0.85; }
        }
        @keyframes fade-out-splash {
          to { opacity: 0; visibility: hidden; }
        }
        .splash-fade-out {
          animation: fade-out-splash 0.75s ease forwards;
        }
        ${animKeyframes}
      `}</style>

      <div
        onClick={close}
        className={`fixed inset-0 z-50 flex flex-col items-center justify-center cursor-pointer overflow-hidden select-none ${fading ? 'splash-fade-out' : ''}`}
        style={{
          background: `linear-gradient(150deg, color-mix(in srgb, ${color} 55%, #000) 0%, ${color} 55%, color-mix(in srgb, ${color} 75%, #fff) 100%)`,
        }}
      >
        {/* Partículas de fondo — siempre usa los emojis del negocio */}
        {(introStyle === 'bubbles' || introStyle === 'waves') && BUBBLES.map((b, i) => (
          <div
            key={i}
            className="absolute pointer-events-none leading-none"
            style={{
              fontSize: b.size,
              left: `${b.left}%`,
              bottom: '-60px',
              ['--op' as string]: b.opacity,
              animation: `bubble-rise ${b.duration}s ${b.delay}s ease-in infinite`,
            }}
          >
            {emojis[i % emojis.length] || mainEmoji}
          </div>
        ))}

        {introStyle === 'sparkles' && SPARKLE_POS.map((s, i) => (
          <div
            key={i}
            className="absolute pointer-events-none"
            style={{
              top: `${s.top}%`,
              left: `${s.left}%`,
              fontSize: s.size,
              ['--op' as string]: 0.5,
              animation: `sparkle-float ${2.5 + s.delay}s ${s.delay}s ease-in-out infinite`,
            }}
          >
            {i % 2 === 0 ? (emojis[Math.floor(i / 2) % emojis.length] || SPARKLES[i % SPARKLES.length]) : SPARKLES[i % SPARKLES.length]}
          </div>
        ))}

        {introStyle === 'petals' && SPARKLE_POS.map((s, i) => (
          <div
            key={i}
            className="absolute pointer-events-none"
            style={{
              top: `${s.top}%`,
              left: `${s.left}%`,
              fontSize: s.size + 4,
              ['--op' as string]: 0.45,
              animation: `sparkle-float ${3 + s.delay}s ${s.delay}s ease-in-out infinite`,
            }}
          >
            {emojis.length > 1 ? emojis[i % emojis.length] : '🌸'}
          </div>
        ))}

        {/* Emoji central con animación específica del rubro */}
        <div
          className="text-8xl filter drop-shadow-2xl mb-6"
          style={{
            animation: `${animName} ${animDuration} ease-in-out infinite`,
          }}
        >
          {mainEmoji}
        </div>

        {/* Nombre del negocio */}
        <h1
          className="text-white font-black text-center px-8 tracking-widest uppercase"
          style={{
            fontSize: 'clamp(1.6rem, 6vw, 2.8rem)',
            animation: 'splash-name 0.8s 0.3s ease both',
            textShadow: '0 2px 20px rgba(0,0,0,0.3)',
          }}
        >
          {companyName}
        </h1>

        {tagline && (
          <p
            className="text-white/80 text-center mt-3 px-10 tracking-widest uppercase"
            style={{
              fontSize: 'clamp(0.75rem, 2.5vw, 0.95rem)',
              animation: 'splash-sub 0.9s 0.8s ease both',
            }}
          >
            {tagline}
          </p>
        )}

        <p
          className="absolute bottom-10 text-white/60 text-xs tracking-widest uppercase"
          style={{ animation: 'splash-hint 2s 2s ease-in-out infinite' }}
        >
          Tocá para continuar
        </p>
      </div>
    </>
  )
}
