'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { 
  Search, Menu, X, Loader2, User, LogIn, LogOut, 
  Settings, LayoutDashboard, List, Home, TrendingUp, 
  Calendar, Star, Tags 
} from 'lucide-react'
import { ThemeToggle } from './theme-toggle'
import { searchAnime, Anime } from '@/lib/api'

// ====================
// USER DROPDOWN (Desktop Only)
// ====================
interface UserDropdownProps {
  onLogout: () => void
  onNavigate: () => void
}

const UserDropdown = ({ onLogout, onNavigate }: UserDropdownProps) => (
  <div className="absolute right-0 top-full mt-2 w-48 bg-card border border-border rounded-xl shadow-lg overflow-hidden z-50 animate-in slide-in-from-top-2">
    <Link 
      href="/dashboard" 
      onClick={onNavigate}
      className="flex items-center gap-2 px-4 py-2 hover:bg-primary/10 transition-colors"
    >
      <LayoutDashboard size={18} />
      <span>Dashboard</span>
    </Link>
    <Link 
      href="/settings" 
      onClick={onNavigate}
      className="flex items-center gap-2 px-4 py-2 hover:bg-primary/10 transition-colors"
    >
      <Settings size={18} />
      <span>Settings</span>
    </Link>
    <button 
      onClick={onLogout} 
      className="flex items-center gap-2 w-full text-left px-4 py-2 text-red-500 hover:bg-red-500/10 transition-colors border-t border-border/50"
    >
      <LogOut size={18} />
      <span>Logout</span>
    </button>
  </div>
)

