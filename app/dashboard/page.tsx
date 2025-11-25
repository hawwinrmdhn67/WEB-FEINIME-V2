'use client'

import { useState, useEffect, JSX } from 'react'
import Link from 'next/link' 
import { LayoutDashboard, User, Calendar, ListPlus, Bookmark, Share2, ArrowRight } from 'lucide-react' 
import { Navbar } from '@/components/navbar' 
import { getSeasonUpcoming, Anime } from '@/lib/api' 

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

// Mock Activity
const mockRecentActivity = [
  { 
    id: 1, type: "add", animeTitle: "Sousou no Frieren", 
    detail: "Added to List", time: "2 hours ago",
    icon: <Bookmark size={16} className="text-green-500" />, // Saved = green
    bg: "bg-green-500/10"
  },
  { 
    id: 2, type: "share", animeTitle: "Jujutsu Kaisen Season 2", 
    detail: "Shared this anime", time: "1 day ago",
    icon: <Share2 size={16} className="text-blue-500" />, // Share = blue
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
// 3. MAIN COMPONENT
// ===================================

export default function UserDashboard() { 
  const [userName] = useState(mockUser.name)
  const [upcomingAnime, setUpcomingAnime] = useState<Anime[] | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const upcomingData = await getSeasonUpcoming();
        // Take first 5 anime
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
        <div key={activity.id} className="flex items-center gap-4 p-3 rounded-lg border border-border/40 hover:bg-secondary/30 transition-colors bg-card/50">
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
    <>
      <Navbar /> 
      
      <div className="min-h-[calc(100vh-64px)] bg-background p-4 sm:p-6 lg:p-8">
        <div className="max-w-6xl mx-auto"> 
          
          <header className="mb-8 pb-6 border-b border-border">
            <h1 className="text-3xl font-bold flex items-center gap-3 text-foreground">
              Dashboard
            </h1>
            <p className="text-muted-foreground mt-2">
                Welcome, <span className="font-semibold text-foreground">{userName}</span>. Keep track of your anime collection here.
            </p>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* === LEFT COLUMN (MAIN AREA - Span 2) === */}
            <div className="lg:col-span-2 space-y-8">
                
                {/* 1. Stats Row */}
                 <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <StatCard 
                      icon={<User size={18} className="text-yellow-500" />}
                      title="Joined"
                      // FIX: Date format to English locale (Jan 2025)
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
                
                {/* 2. Recent Activity */}
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

            {/* === RIGHT COLUMN (SIDEBAR - Span 1) === */}
            <div className="lg:col-span-1 space-y-6">
                
                {/* Upcoming Anime Widget */}
                <div className="bg-card rounded-xl border border-border shadow-sm p-5 sticky top-24">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold flex items-center gap-2">
                            <Calendar size={18} className="text-pink-500" /> Upcoming
                        </h3>
                        <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-bold">NEW</span>
                    </div>
                    
                    <div className="space-y-2">
                        {!isLoading && upcomingAnime ? (
                            upcomingAnime.map((anime) => (
                                <UpcomingListItem 
                                    key={anime.mal_id}
                                    title={anime.title_english || anime.title}
                                    date={anime.year ? `${anime.season || ''} ${anime.year}` : 'Coming Soon'} 
                                    image={anime.images.jpg.image_url} 
                                    id={anime.mal_id}
                                />
                            ))
                        ) : (
                            <div className="text-xs text-muted-foreground py-4 text-center">Loading data...</div>
                        )}
                    </div>
                    
                    <Link href="/seasonal/upcoming" className="mt-5 w-full block text-center py-2 text-sm font-medium text-primary border border-primary/20 rounded-lg hover:bg-primary/5 transition-colors">
                        View Full Schedule
                    </Link>
                </div>

            </div>
          </div>
        </div>
      </div>
      {/* Footer */}
      <footer className="border-t border-border bg-card mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">

          <div className="flex flex-col md:flex-row justify-between items-center md:items-start gap-6 md:gap-12">

            {/* Brand */}
            <div className="text-center md:text-left">
              <span className="font-bold text-xl tracking-tight">Feinime</span>
            </div>

            {/* Navigation Links */}
            <nav className="flex flex-wrap justify-center md:justify-start gap-4 md:gap-6 text-sm text-muted-foreground">
              {['Home', 'Popular', 'Trending', 'About', 'Contact', 'FAQ'].map((item) => (
                <a
                  key={item}
                  href="#"
                  className="hover:text-primary transition-colors"
                >
                  {item}
                </a>
              ))}
            </nav>

            {/* Social Icons */}
            <div className="flex justify-center md:justify-start items-center gap-4">
              {/* Twitter */}
              <a href="#" className="text-muted-foreground hover:text-[#1DA1F2] transition-colors">
                <span className="sr-only">Twitter</span>
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M23.954 4.569c-.885.389-1.83.654-2.825.775 1.014-.611 1.794-1.574 2.163-2.723-.951.564-2.005.974-3.127 1.195-.897-.955-2.178-1.55-3.594-1.55-2.717 0-4.92 2.204-4.92 4.917 0 .39.045.765.127 1.124-4.087-.205-7.72-2.164-10.148-5.144-.424.722-.666 1.561-.666 2.475 0 1.708.87 3.214 2.188 4.099-.807-.025-1.566-.248-2.229-.616v.061c0 2.385 1.693 4.374 3.946 4.827-.413.111-.849.171-1.296.171-.314 0-.615-.03-.916-.086.631 1.953 2.445 3.376 4.604 3.416-1.68 1.319-3.809 2.105-6.102 2.105-.396 0-.779-.023-1.158-.067 2.189 1.402 4.768 2.217 7.548 2.217 9.051 0 14-7.496 14-13.986 0-.21 0-.42-.015-.63 1.009-.73 1.884-1.64 2.584-2.675z" />
                </svg>
              </a>

              {/* Discord */}
              <a href="#" className="text-muted-foreground hover:text-[#5865F2] transition-colors">
                <span className="sr-only">Discord</span>
                <svg className="w-5 h-5" viewBox="0 0 71 55" fill="currentColor">
                  <path d="M60.1 4.55A59 59 0 0 0 46.92 0c-.65 1.14-1.39 2.59-1.9 3.74a42 42 0 0 0-17 0C27.5 2.6 26.76 1.15 26.1 0A58.8 58.8 0 0 0 10.9 4.55C2.68 19.28.08 33.43 1.3 47.36c11.04 8.16 21.56 6.06 21.56 6.06 1.44-1.84 2.56-3.78 3.44-5.7-6.16-1.84-8.52-4.52-8.52-4.52.72.48 1.44.92 2.16 1.3 4.92 2.52 10.12 3.78 15.44 3.78s10.52-1.26 15.44-3.78c.72-.38 1.44-.82 2.16-1.3 0 0-2.36 2.68-8.52 4.52.88 1.92 2 3.86 3.44 5.7 0 0 10.52 2.1 21.56-6.06 1.22-13.92-1.38-28.07-9.6-42.8ZM24.76 37.34c-3.12 0-5.68-2.82-5.68-6.28 0-3.46 2.52-6.28 5.68-6.28 3.18 0 5.74 2.82 5.68 6.28 0 3.46-2.5 6.28-5.68 6.28Zm21.48 0c-3.12 0-5.68-2.82-5.68-6.28 0-3.46 2.52-6.28 5.68-6.28 3.18 0 5.74 2.82 5.68 6.28 0 3.46-2.5 6.28-5.68 6.28Z" />
                </svg>
              </a>
            </div>

          </div>

          <div className="border-t border-border mt-8 pt-6 text-center text-muted-foreground text-sm">
            <p>Feinime © 2025. All rights reserved.</p>
          </div>

        </div>
      </footer>
    </>
  )
}