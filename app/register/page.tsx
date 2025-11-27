'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Mail, Lock, Eye, EyeOff, Loader2, User as UserIcon } from 'lucide-react'
import { supabase } from '@/lib/supabaseClient'
import { upsertProfile } from '@/lib/upsertProfile'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/feinime-footer'

export default function RegisterPage() {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage(null)

    if (!email || !password) {
      setMessage('Email dan password wajib diisi.')
      return
    }
    if (password !== confirm) {
      setMessage('Password dan konfirmasi tidak cocok.')
      return
    }

    setLoading(true)
    try {
      // supabase v2 signUp shape: supabase.auth.signUp({ email, password, options: { data }})
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { username: username || null } }
      })

      console.log('signUp response', { data, error })

      if (error) {
        setMessage(error.message)
        return
      }

      const user = (data as any)?.user ?? null
      const session = (data as any)?.session ?? null

      // If we have a session (immediate sign-in), upsert profile client-side
      if (user && session) {
        await upsertProfile({
          id: user.id,
          email: user.email ?? null,
          user_metadata: user.user_metadata
        } as any)
      } else if (user && !session) {
        // Email confirmation flow (no client session) -> create profile server-side
        try {
          const res = await fetch('/api/create-profile', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              id: user.id,
              email: user.email ?? null,
              full_name: user.user_metadata?.full_name ?? user.user_metadata?.name ?? null,
              avatar_url: user.user_metadata?.avatar_url ?? user.user_metadata?.picture ?? null
            })
          })

          if (!res.ok) {
            console.warn('create-profile server returned non-ok', await res.text())
          }
        } catch (err) {
          console.warn('create-profile server call failed', err)
        }
      }

      setMessage('Registration successful. Check your email for confirmation.')
      // short delay to allow user read message then redirect
      setTimeout(() => router.push('/login'), 1000)
    } catch (err: any) {
      console.error('signUp exception', err)
      setMessage(err?.message ?? 'Register failed')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogle = async () => {
    try {
      setLoading(true)
      setMessage(null)
      const redirectTo = process.env.NEXT_PUBLIC_SUPABASE_REDIRECT || (typeof window !== 'undefined' ? window.location.origin : undefined)
      // start OAuth redirect
      await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo } })
    } catch (err: any) {
      console.error('Google OAuth failed', err)
      setMessage(err?.message ?? 'Gagal memulai Google OAuth')
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
              <h1 className="text-2xl sm:text-3xl font-extrabold">Create account</h1>
              <p className="text-sm text-muted-foreground mt-1">Sign up to join</p>
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
                    className="w-full pl-10 pr-3 py-3 rounded-lg bg-input border border-border/40 focus:outline-none focus:ring-1 focus:ring-primary text-sm"
                  />
                </div>
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
              </div>

              <div>
                <label htmlFor="confirm" className="block text-sm font-medium mb-2">Confirm Password</label>
                <input
                  id="confirm"
                  name="confirm"
                  type="password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  placeholder="Confirm password"
                  className="w-full pl-3 pr-3 py-3 rounded-lg bg-input border border-border/40 focus:outline-none focus:ring-1 focus:ring-primary text-sm"
                  required
                />
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading}
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
                <svg className="w-4 h-4" viewBox="0 0 24 24" aria-hidden>
                  <path fill="#EA4335" d="M12 11v2h6.5c-.3 1.5-1.7 4.4-6.5 4.4-3.9 0-7-3.1-7-7s3.1-7 7-7c2.2 0 3.7.9 4.6 1.6l1.6-1.6C17.6 4 15.9 3 12 3 6.5 3 2 7.5 2 13s4.5 10 10 10 10-4.5 10-10c0-.7-.1-1.3-.2-1.9H12z"/>
                </svg>
                Continue with Google
              </button>
            </div>

            {message && <div className="mt-4 text-sm text-center text-red-500">{message}</div>}

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
