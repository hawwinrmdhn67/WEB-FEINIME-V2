'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { SkeletonLoader } from '@/components/skeleton-loader'
import { Footer } from '@/components/feinime-footer'
import { Anime } from '@/lib/api'
import { useAnimeList } from '@/app/context/AnimeListContext'
import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'

const AnimeCard = dynamic(() => import('@/components/anime-card').then(mod => mod.AnimeCard), { ssr: false })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function MyListPage() {
  const { myList } = useAnimeList() 
  const [animeList, setAnimeList] = useState<Anime[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingFooter, setLoadingFooter] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function fetchDetailsFor(malIds: number[]) {
    if (!malIds || malIds.length === 0) {
      setAnimeList([])
      return
    }

    try {
      const promises = malIds.map(id =>
        fetch(`https://api.jikan.moe/v4/anime/${id}`).then(r => r.json())
      )

      const results = await Promise.all(promises)
      const fullAnimeList: Anime[] = results.map(r => r?.data).filter(Boolean)
      setAnimeList(fullAnimeList)
    } catch (err) {
      console.error('fetchDetailsFor error', err)
      setAnimeList([])
      setError('Failed to load anime details.')
    }
  }

  useEffect(() => {
    let mounted = true

    async function loadListForUser() {
      setLoading(true)
      setError(null)

      try {
        const {
          data: { user }
        } = await supabase.auth.getUser()

        if (!mounted) return

        if (user) {
          setIsAuthenticated(true)
          const { data, error: fetchErr } = await supabase
            .from('user_anime_list')
            .select('mal_id, status')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })

          if (fetchErr) {
            console.error('Supabase fetch list error', fetchErr)
            setError('Failed to fetch your saved list.')
            setAnimeList([])
          } else if (!data || data.length === 0) {
            setAnimeList([])
          } else {
            const malIds = data.map((row: any) => Number(row.mal_id)).filter(Boolean)
            await fetchDetailsFor(malIds)
          }
        } else {
          setIsAuthenticated(false)
          if (myList && myList.length > 0) {
            const malIds = myList.map(i => Number(i.mal_id)).filter(Boolean)
            await fetchDetailsFor(malIds)
          } else {
            setAnimeList([])
          }
        }
      } catch (err) {
        console.error('loadListForUser error', err)
        setError('Unexpected error loading list.')
        setAnimeList([])
      } finally {
        if (mounted) setLoading(false)
      }
    }

    loadListForUser()
    return () => {
      mounted = false
    }
  }, [myList]) 

  useEffect(() => {
    if (!loading) {
      const t = setTimeout(() => setLoadingFooter(false), 120)
      return () => clearTimeout(t)
    }
  }, [loading])

  return (
    <main className="min-h-screen bg-background text-foreground flex flex-col">

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-1 w-full">
        {/* HEADER */}
        <div className="mb-10 text-center md:text-left">
          {loading ? (
            <SkeletonLoader type="page-header" />
          ) : (
            <>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">My List</h1>
              <p className="text-muted-foreground">
                {isAuthenticated
                  ? 'Your saved anime list track progress and manage favorites.'
                  : 'You are not signed in. Showing local list or save your list by signing in.'}
              </p>
            </>
          )}
        </div>

        {/* AUTHENTICATION */}
        {isAuthenticated === false && (
          <div className="mb-6 flex items-center justify-center">
            <div className="rounded-md bg-secondary/10 px-4 py-2 text-sm">
              <span className="mr-3">Want to sync your list across devices?</span>
              <Link href="/login" className="underline font-medium">
                Sign in with Google
              </Link>
            </div>
          </div>
        )}

        {/* ERRORS */}
        {error && (
          <div className="mb-6">
            <div className="text-sm text-red-500">{error}</div>
          </div>
        )}

        {/* GRID CONTENT */}
        {loading ? (
          <SkeletonLoader type="my-list" count={12} />
        ) : animeList.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
            {animeList.map(anime => (
              <AnimeCard key={anime.mal_id} anime={anime} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-secondary/20 rounded-xl border border-dashed border-border flex flex-col items-center justify-center h-64">
            <p className="text-muted-foreground text-lg font-medium">No anime in your list</p>
            <p className="text-sm text-muted-foreground/60 mt-1">
              {isAuthenticated ? (
                <>You haven't saved any anime yet. Start adding anime to track your progress!</>
              ) : (
                <>Your list is empty add some shows or <Link href="/login" className="underline">sign in</Link> to sync your list.</>
              )}
            </p>
          </div>
        )}
      </div>

      {/* FOOTER */}
      {loadingFooter ? <SkeletonLoader type="footer" /> : <Footer />}
    </main>
  )
}