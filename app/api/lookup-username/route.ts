// app/api/lookup-username/route.ts
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null)
    const username = typeof body?.username === 'string' ? body.username.trim() : ''

    if (!username) {
      return NextResponse.json({ ok: false, message: 'Missing username' }, { status: 400 })
    }

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!url || !serviceKey) {
      return NextResponse.json({ ok: false, message: 'Server not configured' }, { status: 500 })
    }

    const supabaseAdmin = createClient(url, serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    })

    // Prefer lookup in `profiles` table if you have one. Fallback to auth.admin.listUsers
    // 1) Try profiles table (recommended)
    try {
      const { data: profileData, error: profileErr } = await supabaseAdmin
        .from('profiles')
        .select('id, email')
        .eq('username', username)
        .limit(1)
        .maybeSingle()

      if (!profileErr && profileData) {
        // If you stored email in profiles
        return NextResponse.json({ ok: true, email: profileData.email ?? null })
      }
    } catch (e) {
      // ignore and fallback
      console.warn('profiles lookup failed, fallback to auth.users', e)
    }

    // 2) Fallback: search auth.users by user_metadata or email (if you stored username in user_metadata)
    // Note: admin listUsers returns { users: User[] }
    const usersRes = await fetch(`${url}/auth/v1/admin/users`, {
      method: 'GET',
      headers: {
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
        'Content-Type': 'application/json'
      }
    })

    if (!usersRes.ok) {
      const txt = await usersRes.text().catch(() => '')
      return NextResponse.json({ ok: false, message: 'Failed to query users', detail: txt }, { status: 500 })
    }

    const json = await usersRes.json().catch(() => null)

    const users = Array.isArray(json?.users) ? json.users : json ?? []

    // try match username against user.user_metadata.username or .name or email local-part
    const matched = users.find((u: any) => {
      const um = u.user_metadata ?? {}
      const userMetaUsername = (um.username || um.name || '').toString().toLowerCase()
      const emailLocal = (u.email || '').toString().split('@')[0].toLowerCase()
      return (
        (u.email && u.email.toLowerCase() === username.toLowerCase()) ||
        userMetaUsername === username.toLowerCase() ||
        emailLocal === username.toLowerCase()
      )
    })

    if (matched) {
      return NextResponse.json({ ok: true, email: matched.email ?? null })
    }

    return NextResponse.json({ ok: false, message: 'Username not found' }, { status: 404 })
  } catch (err: any) {
    console.error('lookup-username error', err)
    return NextResponse.json({ ok: false, message: 'Unexpected server error' }, { status: 500 })
  }
}
