'use client'
import Image from "next/image"
import Link from "next/link"

// Pastikan interface ini lengkap dan benar
export interface Anime {
  mal_id: number;
  title: string;
  score?: number;
  episodes?: number;
  type?: string;
  genres?: { name: string }[];
  images: { 
    jpg: {
      image_url: string;
      large_image_url: string; 
    }
  };
}

// ========================
// 🎬 Horizontal Card (Featured Item)
// ========================
export function HorizontalCard({ anime }: { anime: Anime }) {
  return (
    <Link
      href={`/anime/${anime.mal_id}`}
      // Menggunakan named group (group/card) untuk mengisolasi hover state
      // Menggunakan delay-200 untuk anti-flicker
      // Menggunakan margin negatif untuk stabilisasi scale-110
      className="
        group/card relative flex-shrink-0 snap-start w-[70vw] sm:w-60 md:w-72 
        transition-all duration-300 ease-in-out 
        delay-200 hover:delay-0 will-change-transform
        transform-origin-center
        /* Margin Compensation untuk menghilangkan pergeseran */
        hover:scale-110 hover:mx-[-5%] hover:-translate-y-[4%] hover:z-30 hover:shadow-2xl
      "
    >
      {/* Container Kartu */}
      <div className="flex flex-col h-full rounded-xl overflow-hidden bg-card border border-border/50 shadow-sm h-full w-full">
        
        {/* Image Wrapper */}
        <div className="relative w-full aspect-[2/3] overflow-hidden">
          <Image
            src={anime.images.jpg.large_image_url}
            alt={anime.title}
            fill
            className="object-cover" 
            sizes="(max-width: 640px) 75vw, 300px"
            priority
          />
          
          {/* Overlay Gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
          
          {/* Text Content */}
          <div className="absolute bottom-0 left-0 w-full p-4 z-10">
             {/* HANYA JUDUL YANG BERUBAH WARNA */}
             <h3 className="font-bold text-white text-lg sm:text-xl line-clamp-2 drop-shadow-md group-hover/card:text-primary transition-colors">
              {anime.title}
            </h3>
            {/* Teks Genre hanya mengubah opacity, warna tetap */}
            <p className="text-xs text-gray-300 line-clamp-1 mt-1 opacity-80 group-hover/card:opacity-100 transition-colors">
               {anime.genres?.map(g => g.name).slice(0,2).join(" • ")}
            </p>
          </div>
        </div>
      </div>
    </Link>
  )
}