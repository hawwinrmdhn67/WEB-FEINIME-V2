'use client'

import dynamic from 'next/dynamic'
import type React from 'react'
import { usePathname } from 'next/navigation'

const Navbar = dynamic(
  () => import('./navbar').then((mod) => mod.Navbar as unknown as React.ComponentType),
  { ssr: false }
)

export default function NavbarClient() {
  const pathname = usePathname()
  const hideNavbarRoutes = ['/reset-password', '/auth/thank-you']
  if (hideNavbarRoutes.includes(pathname)) {
    return null
  }
  if (pathname.startsWith('/auth')) {
    return null
  }

  return <Navbar />
}
