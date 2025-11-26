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

  return (
      <main className="min-h-screen bg-background text-foreground">
        <Navbar />
  
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
  
          {/* =====================================
              1. HEADER SECTION
              Logic: Jika loading -> Skeleton Header. Jika tidak -> Real Header.
             ====================================== */}
          {loading ? (
            // Skeleton Header (Otomatis ada margin bottom dari komponennya)
            <SkeletonLoader type="page-header" />
          ) : (
            // Real Header
            <div className="text-center md:text-left mb-10">
              <h1 className="text-3xl md:text-4xl font-bold mb-2">
                Top Trending Anime
              </h1>
              <p className="text-muted-foreground">
                Top 50 highest rated anime on FeinimeList right now
              </p>
            </div>
          )}
  
          {/* =====================================
              2. CONTENT SECTION (GRID)
              Logic: Loading -> Skeleton Grid. Selesai -> Real Grid / Error / Empty.
             ====================================== */}
          {loading ? (
            
            /* HANYA Skeleton Grid (Jangan masukkan header lagi disini) */
            <SkeletonLoader type="popular" count={12} />
            
          ) : error ? (
            
            /* Error State */
            <div className="text-center py-20 bg-secondary/20 rounded-xl border border-dashed border-border">
              <p className="text-red-500">{error}</p>
            </div>

          ) : limitedAnimes.length > 0 ? (
            
            /* Real Grid Content */
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
              {limitedAnimes.map((anime, index) => (
                <AnimeCard key={anime.mal_id} anime={anime} rank={index + 1} />
              ))}
            </div>
  
          ) : (
            
            /* Empty State */
            <div className="text-center py-20 bg-secondary/20 rounded-xl border border-dashed border-border">
              <p className="text-muted-foreground">No trending anime found</p>
            </div>
          )}
  
        </div>
      <Footer />
    </main>
  )
}
