// app/reset-password/page.tsx
'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Lock, Eye, EyeOff, Loader2 } from 'lucide-react'
import { getBrowserSupabase } from '@/lib/supabaseClient'
import { Footer } from '@/components/feinime-footer'

function parseParamsFromLocation(): Record<string, string> {
  const params: Record<string, string> = {}
  if (typeof window === 'undefined') return params

  // querystring
  const qs = window.location.search
  if (qs && qs.length > 1) {
    const search = new URLSearchParams(qs)
    for (const [k, v] of search.entries()) params[k] = v
  }

  // hash/fragment
  const hash = window.location.hash
  if (hash && hash.startsWith('#')) {
    const frag = hash.slice(1)
    const fragParams = new URLSearchParams(frag)
    for (const [k, v] of fragParams.entries()) params[k] = v
  }

  return params
}

function extractTokensFromString(s: string) {
  try {
    if (!s) return { access_token: null, refresh_token: null }

    // full URL
    if (s.startsWith('http://') || s.startsWith('https://')) {
      const u = new URL(s)
      const qp = new URLSearchParams(u.search)
      if (qp.get('access_token')) {
        return { access_token: qp.get('access_token'), refresh_token: qp.get('refresh_token') }
      }
      if (u.hash && u.hash.startsWith('#')) {
        const frag = new URLSearchParams(u.hash.slice(1))
        return { access_token: frag.get('access_token'), refresh_token: frag.get('refresh_token') }
      }
    }

    // fragment-like or query-like string
    if (s.includes('access_token=')) {
      const frag = new URLSearchParams(s.replace(/^#/, ''))
      return { access_token: frag.get('access_token'), refresh_token: frag.get('refresh_token') }
    }

    // bare token (heuristic)
    const trimmed = s.trim()
    if (/^[A-Za-z0-9\-_\.]{20,}$/.test(trimmed)) {
      return { access_token: trimmed, refresh_token: null }
    }
  } catch (err) {
    // ignore
  }
  return { access_token: null, refresh_token: null }
}

export default function ResetPasswordPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [settingSession, setSettingSession] = useState(false)
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [refreshToken, setRefreshToken] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [messageType, setMessageType] = useState<'error' | 'success' | null>(null)

  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  // manual paste fallback
  const [manualInput, setManualInput] = useState('')
  const [manualProcessing, setManualProcessing] = useState(false)

  useEffect(() => {
    // parse tokens from URL (fragment or query)
    try {
      const params = parseParamsFromLocation()
      const at = params['access_token'] ?? params['accessToken'] ?? null
      const rt = params['refresh_token'] ?? params['refreshToken'] ?? null
      setAccessToken(at)
      setRefreshToken(rt)
    } catch (err) {
      console.error('parse params error', err)
    } finally {
      setLoading(false)
    }
  }, [])

  // helper: try set session from token (compatible with supabase v2)
  const ensureSessionFromToken = async (at?: string, rt?: string) => {
    const supabase = getBrowserSupabase()
    if (!supabase) return { ok: false, message: 'Client environment required.' }
    const token = at ?? accessToken
    const refresh = rt ?? refreshToken

    if (!token) return { ok: false, message: 'No access token provided.' }

    setSettingSession(true)
    try {
      // prefer setSession (v2)
      if (typeof (supabase.auth as any).setSession === 'function') {
        const payload: any = { access_token: token }
        if (refresh) payload.refresh_token = refresh
        const res: any = await (supabase.auth as any).setSession(payload)
        if (res?.error) {
          console.error('setSession error', res.error)
          return { ok: false, message: res.error.message || 'Failed to set session from token.' }
        }
        return { ok: true }
      }

      // older helper
      if (typeof (supabase.auth as any).getSessionFromUrl === 'function') {
        try {
          await (supabase.auth as any).getSessionFromUrl()
          return { ok: true }
        } catch (err: any) {
          console.error('getSessionFromUrl error', err)
          return { ok: false, message: 'Failed to consume session from URL.' }
        }
      }

      return { ok: false, message: 'Supabase client does not support programmatic session setting.' }
    } catch (err: any) {
      console.error('ensureSessionFromToken exception', err)
      return { ok: false, message: err?.message ?? 'Unexpected error while establishing session.' }
    } finally {
      setSettingSession(false)
    }
  }

  // If user is already signed in (session exists), allow them to proceed w/o token
  const checkExistingSession = async () => {
    try {
      const supabase = getBrowserSupabase()
      if (!supabase) return null
      if (typeof (supabase.auth as any).getSession === 'function') {
        const res: any = await (supabase.auth as any).getSession()
        const sess = res?.data?.session ?? null
        if (sess) return sess
      } else if (typeof (supabase.auth as any).getUser === 'function') {
        const res: any = await (supabase.auth as any).getUser()
        if (res?.data?.user) return res.data.user
      }
    } catch (err) {
      // ignore
    }
    return null
  }

  // allow manual paste of token/link
  const handleManualSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault()
    setManualProcessing(true)
    setMessage(null)
    try {
      const { access_token: at, refresh_token: rt } = extractTokensFromString(manualInput || '')
      if (!at) {
        setMessage('No token found in the input. Paste the full link or the access_token value.')
        setMessageType('error')
        return
      }

      const supabase = getBrowserSupabase()
      if (!supabase) {
        setMessage('Client environment required.')
        setMessageType('error')
        return
      }

      // try setSession
      if (typeof (supabase.auth as any).setSession === 'function') {
        const payload: any = { access_token: at }
        if (rt) payload.refresh_token = rt
        const res: any = await (supabase.auth as any).setSession(payload)
        if (res?.error) {
          console.error('setSession error', res.error)
          setMessage(res.error.message || 'Failed to set session from pasted token.')
          setMessageType('error')
          return
        }

        setAccessToken(at)
        setRefreshToken(rt)
        setMessage('Token accepted — you can now set a new password.')
        setMessageType('success')
        return
      }

      // fallback
      if (typeof (supabase.auth as any).getSessionFromUrl === 'function') {
        try {
          await (supabase.auth as any).getSessionFromUrl()
          setMessage('Session established — you can now set a new password.')
          setMessageType('success')
          return
        } catch (err: any) {
          console.error(err)
          setMessage('Failed to process pasted token.')
          setMessageType('error')
          return
        }
      }

      setMessage('Your Supabase client does not support programmatic session setting.')
      setMessageType('error')
    } catch (err: any) {
      console.error(err)
      setMessage(err?.message ?? 'Failed to process pasted token.')
      setMessageType('error')
    } finally {
      setManualProcessing(false)
    }
  }

  // Try to ensure session if token present when component mounts/updates
  useEffect(() => {
    let mounted = true
    ;(async () => {
      if (!mounted) return
      if (accessToken) {
        setMessage('Processing reset link…')
        setMessageType(null)
        const r = await ensureSessionFromToken()
        if (!r.ok) {
          setMessage(r.message)
          setMessageType('error')
        } else {
          setMessage('Session established — you can set a new password.')
          setMessageType('success')
        }
      } else {
        // no token in URL — check whether user is already signed in
        const sess = await checkExistingSession()
        if (sess) {
          setMessage('You are already signed in — you can change your password below.')
          setMessageType('success')
        } else {
          setMessage(null)
          setMessageType(null)
        }
      }
    })()

    return () => { mounted = false }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken])

  // Submit new password
  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault()
    setMessage(null)
    setMessageType(null)

    if (!password || !confirm) {
      setMessage('Please fill both password fields.')
      setMessageType('error')
      return
    }
    if (password.length < 6) {
      setMessage('Password must be at least 6 characters.')
      setMessageType('error')
      return
    }
    if (password !== confirm) {
      setMessage('Passwords do not match.')
      setMessageType('error')
      return
    }

    setSubmitting(true)
    try {
      const supabase = getBrowserSupabase()
      if (!supabase) {
        setMessage('Client environment required.')
        setMessageType('error')
        return
      }

      // ensure session exists (in case setSession hasn't been called)
      const sessCheck = await checkExistingSession()
      if (!sessCheck) {
        // try to set session from accessToken if available
        if (accessToken) {
          const r = await ensureSessionFromToken()
          if (!r.ok) {
            setMessage(r.message)
            setMessageType('error')
            return
          }
        } else {
          setMessage('No session found. Paste your reset link or sign in and try again.')
          setMessageType('error')
          return
        }
      }

      // update password
      let res: any = null
      if (typeof (supabase.auth as any).updateUser === 'function') {
        res = await (supabase.auth as any).updateUser({ password })
      } else if (typeof (supabase.auth as any).update === 'function') {
        // legacy
        res = await (supabase.auth as any).update({ password })
      } else {
        setMessage('Your Supabase client does not support updating password programmatically.')
        setMessageType('error')
        return
      }

      if (res?.error) {
        console.error('update password error', res.error)
        setMessage(res.error.message || 'Failed to update password.')
        setMessageType('error')
        return
      }

      setMessage('Password updated successfully. Redirecting to login...')
      setMessageType('success')

      // clear tokens from URL for cleanliness
      try {
        if (typeof window !== 'undefined') {
          const url = new URL(window.location.href)
          url.hash = ''
          url.searchParams.delete('access_token')
          url.searchParams.delete('refresh_token')
          window.history.replaceState({}, document.title, url.toString())
        }
      } catch {}

      setTimeout(() => router.replace('/login'), 1200)
    } catch (err: any) {
      console.error('reset password submit exception', err)
      setMessage(err?.message ?? 'Unexpected error while resetting password.')
      setMessageType('error')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="min-h-screen bg-background text-foreground flex flex-col">
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md mx-auto">
          <div className="bg-card border border-border/50 rounded-2xl shadow-md p-6 sm:p-8">
            <div className="text-center mb-6">
              <h1 className="text-2xl sm:text-3xl font-extrabold">Create a new password</h1>
              <p className="text-sm text-muted-foreground mt-1">Set a new password for your account.</p>
            </div>

            {loading ? (
              <div className="p-6 text-center">
                <Loader2 className="animate-spin mx-auto" />
                <p className="mt-3 text-sm text-muted-foreground">Preparing reset form…</p>
              </div>
            ) : (
              <>
                {/* If token not detected, show paste/token fallback */}
                {!accessToken && (
                  <div className="mb-4 text-sm text-muted-foreground space-y-3">
                    <p>
                      No password reset token detected in the URL. If you clicked a reset link from email, some email clients remove part of the link.
                      Copy the full link from the email and paste it below, or paste the access_token value directly.
                    </p>

                    <form onSubmit={handleManualSubmit} className="flex gap-2">
                      <input
                        value={manualInput}
                        onChange={(e) => setManualInput(e.target.value)}
                        placeholder="Paste full reset link or access_token here"
                        className="flex-1 px-3 py-2 rounded-lg bg-input border border-border/40 focus:outline-none focus:ring-1 focus:ring-primary text-sm"
                      />
                      <button
                        type="submit"
                        disabled={manualProcessing}
                        className="px-3 py-2 rounded-lg bg-primary text-primary-foreground text-sm disabled:opacity-60"
                      >
                        {manualProcessing ? 'Processing…' : 'Use token'}
                      </button>
                    </form>

                    <p className="text-xs text-muted-foreground">Tip: copy the link address from the email, paste it here and press Use token.</p>
                  </div>
                )}

                {/* messages */}
                {message && (
                  <div className={`mb-4 text-sm text-center ${messageType === 'error' ? 'text-red-500' : 'text-green-500'}`}>
                    {message}
                  </div>
                )}

                {/* Password form (always shown so signed-in users can change immediately) */}
                <form onSubmit={handleSubmit} className="space-y-4" autoComplete="off">
                  <div>
                    <label htmlFor="password" className="block text-sm font-medium mb-2">New password</label>
                    <div className="relative">
                      <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-muted-foreground">
                        <Lock className="w-4 h-4" />
                      </span>

                      <input
                        id="password"
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="New password"
                        className="w-full pl-10 pr-10 py-3 rounded-lg bg-input border border-border/40 focus:outline-none focus:ring-1 focus:ring-primary text-sm"
                        required
                      />

                      <button
                        type="button"
                        onClick={() => setShowPassword(v => !v)}
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-md text-muted-foreground hover:text-foreground"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="confirm" className="block text-sm font-medium mb-2">Confirm password</label>
                    <div className="relative">
                      <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-muted-foreground">
                        <Lock className="w-4 h-4" />
                      </span>

                      <input
                        id="confirm"
                        name="confirm"
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={confirm}
                        onChange={(e) => setConfirm(e.target.value)}
                        placeholder="Confirm password"
                        className="w-full pl-10 pr-10 py-3 rounded-lg bg-input border border-border/40 focus:outline-none focus:ring-1 focus:ring-primary text-sm"
                        required
                      />

                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(v => !v)}
                        aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-md text-muted-foreground hover:text-foreground"
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <button
                      type="submit"
                      disabled={submitting || settingSession}
                      className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors disabled:opacity-60"
                    >
                      {(submitting || settingSession) ? <Loader2 className="animate-spin w-4 h-4" /> : 'Set new password'}
                    </button>
                  </div>
                </form>

                <div className="text-center mt-6 text-sm">
                  <p className="text-muted-foreground">
                    Back to{' '}
                    <Link href="/login" className="text-primary hover:underline">Sign in</Link>
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </main>
  )
}
