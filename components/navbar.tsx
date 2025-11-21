'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Search, Menu, X, Loader2 } from 'lucide-react'
import { ThemeToggle } from './theme-toggle'
import { searchAnime, Anime } from '@/lib/api'

export function Navbar() {
  const router = useRouter()

  const [isOpen, setIsOpen] = useState(false)
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false)

  const [searchQuery, setSearchQuery] = useState('')
  const [results, setResults] = useState<Anime[]>([])
  const [loading, setLoading] = useState(false)

  const dropdownRef = useRef<HTMLDivElement>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  // ============================
  // 🔍 SEARCH LOGIC
  // ============================
  useEffect(() => {
    if (!searchQuery.trim()) {
      setResults([])
      setLoading(false)
      return
    }

    if (abortControllerRef.current) abortControllerRef.current.abort()

    const controller = new AbortController()
    abortControllerRef.current = controller

    setLoading(true)

    const timeoutId = setTimeout(async () => {
      try {
        const res = await searchAnime(searchQuery, 1, controller.signal)

        if (!controller.signal.aborted) {
          setResults(res.data?.slice(0, 6) || [])
          setLoading(false)
        }
      } catch (error: any) {
        if (error.name !== 'AbortError') {
          console.error("Navbar search error:", error)
          setResults([])
          setLoading(false)
        }
      }
    }, 500)

    return () => {
      clearTimeout(timeoutId)
      controller.abort()
    }
  }, [searchQuery])

  // Close dropdown when clicking outside
  useEffect(() => {
    const listener = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setResults([])
      }
    }

    document.addEventListener('mousedown', listener)
    return () => document.removeEventListener('mousedown', listener)
  }, [])

  const handleSubmitSearch = (e?: React.FormEvent) => {
    e?.preventDefault()
    if (!searchQuery) return

    setResults([])
    setMobileSearchOpen(false)
    setIsOpen(false)
    router.push(`/search?q=${encodeURIComponent(searchQuery)}`)
  }

  // ============================
  // UI COMPONENT
  // ============================
  return (
    <>
      {/* NAVBAR */}
      <nav className="sticky top-0 z-50 bg-card/95 backdrop-blur border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">

            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center">
                <img
                  src="/feinime.jpg"
                  alt="Logo Feinime"
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="text-xl font-bold text-foreground hidden sm:inline group-hover:text-primary transition-colors">
                Feinime
              </span>
            </Link>

            {/* MENU DESKTOP */}
            <div className="hidden md:flex items-center gap-8">
              {[
                { href: "/", label: "Home" },
                { href: "/trending", label: "Trending" },
                { href: "/seasonal", label: "Seasonal" },
                { href: "/popular", label: "Popular" },
                { href: "/genres", label: "Genres" }
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="
                    text-foreground text-sm font-medium
                    hover:text-primary hover:bg-primary/10
                    px-2 py-1 rounded-md transition-colors
                  "
                >
                  {item.label}
                </Link>
              ))}
            </div>

            {/* SEARCH DESKTOP */}
            <div className="relative hidden sm:flex items-center gap-2 bg-input border border-border rounded-lg px-3 py-2 w-64 focus-within:ring-1 focus-within:ring-primary transition-all">
              <Search size={18} className="text-muted-foreground" />

              <form onSubmit={handleSubmitSearch} className="flex-1">
                <input
                  type="text"
                  placeholder="Search anime..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-transparent outline-none text-sm w-full placeholder:text-muted-foreground"
                />
              </form>

              {loading && <Loader2 size={16} className="animate-spin text-primary" />}

              {results.length > 0 && (
                <div
                  ref={dropdownRef}
                  className="
                    absolute top-full left-0 w-full mt-2 bg-card 
                    border border-border rounded-md shadow-xl overflow-hidden 
                    z-50 animate-in fade-in slide-in-from-top-2
                  "
                >
                  {results.map((anime) => (
                    <Link
                      key={anime.mal_id}
                      href={`/anime/${anime.mal_id}`}
                      onClick={() => {
                        setResults([])
                        setSearchQuery('')
                      }}
                      className="
                        flex items-center gap-3 px-3 py-2 
                        hover:bg-primary/10
                        border-b border-border/50 last:border-0
                        transition-colors
                      "
                    >
                      <img
                        src={anime.images.jpg.image_url || anime.images.jpg.large_image_url}
                        alt={anime.title}
                        className="w-10 h-14 object-cover rounded"
                      />

                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{anime.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {anime.type} • {anime.episodes ?? "?"} eps
                        </p>
                      </div>
                    </Link>
                  ))}

                  <button
                    onClick={() => handleSubmitSearch()}
                    className="
                      w-full text-center text-sm font-semibold text-primary 
                      bg-secondary/30 py-3 hover:bg-secondary/50 
                      transition-colors rounded-md mt-1
                    "
                  >
                    View all results for "{searchQuery}"
                  </button>
                </div>
              )}
            </div>

            {/* ACTIONS */}
            <div className="flex items-center gap-2">
              <button
                className="sm:hidden p-2 hover:bg-secondary rounded-lg transition-colors"
                onClick={() => setMobileSearchOpen(true)}
              >
                <Search size={24} />
              </button>

              <ThemeToggle />

              <button
                className="md:hidden p-2 hover:bg-secondary rounded-lg transition-colors"
                onClick={() => setIsOpen(!isOpen)}
              >
                {isOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>

          {/* MOBILE MENU */}
          {isOpen && (
            <div className="md:hidden mt-2 space-y-2 px-2 pb-4 animate-in slide-in-from-top-5">
              {[
                { href: "/", label: "Home" },
                { href: "/trending", label: "Trending" },
                { href: "/seasonal", label: "Seasonal" },
                { href: "/popular", label: "Popular" },
                { href: "/genres", label: "Genres" }
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="block px-3 py-2 rounded-md hover:bg-primary/20"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          )}
        </div>
      </nav>

      {/* MOBILE SEARCH FULLSCREEN */}
      {mobileSearchOpen && (
        <div className="fixed inset-0 bg-background/95 backdrop-blur-lg z-[999] p-4 animate-in fade-in duration-200">

          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Search Anime</h2>
            <button
              onClick={() => {
                setMobileSearchOpen(false)
                setResults([])
                setSearchQuery('')
              }}
              className="p-2 rounded-lg hover:bg-secondary"
            >
              <X size={26} />
            </button>
          </div>

          <div className="
            flex items-center gap-3 bg-input border border-border 
            rounded-xl px-4 py-3 
            focus-within:ring-2 focus-within:ring-primary/50 
            transition-all
          ">
            <Search size={20} className="text-muted-foreground" />

            <form onSubmit={handleSubmitSearch} className="flex-1">
              <input
                autoFocus
                type="text"
                placeholder="Search anime..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent outline-none text-base w-full"
              />
            </form>

            {loading && <Loader2 className="animate-spin text-primary" size={20} />}
          </div>

          {/* MOBILE RESULTS */}
          <div className="mt-4 space-y-2 max-h-[70vh] overflow-y-auto">

            {results.length === 0 && searchQuery && !loading && (
              <p className="text-center text-muted-foreground mt-10">No results found.</p>
            )}

            {results.map((anime) => (
              <Link
                key={anime.mal_id}
                href={`/anime/${anime.mal_id}`}
                onClick={() => {
                  setMobileSearchOpen(false)
                  setResults([])
                  setSearchQuery('')
                }}
                className="
                  flex items-center gap-3 p-2 rounded-lg 
                  hover:bg-primary/10
                  transition animate-in slide-in-from-bottom-2
                "
              >
                <img
                  src={anime.images.jpg.image_url || anime.images.jpg.large_image_url}
                  alt={anime.title}
                  className="w-12 h-16 object-cover rounded"
                />

                <div>
                  <p className="font-medium line-clamp-1">{anime.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {anime.type} • {anime.episodes ?? "?"} eps
                  </p>
                </div>
              </Link>
            ))}

            {results.length > 0 && (
              <button
                onClick={() => handleSubmitSearch()}
                className="
                  w-full py-3 mt-2 text-center text-primary font-bold 
                  border border-primary/20 rounded-lg 
                  hover:bg-primary/10
                "
              >
                See all results
              </button>
            )}
          </div>
        </div>
      )}
    </>
  )
}
