import Navbar from '@/components/public/Navbar'
import Footer from '@/components/public/Footer'

export default function TerminosPage() {
  return (
    <main style={{ minHeight: '100vh', background: 'var(--paper)', color: 'var(--ink)', overflowX: 'hidden' }}>
      <div className="grid-bg" />
      <Navbar />

      <section style={{ padding: '120px 0 80px' }}>
        <div className="wrap-v2" style={{ maxWidth: 760 }}>
          <div className="eyebrow" style={{ marginBottom: 16 }}>Legal</div>
          <h1 className="h-display" style={{ fontSize: 'clamp(36px,5vw,64px)', marginBottom: 12 }}>
            Términos y Condiciones
          </h1>
          <p style={{ fontFamily: 'var(--f-mono)', fontSize: 12, color: 'var(--muted)', letterSpacing: '0.06em', marginBottom: 48 }}>
            Última actualización: Abril 2026
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>

            <div>
              <h2 style={{ fontFamily: 'var(--f-display)', fontSize: 20, fontWeight: 700, marginBottom: 12 }}>1. Partes del contrato</h2>
              <p style={{ fontSize: 15, color: 'var(--muted-2)', fontFamily: 'var(--f-display)', lineHeight: 1.7 }}>
                Estos Términos y Condiciones regulan la relación entre <strong style={{ color: 'var(--ink)' }}>DIVINIA</strong> (en adelante "el Proveedor"), con domicilio en San Luis Capital, Argentina, y cualquier persona física o jurídica (en adelante "el Cliente") que contrate los servicios ofrecidos a través de divinia.vercel.app o cualquier propuesta comercial emitida por el Proveedor.
              </p>
            </div>

            <div>
              <h2 style={{ fontFamily: 'var(--f-display)', fontSize: 20, fontWeight: 700, marginBottom: 12 }}>2. Servicios</h2>
              <p style={{ fontSize: 15, color: 'var(--muted-2)', fontFamily: 'var(--f-display)', lineHeight: 1.7, marginBottom: 12 }}>
                DIVINIA ofrece servicios de inteligencia artificial, automatizaciones, desarrollo web, generación de contenido y avatares digitales. Los servicios concretos, precios y plazos se detallan en la propuesta comercial aceptada por el Cliente.
              </p>
              <p style={{ fontSize: 15, color: 'var(--muted-2)', fontFamily: 'var(--f-display)', lineHeight: 1.7 }}>
                Los planes de suscripción mensual incluyen los features descritos en cada plan al momento de la contratación. El Proveedor puede modificar funcionalidades con 30 días de preaviso.
              </p>
            </div>

            <div>
              <h2 style={{ fontFamily: 'var(--f-display)', fontSize: 20, fontWeight: 700, marginBottom: 12 }}>3. Precios y forma de pago</h2>
              <p style={{ fontSize: 15, color: 'var(--muted-2)', fontFamily: 'var(--f-display)', lineHeight: 1.7, marginBottom: 12 }}>
                Todos los precios se expresan en Pesos Argentinos (ARS) y son con IVA incluido (el Proveedor opera bajo el régimen de monotributo). El pago se realiza exclusivamente a través de <strong style={{ color: 'var(--ink)' }}>MercadoPago</strong>.
              </p>
              <ul style={{ fontSize: 15, color: 'var(--muted-2)', fontFamily: 'var(--f-display)', lineHeight: 1.7, paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 8 }}>
                <li><strong style={{ color: 'var(--ink)' }}>Proyectos:</strong> 50% al inicio del proyecto, 50% a la entrega. Sin adelanto, no se comienza el trabajo.</li>
                <li><strong style={{ color: 'var(--ink)' }}>Suscripciones:</strong> Pago mensual recurrente el mismo día de contratación. Se puede cancelar con 15 días de anticipación.</li>
                <li><strong style={{ color: 'var(--ink)' }}>Prueba gratis:</strong> 14 días sin cargo en planes de suscripción. Al vencimiento, si no se activa el plan, el servicio se suspende automáticamente.</li>
              </ul>
            </div>

            <div>
              <h2 style={{ fontFamily: 'var(--f-display)', fontSize: 20, fontWeight: 700, marginBottom: 12 }}>4. Plazos de entrega</h2>
              <p style={{ fontSize: 15, color: 'var(--muted-2)', fontFamily: 'var(--f-display)', lineHeight: 1.7 }}>
                Los plazos indicados en las propuestas son estimados y comienzan a correr desde la recepción del pago del 50% inicial y la provisión por parte del Cliente de toda la información necesaria. Demoras en la entrega de contenidos, accesos o información por parte del Cliente liberan al Proveedor de los plazos acordados.
              </p>
            </div>

            <div>
              <h2 style={{ fontFamily: 'var(--f-display)', fontSize: 20, fontWeight: 700, marginBottom: 12 }}>5. Propiedad intelectual</h2>
              <p style={{ fontSize: 15, color: 'var(--muted-2)', fontFamily: 'var(--f-display)', lineHeight: 1.7, marginBottom: 12 }}>
                Una vez abonado el 100% del proyecto, el Cliente recibe una <strong style={{ color: 'var(--ink)' }}>licencia de uso no exclusiva, no transferible</strong> sobre los entregables producidos. El Proveedor retiene los derechos sobre el código base, frameworks, metodologías y herramientas propias utilizadas.
              </p>
              <p style={{ fontSize: 15, color: 'var(--muted-2)', fontFamily: 'var(--f-display)', lineHeight: 1.7 }}>
                El contenido generado con IA (textos, imágenes, videos) se entrega bajo los términos de uso de las plataformas utilizadas (Anthropic, Freepik, Canva, etc.). El Cliente es responsable del uso que haga del contenido.
              </p>
            </div>

            <div>
              <h2 style={{ fontFamily: 'var(--f-display)', fontSize: 20, fontWeight: 700, marginBottom: 12 }}>6. Limitación de responsabilidad</h2>
              <p style={{ fontSize: 15, color: 'var(--muted-2)', fontFamily: 'var(--f-display)', lineHeight: 1.7 }}>
                El Proveedor no garantiza resultados específicos de ventas, leads o métricas de negocio. Los servicios se entregan "tal cual" y el Proveedor no se hace responsable por lucro cesante, pérdidas indirectas o daños derivados del uso del servicio. La responsabilidad máxima del Proveedor está limitada al monto abonado por el Cliente en los últimos 30 días.
              </p>
            </div>

            <div>
              <h2 style={{ fontFamily: 'var(--f-display)', fontSize: 20, fontWeight: 700, marginBottom: 12 }}>7. Confidencialidad</h2>
              <p style={{ fontSize: 15, color: 'var(--muted-2)', fontFamily: 'var(--f-display)', lineHeight: 1.7 }}>
                Ambas partes se comprometen a mantener la confidencialidad de la información intercambiada durante y después de la relación comercial. El Proveedor no divulgará información del negocio del Cliente a terceros sin consentimiento expreso. Esta obligación tiene vigencia de 2 años desde la finalización del contrato.
              </p>
            </div>

            <div>
              <h2 style={{ fontFamily: 'var(--f-display)', fontSize: 20, fontWeight: 700, marginBottom: 12 }}>8. Cancelaciones y devoluciones</h2>
              <ul style={{ fontSize: 15, color: 'var(--muted-2)', fontFamily: 'var(--f-display)', lineHeight: 1.7, paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 8 }}>
                <li><strong style={{ color: 'var(--ink)' }}>Suscripciones:</strong> Cancelación en cualquier momento con 15 días de preaviso. No se realizan devoluciones por períodos ya abonados.</li>
                <li><strong style={{ color: 'var(--ink)' }}>Proyectos (antes de iniciar):</strong> Devolución del 100% del adelanto si el proyecto no comenzó.</li>
                <li><strong style={{ color: 'var(--ink)' }}>Proyectos (en curso):</strong> Se abona el trabajo proporcional realizado. Mínimo: 20% del total del proyecto.</li>
                <li><strong style={{ color: 'var(--ink)' }}>Proyectos (entregados):</strong> Sin devolución una vez aprobado el entregable final por el Cliente.</li>
              </ul>
            </div>

            <div>
              <h2 style={{ fontFamily: 'var(--f-display)', fontSize: 20, fontWeight: 700, marginBottom: 12 }}>9. Datos personales</h2>
              <p style={{ fontSize: 15, color: 'var(--muted-2)', fontFamily: 'var(--f-display)', lineHeight: 1.7 }}>
                El tratamiento de datos personales se rige por nuestra <a href="/privacidad" style={{ color: 'var(--ink)', fontWeight: 600 }}>Política de Privacidad</a> y la Ley 25.326 de Protección de Datos Personales de la República Argentina.
              </p>
            </div>

            <div>
              <h2 style={{ fontFamily: 'var(--f-display)', fontSize: 20, fontWeight: 700, marginBottom: 12 }}>10. Modificaciones</h2>
              <p style={{ fontSize: 15, color: 'var(--muted-2)', fontFamily: 'var(--f-display)', lineHeight: 1.7 }}>
                El Proveedor puede modificar estos Términos con 30 días de preaviso notificado al email del Cliente. El uso continuado del servicio tras ese plazo implica aceptación de los nuevos términos.
              </p>
            </div>

            <div>
              <h2 style={{ fontFamily: 'var(--f-display)', fontSize: 20, fontWeight: 700, marginBottom: 12 }}>11. Jurisdicción</h2>
              <p style={{ fontSize: 15, color: 'var(--muted-2)', fontFamily: 'var(--f-display)', lineHeight: 1.7 }}>
                Cualquier disputa se someterá a la jurisdicción de los Tribunales Ordinarios de San Luis Capital, Argentina, renunciando las partes a cualquier otro fuero que pudiera corresponderles.
              </p>
            </div>

            <div style={{ borderTop: '1px solid var(--line)', paddingTop: 32 }}>
              <p style={{ fontSize: 14, color: 'var(--muted)', fontFamily: 'var(--f-mono)', letterSpacing: '0.04em' }}>
                Consultas legales: diviniacorp@gmail.com · WhatsApp: +54 9 266 4000000
              </p>
            </div>

          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
