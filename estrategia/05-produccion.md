# Estrategia de Producción y Delivery DIVINIA

## Principio: bajo-prometer, sobre-entregar

Nunca prometer en 24hs si podés en 48hs. Siempre llegar antes. El cliente que recibe más de lo que esperaba es el que renueva y refiere.

---

## Proceso de onboarding (desde "sí quiero" hasta "está live")

### Día 0: Cierre
- [ ] Cliente dice sí
- [ ] Joaco envía link de MercadoPago (50% adelanto)
- [ ] Cliente paga
- [ ] Joaco recibe notificación automática (webhook MP)
- [ ] Joaco crea el cliente en /clientes del panel

### Día 1: Setup técnico
**Para chatbot:**
- [ ] Crear chatbot en /clientes → configurar template del rubro
- [ ] Completar con datos reales del negocio (precios, servicios, horarios, tel)
- [ ] Probar 10 preguntas frecuentes del rubro
- [ ] Ajustar respuestas que fallen
- [ ] Instalar en web del cliente (si tienen) o configurar enlace WA

**Para turnero:**
- [ ] Configurar servicios, duración, precio por servicio
- [ ] Configurar disponibilidad (horarios, días)
- [ ] Activar recordatorios WA (24hs antes)
- [ ] Configurar seña MercadoPago (si el cliente quiere)
- [ ] Enviar al cliente el link y el QR

**Para landing:**
- [ ] Generar config con /herramientas/landing
- [ ] Armar la landing con el template scroll-premium
- [ ] Adaptar colores, contenido, fotos
- [ ] Publicar en Vercel con dominio del cliente

### Día 2: Entrega y capacitación
- [ ] Enviar link de lo entregado
- [ ] Video de 5 minutos mostrando cómo funciona (loom o WA video)
- [ ] Entregar acceso al panel si el cliente lo necesita
- [ ] Confirmar que el cliente entendió

### Día 3: Solicitar 50% restante
- [ ] Enviar link de MercadoPago con el saldo
- [ ] Solo después de confirmación del cliente de que está conforme

### Día 30: Follow-up
- [ ] Mensaje automático: "¿Cómo va todo con el chatbot/turnero?"
- [ ] Revisar métricas con el cliente (si las tiene)
- [ ] Proponer upsell según uso

---

## SLAs (Service Level Agreements)

| Tipo de consulta | Tiempo de respuesta | Canal |
|---|---|---|
| Problema crítico (chatbot caído) | < 2hs en horario laboral | WA directo a Joaco |
| Bug o error de configuración | < 24hs hábiles | WA o email |
| Consulta de uso | < 48hs hábiles | Email o panel |
| Solicitud de cambio | < 72hs hábiles (+ presupuesto si aplica) | Email |

### Horario de soporte
- Lunes a viernes: 9hs a 20hs (San Luis)
- Sábados: 10hs a 14hs
- Domingos y feriados: urgencias solamente

---

## Checklist de calidad por servicio

### Chatbot ✓
- [ ] Responde correctamente las 10 preguntas más frecuentes del rubro
- [ ] No inventa precios ni datos
- [ ] Deriva correctamente cuando no sabe
- [ ] Tiene el tono correcto (formal/informal según el negocio)
- [ ] El botón de "hablar con humano" funciona
- [ ] Instalado y probado en el canal final (web / WA)

### Turnero ✓
- [ ] Todos los servicios cargados con duración correcta
- [ ] Disponibilidad configurada correctamente
- [ ] Recordatorio WA se envía a las 24hs
- [ ] Seña MercadoPago funciona (si aplica)
- [ ] Link/QR probado desde un teléfono real
- [ ] El negocio puede ver y gestionar turnos desde el panel

### Landing ✓
- [ ] Carga en menos de 2 segundos (PageSpeed check)
- [ ] Se ve bien en mobile (iPhone y Android)
- [ ] Todos los links funcionan (WA, reservas, email)
- [ ] El dominio está configurado correctamente
- [ ] Aparece en Google (verificar en Search Console)

---

## Gestión de capacidad (Joaco solo, fase 1)

### Capacidad real de un solo freelancer
- Chatbots: 2-3 por semana (1-2 días de setup c/u)
- Landings: 1-2 por semana (2-3 días c/u)
- Mantenimiento clientes activos: ~2hs/semana por cliente

### Límite de carga antes de necesitar ayuda
- 15 clientes activos de mantenimiento = límite sin burnout
- Al llegar a 15: contratar un asistente técnico (pasante o part-time)
- Tarea del asistente: onboarding, soporte básico, configuración de templates

### Cuándo contratar el primer empleado
Cuando el MRR supere $3.000.000 ARS/mes (suficiente para pagar $500.000/mes de sueldo + impuestos y que Joaco siga ganando bien).

---

## Templates reutilizables (aceleran el delivery)

| Template | Rubro | Tiempo de setup con template |
|---|---|---|
| Chatbot Peluquería/Barbería | Belleza | 2hs |
| Chatbot Estética/Spa | Belleza | 2hs |
| Chatbot Odontología | Salud | 3hs |
| Chatbot Restaurante | Gastronomía | 2hs |
| Turnero Salud | Salud | 1.5hs |
| Turnero Belleza | Belleza | 1.5hs |
| Landing Servicios | Cualquiera | 4hs |

Cada template nuevo que se arma → se guarda como template base para el siguiente cliente del mismo rubro.
