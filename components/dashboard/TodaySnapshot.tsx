import Link from 'next/link'

interface Lead { id: string; nombre?: string; negocio?: string; score?: number; status?: string }
interface Content { id: string; titulo?: string; tipo?: string; plataforma?: string; status?: string }
interface Agenda { id: string; contenido: string; importancia?: number }

interface Props {
  leads?: Lead[]
  content?: Content[]
  agenda?: Agenda[]
}

export default function TodaySnapshot({ leads = [], content = [], agenda = [] }: Props) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1 }} className="grid-cols-1 md:grid-cols-3">

      {/* Pipeline */}
      <div style={{ padding: '28px 28px', background: 'var(--paper)', border: '1px solid var(--line)', borderRadius: '16px 0 0 16px' }}>
        <div style={{ fontFamily: 'var(--f-mono)', fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 16 }}>
          Pipeline caliente
        </div>
        {leads.length === 0 ? (
          <div style={{ fontFamily: 'var(--f-display)', fontSize: 13, color: 'var(--muted-2)' }}>Sin leads calientes hoy</div>
        ) : leads.map(l => (
          <div key={l.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 12, marginBottom: 12, borderBottom: '1px solid var(--line)' }}>
            <div>
              <div style={{ fontFamily: 'var(--f-display)', fontWeight: 600, fontSize: 14, color: 'var(--ink)' }}>{l.negocio || l.nombre || 'Lead'}</div>
              <div style={{ fontFamily: 'var(--f-mono)', fontSize: 10, color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>{l.status}</div>
            </div>
            <div style={{
              background: (l.score ?? 0) >= 70 ? 'var(--lime)' : 'var(--paper-2)',
              color: (l.score ?? 0) >= 70 ? 'var(--ink)' : 'var(--muted)',
              borderRadius: 100, padding: '3px 10px',
              fontFamily: 'var(--f-mono)', fontSize: 11, fontWeight: 700,
            }}>
              {l.score ?? 0}
            </div>
          </div>
        ))}
        <Link href="/leads" style={{ fontFamily: 'var(--f-mono)', fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--muted)', textDecoration: 'none' }}>
          Ver todos los leads →
        </Link>
      </div>

      {/* Contenido hoy */}
      <div style={{ padding: '28px 28px', background: 'var(--paper)', border: '1px solid var(--line)' }}>
        <div style={{ fontFamily: 'var(--f-mono)', fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 16 }}>
          Contenido planificado hoy
        </div>
        {content.length === 0 ? (
          <div style={{ fontFamily: 'var(--f-display)', fontSize: 13, color: 'var(--muted-2)' }}>Nada planificado para hoy</div>
        ) : content.map(c => (
          <div key={c.id} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', paddingBottom: 12, marginBottom: 12, borderBottom: '1px solid var(--line)' }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--lime)', marginTop: 6, flexShrink: 0 }} />
            <div>
              <div style={{ fontFamily: 'var(--f-display)', fontWeight: 600, fontSize: 14, color: 'var(--ink)' }}>{c.titulo || 'Sin título'}</div>
              <div style={{ fontFamily: 'var(--f-mono)', fontSize: 10, color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>{c.plataforma} · {c.tipo}</div>
            </div>
          </div>
        ))}
        <Link href="/calendario" style={{ fontFamily: 'var(--f-mono)', fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--muted)', textDecoration: 'none' }}>
          Abrir calendario →
        </Link>
      </div>

      {/* Agenda Joaco */}
      <div style={{ padding: '28px 28px', background: 'var(--paper)', border: '1px solid var(--line)', borderRadius: '0 16px 16px 0' }}>
        <div style={{ fontFamily: 'var(--f-mono)', fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 16 }}>
          Agenda · acciones de Joaco
        </div>
        {agenda.length === 0 ? (
          <div style={{ fontFamily: 'var(--f-display)', fontSize: 13, color: 'var(--muted-2)' }}>Sin tareas pendientes</div>
        ) : agenda.map(t => (
          <div key={t.id} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', paddingBottom: 12, marginBottom: 12, borderBottom: '1px solid var(--line)' }}>
            <div style={{
              width: 6, height: 6, borderRadius: '50%', marginTop: 6, flexShrink: 0,
              background: (t.importancia ?? 5) >= 8 ? '#FF5E3A' : (t.importancia ?? 5) >= 6 ? 'var(--lime)' : 'var(--muted)',
            }} />
            <div style={{ fontFamily: 'var(--f-display)', fontSize: 13, color: 'var(--ink)', lineHeight: 1.45 }}>
              {t.contenido}
            </div>
          </div>
        ))}
        <Link href="/agents" style={{ fontFamily: 'var(--f-mono)', fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--muted)', textDecoration: 'none' }}>
          Ver agentes →
        </Link>
      </div>

    </div>
  )
}
