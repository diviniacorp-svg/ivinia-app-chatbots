import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('leads')
      .select('*')
      .order('score', { ascending: false })
      .order('created_at', { ascending: false })

    if (error) throw error
    return NextResponse.json({ leads: data })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { leads } = await request.json()
    if (!Array.isArray(leads) || leads.length === 0) {
      return NextResponse.json({ error: 'leads array requerido' }, { status: 400 })
    }

    const { data, error } = await supabaseAdmin
      .from('leads')
      .upsert(
        leads.map((l: Record<string, unknown>) => ({
          ...l,
          updated_at: new Date().toISOString(),
        })),
        { onConflict: 'company_name,city,rubro' }
      )
      .select()

    if (error) throw error
    return NextResponse.json({ leads: data, count: data?.length })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error al guardar' },
      { status: 500 }
    )
  }
}
