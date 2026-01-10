'use client'

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getBrowserSupabase } from '@/lib/supabaseClient'

export interface MyAnimeEntry {
  id?: string
  user_id?: string
  mal_id: number
  title?: string | null
  image_url?: string | null
  total_episodes?: number | null
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
  addToMyList: (item: { mal_id: number; title?: string | null; image_url?: string | null; total_episodes?: number | null }) => Promise<void>
  removeFromMyList: (mal_id: number) => Promise<void>
  updateProgress: (mal_id: number, progress: number) => Promise<void>
}

const AnimeListContext = createContext<AnimeListContextType | undefined>(undefined)

export function AnimeListProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [myList, setMyList] = useState<MyAnimeEntry[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
  const [userId, setUserId] = useState<string | null>(null)

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
        .select('id, user_id, mal_id, title, image_url, total_episodes, progress, score, created_at')
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

  useEffect(() => {
    let mounted = true
    let subscription: any = null

    async function init() {
      const sb = getBrowserSupabase()
      if (!sb) {
        if (!mounted) return
        setIsAuthenticated(false)
        setUserId(null)
        setMyList([])
        setLoading(false)
        return
      }

      try {
        const { data: sessionData } = await sb.auth.getSession().catch(() => ({ data: null }))
        const userFromSession = sessionData?.session?.user ?? null

        if (userFromSession) {
          if (!mounted) return
          setIsAuthenticated(true)
          setUserId(userFromSession.id)
          await fetchList(userFromSession.id)
        } else {
          const { data: userData } = await sb.auth.getUser().catch(() => ({ data: null }))
          const user = userData?.user ?? null
          if (mounted) {
            if (user) {
              setIsAuthenticated(true)
              setUserId(user.id)
              await fetchList(user.id)
            } else {
              setIsAuthenticated(false)
              setUserId(null)
              setMyList([])
            }
          }
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

      try {
        const ret = getBrowserSupabase()?.auth.onAuthStateChange(async (_event, session) => {
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

        if (ret && (ret as any).data?.subscription) subscription = (ret as any).data.subscription
        else if ((ret as any).subscription) subscription = (ret as any).subscription
        else subscription = ret
      } catch (err) {
        console.warn('onAuthStateChange subscribe failed', err)
        subscription = null
      }
    }

    init()

    return () => {
      mounted = false
      try {
        if (!subscription) return
        if (typeof subscription.unsubscribe === 'function') subscription.unsubscribe()
        else if (typeof subscription.remove === 'function') subscription.remove()
        else if (typeof subscription.subscription?.unsubscribe === 'function') subscription.subscription.unsubscribe()
        else if (typeof subscription.subscription?.remove === 'function') subscription.subscription.remove()
      } catch (err) {
        console.warn('failed to unsubscribe auth listener', err)
      }
    }
  }, [])

  const refresh = async () => {
    if (!userId) {
      setMyList([])
      return
    }
    await fetchList(userId)
  }

  const addToMyList = async (item: { mal_id: number; title?: string | null; image_url?: string | null; total_episodes?: number | null }) => {
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

      if (existErr) {
        console.warn('check existing error', existErr)
      }

      if (existing && (existing as any).length > 0) {
        await fetchList(userId)
        return
      }

      const payload = {
        user_id: userId,
        mal_id: item.mal_id,
        title: item.title ?? null,
        image_url: item.image_url ?? null,
        total_episodes: item.total_episodes ?? null,
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
      const { error } = await sb.from('user_anime_list').delete().match({ user_id: userId, mal_id })
      if (error) {
        console.warn('delete error', error)
      } else {
        await fetchList(userId)
      }
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
      const { error } = await sb.from('user_anime_list').update({ progress }).match({ user_id: userId, mal_id })
      if (error) {
        console.warn('updateProgress error', error)
      } else {
        await fetchList(userId)
      }
    } catch (err) {
      console.error('updateProgress unexpected', err)
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
      updateProgress
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
