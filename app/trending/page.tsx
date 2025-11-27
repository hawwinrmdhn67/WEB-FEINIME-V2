'use client'

import { useState, useEffect } from 'react'
import { getTopAnime, Anime } from '@/lib/api'
import { Navbar } from '@/components/navbar'
import dynamic from 'next/dynamic'
import { SkeletonLoader } from '@/components/skeleton-loader'
import { Footer } from '@/components/feinime-footer'

interface AnimeCardProps {
  anime: Anime
  rank?: number
}

const AnimeCard = dynamic<AnimeCardProps>(
  () => import('@/components/anime-card').then(mod => mod.AnimeCard),
  { ssr: false }
)

export default function TrendingPage() {
  const [animes, setAnimes] = useState<Anime[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [loadingFooter, setLoadingFooter] = useState(true) // NEW

  // Batasi top 50
  const maxItems = 50
  const limitedAnimes = animes.slice(0, maxItems)

  useEffect(() => {
    const fetchTrending = async () => {
      setLoading(true)
      try {
        const res = await getTopAnime()
        setAnimes(res.data || [])
        setError(null)
      } catch (err) {
        console.error(err)
        setError('Failed to fetch trending anime')
        setAnimes([])
      } finally {
        setLoading(false)
      }
    }

    fetchTrending()
  }, [])

  // NEW: hide footer skeleton after main loading finishes
  useEffect(() => {
    if (!loading) {
      const t = setTimeout(() => setLoadingFooter(false), 120) // small delay for smooth transition
      return () => clearTimeout(t)
    }
  }, [loading])

  return (
    <main className="min-h-screen bg-background text-foreground">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

        {/* 1. Header */}
        {loading ? (
          <SkeletonLoader type="page-header" />
        ) : (
          <div className="text-center md:text-left mb-10">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">
              Top Trending Anime
            </h1>
            <p className="text-muted-foreground">
              Top 50 highest rated anime on FeinimeList right now
            </p>
          </div>
        )}

        {/* 2. Content Grid */}
        {loading ? (
          <SkeletonLoader type="popular" count={12} />
        ) : error ? (
          <div className="text-center py-20 bg-secondary/20 rounded-xl border border-dashed border-border">
            <p className="text-red-500">{error}</p>
          </div>
        ) : limitedAnimes.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
            {limitedAnimes.map((anime, index) => (
              <AnimeCard key={anime.mal_id} anime={anime} rank={index + 1} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-secondary/20 rounded-xl border border-dashed border-border">
            <p className="text-muted-foreground">No trending anime found</p>
          </div>
        )}

      </div>

      {/* FOOTER / SKELETON FOOTER */}
      {loadingFooter ? <SkeletonLoader type="footer" /> : <Footer />}
    </main>
  )
}
