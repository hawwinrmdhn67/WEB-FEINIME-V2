// app/reset-password/page.tsx
'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Lock, Eye, EyeOff, Loader2 } from 'lucide-react'
import { Footer } from '@/components/feinime-footer'

export default function ResetPasswordPage() {
  const router = useRouter()

  const [token, setToken] = useState<string | null>(null)
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  // parse token from query or hash
  useEffect(() => {
    if (typeof window === 'undefined') return

    const url = new URL(window.location.href)
    let at = url.searchParams.get('access_token')

    if (!at && window.location.hash) {
      const frag = new URLSearchParams(window.location.hash.replace('#', ''))
      at = frag.get('access_token')
      if (at) {
        url.searchParams.set('access_token', at)
        url.hash = ''
        window.history.replaceState({}, '', url.toString())
      }
    }

    setToken(at)
  }, [])

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault()
    setMessage(null)
    setSuccess(false)

    if (!token) {
      setMessage('Token tidak ditemukan.')
      return
    }

    if (!password || !confirmPassword) {
      setMessage('Isi semua field.')
      return
    }

    if (password.length < 6) {
      setMessage('Password minimal 6 karakter.')
      return
    }

    if (password !== confirmPassword) {
      setMessage('Password tidak cocok.')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password })
      })

      const data = await res.json().catch(() => null)

      if (!res.ok) {
        setMessage(data?.error || 'Gagal memperbarui password.')
        setSuccess(false)
      } else {
        setMessage('Password berhasil diubah! Mengarah ke login...')
        setSuccess(true)
        setTimeout(() => router.push('/login'), 1200)
      }
    } catch (err: any) {
      setMessage(err?.message ?? 'Kesalahan tidak terduga.')
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

            {/* Header */}
            <div className="text-center mb-6">
              <h1 className="text-2xl sm:text-3xl font-extrabold">Create a new password</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Set a new password to secure your account.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4" autoComplete="off">

              {/* New Password */}
              <div>
                <label className="block text-sm font-medium mb-2">New password</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/70">
                    <Lock className="w-4 h-4" />
                  </span>

                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="
                      w-full pl-10 pr-10 py-3 rounded-lg bg-input border border-border/40 
                      text-sm
                      focus:outline-none focus:ring-1 focus:ring-primary
                      hover:bg-input hover:border-border/40
                    "
                    placeholder="New password"
                    required
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/80 hover:text-muted-foreground/90"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-medium mb-2">Confirm password</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/70">
                    <Lock className="w-4 h-4" />
                  </span>

                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="
                      w-full pl-10 pr-10 py-3 rounded-lg bg-input border border-border/40 
                      text-sm
                      focus:outline-none focus:ring-1 focus:ring-primary
                      hover:bg-input hover:border-border/40
                    "
                    placeholder="Confirm password"
                    required
                  />

                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/80 hover:text-muted-foreground/90"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading || !token}
                className="
                  w-full py-3 rounded-lg 
                  bg-primary text-primary-foreground 
                  flex justify-center items-center gap-2 
                  disabled:opacity-60
                  hover:bg-primary/95
                "
              >
                {loading ? <Loader2 className="animate-spin w-4 h-4" /> : 'Set new password'}
              </button>
            </form>

            {/* Notification */}
            <div className="mt-4 text-sm text-center min-h-[1.25rem]">
              {message && (
                <p className={success ? 'text-green-500' : 'text-red-500'}>{message}</p>
              )}
            </div>

            {/* Back to login */}
            <div className="text-center mt-6 text-sm">
              <p className="text-muted-foreground">
                Remember your password?{' '}
                <Link href="/login" className="text-primary hover:opacity-80">Sign in</Link>
              </p>
            </div>

          </div>
        </div>
      </div>
    </main>
  )
}
