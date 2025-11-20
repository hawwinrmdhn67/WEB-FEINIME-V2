import { 
  getTopAnime, 
  getSeasonNow, 
  getPopularAnime, 
  Anime 
} from '@/lib/api'
import { Navbar } from '@/components/navbar'
import { AnimeCard } from '@/components/anime-card'
import Link from 'next/link'
import { ArrowRight, Star, TrendingUp, Calendar as CalendarIcon, PlayCircle } from 'lucide-react'
import Image from 'next/image'

// Pastikan dynamic rendering aktif
export const dynamic = 'force-dynamic' // Ini penting agar data API muncul di Vercel

export default async function Home() {
  // Fetch data dari API dengan cache: 'no-store' agar selalu fresh
const topAnimeData = await getTopAnime()
const seasonAnimeData = await getSeasonNow()
const popularAnimeData = await getPopularAnime()


  // LOGIKA DATA
  const heroAnimes: Anime[] = topAnimeData.data.slice(0, 2)
  const sideList: Anime[] = topAnimeData.data.slice(2, 7)
  const seasonalAnime: Anime[] = seasonAnimeData.data.slice(0, 12)
  const popularAnime: Anime[] = popularAnimeData.data.slice(0, 12)

  return (
    <main className="min-h-screen bg-background overflow-x-hidden">
      <Navbar />

      {/* HERO & TRENDING */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* LEFT: HERO */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            {heroAnimes.map((anime: Anime, index: number) => (
              <div key={anime.mal_id} className="relative flex flex-col sm:flex-row bg-card rounded-xl overflow-hidden border border-border/50 shadow-sm hover:shadow-md transition-all h-full group">
                <div className="relative w-full sm:w-5/12 aspect-[16/9] sm:aspect-auto shrink-0 h-56 sm:h-auto overflow-hidden">
                  <Image
                    src={anime.images.jpg.large_image_url}
                    alt={anime.title}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                    priority={index === 0}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent sm:hidden"></div>
                  <div className={`absolute top-3 left-3 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg flex items-center gap-1 z-10 ${
                    index === 0 ? 'bg-primary' : 'bg-blue-600'
                  }`}>
                    <TrendingUp size={14} /> #{index + 1} Trending
                  </div>
                </div>

                <div className="flex flex-col justify-center p-5 sm:w-7/12 space-y-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-[10px] font-bold text-primary uppercase tracking-wider">
                      <span>{anime.type}</span>
                      <span>•</span>
                      <span>{anime.status}</span>
                    </div>
                    <Link href={`/anime/${anime.mal_id}`} className="block">
                      <h1 className="text-xl md:text-2xl font-extrabold text-foreground leading-tight hover:text-primary transition-colors line-clamp-2">
                        {anime.title}
                      </h1>
                    </Link>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground font-medium">
                    <span className="flex items-center gap-1 text-foreground font-bold">
                      <Star className="text-yellow-500 fill-yellow-500" size={14} /> {anime.score}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <CalendarIcon size={14} /> {anime.year || 'TBA'}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <PlayCircle size={14} /> {anime.episodes || '?'} Eps
                    </span>
                  </div>

                  <p className="text-muted-foreground line-clamp-3 leading-relaxed text-sm">
                    {anime.synopsis}
                  </p>

                  <div className="pt-2 mt-auto">
                    <Link 
                      href={`/anime/${anime.mal_id}`} 
                      className="inline-flex h-9 items-center justify-center rounded-md border border-input bg-background/60 backdrop-blur-sm px-6 text-xs font-bold text-foreground shadow-sm transition-colors hover:bg-primary hover:text-primary-foreground dark:hover:bg-white/20 dark:hover:text-white"
                    >
                        View Details
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* RIGHT: SIDEBAR */}
          <div className="hidden lg:flex lg:col-span-4 flex-col h-full">
            <div className="flex items-center justify-between mb-4 px-1 shrink-0">
              <h3 className="font-bold text-lg text-foreground flex items-center gap-2">
                <TrendingUp className="text-primary" size={18}/> Top Charts
              </h3>
              <Link href="/trending" className="text-xs text-muted-foreground hover:text-primary transition-colors">View All</Link>
            </div>
            
            <div className="flex flex-col gap-3 flex-1">
              {sideList.map((anime: Anime, idx: number) => (
                <Link 
                  key={anime.mal_id} 
                  href={`/anime/${anime.mal_id}`} 
                  className="flex gap-4 items-center p-3 rounded-xl bg-card hover:bg-secondary/50 border border-border/50 hover:border-border transition-all group"
                >
                  <span className="text-xl font-black w-6 text-center text-muted-foreground/50 group-hover:text-primary transition-colors">
                    {idx + 3}
                  </span>
                  <div className="relative w-12 h-16 rounded-md overflow-hidden shrink-0 bg-muted shadow-sm border border-border/50">
                    <Image 
                      src={anime.images.jpg.image_url} 
                      alt={anime.title} 
                      fill 
                      className="object-cover group-hover:scale-110 transition-transform"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                      {anime.title}
                    </h4>
                  </div>
                </Link>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* LIST SECTIONS */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 space-y-16">
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground">Season Now</h2>
            <Link href="/seasonal" className="text-sm font-medium text-primary hover:text-primary/80 flex items-center gap-1 transition-colors">
              View All <ArrowRight size={16} />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6">
            {seasonalAnime.map((anime: Anime) => (
              <AnimeCard key={anime.mal_id} anime={anime} />
            ))}
          </div>
        </section>

        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground">All Time Popular</h2>
            <Link href="/popular" className="text-sm font-medium text-primary hover:text-primary/80 flex items-center gap-1 transition-colors">
              View All <ArrowRight size={16} />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6">
            {popularAnime.map((anime: Anime) => (
              <AnimeCard key={anime.mal_id} anime={anime} />
            ))}
          </div>
        </section>
      </div>
      {/* Responsive Footer */}
      <footer className="border-t border-border bg-card mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">

          {/* Flex container utama */}
          <div className="flex flex-col md:flex-row justify-between items-center md:items-start gap-6 md:gap-12">

            {/* Brand */}
            <div className="text-center md:text-left">
              <span className="font-bold text-xl tracking-tight">Feinime</span>
            </div>

            {/* Navigation Links */}
            <nav className="flex flex-wrap justify-center md:justify-start gap-4 md:gap-6 text-sm text-muted-foreground">
              {['Home', 'Popular', 'Trending', 'About', 'Contact', 'FAQ'].map((item) => (
                <a
                  key={item}
                  href="#"
                  className="hover:text-primary transition-colors"
                >
                  {item}
                </a>
              ))}
            </nav>

            {/* Social Icons */}
            <div className="flex justify-center md:justify-start items-center gap-4">
              <a
                href="#"
                className="text-muted-foreground hover:text-[#1DA1F2] transition-colors"
              >
                <span className="sr-only">Twitter</span>
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M23.954 4.569c-.885.389-1.83.654-2.825.775 1.014-.611 1.794-1.574 2.163-2.723-.951.564-2.005.974-3.127 1.195-.897-.955-2.178-1.55-3.594-1.55-2.717 0-4.92 2.204-4.92 4.917 0 .39.045.765.127 1.124-4.087-.205-7.72-2.164-10.148-5.144-.424.722-.666 1.561-.666 2.475 0 1.708.87 3.214 2.188 4.099-.807-.025-1.566-.248-2.229-.616v.061c0 2.385 1.693 4.374 3.946 4.827-.413.111-.849.171-1.296.171-.314 0-.615-.03-.916-.086.631 1.953 2.445 3.376 4.604 3.416-1.68 1.319-3.809 2.105-6.102 2.105-.396 0-.779-.023-1.158-.067 2.189 1.402 4.768 2.217 7.548 2.217 9.051 0 14-7.496 14-13.986 0-.21 0-.42-.015-.63 1.009-.73 1.884-1.64 2.584-2.675z" />
                </svg>
              </a>
              <a
                href="#"
                className="text-muted-foreground hover:text-[#5865F2] transition-colors"
              >
                <span className="sr-only">Discord</span>
                <svg className="w-5 h-5" viewBox="0 0 71 55" fill="currentColor">
                  <path d="M60.1 4.55A59 59 0 0 0 46.92 0c-.65 1.14-1.39 2.59-1.9 3.74a42 42 0 0 0-17 0C27.5 2.6 26.76 1.15 26.1 0A58.8 58.8 0 0 0 10.9 4.55C2.68 19.28.08 33.43 1.3 47.36c11.04 8.16 21.56 6.06 21.56 6.06 1.44-1.84 2.56-3.78 3.44-5.7-6.16-1.84-8.52-4.52-8.52-4.52.72.48 1.44.92 2.16 1.3 4.92 2.52 10.12 3.78 15.44 3.78s10.52-1.26 15.44-3.78c.72-.38 1.44-.82 2.16-1.3 0 0-2.36 2.68-8.52 4.52.88 1.92 2 3.86 3.44 5.7 0 0 10.52 2.1 21.56-6.06 1.22-13.92-1.38-28.07-9.6-42.8ZM24.76 37.34c-3.12 0-5.68-2.82-5.68-6.28 0-3.46 2.52-6.28 5.68-6.28 3.18 0 5.74 2.82 5.68 6.28 0 3.46-2.5 6.28-5.68 6.28Zm21.48 0c-3.12 0-5.68-2.82-5.68-6.28 0-3.46 2.52-6.28 5.68-6.28 3.18 0 5.74 2.82 5.68 6.28 0 3.46-2.5 6.28-5.68 6.28Z" />
                </svg>
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
