'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Navbar } from '@/components/navbar'
import { Bookmark, Share2, Clock, LayoutGrid } from 'lucide-react'

// =========================
// DATA MOCK AKTIVITAS
// =========================
interface ActivityItem {
  id: number
  type: 'add' | 'share'
  title: string
  date: string
}

const mockAllActivities: ActivityItem[] = [
  { id: 54109, type: 'add', title: 'Sousou no Frieren', date: '2 jam lalu' },
  { id: 51009, type: 'share', title: 'Jujutsu Kaisen Season 2', date: '1 hari lalu' },
  { id: 51439, type: 'add', title: 'Solo Leveling', date: '5 hari lalu' },
  { id: 21, type: 'share', title: 'One Piece', date: '2 minggu lalu' },
  { id: 41467, type: 'add', title: 'Bleach: TYBW', date: '3 minggu lalu' },
]

const activityFilters = [
  { id: 'all', label: 'Semua', icon: LayoutGrid },
  { id: 'add', label: 'Disimpan', icon: Bookmark },
  { id: 'share', label: 'Dibagikan', icon: Share2 },
]

// =========================
// Helper untuk ikon & warna
// =========================
const getActivityStyle = (type: string) => {
  switch (type) {
    case 'add':
      return { icon: Bookmark, color: 'text-green-500', bg: 'bg-green-500/10', text: 'Menyimpan' }
    case 'share':
      return { icon: Share2, color: 'text-blue-500', bg: 'bg-blue-500/10', text: 'Membagikan' }
    default:
      return { icon: Clock, color: 'text-gray-500', bg: 'bg-gray-500/10', text: 'Aktivitas' }
  }
}

