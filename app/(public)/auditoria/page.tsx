'use client'
import { useState } from 'react'

const RUBROS = [
  'Peluquería / Barbería', 'Estética / Spa', 'Odontología', 'Medicina / Salud',
  'Gimnasio / Fitness', 'Restaurante / Gastronomía', 'Hotel / Alojamiento',
  'Veterinaria', 'Inmobiliaria', 'Contabilidad / Estudio', 'Abogacía / Legal',
  'Comercio / Tienda', 'Taller / Mecánica', 'Construcción / Reformas',
  'Educación / Instituto', 'Otro',
]

type Rec = {
  prioridad: 'alta' | 'media' | 'baja'
  area: string
  accion: string
  impacto_estimado: string
  servicio_divinia: string
  precio_estimado: string
}

type AuditResult = {
  score_general: number
  resumen_ejecutivo: string
  web: { score: number; estado: string; problemas: string[]; oportunidades: string[] }
  seo: { score: number; estado: string; problemas: string[]; keywords_perdidas: string[] }
  redes_sociales: { score: number; estado: string; frecuencia: string; problemas: string[] }
  mensajeria: { score: number; tiene_whatsapp_business: boolean; tiene_chatbot: boolean; tiempo_respuesta_estimado: string; problemas: string[] }
  publicidad: { score: number; invierte_en_ads: boolean; canales_detectados: string[]; problemas: string[] }
  recomendaciones: Rec[]
  mensaje_wa_audit: string
  cta: string
}

function ScoreArc({ score, size = 120, label }: { score: number; size?: number; label: string }) {
  const r = size / 2 - 10
  const circ = 2 * Math.PI * r
  const color = score >= 70 ? '#4ade80' : score >= 40 ? '#fbbf24' : '#f87171'
  const dash = (score / 100) * circ
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={8} />
        <circle
          cx={size / 2} cy={size / 2} r={r} fill="none"
          stroke={color} strokeWidth={8}
          strokeDasharray={`${dash} ${circ - dash}`}
          strokeLinecap="round"
          style={{ transition: 'stroke-dasharray 1s ease' }}
        />
        <text x="50%" y="50%" textAnchor="middle" dominantBaseline="central"
          style={{ fontSize: size * 0.22, fontWeight: 700, fill: color, transform: 'rotate(90deg)', transformOrigin: 'center', fontFamily: 'monospace' }}>
          {score}
        </text>
      </svg>
      <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', fontFamily: 'monospace', letterSpacing: '0.05em' }}>{label}</span>
    </div>
  )
}

