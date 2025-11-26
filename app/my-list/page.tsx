'use client'

import { useState, useEffect } from 'react'
import { Navbar } from '@/components/navbar'
import dynamic from 'next/dynamic'
import { SkeletonLoader } from '@/components/skeleton-loader'
import { Anime } from '@/lib/api'
import { useAnimeList } from '@/app/context/AnimeListContext'
import { Footer } from '@/components/feinime-footer'

interface AnimeCardProps {
  anime: Anime
}

const AnimeCard = dynamic<AnimeCardProps>(
  () => import('@/components/anime-card').then(mod => mod.AnimeCard),
  { ssr: false }
)

export default function MyListPage() {
  const { myList } = useAnimeList()
  const [animeList, setAnimeList] = useState<Anime[]>([])
  const [loading, setLoading] = useState(true)

  const fetchAnimeData = async () => {
    setLoading(true)
    try {
      // Filter hanya yang statusnya 'Plan to Watch' (atau sesuaikan logika Anda)
      // Jika ingin menampilkan SEMUA yang ada di myList, hapus .filter(...)
      const planToWatch = myList // .filter(a => a.status === 'Plan to Watch') 
      
      const promises = planToWatch.map(a =>
        fetch(`https://api.jikan.moe/v4/anime/${a.mal_id}`).then(res => res.json())
      )
      const results = await Promise.all(promises)
      const fullAnimeList: Anime[] = results.map(r => r.data).filter(Boolean) // Filter undefined jika ada error fetch
      setAnimeList(fullAnimeList)
    } catch (err) {
      console.error(err)
      setAnimeList([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAnimeData()
  }, [myList])

  return (
  <main className="min-h-screen bg-background text-foreground flex flex-col">
    <Navbar />

    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-1 w-full">
      
      {/* HEADER: Loading vs Content */}
      <div className="mb-10 text-center md:text-left">
        {loading ? (
           <SkeletonLoader type="page-header" />
        ) : (
          <>
            {/* Mengubah mb-3 jadi mb-2 */}
            <h1 className="text-3xl md:text-4xl font-bold mb-2">
              My List
            </h1>
            {/* Menghapus 'text-base md:text-lg' agar ukuran font kembali normal (seperti trending) */}
            <p className="text-muted-foreground">
              Your personal anime watchlist track progress and manage favorites
            </p>
          </>
        )}
      </div>

      {/* GRID */}
      {loading ? (
        <SkeletonLoader type="popular" count={12} />
      ) : animeList.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
          {animeList.map(anime => (
            <AnimeCard key={anime.mal_id} anime={anime} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-secondary/20 rounded-xl border border-dashed border-border flex flex-col items-center justify-center h-64">
          <p className="text-muted-foreground text-lg font-medium">
            No anime in your list
          </p>
          <p className="text-sm text-muted-foreground/60 mt-1">
            Start adding anime to track your progress!
          </p>
        </div>
      )}
     </div>
    <Footer />
  </main>
  )
}