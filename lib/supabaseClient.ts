// lib/supabaseClient.ts
import { createClient, SupabaseClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!url || !anonKey) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY in env');
}

declare global {
  // allow HMR to reuse client in dev
  // eslint-disable-next-line no-var
  var __supabase_client: SupabaseClient | undefined;
}

const getClient = () => {
  if (typeof globalThis !== 'undefined' && (globalThis as any).__supabase_client) {
    return (globalThis as any).__supabase_client as SupabaseClient;
  }
  const client = createClient(url, anonKey);
  if (typeof globalThis !== 'undefined') (globalThis as any).__supabase_client = client;
  return client;
};

export const supabase = getClient();
