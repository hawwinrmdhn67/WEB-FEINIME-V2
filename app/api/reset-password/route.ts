// app/api/reset-password/route.ts
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null)
    const token = body?.token
    const password = body?.password

    if (!token || !password) {
      return NextResponse.json({ error: 'Missing token or password' }, { status: 400 })
    }

    if (typeof password !== 'string' || password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 })
    }

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

    if (!url || !serviceKey) {
      return NextResponse.json({ error: 'Server environment not configured' }, { status: 500 })
    }

    // Admin client (no session persistence)
    const supabaseAdmin = createClient(url, serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    })

    // 1) Ambil user dari token (access_token)
    const { data: userData, error: getUserErr } = await supabaseAdmin.auth.getUser(token)
    if (getUserErr || !userData?.user) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 400 })
    }

    const userId = userData.user.id

    // 2) Update password via Admin
    const { error: updateErr } = await supabaseAdmin.auth.admin.updateUserById(userId, {
      password
    })

    if (updateErr) {
      // Tangani kasus "password sama dengan yang lama"
      const msg = String(updateErr.message || '').toLowerCase()

      if (
        msg.includes('new password should be different') ||
        msg.includes('same password') ||
        msg.includes('cannot be the same')
      ) {
        return NextResponse.json(
          { error: 'New password cannot be the same as your old password.' },
          { status: 400 }
        )
      }

      // Jika ada error lain, kirim pesan umum (400 untuk client-related, 500 jika server-related)
      const isClientError = msg.includes('password') || msg.includes('invalid') || msg.includes('required')
      return NextResponse.json(
        { error: updateErr.message || 'Failed to update password.' },
        { status: isClientError ? 400 : 500 }
      )
    }

    return NextResponse.json({ ok: true })
  } catch (err: any) {
    console.error('reset-password error', err)
    return NextResponse.json({ error: 'Unexpected error' }, { status: 500 })
  }
}
