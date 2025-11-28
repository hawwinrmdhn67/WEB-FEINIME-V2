// components/AuthCallbackHandler.tsx
'use client';

import { useEffect } from 'react';
import { getBrowserSupabase } from '@/lib/supabaseClient';

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

        if (typeof authAny?.getSessionFromUrl === 'function') {
          await authAny.getSessionFromUrl({ storeSession: true });
        } else if (typeof authAny?.exchangeCodeForSession === 'function') {
          await authAny.exchangeCodeForSession();
        } else {
          console.warn('Supabase auth helper not found on this SDK version. Check @supabase/supabase-js version.');
        }
      } catch (err) {
        console.error('Error processing auth callback:', err);
      } finally {
        const clean = window.location.pathname + window.location.search;
        history.replaceState(null, '', clean);
      }
    })();
  }, []);

  return null;
}
