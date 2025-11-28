// components/navbar-client.tsx
'use client'

import dynamic from 'next/dynamic'
import type React from 'react'

// dynamic import Navbar and map named export (client-only)
const Navbar = dynamic(
  () => import('./navbar').then((mod) => mod.Navbar as unknown as React.ComponentType),
  { ssr: false }
)

export default function NavbarClient() {
  return <Navbar />
}
