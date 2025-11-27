'use client'

import { useState, useEffect } from 'react'
import { getAnimeByGenre, Anime } from '@/lib/api'
import { malGenres, Genre } from '@/lib/genres'
import { Navbar } from '@/components/navbar'
import dynamic from 'next/dynamic'
import { SkeletonLoader } from '@/components/skeleton-loader'
import { Footer } from '@/components/feinime-footer'

interface AnimeCardProps {
  anime: Anime
}

const AnimeCard = dynamic<AnimeCardProps>(
  () => import('@/components/anime-card').then(mod => mod.AnimeCard),
  { ssr: false }
)

export default function GenresPage() {
  // OPTIMALISASI 1: Inisialisasi state genres dan selectedGenre di luar useEffect.
  const [genres, setGenres] = useState<Genre[]>(malGenres)
  const [selectedGenre, setSelectedGenre] = useState<number | null>(
    malGenres.length > 0 ? malGenres[0].mal_id : null
  )
  
  const [animes, setAnimes] = useState<Anime[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingFooter, setLoadingFooter] = useState(true) // NEW

  useEffect(() => {
    if (!selectedGenre) return
    const fetchByGenre = async () => {
      setLoading(true)
      try {
        const res = await getAnimeByGenre(selectedGenre)
        setAnimes(res.data || [])
      } catch (error) {
        console.error("Failed to fetch anime by genre:", error)
        setAnimes([])
      } finally {
        setLoading(false)
      }
    }
    fetchByGenre()
  }, [selectedGenre])

  // Turn off footer skeleton after main loading finished
  useEffect(() => {
    if (!loading) {
      const t = setTimeout(() => setLoadingFooter(false), 120)
      return () => clearTimeout(t)
    }
  }, [loading])

  const currentGenreName = genres.find(g => g.mal_id === selectedGenre)?.name

  return (
    <main className="min-h-screen bg-background text-foreground flex flex-col">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-1 w-full">

        {/* HEADER: Loading vs Content */}
        {loading ? (
          <SkeletonLoader type="page-header" />
        ) : (
          <div className="text-center md:text-left mb-10">
             <h1 className="text-3xl md:text-4xl font-bold mb-3">Browse by Genre</h1>
             <p className="text-muted-foreground text-base md:text-lg">
               Explore anime series categorized by your favorite genres
             </p>
          </div>
        )}

        {/* GENRE BUTTONS */}
        {loading ? (
          <div className="flex flex-wrap gap-2 mb-12">
            {[...Array(42)].map((_, i) => (
              <div
                key={i}
                className="h-8 w-20 bg-muted animate-pulse rounded-full"
              ></div>
            ))}
          </div>
        ) : (
          <div className="mb-12 flex flex-wrap gap-2">
            {genres.map((genre) => {
              const isSelected = selectedGenre === genre.mal_id
              return (
                <button
                  key={genre.mal_id}
                  onClick={() => setSelectedGenre(genre.mal_id)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ease-out border ${
                    isSelected
                      ? 'bg-primary border-primary text-primary-foreground shadow-md scale-105'
                      : 'bg-card border-border text-muted-foreground hover:border-primary/50 hover:text-foreground hover:bg-secondary/50'
                  }`}
                >
                  {genre.name}
                </button>
              )
            })}
          </div>
        )}

        {/* CONTENT */}
        {loading ? (
          <>
            <div className="h-6 w-44 bg-muted animate-pulse rounded mb-6"></div>
            <SkeletonLoader type="genres" count={12} />
          </>
        ) : animes.length > 0 ? (
          <>
            {/* Genre Name Title */}
            <h2 className="text-2xl font-semibold mb-6">{currentGenreName} Anime</h2>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
              {animes.map(anime => (
                <AnimeCard key={anime.mal_id} anime={anime} />
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-20 bg-secondary/20 rounded-xl border border-dashed border-border">
            <p className="text-muted-foreground">No anime found for this genre</p>
          </div>
        )}
      </div>

      {/* FOOTER / SKELETON FOOTER */}
      {loadingFooter ? <SkeletonLoader type="footer" /> : <Footer />}
    </main>
  )
}
