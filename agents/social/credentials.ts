// ============================================================
// DIVINIA Social Agency — Credential Resolver
// Reads from social_accounts table; falls back to env for DIVINIA
// ============================================================

import { createAdminClient } from '@/lib/supabase'
import type { Platform, PlatformCredentials } from './types'

export async function getCredentials(
  socialClientId: string,
  platform: Platform
): Promise<PlatformCredentials> {
  const db = createAdminClient()

  const { data } = await db
    .from('social_accounts')
    .select('access_token, refresh_token, account_id, account_username, extra_config, token_expires_at')
    .eq('social_client_id', socialClientId)
    .eq('platform', platform)
    .eq('is_active', true)
    .single()

  if (data?.access_token) {
    return {
      platform,
      accessToken: data.access_token,
      refreshToken: data.refresh_token ?? undefined,
      accountId: data.account_id,
      accountUsername: data.account_username ?? undefined,
      extraConfig: data.extra_config ?? undefined,
    }
  }

  // Fallback to env vars for DIVINIA's own accounts
  const { data: client } = await db
    .from('social_clients')
    .select('is_divinia')
    .eq('id', socialClientId)
    .single()

  if (client?.is_divinia) {
    return getDiviniaEnvCredentials(platform)
  }

  throw new Error(`No hay credenciales de ${platform} para el cliente ${socialClientId}`)
}

export async function getSocialClientId(isDivinia: boolean = true): Promise<string> {
  const db = createAdminClient()
  const { data } = await db
    .from('social_clients')
    .select('id')
    .eq('is_divinia', isDivinia)
    .eq('is_active', true)
    .single()
  if (!data?.id) throw new Error('No se encontró el social_client de DIVINIA')
  return data.id
}

function getDiviniaEnvCredentials(platform: Platform): PlatformCredentials {
  switch (platform) {
    case 'instagram': {
      const accessToken = process.env.INSTAGRAM_ACCESS_TOKEN
      const accountId = process.env.INSTAGRAM_ACCOUNT_ID
      if (!accessToken || !accountId) {
        throw new Error('Faltan INSTAGRAM_ACCESS_TOKEN e INSTAGRAM_ACCOUNT_ID en .env')
      }
      return { platform: 'instagram', accessToken, accountId }
    }
    default:
      throw new Error(`Sin credenciales de env para ${platform} — agregar en social_accounts`)
  }
}
