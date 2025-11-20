import { Anime } from '@/lib/api'
import { AnimeCard } from './anime-card'

interface AnimeGridProps {
  animes: Anime[]
  title?: string
}

export function AnimeGrid({ animes, title }: AnimeGridProps) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {title && <h2 className="text-2xl font-bold text-foreground mb-4">{title}</h2>}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
        {animes.map((anime) => (
          <AnimeCard key={anime.mal_id} anime={anime} />
        ))}
      </div>
    </div>
  )
}
