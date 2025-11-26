'use client'

import { useState, useEffect, JSX } from 'react'
import Link from 'next/link' 
import { User, Calendar, ListPlus, Bookmark, Share2, ArrowRight } from 'lucide-react' 
import { Navbar } from '@/components/navbar' 
import { getSeasonUpcoming, Anime } from '@/lib/api' 
import { SkeletonLoader } from '@/components/skeleton-loader'
import { Footer } from '@/components/feinime-footer'

// ===================================
// 1. DATA MOCK
// ===================================
const mockUser = {
  name: "hawwinrmdhn",
  email: "user@example.com",
  joined: "2025-01-15",
  totalSaved: 42, 
  totalShared: 15, 
}

const mockRecentActivity = [
  { 
    id: 1, type: "add", animeTitle: "Sousou no Frieren", 
    detail: "Added to List", time: "2 hours ago",
    icon: <Bookmark size={16} className="text-green-500" />, 
    bg: "bg-green-500/10"
  },
  { 
    id: 2, type: "share", animeTitle: "Jujutsu Kaisen Season 2", 
    detail: "Shared this anime", time: "1 day ago",
    icon: <Share2 size={16} className="text-blue-500" />, 
    bg: "bg-blue-500/10"
  },
  { 
    id: 3, type: "add", animeTitle: "The Apothecary Diaries", 
    detail: "Added to List", time: "3 days ago",
    icon: <Bookmark size={16} className="text-green-500" />,
    bg: "bg-green-500/10"
  },
];

// ===================================
// 2. HELPER COMPONENTS
// ===================================

const StatCard = ({ icon, title, value, description }: { icon: JSX.Element, title: string, value: string | number, description: string }) => (
  <div className="bg-card p-5 rounded-xl border border-border shadow-sm flex flex-col justify-between h-full hover:shadow-md transition-shadow">
    <div className="flex items-center justify-between mb-3">
      <p className="text-sm font-medium text-muted-foreground">{title}</p>
      <div className="p-2 bg-secondary/50 rounded-full text-foreground">
        {icon}
      </div>
    </div>
    <div>
      <div className="text-2xl font-bold text-foreground tracking-tight">{value}</div>
      <p className="text-xs text-muted-foreground mt-1">{description}</p>
    </div>
  </div>
)

const UpcomingListItem = ({ title, date, image, id }: { title: string, date: string, image: string, id: number }) => (
  <Link href={`/anime/${id}`} className="flex items-center gap-3 p-2 rounded-lg hover:bg-secondary/50 transition-colors group">
    <div className="w-12 h-16 flex-shrink-0 relative rounded-md overflow-hidden bg-muted shadow-sm group-hover:shadow-md transition-all">
      <img src={image} alt={title} className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" loading="lazy" />
    </div>
    <div className="min-w-0 flex-1">
      <h4 className="text-sm font-medium line-clamp-2 group-hover:text-primary transition-colors leading-snug">{title}</h4>
      <div className="flex items-center gap-1.5 mt-1.5 text-xs text-muted-foreground">
        <Calendar size={12} />
        <span>{date}</span>
      </div>
    </div>
  </Link>
);

// ===================================
// 3. SKELETON (CONTENT ONLY)
// Header ditangani terpisah oleh SkeletonLoader type="page-header"
// ===================================
const DashboardContentSkeleton = () => (
  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-pulse">
    {/* Left Column */}
    <div className="lg:col-span-2 space-y-8">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-card p-5 rounded-xl border border-border h-32 flex flex-col justify-between">
             <div className="flex justify-between items-start">
                <div className="h-4 w-16 bg-muted dark:bg-muted/70 rounded"></div>
                <div className="h-8 w-8 bg-muted dark:bg-muted/70 rounded-full"></div>
             </div>
             <div className="space-y-2">
                <div className="h-8 w-12 bg-muted dark:bg-muted/70 rounded"></div>
                <div className="h-3 w-24 bg-muted dark:bg-muted/70 rounded opacity-70"></div>
             </div>
          </div>
        ))}
      </div>
      <div className="bg-card rounded-xl border border-border overflow-hidden">
         <div className="px-6 py-4 border-b border-border flex justify-between items-center bg-muted/20">
            <div className="h-6 w-32 bg-muted dark:bg-muted/70 rounded"></div>
            <div className="h-4 w-16 bg-muted dark:bg-muted/70 rounded"></div>
         </div>
         <div className="p-4">
            {/* Reuse Activity Skeleton */}
            <SkeletonLoader type="activity" count={3} />
         </div>
      </div>
    </div>
    {/* Right Column */}
    <div className="lg:col-span-1 space-y-6">
        <div className="bg-card rounded-xl border border-border p-5">
            <div className="flex justify-between mb-6">
               <div className="h-6 w-24 bg-muted dark:bg-muted/70 rounded"></div>
               <div className="h-5 w-10 bg-muted dark:bg-muted/70 rounded-full"></div>
            </div>
            <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="flex gap-3">
                        <div className="w-12 h-16 bg-muted dark:bg-muted/70 rounded-md shrink-0"></div>
                        <div className="flex-1 space-y-2 py-1">
                            <div className="h-4 w-full bg-muted dark:bg-muted/70 rounded"></div>
                            <div className="h-3 w-2/3 bg-muted dark:bg-muted/70 rounded opacity-70"></div>
                        </div>
                    </div>
                ))}
            </div>
            <div className="mt-5 h-9 w-full bg-muted dark:bg-muted/70 rounded-lg"></div>
        </div>
    </div>
  </div>
)

