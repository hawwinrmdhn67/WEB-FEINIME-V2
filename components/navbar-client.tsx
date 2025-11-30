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
  
  if (pathname === '/reset-password') {
    return null
  }

  return <Navbar />
}
