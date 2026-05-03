'use client'
import { useState } from 'react'
import Reveal from './Reveal'

const WA = 'https://wa.me/5492665286110?text='

function formatARS(n: number) {
  const rounded = Math.round(n)
  const str = rounded.toString()
  const withDots = str.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
  return `$ ${withDots}`
}

export default function ROICalculator() {
  const [turnosPerdidos, setTurnosPerdidos] = useState(5)
  const [valorTurno, setValorTurno] = useState(5000)

  const perdidaMensual = turnosPerdidos * 4.33 * valorTurno
  const costoTurnero = 45000
  const gananciaExtra = perdidaMensual - costoTurnero
  const diasRetorno = Math.ceil(costoTurnero / (perdidaMensual / 30))
  const roi = Math.round((gananciaExtra / costoTurnero) * 100)

  const waMsg = `Hola%20DIVINIA%2C%20estoy%20perdiendo%20${turnosPerdidos}%20turnos%20por%20semana%20y%20quiero%20el%20Turnero`

  return (
    <section style={{
      padding: '100px 0',
      background: 'var(--paper)',
      borderTop: '1px solid var(--line)',
    }}>
      <div className="wrap-v2">

        <Reveal>
          <div style={{ display: 'grid', gap: 40, marginBottom: 56 }}
            className="grid-cols-2-mobile-1 md:grid-cols-[1fr_2fr]">
            <div>
              <div className="eyebrow" style={{ marginBottom: 16 }}>¿Te conviene? — 04/05</div>
              <h2 className="h-title">
                Calculá tu<br />
                <em>retorno real.</em>
              </h2>
            </div>
            <p style={{
              alignSelf: 'end',
              fontSize: 18,
              lineHeight: 1.55,
              color: 'var(--muted-2)',
              fontFamily: 'var(--f-display)',
              maxWidth: '48ch',
            }}>
              Ajustá los números de tu negocio y mirá cuánto te cuesta no tener el Turnero.
            </p>
          </div>
        </Reveal>

        <Reveal delay={100}>
          <div style={{
            display: 'grid',
            gap: 2,
            borderRadius: 24,
            overflow: 'hidden',
            border: '1px solid var(--line)',
          }}
            className="grid-cols-2-mobile-1 md:grid-cols-2"
          >
            {/* Inputs */}
            <div style={{
              background: 'var(--paper-2)',
              padding: '48px 40px',
              display: 'flex',
              flexDirection: 'column',
              gap: 40,
            }}>
              <div>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'baseline',
                  marginBottom: 16,
                }}>
                  <label style={{
                    fontFamily: 'var(--f-display)',
                    fontWeight: 600,
                    fontSize: 16,
                    color: 'var(--ink)',
                  }}>
                    Turnos que perdés por semana
                  </label>
                  <span style={{
                    fontFamily: 'var(--f-display)',
                    fontStyle: 'italic',
                    fontWeight: 700,
                    fontSize: 32,
                    color: '#FF5E3A',
                    letterSpacing: '-0.04em',
                  }}>
                    {turnosPerdidos}
                  </span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={30}
                  value={turnosPerdidos}
                  onChange={e => setTurnosPerdidos(Number(e.target.value))}
                  style={{
                    width: '100%',
                    accentColor: '#FF5E3A',
                    height: 6,
                    cursor: 'pointer',
                  }}
                />
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontFamily: 'var(--f-mono)',
                  fontSize: 9,
                  color: 'var(--muted)',
                  letterSpacing: '0.08em',
                  marginTop: 6,
                }}>
                  <span>1 turno</span>
                  <span>30 turnos</span>
                </div>
              </div>

              <div>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'baseline',
                  marginBottom: 16,
                }}>
                  <label style={{
                    fontFamily: 'var(--f-display)',
                    fontWeight: 600,
                    fontSize: 16,
                    color: 'var(--ink)',
                  }}>
                    Valor promedio de cada turno
                  </label>
                  <span style={{
                    fontFamily: 'var(--f-display)',
                    fontStyle: 'italic',
                    fontWeight: 700,
                    fontSize: 28,
                    color: 'var(--ink)',
                    letterSpacing: '-0.04em',
                  }}>
                    {formatARS(valorTurno)}
                  </span>
                </div>
                <input
                  type="range"
                  min={1000}
                  max={20000}
                  step={500}
                  value={valorTurno}
                  onChange={e => setValorTurno(Number(e.target.value))}
                  style={{
                    width: '100%',
                    accentColor: 'var(--ink)',
                    height: 6,
                    cursor: 'pointer',
                  }}
                />
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontFamily: 'var(--f-mono)',
                  fontSize: 9,
                  color: 'var(--muted)',
                  letterSpacing: '0.08em',
                  marginTop: 6,
                }}>
                  <span>$1.000</span>
                  <span>$20.000</span>
                </div>
              </div>

              <div style={{
                background: 'var(--paper)',
                border: '1px solid var(--line)',
                borderRadius: 12,
                padding: '16px 18px',
              }}>
                <div style={{
                  fontFamily: 'var(--f-mono)',
                  fontSize: 9,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  color: 'var(--muted)',
                  marginBottom: 4,
                }}>
                  Asumimos
                </div>
                <div style={{
                  fontFamily: 'var(--f-display)',
                  fontSize: 12,
                  color: 'var(--muted-2)',
                  lineHeight: 1.55,
                }}>
                  Clientes que no pudieras atender por falta de sistema, fuera de horario,
                  o sin respuesta a tiempo. El cálculo es conservador.
                </div>
              </div>
            </div>

            {/* Resultado */}
            <div style={{
              background: 'var(--ink)',
              padding: '48px 40px',
              display: 'flex',
              flexDirection: 'column',
              gap: 28,
            }}>
              <div style={{
                fontFamily: 'var(--f-mono)',
                fontSize: 10,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: 'rgba(246,245,242,0.35)',
              }}>
                Tu resultado
              </div>

              {/* Pérdida mensual */}
              <div>
                <div style={{
                  fontFamily: 'var(--f-display)',
                  fontSize: 13,
                  color: 'rgba(246,245,242,0.4)',
                  marginBottom: 4,
                }}>
                  Perdés por mes sin sistema
                </div>
                <div style={{
                  fontFamily: 'var(--f-display)',
                  fontStyle: 'italic',
                  fontWeight: 700,
                  fontSize: 'clamp(32px, 4vw, 52px)',
                  color: '#FF5E3A',
                  letterSpacing: '-0.05em',
                  lineHeight: 1,
                }}>
                  {formatARS(perdidaMensual)}
                </div>
              </div>

              {/* Costo Turnero */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
              }}>
                <div style={{
                  height: 1,
                  flex: 1,
                  background: 'rgba(246,245,242,0.1)',
                }} />
                <div style={{
                  fontFamily: 'var(--f-mono)',
                  fontSize: 10,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  color: 'rgba(246,245,242,0.3)',
                }}>
                  vs
                </div>
                <div style={{
                  height: 1,
                  flex: 1,
                  background: 'rgba(246,245,242,0.1)',
                }} />
              </div>

              <div>
                <div style={{
                  fontFamily: 'var(--f-display)',
                  fontSize: 13,
                  color: 'rgba(246,245,242,0.4)',
                  marginBottom: 4,
                }}>
                  Turnero DIVINIA cuesta
                </div>
                <div style={{
                  fontFamily: 'var(--f-display)',
                  fontStyle: 'italic',
                  fontWeight: 700,
                  fontSize: 'clamp(28px, 3vw, 40px)',
                  color: 'var(--lime)',
                  letterSpacing: '-0.04em',
                  lineHeight: 1,
                }}>
                  $45.000/mes
                </div>
              </div>

              {/* Retorno */}
              <div style={{
                background: 'rgba(198,255,61,0.08)',
                border: '1px solid rgba(198,255,61,0.2)',
                borderRadius: 14,
                padding: '20px 22px',
              }}>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: 16,
                }}>
                  <div>
                    <div style={{
                      fontFamily: 'var(--f-mono)',
                      fontSize: 9,
                      letterSpacing: '0.1em',
                      textTransform: 'uppercase',
                      color: 'rgba(198,255,61,0.6)',
                      marginBottom: 4,
                    }}>
                      ROI
                    </div>
                    <div style={{
                      fontFamily: 'var(--f-display)',
                      fontStyle: 'italic',
                      fontWeight: 700,
                      fontSize: 28,
                      color: 'var(--lime)',
                      letterSpacing: '-0.04em',
                    }}>
                      {gananciaExtra > 0 ? `+${roi}%` : '—'}
                    </div>
                  </div>
                  <div>
                    <div style={{
                      fontFamily: 'var(--f-mono)',
                      fontSize: 9,
                      letterSpacing: '0.1em',
                      textTransform: 'uppercase',
                      color: 'rgba(198,255,61,0.6)',
                      marginBottom: 4,
                    }}>
                      Se paga en
                    </div>
                    <div style={{
                      fontFamily: 'var(--f-display)',
                      fontStyle: 'italic',
                      fontWeight: 700,
                      fontSize: 28,
                      color: 'var(--lime)',
                      letterSpacing: '-0.04em',
                    }}>
                      {diasRetorno > 0 && diasRetorno < 365 ? `${diasRetorno}d` : '< 1d'}
                    </div>
                  </div>
                </div>
              </div>

              <a
                href={`${WA}${waMsg}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'block',
                  textAlign: 'center',
                  padding: '15px 24px',
                  borderRadius: 12,
                  background: 'var(--lime)',
                  color: 'var(--ink)',
                  textDecoration: 'none',
                  fontFamily: 'var(--f-mono)',
                  fontWeight: 700,
                  fontSize: 12,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  marginTop: 'auto',
                }}
              >
                Recuperar esos turnos →
              </a>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
