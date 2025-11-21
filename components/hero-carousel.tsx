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
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }

  const startScroll = () => {
    if (intervalRef.current || !scrollRef.current) return
    
    const el = scrollRef.current

    intervalRef.current = setInterval(() => {
      el.scrollBy({ left: 300, behavior: "smooth" })

      // Reset ke awal saat mencapai ujung
      if (el.scrollLeft + el.clientWidth >= el.scrollWidth - 200) {
        setTimeout(() => {
          el.scrollTo({ left: 0, behavior: "smooth" })
        }, 600)
      }
    }, 4000)
  }

  useEffect(() => {
    startScroll()
    return () => stopScroll()
  }, [])

  const scrollLeft = () => {
    stopScroll()
    scrollRef.current?.scrollBy({ left: -300, behavior: "smooth" })
  }
  
  const scrollRight = () => {
    stopScroll()
    scrollRef.current?.scrollBy({ left: 300, behavior: "smooth" })
  }

  return (
    <section className="w-full mt-4 sm:mt-8 mb-8 relative group">
      
      {/* TITLE HEADER */}
      <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 mb-2">
        <h2 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">
          {title}
        </h2>
        <span className="text-xs text-muted-foreground md:hidden">Swipe →</span>
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

        {/* Duplicate for seamless loop */}
        {animes.map((a, i) => (
          <HorizontalCard key={`${a.mal_id}-dup-${i}`} anime={a} />
        ))}
      </div>
    </section>
  )
}
