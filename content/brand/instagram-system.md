# Sistema Visual Instagram — @autom_atia (Turnero by DIVINIA)
> Última actualización: 16/04/2026
> Basado en análisis de bioturno.arg + cloxsy

---

## Paleta

| Token | Hex | Uso |
|---|---|---|
| `bg` | `#09090b` | Fondo de todos los posts |
| `purple` | `#8B5CF6` | Acento principal, CTAs, highlights |
| `pink` | `#EC4899` | Acento secundario, urgencia |
| `green` | `#10B981` | Confirmaciones, checkmarks |
| `white` | `#ffffff` | Texto principal |
| `gray` | `#a1a1aa` | Texto secundario |

---

## Elementos fijos (TODOS los posts)

1. **Círculo violeta** — grande, difuso, esquina superior derecha, 30% opacity, parcialmente cortado
2. **Círculo rosa** — pequeño, difuso, esquina inferior izquierda, 25% opacity
3. **Badge pill** — arriba centrado, borde violeta semitransparente, texto de categoría
4. **Logo footer** — `◉ Turnero by DIVINIA` — blanco 50% opacity, abajo centrado
5. **Fondo**: siempre `#09090b`, NUNCA blanco

---

## Tipografía

- **Titular**: Inter ExtraBold / Outfit Black, blanco, 80-100px, tracking -2
- **Palabras clave**: mismo tamaño, color violeta `#8B5CF6` o rosa `#EC4899`
- **Subtexto**: gray `#a1a1aa`, 28-36px, regular
- **Badge**: 22-26px, bold, color violeta
- **Logo**: 22px, 500 weight

---

## Estética animación — MTV 2016

Para todos los videos/reels generados con Remotion:

```
- Entrada de texto: spring con damping 6, stiffness 300 (overshoot 1.2x antes de 1)
- Círculos decorativos: rotate continuo lento (1 vuelta / 8 seg)
- Mockup de celular: float suave (8px arriba/abajo, 3 seg/ciclo)
- Badge pill: scale 0 → 1.2 → 1 con spring
- CTA pill: pulse suave ±3% sin parar
- Glitch: 2 frames de color shift en transiciones clave
```

---

## Mockups de celular

Usar screenshots reales del sistema en:
- `divinia.vercel.app/reservas/rufina-nails-demo` — peluquería/nails
- `divinia.vercel.app/reservas/fa-faby-demo` — estética/salud
- `divinia.vercel.app/reservas/cantera-boutique-hotel-demo` — hotel
- `divinia.vercel.app/reservas/top-quality-demo` — mantenimiento

Frame sugerido: iPhone 15 Pro oscuro o transparente

---

## Los 15 posts — Calendario Mes 1

| # | Fecha | Tipo | Herramienta | Concepto |
|---|---|---|---|---|
| 1 | 16 Abr | Estático | Canva | Lanzamiento — "Ya llegamos" |
| 2 | 18 Abr | Carrusel 5 slides | Canva | El problema — turnos perdidos |
| 3 | 21 Abr | Estático | Canva | Estadística — número "3" |
| 4 | 23 Abr | Reel | Freepik Kling + Remotion | Demo reserva 30 seg |
| 5 | 25 Abr | Carrusel 4 slides | Canva | Antes/Después |
| 6 | 28 Abr | Estático | Canva | Precio reveal $43k/$100k |
| 7 | 30 Abr | Reel | Freepik Seedance + Remotion | Toggle ESTRÉS OFF / TURNERO ON |
| 8 | 2 May | Carrusel 6 slides | Canva | Features completo |
| 9 | 5 May | Estático | Canva | Social proof San Luis |
| 10 | 7 May | Carrusel | Canva | Comparación WhatsApp vs Turnero |
| 11 | 9 May | Carrusel 5 slides | Canva | Cómo funciona paso a paso |
| 12 | 12 May | Estático | Canva | Urgencia — 5 lugares |
| 13 | 14 May | Reel | Freepik Kling + Remotion | Emojis rubros en 3D |
| 14 | 16 May | Carrusel | Canva | Objeción precio — ROI real |
| 15 | 19 May | Reel | Freepik Seedance + Remotion | CTA cierre mes 1 |

---

## Prompts Freepik (solo los 4 videos)

### Video 1 — Demo reserva (POST 4) · Kling Omni
```
Smartphone floating on black background, screen showing a clean booking calendar app 
with purple accent colors, a finger taps the screen and a green checkmark confirmation 
appears, soft purple glow underneath the phone, cinematic 4K, slow motion, dark moody lighting
```
Guardar como: `public/reels/post4-demo-reserva.mp4`

### Video 2 — Toggle ON/OFF (POST 7) · Seedance 2.0
```
3D toggle switch animation on dark background, first toggle labeled slides from ON to OFF 
position with bounce physics, second toggle slides from OFF to ON with satisfying spring 
animation, indigo purple glow, cinematic dark, smooth slow motion, minimal clean design
```
Guardar como: `public/reels/post7-toggle.mp4`

### Video 3 — Emojis rubros (POST 13) · Kling Omni
```
3D emojis appearing one by one with bouncy pop animation on dark background, scissors emoji, 
nail polish, massage, tooth, paw print, dumbbell, each pops in with spring physics overshoot, 
soft purple and pink ambient glow, cinematic 4K, playful energy
```
Guardar como: `public/reels/post13-rubros.mp4`

### Video 4 — Mockup girando (POST 15) · Seedance 2.0
```
Modern smartphone slowly rotating 360 degrees on dark background, screen shows a booking 
management dashboard with purple UI, soft indigo glow underneath, cinematic product shot, 
4K, studio lighting, premium feel, slow smooth rotation
```
Guardar como: `public/reels/post15-mockup-giro.mp4`

---

## Query base Canva (copiar en generate-design)

```
Dark background #09090b, large decorative purple circle (#8B5CF6, 60% opacity, blurred) 
top right corner partially cropped by edge, small pink circle (#EC4899, blurred) bottom left, 
white bold text "Turnero" centered at bottom as logo, badge pill with rounded border 
and purple semitransparent background at top center, Inter ExtraBold or Outfit Black 
font, white main text, key words highlighted in purple or pink, premium SaaS dark 
minimal aesthetic, no stock photos, no gradients except the circles
```

---

## Rendidos en Remotion

Comandos para renderizar los 4 reels (después de subir videos a `public/reels/`):

```bash
cd C:/divinia
npx remotion render remotion/Root.tsx Insta-Post4-Demo out/instagram/post4-demo.mp4
npx remotion render remotion/Root.tsx Insta-Post7-Toggle out/instagram/post7-toggle.mp4
npx remotion render remotion/Root.tsx Insta-Post13-Rubros out/instagram/post13-rubros.mp4
npx remotion render remotion/Root.tsx Insta-Post15-CTA out/instagram/post15-cta.mp4
```

---

## Bio @autom_atia

```
Turnero by DIVINIA
📅 Turnos online para tu negocio
💰 Señas por MercadoPago
🔔 Recordatorios automáticos
📍 San Luis, Argentina
⬇️ Probalo gratis — demo real
```
Link en bio: `divinia.vercel.app/rubros`

Highlights:
- "Demos" — capturas de /reservas por rubro
- "Precios" — slide del post 6
- "Cómo funciona" — slides del post 11
