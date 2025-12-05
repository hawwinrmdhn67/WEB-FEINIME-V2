// app/api/check-username/route.ts
import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabaseAdmin'

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}))
    const raw = typeof body?.username === 'string' ? body.username : ''
    const username = raw.trim().toLowerCase()

    if (!username) {
      return NextResponse.json({ exists: false }, { status: 400 })
    }
    if (!/^[a-z0-9_.-]{3,20}$/.test(username)) {
      return NextResponse.json({ exists: false }, { status: 400 })
    }

    const supabase = getSupabaseAdmin()
    const { data, error } = await supabase
      .from('profiles')
      .select('id')
      .ilike('username', username)
      .limit(1)
      .maybeSingle()

    if (error) {
      console.error('check-username supabase error', error)
      return NextResponse.json({ exists: false }, { status: 500 })
    }

    return NextResponse.json({ exists: !!data })
  } catch (err) {
    console.error('check-username exception', err)
    return NextResponse.json({ exists: false }, { status: 500 })
  }
}
