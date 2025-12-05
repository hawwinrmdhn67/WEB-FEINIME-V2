// app/auth/thank-you/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { CheckCircle } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { getBrowserSupabase } from '@/lib/supabaseClient'

export default function ThankYouPage() {
  const [loading, setLoading] = useState(true)
  const [verified, setVerified] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const checkVerification = async () => {
      const supabase = getBrowserSupabase()

      if (!supabase) {
        setLoading(false)
        setVerified(false)
        return
      }

      const { data } = await supabase.auth.getUser()
      setLoading(false)

      if (data?.user && data.user.email_confirmed_at) {
        setVerified(true)
      }
    }

    checkVerification()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen text-black dark:text-white">
        Checking verification...
      </div>
    )
  }

  if (!verified) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-black dark:text-white">
        <p className="text-xl font-medium mb-2">Verification Failed</p>
        <p className="text-sm opacity-70 mb-4">Your email is not verified yet.</p>

        <Link
          href="/login"
          className="px-4 py-2 bg-black text-white dark:bg-white dark:text-black rounded-lg transition"
        >
          Back to Login
        </Link>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-black dark:text-white px-6 text-center">
      <CheckCircle className="w-20 h-20 text-green-600 dark:text-green-400 mb-4" />

      <h1 className="text-3xl font-bold mb-2">Thank You for Registering!</h1>
      <p className="text-lg opacity-70 mb-6">
        Your email has been successfully verified. You can now login to your account.
      </p>

      <Link
        href="/login"
        className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition"
      >
        Go to Login
      </Link>
    </div>
  )
}
