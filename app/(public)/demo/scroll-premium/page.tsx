'use client'
import { useEffect, useRef, useState } from 'react'

// Hook: detectar si un elemento es visible en el viewport
function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null)
  const [inView, setInView] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setInView(true) }, { threshold })
    obs.observe(el)
    return () => obs.disconnect()
  }, [threshold])
  return { ref, inView }
}

// Componente de sección animada
function Section({ children, delay = 0, dir = 'up' }: { children: React.ReactNode; delay?: number; dir?: 'up' | 'left' | 'right' | 'scale' }) {
  const { ref, inView } = useInView()
  const transforms: Record<string, string> = {
    up: 'translateY(48px)',
    left: 'translateX(-48px)',
    right: 'translateX(48px)',
    scale: 'scale(0.92)',
  }
  return (
    <div ref={ref} style={{
      opacity: inView ? 1 : 0,
      transform: inView ? 'none' : transforms[dir],
      transition: `opacity 0.7s ease ${delay}s, transform 0.7s cubic-bezier(0.16,1,0.3,1) ${delay}s`,
    }}>
      {children}
    </div>
  )
}

// Número animado
function AnimatedNumber({ target, suffix = '', duration = 2000 }: { target: number; suffix?: string; duration?: number }) {
  const { ref, inView } = useInView(0.5)
  const [val, setVal] = useState(0)
  const started = useRef(false)
  useEffect(() => {
    if (!inView || started.current) return
    started.current = true
    const start = Date.now()
    const tick = () => {
      const p = Math.min((Date.now() - start) / duration, 1)
      const ease = 1 - Math.pow(1 - p, 3)
      setVal(Math.round(ease * target))
      if (p < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }, [inView, target, duration])
  return <span ref={ref}>{val}{suffix}</span>
}

// Barra de progreso scroll
function ScrollProgress() {
  const [pct, setPct] = useState(0)
  useEffect(() => {
    const onScroll = () => {
      const el = document.documentElement
      setPct(el.scrollTop / (el.scrollHeight - el.clientHeight) * 100)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])
  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, height: 3, zIndex: 100, background: 'rgba(255,255,255,0.1)' }}>
      <div style={{ height: '100%', width: `${pct}%`, background: 'linear-gradient(90deg, #C6FF3D, #10B981)', transition: 'width 0.1s linear' }} />
    </div>
  )
}

// Tarjeta de feature con hover
function FeatureCard({ icon, title, desc, delay }: { icon: string; title: string; desc: string; delay: number }) {
  const [hov, setHov] = useState(false)
  return (
    <Section delay={delay}>
      <div onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
        style={{
          background: hov ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.03)',
          border: `1px solid ${hov ? 'rgba(198,255,61,0.3)' : 'rgba(255,255,255,0.08)'}`,
          borderRadius: 20, padding: '32px 28px',
          transition: 'all 0.3s cubic-bezier(0.16,1,0.3,1)',
          transform: hov ? 'translateY(-4px)' : 'none',
          cursor: 'default',
        }}>
        <div style={{ fontSize: 36, marginBottom: 16 }}>{icon}</div>
        <div style={{ fontSize: 18, fontWeight: 700, color: '#fff', marginBottom: 10, letterSpacing: '-0.02em' }}>{title}</div>
        <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.55)', lineHeight: 1.65 }}>{desc}</div>
      </div>
    </Section>
  )
}

