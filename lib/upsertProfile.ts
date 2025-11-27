// lib/upsertProfile.ts
import { supabase } from './supabaseClient';

type UserLike = {
  id: string;
  email?: string | null;
  user_metadata?: any;
};

export async function upsertProfile(user: UserLike | null) {
  if (!user?.id) {
    try {
      const { data: sessionData, error: sessionErr } = await supabase.auth.getUser();
      if (sessionErr) {
        console.error('upsertProfile: getUser error:', sessionErr);
        return null;
      }
      user = sessionData?.user ?? null;
    } catch (err) {
      console.error('upsertProfile: failed to read session', err);
      return null;
    }
  }

  if (!user?.id) return null;

  const full_name = user.user_metadata?.full_name || user.user_metadata?.name || null;
  const avatar_url = user.user_metadata?.avatar_url || user.user_metadata?.picture || null;

  const payload = {
    id: user.id,
    email: user.email ?? null,
    full_name,
    avatar_url,
    updated_at: new Date().toISOString()
  };

  try {
    const res = await supabase
      .from('profiles')
      .upsert(payload, { onConflict: 'id' })
      .select()
      .maybeSingle();

    if (res.error) {
      try {
        console.error('Supabase upsert error (detailed):', JSON.stringify(res.error, Object.getOwnPropertyNames(res.error)));
      } catch {
        console.error('Supabase upsert error (raw):', res.error);
      }
      return null;
    }
    return res.data;
  } catch (err) {
    console.error('upsertProfile unexpected error:', err);
    return null;
  }
}
