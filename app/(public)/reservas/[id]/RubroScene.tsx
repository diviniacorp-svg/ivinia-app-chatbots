'use client'

import React from 'react'

// Escenas animadas SVG/CSS por rubro — se renderizan como overlay decorativo
// detrás del contenido del booking wizard.

interface SceneProps {
  color: string      // hex o rgb del accent
  accentRgb: string  // "R, G, B" para rgba()
}

// ─── PELUQUERÍA / BARBERÍA ────────────────────────────────────────────────────
function ScenePeluqueria({ color, accentRgb }: SceneProps) {
  return (
    <>
      <style>{`
        @keyframes scissors-snip {
          0%,100% { transform:rotate(-20deg) scale(1); }
          40% { transform:rotate(18deg) scale(1.05); }
          80% { transform:rotate(-8deg) scale(0.97); }
        }
        @keyframes hair-drift {
          0% { transform:translateY(0) scaleX(1); opacity:0.18; }
          50% { transform:translateY(-30px) scaleX(0.85); opacity:0.30; }
          100% { transform:translateY(-60px) scaleX(1.1); opacity:0; }
        }
        @keyframes blade-open {
          0%,100% { transform-origin:50% 100%; transform:rotate(-18deg); }
          50% { transform-origin:50% 100%; transform:rotate(18deg); }
        }
      `}</style>
      {/* SVG tijeras grande - esquina derecha */}
      <svg
        viewBox="0 0 200 240"
        style={{
          position:'fixed', right:'-2vw', top:'18vh',
          width:'min(38vw,200px)', opacity:0.18,
          animation:'scissors-snip 3.2s ease-in-out infinite',
          zIndex:1, pointerEvents:'none', filter:`drop-shadow(0 0 24px rgba(${accentRgb},0.5))`,
        }}
      >
        {/* Mango */}
        <ellipse cx="60" cy="190" rx="22" ry="14" fill="none" stroke={color} strokeWidth="6" strokeLinecap="round"/>
        <ellipse cx="140" cy="190" rx="22" ry="14" fill="none" stroke={color} strokeWidth="6" strokeLinecap="round"/>
        {/* Hoja 1 */}
        <path d="M60 180 Q90 120 100 80 Q108 52 115 30" fill="none" stroke={color} strokeWidth="7" strokeLinecap="round"/>
        {/* Hoja 2 */}
        <path d="M140 180 Q110 120 100 80 Q92 52 85 30" fill="none" stroke={color} strokeWidth="7" strokeLinecap="round"/>
        {/* Tornillo */}
        <circle cx="100" cy="80" r="8" fill="none" stroke={color} strokeWidth="4"/>
        <circle cx="100" cy="80" r="2" fill={color}/>
      </svg>
      {/* Hebras de cabello flotantes */}
      {[15,30,55,72].map((left, i) => (
        <svg key={i} viewBox="0 0 20 80" style={{
          position:'fixed', left:`${left}%`, bottom:`${10 + i*15}%`,
          width:16, opacity:0, animation:`hair-drift ${4 + i*0.7}s ${i*1.1}s ease-in-out infinite`,
          zIndex:1, pointerEvents:'none',
        }}>
          <path d={`M10 80 Q${4 + i*3} 50 10 20 Q${14 - i*2} 5 8 0`}
            fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round"/>
        </svg>
      ))}
    </>
  )
}

