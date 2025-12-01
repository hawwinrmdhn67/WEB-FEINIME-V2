'use client'

import React, { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Lock, Eye, EyeOff, Loader2 } from 'lucide-react'
import { getBrowserSupabase } from '@/lib/supabaseClient'

function parseParamsFromLocation(): Record<string, string> {
  const params: Record<string, string> = {}
  if (typeof window === 'undefined') return params

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

  // control when to show the "no token" message (grace period)
  const [showNoTokenMessage, setShowNoTokenMessage] = useState(false)
  const noTokenTimerRef = useRef<number | null>(null)

  useEffect(() => {
    let mounted = true

    async function init() {
      try {
        const params = parseParamsFromLocation()

        // Accept many token param names (token from verify?token=..., access_token in hash, etc.)
        const rawAccess = params['access_token'] ?? params['accessToken'] ?? params['token'] ?? null
        const rawRefresh = params['refresh_token'] ?? params['refreshToken'] ?? null

        const at = rawAccess ? String(rawAccess).trim() : null
        const rt = rawRefresh ? String(rawRefresh).trim() : null

        if (!mounted) return
        setAccessToken(at)
        setRefreshToken(rt)

        // If token found, try to set session automatically (convenience for users)
        if (at) {
          setSettingSession(true)
          try {
            const supabase = getBrowserSupabase()
            if (supabase) {
              // Try setSession if available
              if (typeof (supabase.auth as any).setSession === 'function') {
                try {
                  const payload: any = { access_token: at }
                  if (rt) payload.refresh_token = rt
                  const res: any = await (supabase.auth as any).setSession(payload)
                  if (res?.error) {
                    // fallback to getSessionFromUrl
                    console.warn('setSession automatic failed', res.error)
                    if (typeof (supabase.auth as any).getSessionFromUrl === 'function') {
                      try {
                        await (supabase.auth as any).getSessionFromUrl()
                      } catch (e) {
                        console.warn('getSessionFromUrl fallback failed', e)
                      }
                    }
                  }
                } catch (err) {
                  console.warn('auto setSession error (inner)', err)
                }
              } else if (typeof (supabase.auth as any).getSessionFromUrl === 'function') {
                try {
                  await (supabase.auth as any).getSessionFromUrl()
                } catch (e) {
                  console.warn('getSessionFromUrl error', e)
                }
              }
            }
          } catch (err) {
            console.warn('auto setSession error', err)
          } finally {
            if (mounted) setSettingSession(false)
          }
        }
      } catch (err) {
        console.error('parse params error', err)
      } finally {
        if (mounted) setLoading(false)
        if (noTokenTimerRef.current) {
          window.clearTimeout(noTokenTimerRef.current)
          noTokenTimerRef.current = null
        }
        noTokenTimerRef.current = window.setTimeout(() => {
          if (mounted) setShowNoTokenMessage(true)
        }, 1200)
      }
    }

    init()

    return () => {
      mounted = false
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

  const ensureSessionFromToken = async () => {
    if (!accessToken) {
      return { ok: false, message: 'No access token found in URL. Make sure you used the link from your email.' }
    }

    setSettingSession(true)
    try {
      const supabase = getBrowserSupabase()
      if (!supabase) {
        return { ok: false, message: 'Client environment required.' }
      }

      // SUPPRESS login toast while we consume the session from the URL
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          window.localStorage.setItem('feinime:suppress_login_toast', '1')
        }
      } catch (err) {
        // ignore storage errors
      }

      if (typeof (supabase.auth as any).setSession === 'function') {
        const payload: any = { access_token: accessToken }
        if (refreshToken) payload.refresh_token = refreshToken

        const res: any = await (supabase.auth as any).setSession(payload)
        if (res?.error) {
          console.error('setSession error', res.error)
          // fallback: try getSessionFromUrl if available
          if (typeof (supabase.auth as any).getSessionFromUrl === 'function') {
            try {
              await (supabase.auth as any).getSessionFromUrl()
            } catch (err: any) {
              console.error('getSessionFromUrl error', err)
              return { ok: false, message: res.error.message || 'Failed to set session from token.' }
            }
          } else {
            return { ok: false, message: res.error.message || 'Failed to set session from token.' }
          }
        }

        return { ok: true }
      }

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
      // NOTE: do NOT remove the suppress flag here — we remove it after the whole submit flow
      // so Navbar/auth-listener has chance to read it when SIGNED_IN fires.
    }
  }

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

      // Ensure there is a session (using token if provided)
      const sessionResult = await ensureSessionFromToken()
      if (!sessionResult.ok) {
        setMessage(sessionResult.message)
        setMessageType('error')
        return
      }

      // Now update user password
      let res: any = null
      if (typeof (supabase.auth as any).updateUser === 'function') {
        res = await (supabase.auth as any).updateUser({ password })
      } else if (typeof (supabase.auth as any).update === 'function') {
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

      setMessage('Password updated successfully.')
      setMessageType('success')

      // clean tokens from URL for cleanliness
      try {
        if (typeof window !== 'undefined') {
          const url = new URL(window.location.href)
          url.hash = ''
          url.searchParams.delete('access_token')
          url.searchParams.delete('refresh_token')
          url.searchParams.delete('token')
          window.history.replaceState({}, document.title, url.toString())
        }
      } catch {}

      // Wait little bit to ensure auth listener processed SIGNED_IN (if any)
      await waitUntilReadyOrTimeout(3000)

      // Small delay so user sees the message
      await new Promise((r) => setTimeout(r, 700))

      // Redirect to login page
      router.replace('/login')
    } catch (err: any) {
      console.error('reset password submit exception', err)
      setMessage(err?.message ?? 'Unexpected error while resetting password.')
      setMessageType('error')
    } finally {
      setSubmitting(false)
      // Remove the suppress flag now that the whole flow is done (success or fail)
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          window.localStorage.removeItem('feinime:suppress_login_toast')
        }
      } catch (err) {
        // ignore
      }
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

                {/* Inline notification (below confirm password) */}
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
              </>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