export default function ScrollPremiumPage() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <div style={{ background: '#06060A', color: '#f0f0f0', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', overflowX: 'hidden' }}>
      <ScrollProgress />
      <style>{`
        @keyframes hero-float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-12px)} }
        @keyframes rotate-slow { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes pulse-ring { 0%{transform:scale(1);opacity:0.6} 100%{transform:scale(2.2);opacity:0} }
        @keyframes gradient-shift { 0%{background-position:0% 50%} 50%{background-position:100% 50%} 100%{background-position:0% 50%} }
        * { box-sizing: border-box; }
        ::selection { background: rgba(198,255,61,0.3); }
        a { color: #C6FF3D; text-decoration: none; }
        @media(max-width:640px) { .hero-title { font-size: 48px !important; } .features-grid { grid-template-columns: 1fr !important; } .stats-grid { grid-template-columns: 1fr 1fr !important; } }
      `}</style>

      {/* NAV */}
      <nav style={{ position: 'fixed', top: 3, left: 0, right: 0, zIndex: 50, padding: '0 32px', backdropFilter: 'blur(20px)', background: 'rgba(6,6,10,0.7)', borderBottom: '1px solid rgba(255,255,255,0.06)', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ fontWeight: 800, fontSize: 18, letterSpacing: '-0.04em', color: '#C6FF3D' }}>
          DIVINIA<span style={{ color: 'rgba(255,255,255,0.3)' }}>.</span>
        </div>
        <div style={{ display: 'flex', gap: 32, fontSize: 14, color: 'rgba(255,255,255,0.6)' }} className="hidden-mobile">
          {['Servicios', 'Casos', 'Academy', 'Precios'].map(l => (
            <a key={l} href="#" style={{ color: 'rgba(255,255,255,0.6)', transition: 'color 0.2s' }}
              onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
              onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.6)')}>
              {l}
            </a>
          ))}
        </div>
        <a href="https://wa.me/5492664000000" target="_blank" rel="noopener noreferrer"
          style={{ background: '#C6FF3D', color: '#06060A', borderRadius: 100, padding: '9px 20px', fontSize: 13, fontWeight: 700, letterSpacing: '-0.01em' }}>
          Hablemos →
        </a>
      </nav>

      {/* HERO */}
      <section style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '120px 24px 80px', position: 'relative', textAlign: 'center', overflow: 'hidden' }}>
        {/* BG orbs */}
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
          <div style={{ position: 'absolute', width: 700, height: 700, borderRadius: '50%', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', background: 'radial-gradient(circle, rgba(198,255,61,0.08) 0%, transparent 65%)', animation: 'hero-float 8s ease-in-out infinite' }} />
          <div style={{ position: 'absolute', width: 400, height: 400, borderRadius: '50%', top: '20%', right: '10%', background: 'radial-gradient(circle, rgba(16,185,129,0.07) 0%, transparent 70%)', animation: 'rotate-slow 40s linear infinite' }} />
          {/* Pulse rings */}
          {[0, 0.8, 1.6].map((d, i) => (
            <div key={i} style={{ position: 'absolute', width: 400, height: 400, borderRadius: '50%', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', border: '1px solid rgba(198,255,61,0.08)', animation: `pulse-ring 4s ease-out ${d}s infinite` }} />
          ))}
        </div>

        {/* Badge */}
        <Section>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(198,255,61,0.08)', border: '1px solid rgba(198,255,61,0.2)', borderRadius: 100, padding: '8px 18px', fontSize: 12, color: '#C6FF3D', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 28 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#C6FF3D', display: 'inline-block' }} />
            Web Scrolling Premium — DIVINIA
          </div>
        </Section>

        {/* Headline */}
        <Section delay={0.1}>
          <h1 className="hero-title" style={{ fontSize: 'clamp(52px, 8vw, 96px)', fontWeight: 900, lineHeight: 1.0, letterSpacing: '-0.04em', margin: '0 0 28px', maxWidth: '16ch' }}>
            Tu negocio merece una web que
            <span style={{ background: 'linear-gradient(135deg, #C6FF3D, #10B981, #38BDF8)', backgroundClip: 'text', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundSize: '200% 200%', animation: 'gradient-shift 4s ease infinite' }}> venda sola.</span>
          </h1>
        </Section>

        <Section delay={0.2}>
          <p style={{ fontSize: 20, color: 'rgba(255,255,255,0.55)', maxWidth: '50ch', lineHeight: 1.6, margin: '0 auto 40px' }}>
            Landings con scroll animado tipo Apple, cargando en &lt;1s, optimizadas para convertir visitantes en clientes. Listas en 48hs.
          </p>
        </Section>

        <Section delay={0.3}>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href="https://wa.me/5492664000000?text=Quiero%20una%20landing%20premium" target="_blank" rel="noopener noreferrer"
              style={{ background: '#C6FF3D', color: '#06060A', borderRadius: 14, padding: '16px 32px', fontSize: 16, fontWeight: 800, letterSpacing: '-0.02em' }}>
              Quiero mi landing → $100.000
            </a>
            <a href="/auditoria"
              style={{ background: 'rgba(255,255,255,0.06)', color: '#fff', borderRadius: 14, padding: '16px 32px', fontSize: 16, fontWeight: 600, border: '1px solid rgba(255,255,255,0.1)' }}>
              Ver auditoría gratis
            </a>
          </div>
        </Section>

        {/* Scroll indicator */}
        <div style={{ position: 'absolute', bottom: 40, left: '50%', transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, color: 'rgba(255,255,255,0.25)', fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
          <span>Scrolleá</span>
          <div style={{ width: 1, height: 40, background: 'linear-gradient(to bottom, rgba(255,255,255,0.3), transparent)', animation: 'hero-float 2s ease-in-out infinite' }} />
        </div>
      </section>

      {/* STATS */}
      <section style={{ padding: '80px 24px', borderTop: '1px solid rgba(255,255,255,0.06)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 2 }} className="stats-grid">
          {[
            { n: 48, suf: 'hs', label: 'Tiempo de entrega' },
            { n: 95, suf: '+', label: 'Score en PageSpeed' },
            { n: 3, suf: 'x', label: 'Más conversiones vs web vieja' },
            { n: 100, suf: 'k', label: 'Precio en ARS' },
          ].map(({ n, suf, label }) => (
            <Section key={label}>
              <div style={{ textAlign: 'center', padding: '40px 20px', borderRight: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ fontSize: 52, fontWeight: 900, letterSpacing: '-0.04em', color: '#C6FF3D', lineHeight: 1 }}>
                  <AnimatedNumber target={n} suffix={suf} />
                </div>
                <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', marginTop: 8 }}>{label}</div>
              </div>
            </Section>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section style={{ padding: '100px 24px', maxWidth: 1100, margin: '0 auto' }}>
        <Section>
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <div style={{ fontFamily: 'monospace', fontSize: 11, letterSpacing: '0.1em', color: '#C6FF3D', textTransform: 'uppercase', marginBottom: 16 }}>
              QUÉ INCLUYE
            </div>
            <h2 style={{ fontSize: 'clamp(36px,5vw,60px)', fontWeight: 900, letterSpacing: '-0.03em', margin: 0 }}>
              Todo lo que necesitás<br />para convertir visitantes.
            </h2>
          </div>
        </Section>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }} className="features-grid">
          {[
            { icon: '⚡', title: 'Scroll animado tipo Apple', desc: 'Elementos que aparecen, se deslizan y escalan con el scroll. Sin librerías pesadas — puro CSS + IntersectionObserver.', delay: 0 },
            { icon: '🚀', title: 'Carga en menos de 1 segundo', desc: 'Optimización de imágenes, lazy loading, fonts subsetting. PageSpeed >90 garantizado.', delay: 0.1 },
            { icon: '📱', title: '100% responsive', desc: 'Diseñada mobile-first. Se ve perfecta en el teléfono de cualquier cliente potencial.', delay: 0.2 },
            { icon: '🎯', title: 'CTA estratégico', desc: 'Botones de WhatsApp, formularios de contacto y links de reserva colocados donde el usuario está listo para comprar.', delay: 0.15 },
            { icon: '🔍', title: 'SEO desde el día 1', desc: 'Estructura semántica correcta, meta tags optimizados, Schema markup, Google Search Console configurado.', delay: 0.25 },
            { icon: '🤖', title: 'Chatbot integrado', desc: 'Podés agregar el chatbot de DIVINIA directamente en la landing. El visitante pregunta, el bot responde 24hs.', delay: 0.3 },
          ].map(f => <FeatureCard key={f.title} {...f} />)}
        </div>
      </section>

      {/* PROCESO */}
      <section style={{ padding: '100px 24px', background: 'rgba(255,255,255,0.02)', borderTop: '1px solid rgba(255,255,255,0.06)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <Section>
            <div style={{ textAlign: 'center', marginBottom: 64 }}>
              <div style={{ fontFamily: 'monospace', fontSize: 11, letterSpacing: '0.1em', color: '#C6FF3D', textTransform: 'uppercase', marginBottom: 16 }}>EL PROCESO</div>
              <h2 style={{ fontSize: 'clamp(32px,5vw,52px)', fontWeight: 900, letterSpacing: '-0.03em', margin: 0 }}>De cero a online en 48hs.</h2>
            </div>
          </Section>
          {[
            { n: '01', title: 'Brief en 15 minutos', desc: 'Nos contás qué hace tu negocio, a quién le vendés y qué querés que haga la landing. Por WA o call.', icon: '💬' },
            { n: '02', title: 'Diseño en 24hs', desc: 'Entregamos el primer borrador con identidad visual, secciones y textos optimizados para conversión.', icon: '🎨' },
            { n: '03', title: 'Ajustes y deploy', desc: 'Máximo 2 rondas de revisión. Cuando aprobás, deployamos en Vercel con tu dominio en menos de 1 hora.', icon: '🚀' },
            { n: '04', title: 'Soporte 30 días', desc: 'Cualquier cambio que surja en el primer mes lo hacemos sin costo adicional.', icon: '🛡️' },
          ].map((p, i) => (
            <Section key={p.n} delay={i * 0.08} dir={i % 2 === 0 ? 'left' : 'right'}>
              <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start', padding: '28px 0', borderBottom: i < 3 ? '1px solid rgba(255,255,255,0.06)' : 'none' }}>
                <div style={{ fontSize: 32, flexShrink: 0, width: 48, textAlign: 'center' }}>{p.icon}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                    <span style={{ fontFamily: 'monospace', fontSize: 11, color: '#C6FF3D', letterSpacing: '0.1em' }}>{p.n}</span>
                    <span style={{ fontSize: 20, fontWeight: 800, color: '#fff', letterSpacing: '-0.02em' }}>{p.title}</span>
                  </div>
                  <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.55)', lineHeight: 1.65, margin: 0 }}>{p.desc}</p>
                </div>
              </div>
            </Section>
          ))}
        </div>
      </section>

      {/* TESTIMONIAL */}
      <section style={{ padding: '100px 24px', maxWidth: 700, margin: '0 auto', textAlign: 'center' }}>
        <Section dir="scale">
          <div style={{ fontSize: 48, marginBottom: 24 }}>⭐⭐⭐⭐⭐</div>
          <blockquote style={{ fontSize: 'clamp(20px,3vw,28px)', fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.4, color: '#fff', margin: '0 0 28px', fontStyle: 'normal' }}>
            "La landing nueva me trajo 3 clientes nuevos en la primera semana. Antes nadie me encontraba."
          </blockquote>
          <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)' }}>
            <strong style={{ color: 'rgba(255,255,255,0.7)' }}>Valentina M.</strong> — Estética Valentina, San Luis
          </div>
        </Section>
      </section>

      {/* CTA FINAL */}
      <section style={{ padding: '120px 24px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at center, rgba(198,255,61,0.06) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <Section>
          <div style={{ fontFamily: 'monospace', fontSize: 11, letterSpacing: '0.1em', color: '#C6FF3D', textTransform: 'uppercase', marginBottom: 20 }}>EMPEZAMOS HOY</div>
          <h2 style={{ fontSize: 'clamp(36px,5vw,68px)', fontWeight: 900, letterSpacing: '-0.04em', margin: '0 0 20px' }}>
            Tu web lista<br />en 48 horas.
          </h2>
          <p style={{ fontSize: 18, color: 'rgba(255,255,255,0.5)', margin: '0 0 40px' }}>
            $100.000 ARS · Pago en 2 cuotas · 30 días de soporte incluidos
          </p>
          <a href="https://wa.me/5492664000000?text=Hola%20Joaco%2C%20quiero%20mi%20landing%20premium%20en%2048hs" target="_blank" rel="noopener noreferrer"
            style={{ display: 'inline-block', background: '#C6FF3D', color: '#06060A', borderRadius: 16, padding: '20px 48px', fontSize: 18, fontWeight: 900, letterSpacing: '-0.02em' }}>
            Empezamos por WhatsApp →
          </a>
        </Section>
      </section>

      {/* FOOTER */}
      <footer style={{ padding: '32px 24px', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <span style={{ fontWeight: 800, letterSpacing: '-0.04em', color: '#C6FF3D', fontSize: 16 }}>DIVINIA.</span>
        <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.25)', fontFamily: 'monospace' }}>
          San Luis, Argentina · divinia.vercel.app
        </span>
        <a href="/auditoria" style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', fontFamily: 'monospace', letterSpacing: '0.05em' }}>
          AUDITORÍA GRATIS →
        </a>
      </footer>
    </div>
  )
}