// ─── NAILS / ESTÉTICA ─────────────────────────────────────────────────────────
function SceneNails({ color, accentRgb }: SceneProps) {
  const diamonds = Array.from({length:20}, (_,i) => ({
    x: 5 + ((i*71)%88), y: 5 + ((i*53)%85),
    size: 4 + ((i*13)%12), delay: (i*0.4)%5, dur: 2 + ((i*17)%2.5),
  }))
  return (
    <>
      <style>{`
        @keyframes glitter-pop {
          0%,100% { transform:scale(0) rotate(0deg); opacity:0; }
          30% { transform:scale(1.4) rotate(45deg); opacity:0.9; }
          60% { transform:scale(0.8) rotate(90deg); opacity:0.6; }
        }
        @keyframes nail-float {
          0%,100% { transform:translateY(0) rotate(-8deg); }
          50% { transform:translateY(-18px) rotate(8deg); }
        }
      `}</style>
      {/* Diamantes glitter */}
      {diamonds.map((d,i) => (
        <svg key={i} viewBox="0 0 20 20" style={{
          position:'fixed', left:`${d.x}%`, top:`${d.y}%`,
          width:d.size, height:d.size, zIndex:1, pointerEvents:'none',
          animation:`glitter-pop ${d.dur}s ${d.delay}s ease-in-out infinite`,
          filter:`drop-shadow(0 0 4px rgba(${accentRgb},0.8))`,
        }}>
          <polygon points="10,1 13,8 20,8 14.5,13 16.5,20 10,16 3.5,20 5.5,13 0,8 7,8"
            fill={color} opacity="0.9"/>
        </svg>
      ))}
      {/* Frasco de esmalte decorativo */}
      <svg viewBox="0 0 80 160" style={{
        position:'fixed', right:'8vw', bottom:'12vh',
        width:'min(18vw,80px)', opacity:0.22, zIndex:1, pointerEvents:'none',
        animation:'nail-float 5s ease-in-out infinite',
        filter:`drop-shadow(0 0 20px rgba(${accentRgb},0.6))`,
      }}>
        <rect x="25" y="90" width="30" height="60" rx="6" fill={color}/>
        <rect x="28" y="75" width="24" height="18" rx="3" fill={color} opacity="0.7"/>
        <rect x="33" y="60" width="14" height="18" rx="3" fill={color} opacity="0.5"/>
        <rect x="30" y="55" width="20" height="8" rx="2" fill={color} opacity="0.4"/>
        <line x1="40" y1="95" x2="40" y2="145" stroke="rgba(255,255,255,0.3)" strokeWidth="2"/>
      </svg>
    </>
  )
}

// ─── SPA / WELLNESS ───────────────────────────────────────────────────────────
function SceneSpa({ color, accentRgb }: SceneProps) {
  return (
    <>
      <style>{`
        @keyframes ripple-out {
          0% { transform:scale(0.4); opacity:0.6; }
          100% { transform:scale(2.8); opacity:0; }
        }
        @keyframes petal-fall {
          0% { transform:translateY(-5vh) rotate(0deg) translateX(0); opacity:0.6; }
          100% { transform:translateY(110vh) rotate(360deg) translateX(40px); opacity:0; }
        }
        @keyframes lotus-pulse {
          0%,100% { transform:scale(1) rotate(0deg); opacity:0.15; }
          50% { transform:scale(1.08) rotate(6deg); opacity:0.25; }
        }
      `}</style>
      {/* Ripples concentricos */}
      {[0,1,2,3].map(i => (
        <div key={i} style={{
          position:'fixed', left:'50%', top:'45%',
          width:220, height:220,
          marginLeft:-110, marginTop:-110,
          borderRadius:'50%',
          border:`2px solid rgba(${accentRgb},0.35)`,
          animation:`ripple-out 5s ${i*1.25}s ease-out infinite`,
          zIndex:1, pointerEvents:'none',
        }}/>
      ))}
      {/* Pétalos cayendo */}
      {[12,27,45,62,78,88].map((left,i) => (
        <svg key={i} viewBox="0 0 20 28" style={{
          position:'fixed', left:`${left}%`, top:'-4vh',
          width: 14 + ((i*7)%10),
          animation:`petal-fall ${7 + i*1.3}s ${i*1.6}s linear infinite`,
          zIndex:1, pointerEvents:'none', opacity:0.5,
        }}>
          <ellipse cx="10" cy="14" rx="6" ry="12" fill={color} opacity="0.7"
            transform={`rotate(${i*30} 10 14)`}/>
        </svg>
      ))}
      {/* Flor de loto grande - centro */}
      <svg viewBox="0 0 200 200" style={{
        position:'fixed', right:'-5vw', bottom:'-5vh',
        width:'min(55vw,280px)', opacity:0.12, zIndex:1, pointerEvents:'none',
        animation:'lotus-pulse 8s ease-in-out infinite',
        filter:`drop-shadow(0 0 30px rgba(${accentRgb},0.4))`,
      }}>
        {[0,45,90,135,180,225,270,315].map((angle,i) => (
          <ellipse key={i} cx="100" cy="100" rx="18" ry="55"
            fill={color} opacity="0.6"
            transform={`rotate(${angle} 100 100)`}/>
        ))}
        <circle cx="100" cy="100" r="18" fill={color} opacity="0.9"/>
      </svg>
    </>
  )
}

