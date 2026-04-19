export interface RubroTheme {
  emoji: string
  bg: string
  accentGlow: string
  particleEmojis: string[]
  label: string
}

export const RUBRO_THEMES: Record<string, RubroTheme> = {
  peluqueria: {
    emoji: '✂️',
    bg: 'radial-gradient(ellipse at top, #1a0a2e 0%, #0d0a18 60%, #080808 100%)',
    accentGlow: '180, 100, 255',
    particleEmojis: ['✂️', '💇', '💈', '🪞'],
    label: 'Peluquería',
  },
  clinica: {
    emoji: '🩺',
    bg: 'radial-gradient(ellipse at top, #001a33 0%, #000e1f 60%, #080808 100%)',
    accentGlow: '0, 160, 255',
    particleEmojis: ['🩺', '💊', '🏥', '❤️'],
    label: 'Clínica',
  },
  spa: {
    emoji: '🌿',
    bg: 'radial-gradient(ellipse at top, #071a0a 0%, #050f06 60%, #080808 100%)',
    accentGlow: '50, 200, 100',
    particleEmojis: ['🌿', '🌸', '🕯️', '💆'],
    label: 'Spa & Wellness',
  },
  restaurante: {
    emoji: '🍽️',
    bg: 'radial-gradient(ellipse at top, #1a0e00 0%, #100800 60%, #080808 100%)',
    accentGlow: '255, 140, 0',
    particleEmojis: ['🍽️', '🥂', '🍷', '🌟'],
    label: 'Restaurante',
  },
  gimnasio: {
    emoji: '💪',
    bg: 'radial-gradient(ellipse at top, #1a1600 0%, #100e00 60%, #080808 100%)',
    accentGlow: '220, 200, 0',
    particleEmojis: ['💪', '🏋️', '🔥', '⚡'],
    label: 'Gimnasio',
  },
  veterinaria: {
    emoji: '🐾',
    bg: 'radial-gradient(ellipse at top, #0a0a1a 0%, #060610 60%, #080808 100%)',
    accentGlow: '100, 100, 255',
    particleEmojis: ['🐾', '🐶', '🐱', '❤️'],
    label: 'Veterinaria',
  },
  odontologia: {
    emoji: '🦷',
    bg: 'radial-gradient(ellipse at top, #001533 0%, #000c20 60%, #080808 100%)',
    accentGlow: '80, 180, 255',
    particleEmojis: ['🦷', '😁', '✨', '🌟'],
    label: 'Odontología',
  },
  estetica: {
    emoji: '💅',
    bg: 'radial-gradient(ellipse at top, #1a0014 0%, #10000c 60%, #080808 100%)',
    accentGlow: '255, 80, 160',
    particleEmojis: ['💅', '✨', '🌸', '💄'],
    label: 'Estética',
  },
  psicologia: {
    emoji: '🧠',
    bg: 'radial-gradient(ellipse at top, #0d0020 0%, #080015 60%, #080808 100%)',
    accentGlow: '150, 80, 255',
    particleEmojis: ['🧠', '💭', '🌱', '✨'],
    label: 'Psicología',
  },
  abogado: {
    emoji: '⚖️',
    bg: 'radial-gradient(ellipse at top, #0a0a0a 0%, #060606 60%, #040404 100%)',
    accentGlow: '180, 160, 120',
    particleEmojis: ['⚖️', '📜', '🏛️', '✍️'],
    label: 'Estudio Jurídico',
  },
  contabilidad: {
    emoji: '📊',
    bg: 'radial-gradient(ellipse at top, #001a10 0%, #000f08 60%, #080808 100%)',
    accentGlow: '0, 200, 120',
    particleEmojis: ['📊', '💼', '📈', '✅'],
    label: 'Contabilidad',
  },
  default: {
    emoji: '📅',
    bg: 'radial-gradient(ellipse at top, #111827 0%, #0a0f1a 60%, #080808 100%)',
    accentGlow: '100, 120, 255',
    particleEmojis: ['📅', '⭐', '✨', '🌟'],
    label: 'Turnos Online',
  },
}

export function getThemeForRubro(tipoNegocio?: string | null): RubroTheme {
  if (!tipoNegocio) return RUBRO_THEMES.default
  const key = tipoNegocio.toLowerCase()
    .replace(/á/g, 'a').replace(/é/g, 'e').replace(/í/g, 'i')
    .replace(/ó/g, 'o').replace(/ú/g, 'u')
  // Exact match
  if (RUBRO_THEMES[key]) return RUBRO_THEMES[key]
  // Partial match
  for (const [k, v] of Object.entries(RUBRO_THEMES)) {
    if (k !== 'default' && key.includes(k)) return v
  }
  return RUBRO_THEMES.default
}

/** Alias simplificado */
export const getTheme = getThemeForRubro
