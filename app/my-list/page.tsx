'use client'

import { useState, useEffect } from 'react'
import { Navbar } from '@/components/navbar'
import dynamic from 'next/dynamic'
import { SkeletonLoader } from '@/components/skeleton-loader'
import { Anime } from '@/lib/api'
import { useAnimeList } from '@/app/context/AnimeListContext'

interface AnimeCardProps {
  anime: Anime
}

const AnimeCard = dynamic<AnimeCardProps>(
  () => import('@/components/anime-card').then(mod => mod.AnimeCard),
  { ssr: false }
)

export default function MyListPage() {
  const { myList } = useAnimeList()
  const [animeList, setAnimeList] = useState<Anime[]>([])
  const [loading, setLoading] = useState(true)

  const fetchAnimeData = async () => {
    setLoading(true)
    try {
      // Filter hanya yang statusnya 'Plan to Watch' (atau sesuaikan logika Anda)
      // Jika ingin menampilkan SEMUA yang ada di myList, hapus .filter(...)
      const planToWatch = myList // .filter(a => a.status === 'Plan to Watch') 
      
      const promises = planToWatch.map(a =>
        fetch(`https://api.jikan.moe/v4/anime/${a.mal_id}`).then(res => res.json())
      )
      const results = await Promise.all(promises)
      const fullAnimeList: Anime[] = results.map(r => r.data).filter(Boolean) // Filter undefined jika ada error fetch
      setAnimeList(fullAnimeList)
    } catch (err) {
      console.error(err)
      setAnimeList([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAnimeData()
  }, [myList])

  return (
  <main className="min-h-screen bg-background text-foreground flex flex-col">
    <Navbar />

    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-1 w-full">
      
      {/* HEADER: Loading vs Content */}
      <div className="mb-10 text-center md:text-left">
        {loading ? (
           <SkeletonLoader type="page-header" />
        ) : (
          <>
            {/* Mengubah mb-3 jadi mb-2 */}
            <h1 className="text-3xl md:text-4xl font-bold mb-2">
              My List
            </h1>
            {/* Menghapus 'text-base md:text-lg' agar ukuran font kembali normal (seperti trending) */}
            <p className="text-muted-foreground">
              Your personal anime watchlist track progress and manage favorites
            </p>
          </>
        )}
      </div>

      {/* GRID */}
      {loading ? (
        <SkeletonLoader type="popular" count={12} />
      ) : animeList.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
          {animeList.map(anime => (
            <AnimeCard key={anime.mal_id} anime={anime} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-secondary/20 rounded-xl border border-dashed border-border flex flex-col items-center justify-center h-64">
          <p className="text-muted-foreground text-lg font-medium">
            No anime in your list
          </p>
          <p className="text-sm text-muted-foreground/60 mt-1">
            Start adding anime to track your progress!
          </p>
        </div>
      )}
    </div>


      {/* Footer - Sekarang akan selalu di bawah karena parentnya flex-col dan konten di atasnya flex-1 */}
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