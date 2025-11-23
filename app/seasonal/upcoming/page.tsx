'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Navbar } from '@/components/navbar'
import { getSeasonUpcoming, Anime } from '@/lib/api' 
import { Calendar, Clapperboard, Clock, Tv } from 'lucide-react'
import dynamic from 'next/dynamic'

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

// ==========================================
// 1. KOMPONEN KARTU ANIME (Dibawa dari sebelumnya)
// ==========================================
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


// ==========================================
// 2. KOMPONEN SKELETON LOADER
// ==========================================
const SkeletonLoader = ({ count = 10 }: { count?: number }) => (
  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
    {[...Array(count)].map((_, i) => (
      <div key={i} className="flex flex-col h-full rounded-xl overflow-hidden border border-border/50 bg-card">
        <div className="aspect-[3/4] bg-muted animate-pulse" />
        <div className="p-3 space-y-2">
          <div className="h-4 bg-muted rounded animate-pulse w-3/4" />
          <div className="h-3 bg-muted rounded animate-pulse w-1/2" />
        </div>
      </div>
    ))}
  </div>
)

// ==========================================
// 3. HALAMAN UTAMA (UPCOMING PAGE)
// ==========================================

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
        
        {/* Header (Sama dengan PopularPage) */}
        <div className="text-center md:text-left mb-10 border-b border-border/40 pb-6">
          <h1 className="text-3xl md:text-4xl font-bold mb-2 tracking-tight text-primary flex items-center gap-2 justify-center md:justify-start">
            Upcoming Anime
          </h1>
          <p className="text-muted-foreground">
            Discover the most anticipated anime series coming next season
          </p>
        </div>

        {/* Content Grid */}
        {loading ? (
          <SkeletonLoader count={15} />
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

      {/* Responsive Footer (Sama Persis dengan Popular Page) */}
      <footer className="border-t border-border bg-card mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">

          <div className="flex flex-col md:flex-row justify-between items-center md:items-start gap-6 md:gap-12">

            {/* Brand */}
            <div className="text-center md:text-left">
              <span className="font-bold text-xl tracking-tight text-foreground">Feinime</span>
              <p className="text-xs text-muted-foreground mt-2 max-w-[200px]">
                Platform kurasi dan pelacakan anime terbaik untuk komunitas.
              </p>
            </div>

            {/* Navigation Links */}
            <nav className="flex flex-wrap justify-center md:justify-start gap-4 md:gap-6 text-sm text-muted-foreground">
              {['Home', 'Popular', 'Trending', 'About', 'Contact', 'FAQ'].map((item) => (
                <Link key={item} href={item === 'Home' ? '/' : `/${item.toLowerCase().replace(' ', '-')}`} className="hover:text-primary transition-colors font-medium">
                  {item}
                </Link>
              ))}
            </nav>

            {/* Social Icons */}
            <div className="flex justify-center md:justify-start items-center gap-4">
              <a href="#" className="text-muted-foreground hover:text-[#1DA1F2] transition-colors p-2 hover:bg-secondary rounded-full">
                <span className="sr-only">Twitter</span>
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M23.954 4.569c-.885.389-1.83.654-2.825.775 1.014-.611 1.794-1.574 2.163-2.723-.951.564-2.005.974-3.127 1.195-.897-.955-2.178-1.55-3.594-1.55-2.717 0-4.92 2.204-4.92 4.917 0 .39.045.765.127 1.124-4.087-.205-7.72-2.164-10.148-5.144-.424.722-.666 1.561-.666 2.475 0 1.708.87 3.214 2.188 4.099-.807-.025-1.566-.248-2.229-.616v.061c0 2.385 1.693 4.374 3.946 4.827-.413.111-.849.171-1.296.171-.314 0-.615-.03-.916-.086.631 1.953 2.445 3.376 4.604 3.416-1.68 1.319-3.809 2.105-6.102 2.105-.396 0-.779-.023-1.158-.067 2.189 1.402 4.768 2.217 7.548 2.217 9.051 0 14-7.496 14-13.986 0-.21 0-.42-.015-.63 1.009-.73 1.884-1.64 2.584-2.675z" /></svg>
              </a>
              <a href="#" className="text-muted-foreground hover:text-[#5865F2] transition-colors p-2 hover:bg-secondary rounded-full">
                <span className="sr-only">Discord</span>
                <svg className="w-5 h-5" viewBox="0 0 71 55" fill="currentColor"><path d="M60.1 4.55A59 59 0 0 0 46.92 0c-.65 1.14-1.39 2.59-1.9 3.74a42 42 0 0 0-17 0C27.5 2.6 26.76 1.15 26.1 0A58.8 58.8 0 0 0 10.9 4.55C2.68 19.28.08 33.43 1.3 47.36c11.04 8.16 21.56 6.06 21.56 6.06 1.44-1.84 2.56-3.78 3.44-5.7-6.16-1.84-8.52-4.52-8.52-4.52.72.48 1.44.92 2.16 1.3 4.92 2.52 10.12 3.78 15.44 3.78s10.52-1.26 15.44-3.78c.72-.38 1.44-.82 2.16-1.3 0 0-2.36 2.68-8.52 4.52.88 1.92 2 3.86 3.44 5.7 0 0 10.52 2.1 21.56-6.06 1.22-13.92-1.38-28.07-9.6-42.8ZM24.76 37.34c-3.12 0-5.68-2.82-5.68-6.28 0-3.46 2.52-6.28 5.68-6.28 3.18 0 5.74 2.82 5.68 6.28 0 3.46-2.5 6.28-5.68 6.28Zm21.48 0c-3.12 0-5.68-2.82-5.68-6.28 0-3.46 2.52-6.28 5.68-6.28 3.18 0 5.74 2.82 5.68 6.28 0 3.46-2.5 6.28-5.68 6.28Z" /></svg>
              </a>
            </div>

          </div>

          {/* COPYRIGHT */}
          <div className="border-t border-border mt-8 pt-6 text-center text-muted-foreground text-sm">
            <p>Feinime © 2025. All rights reserved.</p>
          </div>

        </div>
      </footer>
    </main>
  )
}