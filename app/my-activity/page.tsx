'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Clock, Bookmark, Share2, ArrowRight, Loader2 } from 'lucide-react'
import { Navbar } from '@/components/navbar'
import { SkeletonLoader } from '@/components/skeleton-loader'

// ======================
// 1. MOCK DATA
// ======================
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

// ======================
// 2. HELPER STYLES
// ======================
const getActivityStyle = (type: string) => {
  switch(type) {
    case 'add': return { icon: <Bookmark size={16} className="text-green-500" />, bg: 'bg-green-500/10' }
    case 'share': return { icon: <Share2 size={16} className="text-blue-500" />, bg: 'bg-blue-500/10' }
    default: return { icon: <Clock size={16} />, bg: 'bg-gray-500/10' }
  }
}

// ======================
// 3. PAGE COMPONENT
// ======================
export default function MyActivityPage() {
  const [visibleCount, setVisibleCount] = useState(5)
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  
  const visibleActivities = mockAllActivities.slice(0, visibleCount)
  const showLoadMore = visibleCount < mockAllActivities.length

  // Simulasi Page Load
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false)
    }, 1500) 
    return () => clearTimeout(timer)
  }, [])

  // Simulasi Load More
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

      {/* CONTAINER: max-w-7xl dan py-12 (Sama dengan Trending & My List) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-grow w-full">

        {/* ==========================
            HEADER SECTION
           ========================== */}
        {loading ? (
           <SkeletonLoader type="page-header" />
        ) : (
          // UBAH DISINI: Gunakan 'text-left' agar rata kiri di Mobile & Desktop
          <div className="mb-10 text-left">
            <h1 className="text-3xl md:text-4xl font-bold mb-2 tracking-tight">
              My Activity
            </h1>
            <p className="text-muted-foreground">
              Review all your saved and shared anime history
            </p>
          </div>
        )}

        {/* ==========================
            CONTENT SECTION
           ========================== */}
        {/* Container Card tetap ada agar list terlihat rapi */}
        <section className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
          
          {/* Card Header (Timeline & Back) */}
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
                <Link href="/dashboard" className="text-xs font-medium text-muted-foreground hover:text-primary transition-colors flex items-center gap-1">
                  Back to Dashboard <ArrowRight size={12} />
                </Link>
              </>
            )}
          </div>
          
          {/* Activity List */}
          <div className="p-4 sm:p-6">
            {loading ? (
              <SkeletonLoader type="activity" count={5} />
            ) : (
              <div className="flex flex-col gap-3">
                {visibleActivities.map(activity => {
                  const style = getActivityStyle(activity.type)
                  return (
                    <div key={activity.id} className="flex items-center gap-4 p-3 rounded-lg border border-border/40 hover:bg-accent/40 transition-colors bg-card/50 group">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${style.bg}`}>
                        {style.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-muted-foreground mb-0.5">{activity.detail}</p>
                        <Link href={`/anime/${activity.id}`} className="text-sm font-semibold text-foreground hover:text-primary transition-colors block truncate">
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

          {/* Load More Button */}
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

      {/* FOOTER */}
      <footer className="border-t border-border bg-card mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <div className="flex flex-col md:flex-row justify-between items-center md:items-start gap-6 md:gap-12">
            <div className="text-center md:text-left">
              <span className="font-bold text-xl tracking-tight text-primary">Feinime</span>
            </div>
            <nav className="flex flex-wrap justify-center md:justify-start gap-4 md:gap-6 text-sm text-muted-foreground">
              {['Home', 'Popular', 'Trending', 'About'].map((item) => (
                <Link key={item} href="#" className="hover:text-primary transition-colors">
                  {item}
                </Link>
              ))}
            </nav>
            <div className="flex gap-4 text-muted-foreground">
               <Link href="#" className="hover:text-primary transition-colors"><span className="sr-only">Twitter</span><svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.175-.067a13.995 13.995 0 007.548 2.219c9.142 0 14.307-7.721 14.307-14.498 0-.22 0-.44-.015-.659a10.202 10.202 0 002.502-2.598z"/></svg></Link>
               <Link href="#" className="hover:text-primary transition-colors"><span className="sr-only">Discord</span><svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg></Link>
            </div>
          </div>
          <div className="border-t border-border mt-8 pt-6 text-center text-muted-foreground text-sm">
            <p>© {new Date().getFullYear()} Feinime. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </main>
  )
}