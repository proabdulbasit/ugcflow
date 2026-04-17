import { createBrowserClient } from '@supabase/ssr'

/**
 * Returns null when public Supabase env vars are missing (e.g. local build without .env).
 * Call sites that run during render should handle null; prefer checking in useEffect for data fetches.
 */
export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!supabaseUrl || !supabaseAnonKey) return null as any

  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}
