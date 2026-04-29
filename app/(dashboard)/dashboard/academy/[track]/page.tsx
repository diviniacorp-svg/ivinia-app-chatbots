'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'

const INK = '#09090B'
const LIME = '#C6FF3D'
const PAPER = '#F6F5F2'
const LINE = '#E8E7E4'

interface Lesson {
  slug: string
  title: string
  content: string
}

interface TrackData {
  meta: Record<string, string>
  lessons: Lesson[]
}

function useSaved() {
  const [saved, setSaved] = useState(false)
  const trigger = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }
  return { saved, trigger }
}

export default function AcademyTrackEditorPage() {
  const params = useParams()
  const router = useRouter()
  const trackSlug = params?.track as string

  const [data, setData] = useState<TrackData | null>(null)
  const [activeLesson, setActiveLesson] = useState<string | null>(null)
  const [draft, setDraft] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [dirty, setDirty] = useState(false)
  const { saved, trigger: triggerSaved } = useSaved()
  const [error, setError] = useState('')

  useEffect(() => {
    if (!trackSlug) return
    setLoading(true)
    fetch(`/api/academy/lesson?track=${trackSlug}`)
      .then(r => r.json())
      .then(d => {
        if (d.error) { setError(d.error); return }
        setData(d)
        if (d.lessons?.length > 0) {
          setActiveLesson(d.lessons[0].slug)
          setDraft(d.lessons[0].content)
        }
      })
      .catch(() => setError('Error al cargar el track'))
      .finally(() => setLoading(false))
  }, [trackSlug])

  function selectLesson(slug: string) {
    const lesson = data?.lessons.find(l => l.slug === slug)
    if (!lesson) return
    setActiveLesson(slug)
    setDraft(lesson.content)
    setDirty(false)
  }

  async function save() {
    if (!activeLesson || !dirty) return
    setSaving(true)
    try {
      const res = await fetch('/api/academy/lesson', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ track: trackSlug, lesson: activeLesson, content: draft }),
      })
      const d = await res.json()
      if (d.ok) {
        setData(prev => prev ? {
          ...prev,
          lessons: prev.lessons.map(l => l.slug === activeLesson ? { ...l, content: draft } : l),
        } : prev)
        setDirty(false)
        triggerSaved()
      } else {
        setError(d.error ?? 'Error al guardar')
      }
    } finally {
      setSaving(false)
    }
  }

  const currentLesson = data?.lessons.find(l => l.slug === activeLesson)

  return (
    <div style={{ minHeight: '100vh', background: PAPER, display: 'flex', flexDirection: 'column' }}>
      {/* Top bar */}
      <div style={{
        background: INK, padding: '14px 28px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <Link href="/dashboard/academy" style={{
            fontFamily: 'var(--f-mono)', fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.4)', textDecoration: 'none',
          }}>
            ← Academy
          </Link>
          <span style={{ color: 'rgba(255,255,255,0.15)' }}>|</span>
          <span style={{ fontFamily: 'var(--f-display)', fontWeight: 600, fontSize: 15, color: '#fff' }}>
            {data?.meta.title ?? trackSlug}
          </span>
          {dirty && (
            <span style={{ fontFamily: 'var(--f-mono)', fontSize: 9, color: '#F59E0B', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              ● Sin guardar
            </span>
          )}
          {saved && (
            <span style={{ fontFamily: 'var(--f-mono)', fontSize: 9, color: LIME, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              ✓ Guardado
            </span>
          )}
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {activeLesson && (
            <Link
              href={`/academy/${trackSlug}/${activeLesson}`}
              target="_blank"
              style={{
                fontFamily: 'var(--f-mono)', fontSize: 10, letterSpacing: '0.06em', textTransform: 'uppercase',
                color: 'rgba(255,255,255,0.4)', textDecoration: 'none', padding: '7px 14px',
                border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8,
              }}
            >
              Ver público →
            </Link>
          )}
          <button
            onClick={save}
            disabled={!dirty || saving}
            style={{
              background: dirty ? LIME : 'rgba(255,255,255,0.08)',
              color: dirty ? INK : 'rgba(255,255,255,0.3)',
              border: 'none', borderRadius: 8, padding: '8px 20px', cursor: dirty ? 'pointer' : 'default',
              fontFamily: 'var(--f-mono)', fontWeight: 700, fontSize: 10, letterSpacing: '0.08em',
              textTransform: 'uppercase', transition: 'all 0.15s',
              opacity: saving ? 0.6 : 1,
            }}
          >
            {saving ? 'Guardando…' : 'Guardar'}
          </button>
        </div>
      </div>

      {loading && (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <p style={{ fontFamily: 'var(--f-mono)', fontSize: 12, color: 'var(--muted)' }}>Cargando track…</p>
        </div>
      )}

      {error && !loading && (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <p style={{ fontFamily: 'var(--f-display)', color: '#dc2626' }}>{error}</p>
        </div>
      )}

      {!loading && !error && data && (
        <div style={{ flex: 1, display: 'flex', minHeight: 0 }}>
          {/* Sidebar — lecciones */}
          <div style={{
            width: 220, flexShrink: 0, borderRight: `1px solid ${LINE}`,
            background: '#fff', padding: '16px 0', overflowY: 'auto',
          }}>
            <div style={{ padding: '0 16px 12px', fontFamily: 'var(--f-mono)', fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--muted)' }}>
              Lecciones ({data.lessons.length})
            </div>
            {data.lessons.map((lesson, i) => (
              <button
                key={lesson.slug}
                onClick={() => selectLesson(lesson.slug)}
                style={{
                  width: '100%', textAlign: 'left', padding: '10px 16px', border: 'none', cursor: 'pointer',
                  background: activeLesson === lesson.slug ? `${LIME}20` : 'transparent',
                  borderLeft: activeLesson === lesson.slug ? `2px solid ${LIME}` : '2px solid transparent',
                  transition: 'all 0.1s',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{
                    minWidth: 18, height: 18, background: INK, color: LIME,
                    borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: 'var(--f-mono)', fontWeight: 700, fontSize: 8, flexShrink: 0,
                  }}>
                    {i + 1}
                  </span>
                  <span style={{ fontFamily: 'var(--f-display)', fontSize: 12, color: INK, lineHeight: 1.4 }}>
                    {lesson.slug.replace(/^\d+-/, '').replace(/-/g, ' ')}
                  </span>
                </div>
              </button>
            ))}
          </div>

          {/* Editor */}
          {currentLesson ? (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
              <div style={{ padding: '12px 24px', borderBottom: `1px solid ${LINE}`, background: '#fff' }}>
                <span style={{ fontFamily: 'var(--f-mono)', fontSize: 10, color: 'var(--muted)', letterSpacing: '0.06em' }}>
                  {trackSlug}/{currentLesson.slug}.md
                </span>
              </div>
              <textarea
                value={draft}
                onChange={e => { setDraft(e.target.value); setDirty(true) }}
                spellCheck={false}
                style={{
                  flex: 1, width: '100%', padding: '24px 28px',
                  fontFamily: '"SF Mono", "Fira Code", "Cascadia Code", monospace',
                  fontSize: 13, lineHeight: 1.8, color: INK,
                  background: PAPER, border: 'none', outline: 'none', resize: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>
          ) : (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <p style={{ fontFamily: 'var(--f-display)', color: 'var(--muted)' }}>Seleccioná una lección para editar</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
