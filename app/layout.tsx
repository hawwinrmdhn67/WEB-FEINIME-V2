import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { ThemeProvider } from '@/components/theme-provider'
import './globals.css'
// Import Provider baru
import { AnimeListProvider } from './context/AnimeListContext'

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'Feinime',
  description: 'thousands of anime with Feinime. Experience modern UI with advanced search, filters, and personalized recommendations.',
  generator: 'v0.app',
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
        {/* 1. Provider Paling Luar (Tema) */}
        <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
        >
          {/* 2. Provider Data Anime (Di dalam ThemeProvider) */}
          <AnimeListProvider>
            
            {/* 3. Halaman Website (Di dalam AnimeListProvider) */}
            {children}
            
          </AnimeListProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}