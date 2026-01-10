'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Mail, Loader2 } from 'lucide-react'
import { getBrowserSupabase } from '@/lib/supabaseClient'
import { Footer } from '@/components/feinime-footer'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSendReset = async (e?: React.FormEvent) => {
    e?.preventDefault()

    setMessage(null)
    setSuccess(false)

    const trimmed = email.trim()
    if (!trimmed) {
      setMessage('Please enter your email.')
      setSuccess(false)
      return
    }

    setLoading(true)

    try {
      const checkRes = await fetch('/api/check-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: trimmed })
      })

      if (!checkRes.ok) {
        const errJson = await checkRes.json().catch(() => ({}))
        const serverMsg = errJson?.message || errJson?.error || 'Failed to validate email.'
        setMessage(serverMsg)
        setSuccess(false)
        setLoading(false)
        return
      }

      const { exists } = await checkRes.json()

      if (!exists) {
        setMessage('Email is not registered.')
        setSuccess(false)
        setLoading(false)
        return
      }

      const supabase = getBrowserSupabase()
      if (!supabase) {
        setMessage('Client environment required.')
        setSuccess(false)
        setLoading(false)
        return
      }

      const redirectTo =
        typeof window !== 'undefined'
          ? `${window.location.origin}/reset-password`
          : process.env.NEXT_PUBLIC_SUPABASE_REDIRECT || ''

      let error = null

      if (typeof supabase.auth.resetPasswordForEmail === 'function') {
        const res = await supabase.auth.resetPasswordForEmail(trimmed, { redirectTo })
        error = res.error
      }

      else if (typeof supabase.auth.signInWithOtp === 'function') {
        const res = await supabase.auth.signInWithOtp({
          email: trimmed,
          options: { emailRedirectTo: redirectTo }
        })
        error = res.error
      } else {
        setMessage('Unsupported Supabase client version.')
        setSuccess(false)
        setLoading(false)
        return
      }

      if (error) {
        console.error(error)
        setMessage(error.message || 'Failed to send reset email.')
        setSuccess(false)
      } else {
        setMessage('Reset password email has been sent. Check your inbox.')
        setSuccess(true)
        setEmail('') 
      }
    } catch (err: any) {
      console.error('Forgot password error:', err)
      setMessage(err?.message ?? 'Unexpected error occurred.')
      setSuccess(false)
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
              <h1 className="text-2xl sm:text-3xl font-extrabold">Reset password</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Enter your email to receive password reset instructions.
              </p>
            </div>

            <form onSubmit={handleSendReset} className="space-y-4" autoComplete="on">
              <div>
                <label className="block text-sm font-medium mb-2">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />

                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-3 py-3 rounded-lg bg-input border border-border/40 
                      focus:outline-none focus:ring-1 focus:ring-primary text-sm"
                    placeholder="Your email"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-lg 
                bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
              >
                {loading ? <Loader2 className="animate-spin w-4 h-4" /> : 'Send reset email'}
              </button>
            </form>

            <div className="mt-4 text-sm text-center min-h-[1.25rem]">
              {message && (
                <p className={success ? 'text-green-500' : 'text-red-500'}>{message}</p>
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
