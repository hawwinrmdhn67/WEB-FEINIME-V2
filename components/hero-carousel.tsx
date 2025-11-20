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

  const stopScroll = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }

  const startScroll = () => {
    if (intervalRef.current || !scrollRef.current) return;
    
    const el = scrollRef.current;

    // Mulai interval autoscroll
    intervalRef.current = setInterval(() => {
      el.scrollBy({ left: 300, behavior: "smooth" });
      if (el.scrollLeft + el.clientWidth >= el.scrollWidth - 100) {
        setTimeout(() => { el.scrollTo({ left: 0, behavior: "smooth" }) }, 800)
      }
    }, 4000);
  }

  useEffect(() => {
    startScroll();
    return () => stopScroll();
  }, [])

  const scrollLeft = () => {
    stopScroll();
    scrollRef.current?.scrollBy({ left: -300, behavior: "smooth" })
  }
  
  const scrollRight = () => {
    stopScroll();
    scrollRef.current?.scrollBy({ left: 300, behavior: "smooth" })
  }

  return (
    <section className="w-full mt-4 sm:mt-8 mb-8 relative group">
      <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 mb-2">
        <h2 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">
          {title}
        </h2>
        <span className="text-xs text-muted-foreground md:hidden">Swipe →</span>
      </div>

      {/* Navigation Buttons (Muncul saat hover di section) */}
      <div className="absolute top-1/2 -translate-y-1/2 left-2 md:left-4 z-40 hidden md:block opacity-0 group-hover:opacity-100 transition-opacity duration-300">
         <button onClick={scrollLeft} className="bg-black/50 hover:bg-black/80 text-white p-3 rounded-full backdrop-blur-sm shadow-lg border border-white/10">
          <ChevronLeft size={24} />
        </button>
      </div>
      <div className="absolute top-1/2 -translate-y-1/2 right-2 md:right-4 z-40 hidden md:block opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <button onClick={scrollRight} className="bg-black/50 hover:bg-black/80 text-white p-3 rounded-full backdrop-blur-sm shadow-lg border border-white/10">
          <ChevronRight size={24} />
        </button>
      </div>

      {/* === CAROUSEL CONTAINER === */}
      <div 
        ref={scrollRef} 
        onMouseEnter={stopScroll} // PAUSE SCROLL
        onMouseLeave={startScroll} // RESUME SCROLL
        className="flex gap-4 sm:gap-6 overflow-x-auto px-4 sm:px-6 lg:px-8 py-10 snap-x snap-mandatory no-scrollbar scroll-smooth"
      >
        {animes.map((a, i) => (
          <HorizontalCard key={`${a.mal_id}-${i}`} anime={a} />
        ))}
        {/* Duplikasi untuk loop effect */}
        {animes.map((a, i) => (
          <HorizontalCard key={`${a.mal_id}-dup-${i}`} anime={a} />
        ))}
      </div>

      <style jsx>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </section>
  )
}