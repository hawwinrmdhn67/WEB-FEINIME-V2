'use client'

import { useState, useEffect } from 'react'
import { Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    // Placeholder dengan ukuran yang pas agar tidak layout shift
    return <div className="w-10 h-10" />
  }

  return (
    <button
      onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
      // Style disamakan dengan tombol Search & User:
      // p-2: padding standar
      // rounded-lg: sudut tumpul
      // hover:bg-secondary: efek hover ghost
      className="p-2 rounded-lg hover:bg-secondary transition-colors text-foreground flex items-center justify-center"
      title={resolvedTheme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      aria-label="Toggle theme"
    >
      {resolvedTheme === 'dark' ? (
        // Matahari: Mobile 24px (w-6), Desktop 20px (w-5)
        <Sun className="w-6 h-6 md:w-5 md:h-5" />
      ) : (
        // Bulan: Mobile 24px (w-6), Desktop 20px (w-5)
        <Moon className="w-6 h-6 md:w-5 md:h-5" />
      )}
    </button>
  )
}