'use client'
import { useState } from 'react'
import type { NucleusAgent } from '@/lib/nucleus/index'

interface Props {
  agent: NucleusAgent
  deptColor: string
  modelColor: string
}

export default function AgentCard({ agent, deptColor, modelColor }: Props) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div style={{
      background: '#fff', borderRadius: 14, border: '1px solid #E4E4E7',
      padding: '16px 20px', transition: 'border-color 0.15s',
    }}>
      {/* Top row */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1 }}>
          <span style={{ fontSize: 20, flexShrink: 0 }}>{agent.emoji}</span>
          <div>
            <div style={{ fontFamily: 'var(--f-display)', fontWeight: 700, fontSize: 14, color: '#09090B' }}>
              {agent.nombre}
            </div>
            <div style={{ fontFamily: 'var(--f-display)', fontSize: 12, color: '#71717A', marginTop: 2, lineHeight: 1.4 }}>
              {agent.funcion}
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 6, flexShrink: 0, alignItems: 'center' }}>
          <span style={{
            fontFamily: 'var(--f-mono)', fontSize: 8, padding: '2px 8px', borderRadius: 4,
            background: `${modelColor}14`, color: modelColor, border: `1px solid ${modelColor}30`,
            letterSpacing: '0.06em', textTransform: 'uppercase', fontWeight: 700,
          }}>
            {agent.modelo}
          </span>
          <button
            onClick={() => setExpanded(e => !e)}
            style={{
              fontFamily: 'var(--f-mono)', fontSize: 8, padding: '2px 8px', borderRadius: 4,
              background: '#F4F4F5', color: '#71717A', border: '1px solid #E4E4E7',
              cursor: 'pointer', letterSpacing: '0.06em', textTransform: 'uppercase',
            }}
          >
            {expanded ? 'cerrar' : 'ver más'}
          </button>
        </div>
      </div>

      {/* Tags */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 10 }}>
        {agent.herramientas.map(tool => (
          <span key={tool} style={{
            fontFamily: 'var(--f-mono)', fontSize: 8, padding: '2px 7px', borderRadius: 4,
            background: '#F4F4F5', color: '#71717A', border: '1px solid #E4E4E7',
          }}>
            {tool}
          </span>
        ))}
      </div>

      {/* Expanded */}
      {expanded && (
        <div style={{ marginTop: 14, borderTop: '1px solid #F4F4F5', paddingTop: 14 }}>

          {agent.activadoPor && agent.activadoPor.length > 0 && (
            <div style={{ marginBottom: 10 }}>
              <div style={{ fontFamily: 'var(--f-mono)', fontSize: 8, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#71717A', marginBottom: 4 }}>
                Activado por
              </div>
              <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                {agent.activadoPor.map(t => (
                  <span key={t} style={{
                    fontFamily: 'var(--f-mono)', fontSize: 8.5, padding: '2px 7px', borderRadius: 4,
                    background: `${deptColor}10`, color: deptColor, border: `1px solid ${deptColor}25`,
                  }}>
                    {t}
                  </span>
                ))}
              </div>
            </div>
          )}

          {agent.outputA && agent.outputA.length > 0 && (
            <div style={{ marginBottom: 10 }}>
              <div style={{ fontFamily: 'var(--f-mono)', fontSize: 8, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#71717A', marginBottom: 4 }}>
                Output a
              </div>
              <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                {agent.outputA.map(t => (
                  <span key={t} style={{
                    fontFamily: 'var(--f-mono)', fontSize: 8.5, padding: '2px 7px', borderRadius: 4,
                    background: '#F4F4F5', color: '#09090B', border: '1px solid #E4E4E7',
                  }}>
                    → {t}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div>
            <div style={{ fontFamily: 'var(--f-mono)', fontSize: 8, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#71717A', marginBottom: 6 }}>
              System prompt
            </div>
            <div style={{
              fontFamily: 'var(--f-mono)', fontSize: 10.5, color: '#3F3F46', lineHeight: 1.55,
              background: '#F8F8F8', padding: '10px 12px', borderRadius: 8, border: '1px solid #E4E4E7',
              whiteSpace: 'pre-wrap',
            }}>
              {agent.systemPrompt}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
