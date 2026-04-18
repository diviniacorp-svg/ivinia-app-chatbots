interface KPIBandProps {
  metrics: {
    leads_nuevos: number; leads_calientes: number; clientes_activos: number
    mrr_actual: number; reservas_hoy: number; contenido_hoy: number; en_trial: number
  } | null
}

const kpis = (m: KPIBandProps['metrics']) => [
  { label: 'Leads nuevos', value: m?.leads_nuevos ?? '—', accent: false },
  { label: 'Leads calientes', value: m?.leads_calientes ?? '—', accent: (m?.leads_calientes ?? 0) > 0 },
  { label: 'Clientes activos', value: m?.clientes_activos ?? '—', accent: false },
  { label: 'En trial', value: m?.en_trial ?? '—', accent: false },
  { label: 'MRR actual', value: m ? `$${Number(m.mrr_actual).toLocaleString('es-AR')}` : '—', accent: (m?.mrr_actual ?? 0) > 0 },
  { label: 'Reservas hoy', value: m?.reservas_hoy ?? '—', accent: false },
  { label: 'Contenido hoy', value: m?.contenido_hoy ?? '—', accent: false },
]

export default function KPIBand({ metrics }: KPIBandProps) {
  const items = kpis(metrics)
  return (
    <div style={{
      display: 'flex', gap: 0, borderTop: '1px solid var(--line)', borderBottom: '1px solid var(--line)',
      overflowX: 'auto',
    }}>
      {items.map((k, i) => (
        <div key={k.label} style={{
          flex: '0 0 auto', minWidth: 120, padding: '20px 24px',
          borderRight: i < items.length - 1 ? '1px solid var(--line)' : 'none',
        }}>
          <div style={{
            fontFamily: 'var(--f-display)', fontStyle: 'italic', fontWeight: 700,
            fontSize: 28, letterSpacing: '-0.04em', lineHeight: 1,
            color: k.accent ? 'var(--lime)' : 'var(--ink)',
            marginBottom: 6,
          }}>
            {k.value}
          </div>
          <div style={{ fontFamily: 'var(--f-mono)', fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--muted)' }}>
            {k.label}
          </div>
        </div>
      ))}
    </div>
  )
}
