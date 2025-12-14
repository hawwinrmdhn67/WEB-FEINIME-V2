"use client";

import Link from "next/link";
import { Star, Tv, Clapperboard } from "lucide-react";
import { Anime } from "@/lib/api";

interface AnimeCardProps {
  anime: Anime;
  rank?: number;
  className?: string;
  imgClassName?: string;
}

/* =========================
   Helpers & Constants
========================= */

const FALLBACK_IMAGE =
  "https://placehold.co/300x450/333333/FFFFFF?text=No+Image";

const getStatusBadgeClass = (status?: string) => {
  const base =
    "font-semibold px-2 py-0.5 rounded-full text-[10px] sm:text-xs border transition-colors duration-300";

  switch (status) {
    case "Currently Airing":
      return `${base}
        bg-green-500/30
        text-green-700 dark:text-green-300
        border-green-500/50
      `;

    case "Finished Airing":
      return `${base}
        bg-blue-500/30
        text-blue-700 dark:text-blue-300
        border-blue-500/50
      `;

    case "Not yet aired":
      return `${base}
        bg-yellow-500/30
        text-yellow-700 dark:text-yellow-300
        border-yellow-500/50
      `;

    default:
      return `${base}
        bg-muted/70
        text-muted-foreground
        border-border/60
      `;
  }
};

const GLASS_BADGE_CLASSES =
  "flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] " +
  "sm:gap-1 sm:px-2 sm:py-1 sm:text-xs " +
  "bg-background/70 rounded-full backdrop-blur-sm font-semibold shadow-sm " +
  "border border-border/60 transition-all duration-300 " +
  "group-hover:bg-background/90";

const BADGE_ICON_SIZE = 11;

/* =========================
   Component
========================= */

export function AnimeCard({ anime, rank }: AnimeCardProps) {
  /* ---------- Derived Values ---------- */

  const imageUrl =
    anime.images?.jpg?.large_image_url ||
    anime.images?.jpg?.image_url ||
    FALLBACK_IMAGE;

  const score =
    anime.score != null ? anime.score.toFixed(1) : null;

  const episodes =
    anime.episodes != null
      ? `${anime.episodes} Ep`
      : anime.status === "Currently Airing"
      ? "Ongoing"
      : "TBA";

  const type = anime.type || "Anime";
  const status = anime.status || "Unknown";

  const typeLabel =
    type.toLowerCase() === "movie"
      ? "Movie"
      : type.toLowerCase() === "tv"
      ? "TV Anime"
      : type;

  const TypeIcon =
    type.toLowerCase() === "movie" ? Clapperboard : Tv;

  /* ---------- Render ---------- */

  return (
    <Link
      href={`/anime/${anime.mal_id}`}
      className="focus:outline-none focus:ring-0"
    >
      <div className="group relative flex h-full flex-col overflow-hidden rounded-xl border border-border/40 bg-card shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
        
        {/* ================= Image Section ================= */}
        <div className="relative aspect-[2/3] w-full overflow-hidden rounded-t-xl">
          <img
            src={imageUrl}
            alt={anime.title}
            loading="lazy"
            onError={(e: any) => (e.target.src = FALLBACK_IMAGE)}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          />

          {/* Hover Overlay */}
          <div className="absolute inset-0 bg-black/20 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

          {/* Type Badge */}
          <div className={`absolute left-2 top-2 z-20 ${GLASS_BADGE_CLASSES}`}>
            <TypeIcon size={BADGE_ICON_SIZE} className="opacity-80" />
            <span>{typeLabel}</span>
          </div>

          {/* Score Badge */}
          {score && (
            <div className={`absolute right-2 top-2 z-20 ${GLASS_BADGE_CLASSES}`}>
              <Star
                size={BADGE_ICON_SIZE}
                className="fill-yellow-400 text-yellow-400"
              />
              <span>{score}</span>
            </div>
          )}

          {/* Rank Badge */}
          {rank && (
            <div className={`absolute bottom-2 left-2 z-20 ${GLASS_BADGE_CLASSES}`}>
              <span>#{rank}</span>
            </div>
          )}
        </div>

        {/* ================= Content Section ================= */}
        <div className="flex flex-1 flex-col border-t border-border/40 bg-card p-3">
          <h3 className="mb-2 line-clamp-2 text-sm font-semibold text-foreground transition-colors group-hover:text-primary sm:text-base">
            {anime.title}
          </h3>

          <div className="mt-auto flex items-center justify-between text-xs text-muted-foreground">
            <span className="opacity-90 text-[10px] sm:text-xs">
              {episodes}
            </span>

            <span className={getStatusBadgeClass(status)}>
              {status}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

export type { Anime };
