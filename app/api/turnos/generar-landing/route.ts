import { NextRequest, NextResponse } from 'next/server'
import { readFileSync } from 'fs'
import { join } from 'path'

export const dynamic = 'force-dynamic'

// Escapa comillas simples y backslashes para inserción segura en strings JS
function esc(val: unknown): string {
  return String(val ?? '').replace(/\\/g, '\\\\').replace(/'/g, "\\'")
}

export async function POST(req: NextRequest) {
  const cfg = await req.json()

  const templatePath = join(process.cwd(), 'plantillas', 'sistema-turnos', 'landing.html')
  let html = readFileSync(templatePath, 'utf-8')

  // Construir el bloque CONFIG con los datos del usuario
  const serviciosStr = (cfg.servicios as { cat: string; nombre: string; precio: number }[])
    .map(s => `    { cat: '${esc(s.cat)}', nombre: '${esc(s.nombre)}', precio: ${Number(s.precio) || 0} },`)
    .join('\n')

  const newConfig = `var CONFIG = {

  /* ── NEGOCIO ─────────────────────────────────────────── */
  nombre:        '${esc(cfg.nombre)}',
  slogan:        '${esc(cfg.slogan)}',
  emoji:         '${esc(cfg.emoji)}',
  instagram:     '${esc(cfg.instagram)}',
  ig_handle:     '${esc(cfg.ig_handle)}',

  /* ── CONTACTO ──────────────────────────────────────────── */
  wsp_duena:    '${esc(cfg.wsp_duena)}',
  nombre_duena: '${esc(cfg.nombre_duena)}',

  /* ── COLORES ─────────────────────────────────────────── */
  color1:        '${esc(cfg.color1)}',
  color2:        '${esc(cfg.color2)}',
  color3:        '${esc(cfg.color3)}',
  color4:        '${esc(cfg.color4)}',
  color5:        '${esc(cfg.color5)}',

  /* ── HORARIOS ─────────────────────────────────────────── */
  hora_inicio:   ${Number(cfg.hora_inicio) || 9},
  hora_cierre:   ${Number(cfg.hora_cierre) || 20},
  turno_minutos: ${Number(cfg.turno_minutos) || 30},

  /* ── SUPABASE ─────────────────────────────────────────── */
  sb_url:  '${esc(cfg.sb_url)}',
  sb_key:  '${esc(cfg.sb_key)}',

  /* ── SERVICIOS ─────────────────────────────────────────── */
  servicios: [
${serviciosStr}
  ]

}`

  // Reemplazar el bloque CONFIG en el template
  html = html.replace(/var CONFIG = \{[\s\S]*?\n\}/, newConfig)

  const filename = `turnos-${esc(cfg.nombre).toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}.html`

  return new NextResponse(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  })
}
