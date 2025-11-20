import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { ThemeProvider } from '@/components/theme-provider'
import './globals.css'

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'Feinime',
  description: 'thousands of anime with Feinime. Experience modern UI with advanced search, filters, and personalized recommendations.',
  generator: 'v0.app',
  icons: {
    icon: '/feinime.jpg', // satu logo dari public/logo.png
    apple: '/feinime.jpg', // juga bisa digunakan untuk Apple
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
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
