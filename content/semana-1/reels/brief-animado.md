# Reel 02 — Brief: Reel Animado con Nanobanana + Remotion

**Tipo**: Reel 100% animado, sin cara, generado digitalmente
**Duración**: 30 segundos exactos
**Herramientas**: Nanobanana (assets 3D visuales) + Remotion (composición y animación en React)
**Composición de Remotion a usar**: `Nano-Turnero-Hook` (nombre de la composición a crear)
**Propósito**: Mostrar el producto de forma visualmente atractiva y reproducible. Este reel se puede generar múltiples veces con variaciones de texto y rubros sin necesidad de grabar nada.

---

## PARTE 1 — Assets a Generar en Nanobanana

Nanobanana acepta prompts en inglés para generar videos e imágenes 3D cortos. Los siguientes prompts generan los 4 assets visuales base del reel. Generar en este orden.

### Asset 1 — Pelotas Puff Flotando (Background Loop)

**Prompt exacto en inglés para Nanobanana**:
```
3D animated glossy inflatable spheres floating gently in pure white space.
Three spheres total: one large lavender sphere (#c4b5fd) center-right, 
one medium indigo sphere (#4f46e5) lower-left, one small purple sphere (#818cf8) upper-right.
Each sphere has shiny plastic surface with specular highlight on upper-left area.
Soft gaussian shadow below each sphere, simulating floating 10cm above ground.
Gentle synchronized bobbing animation: 2-second seamless loop, smooth ease-in-out.
Clean pure white background, no gradients, no texture.
Product render studio lighting, three-point light setup.
No text, no labels, no UI elements.
Cute inflatable toy aesthetic, MTV 2012 era 3D graphics style.
Output specs: seamless loop, 1080x1920 vertical format, transparent background if possible, PNG sequence or MP4.
```

**Cómo usar este asset**: Background animado para todas las escenas de texto del reel. Las pelotas flotan suavemente mientras el copy aparece encima. Se importa como video de fondo en la composición de Remotion y se pone en loop.

**Duración del loop**: 2 segundos — Remotion lo loopeará automáticamente con `<OffthreadVideo loop>`.

---

### Asset 2 — Mockup de Celular con la App de Turnero

**Prompt exacto en inglés para Nanobanana**:
```
Modern smartphone 3D mockup, floating in white studio space.
Phone slightly rotated 15 degrees on Y axis for dynamic perspective.
Screen content visible and readable: clean appointment booking interface,
white background, purple indigo color scheme (#4f46e5).
Screen shows: header "Reservá tu turno", list of services below
(Corte de cabello, Tinte, Manicura — with small calendar icons),
time slot grid showing available times (09:00 ✓, 10:30 ✓, 12:00 ✗, 14:00 ✓),
large "Confirmar turno" button in solid indigo at bottom.
Phone body: matte dark frame, thin bezels, no notch (clean look).
Soft drop shadow below phone. Premium product photography style.
Subtle screen glass reflection.
Pure white background. No brand logos except abstract placeholder.
Static image or very slow rotation animation (360 degrees in 8 seconds).
Output: 1080x1920, high resolution.
```

**Cómo usar**: Aparece en la escena 3 del reel cuando el texto dice "tu cliente entra al link y reserva solo". El mockup hace zoom-in con spring animation en Remotion.

---

### Asset 3 — Checkmark 3D Animado (Confirmación)

**Prompt exacto en inglés para Nanobanana**:
```
Animated 3D checkmark icon with satisfying reveal animation.
Green color (#10b981), glossy plastic or metallic material with slight sheen.
Animation sequence: 
1. Circle outline draws itself from 12 o'clock position clockwise (0.4 seconds)
2. Checkmark stroke draws itself inside the circle (0.4 seconds)  
3. Gentle bounce/pop scale effect at the end (0.2 seconds)
Total animation duration: 1 second, then hold static.
Pure white background or transparent background (PNG with alpha).
Clean, friendly, satisfying visual feedback animation.
Style: modern app UI success state, minimal and clean.
Output: 1080x1080 square or transparent PNG sequence.
```

**Cómo usar**: Aparece en la escena 4 cuando el turno queda confirmado. Se integra en Remotion como imagen con entrada animada, escala 0 → 1 con spring bounce.

