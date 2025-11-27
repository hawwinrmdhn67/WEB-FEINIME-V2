'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Navbar } from '@/components/navbar'
import { getSeasonUpcoming, Anime } from '@/lib/api' 
import { Calendar, Clapperboard, Clock, Tv } from 'lucide-react'
import dynamic from 'next/dynamic'
import { SkeletonLoader } from '@/components/skeleton-loader'
import { Footer } from '@/components/feinime-footer'

// Card Props
interface AnimeCardProps {
  anime: Anime
}

const AnimeCard = dynamic<AnimeCardProps>(
  () => import('@/components/anime-card').then(mod => mod.AnimeCard),
  { ssr: false }
)

export default function UpcomingPage() {
  const [animes, setAnimes] = useState<Anime[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingFooter, setLoadingFooter] = useState(true) // 🆕 FOOTER LOADING

  useEffect(() => {
    const fetchUpcoming = async () => {
      setLoading(true)
      try {
        const data = await getSeasonUpcoming()
        const rawData = data.data || []

        const uniqueData = Array.from(
          new Map(rawData.map((item: Anime) => [item.mal_id, item])).values()
        )

        const safeData = uniqueData.filter((item: Anime) =>
          !item.genres?.some(g => g.name === 'Hentai')
        )

        // Max 50 (fix)
        setAnimes(safeData.slice(0, 50))

      } catch (err) {
        console.error('Failed to fetch upcoming anime', err)
        setAnimes([])
      } finally {
        setLoading(false)
      }
    }

    fetchUpcoming()
  }, [])

  // 🆕 Matikan skeleton footer setelah loading selesai
  useEffect(() => {
    if (!loading) {
      const t = setTimeout(() => setLoadingFooter(false), 120)
      return () => clearTimeout(t)
    }
  }, [loading])

  return (
    <main className="min-h-screen bg-background text-foreground flex flex-col">
      <Navbar />

      <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">

        {/* HEADER */}
        {loading ? (
          <SkeletonLoader type="page-header" />
        ) : (
          <div className="text-center md:text-left mb-10 border-b border-border/40 pb-6">
            <h1 className="text-3xl md:text-4xl font-bold mb-2 tracking-tight text-primary flex items-center gap-2 justify-center md:justify-start">
              Upcoming Anime
            </h1>
            <p className="text-muted-foreground">
              Discover the most anticipated anime series coming next season
            </p>
          </div>
        )}

        {/* GRID CONTENT */}
        {loading ? (
          <SkeletonLoader type="popular" count={12} />
        ) : animes.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
            {animes.map((anime) => (
              <AnimeCard key={anime.mal_id} anime={anime} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-secondary/20 rounded-xl border border-dashed border-border">
            <p className="text-muted-foreground">No upcoming anime found</p>
          </div>
        )}

      </div>

      {/* 🆕 FOOTER: Skeleton → Real Footer */}
      {loadingFooter ? <SkeletonLoader type="footer" /> : <Footer />}
    </main>
  )
}
