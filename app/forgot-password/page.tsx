// app/forgot-password/page.tsx
'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Mail, Loader2 } from 'lucide-react'
import { getBrowserSupabase } from '@/lib/supabaseClient'
import { Footer } from '@/components/feinime-footer'

export default function ForgotPasswordPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSendReset = async (e?: React.FormEvent) => {
    e?.preventDefault()
    setMessage(null)
    setSuccess(false)

    if (!email) {
      setMessage('Please enter your email.')
      return
    }

    setLoading(true)
    try {
      const supabase = getBrowserSupabase()
      if (!supabase) {
        setMessage('Client environment required.')
        return
      }

      // prefer explicit redirect if provided, else fallback to current origin
      const redirectTo = process.env.NEXT_PUBLIC_SUPABASE_REDIRECT || (typeof window !== 'undefined' ? window.location.origin + '/reset-password' : undefined)

      // use resetPasswordForEmail if available (Supabase v2+), otherwise try signInWithOtp as fallback
      let error = null
      if (typeof (supabase.auth as any).resetPasswordForEmail === 'function') {
        const res: any = await (supabase.auth as any).resetPasswordForEmail(email, { redirectTo })
        error = res?.error ?? null
      } else if (typeof (supabase.auth as any).signInWithOtp === 'function') {
        // fallback: signInWithOtp can be used for sending email-based links depending on project setup
        const res: any = await (supabase.auth as any).signInWithOtp({ email, options: { emailRedirectTo: redirectTo } })
        error = res?.error ?? null
      } else {
        setMessage('Reset password is not supported by your Supabase client.')
        return
      }

      if (error) {
        console.error('reset password error', error)
        setMessage(error.message || 'Failed to send reset email.')
      } else {
        setSuccess(true)
        setMessage('If an account exists, a password reset email was sent. Check your inbox (and spam).')
      }
    } catch (err: any) {
      console.error('unexpected reset-password exception', err)
      setMessage(err?.message ?? 'Unexpected error while sending reset email.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Note: Navbar may be rendered globally in layout; not necessary here */}
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md mx-auto">
          <div className="bg-card border border-border/50 rounded-2xl shadow-md p-6 sm:p-8">
            <div className="text-center mb-6">
              <h1 className="text-2xl sm:text-3xl font-extrabold">Reset password</h1>
              <p className="text-sm text-muted-foreground mt-1">Enter your email to receive password reset instructions.</p>
            </div>

            <form onSubmit={handleSendReset} className="space-y-4" autoComplete="on">
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
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors disabled:opacity-60"
                >
                  {loading ? <Loader2 className="animate-spin w-4 h-4" /> : 'Send reset email'}
                </button>
              </div>
            </form>

            <div className="mt-4 text-sm text-center">
              {message && (
                <p className={success ? 'text-green-500' : 'text-red-500'}>
                  {message}
                </p>
              )}
            </div>

            <div className="text-center mt-6 text-sm">
              <p className="text-muted-foreground">
                Remembered your password?{' '}
                <Link href="/login" className="text-primary hover:underline">Sign in</Link>
              </p>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  )
}
