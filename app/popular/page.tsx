'use client'

import { useState, useEffect } from 'react'
import { getPopularAnime, Anime } from '@/lib/api'
import { Navbar } from '@/components/navbar'
import dynamic from 'next/dynamic'
import { SkeletonLoader } from '@/components/skeleton-loader'
import { Footer } from '@/components/feinime-footer'

interface AnimeCardProps {
  anime: Anime
  // rank?: number // Prop rank tidak lagi diperlukan/digunakan
}

const AnimeCard = dynamic<AnimeCardProps>(
  () => import('@/components/anime-card').then(mod => mod.AnimeCard),
  { ssr: false }
)

export default function PopularPage() {
  const [animes, setAnimes] = useState<Anime[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPopular = async () => {
      setLoading(true)
      try {
        const data = await getPopularAnime()
        setAnimes(data.data || [])
      } catch (err) {
        console.error('Failed to fetch popular anime', err)
        setAnimes([])
      } finally {
        setLoading(false)
      }
    }
    fetchPopular()
  }, [])

  return (
  <main className="min-h-screen bg-background text-foreground">
    <Navbar />

    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

      {/* HEADER: Loading vs Content */}
      {loading ? (
        <SkeletonLoader type="page-header" />
      ) : (
        <div className="text-center md:text-left mb-10">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            Popular Anime
          </h1>
          <p className="text-muted-foreground">
            Explore the most popular anime series right now
          </p>
        </div>
      )}

      {/* CONTENT */}
      {loading ? (
        <SkeletonLoader type="popular" count={12} />
      ) : animes.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
          {animes.map((anime, index) => (
            <AnimeCard key={anime.mal_id} anime={anime} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-secondary/20 rounded-xl border border-dashed border-border">
          <p className="text-muted-foreground">No popular anime found</p>
        </div>
      )}
     </div>
    <Footer />
  </main>
  )
}