// ====================
// NAVBAR UTAMA
// ====================
export function Navbar() {
  const router = useRouter()
  const pathname = usePathname() // Hook untuk cek halaman aktif

  // State
  const [isOpen, setIsOpen] = useState(false) 
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [results, setResults] = useState<Anime[]>([])
  const [loading, setLoading] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  
  // Auth State (Simulasi)
  const [isLoggedIn, setIsLoggedIn] = useState(true) 
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false)
  
  // Refs
  const abortControllerRef = useRef<AbortController | null>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const closeAllMenus = () => {
    setIsOpen(false)
    setMobileSearchOpen(false)
    setDropdownOpen(false)
    setIsUserDropdownOpen(false)
  }

  const handleLogin = () => {
    setIsLoggedIn(true)
    closeAllMenus()
  }

  const handleLogout = () => {
    setIsLoggedIn(false)
    closeAllMenus()
    router.push('/')
  }

  // Helper untuk class active link
  const getLinkClass = (path: string, isDestructive = false) => {
    const baseClass = "block px-3 py-2 rounded-md transition-colors flex items-center gap-3 font-medium"
    
    if (isDestructive) {
        return `${baseClass} text-red-500 hover:bg-red-500/10 w-full text-left`
    }

    // Jika path aktif, beri background secondary (seperti di gambar Dashboard)
    if (pathname === path) {
        return `${baseClass} bg-secondary text-foreground`
    }

    return `${baseClass} text-muted-foreground hover:text-foreground hover:bg-secondary/50`
  }

  // Search Logic
  useEffect(() => {
    if (!searchQuery.trim()) {
      setResults([])
      setLoading(false)
      setDropdownOpen(false)
      return
    }

    if (abortControllerRef.current) abortControllerRef.current.abort()
    const controller = new AbortController()
    abortControllerRef.current = controller
    setLoading(true)

    const timeoutId = setTimeout(async () => {
      try {
        const res = await searchAnime(searchQuery, 1) 
        if (!controller.signal.aborted) {
          setResults(res.data?.slice(0, 6) || [])
          setLoading(false)
          setDropdownOpen(true)
        }
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          setResults([])
          setLoading(false)
          setDropdownOpen(false)
        }
      }
    }, 500)

    return () => {
      clearTimeout(timeoutId)
      controller.abort()
    }
  }, [searchQuery])

  // Outside Click Listener
  useEffect(() => {
    const listener = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
      if (isUserDropdownOpen && !(e.target as HTMLElement).closest('.user-dropdown-area')) {
        setIsUserDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', listener)
    return () => document.removeEventListener('mousedown', listener)
  }, [isUserDropdownOpen])

  const handleSubmitSearch = (e?: React.FormEvent) => {
    e?.preventDefault()
    if (!searchQuery) return
    closeAllMenus()
    router.push(`/search?q=${encodeURIComponent(searchQuery)}`)
  }

  // Menu Items Data dengan Icon
  const menuItems = [
    { href: "/", label: "Home", icon: Home },
    { href: "/trending", label: "Trending", icon: TrendingUp },
    { href: "/seasonal", label: "Seasonal", icon: Calendar },
    { href: "/popular", label: "Popular", icon: Star },
    { href: "/genres", label: "Genres", icon: Tags },
  ]

  return (
    <>
      <nav className="sticky top-0 z-50 bg-card/95 backdrop-blur border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">

            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center bg-primary/10">
                <img src="/feinime.jpg" alt="Logo Feinime" className="w-full h-full object-cover" />
              </div>
              <span className="text-xl font-bold text-foreground hidden sm:inline group-hover:text-primary transition-colors">
                Feinime
              </span>
            </Link>

            {/* Desktop Nav Links */}
            <div className="hidden md:flex flex-1 justify-center items-center gap-6">
              {menuItems.map((item) => (
                <Link 
                    key={item.href} 
                    href={item.href} 
                    className={`flex items-center gap-2 text-sm font-medium transition-colors ${pathname === item.href ? 'text-primary' : 'text-muted-foreground hover:text-primary'}`}
                >
                  <item.icon size={16} />
                  {item.label}
                </Link>
              ))}
              
              {isLoggedIn && (
                 <Link href="/my-list" className={`flex items-center gap-2 text-sm font-medium transition-colors ${pathname === '/my-list' ? 'text-primary' : 'text-muted-foreground hover:text-primary'}`}>
                  <List size={16} />
                  My List
                </Link>
              )}
            </div>

            {/* Desktop Actions */}
            <div className="hidden md:flex items-center gap-2 relative">
              
              {/* Desktop Search Bar - REVERTED to Box Style */}
              <form onSubmit={handleSubmitSearch} className="w-64 relative mr-2">
                <div className="flex items-center gap-2 bg-input border border-border rounded-lg px-3 py-2 w-full focus-within:ring-1 focus-within:ring-primary transition-all">
                  <Search size={18} className="text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search anime..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-transparent outline-none text-sm w-full placeholder:text-muted-foreground"
                    onFocus={() => searchQuery.trim() && setDropdownOpen(true)}
                  />
                  {loading && <Loader2 size={16} className="animate-spin text-primary" />}
                </div>

                {dropdownOpen && results.length > 0 && (
                  <div ref={dropdownRef} className="absolute top-full right-0 mt-2 w-72 bg-card border border-border rounded-xl shadow-xl overflow-hidden z-50 animate-in slide-in-from-top-2">
                    <div className="p-2 space-y-1">
                        {results.map((anime) => (
                        <Link key={anime.mal_id} href={`/anime/${anime.mal_id}`} onClick={closeAllMenus} className="flex items-start gap-3 px-2 py-2 hover:bg-secondary rounded-lg transition-colors group">
                            <div className="w-10 h-14 rounded overflow-hidden flex-shrink-0 bg-secondary">
                                <img src={anime.images.jpg.image_url} alt={anime.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">{anime.title}</p>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                                    <span className="uppercase">{anime.type || 'TV'}</span>
                                    <span>•</span>
                                    <span>{anime.year || 'N/A'}</span>
                                </div>
                            </div>
                        </Link>
                        ))}
                    </div>
                    <button onClick={() => handleSubmitSearch()} className="w-full text-center text-xs font-medium text-muted-foreground bg-secondary/50 py-2 hover:bg-secondary hover:text-primary transition-colors border-t border-border">
                      View all results
                    </button>
                  </div>
                )}
              </form>

              <ThemeToggle />

              {/* User Button Desktop */}
              <div className="relative user-dropdown-area">
                {isLoggedIn ? (
                  <>
                    <button 
                      className="w-9 h-9 rounded-full bg-secondary hover:bg-secondary/80 flex items-center justify-center transition-colors border border-border"
                      title="User Menu"
                      onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                    >
                      <User className="w-4 h-4 text-foreground" />
                    </button>
                    {isUserDropdownOpen && (
                      <UserDropdown onLogout={handleLogout} onNavigate={closeAllMenus} />
                    )}
                  </>
                ) : (
                  <button onClick={handleLogin} className="flex items-center gap-1.5 text-sm font-medium bg-primary text-primary-foreground px-4 py-1.5 rounded-full hover:bg-primary/90 transition-colors shadow-sm">
                    <LogIn size={16} /> Login
                  </button>
                )}
              </div>
            </div>

            {/* Mobile Actions */}
            <div className="flex md:hidden items-center gap-2">
              <button className="p-2 hover:bg-secondary rounded-lg transition-colors" onClick={() => setMobileSearchOpen(true)}>
                <Search className="w-6 h-6" />
              </button>
              
              <ThemeToggle />
              
              <button 
                className="p-2 hover:bg-secondary rounded-lg transition-colors text-foreground" 
                onClick={() => setIsOpen(!isOpen)}
              >
                {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>

          {/* Mobile Menu Drawer */}
          {isOpen && (
            <div className="md:hidden mt-2 space-y-2 px-2 pb-4 animate-in slide-in-from-top-5 bg-card border-t border-border pt-4">
              
                {/* Menu Utama + Icons */}
                {menuItems.map((item) => (
                  <Link 
                    key={item.href} 
                    href={item.href} 
                    className={getLinkClass(item.href)} 
                    onClick={closeAllMenus}
                  >
                    <item.icon size={18} />
                    {item.label}
                  </Link>
                ))}

                {isLoggedIn && (
                  <>
                    {/* My List: Di ATAS garis, bergabung dengan menu utama */}
                    <Link href="/my-list" className={getLinkClass('/my-list')} onClick={closeAllMenus}>
                      <List size={18} /> My List
                    </Link>

                    <div className="h-px bg-border my-2" />
                    
                    {/* Menu Akun: Di BAWAH garis */}
                    <Link href="/dashboard" className={getLinkClass('/dashboard')} onClick={closeAllMenus}>
                      <LayoutDashboard size={18} /> Dashboard
                    </Link>
                    <Link href="/settings" className={getLinkClass('/settings')} onClick={closeAllMenus}>
                      <Settings size={18} /> Settings
                    </Link>
                    
                    <button onClick={handleLogout} className={getLinkClass('', true)}>
                      <LogOut size={18} /> Logout
                    </button>
                  </>
                )}
            </div>
          )}
        </div>
      </nav>

      {/* Mobile Search Overlay - REVERTED to Original Layout */}
      {mobileSearchOpen && (
        <div className="fixed inset-0 bg-background/95 backdrop-blur-lg z-[999] p-4 animate-in fade-in duration-200 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Search Anime</h2>
            <button onClick={() => { setMobileSearchOpen(false); setResults([]); setSearchQuery('') }} className="p-2 rounded-lg hover:bg-secondary">
              <X size={26} />
            </button>
          </div>

          <div className="flex items-center gap-3 bg-input border border-border rounded-xl px-4 py-3 focus-within:ring-1 focus-within:ring-primary transition-all">
            <Search size={20} className="text-muted-foreground" />
            <form onSubmit={handleSubmitSearch} className="flex-1">
              <input 
                autoFocus 
                type="text" 
                placeholder="Search anime..." 
                value={searchQuery} 
                onChange={(e) => setSearchQuery(e.target.value)} 
                className="bg-transparent outline-none text-base w-full placeholder:text-muted-foreground" 
              />
            </form>
            {loading && <Loader2 className="animate-spin text-primary" size={20} />}
          </div>

          <div className="flex-1 mt-4 overflow-y-auto space-y-2">
            {results.length === 0 && searchQuery && !loading && (
              <p className="text-center text-muted-foreground mt-10">No results found.</p>
            )}
            {results.map((anime) => (
              <Link key={anime.mal_id} href={`/anime/${anime.mal_id}`} onClick={closeAllMenus} className="flex items-center gap-3 p-2 rounded-lg hover:bg-primary/10 transition animate-in slide-in-from-bottom-2">
                <img src={anime.images.jpg.image_url || anime.images.jpg.large_image_url} alt={anime.title} className="w-12 h-16 object-cover rounded" />
                <div>
                  <p className="font-medium line-clamp-1">{anime.title}</p>
                  <p className="text-xs text-muted-foreground">{anime.type} • {anime.episodes ?? "?"} eps</p>
                </div>
              </Link>
            ))}
            {results.length > 0 && (
              <button onClick={() => handleSubmitSearch()} className="w-full py-3 mt-2 text-center text-primary font-bold border border-primary/20 rounded-lg hover:bg-primary/10">
                See all results
              </button>
            )}
          </div>
        </div>
      )}
    </>
  )
}