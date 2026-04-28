// Social accounts CRUD — credentials management
// NOTE: access_token is NEVER returned in GET — only 'configured' boolean
import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const socialClientId = req.nextUrl.searchParams.get('socialClientId')
  if (!socialClientId) return NextResponse.json({ error: 'socialClientId requerido' }, { status: 400 })

  const db = createAdminClient()
  const { data, error } = await db
    .from('social_accounts')
    .select('id, social_client_id, platform, account_id, account_username, account_name, account_avatar_url, is_active, last_synced_at, token_expires_at')
    .eq('social_client_id', socialClientId)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Add 'configured' flag without exposing tokens
  const accounts = (data ?? []).map(a => ({ ...a, configured: true }))
  return NextResponse.json({ accounts })
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const db = createAdminClient()

  const { data, error } = await db
    .from('social_accounts')
    .upsert({
      social_client_id: body.socialClientId,
      platform: body.platform,
      access_token: body.accessToken,
      refresh_token: body.refreshToken ?? null,
      token_expires_at: body.tokenExpiresAt ?? null,
      account_id: body.accountId,
      account_username: body.accountUsername ?? null,
      account_name: body.accountName ?? null,
      extra_config: body.extraConfig ?? {},
      is_active: true,
    }, { onConflict: 'social_client_id,platform' })
    .select('id, platform, account_username, is_active')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ account: data })
}

export async function DELETE(req: NextRequest) {
  const id = req.nextUrl.searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'id requerido' }, { status: 400 })

  const db = createAdminClient()
  await db.from('social_accounts').update({ is_active: false }).eq('id', id)
  return NextResponse.json({ ok: true })
}