// ─── GIMNASIO / FITNESS ───────────────────────────────────────────────────────
function SceneGimnasio({ color, accentRgb }: SceneProps) {
  return (
    <>
      <style>{`
        @keyframes energy-ring {
          0% { transform:scale(0.6); opacity:0.7; }
          100% { transform:scale(2.2); opacity:0; }
        }
        @keyframes bolt-flash {
          0%,100% { opacity:0.12; transform:scale(1); }
          15% { opacity:0.45; transform:scale(1.08); }
          30% { opacity:0.12; }
          45% { opacity:0.35; transform:scale(1.04); }
        }
        @keyframes weight-swing {
          0%,100% { transform:rotate(-12deg); }
          50% { transform:rotate(12deg); }
        }
      `}</style>
      {/* Anillos de energía */}
      {[0,1,2,3,4].map(i => (
        <div key={i} style={{
          position:'fixed', right:'15%', top:'35%',
          width:160, height:160, marginLeft:-80, marginTop:-80,
          borderRadius:'50%',
          border:`3px solid rgba(${accentRgb},0.5)`,
          animation:`energy-ring 3s ${i*0.6}s ease-out infinite`,
          zIndex:1, pointerEvents:'none',
        }}/>
      ))}
      {/* Rayo/bolt SVG */}
      <svg viewBox="0 0 80 140" style={{
        position:'fixed', left:'6vw', top:'20vh',
        width:'min(14vw,70px)', zIndex:1, pointerEvents:'none',
        animation:'bolt-flash 2.4s ease-in-out infinite',
        filter:`drop-shadow(0 0 18px rgba(${accentRgb},0.8))`,
      }}>
        <path d="M50 5 L20 75 L45 75 L30 135 L60 55 L38 55 Z"
          fill={color} opacity="0.9"/>
      </svg>
      {/* Mancuerna decorativa */}
      <svg viewBox="0 0 180 60" style={{
        position:'fixed', right:'4vw', bottom:'20vh',
        width:'min(32vw,160px)', opacity:0.18, zIndex:1, pointerEvents:'none',
        animation:'weight-swing 4s ease-in-out infinite',
        filter:`drop-shadow(0 0 16px rgba(${accentRgb},0.5))`,
      }}>
        <rect x="4" y="22" width="30" height="16" rx="6" fill={color}/>
        <rect x="4" y="16" width="30" height="28" rx="8" fill={color} opacity="0.6"/>
        <rect x="75" y="27" width="30" height="6" rx="3" fill={color}/>
        <rect x="146" y="22" width="30" height="16" rx="6" fill={color}/>
        <rect x="146" y="16" width="30" height="28" rx="8" fill={color} opacity="0.6"/>
      </svg>
    </>
  )
}

// ─── HOTEL / HOSTERÍA ─────────────────────────────────────────────────────────
function SceneHotel({ color, accentRgb }: SceneProps) {
  const stars = Array.from({length:24}, (_,i) => ({
    x: 3 + ((i*67)%92), y: 2 + ((i*43)%50),
    size: 1.5 + ((i*11)%5), delay: (i*0.3)%4, dur: 2 + ((i*13)%3),
  }))
  return (
    <>
      <style>{`
        @keyframes star-twinkle {
          0%,100% { opacity:0.15; transform:scale(1); }
          50% { opacity:0.9; transform:scale(1.5); }
        }
        @keyframes moon-glow {
          0%,100% { filter:drop-shadow(0 0 12px rgba(${accentRgb},0.4)); }
          50% { filter:drop-shadow(0 0 32px rgba(${accentRgb},0.8)); }
        }
        @keyframes moon-drift {
          0%,100% { transform:translateY(0) rotate(-10deg); }
          50% { transform:translateY(-20px) rotate(5deg); }
        }
      `}</style>
      {/* Estrellas */}
      {stars.map((s,i) => (
        <div key={i} style={{
          position:'fixed', left:`${s.x}%`, top:`${s.y}%`,
          width:s.size*2, height:s.size*2,
          borderRadius:'50%', background:`rgba(${accentRgb},0.9)`,
          animation:`star-twinkle ${s.dur}s ${s.delay}s ease-in-out infinite`,
          zIndex:1, pointerEvents:'none',
          boxShadow:`0 0 ${s.size*3}px rgba(${accentRgb},0.6)`,
        }}/>
      ))}
      {/* Luna creciente */}
      <svg viewBox="0 0 120 120" style={{
        position:'fixed', right:'6vw', top:'10vh',
        width:'min(28vw,140px)', zIndex:1, pointerEvents:'none',
        animation:'moon-drift 12s ease-in-out infinite',
        filter:`drop-shadow(0 0 20px rgba(${accentRgb},0.5))`,
        opacity:0.3,
      }}>
        <path d="M75 20 A45 45 0 1 0 75 100 A30 30 0 1 1 75 20 Z"
          fill={color}/>
      </svg>
    </>
  )
}

