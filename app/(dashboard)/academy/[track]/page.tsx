'use client'

import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'

interface Lesson {
  slug: string
  title: string
  content: string
}

export default function AcademyTrackEditor() {
  const { track } = useParams<{ track: string }>()
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [active, setActive] = useState<Lesson | null>(null)
  const [draft, setDraft] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [trackMeta, setTrackMeta] = useState<{ title?: string }>({})

  useEffect(() => {
    fetch(`/api/academy/lesson?track=${track}`)
      .then(r => r.json())
      .then(data => {
        if (data.lessons) {
          setLessons(data.lessons)
          if (data.lessons.length > 0) {
            setActive(data.lessons[0])
            setDraft(data.lessons[0].content)
          }
        }
        if (data.meta) setTrackMeta(data.meta)
      })
      .catch(() => {})
  }, [track])

  function selectLesson(lesson: Lesson) {
    setActive(lesson)
    setDraft(lesson.content)
    setSaved(false)
  }

  async function save() {
    if (!active) return
    setSaving(true)
    setSaved(false)
    try {
      const res = await fetch('/api/academy/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ track, lesson: active.slug, content: draft }),
      })
      if (res.ok) {
        setSaved(true)
        setLessons(prev => prev.map(l =>
          l.slug === active.slug ? { ...l, content: draft } : l
        ))
        setTimeout(() => setSaved(false), 3000)
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden">
      {/* Sidebar */}
      <div className="w-64 shrink-0 border-r border-zinc-800 bg-zinc-950 flex flex-col">
        <div className="p-4 border-b border-zinc-800">
          <Link href="/academy" className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors">
            ← Academy
          </Link>
          <h2 className="text-sm font-semibold text-white mt-2 leading-tight">
            {trackMeta.title || track}
          </h2>
          <p className="text-xs text-zinc-500 font-mono mt-1">{lessons.length} lecciones</p>
        </div>

        <div className="flex-1 overflow-y-auto py-2">
          {lessons.map(lesson => (
            <button
              key={lesson.slug}
              onClick={() => selectLesson(lesson)}
              className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                active?.slug === lesson.slug
                  ? 'bg-zinc-800 text-white'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
              }`}
            >
              <p className="font-medium truncate">{lesson.title || lesson.slug}</p>
              <p className="text-xs text-zinc-600 font-mono mt-0.5 truncate">{lesson.slug}</p>
            </button>
          ))}

          {lessons.length === 0 && (
            <p className="px-4 py-3 text-xs text-zinc-600">
              No hay lecciones en este track.
            </p>
          )}
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {active ? (
          <>
            <div className="flex items-center justify-between px-6 py-3 border-b border-zinc-800 bg-zinc-950">
              <div>
                <h3 className="text-sm font-semibold text-white">{active.title || active.slug}</h3>
                <p className="text-xs text-zinc-500 font-mono">{active.slug}.md</p>
              </div>
              <div className="flex items-center gap-3">
                {saved && (
                  <span className="text-xs text-green-400 font-medium">Guardado ✓</span>
                )}
                <button
                  onClick={save}
                  disabled={saving}
                  className="px-4 py-1.5 bg-lime-500 hover:bg-lime-400 text-black text-sm font-semibold rounded-lg transition-colors disabled:opacity-50"
                >
                  {saving ? 'Guardando…' : 'Guardar'}
                </button>
              </div>
            </div>

            <textarea
              value={draft}
              onChange={e => setDraft(e.target.value)}
              className="flex-1 bg-zinc-950 text-zinc-100 font-mono text-sm p-6 resize-none outline-none leading-relaxed"
              spellCheck={false}
              placeholder="Contenido markdown de la lección…"
            />
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-zinc-600 text-sm">
            Seleccioná una lección para editar
          </div>
        )}
      </div>
    </div>
  )
}
