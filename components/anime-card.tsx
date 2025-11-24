"use client";

import React from "react";
import Link from "next/link";
import { Star, Tv, Clapperboard } from "lucide-react";
import { Anime } from "@/lib/api"; 

interface AnimeCardProps {
    anime: Anime;
    rank?: number;
    className?: string;
    imgClassName?: string;
}

const getStatusClasses = () => {
    // Memberikan kelas dasar untuk status (diletakkan di bagian bawah card, tidak perlu glassmorphism)
    const base = "font-medium px-1.5 py-0.5 rounded-full text-[10px] sm:text-xs border transition-colors duration-300 ";
    return base + 'bg-card/70 text-foreground/90 border-border/60';
};

export function AnimeCard({ anime, rank }: AnimeCardProps) {
    const imageUrl =
        anime.images?.jpg?.large_image_url ||
        anime.images?.jpg?.image_url ||
        "https://placehold.co/300x450/333333/FFFFFF?text=No+Image";

    const displayScore = anime.score != null ? anime.score.toFixed(1) : "N/A";
    
    const displayEpisodes = anime.episodes != null 
        ? `${anime.episodes} Ep` 
        : anime.status === 'Currently Airing' ? 'Ongoing' : 'TBA'; 

    const displayType = anime.type || "Anime";
    
    // PERBAIKAN: Menghilangkan tanda **
    const typeLabel =
        displayType.toLowerCase() === "movie"
        ? "Movie"
        : displayType.toLowerCase() === "tv"
        ? "TV Anime" // Dihapus ** di sini
        : displayType; 

    const TypeIcon = displayType.toLowerCase() === "movie" ? Clapperboard : Tv;
    const displayStatus = anime.status || "Unknown";

    // Style Seragam (Glassmorphism) untuk semua badge (Type, Score, Rank)
    const glassBadgeStyle = "flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] sm:gap-1 sm:px-2 sm:py-1 sm:text-xs " + 
                            "bg-background/70 rounded-full backdrop-blur-sm font-semibold shadow-sm border border-border/60 " + 
                            "transition-all duration-300 group-hover:bg-background/90";

    // Ukuran icon badge diseragamkan dan diperkecil sedikit
    const iconSize = 11; 

    return (
        // Link: Menghilangkan focus ring/popup
        <Link 
            href={`/anime/${anime.mal_id}`}
            className="focus:outline-none focus:ring-0 focus:ring-offset-0"
        >
            {/* Card Container: Hover effect dan styling card utama */}
            <div className="group relative flex flex-col h-full cursor-pointer rounded-xl overflow-hidden bg-card shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-border/40">

                {/* --- IMAGE SECTION --- */}
                <div className="relative w-full aspect-[2/3] overflow-hidden rounded-t-xl">
                    <img
                        src={imageUrl}
                        alt={anime.title}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                        loading="lazy"
                        onError={(e: any) =>
                            (e.target.src = "https://placehold.co/300x450/333333/FFFFFF?text=No+Image")
                        }
                    />
                    
                    {/* Overlay Gelap (Hover Only) */}
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                    {/* 1. TYPE BADGE (KIRI ATAS) */}
                    <div className={`absolute top-2 left-2 z-20 ${glassBadgeStyle}`}>
                        <TypeIcon size={iconSize} className="opacity-80" />
                        <span>{typeLabel}</span> 
                    </div>

                    {/* 2. SCORE BADGE (KANAN ATAS) */}
                    {anime.score != null && (
                        <div className={`absolute top-2 right-2 z-20 ${glassBadgeStyle}`}>
                            <Star size={iconSize} className="text-yellow-400 fill-yellow-400" />
                            {displayScore}
                        </div>
                    )}

                    {/* 3. RANK BADGE (KIRI BAWAH) */}
                    {rank && (
                        <div className={`absolute bottom-2 left-2 z-20 ${glassBadgeStyle}`}>
                            <span>#{rank}</span>
                        </div>
                    )}

                </div>

                {/* --- CONTENT SECTION --- */}
                <div className="p-3 flex flex-col flex-1 bg-card border-t border-border/40">
                    <h3 className="font-semibold text-sm sm:text-base line-clamp-2 text-foreground group-hover:text-primary transition-colors mb-2">
                        {anime.title}
                    </h3>

                    <div className="mt-auto flex items-center justify-between text-xs text-muted-foreground">
                        <span className="opacity-90 text-[10px] sm:text-xs">{displayEpisodes}</span>
                        {anime.status && (
                            <span className={getStatusClasses()}>
                                {displayStatus}
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </Link>
    );
}

export type { Anime };