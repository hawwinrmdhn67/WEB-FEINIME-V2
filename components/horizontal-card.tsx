'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Star, Tv, Clapperboard } from 'lucide-react'

export interface Anime {
  mal_id: number
  title: string
  score?: number
  episodes?: number
  type?: string
  status?: string
  year?: number
  genres?: { name: string }[]
  isTrending?: boolean
  images: {
    jpg: {
      image_url: string
      large_image_url: string
    }
  }
}

export function HorizontalCard({ anime }: { anime: Anime }) {
  const genres =
    anime.genres?.map(g => g.name).slice(0, 2).join(' • ') || 'Genre N/A'

  const displayScore =
    anime.score != null ? anime.score.toFixed(1) : null

  const displayEpisodes =
    anime.episodes != null ? `${anime.episodes} Ep` : anime.status || 'TBA'

  const displayType = anime.type || 'Anime'
  const TypeIcon =
    displayType.toLowerCase() === 'movie'
      ? Clapperboard
      : Tv

  return (
    <Link
      href={`/anime/${anime.mal_id}`}
      className="
        group
        relative
        flex-shrink-0
        snap-start
        w-[70vw]
        sm:w-[200px]
        md:w-[240px]
        transition-all
        duration-300
        hover:-translate-y-1
        hover:shadow-xl
      "
    >
      <div className="flex flex-col h-full rounded-xl overflow-hidden bg-card border border-border/50 shadow-sm">

        {/* IMAGE */}
        <div className="relative w-full aspect-[2/3] overflow-hidden">
          <Image
            src={anime.images.jpg.large_image_url}
            alt={anime.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
            sizes="(max-width: 640px) 70vw, 240px"
          />

          {/* Gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />

          {/* TRENDING */}
          {anime.isTrending && (
            <span className="
              absolute top-2 left-2 z-30
              px-2 py-1
              rounded-full
              text-[10px]
              font-bold
              text-black
              bg-yellow-400
              shadow-md
            ">
              TRENDING
            </span>
          )}

          {/* TYPE */}
          <div className="
            absolute top-2 right-2
            flex items-center gap-1
            bg-background/70
            px-2 py-1
            rounded-full
            backdrop-blur-sm
            text-xs font-semibold
            shadow-sm
            border border-border/60
          ">
            <TypeIcon size={12} className="opacity-80" />
            {displayType}
          </div>

          {/* SCORE */}
          {displayScore && (
            <div className="
              absolute top-10 right-2
              flex items-center gap-1
              bg-background/70
              px-2 py-1
              rounded-full
              backdrop-blur-sm
              text-xs font-semibold
              shadow-sm
              border border-border/60
            ">
              <Star size={12} className="text-yellow-400 fill-yellow-400" />
              {displayScore}
            </div>
          )}

          {/* TITLE */}
          <div className="absolute bottom-0 left-0 w-full p-4 z-10">
            <h3 className="
              font-bold
              text-primary-foreground
              text-base
              line-clamp-2
              drop-shadow-md
              group-hover:text-primary
              transition-colors
            ">
              {anime.title}
            </h3>
            <p className="text-xs text-muted line-clamp-1 mt-1 opacity-80">
              {genres}
            </p>
          </div>
        </div>

        {/* FOOTER */}
        <div className="p-3 bg-card border-t border-border/40">
          <p className="text-sm font-medium line-clamp-1">
            {displayType} {anime.year && `(${anime.year})`}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {displayEpisodes}
          </p>
        </div>
      </div>
    </Link>
  )
}
