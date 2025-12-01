// app/forgot-password/page.tsx
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

    if (!email.trim()) {
      setMessage('Please enter your email.')
      return
    }

    setLoading(true)
    try {
      // 1) Validate if email exists
      const check = await fetch('/api/check-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      const checkRes = await check.json()

      if (!checkRes.exists) {
        setMessage('This email is not registered.')
        setSuccess(false)
        setLoading(false)
        return
      }

      // 2) Send reset email
      const supabase = getBrowserSupabase()
      if (!supabase) {
        setMessage('Client environment required.')
        return
      }

      const redirectTo =
        typeof window !== 'undefined'
          ? `${window.location.origin}/reset-password`
          : ''

      let error = null

      if (typeof supabase.auth.resetPasswordForEmail === 'function') {
        const res = await supabase.auth.resetPasswordForEmail(email, { redirectTo })
        error = res.error
      } else {
        setMessage('Unsupported Supabase client.')
        setLoading(false)
        return
      }

      if (error) {
        setMessage(error.message || 'Failed to send reset email.')
        setSuccess(false)
      } else {
        setMessage('Password reset email has been sent. Check your inbox.')
        setSuccess(true)
      }
    } catch (err: any) {
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

            <form onSubmit={handleSendReset} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Email</label>

                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />

                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-3 py-3 rounded-lg bg-input border border-border/40 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                    placeholder="Your email"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-lg bg-primary text-primary-foreground hover:bg-primary/95 disabled:opacity-60"
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
                Remember your password?{' '}
                <Link href="/login" className="text-primary hover:opacity-80">Sign in</Link>
              </p>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  )
}
