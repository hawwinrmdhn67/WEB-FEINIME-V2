'use client'

import React, { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Mail, Lock, Eye, EyeOff, Loader2, User as UserIcon } from 'lucide-react'
import { getBrowserSupabase } from '@/lib/supabaseClient'
import { upsertProfile } from '@/lib/upsertProfile'
import { Footer } from '@/components/feinime-footer'

export default function RegisterPage() {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const [checkingUsername, setCheckingUsername] = useState(false)
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null)

  const usernameValid = useMemo(() => {
    const u = username.trim()
    return u.length === 0 || (/^[a-zA-Z0-9_.-]{3,20}$/.test(u) && u.length >= 3)
  }, [username])

  const emailValid = useMemo(() => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
  }, [email])

  const passwordChecks = useMemo(() => {
    const p = password
    return {
      length: p.length >= 8,
      upper: /[A-Z]/.test(p),
      lower: /[a-z]/.test(p),
      number: /\d/.test(p),
      special: /[!@#$%^&*()\-_+=[\]{};':"\\|,.<>/?]/.test(p)
    }
  }, [password])

  const passwordValid =
    password.length > 0 &&
    passwordChecks.length &&
    passwordChecks.upper &&
    passwordChecks.lower &&
    passwordChecks.number

  const confirmMatches = password === confirm

  const formValid =
    emailValid &&
    passwordValid &&
    confirmMatches &&
    usernameValid &&
    usernameAvailable === true &&
    !loading

  useEffect(() => {
    const u = username.trim()
    if (u.length < 3 || !usernameValid) {
      setUsernameAvailable(null)
      setCheckingUsername(false)
      return
    }

    let cancelled = false
    const delay = setTimeout(async () => {
      setCheckingUsername(true)
      try {
        const res = await fetch('/api/check-username', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: u })
        })

        if (!res.ok) {
          setUsernameAvailable(null)
          return
        }

        const data = await res.json().catch(() => ({ exists: false }))
        if (!cancelled) {
          setUsernameAvailable(!data.exists)
        }
      } catch (err) {
        console.error('check-username failed', err)
        if (!cancelled) setUsernameAvailable(null)
      } finally {
        if (!cancelled) setCheckingUsername(false)
      }
    }, 500) 

    return () => {
      cancelled = true
      clearTimeout(delay)
    }
  }, [username, usernameValid])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage(null)
    setSuccess(false)

    if (!username.trim()) {
      setMessage('Please enter a username (3-20 characters).')
      return
    }
    if (!usernameValid) {
      setMessage('Username may contain letters, numbers, _ . - and be 3-20 chars.')
      return
    }
    if (usernameAvailable === null) {
      setCheckingUsername(true)
      try {
        const res = await fetch('/api/check-username', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: username.trim() })
        })
        if (!res.ok) {
          setMessage('Could not validate username availability. Please try again.')
          setCheckingUsername(false)
          return
        }
        const { exists } = await res.json().catch(() => ({ exists: false }))
        if (exists) {
          setMessage('Username is already taken. Please choose another.')
          setUsernameAvailable(false)
          setCheckingUsername(false)
          return
        }
        setUsernameAvailable(true)
      } catch (err) {
        console.error('sync check username failed', err)
        setMessage('Could not validate username availability. Please try again.')
        setCheckingUsername(false)
        return
      } finally {
        setCheckingUsername(false)
      }
    }

    if (usernameAvailable === false) {
      setMessage('Username already registered. Try another one.')
      return
    }

    if (!emailValid) {
      setMessage('Please enter a valid email address.')
      return
    }
    if (!passwordValid) {
      setMessage('Password is too weak. Minimum: 8 chars, upper & lower & number.')
      return
    }
    if (!confirmMatches) {
      setMessage('Password and confirmation do not match.')
      return
    }

    setLoading(true)

    try {
      const checkRes = await fetch('/api/check-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() })
      })

      if (!checkRes.ok) {
        const errJson = await checkRes.json().catch(() => ({}))
        setMessage(errJson?.message || errJson?.error || 'Failed to validate email availability.')
        setLoading(false)
        return
      }

      const { exists } = await checkRes.json().catch(() => ({ exists: false }))

      if (exists) {
        setMessage('Email already registered. Try logging in or reset password.')
        setLoading(false)
        return
      }

      const supabase = getBrowserSupabase()
      if (!supabase) {
        setMessage('Client environment required for registration.')
        setLoading(false)
        return
      }

      const signUpRes = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: { data: { username: username.trim() } }
      })

      const signUpError = (signUpRes as any)?.error
      const signUpData = (signUpRes as any)?.data

      if (signUpError) {
        console.error('signUp error', signUpError)
        setMessage(signUpError.message || 'Registration failed.')
        setLoading(false)
        return
      }

      const user = signUpData?.user ?? null
      const session = signUpData?.session ?? null

      if (user && session) {
        await upsertProfile({
          id: user.id,
          email: user.email ?? null,
          user_metadata: user.user_metadata
        } as any)
      } else if (user && !session) {
        try {
          await fetch('/api/create-profile', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              id: user.id,
              email: user.email ?? null,
              full_name: user.user_metadata?.full_name ?? user.user_metadata?.name ?? null,
              avatar_url: user.user_metadata?.avatar_url ?? user.user_metadata?.picture ?? null,
              username: username.trim()
            })
          })
        } catch (err) {
          console.warn('create-profile server call failed', err)
        }
      }

      setSuccess(true)
      setMessage('Registration successful. Please check your email for confirmation.')
      setTimeout(() => router.push('/login'), 1000)
    } catch (err: any) {
      console.error('signUp exception', err)
      setSuccess(false)
      setMessage(err?.message ?? 'Register failed.')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogle = async () => {
    setLoading(true)
    setMessage(null)
    setSuccess(false)
    try {
      const supabase = getBrowserSupabase()
      if (!supabase) {
        setMessage('Client environment required for OAuth.')
        setLoading(false)
        return
      }
      const redirectTo =
        process.env.NEXT_PUBLIC_SUPABASE_REDIRECT || (typeof window !== 'undefined' ? window.location.origin : undefined)
      await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo } })
    } catch (err: any) {
      console.error('Google OAuth failed', err)
      setMessage(err?.message ?? 'Failed to start Google OAuth')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-background text-foreground flex flex-col">
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md mx-auto">
          <div className="bg-card border border-border/50 rounded-2xl shadow-md p-6 sm:p-8">
            <div className="text-center mb-6">
              <h1 className="text-2xl sm:text-3xl font-extrabold">Create account</h1>
              <p className="text-sm text-muted-foreground mt-1">Sign up to join Feinime</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4" autoComplete="on">
              <div>
                <label htmlFor="username" className="block text-sm font-medium mb-2">Username</label>
                <div className="relative">
                  <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-muted-foreground">
                    <UserIcon className="w-4 h-4" />
                  </span>
                  <input
                    id="username"
                    name="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Your username"
                    className={`w-full pl-10 pr-3 py-3 rounded-lg bg-input border ${
                      usernameValid ? 'border-border/40' : 'border-red-400'
                    } focus:outline-none focus:ring-1 focus:ring-primary text-sm`}
                  />
                </div>

                {/* username feedback */}
                {username.length > 0 && checkingUsername && (
                  <p className="text-xs text-muted-foreground mt-1">Checking username...</p>
                )}

                {username.length > 0 && !usernameValid && (
                  <p className="text-xs text-red-500 mt-1">Username 3–20 chars. Allowed: letters, numbers, _ . -</p>
                )}

                {username.length > 0 && usernameValid && usernameAvailable === false && (
                  <p className="text-xs text-red-500 mt-1">Username is already taken.</p>
                )}

                {username.length > 0 && usernameValid && usernameAvailable === true && (
                  <p className="text-xs text-green-500 mt-1">Username is available.</p>
                )}
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-2">Email</label>
                <div className="relative">
                  <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-muted-foreground">
                    <Mail className="w-4 h-4" />
                  </span>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Your email"
                    className={`w-full pl-10 pr-3 py-3 rounded-lg bg-input border ${
                      emailValid || email.length === 0 ? 'border-border/40' : 'border-red-400'
                    } focus:outline-none focus:ring-1 focus:ring-primary text-sm`}
                    required
                  />
                </div>
                {email.length > 0 && !emailValid && (
                  <p className="text-xs text-red-500 mt-1">Please enter a valid email.</p>
                )}
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium mb-2">Password</label>
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
                    placeholder="Your password"
                    className={`w-full pl-10 pr-10 py-3 rounded-lg bg-input border ${
                      password.length === 0 || passwordValid ? 'border-border/40' : 'border-red-400'
                    } focus:outline-none focus:ring-1 focus:ring-primary text-sm`}
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

                {/* password hints */}
                <div className="mt-2 text-xs text-muted-foreground">
                  <p className={passwordChecks.length ? 'text-green-600' : 'text-muted-foreground'}>
                    • At least 8 characters
                  </p>
                  <p className={passwordChecks.upper ? 'text-green-600' : 'text-muted-foreground'}>
                    • 1 uppercase letter
                  </p>
                  <p className={passwordChecks.lower ? 'text-green-600' : 'text-muted-foreground'}>
                    • 1 lowercase letter
                  </p>
                  <p className={passwordChecks.number ? 'text-green-600' : 'text-muted-foreground'}>
                    • 1 number
                  </p>
                </div>
              </div>

              <div>
                <label htmlFor="confirm" className="block text-sm font-medium mb-2">
                  Confirm Password
                </label>

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
                    className={`w-full pl-10 pr-10 py-3 rounded-lg bg-input border ${
                      confirm.length === 0 || confirmMatches ? 'border-border/40' : 'border-red-400'
                    } focus:outline-none focus:ring-1 focus:ring-primary text-sm`}
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

                {!confirmMatches && confirm.length > 0 && (
                  <p className="text-xs text-red-500 mt-1">Passwords do not match.</p>
                )}
              </div>

              <div>
                <button
                  type="submit"
                  disabled={!formValid}
                  className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors disabled:opacity-60"
                >
                  {loading ? <Loader2 className="animate-spin w-4 h-4" /> : 'Create account'}
                </button>
              </div>
            </form>

            <div className="flex items-center my-4">
              <div className="flex-1 h-px bg-border" />
              <span className="px-3 text-xs text-muted-foreground">OR</span>
              <div className="flex-1 h-px bg-border" />
            </div>

            <div>
              <button
                onClick={handleGoogle}
                className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-lg border border-border/40 bg-transparent hover:bg-secondary/50 transition-colors text-sm"
                aria-label="Continue with Google"
              >
                <svg className="w-4 h-4" viewBox="0 0 48 48" aria-hidden>
                  <path fill="#4285F4" d="M44.5 20H24v8.5h11.8C34.7 34.9 30.1 38 24 38c-7.2 0-13-5.8-13-13s5.8-13 13-13c3.3 0 6.3 1.2 8.6 3.2l6.4-6.4C34.9 4.3 29.8 2 24 2 12.3 2 3 11.3 3 23s9.3 21 21 21 21-9.3 21-21c0-1.1-.1-2.0-.3-3Z"/>
                  <path fill="#34A853" d="M6.3 14.7l7 5.1C15 15.2 19.2 12 24 12c3.3 0 6.3 1.2 8.6 3.2l6.4-6.4C34.9 4.3 29.8 2 24 2 15.3 2 7.8 7.3 6.3 14.7Z"/>
                  <path fill="#FBBC05" d="M24 44c5.8 0 10.9-2.3 14.7-6l-6.8-5.5C29.9 34.5 27.1 36 24 36c-6 0-10.6-4.1-12.2-9.6l-7.2 5.6C7.7 39.1 15.3 44 24 44Z"/>
                  <path fill="#EA4335" d="M44.5 20H24v8.5h11.8a12 12 0 0 1-3.8 5.7l6.8 5.5C43.8 34.9 45 29.2 45 24c0-1.1-.1-2.0-.3-3Z"/>
                </svg>
                Continue with Google
              </button>
            </div>

            {message && (
              <div className={`mt-4 text-sm text-center ${success ? 'text-green-500' : 'text-red-500'}`}>
                {message}
              </div>
            )}

            <div className="text-center mt-6 text-sm">
              <p className="text-muted-foreground">
                Already have an account?{' '}
                <Link href="/login" className="text-primary hover:underline">Login</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  )
}
