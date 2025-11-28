// components/AuthCallbackHandler.tsx
'use client';

import { useEffect } from 'react';
import { getBrowserSupabase } from '@/lib/supabaseClient';

function parseHash(hash: string) {
  // hapus leading '#'
  const frag = hash.startsWith('#') ? hash.slice(1) : hash;
  const params = new URLSearchParams(frag);
  const out: Record<string, string> = {};
  for (const [k, v] of params.entries()) out[k] = v;
  return out;
}

export default function AuthCallbackHandler() {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const supabase = getBrowserSupabase();
    if (!supabase) return;

    const hash = window.location.hash;
    if (!hash) return;

    const needsProcessing =
      hash.includes('access_token') ||
      hash.includes('refresh_token') ||
      hash.includes('provider_token') ||
      hash.includes('expires_in');

    if (!needsProcessing) return;

    (async () => {
      try {
        const authAny = (supabase as any).auth;

        // 1) Try SDK helper first (if present)
        if (typeof authAny?.getSessionFromUrl === 'function') {
          await authAny.getSessionFromUrl({ storeSession: true });
          console.log('[auth] used getSessionFromUrl');
        } else if (typeof authAny?.exchangeCodeForSession === 'function') {
          await authAny.exchangeCodeForSession();
          console.log('[auth] used exchangeCodeForSession');
        } else {
          // 2) Fallback: parse fragment manually and set session
          const parsed = parseHash(hash);
          const access_token = parsed['access_token'] ?? parsed['accessToken'] ?? '';
          const refresh_token = parsed['refresh_token'] ?? parsed['refreshToken'] ?? '';
          const expires_in = parsed['expires_in'] ? Number(parsed['expires_in']) : undefined;

          if (access_token) {
            if (typeof authAny?.setSession === 'function') {
              // supabase-js v1/v2 have setSession on auth
              await authAny.setSession({
                access_token,
                refresh_token,
              });
              console.log('[auth] setSession via auth.setSession fallback');
            } else if (typeof authAny?.session === 'function') {
              // older SDKs may differ; attempt to set localStorage directly (last-resort)
              // Build an object close to expected shape
              const fakeSession = {
                access_token,
                refresh_token,
                expires_in,
                provider_token: parsed['provider_token'],
              };
              try {
                // store in localStorage key used by supabase-js v1/v2
                // Key formats can differ; try common ones
                localStorage.setItem('supabase.auth.token', JSON.stringify({ currentSession: fakeSession }));
                console.warn('[auth] stored fallback session to localStorage; reload may be needed');
              } catch (e) {
                console.error('[auth] fallback localStorage failed', e);
              }
            } else {
              console.warn('[auth] No compatible method to set session automatically. Access token parsed:', access_token ? 'yes' : 'no');
            }
          } else {
            console.warn('[auth] access_token not found in fragment');
          }
        }
      } catch (err) {
        console.error('Error processing auth callback:', err);
      } finally {
        // Always clear fragment from URL
        const clean = window.location.pathname + window.location.search;
        history.replaceState(null, '', clean);
      }
    })();
  }, []);

  return null;
}
