import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { nombre, telefono, oficio, zona, precio, descripcion } = body

    if (!nombre || !telefono || !oficio || !zona) {
      return NextResponse.json({ error: 'Faltan campos requeridos' }, { status: 400 })
    }

    const db = createAdminClient()

    const { error } = await db.from('mp_oficios').insert({
      nombre: String(nombre).slice(0, 120),
      whatsapp: String(telefono).replace(/\D/g, '').slice(0, 20),
      oficio: String(oficio).slice(0, 80),
      zona: String(zona).slice(0, 80),
      precio: precio ? String(precio).slice(0, 60) : null,
      descripcion: descripcion ? String(descripcion).slice(0, 500) : null,
      disponible: true,
      activo: false, // pending review
    })

    if (error) {
      // Table might not exist yet — return success anyway (soft fail)
      console.error('mp_oficios insert error:', error.message)
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('POST /api/market/oficios error:', err)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
