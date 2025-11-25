'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Clock, Bookmark, Share2, ArrowRight } from 'lucide-react'
import { Navbar } from '@/components/navbar'

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
// 2. HELPER
// ======================
const getActivityStyle = (type: string) => {
  switch(type) {
    case 'add': return { icon: <Bookmark size={16} className="text-green-500" />, bg: 'bg-green-500/10' }
    case 'share': return { icon: <Share2 size={16} className="text-blue-500" />, bg: 'bg-blue-500/10' }
    default: return { icon: <Clock size={16} />, bg: 'bg-gray-500/10' }
  }
}

// ======================
// 3. COMPONENT
// ======================
export default function MyActivityPage() {
  const [visibleCount, setVisibleCount] = useState(5)
  
  const visibleActivities = mockAllActivities.slice(0, visibleCount)
  const showLoadMore = visibleCount < mockAllActivities.length

  return (
    <>
      <Navbar />

      <div className="min-h-[calc(100vh-64px)] bg-background p-4 sm:p-6 lg:p-8">
        <div className="max-w-6xl mx-auto">

          <header className="mb-6">
            <h1 className="text-3xl font-bold flex items-center gap-3 text-foreground">
              My Activity
            </h1>
            <p className="text-muted-foreground mt-1">
              Review all your saved and shared anime history.
            </p>
          </header>

          {/* Activity List */}
          <section className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
            <div className="px-6 py-4 border-b border-border flex justify-between items-center bg-muted/20">
              <h2 className="font-semibold flex items-center gap-2 text-lg">
                <Clock size={20} className="text-primary" /> Activity Timeline
              </h2>
              <Link href="/dashboard" className="text-xs font-medium text-muted-foreground hover:text-primary transition-colors flex items-center gap-1">
                Back to Dashboard <ArrowRight size={12} />
              </Link>
            </div>
            
            <div className="flex flex-col gap-3 p-4">
              {visibleActivities.map(activity => {
                const style = getActivityStyle(activity.type)
                return (
                  <div key={activity.id} className="flex items-center gap-4 p-3 rounded-lg border border-border/40 hover:bg-secondary/30 transition-colors bg-card/50">
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

            {showLoadMore && (
              <div className="text-center p-6 border-t border-border">
                <button
                  onClick={() => setVisibleCount(prev => prev + 5)}
                  className="px-6 py-2 text-sm font-medium border border-border rounded-full hover:bg-secondary transition-colors text-primary hover:text-primary/80"
                >
                  Load More ({mockAllActivities.length - visibleCount} remaining)
                </button>
              </div>
            )}
          </section>

        </div>
      </div>
    </>
  )
}
