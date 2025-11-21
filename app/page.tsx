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

export const dynamic = 'force-dynamic'

export default async function Home() {
  const topAnimeData = await getTopAnime()
  const seasonAnimeData = await getSeasonNow()
  const popularAnimeData = await getPopularAnime()

  const heroAnimes: Anime[] = topAnimeData.data.slice(0, 2)
  const sideList: Anime[] = topAnimeData.data.slice(2, 7)
  const seasonalAnime: Anime[] = seasonAnimeData.data.slice(0, 12)
  const popularAnime: Anime[] = popularAnimeData.data.slice(0, 12)

  return (
    <main className="min-h-screen bg-background text-foreground">
      <Navbar />

      {/* HERO & TRENDING */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* LEFT: HERO - TELAH DIPERBAIKI */}
          {/* Menghapus lg:mt-12 */}
          <div className="lg:col-span-8 flex flex-col gap-6"> 
            {heroAnimes.map((anime: Anime, index: number) => (
              <div 
                key={anime.mal_id} 
                // Menambahkan h-full untuk menyamakan tinggi card
                className="relative flex flex-col sm:flex-row bg-card rounded-xl overflow-hidden border border-border/50 shadow-sm hover:shadow-lg transition-all group h-full" 
              >
                {/* IMAGE */}
                <div className="relative w-full sm:w-5/12 aspect-[16/9] sm:aspect-auto shrink-0 h-56 sm:h-auto overflow-hidden">
                  <Image
                    src={anime.images.jpg.large_image_url}
                    alt={anime.title}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                    priority={index === 0}
                  />

                  {/* Gradient adaptif */}
                  <div className="
                    absolute inset-0 
                    bg-gradient-to-t 
                    from-black/80 dark:from-black/90 
                    via-black/40 dark:via-black/20 
                    to-transparent
                  " />

                  {/* TRENDING BADGE - DIKEMBALIKAN KE STYLE SNIPPET KEDUA */}
                  <div
                    className="
                      absolute top-3 left-3
                      flex items-center gap-1
                      text-xs font-semibold
                      px-3 py-1 rounded-full

                      bg-card/80 
                      text-foreground
                      border border-border/50
                      backdrop-blur-md shadow
                    "
                  >
                    <TrendingUp size={14} />
                    #{index + 1} Trending
                  </div>
                </div>

                {/* TEXT SECTION */}
                <div className="flex flex-col justify-center p-5 sm:w-7/12 space-y-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-[10px] font-bold text-primary uppercase tracking-wider">
                      <span>{anime.type}</span>
                      <span>•</span>
                      <span>{anime.status}</span>
                    </div>

                    <Link href={`/anime/${anime.mal_id}`} className="block">
                      <h1 className="text-xl md:text-2xl font-extrabold leading-tight hover:text-primary transition-colors line-clamp-2">
                        {anime.title}
                      </h1>
                    </Link>
                  </div>

                  {/* INFO ICONS */}
                  <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">

                    {/* Rating */}
                    <span className="flex items-center gap-1 font-bold text-yellow-500 dark:text-yellow-400">
                      <Star className="fill-yellow-500 dark:fill-yellow-400" size={14} />
                      {anime.score}
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

                  {/* Synopsis */}
                  <p className="text-muted-foreground line-clamp-3 leading-relaxed text-sm">
                    {anime.synopsis}
                  </p>

                  {/* Button */}
                  <div className="pt-2 mt-auto">
                    <Link 
                      href={`/anime/${anime.mal_id}`} 
                      className="
                        inline-flex h-9 items-center justify-center 
                        rounded-md border border-input 
                        bg-background/60 backdrop-blur-sm 
                        px-6 text-xs font-bold text-foreground shadow-sm 
                        hover:bg-primary hover:text-primary-foreground transition-colors
                      "
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
            <div className="flex items-center justify-between mb-4 px-1">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <TrendingUp className="text-primary" size={18}/> Top Charts
              </h3>
              <Link href="/trending" className="text-xs text-muted-foreground hover:text-primary transition-colors">
                View All
              </Link>
            </div>

            <div className="flex flex-col gap-3">
              {sideList.map((anime: Anime, idx: number) => (
                <Link 
                  key={anime.mal_id} 
                  href={`/anime/${anime.mal_id}`} 
                  className="
                    flex gap-4 items-center p-3 rounded-xl 
                    bg-card hover:bg-secondary/40 
                    border border-border/50 hover:border-border 
                    transition-all group
                  "
                >
                  <span className="text-xl font-black w-6 text-center text-muted-foreground group-hover:text-primary transition-colors">
                    {idx + 3}
                  </span>

                  <div className="relative w-12 h-16 rounded-md overflow-hidden bg-muted shadow-sm border border-border/50">
                    <Image 
                      src={anime.images.jpg.image_url} 
                      alt={anime.title} 
                      fill 
                      className="object-cover group-hover:scale-110 transition-transform"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-semibold truncate group-hover:text-primary transition-colors">
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

        {/* Season Now */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl md:text-3xl font-bold">Season Now</h2>
            <Link href="/seasonal" className="text-sm font-medium text-primary hover:text-primary/80 flex items-center gap-1">
              View All <ArrowRight size={16} />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6">
            {seasonalAnime.map((anime: Anime) => (
              <AnimeCard key={anime.mal_id} anime={anime} />
            ))}
          </div>
        </section>

        {/* Popular */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl md:text-3xl font-bold">All Time Popular</h2>
            <Link href="/popular" className="text-sm font-medium text-primary hover:text-primary/80 flex items-center gap-1">
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

      {/* FOOTER */}
      <footer className="border-t border-border bg-card mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

          <div className="flex flex-col md:flex-row justify-between items-center gap-8">

            <div className="text-center md:text-left">
              <span className="font-bold text-xl">Feinime</span>
            </div>

            <nav className="flex flex-wrap justify-center gap-4 text-sm text-muted-foreground">
              {['Home', 'Popular', 'Trending', 'About', 'Contact', 'FAQ'].map((item) => (
                <a key={item} href="#" className="hover:text-primary transition-colors">
                  {item}
                </a>
              ))}
            </nav>

            <div className="flex justify-center items-center gap-4 text-muted-foreground">
              <a href="#" className="hover:text-primary transition-colors">
                <span className="sr-only">Twitter</span>
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M23.954 4.569c-.885.389..." />
                </svg>
              </a>

              <a href="#" className="hover:text-primary transition-colors">
                <span className="sr-only">Discord</span>
                <svg className="w-5 h-5" viewBox="0 0 71 55" fill="currentColor">
                  <path d="M60.1 4.55..." />
                </svg>
              </a>
            </div>

          </div>

          <div className="border-t border-border mt-8 pt-6 text-center text-muted-foreground text-sm">
            Feinime © 2025. All rights reserved.
          </div>

        </div>
      </footer>

    </main>
  )
}