// app/layout.tsx
import type { Metadata } from 'next'
import NavbarClient from '@/components/navbar-client'
import { Geist, Geist_Mono } from 'next/font/google'
import { ThemeProvider } from '@/components/theme-provider'
import './globals.css'
import { AnimeListProvider } from './context/AnimeListContext'

// import auth callback handler (client component that handles OAuth fragment)
import AuthCallbackHandler from '@/components/auth-callback-handler'
import type React from 'react'

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'Feinime',
  description: 'thousands of anime with Feinime. Experience modern UI with advanced search, filters, and personalized recommendations.',
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
      <body className={`font-sans antialiased bg-background text-foreground`}>
        <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
        >
          {/* global auth callback handler — akan memproses fragment token saat redirect */}
          <AuthCallbackHandler />

          {/* Navbar client-only (rendered only on client to avoid SSR->hydration flicker) */}
          <div className="fixed top-0 left-0 w-full z-50">
            <NavbarClient />
          </div>

          <AnimeListProvider>
            {children}
          </AnimeListProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
