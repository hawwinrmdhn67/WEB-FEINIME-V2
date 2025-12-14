'use client'

import { Anime } from '@/lib/api'
import { Navbar } from '@/components/navbar'
import { AnimeCard } from '@/components/anime-card'
import { Footer } from '@/components/feinime-footer'

interface Props {
  initialAnimes: Anime[]
}

export default function TrendingClient({ initialAnimes }: Props) {
  const maxItems = 50
  const limitedAnimes = initialAnimes.slice(0, maxItems)

  return (
    <main className="min-h-screen bg-background text-foreground flex flex-col">
      <Navbar />

      <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

        {/* HEADER */}
        <div className="text-center md:text-left mb-10">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            Top Trending Anime
          </h1>
          <p className="text-muted-foreground">
            Top 50 highest rated anime on FeinimeList right now
          </p>
        </div>

        {/* GRID */}
        {limitedAnimes.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
            {limitedAnimes.map((anime, index) => (
              <AnimeCard
                key={anime.mal_id}
                anime={anime}
                rank={index + 1}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-secondary/20 rounded-xl border border-dashed border-border">
            <p className="text-muted-foreground">
              No trending anime found
            </p>
          </div>
        )}
      </div>

      <Footer />
    </main>
  )
}
