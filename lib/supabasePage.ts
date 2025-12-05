// lib/supabasePage.ts
import { cookies as nextCookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import type { SupabaseClient } from '@supabase/supabase-js'

/**
 * Create a Supabase client for Server Components (app/.../page.tsx).
 * Uses cookies to read the user's session.
 *
 * NOTE: We cast cookies to `any` because some versions of @supabase/ssr
 * expect a different cookie helper type than next/headers exposes.
 */
export function createPageSupabase(): SupabaseClient {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

  if (!supabaseUrl || !supabaseKey) {
    throw new Error(
      'Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY / PUBLISHABLE_KEY'
    )
  }

  // call cookies() to get the per-request cookie accessor, then cast to any to satisfy types
  const cookies = nextCookies() as any

  return createServerClient(supabaseUrl, supabaseKey, { cookies })
}
