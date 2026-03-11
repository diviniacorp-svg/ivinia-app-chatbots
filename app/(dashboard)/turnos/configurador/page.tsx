'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Download, Plus, Trash2, ExternalLink } from 'lucide-react'

const PRESETS_RUBRO: Record<string, {
  emoji: string; color1: string; color2: string; color3: string; color4: string; color5: string
}> = {
  estetica:    { emoji: '🌸', color1: '#9b6070', color2: '#c4899a', color3: '#f0d8df', color4: '#8b6ab0', color5: '#fdf6f8' },
  peluqueria:  { emoji: '✂️', color1: '#5c3d8f', color2: '#8b6ab0', color3: '#ede0f5', color4: '#9b6070', color5: '#f8f5fd' },
  clinica:     { emoji: '🏥', color1: '#1e40af', color2: '#3b82f6', color3: '#dbeafe', color4: '#2563eb', color5: '#f0f7ff' },
  odontologia: { emoji: '🦷', color1: '#0891b2', color2: '#06b6d4', color3: '#cffafe', color4: '#0284c7', color5: '#f0fbff' },
  veterinaria: { emoji: '🐾', color1: '#15803d', color2: '#22c55e', color3: '#dcfce7', color4: '#16a34a', color5: '#f0fdf4' },
  gimnasio:    { emoji: '💪', color1: '#b45309', color2: '#d97706', color3: '#fef3c7', color4: '#92400e', color5: '#fffbeb' },
  restaurante: { emoji: '🍽️', color1: '#b91c1c', color2: '#ef4444', color3: '#fee2e2', color4: '#dc2626', color5: '#fff5f5' },
  taller:      { emoji: '🔧', color1: '#334155', color2: '#64748b', color3: '#e2e8f0', color4: '#475569', color5: '#f8fafc' },
  spa:         { emoji: '💆', color1: '#6b4c7e', color2: '#9c6fae', color3: '#f3e8ff', color4: '#7c3aed', color5: '#fdf4ff' },
  masajes:     { emoji: '🧘', color1: '#065f46', color2: '#10b981', color3: '#d1fae5', color4: '#059669', color5: '#f0fdf9' },
}

type Servicio = { cat: string; nombre: string; precio: number }

const DEFAULT_CONFIG = {
  nombre: '',
  slogan: 'San Luis Capital',
  emoji: '📅',
  instagram: 'https://www.instagram.com/',
  ig_handle: '@',
  wsp_duena: '549266',
  nombre_duena: '',
  color1: '#6366f1',
  color2: '#818cf8',
  color3: '#e0e7ff',
  color4: '#4f46e5',
  color5: '#f5f3ff',
  hora_inicio: 9,
  hora_cierre: 20,
  turno_minutos: 30,
  sb_url: '',
  sb_key: '',
}

