'use client'
import { useState, useEffect, useCallback } from 'react'

type Partner = {
  id: string; name: string; slug: string; pin: string; address: string
  phone: string; contact_name: string; logo_url: string
  commission_pct: number; is_active: boolean; notes: string
}

type PartnerRequest = {
  id: string; nombre_local: string; contacto: string
  direccion: string; telefono: string; notas: string
  status: string; created_at: string
}

function genPin() {
  return String(Math.floor(1000 + Math.random() * 9000))
}

function slugify(s: string) {
  return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

export function LocalesTab({ color }: { color: string }) {
  const [partners, setPartners] = useState<Partner[]>([])
  const [requests, setRequests] = useState<PartnerRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editTarget, setEditTarget] = useState<Partner | null>(null)
  const [approving, setApproving] = useState<string | null>(null)
  const [newPartnerPin, setNewPartnerPin] = useState<{ name: string; pin: string; phone: string } | null>(null)

  const fetchAll = useCallback(async () => {
    setLoading(true)
    const [pRes, rRes] = await Promise.all([
      fetch('/api/celulab/partners/all', { cache: 'no-store' }),
      fetch('/api/celulab/partners/requests', { cache: 'no-store' }),
    ])
    const pData = await pRes.json(); const rData = await rRes.json()
    setPartners(Array.isArray(pData) ? pData : [])
    setRequests(Array.isArray(rData) ? rData.filter((r: PartnerRequest) => r.status === 'pendiente') : [])
    setLoading(false)
  }, [])

  const fetchPartners = fetchAll

  useEffect(() => { fetchAll() }, [fetchAll])

  // Auto-refresh cada 30s para detectar nuevas solicitudes
  useEffect(() => {
    const interval = setInterval(() => fetchAll(), 30000)
    return () => clearInterval(interval)
  }, [fetchAll])

  async function toggleActive(p: Partner) {
    await fetch(`/api/celulab/partners/${p.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_active: !p.is_active }),
    })
    fetchPartners()
  }

  async function regenPin(p: Partner) {
    const pin = genPin()
    await fetch(`/api/celulab/partners/${p.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pin }),
    })
    fetchAll()
  }

  async function handleRequest(id: string, action: 'aprobar' | 'rechazar') {
    setApproving(id)
    const res = await fetch(`/api/celulab/partners/requests/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action }),
    })
    if (action === 'aprobar') {
      const { partner } = await res.json()
      if (partner) setNewPartnerPin({ name: partner.name, pin: partner.pin, phone: partner.phone })
    }
    setApproving(null)
    fetchAll()
  }

  if (showForm || editTarget) {
    return (
      <PartnerForm
        color={color}
        existing={editTarget}
        onClose={() => { setShowForm(false); setEditTarget(null) }}
        onSaved={() => { setShowForm(false); setEditTarget(null); fetchPartners() }}
      />
    )
  }

  return (
    <div>
      {/* Modal: nuevo local aprobado — mostrar PIN */}
      {newPartnerPin && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 60, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <div style={{ background: '#fff', borderRadius: 18, padding: '28px 32px', maxWidth: 380, width: '100%', textAlign: 'center', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🎉</div>
            <div style={{ fontWeight: 700, fontSize: 20, marginBottom: 6 }}>Local aprobado</div>
            <div style={{ fontSize: 14, color: '#6b7280', marginBottom: 20 }}>{newPartnerPin.name} ya tiene acceso al panel.</div>
            <div style={{ background: '#f1f5f9', borderRadius: 12, padding: '14px 20px', marginBottom: 20 }}>
              <div style={{ fontSize: 11, color: '#9ca3af', marginBottom: 4 }}>PIN DEL LOCAL</div>
              <div style={{ fontFamily: 'monospace', fontSize: 32, fontWeight: 900, letterSpacing: '0.2em' }}>{newPartnerPin.pin}</div>
            </div>
            {newPartnerPin.phone && (
              <a
                href={`https://wa.me/${newPartnerPin.phone.replace(/\D/g, '')}?text=${encodeURIComponent(`Hola! Tu local fue aprobado en CeluLab 🎉\n\nYa podés acceder a tu panel desde:\nhttps://divinia.vercel.app/market/celulab\n\nHacé click en "Mayorista" → "Acceso de locales" e ingresá tu PIN:\n\n*${newPartnerPin.pin}*\n\n¡Bienvenido!`)}`}
                target="_blank" rel="noreferrer"
                style={{ display: 'block', padding: '12px', borderRadius: 10, background: '#25d366', color: '#fff', fontWeight: 700, fontSize: 14, textDecoration: 'none', marginBottom: 10 }}
              >
                📲 Enviar PIN por WhatsApp
              </a>
            )}
            <button onClick={() => setNewPartnerPin(null)} style={{ width: '100%', padding: '11px', borderRadius: 10, border: '1px solid #e5e7eb', background: '#fff', fontSize: 13, cursor: 'pointer' }}>
              Cerrar
            </button>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: 18 }}>Locales asociados</div>
          <div style={{ fontSize: 13, color: '#6b7280' }}>{partners.length} local{partners.length !== 1 ? 'es' : ''}{requests.length > 0 ? ` · ${requests.length} solicitud${requests.length !== 1 ? 'es' : ''} pendiente${requests.length !== 1 ? 's' : ''}` : ''}</div>
        </div>
        <button onClick={() => setShowForm(true)} style={{ padding: '10px 20px', borderRadius: 10, border: 'none', background: color, color: '#fff', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
          + Nuevo local
        </button>
      </div>

      {/* Solicitudes pendientes */}
      {requests.length > 0 && (
        <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 14, padding: '16px 20px', marginBottom: 24 }}>
          <div style={{ fontWeight: 700, fontSize: 14, color: '#92400e', marginBottom: 14 }}>
            🔔 Solicitudes de registro pendientes ({requests.length})
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {requests.map(r => (
              <div key={r.id} style={{ background: '#fff', border: '1px solid #fde68a', borderRadius: 10, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: 200 }}>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>{r.nombre_local}</div>
                  <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>
                    {r.contacto && <span>{r.contacto} · </span>}
                    <span>{r.telefono}</span>
                    {r.direccion && <span> · {r.direccion}</span>}
                  </div>
                  <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>
                    {new Date(r.created_at).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    onClick={() => handleRequest(r.id, 'aprobar')}
                    disabled={approving === r.id}
                    style={{ padding: '8px 16px', borderRadius: 8, border: 'none', background: '#10b981', color: '#fff', fontWeight: 700, fontSize: 12, cursor: 'pointer', opacity: approving === r.id ? 0.7 : 1 }}
                  >
                    {approving === r.id ? '...' : '✓ Aprobar'}
                  </button>
                  <button
                    onClick={() => handleRequest(r.id, 'rechazar')}
                    disabled={approving === r.id}
                    style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid #fca5a5', background: '#fff', color: '#dc2626', fontWeight: 700, fontSize: 12, cursor: 'pointer' }}
                  >
                    ✕ Rechazar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: 48, color: '#9ca3af' }}>Cargando...</div>
      ) : partners.length === 0 ? (
        <EmptyLocales onNew={() => setShowForm(true)} />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {partners.map(p => (
            <PartnerCard
              key={p.id}
              partner={p}
              color={color}
              onToggle={() => toggleActive(p)}
              onEdit={() => setEditTarget(p)}
              onRegenPin={() => regenPin(p)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Partner Card ─────────────────────────────────────────────────────────────

function PartnerCard({
  partner, color, onToggle, onEdit, onRegenPin,
}: {
  partner: Partner; color: string; onToggle: () => void; onEdit: () => void; onRegenPin: () => void
}) {
  const [pinVisible, setPinVisible] = useState(false)
  const panelUrl = `${typeof window !== 'undefined' ? window.location.origin : 'https://divinia.vercel.app'}/market/celulab/local/${partner.slug}`

  return (
    <div style={{
      background: '#fff', border: `1px solid ${partner.is_active ? '#e5e7eb' : '#fecaca'}`,
      borderRadius: 14, padding: '16px 20px',
      opacity: partner.is_active ? 1 : 0.75,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        {/* Logo */}
        {partner.logo_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={partner.logo_url} alt={partner.name} style={{ width: 48, height: 48, borderRadius: 10, objectFit: 'cover', border: '1px solid #e5e7eb', flexShrink: 0 }} />
        ) : (
          <div style={{ width: 48, height: 48, borderRadius: 10, background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>🏪</div>
        )}

        {/* Info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
            <div style={{ fontWeight: 700, fontSize: 15 }}>{partner.name}</div>
            <span style={{
              padding: '2px 8px', borderRadius: 6, fontSize: 11, fontWeight: 700,
              background: partner.is_active ? '#dcfce7' : '#fee2e2',
              color: partner.is_active ? '#15803d' : '#dc2626',
            }}>
              {partner.is_active ? 'Activo' : 'Desactivado'}
            </span>
          </div>
          <div style={{ fontSize: 12, color: '#6b7280' }}>
            {partner.address && <span>{partner.address}</span>}
            {partner.phone && <span style={{ marginLeft: 8 }}>· {partner.phone}</span>}
            {partner.commission_pct > 0 && <span style={{ marginLeft: 8, color: '#9ca3af' }}>· {partner.commission_pct}% comisión</span>}
          </div>
        </div>

        {/* PIN */}
        <div style={{ textAlign: 'center', flexShrink: 0 }}>
          <div style={{ fontSize: 10, color: '#9ca3af', marginBottom: 2 }}>PIN</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{
              fontFamily: 'monospace', fontWeight: 800, fontSize: 18,
              background: '#f1f5f9', padding: '4px 10px', borderRadius: 8,
              letterSpacing: pinVisible ? '0.2em' : '0.05em',
              color: pinVisible ? '#111' : '#9ca3af',
            }}>
              {pinVisible ? partner.pin : '••••'}
            </span>
            <button onClick={() => setPinVisible(v => !v)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, padding: 2 }} title="Mostrar/ocultar PIN">
              {pinVisible ? '🙈' : '👁'}
            </button>
          </div>
        </div>
      </div>

      {/* Actions row */}
      <div style={{ display: 'flex', gap: 8, marginTop: 14, flexWrap: 'wrap' }}>
        <a
          href={panelUrl} target="_blank" rel="noreferrer"
          style={{ padding: '6px 12px', borderRadius: 7, border: `1px solid ${color}`, color, fontSize: 12, fontWeight: 600, textDecoration: 'none' }}
        >
          🔗 Ver panel
        </a>
        <button onClick={() => navigator.clipboard.writeText(panelUrl)} style={{ padding: '6px 12px', borderRadius: 7, border: '1px solid #e5e7eb', background: '#fff', fontSize: 12, cursor: 'pointer' }}>
          📋 Copiar URL
        </button>
        <button onClick={() => navigator.clipboard.writeText(partner.pin)} style={{ padding: '6px 12px', borderRadius: 7, border: '1px solid #e5e7eb', background: '#fff', fontSize: 12, cursor: 'pointer' }}>
          🔑 Copiar PIN
        </button>
        <button onClick={onRegenPin} style={{ padding: '6px 12px', borderRadius: 7, border: '1px solid #f59e0b', color: '#b45309', background: '#fff', fontSize: 12, cursor: 'pointer' }}>
          ↻ Nuevo PIN
        </button>
        <button onClick={onEdit} style={{ padding: '6px 12px', borderRadius: 7, border: '1px solid #e5e7eb', background: '#fff', fontSize: 12, cursor: 'pointer' }}>
          ✏️ Editar
        </button>
        <button
          onClick={onToggle}
          style={{
            padding: '6px 12px', borderRadius: 7, border: `1px solid ${partner.is_active ? '#fecaca' : '#86efac'}`,
            color: partner.is_active ? '#dc2626' : '#15803d', background: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer',
          }}
        >
          {partner.is_active ? '🚫 Deshabilitar' : '✅ Habilitar'}
        </button>
      </div>
    </div>
  )
}

// ─── Partner Form (create / edit) ─────────────────────────────────────────────

function PartnerForm({
  color, existing, onClose, onSaved,
}: {
  color: string; existing: Partner | null; onClose: () => void; onSaved: () => void
}) {
  const isEdit = !!existing
  const [form, setForm] = useState({
    name: existing?.name ?? '',
    slug: existing?.slug ?? '',
    pin: existing?.pin ?? genPin(),
    address: existing?.address ?? '',
    phone: existing?.phone ?? '',
    contact_name: existing?.contact_name ?? '',
    commission_pct: String(existing?.commission_pct ?? 33),
    logo_url: existing?.logo_url ?? '',
    notes: existing?.notes ?? '',
  })
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState(existing?.logo_url ?? '')
  const [saving, setSaving] = useState(false)
  const [err, setErr] = useState('')

  function set(k: string, v: string) { setForm(f => ({ ...f, [k]: v })) }

  function handleNameChange(v: string) {
    setForm(f => ({ ...f, name: v, slug: isEdit ? f.slug : slugify(v) }))
  }

  function handleLogoFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setLogoFile(file)
    setLogoPreview(URL.createObjectURL(file))
  }

  async function handleSave() {
    if (!form.name || !form.slug) { setErr('Nombre y slug son obligatorios'); return }
    setSaving(true)

    let logo_url = form.logo_url
    if (logoFile) {
      const fd = new FormData()
      fd.append('file', logoFile)
      if (existing) fd.append('partner_id', existing.id)
      const r = await fetch('/api/celulab/upload', { method: 'POST', body: fd })
      if (r.ok) { const j = await r.json(); logo_url = j.url }
    }

    const payload = {
      name: form.name,
      slug: form.slug,
      pin: form.pin,
      address: form.address,
      phone: form.phone,
      contact_name: form.contact_name,
      commission_pct: Number(form.commission_pct) || 33,
      logo_url,
      notes: form.notes,
    }

    if (isEdit) {
      const r = await fetch(`/api/celulab/partners/${existing!.id}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
      })
      if (!r.ok) { const e = await r.json(); setErr(e.error ?? 'Error'); setSaving(false); return }
    } else {
      const r = await fetch('/api/celulab/partners', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
      })
      if (!r.ok) { const e = await r.json(); setErr(e.error ?? 'Error'); setSaving(false); return }
    }

    onSaved()
  }

  return (
    <div>
      <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280', fontSize: 13, marginBottom: 16, padding: 0 }}>
        ← Cancelar
      </button>
      <div style={{ fontWeight: 700, fontSize: 20, marginBottom: 20 }}>{isEdit ? `Editar — ${existing!.name}` : 'Nuevo local'}</div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Section title="📋 Datos del local">
            <FF label="Nombre del local *">
              <input style={inp} value={form.name} onChange={e => handleNameChange(e.target.value)} placeholder="Ej: Celulandia" />
            </FF>
            <FF label="Slug (URL del panel)">
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ fontSize: 12, color: '#9ca3af', flexShrink: 0 }}>/local/</span>
                <input style={inp} value={form.slug} onChange={e => set('slug', slugify(e.target.value))} placeholder="celulandia" />
              </div>
            </FF>
            <FF label="Dirección">
              <input style={inp} value={form.address} onChange={e => set('address', e.target.value)} placeholder="Rivadavia 861" />
            </FF>
            <FF label="Teléfono">
              <input style={inp} value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="+54 9 266..." />
            </FF>
            <FF label="Nombre del contacto">
              <input style={inp} value={form.contact_name} onChange={e => set('contact_name', e.target.value)} placeholder="Nombre de quien recibe" />
            </FF>
            <FF label="Comisión del local (%)">
              <input type="number" style={inp} value={form.commission_pct} onChange={e => set('commission_pct', e.target.value)} min={0} max={100} />
            </FF>
          </Section>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Section title="🔑 Acceso">
            <FF label="PIN del panel">
              <div style={{ display: 'flex', gap: 8 }}>
                <input style={{ ...inp, flex: 1, fontFamily: 'monospace', fontSize: 18, letterSpacing: '0.2em', fontWeight: 700 }}
                  value={form.pin} onChange={e => set('pin', e.target.value)} maxLength={8} placeholder="4 dígitos" />
                <button onClick={() => set('pin', genPin())} style={{
                  padding: '8px 12px', borderRadius: 8, border: '1px solid #e5e7eb',
                  background: '#fff', fontSize: 12, cursor: 'pointer',
                }}>
                  ↻ Generar
                </button>
              </div>
              <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 4 }}>Solo vos lo ves. El local no puede cambiarlo.</div>
            </FF>
          </Section>

          <Section title="🖼 Logo del local">
            <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
              {logoPreview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={logoPreview} alt="Logo preview" style={{ width: 72, height: 72, borderRadius: 12, objectFit: 'cover', border: '1px solid #e5e7eb', flexShrink: 0 }} />
              ) : (
                <div style={{ width: 72, height: 72, borderRadius: 12, background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, flexShrink: 0 }}>🏪</div>
              )}
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', padding: '8px 14px', borderRadius: 9, border: '1px solid #e5e7eb', background: '#f9fafb', fontSize: 13, cursor: 'pointer', textAlign: 'center', marginBottom: 8 }}>
                  📁 Subir imagen
                  <input type="file" accept="image/*" onChange={handleLogoFile} style={{ display: 'none' }} />
                </label>
                <input style={{ ...inp, fontSize: 11 }} value={form.logo_url} onChange={e => { set('logo_url', e.target.value); setLogoPreview(e.target.value); setLogoFile(null) }} placeholder="O pegá una URL de imagen" />
              </div>
            </div>
          </Section>

          <Section title="📝 Notas internas">
            <textarea style={{ ...inp, minHeight: 60, resize: 'vertical' }} value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="Horario, contacto, condiciones especiales..." />
          </Section>
        </div>
      </div>

      {err && <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#dc2626', marginTop: 16 }}>{err}</div>}

      <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
        <button onClick={handleSave} disabled={saving} style={{
          padding: '11px 28px', borderRadius: 10, border: 'none', background: color,
          color: '#fff', fontWeight: 700, fontSize: 14, cursor: 'pointer', opacity: saving ? 0.7 : 1,
        }}>
          {saving ? 'Guardando...' : isEdit ? '✓ Guardar cambios' : '✓ Crear local'}
        </button>
        <button onClick={onClose} style={{ padding: '11px 20px', borderRadius: 10, border: '1px solid #e5e7eb', background: '#fff', fontSize: 14, cursor: 'pointer' }}>Cancelar</button>
      </div>
    </div>
  )
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function EmptyLocales({ onNew }: { onNew: () => void }) {
  return (
    <div style={{ textAlign: 'center', padding: '64px 24px', color: '#9ca3af' }}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>🏪</div>
      <div style={{ fontWeight: 600, fontSize: 16, color: '#6b7280', marginBottom: 6 }}>Sin locales asociados</div>
      <div style={{ fontSize: 13, marginBottom: 24 }}>Agregá el primer local para que pueda cargar órdenes desde su panel.</div>
      <button onClick={onNew} style={{ padding: '10px 24px', borderRadius: 10, border: 'none', background: '#6366f1', color: '#fff', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
        + Agregar local
      </button>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 12, padding: '16px 18px' }}>
      <div style={{ fontWeight: 600, fontSize: 13, color: '#374151', marginBottom: 12 }}>{title}</div>
      {children}
    </div>
  )
}

function FF({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ fontSize: 11, fontWeight: 600, color: '#374151', marginBottom: 4 }}>{label}</div>
      {children}
    </div>
  )
}

const inp: React.CSSProperties = {
  width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid #d1d5db',
  fontSize: 13, background: '#fff', boxSizing: 'border-box',
}