// ─── VETERINARIA ─────────────────────────────────────────────────────────────
function SceneVeterinaria({ color, accentRgb }: SceneProps) {
  const pawPositions = [
    {x:12,y:15},{x:75,y:8},{x:85,y:65},{x:20,y:72},{x:48,y:88},{x:62,y:42},
  ]
  return (
    <>
      <style>{`
        @keyframes paw-appear {
          0%,100% { opacity:0; transform:scale(0.5) rotate(-10deg); }
          25%,75% { opacity:0.25; transform:scale(1) rotate(5deg); }
        }
        @keyframes heartbeat {
          0%,100% { transform:scale(1); }
          15% { transform:scale(1.25); }
          30% { transform:scale(1); }
          45% { transform:scale(1.15); }
        }
      `}</style>
      {/* Huellas de pata */}
      {pawPositions.map((pos,i) => (
        <svg key={i} viewBox="0 0 60 60" style={{
          position:'fixed', left:`${pos.x}%`, top:`${pos.y}%`,
          width: 24 + ((i*9)%18), zIndex:1, pointerEvents:'none',
          animation:`paw-appear ${5 + i*0.8}s ${i*1.2}s ease-in-out infinite`,
          filter:`drop-shadow(0 0 8px rgba(${accentRgb},0.4))`,
        }}>
          <circle cx="30" cy="38" r="10" fill={color} opacity="0.8"/>
          <circle cx="14" cy="25" r="7" fill={color} opacity="0.7"/>
          <circle cx="46" cy="25" r="7" fill={color} opacity="0.7"/>
          <circle cx="22" cy="14" r="5" fill={color} opacity="0.6"/>
          <circle cx="38" cy="14" r="5" fill={color} opacity="0.6"/>
        </svg>
      ))}
      {/* Corazón con latido */}
      <svg viewBox="0 0 100 90" style={{
        position:'fixed', right:'8vw', top:'25vh',
        width:'min(18vw,90px)', opacity:0.2, zIndex:1, pointerEvents:'none',
        animation:'heartbeat 1.5s ease-in-out infinite',
        filter:`drop-shadow(0 0 16px rgba(${accentRgb},0.6))`,
      }}>
        <path d="M50 80 L10 40 A25 25 0 0 1 50 20 A25 25 0 0 1 90 40 Z"
          fill={color}/>
      </svg>
    </>
  )
}

