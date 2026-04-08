# Reel 02 — Brief: Reel Animado (Nanobanana + Remotion)

**Tipo**: Reel animado, sin cara, 100% generado/compuesto digitalmente  
**Duración objetivo**: 30 segundos  
**Herramientas**: Nanobanana (generación de assets visuales 3D) + Remotion (composición y animación)  
**Propósito**: Mostrar el producto de forma atractiva sin depender de grabación

---

## Concepto del reel

Un reel animado que muestra el recorrido del cliente: entra al link de Turnero → ve la interfaz → elige su turno → confirma → el negocio recibe la notificación. Todo con el estilo visual de Turnero (pelotas puff, colores lavanda/indigo, fondo blanco).

---

## PARTE 1 — Generación de assets en Nanobanana

Nanobanana genera imágenes/videos cortos con IA. Usar los siguientes prompts para generar los assets visuales que después se usan en Remotion.

### Asset 1 — Pelotas puff floting (loop de fondo)

**Prompt en inglés (para Nanobanana):**
```
3D animated glossy inflatable spheres floating gently in white space. 
Three spheres: large lavender (#c4b5fd), medium indigo (#4f46e5), small purple (#818cf8). 
Shiny plastic surface with specular highlight on upper left. 
Soft shadow below each sphere. 
Gentle bobbing animation, 2-second loop, smooth easing. 
Clean white background. 
Product render style. No text. Cute toy aesthetic. 
Output: seamless loop, 1080x1920 vertical, transparent background if possible.
```

**Uso en el reel**: Fondo animado para los slides de texto, las pelotas flotan suavemente mientras el texto aparece.

---

### Asset 2 — Mockup de celular con la app de Turnero

**Prompt en inglés:**
```
Modern smartphone mockup, floating in 3D space, slight rotation 15 degrees. 
Screen showing a clean appointment booking interface: 
white background, purple/indigo color scheme (#4f46e5), 
service selection list (Corte de cabello, Tinte, Manicura), 
time slots grid (09:00, 10:30, 11:00 etc), 
confirm button in indigo. 
Soft drop shadow. Premium product shot style. No brand logos except placeholder. 
Rendered on white background. Subtle reflection on screen surface.
```

**Uso en el reel**: El mockup aparece en pantalla mientras el texto explica "el cliente entra al link".

---

### Asset 3 — Checkmark de confirmación animado

**Prompt en inglés:**
```
Animated 3D green checkmark appearing with a bounce effect. 
Green (#10b981) metallic or plastic material. 
White background. Clean and friendly. 
Circle outline first, then the check draws itself in 0.8 seconds. 
Subtle bounce at the end. 
Simple and satisfying animation. Transparent background if possible.
```

**Uso en el reel**: Aparece cuando "el turno queda confirmado".

---

### Asset 4 — Notificación de celular flotante

**Prompt en inglés:**
```
3D floating notification card/bubble, iOS style. 
Rounded rectangle, white with subtle shadow. 
Text placeholder: "Nuevo turno confirmado 🗓️ - María González - Viernes 10:30hs". 
Purple/indigo accent on the left edge (4px stripe, #4f46e5). 
Small Turnero logo placeholder top-left of notification. 
Floating animation, slight rotation. 
Clean white or transparent background. 
Crisp product render.
```

**Uso en el reel**: Aparece cuando "el negocio recibe la notificación".

---

## PARTE 2 — Composición en Remotion

### Estructura de la composición

```
Total duration: 30 segundos = 900 frames a 30fps
Resolución: 1080x1920 (vertical)
```

---

### ESCENA 1 — Hook (frames 0-90 / 0-3 segundos)

**Elemento visual**: Fondo blanco con las pelotas puff de Nanobanana flotando suavemente en la esquina inferior derecha.

**Texto animado** (entra con spring animation desde abajo):
```
¿Tus clientes te piden
turno por WhatsApp?
```
Tipografía: Ubuntu Bold, 80px, color `#374151`  
Animación de entrada: `spring({ frame, fps: 30, from: 50, to: 0 })` en Y-axis  
Delay: frame 15 (0.5 segundos después del inicio)

**Código Remotion base:**
```tsx
// Escena 1 — Hook
const textY = spring({
  frame: frame - 15,
  fps,
  from: 60,
  to: 0,
  config: { damping: 12, stiffness: 200 }
});

return (
  <div style={{ 
    backgroundColor: '#ffffff',
    width: 1080,
    height: 1920,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column'
  }}>
    <div style={{ transform: `translateY(${textY}px)`, opacity: Math.min(1, (frame - 15) / 15) }}>
      <p style={{ fontFamily: 'Ubuntu', fontWeight: 700, fontSize: 80, color: '#374151', textAlign: 'center' }}>
        ¿Tus clientes te piden<br/>turno por WhatsApp?
      </p>
    </div>
    {/* Pelotas puff de Nanobanana — Video loop en esquina inferior derecha */}
  </div>
);
```

---

### ESCENA 2 — Problema (frames 90-240 / 3-8 segundos)

**Transición**: Fade out del texto anterior, fade in del nuevo

**Texto:**
```
Coordinás turnos todo el día.
Y todavía perdés algunos.
```
Color: `#374151`, mismo tamaño

**Elemento adicional**: Íconos animados de WhatsApp, llamada, calendario en papel — aparecen y se tachan con una X roja.

