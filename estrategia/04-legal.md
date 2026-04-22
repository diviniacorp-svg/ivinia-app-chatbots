# Estrategia Legal y Compliance DIVINIA

## Estado actual y riesgos

**Riesgo alto:**
- Sin contratos firmados con clientes = sin protección legal si no pagan o piden devolución
- Sin términos de uso = responsabilidad ilimitada por el chatbot si dice algo incorrecto
- Sin política de privacidad = problema ante AAIP (Agencia Argentina de Protección de Datos)

**Riesgo medio:**
- Sin NDA con potenciales clientes durante demos (pueden copiar la idea)
- Sin acuerdo de confidencialidad con partners

---

## Documentos mínimos necesarios (en orden de prioridad)

### 1. Contrato de Servicios (URGENTE)
Ver `contratos/contrato-servicios.md`

Cubre:
- Descripción del servicio
- Precio y forma de pago (50/50)
- Plazos de entrega
- Propiedad intelectual (DIVINIA retiene el código, cliente tiene licencia de uso)
- Limitación de responsabilidad
- Política de cancelación (14 días para servicios mensuales)
- Resolución de conflictos

### 2. Términos de Uso del chatbot (URGENTE)
Protege a DIVINIA si el chatbot da información incorrecta.

Cláusulas clave:
- El chatbot es una herramienta de asistencia, no reemplaza asesoramiento profesional
- DIVINIA no es responsable por decisiones tomadas en base a respuestas del chatbot
- El cliente es responsable del contenido que carga en el sistema

### 3. Política de Privacidad (URGENTE para GDPR/AAIP)
Los chatbots recopilan nombre, email, teléfono, consultas de usuarios.
Necesitamos declarar qué recopilamos, para qué, y por cuánto tiempo.

### 4. NDA para demos y propuestas
Un documento de 1 página que protege la información que compartimos durante demos.

### 5. Acuerdo de Partner/Revendedor
Cuando se sumen partners en Fase 2.

---

## Aspectos impositivos

### Joaco como monotributista
- Categoría actual: verificar según ingresos actuales
- Límite de categoría H (2026): ~$10.000.000 ARS/año
- Al superar ese límite: pasar a Responsable Inscripto o crear sociedad
- IIBB San Luis: inscripción en Convenio Multilateral si factura a clientes de otras provincias

### Facturación
- Factura tipo C (monotributista) para todos los servicios
- Los servicios mensuales se facturan el 1ro de cada mes
- Los proyectos se facturan: 50% al inicio + 50% a la entrega

### Recomendación
Consultar con contador en San Luis antes del mes 3. No asumir que el monotributo alcanza para siempre.

---

## Propiedad intelectual

### El código es de DIVINIA
Cuando desarrollamos una landing, un chatbot, o un sistema para un cliente:
- El código base y la arquitectura pertenecen a DIVINIA
- El cliente tiene una **licencia de uso** no exclusiva mientras pague
- Si el cliente cancela, puede quedarse con el dominio y el contenido, no con el código

### Excepciones
Si el cliente paga por un desarrollo a medida exclusivo, se puede negociar la cesión de propiedad intelectual con un sobreprecio del 50%.

---

## Compliance de IA

### Ley argentina de datos personales (Ley 25.326)
- Los chatbots procesan datos personales (nombre, email, consultas)
- Necesitamos: política de privacidad publicada, registro en AAIP (si procesamos más de cierta cantidad)
- Los datos no se usan para entrenar modelos (Claude API procesa pero no retiene)

### Limitación de responsabilidad del chatbot
El chatbot no debe:
- Dar consejos médicos, legales o financieros como si fuera un profesional
- Hacer promesas de resultados específicos
- Acceder a información confidencial del cliente sin consentimiento explícito

Esto tiene que estar en el prompt del sistema de cada chatbot + en los TyC.
