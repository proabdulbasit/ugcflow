import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/database.types'

/**
 * Server-only client that bypasses RLS. Use for trusted routes (e.g. Stripe webhooks).
 * Requires SUPABASE_SERVICE_ROLE_KEY.
 */
export function createServiceRoleClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) {
    throw new Error(
      'Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY (required for server-side admin operations).'
    )
  }
  return createClient<Database>(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}