// ─── ODONTOLOGÍA ─────────────────────────────────────────────────────────────
function SceneOdontologia({ color, accentRgb }: SceneProps) {
  const sparkles = Array.from({length:16}, (_,i) => ({
    x: 5 + ((i*73)%88), y: 5 + ((i*53)%85),
    size: 6 + ((i*11)%14), delay: (i*0.45)%4, dur: 1.8 + ((i*13)%1.5),
  }))
  return (
    <>
      <style>{`
        @keyframes sparkle-burst {
          0%,100% { opacity:0; transform:scale(0) rotate(0deg); }
          40% { opacity:0.8; transform:scale(1.2) rotate(45deg); }
          70% { opacity:0.4; transform:scale(0.9) rotate(80deg); }
        }
        @keyframes tooth-shine {
          0%,100% { opacity:0.15; }
          50% { opacity:0.3; filter:drop-shadow(0 0 24px rgba(${accentRgb},0.8)); }
        }
      `}</style>
      {/* Destellos */}
      {sparkles.map((s,i) => (
        <svg key={i} viewBox="0 0 24 24" style={{
          position:'fixed', left:`${s.x}%`, top:`${s.y}%`,
          width:s.size, zIndex:1, pointerEvents:'none',
          animation:`sparkle-burst ${s.dur}s ${s.delay}s ease-in-out infinite`,
          filter:`drop-shadow(0 0 4px rgba(${accentRgb},0.7))`,
        }}>
          <path d="M12 2 L13.5 10 L22 12 L13.5 14 L12 22 L10.5 14 L2 12 L10.5 10 Z"
            fill={color}/>
        </svg>
      ))}
      {/* Diente SVG decorativo */}
      <svg viewBox="0 0 100 120" style={{
        position:'fixed', right:'5vw', bottom:'15vh',
        width:'min(22vw,100px)', zIndex:1, pointerEvents:'none',
        animation:'tooth-shine 4s ease-in-out infinite',
      }}>
        <path d="M20 10 Q10 5 12 30 Q14 55 18 80 Q20 95 30 95 Q38 95 40 80 Q42 95 52 95 Q62 95 64 80 Q68 55 70 30 Q72 5 62 10 Q52 2 50 15 Q48 2 38 2 Q28 2 20 10 Z"
          fill={color} opacity="0.8"/>
        <path d="M35 20 Q40 15 45 20" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="2.5" strokeLinecap="round"/>
      </svg>
    </>
  )
}

// ─── RESTAURANTE ─────────────────────────────────────────────────────────────
function SceneRestaurante({ color, accentRgb }: SceneProps) {
  return (
    <>
      <style>{`
        @keyframes steam-rise {
          0% { transform:translateY(0) scaleX(1); opacity:0.5; }
          50% { transform:translateY(-35px) scaleX(1.3) translateX(8px); opacity:0.25; }
          100% { transform:translateY(-70px) scaleX(0.8) translateX(-5px); opacity:0; }
        }
        @keyframes plate-glow {
          0%,100% { filter:drop-shadow(0 0 12px rgba(${accentRgb},0.3)); }
          50% { filter:drop-shadow(0 0 28px rgba(${accentRgb},0.6)); }
        }
      `}</style>
      {/* Vapores de comida */}
      {[0,1,2].map(i => (
        <svg key={i} viewBox="0 0 30 80" style={{
          position:'fixed',
          left:`${42 + i*8}%`,
          bottom:'28vh',
          width:20,
          zIndex:1, pointerEvents:'none',
          animation:`steam-rise 3s ${i*0.9}s ease-out infinite`,
        }}>
          <path d={`M15 75 Q${5+i*5} 55 15 40 Q${22-i*4} 25 15 10 Q${8+i*3} 0 15 0`}
            fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" opacity="0.7"/>
        </svg>
      ))}
      {/* Plato decorativo */}
      <svg viewBox="0 0 200 200" style={{
        position:'fixed', right:'-4vw', bottom:'-4vh',
        width:'min(45vw,220px)', opacity:0.14, zIndex:1, pointerEvents:'none',
        animation:'plate-glow 5s ease-in-out infinite',
      }}>
        <circle cx="100" cy="100" r="90" fill="none" stroke={color} strokeWidth="6"/>
        <circle cx="100" cy="100" r="70" fill="none" stroke={color} strokeWidth="2" opacity="0.5"/>
        <circle cx="100" cy="100" r="45" fill={color} opacity="0.3"/>
        <path d="M75 100 Q100 70 125 100" fill="none" stroke={color} strokeWidth="3" strokeLinecap="round"/>
      </svg>
    </>
  )
}

