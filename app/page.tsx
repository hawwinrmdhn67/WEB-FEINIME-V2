'use client'

import { useState, useEffect } from "react"
import { 
  getTopAnime, 
  getSeasonNow, 
  getPopularAnime, 
  Anime 
} from "@/lib/api"
import { Navbar } from "@/components/navbar"
import { AnimeCard } from "@/components/anime-card"
import { SkeletonLoader } from "@/components/skeleton-loader"
import Link from "next/link"
import { ArrowRight, Star, TrendingUp, Calendar as CalendarIcon, PlayCircle } from "lucide-react"
import Image from "next/image"

export default function Home() {
  const [topAnimeData, setTopAnimeData] = useState<Anime[]>([])
  const [seasonalAnime, setSeasonalAnime] = useState<Anime[]>([])
  const [popularAnime, setPopularAnime] = useState<Anime[]>([])

  const [loadingTop, setLoadingTop] = useState(true)
  const [loadingOthers, setLoadingOthers] = useState(true)

  const maxItems = 12
  const seasonalAnimeLimited = seasonalAnime.slice(0, maxItems)
  const popularAnimeLimited = popularAnime.slice(0, maxItems)

  useEffect(() => {
    // Step 1: fetch Top Anime
    const fetchTopAnime = async () => {
      setLoadingTop(true)
      try {
        const res = await getTopAnime()
        setTopAnimeData(res.data || [])
      } catch {
        setTopAnimeData([])
      } finally {
        setLoadingTop(false)
      }
    }
    fetchTopAnime()
  }, []) 

  useEffect(() => {
    // Step 2: fetch Seasonal & Popular setelah Top Anime selesai (atau jika Top sudah ada)
    if (!loadingTop && loadingOthers) {
      const fetchOthers = async () => {
        try {
          const [seasonRes, popularRes] = await Promise.all([getSeasonNow(), getPopularAnime()])
          setSeasonalAnime(seasonRes.data || [])
          setPopularAnime(popularRes.data || [])
        } catch {
          setSeasonalAnime([])
          setPopularAnime([])
        } finally {
          setLoadingOthers(false)
        }
      }
      fetchOthers()
    }
  }, [loadingTop, loadingOthers])

  const heroAnimes = topAnimeData.slice(0, 2)
  const sideList = topAnimeData.slice(2, 7)
  const loadingSeason = loadingOthers
  const loadingPopular = loadingOthers

  return (
    <main className="min-h-screen bg-background text-foreground">
      <Navbar />

      {/* HERO & TOP CHARTS */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Hero Section (Main Content) */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            {loadingTop 
              ? <SkeletonLoader type="home" count={2} /> 
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

          {/* Sidebar/Top Charts Section */}
          <div className="lg:col-span-4 flex flex-col h-full"> 
            <div className="flex items-center justify-between mb-4 px-1">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <TrendingUp className="text-primary" size={18}/> Top Charts
              </h3>
              <Link href="/trending" className="text-xs text-muted-foreground hover:text-primary transition-colors">
                View All
              </Link>
            </div>
            {loadingTop 
              ? <SkeletonLoader type="trending" count={5} /> 
              : (
                <div className="flex flex-col gap-3">
                  {sideList.map((anime, idx) => (
                    <Link key={anime.mal_id} href={`/anime/${anime.mal_id}`} className="flex gap-4 items-center p-3 rounded-xl bg-card hover:bg-secondary/40 border border-border/50 hover:border-border transition-all group">
                      <span className="text-xl font-black w-6 text-center text-muted-foreground group-hover:text-primary transition-colors">
                        {idx + 3}
                      </span>
                      <div className="relative w-12 h-16 rounded-md overflow-hidden bg-muted shadow-sm border border-border/50">
                        <Image src={anime.images.jpg.image_url} alt={anime.title} fill className="object-cover group-hover:scale-110 transition-transform"/>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-semibold truncate group-hover:text-primary transition-colors">{anime.title}</h4>
                      </div>
                    </Link>
                  ))}
                </div>
              )
            }
          </div>
        </div>
      </div>

      {/* Seasonal Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 space-y-16">
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl md:text-3xl font-bold">Season Now</h2>
            <Link href="/seasonal" className="text-sm font-medium text-primary hover:text-primary/80 flex items-center gap-1">
              View All <ArrowRight size={16}/>
            </Link>
          </div>
          {loadingSeason 
            ? <SkeletonLoader type="seasonal" count={12} /> 
            : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6">
                {seasonalAnimeLimited.map(anime => <AnimeCard key={anime.mal_id} anime={anime} />)}
              </div>
            )
          }
        </section>

        {/* Popular Section */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl md:text-3xl font-bold">All Time Popular</h2>
            <Link href="/popular" className="text-sm font-medium text-primary hover:text-primary/80 flex items-center gap-1">
              View All <ArrowRight size={16}/>
            </Link>
          </div>
          {loadingPopular 
            ? <SkeletonLoader type="popular" count={12} /> 
            : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6">
                {popularAnimeLimited.map(anime => <AnimeCard key={anime.mal_id} anime={anime} />)}
              </div>
            )
          }
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