'use client'

import Image from "next/image"
import Link from "next/link"
import { Star, Tv, Clapperboard } from "lucide-react"

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
  const genres = anime.genres?.map((g) => g.name).slice(0, 2).join(" • ") || "Genre N/A"
  const displayScore = anime.score != null ? anime.score.toFixed(1) : null
  const displayEpisodes = anime.episodes != null ? `${anime.episodes} Ep` : anime.status || "TBA"
  const displayType = anime.type || "Anime"
  const TypeIcon = displayType.toLowerCase() === "movie" ? Clapperboard : Tv

  return (
    <Link
      href={`/anime/${anime.mal_id}`}
      className="group relative flex-shrink-0 snap-start w-[60vw] sm:w-60 md:w-72 transition-all duration-300 hover:scale-105 hover:z-30 hover:shadow-2xl"
    >
      <div className="flex flex-col h-full rounded-xl overflow-hidden bg-card border border-border/50 shadow-sm w-full">

        {/* IMAGE */}
        <div className="relative w-full aspect-[2/3] overflow-hidden">
          <Image
            src={anime.images.jpg.large_image_url}
            alt={anime.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 640px) 60vw, (max-width: 768px) 240px, 288px"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

          {/* TRENDING BADGE */}
          {anime.isTrending && (
            <span className="absolute top-2 left-2 z-30 px-2 py-1 rounded-full font-bold text-[10px] sm:text-xs text-black bg-yellow-400 shadow-lg backdrop-blur-sm">
              TRENDING
            </span>
          )}

          {/* TYPE BADGE */}
          <div className="absolute top-2 right-2 flex items-center gap-1 bg-background/70 px-2 py-1 rounded-full backdrop-blur-sm text-xs font-semibold shadow-sm border border-border/60 transition-all duration-300 group-hover:bg-background/90">
            <TypeIcon size={12} className="opacity-80" />
            {displayType}
          </div>

          {/* SCORE BADGE */}
          {displayScore && (
            <div className="absolute top-10 right-2 flex items-center gap-1 bg-background/70 px-2 py-1 rounded-full backdrop-blur-sm text-xs font-semibold shadow-sm border border-border/60 transition-all duration-300 group-hover:bg-background/90">
              <Star size={12} className="text-yellow-400 fill-yellow-400" />
              {displayScore}
            </div>
          )}

          {/* Title & Genre */}
          <div className="absolute bottom-0 left-0 w-full p-4 z-10">
            <h3 className="font-bold text-primary-foreground text-base sm:text-lg line-clamp-2 drop-shadow-md group-hover:text-primary transition-colors">
              {anime.title}
            </h3>
            <p className="text-xs text-muted line-clamp-1 mt-1 opacity-80 transition-opacity">
              {genres}
            </p>
          </div>
        </div>

        {/* Info Bawah */}
        <div className="p-3 flex flex-col flex-1 bg-card border-t border-border/40">
          <p className="text-sm font-medium text-foreground line-clamp-1">
            {anime.type || "N/A"} {anime.year && `(${anime.year})`}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">{displayEpisodes}</p>
        </div>
      </div>
    </Link>
  )
}
