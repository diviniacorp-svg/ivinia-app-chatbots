'use client'

export function PrintButton({ accent }: { accent: string }) {
  return (
    <div style={{ marginTop: 28, display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
      <button
        onClick={() => window.print()}
        style={{
          background: accent,
          color: 'white',
          border: 'none',
          borderRadius: 10,
          padding: '10px 24px',
          fontWeight: 700,
          fontSize: 14,
          cursor: 'pointer',
        }}
      >
        Imprimir / Guardar PDF
      </button>
    </div>
  )
}