---

### Asset 4 — Tarjeta de Notificación Flotante

**Prompt exacto en inglés para Nanobanana**:
```
3D floating notification card in iOS/modern style.
Rounded rectangle shape, slight 3D depth, floating in white space with soft shadow.
Card appearance: white background (#ffffff), border-radius 20px, dimensions roughly 600x120px.
Left edge: 6px solid indigo stripe (#4f46e5).
Content inside card:
- Small calendar emoji 🗓️ top-left (32px)
- Title text: "Nuevo turno confirmado" — bold, dark (#1e1b4b)
- Subtitle: "María G. — Viernes 10:30hs" — regular, gray (#6b7280)
- Small "Turnero" text label top-right — indigo (#4f46e5)
Card floating with gentle tilt (5 degrees), slow bob animation.
Pure white background. Product render quality.
Output: 1080x400 or similar aspect ratio, or 1080x1920 with card centered.
```

**Cómo usar**: Aparece en la escena 5 bajando desde la parte superior del frame con spring animation en Remotion. Representa la notificación que recibe el negocio.

---

## PARTE 2 — Estructura de la Composición en Remotion

### Setup técnico
```
Nombre de la composición: Nano-Turnero-Hook
Total duration: 30 segundos = 900 frames a 30fps
Resolución: 1080x1920 (vertical)
FPS: 30
Font: Ubuntu Bold (importar desde Google Fonts en el proyecto Remotion)
```

### Instalación de dependencias
```bash
npm create video@latest -- --template blank
cd remotion-turnero
npm install @remotion/google-fonts
```

### Importar Ubuntu en el proyecto
```tsx
// Root.tsx
import { loadFont } from "@remotion/google-fonts/Ubuntu";
const { fontFamily } = loadFont("normal");
```

---

## Escena por Escena — Texto Frame a Frame

### ESCENA 1 — Hook (frames 0 a 90 / segundos 0 a 3)

**Texto en pantalla**:
```
¿Tus clientes te piden
turno por WhatsApp?
```
Color: `#374151`, Ubuntu Bold, 80px, centrado
Fondo: pelotas puff flotando (Asset 1 en loop)

**Animación de entrada del texto**:
```tsx
const textY = spring({
  frame: frame - 15,
  fps,
  from: 60,
  to: 0,
  config: { damping: 12, stiffness: 200 },
});
const textOpacity = interpolate(frame, [15, 30], [0, 1], { extrapolateRight: "clamp" });
```

**Duración**: texto aparece en frame 15, mantiene hasta frame 80, fade out frames 80-90.

---

### ESCENA 2 — El Problema (frames 90 a 240 / segundos 3 a 8)

**Texto principal**:
```
Coordinás turnos todo el día.
Y todavía perdés algunos.
```
Color: `#374151`, Ubuntu Bold, 72px

**Tres íconos animados** que aparecen uno por uno y luego se tachan:
- 📱 Aparece en frame 100
- 📞 Aparece en frame 120
- 📋 Aparece en frame 140
- Línea de tachado roja aparece sobre los tres en frame 180

**Código Remotion para los íconos**:
```tsx
const icons = [
  { emoji: "📱", label: "WhatsApp", delay: 100 },
  { emoji: "📞", label: "llamadas", delay: 120 },
  { emoji: "📋", label: "agenda papel", delay: 140 },
];

{icons.map(({ emoji, label, delay }, i) => {
  const appear = interpolate(frame, [delay, delay + 15], [0, 1], {
    extrapolateRight: "clamp",
  });
  const strikeWidth = frame > 180 
    ? interpolate(frame, [180 + i * 10, 200 + i * 10], [0, 100], { extrapolateRight: "clamp" })
    : 0;

  return (
    <div key={i} style={{ opacity: appear, position: "relative" }}>
      <span style={{ fontSize: 60 }}>{emoji}</span>
      <span style={{ fontSize: 28, color: "#6b7280", marginLeft: 12 }}>{label}</span>
      <div style={{
        position: "absolute", top: "50%", left: 0,
        width: `${strikeWidth}%`, height: 3,
        backgroundColor: "#ef4444",
        transition: "none",
      }} />
    </div>
  );
})}
```

