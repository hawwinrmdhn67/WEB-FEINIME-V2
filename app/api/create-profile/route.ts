// app/api/create-profile/route.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

type Body = {
  id?: unknown
  email?: unknown
  full_name?: unknown
  avatar_url?: unknown
}

function isString(x: unknown): x is string {
  return typeof x === 'string'
}

export async function POST(req: NextRequest) {
  try {
    // Optional: simple secret check to avoid public abuse.
    // NOTE: If you plan to call this route directly from browser/client,
    // do NOT embed the secret in client code. Better alternatives:
    //  - Use a server-side flow (call route from your server)
    //  - Use Supabase Auth webhooks or a function that runs server-side
    const secretExpected = process.env.CREATE_PROFILE_SECRET
    if (secretExpected) {
      const provided = req.headers.get('x-create-profile-secret') ?? ''
      if (provided !== secretExpected) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
    }

    const bodyRaw = (await req.json()) as Body
    const { id, email = null, full_name = null, avatar_url = null } = bodyRaw ?? {}

    if (!isString(id) || id.trim().length === 0) {
      return NextResponse.json({ error: 'Missing or invalid "id" in body' }, { status: 400 })
    }
    const idStr = id.trim()

    // Basic optional validation for email (if provided)
    const emailStr = isString(email) && email.length > 0 ? (email as string) : null
    if (emailStr && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailStr)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 })
    }

    const fullNameStr = isString(full_name) && full_name.length > 0 ? (full_name as string) : null
    const avatarUrlStr = isString(avatar_url) && avatar_url.length > 0 ? (avatar_url as string) : null

    const payload = {
      id: idStr,
      email: emailStr,
      full_name: fullNameStr,
      avatar_url: avatarUrlStr,
      updated_at: new Date().toISOString()
    }

    // Upsert
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .upsert(payload, { onConflict: 'id' })
      .select()
      .maybeSingle()

    if (error) {
      console.error('supabaseAdmin upsert error', error)
      return NextResponse.json({ error: error.message ?? 'Upsert failed' }, { status: 500 })
    }

    // If data exists and has created_at vs updated_at you could decide 201 vs 200.
    // We'll return 201 when row was newly created by checking if returned data exists
    // but keep simple and return 200 (ok) as upsert may either insert or update.
    return NextResponse.json({ data }, { status: 200 })
  } catch (err: any) {
    console.error('create-profile route error', err)
    return NextResponse.json({ error: err?.message ?? 'Server error' }, { status: 500 })
  }
}
