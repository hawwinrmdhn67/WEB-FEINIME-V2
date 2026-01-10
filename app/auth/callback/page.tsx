'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

function parseHashFragment(hash: string) {
  if (!hash) return {} as Record<string, string>
  const trimmed = hash.startsWith('#') ? hash.slice(1) : hash
  return Object.fromEntries(
    trimmed
      .split('&')
      .map(part => part.split('=').map(decodeURIComponent))
      .filter(pair => pair.length === 2) as [string, string][]
  ) as Record<string, string>
}

export default function SupabaseOAuthCallbackPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function handleCallback() {
      try {
        const url = new URL(window.location.href)

        const code = url.searchParams.get('code')
        if (code) {
          const { data, error } = await supabase.auth.exchangeCodeForSession(code)
          if (error) throw error

          const redirect = url.searchParams.get('redirect') || '/'
          window.history.replaceState({}, document.title, url.pathname)
          router.replace(redirect)
          return
        }

        const fragment = window.location.hash
        if (fragment && fragment.includes('access_token')) {
          const parsed = parseHashFragment(fragment)
          const access_token = parsed['access_token']
          const refresh_token = parsed['refresh_token']

          if (!access_token) throw new Error('No access_token found in callback URL')

          const payload = {
            access_token,
            refresh_token: refresh_token ?? ''
          } as { access_token: string; refresh_token: string }

          const { data, error } = await supabase.auth.setSession(payload)
          if (error) throw error

          window.history.replaceState({}, document.title, url.pathname + url.search)
          const redirect = url.searchParams.get('redirect') || '/'
          router.replace(redirect)
          return
        }

        router.replace('/')
      } catch (err: any) {
        console.error('OAuth callback error:', err)
        setError(err?.message ?? String(err))
      } finally {
        setLoading(false)
      }
    }

    handleCallback()
  }, [router])

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <p className="mb-2">Processing login…</p>
        <div className="loader" aria-hidden />
      </div>
    </div>
  )

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="max-w-lg text-center">
        {error ? (
          <>
            <h1 className="text-2xl font-semibold">Login error</h1>
            <p className="mt-2 text-sm text-muted-foreground">{error}</p>
            <button
              className="mt-4 inline-flex items-center px-4 py-2 rounded-md border"
              onClick={() => router.replace('/login')}
            >
              Back to login
            </button>
          </>
        ) : (
          <>
            <h1 className="text-2xl font-semibold">Done</h1>
            <p className="mt-2 text-sm text-muted-foreground">You should be redirected shortly.</p>
          </>
        )}
      </div>
    </div>
  )
}
