'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'

interface Post {
  id: string
  caption: string
  tipo: string
  herramienta: string
  visual_prompt: string
  approval_status: 'pending' | 'needs_revision' | 'approved'
  approval_comment: string | null
  scheduled_at: string | null
  created_at: string
  media_url: string | null
}

const INK = '#09090B'
const LIME = '#C6FF3D'
const PAPER = '#F6F5F2'

function TipoBadge({ tipo }: { tipo: string }) {
  const map: Record<string, { label: string; color: string }> = {
    post: { label: 'Post', color: '#3B82F6' },
    carrusel: { label: 'Carrusel', color: '#8B5CF6' },
    reel: { label: 'Reel', color: '#EC4899' },
    story: { label: 'Story', color: '#F59E0B' },
  }
  const t = map[tipo] ?? { label: tipo, color: '#71717A' }
  return (
    <span style={{
      background: `${t.color}14`, color: t.color, border: `1px solid ${t.color}25`,
      borderRadius: 6, padding: '2px 9px', fontFamily: 'var(--f-mono)',
      fontSize: 9, letterSpacing: '0.06em', textTransform: 'uppercase',
    }}>
      {t.label}
    </span>
  )
}

function PostCard({ post, onAction }: { post: Post; onAction: (id: string, accion: 'approve' | 'reject', comentario?: string) => void }) {
  const [expanded, setExpanded] = useState(false)
  const [comentario, setComentario] = useState('')
  const [loading, setLoading] = useState(false)
  const [showRejectForm, setShowRejectForm] = useState(false)

  const isApproved = post.approval_status === 'approved'
  const needsRevision = post.approval_status === 'needs_revision'

  async function handle(accion: 'approve' | 'reject') {
    setLoading(true)
    await onAction(post.id, accion, accion === 'reject' ? comentario : undefined)
    setLoading(false)
    setShowRejectForm(false)
    setComentario('')
  }

  return (
    <div style={{
      background: '#fff', borderRadius: 16,
      border: `1px solid ${isApproved ? '#10B98130' : needsRevision ? '#F59E0B30' : '#E4E4E7'}`,
      padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: 14,
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <TipoBadge tipo={post.tipo} />
          {isApproved && <span style={{ fontFamily: 'var(--f-mono)', fontSize: 9, color: '#10B981', background: '#dcfce7', borderRadius: 4, padding: '2px 8px', letterSpacing: '0.06em' }}>✓ Aprobado</span>}
          {needsRevision && <span style={{ fontFamily: 'var(--f-mono)', fontSize: 9, color: '#F59E0B', background: '#fef3c7', borderRadius: 4, padding: '2px 8px', letterSpacing: '0.06em' }}>Cambios pedidos</span>}
        </div>
        <span style={{ fontFamily: 'var(--f-mono)', fontSize: 9, color: '#A1A1AA', letterSpacing: '0.04em' }}>
          {new Date(post.created_at).toLocaleDateString('es-AR')}
          {post.scheduled_at && ` · pub. ${new Date(post.scheduled_at).toLocaleDateString('es-AR')}`}
        </span>
      </div>

      {/* Preview visual */}
      {post.media_url && (
        <img src={post.media_url} alt="preview" style={{ width: '100%', maxHeight: 300, objectFit: 'cover', borderRadius: 10, border: '1px solid #F4F4F5' }} />
      )}

      {/* Caption */}
      <div>
        <p style={{ fontFamily: 'var(--f-mono)', fontSize: 9, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#A1A1AA', marginBottom: 6 }}>Caption</p>
        <p style={{ fontFamily: 'var(--f-display)', fontSize: 13, color: '#3F3F46', lineHeight: 1.6, margin: 0, whiteSpace: 'pre-wrap' }}>
          {expanded ? post.caption : post.caption.slice(0, 200) + (post.caption.length > 200 ? '…' : '')}
        </p>
        {post.caption.length > 200 && (
          <button onClick={() => setExpanded(!expanded)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--f-mono)', fontSize: 10, color: '#71717A', padding: 0, marginTop: 4 }}>
            {expanded ? 'Ver menos' : 'Ver completo'}
          </button>
        )}
      </div>

      {/* Visual prompt */}
      {post.visual_prompt && (
        <div>
          <p style={{ fontFamily: 'var(--f-mono)', fontSize: 9, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#A1A1AA', marginBottom: 6 }}>
            Prompt visual ({post.herramienta})
          </p>
          <div style={{ background: PAPER, borderRadius: 8, padding: '10px 14px', fontFamily: 'var(--f-mono)', fontSize: 11, color: '#52525B', lineHeight: 1.5 }}>
            {post.visual_prompt}
          </div>
        </div>
      )}

      {/* Acciones */}
      {!isApproved && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, borderTop: '1px solid #F4F4F5', paddingTop: 14 }}>
          {!showRejectForm ? (
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <button
                onClick={() => handle('approve')}
                disabled={loading}
                style={{
                  flex: 1, background: '#10B981', color: '#fff', border: 'none',
                  borderRadius: 9, padding: '10px 18px', cursor: 'pointer',
                  fontFamily: 'var(--f-mono)', fontWeight: 700, fontSize: 11,
                  letterSpacing: '0.06em', textTransform: 'uppercase', minWidth: 120,
                  opacity: loading ? 0.6 : 1,
                }}
              >
                ✓ Aprobar
              </button>
              <button
                onClick={() => setShowRejectForm(true)}
                disabled={loading}
                style={{
                  flex: 1, background: PAPER, color: INK, border: '1px solid #E4E4E7',
                  borderRadius: 9, padding: '10px 18px', cursor: 'pointer',
                  fontFamily: 'var(--f-mono)', fontSize: 11, letterSpacing: '0.06em',
                  textTransform: 'uppercase', minWidth: 120,
                }}
              >
                Pedir cambios
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <textarea
                placeholder="¿Qué querés que cambiemos?"
                value={comentario}
                onChange={e => setComentario(e.target.value)}
                style={{
                  width: '100%', minHeight: 80, borderRadius: 8, border: '1px solid #E4E4E7',
                  padding: '10px 12px', fontFamily: 'var(--f-display)', fontSize: 13,
                  resize: 'vertical', outline: 'none', boxSizing: 'border-box',
                }}
              />
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  onClick={() => handle('reject')}
                  disabled={!comentario.trim() || loading}
                  style={{
                    flex: 1, background: '#F59E0B', color: '#fff', border: 'none',
                    borderRadius: 8, padding: '9px 16px', cursor: 'pointer',
                    fontFamily: 'var(--f-mono)', fontWeight: 700, fontSize: 11,
                    letterSpacing: '0.06em', opacity: !comentario.trim() || loading ? 0.5 : 1,
                  }}
                >
                  Enviar feedback
                </button>
                <button
                  onClick={() => { setShowRejectForm(false); setComentario('') }}
                  style={{ background: PAPER, border: '1px solid #E4E4E7', borderRadius: 8, padding: '9px 16px', cursor: 'pointer', fontFamily: 'var(--f-mono)', fontSize: 11 }}
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}

          {post.approval_comment && (
            <div style={{ background: '#fef3c7', borderRadius: 8, padding: '10px 14px' }}>
              <p style={{ fontFamily: 'var(--f-mono)', fontSize: 9, textTransform: 'uppercase', color: '#92400E', marginBottom: 4 }}>Tu pedido anterior</p>
              <p style={{ fontFamily: 'var(--f-display)', fontSize: 12, color: '#78350F', margin: 0 }}>{post.approval_comment}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default function ContentApprovalPage() {
  const params = useParams()
  const clientId = params?.clientId as string

  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [feedback, setFeedback] = useState('')

  useEffect(() => {
    if (!clientId) return
    fetch(`/api/social/approve?clientId=${clientId}`)
      .then(r => r.json())
      .then(d => { if (d.error) setError(d.error); else setPosts(d.posts ?? []) })
      .catch(() => setError('Error al cargar el contenido'))
      .finally(() => setLoading(false))
  }, [clientId])

  async function handleAction(id: string, accion: 'approve' | 'reject', comentario?: string) {
    const res = await fetch('/api/social/approve', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ post_id: id, accion, comentario }),
    })
    const d = await res.json()
    if (d.ok) {
      setPosts(prev => prev.map(p => p.id === id ? { ...p, approval_status: d.estado, approval_comment: comentario ?? null } : p))
      setFeedback(accion === 'approve' ? '✓ Aprobado correctamente' : '📝 Feedback enviado')
      setTimeout(() => setFeedback(''), 3000)
    }
  }

  const pendientes = posts.filter(p => p.approval_status !== 'approved').length
  const aprobados = posts.filter(p => p.approval_status === 'approved').length

  return (
    <div style={{ minHeight: '100vh', background: PAPER }}>
      {/* Header */}
      <div style={{ background: INK, padding: '18px 24px' }}>
        <div style={{ maxWidth: 760, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
          <div>
            <p style={{ fontFamily: 'var(--f-mono)', fontSize: 9, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', marginBottom: 2 }}>
              Content Factory · DIVINIA
            </p>
            <h1 style={{ fontFamily: 'var(--f-display)', fontWeight: 700, fontSize: 20, color: '#fff', margin: 0 }}>
              Aprobá tu contenido
            </h1>
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            {[{ label: 'Para revisar', val: pendientes, color: '#F59E0B' }, { label: 'Aprobados', val: aprobados, color: '#10B981' }].map(k => (
              <div key={k.label} style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: 'var(--f-mono)', fontWeight: 700, fontSize: 22, color: k.color }}>{k.val}</div>
                <div style={{ fontFamily: 'var(--f-mono)', fontSize: 8, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{k.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 760, margin: '0 auto', padding: '24px' }}>
        {feedback && (
          <div style={{ background: '#dcfce7', border: '1px solid #10B98130', borderRadius: 10, padding: '10px 16px', marginBottom: 16, fontFamily: 'var(--f-mono)', fontSize: 11, color: '#16a34a', textAlign: 'center' }}>
            {feedback}
          </div>
        )}

        {loading && <p style={{ fontFamily: 'var(--f-display)', color: '#71717A', textAlign: 'center', padding: 40 }}>Cargando...</p>}
        {!loading && error && <p style={{ fontFamily: 'var(--f-display)', color: '#dc2626', textAlign: 'center', padding: 40 }}>{error}</p>}
        {!loading && !error && posts.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 24px' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>✨</div>
            <h2 style={{ fontFamily: 'var(--f-display)', fontWeight: 700, fontSize: 20, margin: '0 0 8px' }}>Sin contenido pendiente</h2>
            <p style={{ fontFamily: 'var(--f-display)', fontSize: 14, color: '#71717A' }}>
              No hay posts para revisar esta semana. Volvé en unos días.
            </p>
          </div>
        )}

        {posts.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {posts.map(post => (
              <PostCard key={post.id} post={post} onAction={handleAction} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
