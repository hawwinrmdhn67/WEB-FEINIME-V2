// lib/supabaseServer.ts
import { cookies as nextCookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import type { SupabaseClient } from '@supabase/supabase-js'

/**
 * Create a Supabase client for Route Handlers / Server Actions.
 * Use this inside app/api/.../route.ts
 *
 * We cast `cookies()` to any to avoid mismatched types between `next` and `@supabase/ssr`.
 */
export function createServerSupabase(): SupabaseClient {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

  if (!supabaseUrl || !supabaseKey) {
    throw new Error(
      'Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY / PUBLISHABLE_KEY'
    )
  }

  const cookies = nextCookies() as any
  return createServerClient(supabaseUrl, supabaseKey, { cookies })
}
