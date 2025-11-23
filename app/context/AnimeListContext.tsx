'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'

// Tipe Data Anime
export interface MyAnimeEntry {
  mal_id: number
  title: string
  image_url: string
  total_episodes: number | null
  status: 'Watching' | 'Completed' | 'Plan to Watch' | 'Dropped' | 'On Hold'
  progress: number
  score: number
  last_updated: string
}

// Context Interface
interface AnimeListContextType {
  myList: MyAnimeEntry[]
  addToMyList: (anime: any, status?: MyAnimeEntry['status']) => void
  updateProgress: (id: number) => void
  updateStatus: (id: number, status: MyAnimeEntry['status']) => void
  removeFromMyList: (id: number) => void
  getStats: () => { watching: number; completed: number; planToWatch: number; totalEp: number }
}

// Context
const AnimeListContext = createContext<AnimeListContextType | undefined>(undefined)

export function AnimeListProvider({ children }: { children: React.ReactNode }) {
  const [myList, setMyList] = useState<MyAnimeEntry[]>([])
  const [isLoaded, setIsLoaded] = useState(false)

  // Load dari localStorage
  useEffect(() => {
    const savedData = localStorage.getItem('feinime_list')
    if (savedData) setMyList(JSON.parse(savedData))
    setIsLoaded(true)
  }, [])

  // Simpan ke localStorage
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('feinime_list', JSON.stringify(myList))
    }
  }, [myList, isLoaded])

  // Tambah Anime baru
  const addToMyList = (anime: any, status: MyAnimeEntry['status'] = 'Plan to Watch') => {
    if (myList.find(item => item.mal_id === anime.mal_id)) return

    const newEntry: MyAnimeEntry = {
      mal_id: anime.mal_id,
      title: anime.title,
      image_url: anime.images.jpg.image_url,
      total_episodes: anime.episodes || 0,
      status,
      progress: 0,
      score: 0,
      last_updated: new Date().toISOString()
    }

    setMyList(prev => [newEntry, ...prev])
  }

  // Update progress (+1)
  const updateProgress = (id: number) => {
    setMyList(prev =>
      prev.map(item => {
        if (item.mal_id === id) {
          const newProgress = item.progress + 1
          const newStatus =
            item.total_episodes && newProgress >= item.total_episodes ? 'Completed' : 'Watching'
          return { ...item, progress: newProgress, status: newStatus, last_updated: new Date().toISOString() }
        }
        return item
      })
    )
  }

  // Update status manual
  const updateStatus = (id: number, status: MyAnimeEntry['status']) => {
    setMyList(prev =>
      prev.map(item =>
        item.mal_id === id ? { ...item, status, last_updated: new Date().toISOString() } : item
      )
    )
  }

  // Hapus anime
  const removeFromMyList = (id: number) => {
    setMyList(prev => prev.filter(item => item.mal_id !== id))
  }

  // Statistik
  const getStats = () => ({
    watching: myList.filter(a => a.status === 'Watching').length,
    completed: myList.filter(a => a.status === 'Completed').length,
    planToWatch: myList.filter(a => a.status === 'Plan to Watch').length,
    totalEp: myList.reduce((acc, curr) => acc + curr.progress, 0)
  })

  return (
    <AnimeListContext.Provider
      value={{ myList, addToMyList, updateProgress, updateStatus, removeFromMyList, getStats }}
    >
      {children}
    </AnimeListContext.Provider>
  )
}

// Hook custom
export const useAnimeList = () => {
  const context = useContext(AnimeListContext)
  if (!context) throw new Error('useAnimeList must be used within AnimeListProvider')
  return context
}
