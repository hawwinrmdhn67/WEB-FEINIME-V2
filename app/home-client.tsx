'use client'

import { Anime } from '@/lib/api'
import { AnimeCard } from '@/components/anime-card'
import { SkeletonLoader } from '@/components/skeleton-loader'
import Link from 'next/link'
import { ArrowRight, Star, TrendingUp, Calendar as CalendarIcon, PlayCircle } from 'lucide-react'
import Image from 'next/image'
import { Footer } from '@/components/feinime-footer'

interface Props {
  topAnimeData: Anime[]
  seasonalAnime: Anime[]
  popularAnime: Anime[]
}

export default function Home({
  topAnimeData,
  seasonalAnime,
  popularAnime,
}: Props) {
  // ⛔ UI TIDAK DIUBAH
  const loadingTop = topAnimeData.length === 0
  const loadingOthers = seasonalAnime.length === 0 && popularAnime.length === 0
  const loadingFooter = loadingTop || loadingOthers

  const maxItems = 12
  const seasonalAnimeLimited = seasonalAnime.slice(0, maxItems)
  const popularAnimeLimited = popularAnime.slice(0, maxItems)

  const heroAnimes = topAnimeData.slice(0, 2)
  const sideList = topAnimeData.slice(2, 7)

  return (
    <main className="min-h-screen bg-background text-foreground">

      {/* HERO & TOP CHARTS */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Hero Section (Main Content) */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            {loadingTop 
              ? <SkeletonLoader type="home-hero" count={2} /> 
              : heroAnimes.map((anime, index) => (
                <div key={anime.mal_id} className="relative flex flex-col sm:flex-row bg-card rounded-xl overflow-hidden border border-border/50 shadow-sm hover:shadow-lg transition-all group h-full">
                  
                  {/* Image Section */}
                  <div className="relative w-full sm:w-5/12 aspect-[16/9] sm:aspect-auto shrink-0 h-56 sm:h-auto overflow-hidden">
                    <Image 
                      src={anime.images.jpg.large_image_url} 
                      alt={anime.title} 
                      fill 
                      className="object-cover transition-transform duration-700 group-hover:scale-105" 
                      priority={index===0}
                    />
                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

                    {/* --- BADGE TRENDING (POJOK KIRI ATAS GAMBAR) --- */}
                    <div className="absolute top-3 left-3 z-20 flex flex-col items-start gap-2">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-background/80 backdrop-blur-md text-primary text-[11px] font-bold border border-primary/20 shadow-md uppercase tracking-wide">
                        <TrendingUp size={12} className="stroke-[3px]" />
                        Trending #{index + 1}
                      </span>
                    </div>
                  </div>

                    {/* Content Section */}
                  <div className="flex flex-col p-5 sm:w-7/12 flex-grow h-full">
                    <div className="flex flex-col flex-grow">
                      
                      <div className="mb-3">
                        {/* Type Badge (TV/Movie) tetap di text area agar rapi */}
                        <div className="flex items-center gap-2 text-[10px] font-bold text-primary uppercase tracking-wider mb-1">
                          <span className="bg-secondary/50 px-2 py-0.5 rounded text-secondary-foreground border border-border/50">
                            {anime.type}
                          </span>
                        </div>
                        
                        <Link href={`/anime/${anime.mal_id}`}>
                          <h1 className="text-xl md:text-2xl font-extrabold leading-tight hover:text-primary transition-colors line-clamp-2">
                            {anime.title}
                          </h1>
                        </Link>
                      </div>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground mb-3">
                        <span className="flex items-center gap-1 font-bold text-yellow-500">
                          <Star className="fill-yellow-500" size={14} />
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
                      <p className="text-muted-foreground line-clamp-3 leading-relaxed text-sm mb-3">
                        {anime.synopsis}
                      </p>
                    </div>
                    
                    <div className="pt-2 mt-auto">
                      <Link href={`/anime/${anime.mal_id}`} className="inline-flex h-9 items-center justify-center rounded-md border border-input bg-background/60 backdrop-blur-sm px-6 text-xs font-bold text-foreground shadow-sm hover:bg-primary hover:text-primary-foreground transition-colors">
                        View Details
                      </Link>
                    </div>
                  </div>
                </div>
              ))
            }
          </div>

          {/* --- B. SIDEBAR TOP CHARTS (Kanan - 4 Kolom) --- */}
          <div className="lg:col-span-4 flex flex-col h-full"> 
            
            {/* Header Sidebar Logic */}
            {loadingTop ? (
               <SkeletonLoader type="header-side" />
            ) : (
              <div className="flex items-center justify-between mb-4 px-1">
                <h3 className="font-bold text-lg flex items-center gap-2">
                  <TrendingUp className="text-primary" size={18}/> Top Charts
                </h3>
                <Link href="/trending" className="text-xs text-muted-foreground hover:text-primary transition-colors">
                  View All
                </Link>
              </div>
            )}

            {/* Content Sidebar Logic */}
            {loadingTop 
              ? <SkeletonLoader type="trending" count={5} /> 
              : (
                <div className="flex flex-col gap-3">
                  {sideList.map((anime, idx) => (
                    <Link key={anime.mal_id} href={`/anime/${anime.mal_id}`} className="flex gap-4 items-center p-3 rounded-xl bg-card hover:bg-secondary/40 border border-border/50 hover:border-border transition-all group">
                      <span className="text-xl font-black w-6 text-center text-muted-foreground group-hover:text-primary transition-colors">
                        {idx + 3}
                      </span>
                      <div className="relative w-12 h-16 rounded-md overflow-hidden bg-muted shadow-sm border border-border/50 shrink-0">
                        <Image src={anime.images.jpg.image_url} alt={anime.title} fill className="object-cover group-hover:scale-110 transition-transform" sizes="48px"/>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-semibold truncate group-hover:text-primary transition-colors">{anime.title}</h4>
                        <div className="flex items-center gap-2 text-[10px] text-muted-foreground mt-1">
                          <span>{anime.type || 'TV'}</span>
                          <span>•</span>
                          <span className="flex items-center gap-1 text-yellow-500">★ {anime.score}</span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )
            }
          </div>
        </div>
      </div>

      {/* ===========================
          SECTION 2: SEASONAL & POPULAR
         =========================== */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 space-y-16">
        
        {/* --- SEASONAL --- */}
        <section>
          {/* Header Logic */}
          {loadingOthers ? (
             <SkeletonLoader type="header-section" />
          ) : (
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Season Now</h2>
              <Link href="/seasonal" className="text-sm font-medium text-primary hover:text-primary/80 flex items-center gap-1">
                View All <ArrowRight size={16}/>
              </Link>
            </div>
          )}
          
          {/* Grid Logic */}
          {loadingOthers 
            ? <SkeletonLoader type="seasonal" count={12} /> 
            : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6">
                {seasonalAnimeLimited.map(anime => 
                <AnimeCard
                  key={anime.mal_id}
                  anime={anime}
                  variant="home"
                />
                )}
              </div>
            )
          }
        </section>

        {/* --- POPULAR --- */}
        <section>
          {/* Header Logic */}
          {loadingOthers ? (
             <SkeletonLoader type="header-section" />
          ) : (
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl md:text-3xl font-bold tracking-tight">All Time Popular</h2>
              <Link href="/popular" className="text-sm font-medium text-primary hover:text-primary/80 flex items-center gap-1">
                View All <ArrowRight size={16}/>
              </Link>
            </div>
          )}

          {/* Grid Logic */}
          {loadingOthers 
            ? <SkeletonLoader type="popular" count={12} /> 
            : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6">
                {popularAnimeLimited.map(anime => 
                <AnimeCard
                    key={anime.mal_id}
                    anime={anime}
                    variant="home"
                  />
                )}
              </div>
            )
          }
        </section>
      </div>

      {/* FOOTER / SKELETON FOOTER */}
      {loadingFooter ? <SkeletonLoader type="footer" /> : <Footer />}
    </main>
  )
}
