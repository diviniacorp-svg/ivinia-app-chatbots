import Navbar from '@/components/public/Navbar'
import Footer from '@/components/public/Footer'

export default function PrivacidadPage() {
  return (
    <main style={{ minHeight: '100vh', background: 'var(--paper)', color: 'var(--ink)', overflowX: 'hidden' }}>
      <div className="grid-bg" />
      <Navbar />

      <section style={{ padding: '120px 0 80px' }}>
        <div className="wrap-v2" style={{ maxWidth: 760 }}>
          <div className="eyebrow" style={{ marginBottom: 16 }}>Legal</div>
          <h1 className="h-display" style={{ fontSize: 'clamp(36px,5vw,64px)', marginBottom: 12 }}>
            Política de Privacidad
          </h1>
          <p style={{ fontFamily: 'var(--f-mono)', fontSize: 12, color: 'var(--muted)', letterSpacing: '0.06em', marginBottom: 48 }}>
            Última actualización: Abril 2026 · Ley 25.326 de Protección de Datos Personales
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>

            <div>
              <h2 style={{ fontFamily: 'var(--f-display)', fontSize: 20, fontWeight: 700, marginBottom: 12 }}>1. Responsable del tratamiento</h2>
              <p style={{ fontSize: 15, color: 'var(--muted-2)', fontFamily: 'var(--f-display)', lineHeight: 1.7 }}>
                <strong style={{ color: 'var(--ink)' }}>DIVINIA</strong>, con domicilio en San Luis Capital, Argentina. Contacto de privacidad: <a href="mailto:diviniacorp@gmail.com" style={{ color: 'var(--ink)', fontWeight: 600 }}>diviniacorp@gmail.com</a>
              </p>
            </div>

            <div>
              <h2 style={{ fontFamily: 'var(--f-display)', fontSize: 20, fontWeight: 700, marginBottom: 12 }}>2. Qué datos recopilamos</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={{ background: 'var(--paper-2)', border: '1px solid var(--line)', borderRadius: 12, padding: '20px 24px' }}>
                  <div style={{ fontFamily: 'var(--f-mono)', fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 10 }}>Datos que nos proporcionás</div>
                  <ul style={{ fontSize: 14, color: 'var(--muted-2)', fontFamily: 'var(--f-display)', lineHeight: 1.7, paddingLeft: 18, display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <li>Nombre y apellido o razón social del negocio</li>
                    <li>Email de contacto</li>
                    <li>Número de WhatsApp</li>
                    <li>Ciudad y rubro del negocio</li>
                    <li>Información del negocio que compartas al usar la Auditoría Digital o formularios de contacto</li>
                  </ul>
                </div>
                <div style={{ background: 'var(--paper-2)', border: '1px solid var(--line)', borderRadius: 12, padding: '20px 24px' }}>
                  <div style={{ fontFamily: 'var(--f-mono)', fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 10 }}>Datos recopilados automáticamente</div>
                  <ul style={{ fontSize: 14, color: 'var(--muted-2)', fontFamily: 'var(--f-display)', lineHeight: 1.7, paddingLeft: 18, display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <li>Dirección IP y país de origen</li>
                    <li>Páginas visitadas y tiempo de sesión (analytics anónimos)</li>
                    <li>Tipo de dispositivo y navegador</li>
                  </ul>
                </div>
                <div style={{ background: 'var(--paper-2)', border: '1px solid var(--line)', borderRadius: 12, padding: '20px 24px' }}>
                  <div style={{ fontFamily: 'var(--f-mono)', fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 10 }}>Lo que NO recopilamos</div>
                  <ul style={{ fontSize: 14, color: 'var(--muted-2)', fontFamily: 'var(--f-display)', lineHeight: 1.7, paddingLeft: 18, display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <li>Contraseñas de ningún servicio</li>
                    <li>Datos de tarjetas de crédito (MercadoPago los procesa directamente)</li>
                    <li>CUIL/CUIT ni datos fiscales sensibles</li>
                  </ul>
                </div>
              </div>
            </div>

            <div>
              <h2 style={{ fontFamily: 'var(--f-display)', fontSize: 20, fontWeight: 700, marginBottom: 12 }}>3. Para qué usamos tus datos</h2>
              <ul style={{ fontSize: 15, color: 'var(--muted-2)', fontFamily: 'var(--f-display)', lineHeight: 1.7, paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
                <li><strong style={{ color: 'var(--ink)' }}>Prestación del servicio:</strong> configurar y operar los chatbots, turneros y automatizaciones contratados.</li>
                <li><strong style={{ color: 'var(--ink)' }}>Comunicación comercial:</strong> enviarte propuestas, recordatorios y novedades relevantes al servicio.</li>
                <li><strong style={{ color: 'var(--ink)' }}>Mejora del servicio:</strong> analizar el uso para optimizar funcionalidades (siempre de forma agregada y anónima).</li>
                <li><strong style={{ color: 'var(--ink)' }}>Facturación:</strong> emitir comprobantes y gestionar cobros vía MercadoPago.</li>
                <li><strong style={{ color: 'var(--ink)' }}>Cumplimiento legal:</strong> responder a requerimientos legales o judiciales si correspondiera.</li>
              </ul>
            </div>

            <div>
              <h2 style={{ fontFamily: 'var(--f-display)', fontSize: 20, fontWeight: 700, marginBottom: 12 }}>4. Con quién compartimos tus datos</h2>
              <p style={{ fontSize: 15, color: 'var(--muted-2)', fontFamily: 'var(--f-display)', lineHeight: 1.7, marginBottom: 16 }}>
                Tus datos son confidenciales. Solo los compartimos con los siguientes proveedores de infraestructura, estrictamente necesarios para operar el servicio:
              </p>
              <div style={{ display: 'grid', gap: 8 }}>
                {[
                  { name: 'Supabase', uso: 'Base de datos y autenticación', pais: 'EE.UU.' },
                  { name: 'Vercel', uso: 'Hosting y despliegue de la aplicación', pais: 'EE.UU.' },
                  { name: 'Anthropic (Claude)', uso: 'Procesamiento de IA para chatbots y análisis', pais: 'EE.UU.' },
                  { name: 'MercadoPago', uso: 'Procesamiento de pagos', pais: 'Argentina' },
                  { name: 'Resend', uso: 'Envío de emails transaccionales', pais: 'EE.UU.' },
                ].map(p => (
                  <div key={p.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: 'var(--paper-2)', border: '1px solid var(--line)', borderRadius: 10, gap: 16 }}>
                    <div>
                      <span style={{ fontWeight: 700, fontSize: 14, color: 'var(--ink)', fontFamily: 'var(--f-display)' }}>{p.name}</span>
                      <span style={{ fontSize: 13, color: 'var(--muted-2)', fontFamily: 'var(--f-display)', marginLeft: 10 }}>— {p.uso}</span>
                    </div>
                    <span style={{ fontFamily: 'var(--f-mono)', fontSize: 11, color: 'var(--muted)', flexShrink: 0 }}>{p.pais}</span>
                  </div>
                ))}
              </div>
              <p style={{ fontSize: 14, color: 'var(--muted)', fontFamily: 'var(--f-display)', lineHeight: 1.6, marginTop: 16 }}>
                No vendemos, cedemos ni alquilamos tus datos personales a terceros con fines comerciales propios. Nunca.
              </p>
            </div>

            <div>
              <h2 style={{ fontFamily: 'var(--f-display)', fontSize: 20, fontWeight: 700, marginBottom: 12 }}>5. Tus derechos (ARCO)</h2>
              <p style={{ fontSize: 15, color: 'var(--muted-2)', fontFamily: 'var(--f-display)', lineHeight: 1.7, marginBottom: 12 }}>
                De acuerdo a la Ley 25.326, tenés derecho a:
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 8 }}>
                {[
                  { letra: 'A', nombre: 'Acceso', desc: 'Saber qué datos tenemos sobre vos' },
                  { letra: 'R', nombre: 'Rectificación', desc: 'Corregir datos incorrectos o desactualizados' },
                  { letra: 'C', nombre: 'Cancelación', desc: 'Solicitar la eliminación de tus datos' },
                  { letra: 'O', nombre: 'Oposición', desc: 'Oponerte a ciertos usos de tus datos' },
                ].map(d => (
                  <div key={d.letra} style={{ background: 'var(--paper-2)', border: '1px solid var(--line)', borderRadius: 12, padding: '16px' }}>
                    <div style={{ fontFamily: 'var(--f-mono)', fontSize: 24, fontWeight: 700, color: 'var(--lime)', marginBottom: 6 }}>{d.letra}</div>
                    <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--ink)', marginBottom: 4 }}>{d.nombre}</div>
                    <div style={{ fontSize: 12, color: 'var(--muted-2)', fontFamily: 'var(--f-display)', lineHeight: 1.5 }}>{d.desc}</div>
                  </div>
                ))}
              </div>
              <p style={{ fontSize: 14, color: 'var(--muted-2)', fontFamily: 'var(--f-display)', lineHeight: 1.6, marginTop: 16 }}>
                Para ejercer cualquier derecho, escribinos a <a href="mailto:diviniacorp@gmail.com" style={{ color: 'var(--ink)', fontWeight: 600 }}>diviniacorp@gmail.com</a> con el asunto "Derecho ARCO". Respondemos en un plazo máximo de 10 días hábiles.
              </p>
            </div>

            <div>
              <h2 style={{ fontFamily: 'var(--f-display)', fontSize: 20, fontWeight: 700, marginBottom: 12 }}>6. Retención de datos</h2>
              <p style={{ fontSize: 15, color: 'var(--muted-2)', fontFamily: 'var(--f-display)', lineHeight: 1.7 }}>
                Conservamos tus datos mientras dure la relación comercial y hasta 2 años después de su finalización, salvo que solicites su eliminación antes. Los datos de facturación se retienen 5 años por obligaciones fiscales (AFIP).
              </p>
            </div>

            <div>
              <h2 style={{ fontFamily: 'var(--f-display)', fontSize: 20, fontWeight: 700, marginBottom: 12 }}>7. Cookies</h2>
              <p style={{ fontSize: 15, color: 'var(--muted-2)', fontFamily: 'var(--f-display)', lineHeight: 1.7 }}>
                Usamos únicamente cookies técnicas necesarias para el funcionamiento de la aplicación (sesión, preferencias de UI). No usamos cookies de rastreo publicitario ni las vendemos a redes de publicidad.
              </p>
            </div>

            <div>
              <h2 style={{ fontFamily: 'var(--f-display)', fontSize: 20, fontWeight: 700, marginBottom: 12 }}>8. Seguridad</h2>
              <p style={{ fontSize: 15, color: 'var(--muted-2)', fontFamily: 'var(--f-display)', lineHeight: 1.7 }}>
                Implementamos medidas técnicas para proteger tus datos: cifrado en tránsito (HTTPS/TLS), acceso restringido a la base de datos, API keys rotadas periódicamente. Ante una brecha de seguridad que te afecte, te notificaremos dentro de las 72 horas de detectarla.
              </p>
            </div>

            <div>
              <h2 style={{ fontFamily: 'var(--f-display)', fontSize: 20, fontWeight: 700, marginBottom: 12 }}>9. IA y tus datos</h2>
              <p style={{ fontSize: 15, color: 'var(--muted-2)', fontFamily: 'var(--f-display)', lineHeight: 1.7 }}>
                Cuando usás la Auditoría Digital o el chatbot, tu información se procesa a través de Claude (Anthropic). Anthropic no usa las consultas de API para entrenar sus modelos por defecto. La información que nos compartís se procesa exclusivamente para brindarte el servicio solicitado y no se usa para entrenar modelos propios.
              </p>
            </div>

            <div>
              <h2 style={{ fontFamily: 'var(--f-display)', fontSize: 20, fontWeight: 700, marginBottom: 12 }}>10. Cambios a esta política</h2>
              <p style={{ fontSize: 15, color: 'var(--muted-2)', fontFamily: 'var(--f-display)', lineHeight: 1.7 }}>
                Podemos actualizar esta política periódicamente. Te notificaremos por email si los cambios son materiales. La fecha de última actualización siempre está visible al inicio de este documento.
              </p>
            </div>

            <div style={{ borderTop: '1px solid var(--line)', paddingTop: 32, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <p style={{ fontSize: 14, color: 'var(--muted)', fontFamily: 'var(--f-mono)', letterSpacing: '0.04em' }}>
                Consultas de privacidad: diviniacorp@gmail.com
              </p>
              <div style={{ display: 'flex', gap: 16 }}>
                <a href="/terminos" style={{ fontSize: 13, color: 'var(--muted-2)', fontFamily: 'var(--f-display)', textDecoration: 'none', borderBottom: '1px solid var(--line)' }}>Términos y Condiciones</a>
              </div>
            </div>

          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
