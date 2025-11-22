'use client'
import Image from "next/image"
import Link from "next/link"
import { Star } from "lucide-react"

export interface Anime {
  status: string
  mal_id: number
  title: string
  score?: number
  episodes?: number
  type?: string
  year?: number
  genres?: { name: string }[]
  images: {
    jpg: {
      image_url: string
      large_image_url: string
    }
  }
}

export function HorizontalCard({ anime }: { anime: Anime }) {
  const genres =
    anime.genres?.map((g) => g.name).slice(0, 2).join(" • ") || "Genre N/A"

  return (
    <Link
      href={`/anime/${anime.mal_id}`}
      className="
        group/card relative flex-shrink-0 snap-start 
        w-[60vw] sm:w-60 md:w-72 
        transition-all duration-300 ease-in-out 
        delay-200 hover:delay-0
        hover:scale-105 hover:z-30 hover:shadow-2xl
        transform-origin-center
      "
    >
      <div className="flex flex-col h-full rounded-xl overflow-hidden bg-card border border-border/50 shadow-sm w-full">
        
        {/* Image */}
        <div className="relative w-full aspect-[2/3] overflow-hidden">
          <Image
            src={anime.images.jpg.large_image_url}
            alt={anime.title}
            fill
            className="
              object-cover 
              transition-transform duration-300 
              group-hover/card:scale-105
            "
            // UKURAN DISESUAIKAN: Lebih spesifik untuk Next/Image
            sizes="(max-width: 640px) 60vw, (max-width: 768px) 240px, 288px" 
            priority
          />

          {/* Gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

          {/* Rating */}
          {anime.score && (
            <div className="
              absolute top-2 left-2 flex items-center 
              bg-black/60 backdrop-blur-sm 
              text-yellow-400 text-[10px] sm:text-xs 
              font-semibold p-1.5 rounded-full shadow-md
            ">
              <Star size={12} className="mr-1 fill-yellow-400" /> 
              {anime.score.toFixed(1)} 
            </div>
          )}

          {/* Title & Genre */}
          <div className="absolute bottom-0 left-0 w-full p-4 z-10">
            <h3 className="font-bold text-primary-foreground text-base sm:text-lg line-clamp-2 drop-shadow-md group-hover/card:text-primary transition-colors">
              {anime.title}
            </h3>

            <p className="text-xs text-muted line-clamp-1 mt-1 opacity-80 group-hover/card:opacity-100 transition-opacity">
              {genres}
            </p>
          </div>
        </div>

        {/* Info bawah */}
        <div className="p-3">
          <p className="text-sm font-medium text-foreground line-clamp-1">
            {anime.type || "N/A"}
            {anime.year && ` (${anime.year})`}
          </p>

          {anime.episodes && (
            <p className="text-xs text-muted-foreground mt-0.5">
              {anime.episodes} Eps
            </p>
          )}
          {/* Tambahan fallback jika episodes tidak ada, menampilkan type dan year saja sudah cukup */}
          {!anime.episodes && (
            <p className="text-xs text-muted-foreground mt-0.5">
                Status: {anime.status || 'N/A'}
            </p>
          )}
        </div>
      </div>
    </Link>
  )
}