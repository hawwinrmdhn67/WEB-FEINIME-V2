// app/api/create-profile/route.ts
import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabaseAdmin'

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}))
    const id = body?.id
    const email = body?.email ?? null
    const rawUsername = body?.username ?? null
    const full_name = body?.full_name ?? null
    const avatar_url = body?.avatar_url ?? null

    if (!id) {
      return NextResponse.json({ error: 'Missing user id' }, { status: 400 })
    }

    const username = typeof rawUsername === 'string' && rawUsername.trim() !== ''
      ? rawUsername.trim().toLowerCase()
      : null

    // Optional: enforce username format
    if (username && !/^[a-z0-9_.-]{3,20}$/.test(username)) {
      return NextResponse.json({ error: 'Invalid username format' }, { status: 400 })
    }

    const supabase = getSupabaseAdmin()

    if (username) {
      // check unique (case-insensitive)
      const { data: existing, error: existErr } = await supabase
        .from('profiles')
        .select('id')
        .ilike('username', username)
        .limit(1)
        .maybeSingle()

      if (existErr) {
        console.error('create-profile: uniqueness check failed', existErr)
        return NextResponse.json({ error: 'DB error' }, { status: 500 })
      }
      if (existing) {
        return NextResponse.json({ error: 'Username already taken' }, { status: 409 })
      }
    }

    const payload: any = {
      id,
      email,
      full_name,
      avatar_url,
      updated_at: new Date().toISOString()
    }
    if (username) payload.username = username

    const { data, error } = await supabase
      .from('profiles')
      .upsert(payload, { onConflict: 'id' })
      .select()
      .maybeSingle()

    if (error) {
      console.error('create-profile upsert error', error)
      return NextResponse.json({ error: 'DB error' }, { status: 500 })
    }

    return NextResponse.json({ ok: true, profile: data })
  } catch (err) {
    console.error('create-profile exception', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