**Animación de íconos:**
```tsx
// Íconos aparecen uno por uno con delay
const icons = ['📱', '📞', '📋'];
icons.map((icon, i) => (
  <div style={{ 
    opacity: interpolate(frame, [90 + i * 20, 90 + i * 20 + 15], [0, 1]),
    textDecoration: frame > 150 ? 'line-through' : 'none'
  }}>
    {icon}
  </div>
));
```

---

### ESCENA 3 — Solución: el link (frames 240-420 / 8-14 segundos)

**Transición**: Wipe from left (el contenido anterior sale por la izquierda, el nuevo entra por la derecha)

**Elemento principal**: El mockup de celular de Nanobanana (Asset 2) hace zoom-in desde escala 0.6 a 1.0

**Texto** (a la izquierda o debajo del celular):
```
Con Turnero:
tu cliente entra al link
y reserva solo.
```
Color: `#374151`

**Highlight**: "tu cliente entra al link" subrayado en lavanda `#c4b5fd`

**Animación del mockup:**
```tsx
const phoneScale = spring({
  frame: frame - 240,
  fps,
  from: 0.6,
  to: 1.0,
  config: { damping: 15, stiffness: 150 }
});

<Img 
  src={staticFile('phone-mockup.png')} 
  style={{ transform: `scale(${phoneScale})` }}
/>
```

---

### ESCENA 4 — Confirmación (frames 420-570 / 14-19 segundos)

**Elemento principal**: El checkmark animado de Nanobanana (Asset 3) aparece en el centro

**Texto:**
```
El turno queda confirmado.
El cliente recibe recordatorio.
Vos recibís la notificación.
```
Las tres líneas aparecen una por una con delay de 0.5 segundos entre ellas.

**Efecto de color**: El fondo tiene un flash suave de verde `#d1fae5` (opacity 0.3) cuando aparece el checkmark.

---

### ESCENA 5 — Notificación al negocio (frames 570-720 / 19-24 segundos)

**Elemento**: La notificación de Nanobanana (Asset 4) baja desde arriba con spring animation

**Texto al lado:**
```
"Nuevo turno confirmado"
A las 10:30 del viernes.
Sin haber contestado nada.
```

"Sin haber contestado nada." en indigo `#4f46e5`, Bold

**Animación de notificación:**
```tsx
const notifY = spring({
  frame: frame - 570,
  fps,
  from: -200,
  to: 0,
  config: { damping: 20, stiffness: 300 }
});

<Img style={{ transform: `translateY(${notifY}px)` }} src={staticFile('notification.png')} />
```

---

### ESCENA 6 — CTA Final (frames 720-900 / 24-30 segundos)

**Fondo**: Degradado suave `#f8f7ff` → `#ede9fe`

**Texto principal** (grande, centrado):
```
Turnero
```
Tipografía: Ubuntu Bold, 120px, indigo `#4f46e5`  
Animación: scale de 0.8 a 1.0 con spring

**Texto secundario:**
```
Sistema de turnos online
para tu negocio

Plan Base desde $80.000 ARS
```

**CTA:**
```
Escribinos por DM 👇
@autom_atia
```
Badge con fondo indigo `#4f46e5`, texto blanco, border-radius 100px

**Pelotas puff finales**: Las 3 pelotas de Nanobanana entran rebotando desde los bordes del frame.

---

## PARTE 3 — Audio del reel

### Opción A — Solo música
Track lo-fi / beat electrónico suave. Volume 100% (no hay voz).  
Buscar en Epidemic Sound: "upbeat minimal" o "chill electronic"  
Duración exacta: 30 segundos, fade out en los últimos 2 segundos.

### Opción B — Voz en off
Grabar voz en off de Joaco leyendo el texto de cada escena, más rápido y conciso.  
Mezclar con música al 25% de volumen de fondo.

**Guión de voz en off (si se usa):**
```
[Escena 1] "¿Tus clientes te piden turno por WhatsApp?"
[Escena 2] "Coordinás todo el día... y aún así perdés turnos."
[Escena 3] "Con Turnero: tu cliente entra al link y reserva solo."
[Escena 4] "El turno queda confirmado. El cliente recibe recordatorio."
[Escena 5] "Y vos recibís la notificación. Sin haber contestado nada."
[Escena 6] "Turnero. Sistema de turnos online. Desde $80.000 ARS. Escribinos."
```

---

## Checklist técnico

- [ ] Prompts enviados a Nanobanana para generar los 4 assets
- [ ] Assets descargados y guardados en `/public/assets/reel-02/`
- [ ] Composición de Remotion creada en `/remotion/reel-02/`
- [ ] Fuente Ubuntu instalada en el proyecto Remotion
- [ ] Testear render a 30fps, 1080x1920
- [ ] Duración exacta: 30 segundos
- [ ] Audio agregado y mezclado
- [ ] Render final exportado como MP4 H.264
- [ ] Subir a Instagram como Reel (no como video normal)

---

## Caption del reel animado

```
Esto es Turnero en 30 segundos 👆

Sistema de turnos online para tu negocio. 
Tus clientes reservan solos, vos recibís la notificación.

Sin aprender nada técnico. Sin mensualidades.
Lo armamos en 24hs.

Plan Base desde $80.000 ARS 🙌

Escribinos "DEMO" por DM para verlo en vivo.

#turneroonline #sistematurnos #peluqueria #clinica #veterinaria #sanluisargentina #pymesargentinas #automatizacion #reel #divinia
```
