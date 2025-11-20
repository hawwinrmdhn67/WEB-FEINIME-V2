"use client";

import React from "react";
import Link from "next/link";
import { Star, Tv, Clapperboard } from "lucide-react";

export interface Anime {
  mal_id: number;
  title: string;
  images: {
    jpg: {
      large_image_url?: string;
      image_url: string;
    };
  };
  score?: number;
  episodes?: number | null;
  type?: string | null;
  status?: string | null;
}

interface AnimeCardProps {
  anime: Anime;
  rank?: number;
  className?: string
  imgClassName?: string
}

export function AnimeCard({ anime, rank }: AnimeCardProps) {
  const imageUrl =
    anime.images?.jpg?.large_image_url ||
    anime.images?.jpg?.image_url ||
    "https://placehold.co/300x450/333333/FFFFFF?text=No+Image";

  const displayScore = anime.score != null ? anime.score.toFixed(1) : "N/A";
  const displayEpisodes =
    anime.episodes != null ? `${anime.episodes} Ep` : "Ongoing";

  const displayType = anime.type || "Anime";
  const typeLabel =
    displayType.toLowerCase() === "movie"
      ? "Movie"
      : displayType.toLowerCase() === "tv"
      ? "TV Anime"
      : displayType;

  const TypeIcon =
    displayType.toLowerCase() === "movie" ? Clapperboard : Tv;

  const displayStatus = anime.status || "Unknown";

  return (
    <Link href={`/anime/${anime.mal_id}`}>
      <div className="group relative flex flex-col h-full cursor-pointer rounded-xl overflow-hidden bg-card shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
        
        {/* IMAGE */}
        <div className="relative w-full aspect-[2/3] overflow-hidden rounded-t-xl">
          <img
            src={imageUrl}
            alt={anime.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
            loading="lazy"
            onError={(e: any) =>
              (e.target.src =
                "https://placehold.co/300x450/333333/FFFFFF?text=No+Image")
            }
          />

          {/* Overlay */}
          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* TYPE BADGE */}
          <div className="absolute top-2 left-2 flex items-center gap-1 bg-black/60 text-white px-2 py-1 rounded-full backdrop-blur-sm text-xs font-semibold shadow-md border border-white/10 transition-all duration-300 group-hover:bg-black/80">
            <TypeIcon size={12} />
            {typeLabel}
          </div>

          {/* SCORE BADGE */}
          {anime.score != null && (
            <div className="absolute top-2 right-2 flex items-center gap-1 bg-black/60 text-white px-2 py-1 rounded-full backdrop-blur-sm text-xs font-semibold shadow-md border border-white/10 transition-all duration-300 group-hover:bg-black/80">
              <Star size={12} className="text-yellow-400 fill-yellow-400" />
              {displayScore}
            </div>
          )}

          {/* RANK BADGE */}
          {rank && (
            <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs font-bold px-2 py-1 rounded-md border border-white/20 shadow-sm backdrop-blur-sm">
              #{rank}
            </div>
          )}
        </div>

        {/* CONTENT */}
        <div className="p-3 flex flex-col flex-1 bg-card border-t border-border/40">
          <h3 className="font-semibold text-sm sm:text-base line-clamp-2 text-foreground group-hover:text-primary transition-colors mb-2">
            {anime.title}
          </h3>

          <div className="mt-auto flex items-center justify-between text-xs text-muted-foreground">
            <span className="opacity-90">{displayEpisodes}</span>
            <span className="font-medium bg-muted px-2 py-0.5 rounded-full text-foreground/80">
              {displayStatus}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}