**Transición a escena 3**: Wipe from left — el contenido sale por la izquierda, el nuevo entra por la derecha.

---

### ESCENA 3 — La Solución: El Link (frames 240 a 420 / segundos 8 a 14)

**Elemento principal**: Mockup de celular (Asset 2) entra con zoom spring desde escala 0.6.

**Texto a la izquierda del mockup**:
```
Con Turnero:

tu cliente entra
al link y reserva solo.
```
"al link y reserva solo." en Ubuntu Bold, indigo `#4f46e5`

**Animación del mockup**:
```tsx
const phoneScale = spring({
  frame: frame - 240,
  fps,
  from: 0.6,
  to: 1.0,
  config: { damping: 15, stiffness: 150 },
});

const phoneOpacity = interpolate(frame, [240, 270], [0, 1], {
  extrapolateRight: "clamp",
});

<Img
  src={staticFile("phone-mockup.png")}
  style={{
    transform: `scale(${phoneScale})`,
    opacity: phoneOpacity,
    width: 400,
    height: "auto",
  }}
/>
```

**Highlight en el texto**: "al link y reserva solo." tiene underline animado en lavanda `#c4b5fd` que aparece en frame 350.

---

### ESCENA 4 — Confirmación del Turno (frames 420 a 570 / segundos 14 a 19)

**Elemento principal**: Checkmark 3D (Asset 3) aparece en el centro con spring scale.

**Tres líneas de texto** apareciendo una por una con delay de 15 frames entre cada una:
```
Línea 1 (frame 440): "El turno queda confirmado."
Línea 2 (frame 455): "El cliente recibe recordatorio."
Línea 3 (frame 470): "Vos recibís la notificación."
```

**Flash de fondo**: En frame 430, el fondo hace un flash suave de verde `#d1fae5` al 30% de opacidad durante 20 frames (como si algo se activara).

**Animación del checkmark**:
```tsx
const checkScale = spring({
  frame: frame - 420,
  fps,
  from: 0,
  to: 1,
  config: { damping: 8, stiffness: 300 },
});

const bgFlash = interpolate(
  frame, [430, 440, 450, 460],
  [0, 0.3, 0.3, 0],
  { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
);
```

---

### ESCENA 5 — Notificación al Negocio (frames 570 a 720 / segundos 19 a 24)

**Elemento principal**: Tarjeta de notificación (Asset 4) baja desde arriba del frame.

**Texto al lado o debajo**:
```
"Nuevo turno confirmado"

A las 10:30 del viernes.

Sin haber contestado nada.
```
"Sin haber contestado nada." en Ubuntu Bold, indigo `#4f46e5`

**Animación de la notificación entrando desde arriba**:
```tsx
const notifY = spring({
  frame: frame - 570,
  fps,
  from: -250,
  to: 0,
  config: { damping: 20, stiffness: 300 },
});

const notifOpacity = interpolate(frame, [570, 595], [0, 1], {
  extrapolateRight: "clamp",
});

<Img
  src={staticFile("notification-card.png")}
  style={{
    transform: `translateY(${notifY}px)`,
    opacity: notifOpacity,
    width: 560,
    borderRadius: 20,
  }}
/>
```

---

### ESCENA 6 — CTA Final (frames 720 a 900 / segundos 24 a 30)

**Fondo**: Degradado suave `#f8f7ff` → `#ede9fe` (no el fondo con pelotas — este slide es más limpio, más comercial).

**Texto "Turnero"** (grande, con scale spring):
```
Turnero
```
Ubuntu Bold, 120px, indigo `#4f46e5`

**Texto secundario debajo**:
```
Sistema de turnos online
para tu negocio

Plan Base desde $80.000 ARS
```
Ubuntu Regular 44px, `#374151`

**Badge CTA** (cápsula con fondo indigo, texto blanco):
```
Escribinos por DM 👇
@autom_atia
```
Ubuntu Bold 36px, background `#4f46e5`, border-radius 100px, padding 20px 40px

