// app/context/AnimeListContext.tsx  (atau lokasi yang sesuai)
'use client'

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getBrowserSupabase } from '@/lib/supabaseClient'

export interface MyAnimeEntry {
  id?: number
  user_id?: string
  mal_id: number
  title?: string | null
  image_url?: string | null
  total_episodes?: number | null
  status?: 'Watching' | 'Completed' | 'Plan to Watch' | 'Dropped' | 'On Hold' | string
  progress?: number
  score?: number
  created_at?: string | null
}

interface AnimeListContextType {
  myList: MyAnimeEntry[]
  loading: boolean
  isAuthenticated: boolean | null
  userId: string | null
  refresh: () => Promise<void>
  addToMyList: (
    item: { mal_id: number; title?: string | null; image_url?: string | null; total_episodes?: number | null },
    status?: string
  ) => Promise<void>
  removeFromMyList: (mal_id: number) => Promise<void>
  updateProgress: (mal_id: number, progress: number) => Promise<void>
  updateStatus: (mal_id: number, status: string) => Promise<void>
}

const AnimeListContext = createContext<AnimeListContextType | undefined>(undefined)

export function AnimeListProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [myList, setMyList] = useState<MyAnimeEntry[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
  const [userId, setUserId] = useState<string | null>(null)

  // fetch user's list from Supabase (guarded)
  async function fetchList(uid: string) {
    setLoading(true)
    try {
      const sb = getBrowserSupabase()
      if (!sb) {
        setMyList([])
        return
      }
      const { data, error } = await sb
        .from('user_anime_list')
        .select('id, user_id, mal_id, title, image_url, total_episodes, status, progress, score, created_at')
        .eq('user_id', uid)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('fetchList error', error)
        setMyList([])
      } else {
        setMyList((data ?? []) as MyAnimeEntry[])
      }
    } catch (err) {
      console.error('fetchList unexpected', err)
      setMyList([])
    } finally {
      setLoading(false)
    }
  }

  function requireAuthRedirect() {
    const returnTo = typeof window !== 'undefined' ? window.location.href : '/'
    router.push(`/login?redirect=${encodeURIComponent(returnTo)}`)
  }

  // init auth state + subscribe (client-side guarded)
  useEffect(() => {
    let mounted = true
    let listenerData: any = null

    async function init() {
      const sb = getBrowserSupabase()
      if (!sb) {
        setIsAuthenticated(false)
        setUserId(null)
        setMyList([])
        setLoading(false)
        return
      }

      try {
        const { data: getUserData, error: getUserError } = await sb.auth.getUser()
        if (getUserError) {
          console.warn('getUser error', getUserError)
        }
        const user = getUserData?.user ?? null
        if (!mounted) return

        if (user) {
          setIsAuthenticated(true)
          setUserId(user.id)
          await fetchList(user.id)
        } else {
          setIsAuthenticated(false)
          setUserId(null)
          setMyList([])
        }
      } catch (err) {
        console.error('init auth error', err)
        if (!mounted) return
        setIsAuthenticated(false)
        setUserId(null)
        setMyList([])
      } finally {
        if (mounted) setLoading(false)
      }

      // subscribe to auth changes
      try {
        const ret = sb.auth.onAuthStateChange(async (_event, session) => {
          const u = session?.user ?? null
          if (!mounted) return
          if (u) {
            setIsAuthenticated(true)
            setUserId(u.id)
            await fetchList(u.id)
          } else {
            setIsAuthenticated(false)
            setUserId(null)
            setMyList([])
          }
        })
        listenerData = ret?.data ?? ret
      } catch (err) {
        console.warn('onAuthStateChange subscribe failed', err)
        listenerData = null
      }
    }

    init()

    return () => {
      mounted = false
      try {
        if (!listenerData) return
        if (typeof listenerData.unsubscribe === 'function') {
          listenerData.unsubscribe()
        } else if (listenerData.subscription && typeof listenerData.subscription.unsubscribe === 'function') {
          listenerData.subscription.unsubscribe()
        } else if (listenerData.subscription && typeof listenerData.subscription.remove === 'function') {
          listenerData.subscription.remove()
        } else if (typeof listenerData.remove === 'function') {
          listenerData.remove()
        }
      } catch (err) {
        console.warn('failed to unsubscribe auth listener', err)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const refresh = async () => {
    if (!userId) {
      setMyList([])
      return
    }
    await fetchList(userId)
  }

  const addToMyList = async (
    item: { mal_id: number; title?: string | null; image_url?: string | null; total_episodes?: number | null },
    status = 'Plan to Watch'
  ) => {
    if (!userId) {
      requireAuthRedirect()
      return
    }
    setLoading(true)
    try {
      const sb = getBrowserSupabase()
      if (!sb) return
      const { data: existing, error: existErr } = await sb
        .from('user_anime_list')
        .select('id')
        .eq('user_id', userId)
        .eq('mal_id', item.mal_id)
        .limit(1)

      if (!existErr && existing && (existing as any).length > 0) {
        await fetchList(userId)
        return
      }

      const payload = {
        user_id: userId,
        mal_id: item.mal_id,
        title: item.title ?? null,
        image_url: item.image_url ?? null,
        total_episodes: item.total_episodes ?? null,
        status,
        progress: 0,
        score: 0
      }

      const { error } = await sb.from('user_anime_list').insert(payload).select().limit(1)
      if (error) {
        console.warn('insert error', error)
      } else {
        await fetchList(userId)
      }
    } catch (err) {
      console.error('addToMyList unexpected', err)
    } finally {
      setLoading(false)
    }
  }

  const removeFromMyList = async (mal_id: number) => {
    if (!userId) {
      requireAuthRedirect()
      return
    }
    setLoading(true)
    try {
      const sb = getBrowserSupabase()
      if (!sb) return
      await sb.from('user_anime_list').delete().match({ user_id: userId, mal_id })
      await fetchList(userId)
    } catch (err) {
      console.error('removeFromMyList unexpected', err)
    } finally {
      setLoading(false)
    }
  }

  const updateProgress = async (mal_id: number, progress: number) => {
    if (!userId) {
      requireAuthRedirect()
      return
    }
    setLoading(true)
    try {
      const sb = getBrowserSupabase()
      if (!sb) return
      await sb.from('user_anime_list').update({ progress }).match({ user_id: userId, mal_id })
      await fetchList(userId)
    } catch (err) {
      console.error('updateProgress unexpected', err)
    } finally {
      setLoading(false)
    }
  }

  const updateStatus = async (mal_id: number, status: string) => {
    if (!userId) {
      requireAuthRedirect()
      return
    }
    setLoading(true)
    try {
      const sb = getBrowserSupabase()
      if (!sb) return
      await sb.from('user_anime_list').update({ status }).match({ user_id: userId, mal_id })
      await fetchList(userId)
    } catch (err) {
      console.error('updateStatus unexpected', err)
    } finally {
      setLoading(false)
    }
  }

  const value = useMemo(
    () => ({
      myList,
      loading,
      isAuthenticated,
      userId,
      refresh,
      addToMyList,
      removeFromMyList,
      updateProgress,
      updateStatus
    }),
    [myList, loading, isAuthenticated, userId]
  )

  return <AnimeListContext.Provider value={value}>{children}</AnimeListContext.Provider>
}

export function useAnimeList() {
  const ctx = useContext(AnimeListContext)
  if (!ctx) throw new Error('useAnimeList must be used within AnimeListProvider')
  return ctx
}