export default function ConfiguradorPage() {
  const [cfg, setCfg] = useState(DEFAULT_CONFIG)
  const [servicios, setServicios] = useState<Servicio[]>([
    { cat: 'Servicios', nombre: '', precio: 0 },
  ])
  const [generando, setGenerando] = useState(false)
  const [rubroPreset, setRubroPreset] = useState('')
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1)

  function set(key: keyof typeof cfg, val: string | number) {
    setCfg(c => ({ ...c, [key]: val }))
  }

  function applyPreset(rubro: string) {
    const p = PRESETS_RUBRO[rubro]
    if (!p) return
    setRubroPreset(rubro)
    setCfg(c => ({ ...c, emoji: p.emoji, color1: p.color1, color2: p.color2, color3: p.color3, color4: p.color4, color5: p.color5 }))
  }

  function addServicio() {
    setServicios(s => [...s, { cat: '', nombre: '', precio: 0 }])
  }
  function removeServicio(i: number) {
    setServicios(s => s.filter((_, idx) => idx !== i))
  }
  function updateServicio(i: number, key: keyof Servicio, val: string | number) {
    setServicios(s => s.map((sv, idx) => idx === i ? { ...sv, [key]: val } : sv))
  }

  async function descargar() {
    if (!cfg.nombre) { alert('Completá el nombre del negocio'); return }
    if (!cfg.wsp_duena || cfg.wsp_duena.length < 10) { alert('Completá el WhatsApp'); return }
    if (!cfg.sb_url || !cfg.sb_key) { alert('Completá las credenciales de Supabase'); return }
    const serviciosValidos = servicios.filter(s => s.nombre.trim())
    if (!serviciosValidos.length) { alert('Agregá al menos un servicio'); return }

    setGenerando(true)
    const res = await fetch('/api/turnos/generar-landing', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...cfg, servicios: serviciosValidos }),
    })
    const blob = await res.blob()
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `turnos-${cfg.nombre.toLowerCase().replace(/\s+/g, '-')}.html`
    a.click()
    URL.revokeObjectURL(url)
    setGenerando(false)
    setStep(4)
  }

  const inputClass = 'w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 bg-white'
  const labelClass = 'block text-xs font-semibold text-gray-600 mb-1'

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link href="/turnos" className="text-gray-400 hover:text-gray-600 text-sm">← Volver</Link>
        <div>
          <h1 className="text-2xl font-black text-gray-900">Configurador de Turnos</h1>
          <p className="text-gray-500 text-sm">Personalizá y descargá la landing lista para deployar</p>
        </div>
      </div>

      {/* Stepper */}
      <div className="flex items-center gap-0 mb-8">
        {[
          { n: 1, label: 'Negocio y diseño' },
          { n: 2, label: 'Horarios y servicios' },
          { n: 3, label: 'Supabase' },
          { n: 4, label: 'Descargar y deployar' },
        ].map((s, i, arr) => (
          <div key={s.n} className="flex items-center flex-1">
            <button
              onClick={() => setStep(s.n as 1|2|3|4)}
              className={`flex items-center gap-2 px-0 py-0 text-left ${step === s.n ? '' : 'opacity-60'}`}
            >
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                step > s.n ? 'bg-green-500 text-white' : step === s.n ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-500'
              }`}>
                {step > s.n ? '✓' : s.n}
              </div>
              <span className={`text-xs font-semibold hidden sm:block ${step === s.n ? 'text-indigo-700' : 'text-gray-400'}`}>
                {s.label}
              </span>
            </button>
            {i < arr.length - 1 && <div className="flex-1 h-px bg-gray-200 mx-2" />}
          </div>
        ))}
      </div>

      {/* STEP 1: Negocio y colores */}
      {step === 1 && (
        <div className="space-y-5">
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h2 className="font-bold text-gray-900 mb-4">Datos del negocio</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Nombre del negocio *</label>
                <input className={inputClass} value={cfg.nombre} onChange={e => set('nombre', e.target.value)} placeholder="Ej: Peluquería Marta" />
              </div>
              <div>
                <label className={labelClass}>Ciudad / Slogan</label>
                <input className={inputClass} value={cfg.slogan} onChange={e => set('slogan', e.target.value)} placeholder="San Luis Capital" />
              </div>
              <div>
                <label className={labelClass}>Nombre de quien atiende *</label>
                <input className={inputClass} value={cfg.nombre_duena} onChange={e => set('nombre_duena', e.target.value)} placeholder="Ej: Marta" />
              </div>
              <div>
                <label className={labelClass}>WhatsApp * (549 + código + número)</label>
                <input className={inputClass} value={cfg.wsp_duena} onChange={e => set('wsp_duena', e.target.value)} placeholder="5492664123456" />
                <p className="text-xs text-gray-400 mt-1">549 + 266 + número sin 0 ni 15</p>
              </div>
              <div>
                <label className={labelClass}>Instagram (URL completa)</label>
                <input className={inputClass} value={cfg.instagram} onChange={e => set('instagram', e.target.value)} placeholder="https://www.instagram.com/negocio/" />
              </div>
              <div>
                <label className={labelClass}>Handle de Instagram</label>
                <input className={inputClass} value={cfg.ig_handle} onChange={e => set('ig_handle', e.target.value)} placeholder="@negocio" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h2 className="font-bold text-gray-900 mb-1">Diseño y colores</h2>
            <p className="text-sm text-gray-400 mb-4">Elegí un preset o personalizá los colores</p>

            {/* Presets */}
            <div className="flex flex-wrap gap-2 mb-5">
              {Object.entries(PRESETS_RUBRO).map(([key, p]) => (
                <button
                  key={key}
                  onClick={() => applyPreset(key)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border-2 transition-all ${
                    rubroPreset === key ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
                >
                  <span>{p.emoji}</span>
                  <span className="capitalize">{key}</span>
                  <div className="flex gap-0.5">
                    <div className="w-3 h-3 rounded-full border border-gray-200" style={{ backgroundColor: p.color1 }} />
                    <div className="w-3 h-3 rounded-full border border-gray-200" style={{ backgroundColor: p.color3 }} />
                  </div>
                </button>
              ))}
            </div>

            <div className="grid sm:grid-cols-3 gap-3">
              <div>
                <label className={labelClass}>Emoji del negocio</label>
                <input className={inputClass} value={cfg.emoji} onChange={e => set('emoji', e.target.value)} placeholder="🌸" maxLength={4} />
              </div>
              {[
                { key: 'color1', label: 'Color oscuro (header, botones)' },
                { key: 'color2', label: 'Color medio (acentos)' },
                { key: 'color3', label: 'Color claro (fondos tarjetas)' },
                { key: 'color4', label: 'Color secundario (categorías)' },
                { key: 'color5', label: 'Color fondo general' },
              ].map(c => (
                <div key={c.key} className="flex items-center gap-2">
                  <input
                    type="color"
                    value={cfg[c.key as keyof typeof cfg] as string}
                    onChange={e => set(c.key as keyof typeof cfg, e.target.value)}
                    className="w-10 h-10 rounded-lg border border-gray-200 cursor-pointer flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-600 leading-tight">{c.label}</p>
                    <p className="text-xs text-gray-400">{cfg[c.key as keyof typeof cfg]}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Preview de colores */}
            <div className="mt-4 rounded-xl overflow-hidden border border-gray-100">
              <div className="h-8 flex items-center justify-center text-white text-xs font-bold" style={{ backgroundColor: cfg.color1 }}>
                {cfg.emoji} {cfg.nombre || 'Tu Negocio'} — {cfg.slogan}
              </div>
              <div className="h-8 flex items-center justify-center" style={{ backgroundColor: cfg.color5 }}>
                <span className="text-xs font-bold px-3 py-1 rounded-full" style={{ backgroundColor: cfg.color3, color: cfg.color1 }}>
                  Vista previa de colores
                </span>
              </div>
            </div>
          </div>

          <button onClick={() => setStep(2)} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 rounded-xl transition-colors">
            Siguiente: Horarios y servicios →
          </button>
        </div>
      )}

      {/* STEP 2: Horarios y servicios */}
      {step === 2 && (
        <div className="space-y-5">
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h2 className="font-bold text-gray-900 mb-4">Horarios de atención</h2>
            <div className="grid sm:grid-cols-3 gap-4">
              <div>
                <label className={labelClass}>Hora de apertura</label>
                <select className={inputClass} value={cfg.hora_inicio} onChange={e => set('hora_inicio', +e.target.value)}>
                  {Array.from({ length: 15 }, (_, i) => i + 7).map(h => (
                    <option key={h} value={h}>{h}:00</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass}>Hora de cierre</label>
                <select className={inputClass} value={cfg.hora_cierre} onChange={e => set('hora_cierre', +e.target.value)}>
                  {Array.from({ length: 15 }, (_, i) => i + 13).map(h => (
                    <option key={h} value={h}>{h}:00</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass}>Duración de cada turno</label>
                <select className={inputClass} value={cfg.turno_minutos} onChange={e => set('turno_minutos', +e.target.value)}>
                  {[15, 30, 45, 60, 90, 120].map(m => (
                    <option key={m} value={m}>{m} minutos</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-gray-900">Servicios y precios</h2>
              <button onClick={addServicio} className="flex items-center gap-1.5 text-xs bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold px-3 py-1.5 rounded-lg transition-colors">
                <Plus size={13} /> Agregar
              </button>
            </div>
            <p className="text-xs text-gray-400 mb-3">Podés agrupar servicios por categoría. Ejemplo: "Depilación a la cera", "Facial", "Masajes"</p>

            <div className="space-y-2">
              <div className="grid grid-cols-12 gap-2 mb-1">
                <div className="col-span-4"><p className="text-xs font-semibold text-gray-400 uppercase">Categoría</p></div>
                <div className="col-span-4"><p className="text-xs font-semibold text-gray-400 uppercase">Servicio</p></div>
                <div className="col-span-3"><p className="text-xs font-semibold text-gray-400 uppercase">Precio ARS</p></div>
              </div>
              {servicios.map((s, i) => (
                <div key={i} className="grid grid-cols-12 gap-2 items-center">
                  <div className="col-span-4">
                    <input
                      className={inputClass}
                      value={s.cat}
                      onChange={e => updateServicio(i, 'cat', e.target.value)}
                      placeholder="Depilación a la cera"
                    />
                  </div>
                  <div className="col-span-4">
                    <input
                      className={inputClass}
                      value={s.nombre}
                      onChange={e => updateServicio(i, 'nombre', e.target.value)}
                      placeholder="Bozo"
                    />
                  </div>
                  <div className="col-span-3">
                    <input
                      type="number"
                      className={inputClass}
                      value={s.precio || ''}
                      onChange={e => updateServicio(i, 'precio', +e.target.value)}
                      placeholder="5000"
                    />
                  </div>
                  <div className="col-span-1">
                    <button onClick={() => removeServicio(i)} className="text-red-400 hover:text-red-600 transition-colors p-1">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            <button onClick={() => setStep(1)} className="flex-1 border border-gray-200 text-gray-600 font-bold py-3 rounded-xl hover:bg-gray-50 transition-colors">
              ← Atrás
            </button>
            <button onClick={() => setStep(3)} className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl transition-colors">
              Siguiente: Supabase →
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: Supabase */}
      {step === 3 && (
        <div className="space-y-5">
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
            <p className="font-bold text-amber-800 mb-3">¿Qué es Supabase y por qué lo necesitás?</p>
            <p className="text-sm text-amber-700 leading-relaxed">
              Supabase es la base de datos donde se guardan las reservas. Cada cliente tiene su propio proyecto gratis.
              El proceso toma 5 minutos.
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h2 className="font-bold text-gray-900 mb-4">Pasos para obtener las credenciales</h2>
            <ol className="space-y-4">
              {[
                {
                  n: '1', title: 'Creá el proyecto en Supabase',
                  desc: 'Andá a app.supabase.com → New Project → Nombre: el negocio del cliente → Región: South America',
                  link: 'https://app.supabase.com', linkText: 'Abrir Supabase →'
                },
                {
                  n: '2', title: 'Copiá las credenciales',
                  desc: 'Settings → API → copiá "Project URL" y "anon public" key',
                  link: null, linkText: ''
                },
                {
                  n: '3', title: 'Pegalas acá abajo',
                  desc: 'Luego de descargar el HTML, vas a correr el SQL en el SQL Editor de Supabase.',
                  link: null, linkText: ''
                },
              ].map(step => (
                <li key={step.n} className="flex gap-3 items-start">
                  <div className="w-7 h-7 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                    {step.n}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">{step.title}</p>
                    <p className="text-sm text-gray-500 mt-0.5 leading-relaxed">{step.desc}</p>
                    {step.link && (
                      <a href={step.link} target="_blank" rel="noopener noreferrer"
                        className="text-xs text-indigo-600 font-bold mt-1 inline-flex items-center gap-1">
                        {step.linkText} <ExternalLink size={11} />
                      </a>
                    )}
                  </div>
                </li>
              ))}
            </ol>

            <div className="mt-5 space-y-3">
              <div>
                <label className={labelClass}>Project URL *</label>
                <input
                  className={inputClass}
                  value={cfg.sb_url}
                  onChange={e => set('sb_url', e.target.value)}
                  placeholder="https://abcdefgh.supabase.co"
                />
              </div>
              <div>
                <label className={labelClass}>Anon Public Key *</label>
                <input
                  className={inputClass}
                  value={cfg.sb_key}
                  onChange={e => set('sb_key', e.target.value)}
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6Ikp..."
                />
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button onClick={() => setStep(2)} className="flex-1 border border-gray-200 text-gray-600 font-bold py-3 rounded-xl hover:bg-gray-50 transition-colors">
              ← Atrás
            </button>
            <button
              onClick={descargar}
              disabled={generando}
              className="flex-1 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              <Download size={18} />
              {generando ? 'Generando...' : 'Descargar landing.html'}
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: Instrucciones post-descarga */}
      {step === 4 && (
        <div className="space-y-4">
          <div className="bg-green-50 border border-green-200 rounded-2xl p-5 text-center">
            <span className="text-4xl">✅</span>
            <h2 className="text-xl font-black text-green-800 mt-2">¡Archivo descargado!</h2>
            <p className="text-green-700 text-sm mt-1">
              Ahora seguí estos pasos para dejarlo online en 10 minutos
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h3 className="font-bold text-gray-900 mb-4">Pasos para poner online</h3>
            <ol className="space-y-4">
              {[
                {
                  n: '1', title: 'Corré el SQL en Supabase',
                  desc: 'Andá a tu proyecto Supabase → SQL Editor → copiá y pegá el contenido de supabase-setup.sql → Run',
                  link: 'https://app.supabase.com', linkText: 'Abrir Supabase →'
                },
                {
                  n: '2', title: 'Creá la carpeta del proyecto',
                  desc: 'Carpeta nueva con el archivo descargado (renombralo a index.html) + un archivo vercel.json',
                  link: null, linkText: ''
                },
                {
                  n: '3', title: 'Contenido del vercel.json',
                  desc: '',
                  code: `{ "rewrites": [{ "source": "/", "destination": "/index.html" }] }`,
                  link: null, linkText: ''
                },
                {
                  n: '4', title: 'Deploy en Vercel',
                  desc: 'En la carpeta: vercel --prod → Obtenés la URL pública',
                  link: null, linkText: ''
                },
                {
                  n: '5', title: 'Probá la reserva',
                  desc: 'Hacé una reserva de prueba. Verificá que llegue el WhatsApp al número del cliente.',
                  link: null, linkText: ''
                },
                {
                  n: '6', title: 'Entregá y cobrá el saldo',
                  desc: 'Mandá la URL al cliente + capacitación de 15 min + cobrá el 50% restante por MercadoPago',
                  link: '/pagos', linkText: 'Ir a Pagos →'
                },
              ].map(s => (
                <li key={s.n} className="flex gap-3 items-start">
                  <div className="w-7 h-7 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                    {s.n}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">{s.title}</p>
                    {s.desc && <p className="text-sm text-gray-500 mt-0.5 leading-relaxed">{s.desc}</p>}
                    {'code' in s && s.code && (
                      <code className="block mt-1 text-xs bg-gray-100 text-gray-700 px-3 py-2 rounded-lg font-mono">{s.code}</code>
                    )}
                    {s.link && (
                      <Link href={s.link} className="text-xs text-indigo-600 font-bold mt-1 inline-flex items-center gap-1">
                        {s.linkText} <ExternalLink size={11} />
                      </Link>
                    )}
                  </div>
                </li>
              ))}
            </ol>
          </div>

          <div className="flex gap-3">
            <button onClick={() => { setStep(1); setCfg(DEFAULT_CONFIG); setServicios([{ cat: '', nombre: '', precio: 0 }]); setRubroPreset('') }}
              className="flex-1 border border-gray-200 text-gray-600 font-bold py-3 rounded-xl hover:bg-gray-50 transition-colors">
              Nuevo cliente
            </button>
            <button onClick={descargar} disabled={generando}
              className="flex-1 border border-indigo-200 text-indigo-700 font-bold py-3 rounded-xl hover:bg-indigo-50 transition-colors flex items-center justify-center gap-2">
              <Download size={16} />
              {generando ? 'Generando...' : 'Descargar de nuevo'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