// ===================================
// 4. MAIN COMPONENT
// ===================================

export default function UserDashboard() { 
  const [userName] = useState(mockUser.name)
  const [upcomingAnime, setUpcomingAnime] = useState<Anime[] | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      try {
        const upcomingData = await getSeasonUpcoming();
        setUpcomingAnime(upcomingData.data.slice(0, 5)); 
      } catch (error) {
        console.error("Failed to load anime data:", error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [])

  const RecentActivityList = () => (
    <div className="flex flex-col gap-3 p-4">
      {mockRecentActivity.map((activity) => (
        <div key={activity.id} className="flex items-center gap-4 p-3 rounded-lg border border-border/40 hover:bg-accent/40 transition-colors bg-card/50">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${activity.bg}`}>
            {activity.icon}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-muted-foreground mb-0.5">
              {activity.detail}
            </p>
            <Link href={`/anime/${activity.id}`} className="text-sm font-semibold text-foreground hover:text-primary transition-colors block truncate">
              {activity.animeTitle}
            </Link>
          </div>
          <div className="text-xs text-muted-foreground whitespace-nowrap pl-2 border-l border-border/50">
             {activity.time}
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <main className="min-h-screen bg-background text-foreground flex flex-col">
      <Navbar /> 
      
      {/* Layout Container: Sama persis dengan Trending Page (max-w-7xl & py-12) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-grow w-full">
            
            {/* ===================================
                1. HEADER SECTION
                Logic & Style: Sama dengan Trending Page
               =================================== */}
            {isLoading ? (
               <SkeletonLoader type="page-header" />
            ) : (
               <div className="mb-10 text-left"> 
                  <h1 className="text-3xl md:text-4xl font-bold mb-2 tracking-tight">
                    Dashboard
                  </h1>
                  <p className="text-muted-foreground">
                      Welcome, <span className="font-semibold text-foreground">{userName}</span>. Keep track of your anime collection here.
                  </p>
               </div>
            )}

            {/* ===================================
                2. CONTENT SECTION
               =================================== */}
            {isLoading ? (
                <DashboardContentSkeleton />
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* === LEFT COLUMN === */}
                    <div className="lg:col-span-2 space-y-8">
                        
                        {/* Stats */}
                        <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <StatCard 
                                icon={<User size={18} className="text-yellow-500" />}
                                title="Joined"
                                value={new Date(mockUser.joined).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })} 
                                description="Member Since"
                            />
                            <StatCard 
                                icon={<Bookmark size={18} className="text-green-500" />}
                                title="Saved"
                                value={mockUser.totalSaved}
                                description="Anime in List"
                            />
                            <StatCard 
                                icon={<Share2 size={18} className="text-blue-500" />}
                                title="Shared"
                                value={mockUser.totalShared || 15} 
                                description="Anime shared"
                            />
                        </section>
                        
                        {/* Recent Activity */}
                        <section className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
                            <div className="px-6 py-4 border-b border-border flex justify-between items-center bg-muted/20">
                                <h2 className="font-semibold flex items-center gap-2 text-lg">
                                    <ListPlus size={20} className="text-primary" /> Recent Activity
                                </h2>
                                <Link href="/my-activity" className="text-xs font-medium text-muted-foreground hover:text-primary transition-colors flex items-center gap-1">
                                    View All <ArrowRight size={12} />
                                </Link>
                            </div>
                            <RecentActivityList />
                        </section>

                    </div>

                    {/* === RIGHT COLUMN === */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-card rounded-xl border border-border shadow-sm p-5 sticky top-24">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-semibold flex items-center gap-2">
                                    <Calendar size={18} className="text-pink-500" /> Upcoming
                                </h3>
                                <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-bold">NEW</span>
                            </div>
                            
                            <div className="space-y-2">
                                {upcomingAnime && upcomingAnime.map((anime) => (
                                    <UpcomingListItem 
                                        key={anime.mal_id}
                                        title={anime.title_english || anime.title}
                                        date={anime.year ? `${anime.season || ''} ${anime.year}` : 'Coming Soon'} 
                                        image={anime.images.jpg.image_url} 
                                        id={anime.mal_id}
                                    />
                                ))}
                            </div>
                            
                            <Link href="/seasonal/upcoming" className="mt-5 w-full block text-center py-2 text-sm font-medium text-primary border border-primary/20 rounded-lg hover:bg-primary/5 transition-colors">
                                View Full Schedule
                            </Link>
                        </div>
                    </div>
                </div>
            )}
        </div>
      <Footer />
    </main>
  )
}