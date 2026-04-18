'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'

type SaveState = 'idle' | 'dirty' | 'saving' | 'saved'

function renderMarkdown(body: string): React.ReactNode[] {
  return body.split('\n\n').map((block, i) => {
    if (!block.trim()) return null

    if (block.startsWith('# '))
      return <h1 key={i} style={{ fontFamily: 'var(--f-display)', fontWeight: 700, fontSize: 26, letterSpacing: '-0.03em', marginTop: 40, marginBottom: 16, color: 'var(--ink)' }}>{block.slice(2)}</h1>
    if (block.startsWith('## '))
      return <h2 key={i} style={{ fontFamily: 'var(--f-display)', fontWeight: 700, fontSize: 20, letterSpacing: '-0.02em', marginTop: 32, marginBottom: 12, color: 'var(--ink)' }}>{block.slice(3)}</h2>
    if (block.startsWith('### '))
      return <h3 key={i} style={{ fontFamily: 'var(--f-display)', fontWeight: 600, fontSize: 17, marginTop: 24, marginBottom: 10, color: 'var(--ink)' }}>{block.slice(4)}</h3>

    if (block.startsWith('```')) {
      const code = block.replace(/^```\w*\n?/, '').replace(/\n?```$/, '')
      return (
        <pre key={i} style={{
          background: 'var(--ink)', color: 'var(--lime)',
          fontFamily: 'var(--f-mono)', fontSize: 12,
          padding: '16px 20px', borderRadius: 8, overflowX: 'auto', margin: '20px 0',
        }}>
          <code>{code}</code>
        </pre>
      )
    }

    if (block.startsWith('- ') || /^[0-9]+\. /.test(block)) {
      const items = block.split('\n').filter(l => l.trim())
      const isOrdered = /^[0-9]+\./.test(items[0] ?? '')
      const Tag = isOrdered ? 'ol' : 'ul'
      return (
        <Tag key={i} style={{ margin: '16px 0', paddingLeft: 24, display: 'flex', flexDirection: 'column', gap: 6 }}>
          {items.map((item, ii) => (
            <li key={ii} style={{ fontFamily: 'var(--f-display)', fontSize: 15, lineHeight: 1.6, color: 'var(--ink)' }}
              dangerouslySetInnerHTML={{
                __html: item
                  .replace(/^[-0-9.] /, '')
                  .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
                  .replace(/`(.+?)`/g, '<code style="font-family:var(--f-mono);font-size:12px;background:var(--paper-2);padding:1px 5px;border-radius:3px">$1</code>')
              }}
            />
          ))}
        </Tag>
      )
    }

    return (
      <p key={i} style={{ fontFamily: 'var(--f-display)', fontSize: 15, lineHeight: 1.75, color: 'var(--ink)', marginBottom: 20 }}
        dangerouslySetInnerHTML={{
          __html: block
            .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.+?)\*/g, '<em>$1</em>')
            .replace(/`(.+?)`/g, '<code style="font-family:var(--f-mono);font-size:12px;background:var(--paper-2);padding:1px 5px;border-radius:3px">$1</code>')
        }}
      />
    )
  }).filter(Boolean) as React.ReactNode[]
}

