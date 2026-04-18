/**
 * GET /api/seed/migrate
 * Returns the migration SQL and instructions.
 * Paste the SQL in: https://supabase.com/dashboard/project/cdgthrelwqrzhuylmcgf/sql/new
 */
import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase'

export async function GET() {
  const db = createAdminClient()

  // Check which nucleus tables already exist
  const tableChecks = await Promise.all([
    'nucleus_memory', 'proposals', 'content_calendar',
    'financial_records', 'voice_calls', 'agent_logs', 'bookings',
    'leads', 'clients', 'agent_runs', 'agent_chats', 'booking_configs',
  ].map(async (table) => {
    const { error } = await db.from(table as never).select('id').limit(1)
    return { table, exists: !error }
  }))

  const existing = tableChecks.filter(t => t.exists).map(t => t.table)
  const missing = tableChecks.filter(t => !t.exists).map(t => t.table)

  return NextResponse.json({
    status: missing.length === 0 ? '✅ All tables exist' : `⚠️ Missing ${missing.length} tables`,
    existing_tables: existing,
    missing_tables: missing,
    action_required: missing.length > 0,
    instructions: missing.length > 0 ? [
      '1. Open: https://supabase.com/dashboard/project/cdgthrelwqrzhuylmcgf/sql/new',
      '2. Copy the file: C:/divinia/supabase-migration-v2.sql',
      '3. Paste and click Run',
      '4. Reload this page to verify',
    ] : ['No action needed. Database is up to date.'],
  })
}
