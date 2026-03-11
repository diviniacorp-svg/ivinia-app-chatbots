import { NextRequest, NextResponse } from 'next/server'
import { readFileSync } from 'fs'
import { join } from 'path'

export async function POST(req: NextRequest) {
  const cfg = await req.json()

  const templatePath = join(process.cwd(), 'plantillas', 'sistema-turnos', 'landing.html')
  let html = readFileSync(templatePath, 'utf-8')

  // Construir el bloque CONFIG con los datos del usuario
  const serviciosStr = (cfg.servicios as { cat: string; nombre: string; precio: number }[])
    .map(s => `    { cat: '${s.cat}', nombre: '${s.nombre}', precio: ${s.precio} },`)
    .join('\n')

  const newConfig = `var CONFIG = {

  /* ── NEGOCIO ─────────────────────────────────────────── */
  nombre:        '${cfg.nombre}',
  slogan:        '${cfg.slogan}',
  emoji:         '${cfg.emoji}',
  instagram:     '${cfg.instagram}',
  ig_handle:     '${cfg.ig_handle}',

  /* ── CONTACTO ──────────────────────────────────────────── */
  wsp_duena:    '${cfg.wsp_duena}',
  nombre_duena: '${cfg.nombre_duena}',

  /* ── COLORES ─────────────────────────────────────────── */
  color1:        '${cfg.color1}',
  color2:        '${cfg.color2}',
  color3:        '${cfg.color3}',
  color4:        '${cfg.color4}',
  color5:        '${cfg.color5}',

  /* ── HORARIOS ─────────────────────────────────────────── */
  hora_inicio:   ${cfg.hora_inicio},
  hora_cierre:   ${cfg.hora_cierre},
  turno_minutos: ${cfg.turno_minutos},

  /* ── SUPABASE ─────────────────────────────────────────── */
  sb_url:  '${cfg.sb_url}',
  sb_key:  '${cfg.sb_key}',

  /* ── SERVICIOS ─────────────────────────────────────────── */
  servicios: [
${serviciosStr}
  ]

}`

  // Reemplazar el bloque CONFIG en el template
  html = html.replace(/var CONFIG = \{[\s\S]*?\n\}/, newConfig)

  const filename = `turnos-${cfg.nombre.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}.html`

  return new NextResponse(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  })
}