**Las pelotas puff** (Asset 1) entran desde los bordes del frame con spring:
```tsx
// Pelota grande — entra desde abajo-derecha
const ball1X = spring({ frame: frame - 720, fps, from: 200, to: 0, config: { damping: 18 } });
const ball1Y = spring({ frame: frame - 720, fps, from: 200, to: 0, config: { damping: 18 } });

// Pelota chica — entra desde arriba-izquierda  
const ball2X = spring({ frame: frame - 720, fps, from: -150, to: 0, config: { damping: 15 } });
```

---

## PARTE 3 — Audio

### Opción A — Solo música instrumental (recomendada para el primer reel animado)
- Estilo: upbeat minimal electronic / chill lo-fi con un poco de energía
- Fuente: Epidemic Sound (buscar "upbeat minimal", "positive lo-fi") o YouTube Audio Library
- Duración exacta: 30 segundos, con fade out de 1.5 segundos al final
- En Remotion agregar con `<Audio src={staticFile("track.mp3")} />` en la composición

### Opción B — Voz en off de Joaco
Grabar la narración por separado, más rápida que el reel filmado. Mezclar música al 20% debajo.

**Guión de voz en off (si se usa — leerlo en 28 segundos)**:
```
[Escena 1 - 0-3s]: "¿Tus clientes te piden turno por WhatsApp?"
[Escena 2 - 3-8s]: "Coordinás todo el día... y todavía perdés turnos."
[Escena 3 - 8-14s]: "Con Turnero: tu cliente entra al link y reserva solo."
[Escena 4 - 14-19s]: "El turno queda confirmado. El cliente recibe recordatorio."
[Escena 5 - 19-24s]: "Vos recibís la notificación. Sin haber contestado nada."
[Escena 6 - 24-30s]: "Turnero. Sistema de turnos online. Desde $80.000. Escribinos."
```

---

## Estructura de Archivos del Proyecto Remotion

```
remotion-turnero/
├── public/
│   ├── assets/
│   │   ├── puff-balls-loop.mp4      ← Asset 1 de Nanobanana
│   │   ├── phone-mockup.png         ← Asset 2 de Nanobanana
│   │   ├── checkmark.gif            ← Asset 3 de Nanobanana
│   │   └── notification-card.png    ← Asset 4 de Nanobanana
│   └── audio/
│       └── track.mp3
├── src/
│   ├── compositions/
│   │   └── NanoTurneroHook.tsx      ← La composición principal
│   ├── scenes/
│   │   ├── Scene1Hook.tsx
│   │   ├── Scene2Problem.tsx
│   │   ├── Scene3Solution.tsx
│   │   ├── Scene4Confirm.tsx
│   │   ├── Scene5Notification.tsx
│   │   └── Scene6CTA.tsx
│   └── Root.tsx
└── package.json
```

---

## Caption del Reel Animado

```
Esto es Turnero en 30 segundos 👆

Sistema de turnos online para tu negocio.
Tus clientes reservan solos. Vos recibís la notificación.

Sin aprender nada técnico. Sin mensualidades.
Lo configuramos en 24hs.

Plan Base desde $80.000 ARS 🙌

Escribinos "DEMO" por DM para verlo en vivo para tu rubro.

#turneroonline #sistematurnos #peluqueria #clinica #veterinaria #sanluisargentina #pymesargentinas #automatizacion #reel #divinia #negocioargentino #turnosdigitales #estetica #taller #tecnologiapymes
```

---

## Checklist Técnico

- [ ] Prompts enviados a Nanobanana para los 4 assets
- [ ] Assets descargados y colocados en `public/assets/`
- [ ] Proyecto Remotion creado con template blank
- [ ] Fuente Ubuntu instalada via @remotion/google-fonts
- [ ] Las 6 escenas codificadas en archivos separados
- [ ] Composición principal `Nano-Turnero-Hook` registrada en Root.tsx
- [ ] Preview corriendo en localhost — revisar timing de cada escena
- [ ] Audio agregado y sincronizado
- [ ] Render final: `npx remotion render Nano-Turnero-Hook output.mp4`
- [ ] Verificar: 30 segundos exactos, 1080x1920, 30fps
- [ ] Subir a Instagram como Reel (no como video normal — el algoritmo los distribuye diferente)