// ─── PSICOLOGÍA ───────────────────────────────────────────────────────────────
function ScenePsicologia({ color, accentRgb }: SceneProps) {
  const bubbles = [{x:15,y:60},{x:68,y:25},{x:82,y:70},{x:30,y:20}]
  return (
    <>
      <style>{`
        @keyframes thought-float {
          0%,100% { transform:translateY(0) scale(1); opacity:0.2; }
          50% { transform:translateY(-25px) scale(1.05); opacity:0.35; }
        }
        @keyframes brain-pulse {
          0%,100% { opacity:0.12; transform:scale(1); }
          50% { opacity:0.22; transform:scale(1.04); }
        }
      `}</style>
      {/* Burbujas de pensamiento */}
      {bubbles.map((b,i) => (
        <svg key={i} viewBox="0 0 120 120" style={{
          position:'fixed', left:`${b.x}%`, top:`${b.y}%`,
          width: 50 + ((i*20)%50),
          zIndex:1, pointerEvents:'none',
          animation:`thought-float ${5+i*0.8}s ${i*1.3}s ease-in-out infinite`,
        }}>
          <circle cx="60" cy="55" r="44" fill="none" stroke={color} strokeWidth="3" opacity="0.6"/>
          <circle cx="35" cy="90" r="10" fill="none" stroke={color} strokeWidth="2.5" opacity="0.5"/>
          <circle cx="20" cy="108" r="6" fill="none" stroke={color} strokeWidth="2" opacity="0.4"/>
        </svg>
      ))}
      {/* Cerebro abstracto */}
      <svg viewBox="0 0 200 180" style={{
        position:'fixed', right:'2vw', top:'15vh',
        width:'min(35vw,170px)', zIndex:1, pointerEvents:'none',
        animation:'brain-pulse 6s ease-in-out infinite',
        filter:`drop-shadow(0 0 20px rgba(${accentRgb},0.3))`,
      }}>
        <path d="M100 30 Q130 10 155 30 Q175 50 170 80 Q165 110 145 125 Q125 140 100 145 Q75 140 55 125 Q35 110 30 80 Q25 50 45 30 Q70 10 100 30 Z"
          fill="none" stroke={color} strokeWidth="4" opacity="0.7"/>
        <path d="M100 30 Q100 70 100 145" fill="none" stroke={color} strokeWidth="2.5" opacity="0.4" strokeDasharray="8 5"/>
        <path d="M50 75 Q75 65 100 75 Q125 65 150 75" fill="none" stroke={color} strokeWidth="2.5" opacity="0.4"/>
        <path d="M45 100 Q72 90 100 100 Q128 90 155 100" fill="none" stroke={color} strokeWidth="2.5" opacity="0.4"/>
      </svg>
    </>
  )
}

// ─── DEFAULT (cualquier rubro sin escena específica) ──────────────────────────
function SceneDefault({ color, accentRgb }: SceneProps) {
  const rings = [0,1,2]
  return (
    <>
      <style>{`
        @keyframes ring-expand {
          0% { transform:scale(0.3); opacity:0.5; }
          100% { transform:scale(3); opacity:0; }
        }
      `}</style>
      {rings.map(i => (
        <div key={i} style={{
          position:'fixed', left:'50%', top:'50%',
          width:200, height:200, marginLeft:-100, marginTop:-100,
          borderRadius:'50%',
          border:`1.5px solid rgba(${accentRgb},0.4)`,
          animation:`ring-expand 6s ${i*2}s ease-out infinite`,
          zIndex:1, pointerEvents:'none',
        }}/>
      ))}
    </>
  )
}

// ─── SELECTOR PRINCIPAL ───────────────────────────────────────────────────────

const SCENE_MAP: Record<string, (p: SceneProps) => React.ReactElement> = {
  peluqueria: ScenePeluqueria,
  barberia: ScenePeluqueria,
  nails: SceneNails,
  estetica: SceneNails,
  spa: SceneSpa,
  wellness: SceneSpa,
  gimnasio: SceneGimnasio,
  fitness: SceneGimnasio,
  hotel: SceneHotel,
  hosteria: SceneHotel,
  veterinaria: SceneVeterinaria,
  odontologia: SceneOdontologia,
  dentista: SceneOdontologia,
  restaurante: SceneRestaurante,
  psicologia: ScenePsicologia,
}

export default function RubroScene({ rubro, color, accentRgb }: SceneProps & { rubro?: string }) {
  if (!rubro) return <SceneDefault color={color} accentRgb={accentRgb} />
  const key = rubro.toLowerCase()
    .replace(/á/g,'a').replace(/é/g,'e').replace(/í/g,'i')
    .replace(/ó/g,'o').replace(/ú/g,'u')
  const Scene = Object.entries(SCENE_MAP).find(([k]) => key.includes(k))?.[1] ?? SceneDefault
  return <Scene color={color} accentRgb={accentRgb} />
}
