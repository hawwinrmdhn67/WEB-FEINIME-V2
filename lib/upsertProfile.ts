import { getBrowserSupabase } from './supabaseClient'

type UserLike = {
  id: string
  email?: string | null
  user_metadata?: any
}

export async function upsertProfile(user: UserLike | null, username?: string | null) {
  const supabase = getBrowserSupabase()
  if (!supabase) {
    console.warn('upsertProfile: no browser supabase client available')
    return null
  }

  if (!user?.id) {
    try {
      const { data: sessionData, error: sessionErr } = await supabase.auth.getUser()
      if (sessionErr) {
        console.error('upsertProfile: getUser error:', sessionErr)
        return null
      }
      user = sessionData?.user ?? null
    } catch (err) {
      console.error('upsertProfile: failed to read session', err)
      return null
    }
  }

  if (!user?.id) return null

  const full_name = user.user_metadata?.full_name || user.user_metadata?.name || null
  const avatar_url = user.user_metadata?.avatar_url || user.user_metadata?.picture || null
  const rawUsername = username ?? user.user_metadata?.username ?? null
  const normalizedUsername = typeof rawUsername === 'string' && rawUsername.trim() !== ''
    ? rawUsername.trim().toLowerCase()
    : null

  const payload: any = {
    id: user.id,
    email: user.email ?? null,
    full_name,
    avatar_url,
    updated_at: new Date().toISOString()
  }

  if (normalizedUsername) payload.username = normalizedUsername

  try {
    const res = await supabase
      .from('profiles')
      .upsert(payload, { onConflict: 'id' })
      .select()
      .maybeSingle()

    if (res.error) {
      console.error('Supabase upsert error (detailed):', res.error)
      return null
    }
    return res.data
  } catch (err) {
    console.error('upsertProfile unexpected error:', err)
    return null
  }
}
