// components/navbar-client.tsx
'use client'

import dynamic from 'next/dynamic'
import type React from 'react'
import { usePathname } from 'next/navigation'

// dynamic import Navbar (client only)
const Navbar = dynamic(
  () => import('./navbar').then((mod) => mod.Navbar as unknown as React.ComponentType),
  { ssr: false }
)

export default function NavbarClient() {
  const pathname = usePathname()

  // Hide navbar on specific routes
  const hideNavbarRoutes = ['/reset-password', '/auth/thank-you']

  // If the exact route matches, hide it
  if (hideNavbarRoutes.includes(pathname)) {
    return null
  }

  // Hide navbar for ALL auth routes (e.g., /auth/login, /auth/register, /auth/abc...)
  if (pathname.startsWith('/auth')) {
    return null
  }

  return <Navbar />
}
