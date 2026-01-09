'use client'

import { Anime } from '@/lib/api'
import { AnimeCard } from '@/components/anime-card'
import { Footer } from '@/components/feinime-footer'

interface Props {
  animes: Anime[]
}

export default function SeasonalClient({ animes }: Props) {
  const filteredAnimes = animes.filter(
    (anime, index, self) =>
      index ===
      self.findIndex(
        a =>
          a.mal_id === anime.mal_id &&
          a.title === anime.title
      )
  )

  return (
    <main className="min-h-screen bg-background text-foreground flex flex-col">

      <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

        <div className="text-center md:text-left mb-10">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            Seasonal Anime
          </h1>
          <p className="text-muted-foreground">
            Catch up with the latest anime currently airing right now
          </p>
        </div>

        <div className="
          grid
          grid-cols-2
          sm:grid-cols-3
          md:grid-cols-4
          lg:grid-cols-5
          gap-4
          md:gap-6
        ">
          {filteredAnimes.map((anime) => (
            <AnimeCard
              key={`${anime.mal_id}-${anime.title}`}
              anime={anime}
            />
          ))}
        </div>

      </div>

      <Footer />
    </main>
  )
}
