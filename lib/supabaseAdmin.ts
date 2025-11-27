// lib/supabaseAdmin.ts
import { createClient, SupabaseClient } from '@supabase/supabase-js'

// service role key must be server-only (no NEXT_PUBLIC_ prefix)
const url = process.env.SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!url || !serviceRoleKey) {
  throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment variables')
}

// Safety: prevent accidental import in client-side bundles
if (typeof window !== 'undefined') {
  throw new Error('supabaseAdmin must only be imported on the server')
}

// Create a server-only Supabase client. Disable session persistence / auto refresh on backend.
export const supabaseAdmin: SupabaseClient = createClient(url, serviceRoleKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false
  }
})
