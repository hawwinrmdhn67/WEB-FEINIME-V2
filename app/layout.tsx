// app/layout.tsx
import type { Metadata } from 'next'
import NavbarClient from '@/components/navbar-client'
import { Geist, Geist_Mono } from 'next/font/google'
import { ThemeProvider } from '@/components/theme-provider'
import '@/styles/globals.css'
import { AnimeListProvider } from './context/AnimeListContext'
import AuthCallbackHandler from '@/components/auth-callback-handler'
import type React from 'react'

// ✅ TAMBAHAN
import { ScrollToTop } from '@/components/scroll-top'

const _geist = Geist({ subsets: ['latin'] })
const _geistMono = Geist_Mono({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Feinime',
  description:
    'thousands of anime with Feinime. Experience modern UI with advanced search, filters, and personalized recommendations.',
  icons: {
    icon: '/feinime.jpg',
    apple: '/feinime.jpg',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans antialiased bg-background text-foreground">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {/* ✅ AUTO SCROLL KE ATAS SAAT REFRESH */}
          <ScrollToTop />

          {/* global auth callback handler */}
          <AuthCallbackHandler />

          {/* Navbar client-only */}
            <NavbarClient />

          <AnimeListProvider>
            {children}
          </AnimeListProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
