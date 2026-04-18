'use client'
import { useEffect, useRef, useState } from 'react'

interface GraphNode {
  id: string; label: string; color: string
  x: number; y: number
  active?: boolean; hasActivity?: boolean; runCount?: number
}
interface GraphEdge { from: string; to: string; strength: number }
interface GraphData {
  nodes: GraphNode[]; edges: GraphEdge[]
  ceo: { id: string; label: string; color: string; x: number; y: number }
}

function usePulse(active: boolean) {
  const [scale, setScale] = useState(1)
  useEffect(() => {
    if (!active) return
    let t = 0
    const id = setInterval(() => {
      t += 0.1
      setScale(1 + Math.sin(t) * 0.08)
    }, 50)
    return () => clearInterval(id)
  }, [active])
  return scale
}

function NodeCircle({ node, cx, cy, r, onClick }: {
  node: GraphNode; cx: number; cy: number; r: number; onClick: () => void
}) {
  const [offset, setOffset] = useState(0)
  useEffect(() => {
    const seed = node.id.charCodeAt(0)
    let t = seed * 0.3
    const id = setInterval(() => {
      t += 0.02
      setOffset(Math.sin(t) * 5)
    }, 50)
    return () => clearInterval(id)
  }, [node.id])

  const finalCy = cy + offset

  return (
    <g onClick={onClick} style={{ cursor: 'pointer' }}>
      {node.active && (
        <circle cx={cx} cy={finalCy} r={r + 8} fill="none" stroke={node.color} strokeWidth={1} opacity={0.3} />
      )}
      <circle
        cx={cx} cy={finalCy} r={r}
        fill={node.active ? node.color : 'rgba(255,255,255,0.06)'}
        stroke={node.color}
        strokeWidth={node.active ? 0 : 1.5}
        style={{ transition: 'all 0.3s' }}
      />
      <text
        x={cx} y={finalCy + r + 14}
        textAnchor="middle" fill={node.active ? node.color : 'rgba(255,255,255,0.4)'}
        fontSize={9} fontFamily="var(--f-mono)" letterSpacing="0.08em"
      >
        {node.label.split(' ').slice(1).join(' ').toUpperCase()}
      </text>
    </g>
  )
}

export default function NeuralGraph({ data, selectedNode, onNodeClick }: {
  data: GraphData | null
  selectedNode: string | null
  onNodeClick: (id: string) => void
}) {
  const [pulseProgress, setPulseProgress] = useState<Record<string, number>>({})

  useEffect(() => {
    const id = setInterval(() => {
      const newProgress: Record<string, number> = {}
      data?.edges.forEach(e => {
        const key = `${e.from}-${e.to}`
        newProgress[key] = ((pulseProgress[key] ?? Math.random()) + 0.015) % 1
      })
      setPulseProgress(newProgress)
    }, 30)
    return () => clearInterval(id)
  }, [data, pulseProgress])

  if (!data) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 320, color: 'rgba(255,255,255,0.2)', fontFamily: 'var(--f-mono)', fontSize: 12 }}>
      cargando grafo...
    </div>
  )

  const W = 520, H = 360
  const getPos = (node: { x: number; y: number }) => ({ cx: node.x * W, cy: node.y * H })

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      style={{ width: '100%', height: 'auto', maxHeight: 380 }}
    >
      <defs>
        <radialGradient id="bg-grad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="rgba(198,255,61,0.04)" />
          <stop offset="100%" stopColor="rgba(0,0,0,0)" />
        </radialGradient>
      </defs>
      <rect width={W} height={H} fill="url(#bg-grad)" />

      {/* Edges */}
      {data.edges.map(edge => {
        const from = data.nodes.find(n => n.id === edge.from)
        const to = data.nodes.find(n => n.id === edge.to)
        if (!from || !to) return null
        const f = getPos(from), t = getPos(to)
        const key = `${edge.from}-${edge.to}`
        const prog = pulseProgress[key] ?? 0
        const px = f.cx + (t.cx - f.cx) * prog
        const py = f.cy + (t.cy - f.cy) * prog
        return (
          <g key={key}>
            <line x1={f.cx} y1={f.cy} x2={t.cx} y2={t.cy}
              stroke={from.color} strokeWidth={edge.strength > 0.5 ? 1 : 0.5}
              opacity={edge.strength > 0.5 ? 0.3 : 0.1}
            />
            {edge.strength > 0.5 && (
              <circle cx={px} cy={py} r={2.5} fill={from.color} opacity={0.8} />
            )}
          </g>
        )
      })}

      {/* Department nodes */}
      {data.nodes.map(node => {
        const { cx, cy } = getPos(node)
        return (
          <NodeCircle
            key={node.id} node={node}
            cx={cx} cy={cy} r={selectedNode === node.id ? 18 : 14}
            onClick={() => onNodeClick(node.id)}
          />
        )
      })}

      {/* CEO center node */}
      <g>
        <circle cx={W * 0.5} cy={H * 0.5} r={22} fill="#C6FF3D" opacity={0.15} />
        <circle cx={W * 0.5} cy={H * 0.5} r={16} fill="#C6FF3D" />
        <text x={W * 0.5} y={H * 0.5 + 4} textAnchor="middle"
          fill="#0E0E0E" fontSize={9} fontFamily="var(--f-mono)" fontWeight="bold" letterSpacing="0.05em">
          CEO
        </text>
      </g>
    </svg>
  )
}
