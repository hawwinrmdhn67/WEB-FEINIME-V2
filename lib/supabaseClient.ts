// lib/supabaseClient.ts
import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''

declare global {
  // reuse across HMR in dev
  // eslint-disable-next-line no-var
  var __supabase_browser_client__: SupabaseClient | undefined
}

export function getBrowserSupabase(): SupabaseClient | null {
  if (typeof window === 'undefined') return null
  if (!url || !anonKey) {
    console.warn('Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY for browser client')
    return null
  }
  if ((globalThis as any).__supabase_browser_client__) return (globalThis as any).__supabase_browser_client__
  const client = createClient(url, anonKey)
  ;(globalThis as any).__supabase_browser_client__ = client
  return client
}
