'use client'

import { Anime } from '@/lib/api'
import { Navbar } from '@/components/navbar'
import { AnimeCard } from '@/components/anime-card'
import { Footer } from '@/components/feinime-footer'

interface Props {
  animes: Anime[]
}

export default function SeasonalClient({ animes }: Props) {
  // ✅ DEDUPE berdasarkan mal_id (ANTI duplicate key)
  const uniqueAnimes = Array.from(
    new Map(animes.map(anime => [anime.mal_id, anime])).values()
  )

  return (
    <main className="min-h-screen bg-background text-foreground flex flex-col">
      <Navbar />

      <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

        {/* HEADER */}
        <div className="text-center md:text-left mb-10">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            Seasonal Anime
          </h1>
          <p className="text-muted-foreground">
            Catch up with the latest anime currently airing right now
          </p>
        </div>

        {/* GRID */}
        {uniqueAnimes.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
            {uniqueAnimes.map(anime => (
              <AnimeCard key={anime.mal_id} anime={anime} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-secondary/20 rounded-xl border border-dashed border-border">
            <p className="text-muted-foreground">
              No seasonal anime found
            </p>
          </div>
        )}

      </div>

      <Footer />
    </main>
  )
}