export default function LessonEditorPage({ params }: { params: { slug: string; lesson: string } }) {
  const { slug, lesson } = params
  const [content, setContent] = useState('')
  const [originalContent, setOriginalContent] = useState('')
  const [saveState, setSaveState] = useState<SaveState>('idle')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/academy/lesson?track=${encodeURIComponent(slug)}&lesson=${encodeURIComponent(lesson)}`)
        if (!res.ok) throw new Error(`Error ${res.status}`)
        const data = await res.json()
        setContent(data.content)
        setOriginalContent(data.content)
      } catch (e: any) {
        setError(e.message ?? 'Error al cargar la lección')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [slug, lesson])

  const handleChange = useCallback((val: string) => {
    setContent(val)
    setSaveState(val !== originalContent ? 'dirty' : 'idle')
  }, [originalContent])

  const handleSave = useCallback(async () => {
    setSaveState('saving')
    try {
      const res = await fetch('/api/academy/lesson', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ track: slug, lesson, content }),
      })
      if (!res.ok) throw new Error(`Error ${res.status}`)
      setOriginalContent(content)
      setSaveState('saved')
      setTimeout(() => setSaveState('idle'), 2000)
    } catch {
      setSaveState('dirty')
    }
  }, [slug, lesson, content])

  const saveLabel = {
    idle: 'Sin cambios',
    dirty: 'Cambios sin guardar',
    saving: 'Guardando...',
    saved: 'Guardado ✓',
  }[saveState]

  const saveBg = {
    idle: 'var(--paper-2)',
    dirty: '#FEF3C7',
    saving: 'var(--paper-2)',
    saved: '#D1FAE5',
  }[saveState]

  const saveColor = {
    idle: 'var(--muted)',
    dirty: '#92400E',
    saving: 'var(--muted)',
    saved: '#065F46',
  }[saveState]

  return (
    <div style={{ minHeight: '100vh', background: 'var(--paper-2)', display: 'flex', flexDirection: 'column' }}>

      {/* Header */}
      <div style={{
        padding: '16px 32px', borderBottom: '1px solid var(--line)', background: 'var(--paper)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Link
            href={`/dashboard/academy/${slug}`}
            style={{
              fontFamily: 'var(--f-mono)', fontSize: 10, letterSpacing: '0.08em',
              textTransform: 'uppercase', color: 'var(--muted)', textDecoration: 'none',
            }}
          >
            ← {slug}
          </Link>
          <span style={{ color: 'var(--muted)' }}>·</span>
          <span style={{ fontFamily: 'var(--f-mono)', fontSize: 10, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--ink)' }}>
            {lesson}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            padding: '6px 14px', borderRadius: 6,
            background: saveBg, color: saveColor,
            fontFamily: 'var(--f-mono)', fontSize: 10, letterSpacing: '0.06em',
            textTransform: 'uppercase', border: '1px solid var(--line)',
          }}>
            {saveLabel}
          </div>

          <button
            onClick={handleSave}
            disabled={saveState !== 'dirty'}
            style={{
              padding: '8px 20px', borderRadius: 8,
              background: saveState === 'dirty' ? 'var(--ink)' : 'var(--paper-2)',
              color: saveState === 'dirty' ? 'var(--lime)' : 'var(--muted)',
              fontFamily: 'var(--f-mono)', fontSize: 10, letterSpacing: '0.08em',
              textTransform: 'uppercase', border: '1px solid var(--line)',
              cursor: saveState === 'dirty' ? 'pointer' : 'default',
            }}
          >
            Guardar
          </button>
        </div>
      </div>

      {/* Editor area */}
      {loading ? (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 48 }}>
          <div style={{ fontFamily: 'var(--f-mono)', fontSize: 12, color: 'var(--muted)', letterSpacing: '0.06em' }}>
            Cargando lección...
          </div>
        </div>
      ) : error ? (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 48 }}>
          <div style={{ fontFamily: 'var(--f-display)', fontSize: 15, color: '#DC2626' }}>
            {error}
          </div>
        </div>
      ) : (
        <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', minHeight: 0 }}>

          {/* Editor */}
          <div style={{ borderRight: '1px solid var(--line)', display: 'flex', flexDirection: 'column' }}>
            <div style={{
              padding: '10px 20px', borderBottom: '1px solid var(--line)',
              fontFamily: 'var(--f-mono)', fontSize: 10, letterSpacing: '0.08em',
              textTransform: 'uppercase', color: 'var(--muted)', background: 'var(--paper)',
            }}>
              Editor · Markdown
            </div>
            <textarea
              value={content}
              onChange={e => handleChange(e.target.value)}
              spellCheck={false}
              style={{
                flex: 1, width: '100%', minHeight: 500,
                padding: '24px 24px', border: 'none', outline: 'none',
                background: 'var(--paper)', color: 'var(--ink)',
                fontFamily: 'var(--f-mono)', fontSize: 13, lineHeight: 1.7,
                resize: 'none', boxSizing: 'border-box',
              }}
            />
          </div>

          {/* Preview */}
          <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div style={{
              padding: '10px 20px', borderBottom: '1px solid var(--line)',
              fontFamily: 'var(--f-mono)', fontSize: 10, letterSpacing: '0.08em',
              textTransform: 'uppercase', color: 'var(--muted)', background: 'var(--paper)',
            }}>
              Preview
            </div>
            <div style={{ flex: 1, padding: '24px 32px', overflowY: 'auto', background: 'var(--paper)' }}>
              {renderMarkdown(content)}
            </div>
          </div>

        </div>
      )}
    </div>
  )
}
