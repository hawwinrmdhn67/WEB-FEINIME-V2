// app/reset-password/page.tsx
'use client'

import React, { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Lock, Eye, EyeOff, Loader2 } from 'lucide-react'
import { getBrowserSupabase } from '@/lib/supabaseClient'

/**
 * Reset password page with robust token consumption for Supabase flows.
 * - Parses tokens from query string and fragment/hash (many email clients strip fragments)
 * - Attempts to consume session via getSessionFromUrl() (if available) then setSession()
 * - Handles Supabase v2 response shapes { data, error } gracefully
 * - Shows debug box (token/type/email) for quick Vercel/browser debugging
 */

function parseParamsFromLocation(): Record<string, string> {
  const params: Record<string, string> = {}
  if (typeof window === 'undefined') return params

  try {
    // Query string
    const qs = window.location.search
    if (qs && qs.length > 1) {
      const search = new URLSearchParams(qs)
      for (const [k, v] of search.entries()) params[k] = v
    }

    // Fragment/hash (e.g. #access_token=...&type=...)
    const hash = window.location.hash
    if (hash && hash.startsWith('#')) {
      const frag = hash.slice(1)
      const fragParams = new URLSearchParams(frag)
      for (const [k, v] of fragParams.entries()) params[k] = v
    }

    // Some providers use slightly different names
    // Normalize common variants to consistent keys for later usage
    if (params['accessToken'] && !params['access_token']) params['access_token'] = params['accessToken']
    if (params['refreshToken'] && !params['refresh_token']) params['refresh_token'] = params['refreshToken']
  } catch (err) {
    // no-op, but allow debugging log below
    // eslint-disable-next-line no-console
    console.error('[reset-password] parseParamsFromLocation error', err)
  }

  return params
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

  const [showNoTokenMessage, setShowNoTokenMessage] = useState(false)
  const noTokenTimerRef = useRef<number | null>(null)

  useEffect(() => {
    try {
      const params = parseParamsFromLocation()
      const at = params['access_token'] ?? params['token'] ?? null
      const rt = params['refresh_token'] ?? null

      setAccessToken(at)
      setRefreshToken(rt)

      // debug logs (will appear in browser console and Vercel client logs if any)
      // eslint-disable-next-line no-console
      console.log('[reset-password] parsed params:', params)
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('[reset-password] parse params error', err)
    } finally {
      setLoading(false)
      if (noTokenTimerRef.current) {
        window.clearTimeout(noTokenTimerRef.current)
        noTokenTimerRef.current = null
      }
      // show "no token" message after a short grace period so fragments have time to be consumed
      noTokenTimerRef.current = window.setTimeout(() => {
        setShowNoTokenMessage(true)
      }, 1200)
    }

    return () => {
      if (noTokenTimerRef.current) {
        window.clearTimeout(noTokenTimerRef.current)
        noTokenTimerRef.current = null
      }
    }
  }, [])

  useEffect(() => {
    if (accessToken) {
      if (noTokenTimerRef.current) {
        window.clearTimeout(noTokenTimerRef.current)
        noTokenTimerRef.current = null
      }
      setShowNoTokenMessage(false)
    }
  }, [accessToken])

  /**
   * Try to establish a session in the browser using the provided token.
   * Strategy:
   * 1. If supabase.auth.getSessionFromUrl exists, call it (it will parse fragment and set session)
   * 2. Otherwise, if supabase.auth.setSession exists, call it with { access_token, refresh_token }
   */
  const ensureSessionFromToken = async () => {
    if (!accessToken) {
      return { ok: false, message: 'No access token found in URL. Make sure you opened the full link from your email.' }
    }

    setSettingSession(true)
    try {
      const supabase = getBrowserSupabase()
      if (!supabase) {
        return { ok: false, message: 'Supabase client not available in the browser environment.' }
      }

      // Suppress any login toasts in your app while we handle session
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          window.localStorage.setItem('feinime:suppress_login_toast', '1')
        }
      } catch (e) {
        // ignore storage errors
      }

      // Try getSessionFromUrl first — it's the canonical way to consume fragment on some SDK versions
      if (typeof (supabase.auth as any).getSessionFromUrl === 'function') {
        try {
          // eslint-disable-next-line no-console
          console.log('[reset-password] calling getSessionFromUrl()')
          await (supabase.auth as any).getSessionFromUrl()
          return { ok: true }
        } catch (err: any) {
          // eslint-disable-next-line no-console
          console.warn('[reset-password] getSessionFromUrl failed, falling back to setSession', err)
          // continue to try setSession below
        }
      }

      // Fallback: try to programmatically set session
      if (typeof (supabase.auth as any).setSession === 'function') {
        const payload: any = { access_token: accessToken }
        if (refreshToken) payload.refresh_token = refreshToken
        // eslint-disable-next-line no-console
        console.log('[reset-password] calling setSession with payload keys:', Object.keys(payload))

        const res: any = await (supabase.auth as any).setSession(payload)

        // supabase v2 typically returns { data, error } but some wrappers return { error }
        const err = res?.error ?? (res?.status && res.status >= 400 ? res : null)
        if (err) {
          // eslint-disable-next-line no-console
          console.error('[reset-password] setSession error', err)
          return { ok: false, message: err.message || 'Failed to set session from token.' }
        }

        return { ok: true }
      }

      return { ok: false, message: 'Supabase client does not support programmatic session consumption in this version.' }
    } catch (err: any) {
      // eslint-disable-next-line no-console
      console.error('[reset-password] ensureSessionFromToken exception', err)
      return { ok: false, message: err?.message ?? 'Unexpected error while establishing session.' }
    } finally {
      setSettingSession(false)
    }
  }

  // Wait until loading + settingSession finish or until timeout
  const waitUntilReadyOrTimeout = async (timeoutMs = 3000) => {
    const start = Date.now()
    return new Promise<void>((resolve) => {
      const check = () => {
        if (!loading && !settingSession) return resolve()
        if (Date.now() - start >= timeoutMs) return resolve()
        setTimeout(check, 100)
      }
      check()
    })
  }

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

      // Ensure session exists (consume token if needed)
      const sessionResult = await ensureSessionFromToken()
      if (!sessionResult.ok) {
        setMessage(sessionResult.message)
        setMessageType('error')
        return
      }

      // Now update user password. Supabase v2 returns { data, error } from updateUser
      let res: any = null
      if (typeof (supabase.auth as any).updateUser === 'function') {
        res = await (supabase.auth as any).updateUser({ password })
      } else if (typeof (supabase.auth as any).update === 'function') {
        // older/alternate API
        res = await (supabase.auth as any).update({ password })
      } else {
        setMessage('Your Supabase client does not support updating password programmatically.')
        setMessageType('error')
        return
      }

      // Normalize error extraction
      const updateError = res?.error ?? (res?.status && res.status >= 400 ? res : null)
      if (updateError) {
        // eslint-disable-next-line no-console
        console.error('[reset-password] update password error', updateError)
        setMessage(updateError.message || 'Failed to update password.')
        setMessageType('error')
        return
      }

      // If the response returned user data, it's good
      setMessage('Password updated successfully.')
      setMessageType('success')

      // Clean sensitive tokens from URL for cleanliness
      try {
        if (typeof window !== 'undefined') {
          const url = new URL(window.location.href)
          url.hash = ''
          url.searchParams.delete('access_token')
          url.searchParams.delete('refresh_token')
          // also delete common alias
          url.searchParams.delete('token')
          window.history.replaceState({}, document.title, url.toString())
        }
      } catch (err) {
        // ignore
      }

      // Wait for any auth listener to pick up SIGNED_IN
      await waitUntilReadyOrTimeout(3000)

      // short delay so user sees message
      await new Promise((r) => setTimeout(r, 700))

      router.replace('/login')
    } catch (err: any) {
      // eslint-disable-next-line no-console
      console.error('[reset-password] submit exception', err)
      setMessage(err?.message ?? 'Unexpected error while resetting password.')
      setMessageType('error')
    } finally {
      setSubmitting(false)
      // Remove the suppress flag now that the flow is done (success or fail)
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          window.localStorage.removeItem('feinime:suppress_login_toast')
        }
      } catch (err) {
        // ignore
      }
    }
  }

  const DebugBox = () => (
    <div className="mt-4 p-3 border rounded bg-gray-50 text-sm text-gray-700">
      <div><strong>Debug (token parsing)</strong></div>
      <div>access_token: <code>{accessToken ?? '— tidak ada —'}</code></div>
      <div>refresh_token: <code>{refreshToken ?? '—'}</code></div>
      <div className="text-xs text-gray-500 mt-2">Check browser console or Vercel client logs for more info.</div>
    </div>
  )

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
                {showNoTokenMessage && !accessToken && !settingSession && !submitting && (
                  <div className="mb-4 text-sm text-muted-foreground">
                    No password reset token detected in the URL. If you clicked a reset link from email, make sure you opened the full link (some email clients truncate).<br />
                    You can also copy the link from the email and open it in the browser.
                  </div>
                )}

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
                      disabled={submitting || settingSession || loading}
                      className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors disabled:opacity-60"
                    >
                      {(submitting || settingSession) ? <Loader2 className="animate-spin w-4 h-4" /> : 'Set new password'}
                    </button>
                  </div>
                </form>

                {message && (
                  <div className={`mt-4 text-sm text-center ${messageType === 'error' ? 'text-red-500' : 'text-green-500'}`}>
                    {message}
                  </div>
                )}

                <div className="text-center mt-6 text-sm">
                  <p className="text-muted-foreground">
                    Back to{' '}
                    <Link href="/login" className="text-primary hover:underline">Sign in</Link>
                  </p>
                </div>

                <DebugBox />
              </>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
