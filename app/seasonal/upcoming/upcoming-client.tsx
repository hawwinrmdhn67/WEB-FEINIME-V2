'use client'

import { Anime } from '@/lib/api'
import Link from 'next/link'
import { Navbar } from '@/components/navbar'
import { AnimeCard } from '@/components/anime-card'
import { Footer } from '@/components/feinime-footer'

interface Props {
  animes: Anime[]
}

export default function UpcomingClient({ animes }: Props) {
  return (
    <main className="min-h-screen bg-background text-foreground flex flex-col">
      <Navbar />

      <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">

        {/* HEADER (UI SAMA) */}
        <div className="text-center md:text-left mb-10 border-b border-border/40 pb-6">
          <h1 className="text-3xl md:text-4xl font-bold mb-2 tracking-tight text-primary flex items-center gap-2 justify-center md:justify-start">
            Upcoming Anime
          </h1>
          <p className="text-muted-foreground">
            Discover the most anticipated anime series coming next season
          </p>
        </div>

        {/* GRID */}
        {animes.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
            {animes.map(anime => (
              <AnimeCard key={anime.mal_id} anime={anime} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-secondary/20 rounded-xl border border-dashed border-border">
            <p className="text-muted-foreground">
              No upcoming anime found
            </p>
          </div>
        )}

      </div>

      <Footer />
    </main>
  )
}
