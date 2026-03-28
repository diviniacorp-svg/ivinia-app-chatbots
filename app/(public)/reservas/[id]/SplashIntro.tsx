'use client'

import { useState, useEffect } from 'react'

// Genera burbujas con posiciones/tamaños aleatorios pero seeded para no cambiar en cada render
const BUBBLES = Array.from({ length: 12 }, (_, i) => ({
  size: 12 + ((i * 37) % 32),
  left: 4 + ((i * 73) % 88),
  delay: (i * 0.35) % 2.8,
  duration: 3.5 + ((i * 19) % 2.5),
  opacity: 0.12 + ((i * 7) % 20) / 100,
}))

const SPARKLES = ['✨', '💫', '⭐', '🌟', '✦', '✧']
const SPARKLE_POS = Array.from({ length: 10 }, (_, i) => ({
  char: SPARKLES[i % SPARKLES.length],
  top: 5 + ((i * 53) % 80),
  left: 3 + ((i * 71) % 90),
  delay: (i * 0.4) % 3,
  size: 12 + ((i * 13) % 16),
}))

type IntroStyle = 'bubbles' | 'sparkles' | 'petals'

export default function SplashIntro({
  companyName,
  tagline,
  color,
  emoji,
  style: introStyle = 'bubbles',
  onDone,
}: {
  companyName: string
  tagline: string
  color: string
  emoji: string
  style?: IntroStyle
  onDone: () => void
}) {
  const [fading, setFading] = useState(false)

  function close() {
    if (fading) return
    setFading(true)
    setTimeout(onDone, 750)
  }

  useEffect(() => {
    const t = setTimeout(close, 4000)
    return () => clearTimeout(t)
  }, [])

  return (
    <>
      <style>{`
        @keyframes bubble-rise {
          0%   { transform: translateY(0) scale(1); opacity: var(--op); }
          80%  { opacity: var(--op); }
          100% { transform: translateY(-110vh) scale(0.6); opacity: 0; }
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
        @keyframes splash-emoji {
          0%, 100% { transform: translateY(0); }
          50%       { transform: translateY(-14px); }
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
      `}</style>

      <div
        onClick={close}
        className={`fixed inset-0 z-50 flex flex-col items-center justify-center cursor-pointer overflow-hidden select-none ${fading ? 'splash-fade-out' : ''}`}
        style={{
          background: `linear-gradient(150deg, color-mix(in srgb, ${color} 55%, #000) 0%, ${color} 55%, color-mix(in srgb, ${color} 75%, #fff) 100%)`,
        }}
      >
        {/* Decoración de fondo según estilo */}
        {introStyle === 'bubbles' && BUBBLES.map((b, i) => (
          <div
            key={i}
            className="absolute rounded-full pointer-events-none"
            style={{
              width: b.size,
              height: b.size,
              left: `${b.left}%`,
              bottom: '-60px',
              background: 'rgba(255,255,255,0.18)',
              ['--op' as string]: b.opacity,
              animation: `bubble-rise ${b.duration}s ${b.delay}s ease-in infinite`,
            }}
          />
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
            {s.char}
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
            🌸
          </div>
        ))}

        {/* Emoji flotante */}
        <div
          className="text-7xl mb-6 filter drop-shadow-lg"
          style={{ animation: 'splash-emoji 2.2s ease-in-out infinite' }}
        >
          {emoji}
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

        {/* Tagline */}
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

        {/* Hint */}
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
