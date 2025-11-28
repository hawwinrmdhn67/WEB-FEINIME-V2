// app/api/create-profile/route.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabaseAdmin'

type Body = {
  id?: unknown
  email?: unknown
  full_name?: unknown
  avatar_url?: unknown
}

function isString(x: unknown): x is string {
  return typeof x === 'string'
}

const MAX_BODY_SIZE = 10 * 1024 // 10 KB max body for this endpoint
const MAX_ID_LENGTH = 128
const MAX_NAME_LENGTH = 256
const MAX_AVATAR_URL_LENGTH = 2048

export async function POST(req: NextRequest) {
  try {
    // optional: simple body size guard
    const contentLength = req.headers.get('content-length')
    if (contentLength && Number(contentLength) > MAX_BODY_SIZE) {
      return NextResponse.json({ error: 'Request body too large' }, { status: 413 })
    }

    // optional secret header protection
    const secretExpected = process.env.CREATE_PROFILE_SECRET
    if (secretExpected) {
      const provided = req.headers.get('x-create-profile-secret') ?? ''
      if (provided !== secretExpected) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
    }

    const bodyRaw = (await req.json()) as Body
    const { id, email = null, full_name = null, avatar_url = null } = bodyRaw ?? {}

    // id validation
    if (!isString(id)) {
      return NextResponse.json({ error: 'Missing or invalid "id" in body' }, { status: 400 })
    }
    const idStr = id.trim()
    if (idStr.length === 0 || idStr.length > MAX_ID_LENGTH) {
      return NextResponse.json({ error: 'Invalid "id" length' }, { status: 400 })
    }

    // email validation (optional)
    const emailStr = isString(email) && email.length > 0 ? (email as string).trim() : null
    if (emailStr && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailStr)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 })
    }

    // full name validation
    const fullNameStr =
      isString(full_name) && full_name.length > 0
        ? (full_name as string).trim().slice(0, MAX_NAME_LENGTH)
        : null

    // avatar url validation (very simple)
    const avatarUrlStr =
      isString(avatar_url) && avatar_url.length > 0
        ? (avatar_url as string).trim().slice(0, MAX_AVATAR_URL_LENGTH)
        : null

    const payload = {
      id: idStr,
      email: emailStr,
      full_name: fullNameStr,
      avatar_url: avatarUrlStr,
      updated_at: new Date().toISOString()
    }

    // getSupabaseAdmin must return an admin client (service_role key) and be safe for server usage
    const supabaseAdmin = getSupabaseAdmin()
    if (!supabaseAdmin) {
      console.error('create-profile: missing supabase admin client')
      return NextResponse.json({ error: 'Server misconfiguration' }, { status: 500 })
    }

    // upsert into profiles. onConflict: 'id' keeps id unique
    // .maybeSingle() is used previously in your code; if your SDK doesn't include maybeSingle(), use data?.[0]
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .upsert(payload, { onConflict: 'id' })
      .select()
      .maybeSingle?.() ?? // if maybeSingle exists, it will be called; otherwise fallback handled below
      await (async () => {
        // fallback path if maybeSingle isn't a function (older/newer SDK differences)
        const r: any = await supabaseAdmin.from('profiles').upsert(payload, { onConflict: 'id' }).select()
        return { data: Array.isArray(r.data) ? r.data[0] ?? null : r.data, error: r.error }
      })()

    if (error) {
      console.error('supabaseAdmin upsert error', { error, payload })
      return NextResponse.json({ error: error.message ?? 'Upsert failed' }, { status: 500 })
    }

    // success (201 Created or 200 OK is fine for upsert; using 201 to indicate resource processed/created)
    return NextResponse.json({ data }, { status: 201 })
  } catch (err: any) {
    console.error('create-profile route error', err)
    return NextResponse.json({ error: err?.message ?? 'Server error' }, { status: 500 })
  }
}