// =========================
// KOMPONEN UTAMA
// =========================
export default function MyActivityPage() {
  const [filter, setFilter] = useState('all')

  const filteredActivities =
    filter === 'all'
      ? mockAllActivities
      : mockAllActivities.filter(item => item.type === filter)

  return (
    <main className="min-h-screen bg-background text-foreground flex flex-col">
      <Navbar />

      <div className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 py-12 w-full">
        {/* Header */}
        <div className="mb-8 border-b border-border pb-6">
          <h1 className="text-3xl font-bold mb-2 tracking-tight">Riwayat Aktivitas</h1>
          <p className="text-muted-foreground">
            Jejak interaksi Anda di Feinime, mulai dari menyimpan hingga membagikan anime.
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-2 mb-8 border-b border-border pb-3 overflow-x-auto">
          {activityFilters.map(tab => {
            const isActive = filter === tab.id
            const Icon = tab.icon

            return (
              <button
                key={tab.id}
                onClick={() => setFilter(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all border whitespace-nowrap ${
                  isActive
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-card text-muted-foreground border-border hover:bg-secondary'
                }`}
              >
                <Icon size={16} /> {tab.label}
              </button>
            )
          })}
        </div>

        {/* Timeline List */}
        <div className="space-y-4 relative before:absolute before:left-6 before:top-4 before:bottom-4 before:w-[1px] before:bg-border before:content-['']">
          {filteredActivities.length > 0 ? (
            filteredActivities.map(item => {
              const style = getActivityStyle(item.type)
              const Icon = style.icon

              return (
                <div key={item.id} className="relative pl-16 group">
                  {/* Connector Dot */}
                  <div
                    className={`absolute left-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full flex items-center justify-center border-2 border-background ${style.bg} ${style.color} z-10`}
                  >
                    <div className="scale-75">
                      <Icon size={16} />
                    </div>
                  </div>

                  {/* Card */}
                  <div className="bg-card border border-border rounded-lg p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:shadow-sm transition-shadow">
                    <div>
                      <span className={`text-xs font-bold uppercase tracking-wider mb-1 block ${style.color}`}>
                        {style.text}
                      </span>
                      <Link
                        href={`/anime/${item.id}`}
                        className="font-medium text-foreground group-hover:text-primary transition-colors"
                      >
                        {item.title}
                      </Link>
                    </div>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock size={12} /> {item.date}
                    </span>
                  </div>
                </div>
              )
            })
          ) : (
            <div className="pl-16 py-10 text-muted-foreground italic">
              Tidak ada aktivitas ditemukan untuk kategori ini
            </div>
          )}
        </div>

        {/* Load More */}
        {filteredActivities.length > 0 && (
          <div className="mt-10 text-center pl-12">
            <button className="px-6 py-2 text-sm font-medium border border-border rounded-full hover:bg-secondary transition-colors">
              Muat Lebih Banyak
            </button>
          </div>
        )}
      </div>
      {/* Footer */}
      <footer className="border-t border-border bg-card mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">

          <div className="flex flex-col md:flex-row justify-between items-center md:items-start gap-6 md:gap-12">

            {/* Brand */}
            <div className="text-center md:text-left">
              <span className="font-bold text-xl tracking-tight">Feinime</span>
            </div>

            {/* Navigation Links */}
            <nav className="flex flex-wrap justify-center md:justify-start gap-4 md:gap-6 text-sm text-muted-foreground">
              {['Home', 'Popular', 'Trending', 'About', 'Contact', 'FAQ'].map((item) => (
                <a
                  key={item}
                  href="#"
                  className="hover:text-primary transition-colors"
                >
                  {item}
                </a>
              ))}
            </nav>

            {/* Social Icons */}
            <div className="flex justify-center md:justify-start items-center gap-4">
              {/* Twitter */}
              <a href="#" className="text-muted-foreground hover:text-[#1DA1F2] transition-colors">
                <span className="sr-only">Twitter</span>
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M23.954 4.569c-.885.389-1.83.654-2.825.775 1.014-.611 1.794-1.574 2.163-2.723-.951.564-2.005.974-3.127 1.195-.897-.955-2.178-1.55-3.594-1.55-2.717 0-4.92 2.204-4.92 4.917 0 .39.045.765.127 1.124-4.087-.205-7.72-2.164-10.148-5.144-.424.722-.666 1.561-.666 2.475 0 1.708.87 3.214 2.188 4.099-.807-.025-1.566-.248-2.229-.616v.061c0 2.385 1.693 4.374 3.946 4.827-.413.111-.849.171-1.296.171-.314 0-.615-.03-.916-.086.631 1.953 2.445 3.376 4.604 3.416-1.68 1.319-3.809 2.105-6.102 2.105-.396 0-.779-.023-1.158-.067 2.189 1.402 4.768 2.217 7.548 2.217 9.051 0 14-7.496 14-13.986 0-.21 0-.42-.015-.63 1.009-.73 1.884-1.64 2.584-2.675z" />
                </svg>
              </a>

              {/* Discord */}
              <a href="#" className="text-muted-foreground hover:text-[#5865F2] transition-colors">
                <span className="sr-only">Discord</span>
                <svg className="w-5 h-5" viewBox="0 0 71 55" fill="currentColor">
                  <path d="M60.1 4.55A59 59 0 0 0 46.92 0c-.65 1.14-1.39 2.59-1.9 3.74a42 42 0 0 0-17 0C27.5 2.6 26.76 1.15 26.1 0A58.8 58.8 0 0 0 10.9 4.55C2.68 19.28.08 33.43 1.3 47.36c11.04 8.16 21.56 6.06 21.56 6.06 1.44-1.84 2.56-3.78 3.44-5.7-6.16-1.84-8.52-4.52-8.52-4.52.72.48 1.44.92 2.16 1.3 4.92 2.52 10.12 3.78 15.44 3.78s10.52-1.26 15.44-3.78c.72-.38 1.44-.82 2.16-1.3 0 0-2.36 2.68-8.52 4.52.88 1.92 2 3.86 3.44 5.7 0 0 10.52 2.1 21.56-6.06 1.22-13.92-1.38-28.07-9.6-42.8ZM24.76 37.34c-3.12 0-5.68-2.82-5.68-6.28 0-3.46 2.52-6.28 5.68-6.28 3.18 0 5.74 2.82 5.68 6.28 0 3.46-2.5 6.28-5.68 6.28Zm21.48 0c-3.12 0-5.68-2.82-5.68-6.28 0-3.46 2.52-6.28 5.68-6.28 3.18 0 5.74 2.82 5.68 6.28 0 3.46-2.5 6.28-5.68 6.28Z" />
                </svg>
              </a>
            </div>

          </div>

          <div className="border-t border-border mt-8 pt-6 text-center text-muted-foreground text-sm">
            <p>Feinime © 2025. All rights reserved.</p>
          </div>

        </div>
      </footer>
    </main>
  )
}