function PrioTag({ p }: { p: 'alta' | 'media' | 'baja' }) {
  const map = { alta: ['#ef4444', '#fee2e2'], media: ['#f59e0b', '#fef3c7'], baja: ['#6b7280', '#f3f4f6'] }
  const [bg, text] = map[p]
  return (
    <span style={{ background: bg + '22', color: bg, border: `1px solid ${bg}44`, borderRadius: 4, padding: '2px 7px', fontSize: 11, fontFamily: 'monospace', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
      {p}
    </span>
  )
}

export default function AuditoriaPage() {
  const [form, setForm] = useState({ company_name: '', rubro: '', city: '', website: '', instagram: '', notas: '' })
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<AuditResult | null>(null)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  const submit = async () => {
    if (!form.company_name || !form.rubro || !form.city) {
      setError('Completá al menos el nombre, rubro y ciudad.')
      return
    }
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/agents/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company_name: form.company_name,
          rubro: form.rubro,
          city: form.city,
          website: form.website || undefined,
          instagram: form.instagram || undefined,
          notas_adicionales: form.notas || undefined,
          save_as_lead: true,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Error')
      setResult(data)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error inesperado')
    } finally {
      setLoading(false)
    }
  }

  const copy = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const inp: React.CSSProperties = {
    background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 10, padding: '12px 14px', color: '#fff', fontFamily: 'inherit',
    fontSize: 14, width: '100%', outline: 'none', boxSizing: 'border-box',
  }

  return (
    <div style={{ minHeight: '100vh', background: '#060609', color: '#f0f0f0', fontFamily: 'system-ui, sans-serif' }}>
      <style>{`
        @keyframes float { 0%,100%{transform:translate(0,0) scale(1)} 40%{transform:translate(60px,-40px) scale(1.1)} 70%{transform:translate(-30px,50px) scale(0.92)} }
        @keyframes float2 { 0%,100%{transform:translate(0,0) scale(1)} 30%{transform:translate(-70px,40px) scale(1.08)} 65%{transform:translate(40px,-30px) scale(0.95)} }
        @keyframes fadein { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        input::placeholder,textarea::placeholder,select::placeholder { color:rgba(255,255,255,0.25) }
        select option { background:#18181b; color:#fff }
        a { color:#C6FF3D }
      `}</style>

      {/* BG orbs */}
      <div style={{ position:'fixed', inset:0, pointerEvents:'none', overflow:'hidden', zIndex:0 }}>
        <div style={{ position:'absolute', width:600, height:600, borderRadius:'50%', top:-100, left:-100, background:'radial-gradient(circle, rgba(198,255,61,0.12) 0%, transparent 70%)', animation:'float 30s ease-in-out infinite', filter:'blur(60px)' }} />
        <div style={{ position:'absolute', width:500, height:500, borderRadius:'50%', bottom:-80, right:-80, background:'radial-gradient(circle, rgba(16,185,129,0.1) 0%, transparent 70%)', animation:'float2 38s ease-in-out infinite', filter:'blur(80px)' }} />
      </div>

      <div style={{ position:'relative', zIndex:1 }}>
        {/* NAV */}
        <nav style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'16px 32px', borderBottom:'1px solid rgba(255,255,255,0.06)' }}>
          <a href="/" style={{ fontFamily:'monospace', fontWeight:700, fontSize:18, color:'#C6FF3D', textDecoration:'none', letterSpacing:'-0.04em' }}>
            divinia<span style={{ color:'rgba(255,255,255,0.3)' }}>.</span>
          </a>
          <a href="https://wa.me/5492664000000?text=Quiero%20más%20info%20sobre%20DIVINIA" target="_blank" rel="noopener noreferrer"
            style={{ background:'#C6FF3D', color:'#060609', borderRadius:8, padding:'8px 18px', fontSize:13, fontWeight:700, textDecoration:'none', fontFamily:'monospace' }}>
            Hablar con Joaco →
          </a>
        </nav>

        <div style={{ maxWidth: 820, margin: '0 auto', padding: '60px 24px 120px' }}>

          {!result ? (
            <div style={{ animation: 'fadein 0.5s ease' }}>
              {/* HEADER */}
              <div style={{ textAlign:'center', marginBottom:48 }}>
                <div style={{ display:'inline-block', background:'rgba(198,255,61,0.1)', border:'1px solid rgba(198,255,61,0.25)', borderRadius:100, padding:'6px 16px', fontSize:12, fontFamily:'monospace', color:'#C6FF3D', letterSpacing:'0.08em', marginBottom:20 }}>
                  AUDITORÍA DIGITAL GRATUITA — con IA
                </div>
                <h1 style={{ fontSize:'clamp(32px,5vw,56px)', fontWeight:800, lineHeight:1.1, margin:'0 0 16px', letterSpacing:'-0.03em' }}>
                  ¿Cuánto dinero está perdiendo<br />
                  <span style={{ color:'#C6FF3D' }}>tu negocio online</span>?
                </h1>
                <p style={{ fontSize:18, color:'rgba(255,255,255,0.55)', maxWidth:520, margin:'0 auto', lineHeight:1.6 }}>
                  En 60 segundos te decimos exactamente qué está fallando en tu presencia digital y cuánto te cuesta no arreglarlo.
                </p>
              </div>

              {/* FORM */}
              <div style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:20, padding:'36px 40px' }}>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:16 }}>
                  <div>
                    <label style={{ display:'block', fontSize:12, fontFamily:'monospace', color:'rgba(255,255,255,0.4)', marginBottom:6, letterSpacing:'0.06em' }}>NOMBRE DEL NEGOCIO *</label>
                    <input style={inp} placeholder="Ej: Estética Valentina" value={form.company_name} onChange={e => set('company_name', e.target.value)} />
                  </div>
                  <div>
                    <label style={{ display:'block', fontSize:12, fontFamily:'monospace', color:'rgba(255,255,255,0.4)', marginBottom:6, letterSpacing:'0.06em' }}>CIUDAD *</label>
                    <input style={inp} placeholder="Ej: San Luis" value={form.city} onChange={e => set('city', e.target.value)} />
                  </div>
                </div>

                <div style={{ marginBottom:16 }}>
                  <label style={{ display:'block', fontSize:12, fontFamily:'monospace', color:'rgba(255,255,255,0.4)', marginBottom:6, letterSpacing:'0.06em' }}>RUBRO *</label>
                  <select style={{ ...inp }} value={form.rubro} onChange={e => set('rubro', e.target.value)}>
                    <option value="">Seleccioná tu rubro...</option>
                    {RUBROS.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>

                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:16 }}>
                  <div>
                    <label style={{ display:'block', fontSize:12, fontFamily:'monospace', color:'rgba(255,255,255,0.4)', marginBottom:6, letterSpacing:'0.06em' }}>SITIO WEB</label>
                    <input style={inp} placeholder="www.tunegocio.com" value={form.website} onChange={e => set('website', e.target.value)} />
                  </div>
                  <div>
                    <label style={{ display:'block', fontSize:12, fontFamily:'monospace', color:'rgba(255,255,255,0.4)', marginBottom:6, letterSpacing:'0.06em' }}>INSTAGRAM</label>
                    <input style={inp} placeholder="@tunegocio" value={form.instagram} onChange={e => set('instagram', e.target.value)} />
                  </div>
                </div>

                <div style={{ marginBottom:24 }}>
                  <label style={{ display:'block', fontSize:12, fontFamily:'monospace', color:'rgba(255,255,255,0.4)', marginBottom:6, letterSpacing:'0.06em' }}>ALGO QUE QUIERAS QUE ANALICEMOS (opcional)</label>
                  <textarea style={{ ...inp, height:80, resize:'none' }} placeholder="Ej: tenemos muchas consultas por WA pero pocos cierres..." value={form.notas} onChange={e => set('notas', e.target.value)} />
                </div>

                {error && <p style={{ color:'#f87171', fontSize:13, marginBottom:16, fontFamily:'monospace' }}>{error}</p>}

                <button onClick={submit} disabled={loading}
                  style={{ width:'100%', background: loading ? 'rgba(198,255,61,0.4)' : '#C6FF3D', color:'#060609', border:'none', borderRadius:12, padding:'16px', fontSize:16, fontWeight:800, cursor: loading ? 'not-allowed' : 'pointer', fontFamily:'monospace', letterSpacing:'-0.02em', transition:'all 0.2s' }}>
                  {loading ? '🔍 Analizando tu presencia digital...' : 'Ver mi auditoría gratis →'}
                </button>

                <p style={{ textAlign:'center', fontSize:12, color:'rgba(255,255,255,0.25)', marginTop:12, fontFamily:'monospace' }}>
                  100% gratis · Sin spam · El informe llega en ~60 segundos
                </p>
              </div>

              {/* SOCIAL PROOF */}
              <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:16, marginTop:32 }}>
                {[
                  { n: '+40', label: 'negocios auditados' },
                  { n: '87%', label: 'encontraron mejoras urgentes' },
                  { n: '$0', label: 'costo de la auditoría' },
                ].map(({ n, label }) => (
                  <div key={n} style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:12, padding:'20px', textAlign:'center' }}>
                    <div style={{ fontSize:28, fontWeight:800, color:'#C6FF3D', fontFamily:'monospace' }}>{n}</div>
                    <div style={{ fontSize:12, color:'rgba(255,255,255,0.4)', marginTop:4 }}>{label}</div>
                  </div>
                ))}
              </div>
            </div>

          ) : (
            <div style={{ animation: 'fadein 0.6s ease' }}>
              {/* RESULTADO */}
              <div style={{ textAlign:'center', marginBottom:40 }}>
                <div style={{ fontSize:13, fontFamily:'monospace', color:'rgba(255,255,255,0.4)', marginBottom:16, letterSpacing:'0.06em' }}>AUDITORÍA DIGITAL DIVINIA</div>
                <h2 style={{ fontSize:32, fontWeight:800, marginBottom:8, letterSpacing:'-0.03em' }}>{form.company_name}</h2>
                <div style={{ marginBottom:24 }}>
                  <ScoreArc score={result.score_general} size={140} label="SCORE GENERAL" />
                </div>
                <p style={{ fontSize:17, color:'rgba(255,255,255,0.7)', maxWidth:560, margin:'0 auto', lineHeight:1.65 }}>
                  {result.resumen_ejecutivo}
                </p>
              </div>

              {/* SCORES POR ÁREA */}
              <div style={{ display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:12, marginBottom:32, background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:16, padding:'28px 20px' }}>
                <ScoreArc score={result.web.score} size={80} label="WEB" />
                <ScoreArc score={result.seo.score} size={80} label="SEO" />
                <ScoreArc score={result.redes_sociales.score} size={80} label="REDES" />
                <ScoreArc score={result.mensajeria.score} size={80} label="MENSAJERÍA" />
                <ScoreArc score={result.publicidad.score} size={80} label="ADS" />
              </div>

              {/* DETALLES */}
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:32 }}>
                {[
                  { title: '🌐 Web', data: result.web, items: result.web.problemas, extras: result.web.oportunidades, extrasLabel: 'Oportunidades' },
                  { title: '🔍 SEO', data: result.seo, items: result.seo.problemas, extras: result.seo.keywords_perdidas, extrasLabel: 'Keywords perdidas' },
                  { title: '📱 Redes sociales', data: result.redes_sociales, items: result.redes_sociales.problemas, extras: [], extrasLabel: '' },
                  { title: '💬 Mensajería', data: result.mensajeria, items: result.mensajeria.problemas, extras: [], extrasLabel: '' },
                ].map(({ title, data, items, extras, extrasLabel }) => (
                  <div key={title} style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:14, padding:'20px' }}>
                    <div style={{ fontWeight:700, fontSize:15, marginBottom:4 }}>{title}</div>
                    <div style={{ fontSize:12, fontFamily:'monospace', color:'rgba(255,255,255,0.4)', marginBottom:12 }}>
                      {'estado' in data ? (data as { estado: string }).estado.toUpperCase() : ''} · score {data.score}/100
                    </div>
                    {items.length > 0 && (
                      <>
                        <div style={{ fontSize:11, fontFamily:'monospace', color:'rgba(255,255,255,0.3)', marginBottom:6, letterSpacing:'0.05em' }}>PROBLEMAS</div>
                        {items.map((p, i) => (
                          <div key={i} style={{ display:'flex', gap:8, marginBottom:5, fontSize:13, color:'rgba(255,255,255,0.7)', alignItems:'flex-start' }}>
                            <span style={{ color:'#f87171', flexShrink:0 }}>✕</span>{p}
                          </div>
                        ))}
                      </>
                    )}
                    {extras && extras.length > 0 && (
                      <>
                        <div style={{ fontSize:11, fontFamily:'monospace', color:'rgba(255,255,255,0.3)', marginTop:10, marginBottom:6, letterSpacing:'0.05em' }}>{extrasLabel?.toUpperCase()}</div>
                        {extras.map((e, i) => (
                          <div key={i} style={{ display:'flex', gap:8, marginBottom:5, fontSize:13, color:'rgba(255,255,255,0.7)', alignItems:'flex-start' }}>
                            <span style={{ color:'#C6FF3D', flexShrink:0 }}>→</span>{e}
                          </div>
                        ))}
                      </>
                    )}
                  </div>
                ))}
              </div>

              {/* RECOMENDACIONES */}
              <div style={{ background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:16, padding:'28px', marginBottom:28 }}>
                <h3 style={{ fontSize:18, fontWeight:700, marginBottom:20, letterSpacing:'-0.02em' }}>
                  🎯 Recomendaciones prioritarias
                </h3>
                <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
                  {result.recomendaciones.map((r, i) => (
                    <div key={i} style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:12, padding:'16px 20px', display:'grid', gridTemplateColumns:'auto 1fr auto', gap:'12px 16px', alignItems:'start' }}>
                      <PrioTag p={r.prioridad} />
                      <div>
                        <div style={{ fontWeight:600, fontSize:14, marginBottom:4 }}>{r.accion}</div>
                        <div style={{ fontSize:12, color:'rgba(255,255,255,0.45)' }}>{r.area} · Impacto: {r.impacto_estimado}</div>
                      </div>
                      <div style={{ textAlign:'right', flexShrink:0 }}>
                        <div style={{ fontSize:13, color:'#C6FF3D', fontWeight:700, fontFamily:'monospace' }}>{r.precio_estimado}</div>
                        <div style={{ fontSize:11, color:'rgba(255,255,255,0.3)', marginTop:2 }}>{r.servicio_divinia}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* WA MESSAGE + CTA */}
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:32 }}>
                <div style={{ background:'rgba(37,211,102,0.06)', border:'1px solid rgba(37,211,102,0.2)', borderRadius:14, padding:'20px' }}>
                  <div style={{ fontSize:12, fontFamily:'monospace', color:'rgba(255,255,255,0.4)', marginBottom:10, letterSpacing:'0.05em' }}>COMPARTIR AUDITORÍA POR WHATSAPP</div>
                  <p style={{ fontSize:13, color:'rgba(255,255,255,0.7)', lineHeight:1.6, marginBottom:14 }}>{result.mensaje_wa_audit}</p>
                  <button onClick={() => copy(result.mensaje_wa_audit)}
                    style={{ background:'rgba(37,211,102,0.15)', border:'1px solid rgba(37,211,102,0.3)', color:'#25D366', borderRadius:8, padding:'8px 14px', fontSize:12, fontFamily:'monospace', cursor:'pointer' }}>
                    {copied ? '✓ Copiado' : 'Copiar mensaje'}
                  </button>
                </div>
                <div style={{ background:'rgba(198,255,61,0.06)', border:'1px solid rgba(198,255,61,0.2)', borderRadius:14, padding:'20px', display:'flex', flexDirection:'column', justifyContent:'space-between' }}>
                  <div>
                    <div style={{ fontSize:12, fontFamily:'monospace', color:'rgba(255,255,255,0.4)', marginBottom:10, letterSpacing:'0.05em' }}>SIGUIENTE PASO</div>
                    <p style={{ fontSize:14, color:'rgba(255,255,255,0.7)', lineHeight:1.6 }}>
                      Tenemos todo listo para empezar a resolver estos problemas. La primera semana ya vas a ver resultados.
                    </p>
                  </div>
                  <a href="https://wa.me/5492664000000?text=Hola%2C%20acabo%20de%20ver%20mi%20audit%C3%B3r%C3%ADa%20digital%20de%20DIVINIA%20y%20quiero%20saber%20c%C3%B3mo%20arrancar"
                    target="_blank" rel="noopener noreferrer"
                    style={{ display:'block', marginTop:16, background:'#C6FF3D', color:'#060609', borderRadius:10, padding:'12px 20px', textAlign:'center', textDecoration:'none', fontWeight:800, fontSize:14, fontFamily:'monospace' }}>
                    {result.cta}
                  </a>
                </div>
              </div>

              <div style={{ textAlign:'center' }}>
                <button onClick={() => setResult(null)}
                  style={{ background:'none', border:'1px solid rgba(255,255,255,0.1)', color:'rgba(255,255,255,0.4)', borderRadius:8, padding:'10px 20px', fontSize:13, cursor:'pointer', fontFamily:'monospace' }}>
                  ← Auditar otro negocio
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
