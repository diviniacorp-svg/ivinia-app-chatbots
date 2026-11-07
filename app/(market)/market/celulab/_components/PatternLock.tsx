'use client'
import { useState, useRef } from 'react'

// Dot numbers: 1-9 left→right, top→bottom (same as Android)
const SIZE = 200
const DOTS = [
  { n: 1, x: 40,  y: 40  },
  { n: 2, x: 100, y: 40  },
  { n: 3, x: 160, y: 40  },
  { n: 4, x: 40,  y: 100 },
  { n: 5, x: 100, y: 100 },
  { n: 6, x: 160, y: 100 },
  { n: 7, x: 40,  y: 160 },
  { n: 8, x: 100, y: 160 },
  { n: 9, x: 160, y: 160 },
]
const HIT = 26  // hit radius in SVG units

interface Props {
  value: number[]       // ordered array of selected dot numbers
  onChange: (v: number[]) => void
  color?: string
}

export function PatternLock({ value, onChange, color = '#6366f1' }: Props) {
  const [drawing, setDrawing] = useState(false)
  const [cursor, setCursor] = useState<{ x: number; y: number } | null>(null)
  const svgRef = useRef<SVGSVGElement>(null)

  function toSvgPos(clientX: number, clientY: number) {
    const rect = svgRef.current!.getBoundingClientRect()
    return {
      x: ((clientX - rect.left) / rect.width)  * SIZE,
      y: ((clientY - rect.top)  / rect.height) * SIZE,
    }
  }

  function dotAt(x: number, y: number): number | null {
    for (const d of DOTS) {
      const dx = x - d.x, dy = y - d.y
      if (dx * dx + dy * dy <= HIT * HIT) return d.n
    }
    return null
  }

  function onPointerDown(e: React.PointerEvent<SVGSVGElement>) {
    e.preventDefault()
    svgRef.current?.setPointerCapture(e.pointerId)
    const pos = toSvgPos(e.clientX, e.clientY)
    setCursor(pos)
    setDrawing(true)
    const d = dotAt(pos.x, pos.y)
    onChange(d ? [d] : [])
  }

  function onPointerMove(e: React.PointerEvent<SVGSVGElement>) {
    if (!drawing) return
    const pos = toSvgPos(e.clientX, e.clientY)
    setCursor(pos)
    const d = dotAt(pos.x, pos.y)
    if (d && !value.includes(d)) onChange([...value, d])
  }

  function onPointerUp() {
    setDrawing(false)
    setCursor(null)
  }

  // Shorten a line so it ends before the destination dot (for arrowhead)
  function shortenLine(x1: number, y1: number, x2: number, y2: number, by = 14) {
    const dx = x2 - x1, dy = y2 - y1
    const len = Math.sqrt(dx * dx + dy * dy)
    if (len < by * 2) return { x1, y1, x2, y2 }
    return {
      x1: x1 + (dx / len) * by,
      y1: y1 + (dy / len) * by,
      x2: x2 - (dx / len) * by,
      y2: y2 - (dy / len) * by,
    }
  }

  const markerId = `arrow-${color.replace('#', '')}`

  return (
    <div>
      <svg
        ref={svgRef}
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        width={SIZE}
        height={SIZE}
        style={{ touchAction: 'none', cursor: drawing ? 'crosshair' : 'default', userSelect: 'none', display: 'block' }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
      >
        <defs>
          <marker id={markerId} markerWidth="7" markerHeight="7" refX="3.5" refY="3.5" orient="auto">
            <path d="M0,0 L7,3.5 L0,7 Z" fill={color} opacity="0.75" />
          </marker>
        </defs>

        {/* Connecting lines with arrows */}
        {value.slice(0, -1).map((n, i) => {
          const from = DOTS[n - 1]
          const to   = DOTS[value[i + 1] - 1]
          const { x1, y1, x2, y2 } = shortenLine(from.x, from.y, to.x, to.y)
          return (
            <line
              key={i}
              x1={x1} y1={y1} x2={x2} y2={y2}
              stroke={color}
              strokeWidth={2.5}
              strokeOpacity={0.65}
              markerEnd={`url(#${markerId})`}
            />
          )
        })}

        {/* Dashed line to cursor */}
        {drawing && cursor && value.length > 0 && (() => {
          const last = DOTS[value[value.length - 1] - 1]
          return (
            <line
              x1={last.x} y1={last.y} x2={cursor.x} y2={cursor.y}
              stroke={color} strokeWidth={2} strokeOpacity={0.25} strokeDasharray="5 4"
            />
          )
        })()}

        {/* Dots */}
        {DOTS.map(d => {
          const idx = value.indexOf(d.n)
          const active = idx >= 0
          return (
            <g key={d.n}>
              {/* Outer ring when active */}
              {active && <circle cx={d.x} cy={d.y} r={18} fill={color} fillOpacity={0.12} />}
              {/* Main dot */}
              <circle
                cx={d.x} cy={d.y}
                r={active ? 13 : 8}
                fill={active ? color : '#e2e8f0'}
                stroke={active ? color : '#cbd5e1'}
                strokeWidth={active ? 0 : 1.5}
                style={{ transition: 'r .1s, fill .1s' }}
              />
              {/* Step number */}
              {active && (
                <text x={d.x} y={d.y + 4} textAnchor="middle" fontSize={10} fontWeight="bold" fill="#fff" style={{ pointerEvents: 'none' }}>
                  {idx + 1}
                </text>
              )}
            </g>
          )
        })}
      </svg>

      {/* Controls below */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 8 }}>
        <span style={{ fontSize: 12, color: '#9ca3af' }}>
          {value.length === 0 ? 'Dibujá el patrón' : `${value.length} puntos: ${value.join('-')}`}
        </span>
        {value.length > 0 && (
          <button
            onClick={() => onChange([])}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, color: '#6366f1', padding: 0, fontWeight: 600 }}
          >
            ↺ Borrar
          </button>
        )}
      </div>
    </div>
  )
}