'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Navbar } from '@/components/navbar'
import { getSeasonUpcoming, Anime } from '@/lib/api' 
import { Calendar, Clapperboard, Clock, Tv } from 'lucide-react'
import dynamic from 'next/dynamic'
import { SkeletonLoader } from '@/components/skeleton-loader' // <-- import skeleton yang disesuaikan
import { Footer } from '@/components/feinime-footer'

// Definisikan Interface AnimeCardProps di sini atau impor dari file komponen
interface AnimeCardProps {
  anime: Anime
}

// Gunakan import dinamis agar komponen AnimeCard yang diimpor dari file lain
// memiliki identitas yang sama dengan yang digunakan di PopularPage
const AnimeCard = dynamic<AnimeCardProps>(
  // Asumsi AnimeCard berada di '@/components/anime-card'
  () => import('@/components/anime-card').then(mod => mod.AnimeCard),
  { ssr: false }
)

// (Opsional) Kartu fallback/original yang pernah dipakai — tidak wajib digunakan
const AnimeCardOriginal = ({ anime }: { anime: Anime }) => {
  const imageUrl = anime.images?.jpg?.large_image_url || anime.images?.jpg?.image_url || "https://placehold.co/300x450/333333/FFFFFF?text=No+Image";
  const glassBadgeStyle = "flex items-center gap-1 bg-black/70 px-2 py-1 rounded-full backdrop-blur-sm text-white text-[10px] font-bold shadow-sm border border-white/10";
  const displayDateBadge = anime.year ? `${anime.season || ''} ${anime.year}`.trim() : 'TBA';
  const displayType = anime.type || "Anime";
  const TypeIcon = displayType.toLowerCase() === "movie" ? Clapperboard : Tv;
  const typeLabel = displayType.toLowerCase() === "movie" ? "Movie" : displayType.toLowerCase() === "tv" ? "TV" : displayType;

  return (
    <Link 
      href={`/anime/${anime.mal_id}`} 
      className="group relative flex flex-col bg-card rounded-xl overflow-hidden border border-border/50 shadow-sm hover:shadow-xl transition-all h-full"
    >
      <div className="relative aspect-[3/4] overflow-hidden bg-muted">
        <img src={imageUrl} alt={anime.title} className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105" loading="lazy" />
        
        <div className={`absolute top-2 left-2 z-20 ${glassBadgeStyle}`}>
          <TypeIcon size={10} />
          <span>{typeLabel}</span>
        </div>
        <div className={`absolute top-2 right-2 z-20 ${glassBadgeStyle}`}>
          <Calendar size={10} className="text-pink-400" />
          {displayDateBadge}
        </div>
        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors" />
      </div>

      <div className="p-3 flex flex-col flex-1">
        <h3 className="font-bold text-sm text-foreground line-clamp-2 leading-tight mb-1 group-hover:text-primary transition-colors" title={anime.title}>
          {anime.title_english || anime.title}
        </h3>
        <p className="text-xs text-muted-foreground line-clamp-1 mt-auto flex items-center gap-1">
          <Clock size={10} />
          {anime.aired?.from ? new Date(anime.aired.from).toLocaleDateString() : 'Coming Soon'}
        </p>
      </div>
    </Link>
  )
}

export default function UpcomingPage() {
  const [animes, setAnimes] = useState<Anime[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUpcoming = async () => {
      setLoading(true)
      try {
        const data = await getSeasonUpcoming()
        const rawData = data.data || []

        // 1. HAPUS DUPLIKAT
        const uniqueData = Array.from(
            new Map(rawData.map((item: Anime) => [item.mal_id, item])).values()
        )
        // 2. FILTER AMAN
        const safeData = uniqueData.filter((item: Anime) => 
            !item.genres?.some(g => g.name === 'Hentai')
        )
        
        // 3. BATASI HINGGA 50 ITEM PERTAMA (FIX)
        setAnimes(safeData.slice(0, 50)) 
        
      } catch (err) {
        console.error('Failed to fetch upcoming anime', err)
        setAnimes([])
      } finally {
        setLoading(false)
      }
    }
    fetchUpcoming()
  }, [])

  return (
    <main className="min-h-screen bg-background text-foreground flex flex-col">
      <Navbar />

      <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
        
        {/* Header (Sama behaviour dengan PopularPage: tunjukkan skeleton saat loading) */}
        {loading ? (
          <SkeletonLoader type="page-header" />
        ) : (
          <div className="text-center md:text-left mb-10 border-b border-border/40 pb-6">
            <h1 className="text-3xl md:text-4xl font-bold mb-2 tracking-tight text-primary flex items-center gap-2 justify-center md:justify-start">
              Upcoming Anime
            </h1>
            <p className="text-muted-foreground">
              Discover the most anticipated anime series coming next season
            </p>
          </div>
        )}

        {/* Content Grid */}
        {loading ? (
          <SkeletonLoader type="popular" count={12} />
        ) : animes.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
            {animes.map((anime) => (
              <AnimeCard key={anime.mal_id} anime={anime} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-secondary/20 rounded-xl border border-dashed border-border">
            <p className="text-muted-foreground">No upcoming anime found</p>
          </div>
        )}
      </div>
      <Footer />
    </main>
  )
}
