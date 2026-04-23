import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData()
    const file = form.get('file') as File | null
    const folder = (form.get('folder') as string) || 'productos'

    if (!file) return NextResponse.json({ error: 'No file' }, { status: 400 })

    const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg'
    const allowed = ['jpg', 'jpeg', 'png', 'webp', 'gif']
    if (!allowed.includes(ext)) return NextResponse.json({ error: 'Tipo no permitido' }, { status: 400 })
    if (file.size > 5 * 1024 * 1024) return NextResponse.json({ error: 'Máximo 5MB' }, { status: 400 })

    const filename = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const db = createAdminClient()
    const { error } = await db.storage
      .from('divinia-media')
      .upload(filename, buffer, { contentType: file.type, upsert: false })

    if (error) {
      console.error('[upload]', error)
      return NextResponse.json({ error: 'Error al subir imagen' }, { status: 500 })
    }

    const { data: { publicUrl } } = db.storage
      .from('divinia-media')
      .getPublicUrl(filename)

    return NextResponse.json({ url: publicUrl })
  } catch (err) {
    console.error('[upload]', err)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
