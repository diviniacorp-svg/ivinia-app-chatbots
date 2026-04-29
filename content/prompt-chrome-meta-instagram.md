# PROMPT PARA CLAUDE CHROME EXTENSION
## Tarea: Conectar Meta App + publicar semana de lanzamiento @autom_atia

Pegá esto completo en Claude con la extensión de Chrome.
Tené abiertas estas pestañas: developers.facebook.com · instagram.com · divinia.vercel.app

---

```
Sos mi asistente técnico para DIVINIA, empresa de IA para PYMEs argentinas.
Tengo DOS tareas hoy. Guiame paso a paso. Ejecutá lo que puedas, decime exactamente qué tengo que hacer yo.

══════════════════════════════════════════
TAREA 1 — OBTENER TOKEN DE INSTAGRAM
══════════════════════════════════════════

Necesito el Instagram Access Token y el Instagram Account ID para conectar @autom_atia con mi app en divinia.vercel.app

PASO A PASO:
1. Abrí developers.facebook.com/apps — si ya existe una app "DIVINIA", usala. Si no, creá una: Tipo Business, Nombre "DIVINIA Turnero".
2. En la app → Add Product → activá "Instagram Graph API"
3. Generá un User Access Token con permisos: instagram_basic, instagram_content_publish, pages_show_list, pages_read_engagement
4. Convertilo en Long-Lived Token (60 días):
   GET https://graph.facebook.com/v21.0/oauth/access_token?grant_type=fb_exchange_token&client_id={APP_ID}&client_secret={APP_SECRET}&fb_exchange_token={SHORT_TOKEN}
5. Conseguí el Instagram Business Account ID:
   GET https://graph.facebook.com/v21.0/me/accounts?access_token={LONG_TOKEN}
   Luego: GET https://graph.facebook.com/v21.0/{page_id}?fields=instagram_business_account&access_token={LONG_TOKEN}
6. Mostrámelos así para guardarlos:
   INSTAGRAM_ACCESS_TOKEN: EAA...
   INSTAGRAM_ACCOUNT_ID: 179...

══════════════════════════════════════════
TAREA 2 — PUBLICAR 5 POSTS EN @autom_atia
══════════════════════════════════════════

Para cada post: Instagram → "+" → subí imagen → pegá caption → hashtags en 1er comentario → publicá o programá.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
POST 1 — HOY 27 ABR a las 20:00 ART | Imagen estática
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CAPTION:
Llegamos.

DIVINIA es una empresa de IA de San Luis.
Construimos el sistema de turnos online que usan los negocios de acá.

Se llama Turnero.

Tus clientes reservan solos, 24hs, desde el celu.
Vos recibís la notificación y atendés.
Sin llamadas. Sin planillas. Sin turnos perdidos.

Si tenés un negocio con turnos, esto es para vos.
→ Link en bio para ver la demo de tu rubro.

📍 San Luis, Argentina.

HASHTAGS (1er comentario):
#DIVINIA #Turnero #TurnosOnline #SanLuis #SanLuisCapital #PYMESanLuis #AgendaDigital #NegocioDigital #IAArgentina #ReservasOnline

PROMPT IMAGEN (Freepik/Canva):
Dark SaaS poster, black background #09090b, bold white text "LLEGAMOS." center in Inter ExtraBold, subtitle gray "Sistema de turnos IA · San Luis", blurred purple circle top-right 25% opacity, blurred lime circle bottom-left 20% opacity, pill badge top "◉ DIVINIA · OFICIAL", 1:1 ratio

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
POST 2 — Viernes 1 MAY 10:00 ART | Carrusel 5 slides
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CAPTION:
Perdés turnos todos los días y no te das cuenta.

No es mala suerte. Es un sistema que no está diseñado para atender cuando vos no podés.

Swipe para ver cuánto te cuesta cada semana →

HASHTAGS: #TurnosOnline #Peluqueria #Estetica #SanLuis #PYMESanLuis #NegocioDigital #Turnero #DIVINIA #AgendaOnline #AutomatizacionPYME

SLIDES (Canva — fondo negro, texto blanco):
1. Hook: "¿Cuántos turnos perdés por semana?" — texto grande
2. "El teléfono sonó. Estabas atendiendo. No atendiste." — stat: 3 de cada 5 llamadas sin respuesta van a la competencia
3. "WhatsApp a las 11pm. No había nadie." — 62% de reservas ocurren fuera de horario laboral
4. "Turno sin recordatorio. No vino." — el 30% de ausencias desaparecen con recordatorio automático
5. CTA: "Turnero toma los turnos solo. Link en bio."

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
POST 3 — Lunes 4 MAY 12:00 ART | Reel 20 segundos
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CAPTION:
Así reservan las clientas de una peluquería cuando tiene Turnero.

30 segundos. Sin llamar. Sin esperar respuesta.
Y vos recibís el turno en el celu mientras atendés.

Demo gratis en el link de bio → entrá y probalo como si fueras clienta.

HASHTAGS: #Turnero #Peluqueria #SistemaDeReservas #SanLuis #DIVINIA #TurnosDigitales #AutomatizacionNegocio #PYMESanLuis #AgendaOnline #NegocioDigital

VIDEO: Screen recording de divinia.vercel.app/reservas/fa-faby-demo
Grabá: entrar al link → elegir servicio → seleccionar día → confirmar → ver confirmación. 20-25 seg, podés agregar música.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
POST 4 — Miércoles 6 MAY 12:00 ART | Imagen estática — PRECIO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CAPTION:
$45.000 por mes.

Eso es lo que cuesta Turnero.

No es un gasto. Es el costo de no perder más turnos.

Si perdés 4 turnos por semana a $10.000 cada uno, perdés $160.000 por mes.
Turnero cuesta $45.000. Y los turnos se cortan casi a cero.

Los primeros 10 negocios de San Luis → demo gratis.
→ Link en bio.

HASHTAGS: #Turnero #PrecioJusto #SistemaDeReservas #SanLuis #DIVINIA #PYMESanLuis #TurnosOnline #AgendaDigital #NegocioLocal #AutomatizacionPYME

PROMPT IMAGEN: Dark minimal card, black background #09090b, large white bold "$45.000/mes", lime-green accent line below, subtitle gray "Turnero · Sistema de reservas IA · DIVINIA", clean SaaS aesthetic, 1:1 ratio

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
POST 5 — Viernes 9 MAY 10:00 ART | Carrusel 6 slides — ANTES/DESPUÉS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CAPTION:
Antes y después de Turnero. Y así se ven los dos lados.

El cambio no es solo tecnológico. Es de tranquilidad.

→ Swipe para ver qué cambia en tu negocio

HASHTAGS: #AntesDespues #Turnero #DIVINIA #SistemaReservas #Peluqueria #Estetica #SanLuis #PYMESanLuis #TurnosOnline #NegocioDigital

SLIDES (Canva — dos columnas ❌ ANTES / ✓ DESPUÉS):
1. Hook: "Antes vs Después de Turnero"
2. Teléfono que suena | Clientes que reservan solos
3. WhatsApp sin responder | Confirmación automática al instante
4. Agenda en papel con errores | Panel digital en tiempo real
5. Ausencias sin aviso | Recordatorio 24hs → casi cero ausencias
6. CTA: "¿Cuándo arrancás? Link en bio."

══════════════════════════════════════════
AL TERMINAR CONFIRMAME:
══════════════════════════════════════════
✓ Token → mostrámelo para guardarlo en Vercel
✓ Post 1 publicado → hora exacta
✓ Posts 2-5 programados → fecha y hora de cada uno
✓ Cualquier error → lo resolvemos juntos
```
