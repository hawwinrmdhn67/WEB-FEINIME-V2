'use client'

import { useEffect, useState } from 'react'
import { getAnimeByGenre, Anime } from '@/lib/api'
import { malGenres, Genre } from '@/lib/genres'
import { Navbar } from '@/components/navbar'
import { AnimeCard } from '@/components/anime-card'
import { SkeletonLoader } from '@/components/skeleton-loader'
import { Footer } from '@/components/feinime-footer'
import { ChevronLeft, ChevronRight } from 'lucide-react'

const MAX_PAGE = 10

const glassButtonStyle = `
  flex items-center gap-2
  px-4 py-2 rounded-full text-sm font-medium
  border transition-all duration-200
  backdrop-blur-sm

  bg-card
  text-foreground
  border-border

  hover:bg-primary
  hover:text-primary-foreground
  hover:border-primary

  dark:hover:bg-primary
`

export default function GenresPage() {
  const [genres] = useState<Genre[]>(malGenres)

  // max 3 genres
  const [selectedGenres, setSelectedGenres] = useState<number[]>(
    malGenres[0] ? [malGenres[0].mal_id] : []
  )

  const [page, setPage] = useState(1)
  const [animes, setAnimes] = useState<Anime[]>([])

  // loading dipisah
  const [loadingPage, setLoadingPage] = useState(true)
  const [loadingGrid, setLoadingGrid] = useState(true)

  const toggleGenre = (genreId: number) => {
    setPage(1)
    setSelectedGenres(prev => {
      if (prev.includes(genreId)) return prev.filter(id => id !== genreId)
      if (prev.length >= 3) return prev
      return [...prev, genreId]
    })
  }

  useEffect(() => {
    const fetchData = async () => {
      setLoadingPage(true)
      setLoadingGrid(true)

      try {
        const res = await getAnimeByGenre(
          selectedGenres.join(','),
          page
        )
        setAnimes(res.data || [])
      } catch {
        setAnimes([])
      } finally {
        setLoadingGrid(false)
        setLoadingPage(false)
      }
    }

    fetchData()
  }, [selectedGenres, page])

  const selectedNames = genres
    .filter(g => selectedGenres.includes(g.mal_id))
    .map(g => g.name)
    .join(', ')

  return (
    <main className="min-h-screen bg-background text-foreground flex flex-col">
      <Navbar />

      <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">

        {/* HEADER */}
        {loadingPage ? (
          <SkeletonLoader type="page-header" />
        ) : (
          <div className="text-center md:text-left mb-10">
            <h1 className="text-3xl md:text-4xl font-bold mb-3">
              Browse by Genre
            </h1>
            <p className="text-muted-foreground">
              Select up to 3 genres
            </p>
          </div>
        )}

        {/* GENRE BUTTONS */}
        {loadingPage ? (
          <div className="mb-12 flex flex-wrap gap-2">
            {Array.from({ length: 36 }).map((_, i) => (
              <div
                key={i}
                className="h-9 w-24 rounded-full bg-muted animate-pulse"
              />
            ))}
          </div>
        ) : (
          <div className="mb-12 flex flex-wrap gap-2">
            {genres.map(genre => {
              const isSelected = selectedGenres.includes(genre.mal_id)
              const isDisabled = !isSelected && selectedGenres.length >= 3

              return (
                <button
                  key={genre.mal_id}
                  onClick={() => toggleGenre(genre.mal_id)}
                  disabled={isDisabled}
                  className={`
                    ${glassButtonStyle}

                    ${isSelected
                      ? 'bg-primary text-primary-foreground border-primary shadow-md'
                      : ''
                    }

                    ${isDisabled
                      ? 'opacity-40 cursor-not-allowed hover:bg-card hover:text-foreground'
                      : ''
                    }
                  `}
                >
                  {genre.name}
                </button>
              )
            })}
          </div>
        )}

        {/* GRID */}
        {loadingGrid ? (
          <>
            <div className="h-6 w-52 bg-muted animate-pulse rounded mb-6" />
            <SkeletonLoader type="genres" count={12} />
          </>
        ) : (
          <>
            <h2 className="text-2xl font-semibold mb-6">
              {selectedNames} Anime
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
              {animes.map(anime => (
                <AnimeCard key={anime.mal_id} anime={anime} />
              ))}
            </div>
          </>
        )}

        {/* ✅ PAGINATION — SELALU RENDER (FIRST LOAD AMAN) */}
        <div className="flex justify-center items-center gap-4 mt-12">
          {loadingGrid ? (
            <>
              <div className="h-10 w-24 rounded-md bg-muted animate-pulse" />
              <div className="h-4 w-20 rounded bg-muted animate-pulse" />
              <div className="h-10 w-24 rounded-md bg-muted animate-pulse" />
            </>
          ) : (
            <>
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className={`flex items-center px-4 py-2 rounded-md border ${glassButtonStyle}
                  disabled:opacity-40 disabled:cursor-not-allowed`}
              >
                <ChevronLeft size={18} />
                Prev
              </button>

              <span className="text-sm text-muted-foreground">
                Page {page} / {MAX_PAGE}
              </span>

              <button
                onClick={() => setPage(p => Math.min(MAX_PAGE, p + 1))}
                disabled={page === MAX_PAGE || animes.length === 0}
                className={`flex items-center px-4 py-2 rounded-md border ${glassButtonStyle}
                  disabled:opacity-40 disabled:cursor-not-allowed`}
              >
                Next
                <ChevronRight size={18} />
              </button>
            </>
          )}
        </div>
      </div>

      {loadingPage ? <SkeletonLoader type="footer" /> : <Footer />}
    </main>
  )
}
  