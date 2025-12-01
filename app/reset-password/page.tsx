// app/reset-password/page.tsx
'use client'

import React, { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Lock, Eye, EyeOff, Loader2 } from 'lucide-react'
import { getBrowserSupabase } from '@/lib/supabaseClient'

/**
 * Clean Reset Password page
 * - Parses token from fragment (#access_token=...) or query (?access_token=...)
 * - Moves fragment token to query + saves a sessionStorage fallback so token survives refresh
 * - Attempts to consume session using getSessionFromUrl() or setSession()
 * - Calls updateUser/update to change password
 * - Cleans tokens from URL and sessionStorage after success/failure
 *
 * Security notes:
 * - Tokens are stored only temporarily in sessionStorage and removed after flow completes.
 * - Do not log tokens to server.
 */

function parseParamsFromLocation(): Record<string, string> {
  const params: Record<string, string> = {}
  if (typeof window === 'undefined') return params
  try {
    const qs = window.location.search
    if (qs && qs.length > 1) {
      const search = new URLSearchParams(qs)
      for (const [k, v] of search.entries()) params[k] = v
    }
    const hash = window.location.hash
    if (hash && hash.startsWith('#')) {
      const frag = hash.slice(1)
      const fragParams = new URLSearchParams(frag)
      for (const [k, v] of fragParams.entries()) params[k] = v
    }

    // normalize common aliases
    if (params['accessToken'] && !params['access_token']) params['access_token'] = params['accessToken']
    if (params['refreshToken'] && !params['refresh_token']) params['refresh_token'] = params['refreshToken']
    if (params['token'] && !params['access_token']) params['access_token'] = params['token']
  } catch (e) {
    // ignore parse errors
    // eslint-disable-next-line no-console
    console.error('[reset-password] parseParamsFromLocation error', e)
  }
  return params
}

