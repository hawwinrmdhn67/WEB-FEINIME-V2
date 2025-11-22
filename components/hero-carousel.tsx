'use client'

import { useRef, useEffect } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { HorizontalCard, Anime } from "./horizontal-card"

export interface HeroCarouselProps {
  title: string
  animes: Anime[]
}

export function HeroCarousel({ title, animes }: HeroCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null) 
  
  // Hitung jumlah item asli
  const totalItems = animes.length;
  // Perkiraan lebar satu kartu + gap. Dibuat konstan
  const SCROLL_AMOUNT = 300; 
  const INTERVAL_DURATION = 4000;

  const stopScroll = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }

  const startScroll = () => {
    if (intervalRef.current || !scrollRef.current || totalItems <= 1) return
    
    const el = scrollRef.current

    // Titik reset: Awal dari list duplikat (tengah dari total lebar)
    // Kita reset sedikit sebelum titik ini tercapai
    const resetThreshold = el.scrollWidth / 2;

    intervalRef.current = setInterval(() => {
      // 1. Scroll ke kanan
      el.scrollBy({ left: SCROLL_AMOUNT, behavior: "smooth" })

      // 2. Cek apakah sudah melewati batas reset
      if (el.scrollLeft >= resetThreshold - SCROLL_AMOUNT) { 
        // Lakukan reset secara instan (tanpa behavior: "smooth") setelah animasi selesai
        setTimeout(() => {
          el.scrollTo({ left: 0, behavior: "instant" })
        }, 500) // Waktu tunggu sedikit lebih singkat dari SCROLL_AMOUNT
      }
    }, INTERVAL_DURATION)
  }

  useEffect(() => {
    // Pastikan minimal ada dua item untuk looping
    if (totalItems > 1) {
      startScroll()
    }
    return () => stopScroll()
  }, [totalItems])

  const scrollLeft = () => {
    stopScroll()
    scrollRef.current?.scrollBy({ left: -SCROLL_AMOUNT, behavior: "smooth" })
    startScroll() // Mulai lagi setelah interaksi
  }
  
  const scrollRight = () => {
    stopScroll()
    scrollRef.current?.scrollBy({ left: SCROLL_AMOUNT, behavior: "smooth" })
    startScroll() // Mulai lagi setelah interaksi
  }

  return (
    <section className="w-full mt-4 sm:mt-8 mb-8 relative group">
      
      {/* TITLE HEADER */}
      <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 mb-2">
        <h2 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">
          {title}
        </h2>
        {/* Teks "Swipe →" hanya muncul di layar yang sangat kecil */}
        <span className="text-xs text-muted-foreground sm:hidden">Swipe →</span> 
      </div>

      {/* LEFT SCROLL BUTTON */}
      <div className="
        absolute top-1/2 -translate-y-1/2 left-2 md:left-4 
        z-40 hidden md:block 
        opacity-0 group-hover:opacity-100 
        transition-opacity duration-300
      ">
        <button 
          onClick={scrollLeft}
          className="
            bg-background/70 hover:bg-background/90 
            text-foreground p-3 rounded-full 
            backdrop-blur-md shadow-lg 
            border border-border/60
            transition-colors duration-200
          "
        >
          <ChevronLeft size={22} />
        </button>
      </div>

      {/* RIGHT SCROLL BUTTON */}
      <div className="
        absolute top-1/2 -translate-y-1/2 right-2 md:right-4 
        z-40 hidden md:block 
        opacity-0 group-hover:opacity-100 
        transition-opacity duration-300
      ">
        <button 
          onClick={scrollRight} 
          className="
            bg-background/70 hover:bg-background/90
            text-foreground p-3 rounded-full 
            backdrop-blur-md shadow-lg 
            border border-border/60
            transition-colors duration-200
          "
        >
          <ChevronRight size={22} />
        </button>
      </div>

      {/* === CAROUSEL === */}
      <div 
        ref={scrollRef}
        onMouseEnter={stopScroll}
        onMouseLeave={startScroll}
        className="
          flex gap-4 sm:gap-6 overflow-x-auto 
          px-4 sm:px-6 lg:px-8 py-10 
          snap-x snap-mandatory 
          no-scrollbar scroll-smooth
        "
      >
        {animes.map((a, i) => (
          <HorizontalCard key={`${a.mal_id}-${i}`} anime={a} />
        ))}

        {/* Duplicate for seamless loop (hanya perlu diduplikasi jika lebih dari 1 item) */}
        {totalItems > 1 && animes.map((a, i) => (
          <HorizontalCard key={`${a.mal_id}-dup-${i}`} anime={a} />
        ))}
      </div>
    </section>
  )
}