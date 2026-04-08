# PROMPT PARA CLAUDE CHROME EXTENSION
## Tarea: Conectar Meta App + obtener Instagram token + publicar semana 1

---

Pegá esto completo en Claude con la extensión de Chrome, con developers.facebook.com abierto en una pestaña y instagram.com en otra.

---

```
Sos mi asistente técnico. Tengo que hacer DOS cosas hoy y necesito que me guíes paso a paso, ejecutando vos lo que puedas y diciéndome exactamente qué tengo que hacer yo cuando sea necesario.

═══════════════════════════════════════
TAREA 1 — CONECTAR META APP PARA INSTAGRAM
═══════════════════════════════════════

Necesito obtener el Instagram Access Token para poder publicar desde mi app en Vercel (divinia.vercel.app).

PASO A PASO:
1. Abrí developers.facebook.com/apps y buscá si ya existe una app creada. Si no, creá una nueva con estos datos:
   - Nombre: DIVINIA Turnero
   - Tipo: Business
   - Email de contacto: (el que uso en Meta)

2. En la app, activá el producto "Instagram Graph API" desde el panel de productos

3. Conectá la cuenta de Instagram @autom_atia:
   - Settings → Basic → agregá Instagram como plataforma
   - O desde Instagram Graph API → User Token Generator

4. Generá un User Access Token con estos permisos:
   - instagram_basic
   - instagram_content_publish
   - pages_show_list
   - pages_read_engagement

5. Convertilo en Long-Lived Token (dura 60 días) usando este endpoint:
   GET https://graph.facebook.com/v19.0/oauth/access_token?grant_type=fb_exchange_token&client_id={APP_ID}&client_secret={APP_SECRET}&fb_exchange_token={SHORT_TOKEN}

6. Conseguí el Instagram Business Account ID:
   GET https://graph.facebook.com/v19.0/me/accounts?access_token={LONG_TOKEN}
   Luego: GET https://graph.facebook.com/v19.0/{page-id}?fields=instagram_business_account&access_token={LONG_TOKEN}

7. Guardame estos dos valores que voy a necesitar:
   - INSTAGRAM_ACCESS_TOKEN: [el long-lived token]
   - INSTAGRAM_ACCOUNT_ID: [el ig business account id]

Guiame en cada paso. Cuando necesites que yo haga click en algo, decime exactamente dónde.

═══════════════════════════════════════
TAREA 2 — PUBLICAR LOS 5 POSTS DE LA SEMANA EN @autom_atia
═══════════════════════════════════════

Una vez que tengamos el token, publicá los 5 posts de la semana. Abrí instagram.com/@autom_atia.

Para cada post:
1. Hacé click en el botón "+" para crear publicación
2. Subí la imagen que te indico (o usá la que ya tenemos en Canva)
3. Pegá el caption exacto
4. Programalo en el horario indicado (si Instagram lo permite, sino publicalo ahora)

─────────────────────────────────────
POST 1 — Publicar AHORA o programar hoy 20:00 ART
─────────────────────────────────────
Imagen: La que tenga la encuesta "¿Cómo tomás turnos hoy?" con las opciones A/B/C/D

Caption (pegá exacto):
Hay negocios que pierden plata cada semana sin darse cuenta.

No porque les falten clientes.
Sino porque los clientes quieren reservar y no pueden.

El teléfono no atiende.
El WhatsApp tarda en responder.
El horario no cuadra.
A las 11 de la noche no hay nadie.

Hicimos Turnero para eso.

Para que tu peluquería, tu clínica, tu veterinaria o tu taller tenga un sistema de turnos online que funciona solo, a cualquier hora, sin que vos tengas que levantar el teléfono.

Somos @autom_atia, somos de San Luis, y esta cuenta es para mostrarles cómo la tecnología puede hacer el trabajo aburrido por vos.

¿De qué rubro sos? Contanos en los comentarios 👇

#turneroonline #sistematurnos #turnosdigitales #automatizacion #divinia #sanluisargentina #pymesargentinas #emprendedoresargentinos #peluqueria #clinica #veterinaria #estetica #taller #negocioargentino #tecnologiapymes

─────────────────────────────────────
POST 2 — Programar Mañana (Viernes) 9:30 ART
─────────────────────────────────────
Imagen: La que tenga "3 a 8 turnos" en rojo grande

Caption (pegá exacto):
¿Cuántas llamadas perdiste hoy?

No es pregunta retórica.

Cada llamada que no atendiste mientras trabajabas con las manos = un turno que se fue.
Cada WhatsApp que tardaste 2 horas en responder = un turno que se fue.
Cada cliente que quiso reservar a las 11 de la noche y no pudo = un turno que se fue, directo a la competencia.

Una peluquería promedio pierde entre 5 y 8 turnos por semana de esta forma.
A $8.000 por corte, eso son entre $40.000 y $64.000 por semana que se van a la nada.

¿Cuántos perdiste vos esta semana? 👇
(Sé honesto, nadie te juzga)

#turneroonline #peluqueria #clinica #veterinaria #sanluisargentina #pymesargentinas #sistematurnos #turnosdigitales #automatizacion #divinia #emprendedoresargentinos #negocioargentino #estetica #taller #tecnologiapymes

─────────────────────────────────────
POST 3 — Programar Sábado 12:00 ART
─────────────────────────────────────
Imagen: La del Antes vs Después dividida en dos mitades

Caption (pegá exacto):
Antes vs Después de tener Turnero. Y así se ven los dos lados 👇

❌ ANTES:
→ Teléfono que suena en el peor momento
→ WhatsApp sin responder hasta el día siguiente
→ Clientes que "ya llaman" y nunca vuelven a llamar
→ Agenda en papel con turnos dobles y errores

✓ DESPUÉS:
→ Tus clientes reservan solos desde el celular
→ Confirmación automática por WhatsApp
→ Recordatorio 24hs antes para que no falten
→ Panel donde ves todos los turnos del día

¿Cuánto tiempo perdés por semana atendiendo el teléfono solo para coordinar turnos?

Si son más de 2hs, Turnero se paga solo en el primer mes.

Escribime por DM y te cuento cómo funciona para tu rubro 👇

#turneroonline #antesdespues #sistematurnos #peluqueria #clinica #veterinaria #sanluisargentina #automatizacion #pymesargentinas #divinia #emprendedoresargentinos #turnosdigitales #estetica #taller #tecnologiapymes

─────────────────────────────────────
POST 4 — Programar Lunes próximo 12:00 ART
─────────────────────────────────────
Imagen: La de los 3 pasos con cards lavanda

Caption (pegá exacto):
¿Cómo funciona Turnero? En 3 pasos 👇

PASO 1 — Tu cliente entra al link
Lo compartís por WhatsApp, redes o el cartel de tu local. Lo abre desde el celular, sin descargar nada.

PASO 2 — Elige día, hora y servicio
Ve tu disponibilidad en tiempo real. Elige lo que necesita. Completa nombre y teléfono. Listo, turno reservado.

PASO 3 — Vos recibís la notificación
Te llega un aviso por WhatsApp con los datos del turno. Sin llamadas. Sin mensajes de "¿tenés lugar el jueves?".

Y a las 24hs del turno, el sistema le manda un recordatorio automático al cliente para que no falte.

Setup en 48hs. Sin código. Sin instalaciones. Sin mensualidades.

¿Querés ver cómo quedaría para tu negocio específicamente? Escribime por DM 🙌

#turneroonline #comofunciona #sistematurnos #peluqueria #clinica #veterinaria #sanluisargentina #automatizacion #pymesargentinas #divinia #emprendedoresargentinos #turnosdigitales #estetica #taller #tecnologiapymes

─────────────────────────────────────
POST 5 — Programar Martes próximo 18:00 ART
─────────────────────────────────────
Imagen: La de fondo indigo con "$80.000 ARS" grande en blanco

Caption (pegá exacto):
Sí, leyeron bien. Pago único 👇

Mientras todos cobran mensualidades, nosotros ofrecemos esto:

✓ Plan Básico: $80.000 ARS — pago único
✓ Plan Pro: $150.000 ARS — pago único
✓ Plan Enterprise: $200.000 ARS — pago único

¿Qué incluye?
→ Tu sistema de turnos online personalizado para tu rubro
→ Link para compartir con tus clientes
→ Panel de gestión para vos
→ Recordatorios automáticos por WhatsApp
→ Setup completo en 48hs
→ 3 meses de soporte incluido

Sin mensualidades. Sin letra chica. Sin sorpresas.

Somos de San Luis, Argentina. Conocemos los negocios de acá y sabemos lo que cuesta mantener un gasto mensual que no para.

Los primeros 5 en escribirme esta semana tienen descuento de lanzamiento.

DM abierto 👇

#turneroonline #preciojusto #sistematurnos #sanluisargentina #pymesargentinas #peluqueria #clinica #veterinaria #automatizacion #divinia #emprendedoresargentinos #turnosdigitales #estetica #taller #tecnologiapymes

═══════════════════════════════════════
CUANDO TERMINES CADA TAREA CONFIRMAME:
═══════════════════════════════════════
✓ Token obtenido → mostrámelo para guardarlo en .env
✓ Post 1 publicado
✓ Posts 2-5 programados con fechas/horas
✓ Cualquier error que encuentres, decímelo y buscamos solución juntos
```
