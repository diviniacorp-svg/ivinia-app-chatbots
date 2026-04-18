'use client'
import { useEffect, useState } from 'react'
import NeuralGraph from '@/components/dashboard/NeuralGraph'
import Link from 'next/link'

export default function NeuralGraphClient() {
  const [data, setData] = useState<any>(null)
  const [selected, setSelected] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/agents/graph').then(r => r.json()).then(setData)
    const id = setInterval(() => {
      fetch('/api/agents/graph').then(r => r.json()).then(setData)
    }, 30000)
    return () => clearInterval(id)
  }, [])

  const selectedNode = data?.nodes.find((n: any) => n.id === selected)

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 260px', gap: 24, alignItems: 'start' }} className="grid-cols-1 md:grid-cols-neural">
      <NeuralGraph data={data} selectedNode={selected} onNodeClick={id => setSelected(id === selected ? null : id)} />

      {/* Node detail panel */}
      <div style={{ paddingBottom: 32 }}>
        {selectedNode ? (
          <div style={{ background: 'rgba(255,255,255,0.04)', border: `1px solid ${selectedNode.color}33`, borderRadius: 16, padding: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <div style={{ width: 12, height: 12, borderRadius: '50%', background: selectedNode.color, flexShrink: 0 }} />
              <span style={{ fontFamily: 'var(--f-mono)', fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: selectedNode.color }}>
                {selectedNode.label}
              </span>
            </div>
            <div style={{ fontFamily: 'var(--f-display)', fontSize: 13, color: 'rgba(255,255,255,0.5)', lineHeight: 1.5 }}>
              {selectedNode.active ? 'Agente activo ahora' : selectedNode.hasActivity ? 'Actividad hoy' : 'Sin actividad reciente'}
            </div>
            {selectedNode.runCount > 0 && (
              <div style={{ marginTop: 12, fontFamily: 'var(--f-mono)', fontSize: 12, color: selectedNode.color }}>
                {selectedNode.runCount} runs en la última hora
              </div>
            )}
            <Link href="/agents" style={{ display: 'block', marginTop: 16, fontFamily: 'var(--f-mono)', fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', textDecoration: 'none' }}>
              Ver departamento →
            </Link>
          </div>
        ) : (
          <div style={{ padding: '24px 0' }}>
            <div style={{ fontFamily: 'var(--f-mono)', fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.25)', marginBottom: 12 }}>
              Clickeá un nodo
            </div>
            <div style={{ fontFamily: 'var(--f-display)', fontSize: 13, color: 'rgba(255,255,255,0.3)', lineHeight: 1.6 }}>
              Seleccioná cualquier departamento para ver su estado, agentes activos y actividad reciente.
            </div>
            <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 8 }}>
              {data?.nodes.filter((n: any) => n.active).map((n: any) => (
                <div key={n.id} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: n.color }} />
                  <span style={{ fontFamily: 'var(--f-display)', fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>{n.label} — activo</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
