import Reveal from './Reveal'

const ROW_1 = [
  { emoji: '💅', label: 'Nail bar' },
  { emoji: '💈', label: 'Barbería' },
  { emoji: '🏨', label: 'Hotel' },
  { emoji: '🩺', label: 'Clínica' },
  { emoji: '🐾', label: 'Veterinaria' },
  { emoji: '💆', label: 'Spa & masajes' },
  { emoji: '🌿', label: 'Cabañas' },
  { emoji: '🦷', label: 'Odontología' },
  { emoji: '🏋️', label: 'Gimnasio' },
  { emoji: '🚗', label: 'Taller mecánico' },
  { emoji: '📸', label: 'Fotografía' },
  { emoji: '🍕', label: 'Restaurante' },
]

const ROW_2 = [
  { emoji: '🏊', label: 'Piscinas' },
  { emoji: '💇', label: 'Peluquería' },
  { emoji: '🏡', label: 'Inmobiliaria' },
  { emoji: '🧹', label: 'Limpieza' },
  { emoji: '⚖️', label: 'Estudio jurídico' },
  { emoji: '🎨', label: 'Tatuajes' },
  { emoji: '🐕', label: 'Guardería de mascotas' },
  { emoji: '🎓', label: 'Academia' },
  { emoji: '🔧', label: 'Electricista' },
  { emoji: '💊', label: 'Farmacia' },
  { emoji: '🧘', label: 'Yoga & pilates' },
  { emoji: '🍰', label: 'Pastelería' },
]

function MarqueePill({ emoji, label }: { emoji: string; label: string }) {
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 8,
      background: 'rgba(246,245,242,0.06)',
      border: '1px solid rgba(246,245,242,0.1)',
      borderRadius: 100,
      padding: '9px 18px',
      flexShrink: 0,
      whiteSpace: 'nowrap',
    }}>
      <span style={{ fontSize: 16 }}>{emoji}</span>
      <span style={{
        fontFamily: 'var(--f-display)',
        fontSize: 13,
        color: 'rgba(246,245,242,0.7)',
        letterSpacing: '-0.01em',
      }}>{label}</span>
    </div>
  )
}

function MarqueeRow({ items, reverse = false }: { items: typeof ROW_1; reverse?: boolean }) {
  const doubled = [...items, ...items, ...items]
  return (
    <div style={{ overflow: 'hidden', maskImage: 'linear-gradient(to right, transparent, black 10%, black 90%, transparent)' }}>
      <div style={{
        display: 'flex', gap: 8,
        animation: `marquee${reverse ? 'Rev' : ''} 28s linear infinite`,
        width: 'max-content',
      }}>
        {doubled.map((item, i) => (
          <MarqueePill key={`${item.label}-${i}`} emoji={item.emoji} label={item.label} />
        ))}
      </div>
    </div>
  )
}

export default function RubrosMarquee() {
  return (
    <section style={{
      padding: '72px 0',
      background: 'var(--ink)',
      borderTop: '1px solid rgba(255,255,255,0.06)',
      overflow: 'hidden',
    }}>
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(calc(-100% / 3)); }
        }
        @keyframes marqueeRev {
          0% { transform: translateX(calc(-100% / 3)); }
          100% { transform: translateX(0); }
        }
      `}</style>

      <div className="wrap-v2" style={{ marginBottom: 32 }}>
        <Reveal>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
            <div>
              <div style={{
                fontFamily: 'var(--f-mono)', fontSize: 9,
                letterSpacing: '0.15em', textTransform: 'uppercase',
                color: 'rgba(246,245,242,0.3)', marginBottom: 6,
              }}>
                Compatible con tu rubro
              </div>
              <div style={{
                fontFamily: 'var(--f-display)', fontStyle: 'italic', fontWeight: 700,
                fontSize: 'clamp(22px, 3vw, 32px)', color: 'var(--paper)',
                letterSpacing: '-0.03em',
              }}>
                +45 rubros <span style={{ color: 'var(--lime)' }}>funcionando hoy.</span>
              </div>
            </div>
            <div style={{
              marginLeft: 'auto',
              fontFamily: 'var(--f-mono)', fontSize: 10,
              color: 'rgba(246,245,242,0.25)', letterSpacing: '0.06em',
              textTransform: 'uppercase',
            }}>
              Si das turnos, lo automatizamos →
            </div>
          </div>
        </Reveal>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <MarqueeRow items={ROW_1} />
        <MarqueeRow items={ROW_2} reverse />
      </div>
    </section>
  )
}
