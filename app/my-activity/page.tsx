'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Clock, Bookmark, Share2, ArrowRight, Loader2 } from 'lucide-react'
import { Navbar } from '@/components/navbar'
import { SkeletonLoader } from '@/components/skeleton-loader'
import { Footer } from '@/components/feinime-footer'

// MOCK DATA
interface ActivityItem {
  id: number
  type: 'add' | 'share'
  animeTitle: string
  detail: string
  time: string
}

const mockAllActivities: ActivityItem[] = [
  { id: 1, type: 'add', animeTitle: 'Sousou no Frieren', detail: 'Added to List', time: '2 hours ago' },
  { id: 2, type: 'share', animeTitle: 'Jujutsu Kaisen Season 2', detail: 'Shared this anime', time: '1 day ago' },
  { id: 3, type: 'add', animeTitle: 'The Apothecary Diaries', detail: 'Added to List', time: '3 days ago' },
  { id: 4, type: 'share', animeTitle: 'One Piece', detail: 'Shared this anime', time: '4 days ago' },
  { id: 5, type: 'add', animeTitle: 'Vinland Saga Season 2', detail: 'Added to List', time: '5 days ago' },
  { id: 6, type: 'add', animeTitle: 'Chainsaw Man', detail: 'Added to List', time: '6 days ago' },
  { id: 7, type: 'share', animeTitle: 'Demon Slayer: Kimetsu no Yaiba', detail: 'Shared this anime', time: '1 week ago' },
  { id: 8, type: 'add', animeTitle: 'Spy x Family Season 2', detail: 'Added to List', time: '1 week ago' },
  { id: 9, type: 'share', animeTitle: 'Attack on Titan Final Season', detail: 'Shared this anime', time: '2 weeks ago' },
  { id: 10, type: 'add', animeTitle: 'My Hero Academia Season 6', detail: 'Added to List', time: '2 weeks ago' },
]

const getActivityStyle = (type: string) => {
  switch (type) {
    case 'add':
      return { icon: <Bookmark size={16} className="text-green-500" />, bg: 'bg-green-500/10' }
    case 'share':
      return { icon: <Share2 size={16} className="text-blue-500" />, bg: 'bg-blue-500/10' }
    default:
      return { icon: <Clock size={16} />, bg: 'bg-gray-500/10' }
  }
}

export default function MyActivityPage() {
  const [visibleCount, setVisibleCount] = useState(5)
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [loadingFooter, setLoadingFooter] = useState(true) // 🆕 FOOTER LOADING

  const visibleActivities = mockAllActivities.slice(0, visibleCount)
  const showLoadMore = visibleCount < mockAllActivities.length

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false)
    }, 1500)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (!loading) {
      const t = setTimeout(() => setLoadingFooter(false), 120)
      return () => clearTimeout(t)
    }
  }, [loading])

  const handleLoadMore = () => {
    setLoadingMore(true)
    setTimeout(() => {
      setVisibleCount(prev => prev + 5)
      setLoadingMore(false)
    }, 1000)
  }

  return (
    <main className="min-h-screen bg-background text-foreground flex flex-col">
      <Navbar />

      {/* MAIN WRAPPER */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-grow w-full">

        {/* HEADER */}
        {loading ? (
          <SkeletonLoader type="page-header" />
        ) : (
          <div className="mb-10 text-left">
            <h1 className="text-3xl md:text-4xl font-bold mb-2 tracking-tight">
              My Activity
            </h1>
            <p className="text-muted-foreground">
              Review all your saved and shared anime history
            </p>
          </div>
        )}

        {/* CONTENT CARD */}
        <section className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">

          {/* Card Header */}
          <div className="px-6 py-4 border-b border-border flex justify-between items-center bg-muted/20 h-[60px]">
            {loading ? (
              <div className="w-full flex justify-between items-center animate-pulse">
                <div className="flex items-center gap-2">
                  <div className="h-5 w-5 bg-muted dark:bg-muted/70 rounded-full" />
                  <div className="h-6 w-32 bg-muted dark:bg-muted/70 rounded" />
                </div>
                <div className="h-4 w-28 bg-muted dark:bg-muted/70 rounded" />
              </div>
            ) : (
              <>
                <h2 className="font-semibold flex items-center gap-2 text-lg">
                  <Clock size={20} className="text-primary" /> Activity Timeline
                </h2>
                <Link
                  href="/dashboard"
                  className="text-xs font-medium text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
                >
                  Back to Dashboard <ArrowRight size={12} />
                </Link>
              </>
            )}
          </div>

          {/* LIST */}
          <div className="p-4 sm:p-6">
            {loading ? (
              <SkeletonLoader type="activity" count={5} />
            ) : (
              <div className="flex flex-col gap-3">
                {visibleActivities.map(activity => {
                  const style = getActivityStyle(activity.type)
                  return (
                    <div
                      key={activity.id}
                      className="flex items-center gap-4 p-3 rounded-lg border border-border/40 hover:bg-accent/40 transition-colors bg-card/50 group"
                    >
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${style.bg}`}>
                        {style.icon}
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-muted-foreground mb-0.5">{activity.detail}</p>
                        <Link
                          href={`/anime/${activity.id}`}
                          className="text-sm font-semibold text-foreground hover:text-primary transition-colors block truncate"
                        >
                          {activity.animeTitle}
                        </Link>
                      </div>

                      <div className="text-xs text-muted-foreground whitespace-nowrap pl-2 border-l border-border/50">
                        {activity.time}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* LOAD MORE */}
          {(loading || showLoadMore) && (
            <div className="text-center p-6 border-t border-border bg-muted/5">
              {loading ? (
                <div className="h-9 w-48 mx-auto bg-muted dark:bg-muted/70 rounded-full animate-pulse" />
              ) : (
                <button
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                  className="inline-flex items-center justify-center px-6 py-2 text-sm font-medium border border-border rounded-full hover:bg-primary hover:text-primary-foreground disabled:opacity-50 disabled:pointer-events-none transition-all shadow-sm min-w-[140px]"
                >
                  {loadingMore ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    `Load More (${mockAllActivities.length - visibleCount} remaining)`
                  )}
                </button>
              )}
            </div>
          )}
        </section>

      </div>

      {/* FOOTER SKELETON → FOOTER */}
      {loadingFooter ? <SkeletonLoader type="footer" /> : <Footer />}
    </main>
  )
}
