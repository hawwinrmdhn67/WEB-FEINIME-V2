'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Lock, Eye, EyeOff, Loader2 } from 'lucide-react'

export default function ResetPasswordPage() {
  const router = useRouter()

  const [token, setToken] = useState<string | null>(null)
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [type, setType] = useState<'error' | 'success' | null>(null)

  // Parse token from query OR hash
  useEffect(() => {
    if (typeof window === 'undefined') return

    const url = new URL(window.location.href)
    let at = url.searchParams.get('access_token')

    // If token in hash (#access_token=...)
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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setMessage(null)
    setType(null)

    if (!token) {
      setMessage('Token not found in URL.')
      setType('error')
      return
    }

    if (password.length < 6) {
      setMessage('Password must be at least 6 characters.')
      setType('error')
      return
    }

    if (password !== confirmPassword) {
      setMessage('Passwords do not match.')
      setType('error')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password })
      })

      const data = await res.json()

      if (!res.ok) {
        setMessage(data.error || 'Failed to update password.')
        setType('error')
        return
      }

      setMessage('Password updated successfully! Redirecting...')
      setType('success')

      setTimeout(() => router.push('/login'), 1200)
    } catch (err: any) {
      setMessage('Unexpected error occurred.')
      setType('error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-background text-foreground flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-card border border-border/50 rounded-2xl shadow p-6 sm:p-8">
        <h1 className="text-2xl font-bold text-center mb-2">Create a new password</h1>
        <p className="text-center text-sm text-muted-foreground mb-6">
          Set a new password for your account.
        </p>

        {!token && (
          <div className="mb-4 text-sm text-red-500">
            No reset token found. Open the full link from your email.
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4" autoComplete="off">
          {/* Password field */}
          <div>
            <label className="block text-sm font-medium mb-2">New password</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-3 flex items-center text-muted-foreground">
                <Lock className="w-4 h-4" />
              </span>

              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-10 py-3 border rounded-lg bg-input text-sm"
                placeholder="New password"
                required
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 inset-y-0 flex items-center text-muted-foreground"
              >
                {showPassword ? <EyeOff /> : <Eye />}
              </button>
            </div>
          </div>

          {/* Confirm */}
          <div>
            <label className="block text-sm font-medium mb-2">Confirm password</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-3 flex items-center text-muted-foreground">
                <Lock className="w-4 h-4" />
              </span>

              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full pl-10 pr-10 py-3 border rounded-lg bg-input text-sm"
                placeholder="Confirm password"
                required
              />

              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 inset-y-0 flex items-center text-muted-foreground"
              >
                {showConfirmPassword ? <EyeOff /> : <Eye />}
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading || !token}
            className="w-full py-3 bg-primary text-primary-foreground rounded-lg flex justify-center items-center gap-2 disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin w-4 h-4" /> : 'Set new password'}
          </button>
        </form>

        {message && (
          <div className={`mt-4 text-center text-sm ${
            type === 'error' ? 'text-red-500' : 'text-green-500'
          }`}>
            {message}
          </div>
        )}

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Back to <span className="text-primary cursor-pointer" onClick={() => router.push('/login')}>Sign in</span>
        </p>

        {/* Debug */}
        <div className="mt-6 p-3 border rounded bg-gray-50 text-xs text-gray-600">
          <b>Debug</b><br />
          token: {token ?? '—'}
        </div>
      </div>
    </main>
  )
}
