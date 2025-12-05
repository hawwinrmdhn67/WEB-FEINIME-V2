// app/login/page.tsx
'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Mail, Lock, Eye, EyeOff, Loader2 } from 'lucide-react'
import { getBrowserSupabase } from '@/lib/supabaseClient'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/feinime-footer'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('') // still named email for minimal change
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  // cleanup session but suppress logout toast so user doesn't see "Logout successful"
  const cleanupSession = async () => {
    const supabase = getBrowserSupabase()
    try {
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          window.localStorage.setItem('feinime:suppress_logout_toast', '1')
        }
      } catch {}
      if (!supabase) return
      await supabase.auth.signOut()
      if (typeof window !== 'undefined') {
        try { localStorage.removeItem('supabase.auth.token') } catch {}
        try { sessionStorage.clear() } catch {}
      }
    } catch (err) {
      console.warn('cleanupSession error', err)
      try { if (typeof window !== 'undefined') window.localStorage.removeItem('feinime:suppress_logout_toast') } catch {}
    }
  }

  const setLoginToastFlag = () => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem('feinime:show_login_toast', '1')
      }
    } catch (err) {}
  }

  // --- minimal helpers to support username OR email input ---
  const looksLikeEmail = (v: string) => /\S+@\S+\.\S+/.test(v.trim())

  // expects a server route /api/resolve-username that returns { email } or 4xx/5xx with { error }
  const resolveIdentifierToEmail = async (identifier: string) => {
    const trimmed = identifier.trim()
    if (looksLikeEmail(trimmed)) return trimmed

    // not an email -> treat as username, resolve on server
    try {
      const res = await fetch('/api/lookup-username', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: trimmed })
      })

      if (!res.ok) {
        const j = await res.json().catch(() => ({}))
        throw new Error(j?.error || 'Username not found')
      }

      const json = await res.json().catch(() => ({}))
      if (!json || !json.email) throw new Error('Username not found')
      return json.email as string
    } catch (err: any) {
      throw new Error(err?.message ?? 'Failed to resolve username')
    }
  }
  // ----------------------------------------------------------

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage(null)
    if (!email || !password) {
      setMessage('Please fill email or username and password.')
      return
    }

    setLoading(true)
    try {
      const supabase = getBrowserSupabase()
      if (!supabase) {
        setMessage('Client environment required for login.')
        setLoading(false)
        return
      }

      // cleanup any stale session but suppress its logout toast
      await cleanupSession()

      // Resolve identifier (email or username) to an email address
      let emailToUse = ''
      try {
        emailToUse = await resolveIdentifierToEmail(email)
      } catch (err: any) {
        setMessage(err?.message ?? 'Username not found.')
        setLoading(false)
        return
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email: emailToUse,
        password
      })

      if (error) {
        try { if (typeof window !== 'undefined') window.localStorage.removeItem('feinime:show_login_toast') } catch {}
        setMessage(error.message || 'Login failed')
        setPassword('') // clear password after failed attempt
        setLoading(false)
        return
      }

      // success -> set the login toast flag now (Navbar will show toast after it receives SIGNED_IN)
      try { if (typeof window !== 'undefined') window.localStorage.setItem('feinime:show_login_toast', '1') } catch {}

      // redirect to home (replace so user can't go back to login)
      router.replace('/#')
    } catch (err: any) {
      console.error('unexpected auth exception', err)
      setMessage(err?.message ?? 'Unexpected error during login')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogle = async () => {
    setLoading(true)
    setMessage(null)
    try {
      const supabase = getBrowserSupabase()
      if (!supabase) {
        setMessage('Client environment required for OAuth.')
        setLoading(false)
        return
      }

      // set a flag so after OAuth redirect we can show a toast from Navbar
      setLoginToastFlag()

      const redirectTo = process.env.NEXT_PUBLIC_SUPABASE_REDIRECT || (typeof window !== 'undefined' ? window.location.origin : undefined)
      await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo } })
      // note: this will redirect the page
    } catch (err: any) {
      console.error('Google OAuth start failed', err)
      setMessage(err?.message ?? 'Failed to start Google OAuth')
      try { if (typeof window !== 'undefined') window.localStorage.removeItem('feinime:show_login_toast') } catch {}
    } finally {
      setLoading(false)
    }
  }

  const handleSendMagicLink = async () => {
    if (!email) {
      setMessage('Please enter your email or username to send a magic link.')
      return
    }
    setLoading(true)
    try {
      const supabase = getBrowserSupabase()
      if (!supabase) {
        setMessage('Client environment required.')
        setLoading(false)
        return
      }

      // Resolve identifier to email first
      let emailToUse = ''
      try {
        emailToUse = await resolveIdentifierToEmail(email)
      } catch (err: any) {
        setMessage(err?.message ?? 'Username not found.')
        setLoading(false)
        return
      }

      const redirectTo = process.env.NEXT_PUBLIC_SUPABASE_REDIRECT || (typeof window !== 'undefined' ? window.location.origin : undefined)
      const { error } = await supabase.auth.signInWithOtp({ email: emailToUse, options: { emailRedirectTo: redirectTo } })
      if (error) {
        setMessage(error.message)
        console.error('magic link error', error)
      } else {
        setMessage('Magic link sent check your inbox.')
      }
    } catch (err: any) {
      console.error('sendMagicLink exception', err)
      setMessage(err?.message ?? 'Failed to send magic link')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-background text-foreground flex flex-col">
      <Navbar />

      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md mx-auto">
          <div className="bg-card border border-border/50 rounded-2xl shadow-md p-6 sm:p-8">
            <div className="text-center mb-6">
              <h1 className="text-2xl sm:text-3xl font-extrabold">Login</h1>
              <p className="text-sm text-muted-foreground mt-1">Sign in to continue Feinime</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4" autoComplete="on">
              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-2">Email or username</label>
                <div className="relative">
                  <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-muted-foreground">
                    <Mail className="w-4 h-4" />
                  </span>
                  <input
                    id="email"
                    name="email"
                    type="text"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Your Email or Username"
                    className="w-full pl-10 pr-3 py-3 rounded-lg bg-input border border-border/40 focus:outline-none focus:ring-1 focus:ring-primary text-sm"
                    required
                  />
                </div>
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
                    autoComplete="current-password"
                    placeholder="Your password"
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

                <div className="flex items-center justify-between mt-2">
                <Link href="/forgot-password" className="text-xs text-muted-foreground hover:underline">
                  Forgot password?
                </Link>

                <Link href="/register" className="text-xs text-muted-foreground hover:underline">
                  Create account
                </Link>
              </div>
            </div>

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors disabled:opacity-60"
                >
                  {loading ? <Loader2 className="animate-spin w-4 h-4" /> : 'Login'}
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
                disabled={loading}
                className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-lg border border-border/40 bg-transparent hover:bg-secondary/50 transition-colors text-sm disabled:opacity-60"
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

            {message && <div className="mt-4 text-sm text-center text-red-500">{message}</div>}

            <div className="text-center mt-6 text-sm">
              <p className="text-muted-foreground">
                Don't have an account?{' '}
                <Link href="/register" className="text-primary hover:underline">Create one</Link>
              </p>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  )
}
