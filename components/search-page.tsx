'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { Navbar } from './navbar'
import { AnimeCard, Anime } from './anime-card'
import { SkeletonLoader } from './skeleton-loader'
import { searchAnime } from '@/lib/api'
import { Button } from './ui/button'
import { ArrowDownCircle } from 'lucide-react'
import { SkeletonGrid } from './anime-grid'

export default function SearchPage() {
  const searchParams = useSearchParams()
  const query = searchParams.get('q') || ''

  const [animes, setAnimes] = useState<Anime[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)

  // ---------------------------------------
  // 🔍 Fetch awal
  // ---------------------------------------
  useEffect(() => {
    if (!query) {
      setAnimes([])
      setLoading(false)
      return
    }

    const fetchInitial = async () => {
      setLoading(true)
      setPage(1)

      try {
        const res = await searchAnime(query, 1)
        const data = res.data || []

        setAnimes(data)
        setHasMore(data.length === 24)
      } catch (err) {
        console.error('Search failed:', err)
        setAnimes([])
      } finally {
        setLoading(false)
      }
    }

    const timeoutId = setTimeout(fetchInitial, 500)
    return () => clearTimeout(timeoutId)
  }, [query])

  // ---------------------------------------
  // 📥 Load More
  // ---------------------------------------
  const handleLoadMore = async () => {
    if (loadingMore || !hasMore) return

    setLoadingMore(true)
    const nextPage = page + 1

    try {
      const res = await searchAnime(query, nextPage)
      const newData = res.data || []

      if (newData.length > 0) {
        setAnimes(prev => [...prev, ...newData])
        setPage(nextPage)
        setHasMore(newData.length === 24)
      } else {
        setHasMore(false)
      }
    } catch (err) {
      console.error('Load more failed:', err)
    } finally {
      setLoadingMore(false)
    }
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

        {/* Header */}
        <div className="text-center md:text-left mb-10">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            Search Results
          </h1>

          <p className="text-muted-foreground">
            {query
              ? `Showing results for "${query}"`
              : 'Enter a keyword to start searching'}
          </p>
        </div>

        {/* Loading State */}
        {loading ? (
          <SkeletonLoader type="popular" count={12} />
          
        ) : animes.length > 0 ? (
          <>
            {/* Grid Hasil */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
              {animes.map(anime => (
                <AnimeCard
                  key={anime.mal_id}
                  anime={anime}
                  className="w-full h-auto"
                  imgClassName="w-full h-auto object-cover rounded-lg"
                />
              ))}
            </div>

            {/* Load More */}
            {hasMore && (
              <div className="mt-12 text-center">
                <Button
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                  size="lg"
                  className="gap-2 bg-secondary text-secondary-foreground hover:bg-secondary/80 min-w-[200px]"
                >
                  {loadingMore ? (
                    <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></span>
                  ) : (
                    <ArrowDownCircle size={18} />
                  )}

                  {loadingMore ? 'Loading...' : 'See All Results'}
                </Button>
              </div>
            )}
          </>
        ) : (
          // Empty State
          <div className="text-center py-20 bg-secondary/20 rounded-xl border border-dashed border-border">
            <p className="text-muted-foreground mb-2">No results found</p>
            <p className="text-sm text-foreground/60">
              Try different keywords or check spelling
            </p>
          </div>
        )}
      </div>
    </main>
  )
}