export default function ResetPasswordPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [settingSession, setSettingSession] = useState(false)
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [refreshToken, setRefreshToken] = useState<string | null>(null)
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [notice, setNotice] = useState<{ type: 'error' | 'success'; text: string } | null>(null)
  const noTokenTimerRef = useRef<number | null>(null)
  const consumedRef = useRef(false)

  // parse params on mount and move fragment token -> query + sessionStorage fallback
  useEffect(() => {
    if (typeof window === 'undefined') return

    try {
      const params = parseParamsFromLocation()
      const at = params['access_token'] ?? null
      const rt = params['refresh_token'] ?? null

      // If token exists in fragment, move to search params and save fallback in sessionStorage
      try {
        const url = new URL(window.location.href)
        const hasHash = !!window.location.hash
        if (at && hasHash) {
          if (!url.searchParams.get('access_token')) {
            url.searchParams.set('access_token', at)
          }
          // remove hash to avoid it being lost on navigation
          url.hash = ''
          window.history.replaceState({}, document.title, url.toString())
          try {
            window.sessionStorage.setItem('feinime:reset_access_token', at)
            if (rt) window.sessionStorage.setItem('feinime:reset_refresh_token', rt)
            // eslint-disable-next-line no-console
            console.log('[reset-password] moved token from hash -> search and saved fallback in sessionStorage')
          } catch (e) {
            // ignore storage errors
          }
        } else if (!at) {
          // no token in parsed params -> try restore from sessionStorage fallback
          try {
            const fallbackAT = window.sessionStorage.getItem('feinime:reset_access_token')
            const fallbackRT = window.sessionStorage.getItem('feinime:reset_refresh_token')
            if (fallbackAT) {
              // ensure URL has query param for visibility
              if (!url.searchParams.get('access_token')) {
                url.searchParams.set('access_token', fallbackAT)
                window.history.replaceState({}, document.title, url.toString())
              }
              setAccessToken(fallbackAT)
              if (fallbackRT) setRefreshToken(fallbackRT)
              // eslint-disable-next-line no-console
              console.log('[reset-password] restored token from sessionStorage fallback')
            }
          } catch (e) {
            // ignore storage read errors
          }
        }
      } catch (e) {
        // eslint-disable-next-line no-console
        console.warn('[reset-password] failed to normalize token location', e)
      }

      // Finally set state from direct params if present (covers case when token already in search)
      if (at) setAccessToken(at)
      if (rt) setRefreshToken(rt)

      // Short grace period before showing "no token" message (gives time for fragments to be consumed)
      noTokenTimerRef.current = window.setTimeout(() => {
        noTokenTimerRef.current = null
      }, 1200)

      // log what we parsed
      // eslint-disable-next-line no-console
      console.log('[reset-password] parsed params', params)
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('[reset-password] initial parse error', err)
    } finally {
      setLoading(false)
    }

    return () => {
      if (noTokenTimerRef.current) {
        window.clearTimeout(noTokenTimerRef.current)
        noTokenTimerRef.current = null
      }
    }
    // intentionally run only once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // helper: try to consume token into Supabase client session
  const ensureSessionFromToken = async (): Promise<{ ok: boolean; message?: string }> => {
    if (consumedRef.current) return { ok: true } // already consumed once
    if (!accessToken) {
      return { ok: false, message: 'No access token found in URL. Open the full link from your email.' }
    }

    setSettingSession(true)
    try {
      const supabase = getBrowserSupabase()
      if (!supabase) return { ok: false, message: 'Supabase client unavailable in browser.' }

      // suppress login toasts in your app while doing this (app may set a listener)
      try { window.localStorage?.setItem('feinime:suppress_login_toast', '1') } catch {}

      // prefer getSessionFromUrl when available (consumes fragment properly)
      if (typeof (supabase.auth as any).getSessionFromUrl === 'function') {
        try {
          // eslint-disable-next-line no-console
          console.log('[reset-password] calling getSessionFromUrl()')
          await (supabase.auth as any).getSessionFromUrl()
          consumedRef.current = true
          return { ok: true }
        } catch (err) {
          // eslint-disable-next-line no-console
          console.warn('[reset-password] getSessionFromUrl failed, fallback to setSession', err)
        }
      }

      // fallback: setSession if available
      if (typeof (supabase.auth as any).setSession === 'function') {
        const payload: any = { access_token: accessToken }
        if (refreshToken) payload.refresh_token = refreshToken
        // eslint-disable-next-line no-console
        console.log('[reset-password] calling setSession()')
        const res: any = await (supabase.auth as any).setSession(payload)
        const err = res?.error ?? (res?.status && res.status >= 400 ? res : null)
        if (err) {
          // eslint-disable-next-line no-console
          console.error('[reset-password] setSession error', err)
          return { ok: false, message: err.message || 'Failed to set session from token.' }
        }
        consumedRef.current = true
        return { ok: true }
      }

      return { ok: false, message: 'Supabase client does not support programmatic session consumption.' }
    } catch (err: any) {
      // eslint-disable-next-line no-console
      console.error('[reset-password] ensureSessionFromToken exception', err)
      return { ok: false, message: err?.message ?? 'Unexpected error while establishing session.' }
    } finally {
      setSettingSession(false)
    }
  }

  // helper: wait for readiness (auth listeners) or timeout
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

  const clearStoredTokens = () => {
    try {
      // remove from URL
      if (typeof window !== 'undefined') {
        const url = new URL(window.location.href)
        url.searchParams.delete('access_token')
        url.searchParams.delete('refresh_token')
        url.searchParams.delete('token')
        url.hash = ''
        window.history.replaceState({}, document.title, url.toString())
      }
    } catch (e) {
      // ignore
    }
    try {
      window.sessionStorage?.removeItem('feinime:reset_access_token')
      window.sessionStorage?.removeItem('feinime:reset_refresh_token')
    } catch (e) {
      // ignore
    }
    try { window.localStorage?.removeItem('feinime:suppress_login_toast') } catch {}
  }

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault()
    setNotice(null)

    if (!password || !confirm) {
      setNotice({ type: 'error', text: 'Please fill both password fields.' })
      return
    }
    if (password.length < 6) {
      setNotice({ type: 'error', text: 'Password must be at least 6 characters.' })
      return
    }
    if (password !== confirm) {
      setNotice({ type: 'error', text: 'Passwords do not match.' })
      return
    }

    setSubmitting(true)
    try {
      const supabase = getBrowserSupabase()
      if (!supabase) {
        setNotice({ type: 'error', text: 'Supabase client not available in browser.' })
        return
      }

      // ensure session is present (consume token if needed)
      const sessionResult = await ensureSessionFromToken()
      if (!sessionResult.ok) {
        setNotice({ type: 'error', text: sessionResult.message ?? 'Failed to establish session.' })
        return
      }

      // now update password
      let res: any = null
      if (typeof (supabase.auth as any).updateUser === 'function') {
        res = await (supabase.auth as any).updateUser({ password })
      } else if (typeof (supabase.auth as any).update === 'function') {
        res = await (supabase.auth as any).update({ password })
      } else {
        setNotice({ type: 'error', text: 'Supabase client does not support updateUser/update methods.' })
        return
      }

      const updateError = res?.error ?? (res?.status && res.status >= 400 ? res : null)
      if (updateError) {
        // eslint-disable-next-line no-console
        console.error('[reset-password] update password error', updateError)
        setNotice({ type: 'error', text: updateError.message || 'Failed to update password.' })
        return
      }

      // success
      clearStoredTokens()
      setNotice({ type: 'success', text: 'Password updated successfully. Redirecting to login…' })

      // wait for auth listeners to react
      await waitUntilReadyOrTimeout(3000)
      // short delay so user sees notice
      await new Promise((r) => setTimeout(r, 700))
      router.replace('/login')
    } catch (err: any) {
      // eslint-disable-next-line no-console
      console.error('[reset-password] submit exception', err)
      setNotice({ type: 'error', text: err?.message ?? 'Unexpected error while resetting password.' })
    } finally {
      setSubmitting(false)
    }
  }

  const DebugBox = () => (
    <div className="mt-4 p-3 border rounded bg-gray-50 text-sm text-gray-700">
      <div><strong>Debug (token parsing)</strong></div>
      <div>access_token: <code>{accessToken ?? '— tidak ada —'}</code></div>
      <div>refresh_token: <code>{refreshToken ?? '—'}</code></div>
      <div className="text-xs text-gray-500 mt-2">Token disimpan sementara di sessionStorage sebagai fallback (akan dihapus setelah selesai).</div>
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
                {!accessToken && !settingSession && !submitting && (
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

                {notice && (
                  <div className={`mt-4 text-sm text-center ${notice.type === 'error' ? 'text-red-500' : 'text-green-500'}`}>
                    {notice.text}
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
