'use client'

import React, { JSX, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import {
  Search, Menu, X, Loader2, User, LogIn, LogOut, Settings,
  LayoutDashboard, List, Home, TrendingUp, Calendar, Star, Tags,
  Check as CheckIcon, X as XIcon
} from 'lucide-react'
import { ThemeToggle } from './theme-toggle'
import { searchAnime, Anime } from '@/lib/api'
import { getBrowserSupabase } from '@/lib/supabaseClient'
import type { Session, User as SupabaseUser } from '@supabase/supabase-js'
import { AnimatePresence, motion } from 'framer-motion'
import useIsDesktop from '@/lib/useIsDesktop'

type ToastMessage = { id: number; text: string; type: 'success' | 'error' | 'info' }

export function Navbar(): JSX.Element {
  const router = useRouter()
  const pathname = usePathname()
  const isDesktop = useIsDesktop()
  const [isOpen, setIsOpen] = useState(false)
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [results, setResults] = useState<Anime[]>([])
  const [searchLoading, setSearchLoading] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [session, setSession] = useState<Session | null>(null)
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [authLoaded, setAuthLoaded] = useState(false)
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false)
  const [toasts, setToasts] = useState<ToastMessage[]>([])
  const lastToastRef = useRef<{ text: string; ts: number } | null>(null)
  const authToastTimerRef = useRef<number | null>(null)
  const initialAuthHandledRef = useRef(false)
  const prevSessionRef = useRef<Session | null>(null)
  const abortControllerRef = useRef<AbortController | null>(null)
  const dropdownRef = useRef<HTMLDivElement | null>(null)

  const showToast = (text: string, type: ToastMessage['type']) => {
    const now = Date.now()
    if (lastToastRef.current && lastToastRef.current.text === text && now - lastToastRef.current.ts < 1500) return
    lastToastRef.current = { text, ts: now }
    const id = now + Math.floor(Math.random() * 1000)
    setToasts(prev => [...prev, { id, text, type }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 2500)
  }

  const scheduleAuthToast = (text: string, type: ToastMessage['type']) => {
    try {
      if (authToastTimerRef.current) window.clearTimeout(authToastTimerRef.current)
    } catch {}
    try {
      authToastTimerRef.current = window.setTimeout(() => {
        showToast(text, type)
        authToastTimerRef.current = null
      }, 350)
    } catch {
      showToast(text, type)
    }
  }

  useEffect(() => {
    let mounted = true
    let unsubRef: any = null

    const initAuth = async () => {
      const supabase = getBrowserSupabase()
      if (!supabase) {
        if (mounted) setAuthLoaded(true)
        return
      }

      try {
        const maybeFn = (supabase.auth as any)?.getSessionFromUrl
        if (typeof maybeFn === 'function') await maybeFn.call(supabase.auth)
      } catch {}

      try {
        const { data } = await supabase.auth.getSession()
        if (!mounted) return
        setSession(data.session ?? null)
        setUser(data.session?.user ?? null)
        prevSessionRef.current = data.session ?? null

        try {
          if (typeof window !== 'undefined' && window.localStorage && data.session) {
            const suppressed = window.localStorage.getItem('feinime:suppress_login_toast') === '1'
            const pending = window.localStorage.getItem('feinime:show_login_toast') === '1'
            if (pending && !suppressed) {
              showToast('Login successful', 'success')
            }
            try { window.localStorage.removeItem('feinime:show_login_toast') } catch {}
          }
        } catch {}
      } catch {

        try {
          const { data: u } = await supabase.auth.getUser()
          if (!mounted) return
          setSession(null)
          setUser(u.user ?? null)
          prevSessionRef.current = null
        } catch {
          if (!mounted) return
          setSession(null)
          setUser(null)
          prevSessionRef.current = null
        }
      } finally {
        if (mounted) setAuthLoaded(true)
      }

      try {
        const listener = supabase.auth.onAuthStateChange((event, s) => {
          const previousSession = prevSessionRef.current
          const wasLoggedIn = !!(previousSession && previousSession.user)
          setSession(s ?? null)
          setUser((s as any)?.user ?? null)
          if (!initialAuthHandledRef.current) {
            initialAuthHandledRef.current = true
            prevSessionRef.current = s ?? null
            return
          }

          if (event === 'SIGNED_IN' || event === 'USER_UPDATED') {
            try {
              if (typeof window !== 'undefined' && window.localStorage) {
                const suppressed = window.localStorage.getItem('feinime:suppress_login_toast') === '1'
                const pending = window.localStorage.getItem('feinime:show_login_toast') === '1'
                try { window.localStorage.removeItem('feinime:show_login_toast') } catch {}
                if (!suppressed && pending) {
                  scheduleAuthToast('Login successful', 'success')
                }
              } else {
                scheduleAuthToast('Login successful', 'success')
              }
            } catch {}
            prevSessionRef.current = s ?? null
            return
          }

          if (event === 'SIGNED_OUT') {
            try {
              if (typeof window !== 'undefined' && window.localStorage) {
                const suppressLogout = window.localStorage.getItem('feinime:suppress_logout_toast') === '1'

                if (suppressLogout) {
                  try { window.localStorage.removeItem('feinime:suppress_logout_toast') } catch {}
                  try { window.localStorage.removeItem('feinime:expected_signout') } catch {}
                  prevSessionRef.current = null
                  return
                }

                if (wasLoggedIn) {
                  scheduleAuthToast('Logout successful', 'success')
                }

                try { window.localStorage.removeItem('feinime:expected_signout') } catch {}
                try { window.localStorage.removeItem('feinime:show_login_toast') } catch {}
                try { window.localStorage.removeItem('feinime:suppress_login_toast') } catch {}
              } else {
                if (wasLoggedIn) scheduleAuthToast('Logout successful', 'success')
              }
            } catch {}
            prevSessionRef.current = null
            return
          }

          if (event === 'PASSWORD_RECOVERY') {
            scheduleAuthToast('Password recovery requested', 'info')
          }

          prevSessionRef.current = s ?? null
        })

        unsubRef = (listener as any)?.data?.subscription ?? (listener as any)?.subscription ?? listener
      } catch {}
    }

    initAuth()

    return () => {
      mounted = false
      try {
        if (unsubRef?.unsubscribe) unsubRef.unsubscribe()
        else if (unsubRef?.remove) unsubRef.remove()
      } catch {}
    }
  }, [])

  useEffect(() => {
    if (!searchQuery.trim()) {
      setResults([])
      setSearchLoading(false)
      setDropdownOpen(false)
      return
    }

    if (abortControllerRef.current) abortControllerRef.current.abort()
    const controller = new AbortController()
    abortControllerRef.current = controller
    setSearchLoading(true)

    const id = setTimeout(async () => {
      try {
        const res = await searchAnime(searchQuery, 1)
        if (!controller.signal.aborted) {
          setResults(res.data?.slice(0, 6) || [])
          setSearchLoading(false)
          setDropdownOpen(true)
        }
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          setResults([])
          setSearchLoading(false)
          setDropdownOpen(false)
        }
      }
    }, 450)

    return () => {
      clearTimeout(id)
      controller.abort()
    }
  }, [searchQuery])

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setDropdownOpen(false)
      if (isUserDropdownOpen && !(e.target as HTMLElement).closest('.user-dropdown-area')) setIsUserDropdownOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [isUserDropdownOpen])

  const handleSubmitSearch = (e?: React.FormEvent) => {
    e?.preventDefault()
    if (!searchQuery) return
    setIsOpen(false)
    setMobileSearchOpen(false)
    setDropdownOpen(false)
    router.push(`/search?q=${encodeURIComponent(searchQuery)}`)
  }

  const handleLogout = async () => {
    const sb = getBrowserSupabase()
    try {
      await sb?.auth.signOut()
    } catch (err) {
      console.error('logout error', err)
    } finally {
      setSession(null)
      setUser(null)
      setIsUserDropdownOpen(false)
      try { router.replace('/') } catch {}
    }
  }

  const menuItems = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/trending', label: 'Trending', icon: TrendingUp },
    { href: '/seasonal', label: 'Seasonal', icon: Calendar },
    { href: '/popular', label: 'Popular', icon: Star },
    { href: '/genres', label: 'Genres', icon: Tags },
  ]

  return (
    <>
      {/* Toast container */}
      <div className="fixed top-20 right-6 z-50 flex flex-col gap-2 max-w-xs pointer-events-none">
        <AnimatePresence>
          {toasts.map(t => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 50 }}
              transition={{ type: 'spring', stiffness: 300, damping: 24 }}
              className="px-4 py-3 rounded-lg shadow-lg border text-sm font-medium flex items-center gap-3 pointer-events-auto"
              style={{ background: 'var(--card)', color: 'var(--card-foreground)' }}
            >
              {t.type === 'success' && <CheckIcon size={18} className="text-green-500" />}
              {t.type === 'error' && <XIcon size={18} className="text-red-500" />}
              {t.type === 'info' && <CheckIcon size={18} className="text-blue-500" />}
              <span>{t.text}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <nav className="sticky top-0 z-50 bg-card/95 backdrop-blur border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center bg-primary/10">
                <img src="/feinime.jpg" alt="Logo Feinime" className="w-full h-full object-cover" />
              </div>
              <span className="text-xl font-bold text-foreground hidden sm:inline group-hover:text-primary transition-colors">Feinime</span>
            </Link>

            <div className="hidden md:flex flex-1 justify-center items-center gap-6">
              {menuItems.map(item => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 text-sm font-medium transition-colors ${
                    pathname === item.href ? 'text-primary' : 'text-muted-foreground hover:text-primary'
                  }`}
                >
                  <item.icon size={16} />
                  {item.label}
                </Link>
              ))}
              {session && (
                <Link
                  href="/my-list"
                  className={`flex items-center gap-2 text-sm font-medium ${
                    pathname === '/my-list' ? 'text-primary' : 'text-muted-foreground hover:text-primary'
                  }`}
                >
                  <List size={16} /> My List
                </Link>
              )}
            </div>

            <div className="hidden md:flex items-center gap-2 relative">
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
                  {isDesktop && searchLoading && <Loader2 size={16} className="animate-spin text-primary" />}
                </div>

                {dropdownOpen && results.length > 0 && (
                  <div
                    ref={dropdownRef}
                    className="absolute top-full right-0 mt-2 w-72 bg-card border border-border rounded-xl shadow-xl overflow-hidden z-50 animate-in slide-in-from-top-2"
                  >
                    <div className="p-2 space-y-1">
                      {results.map(anime => (
                        <Link
                          key={anime.mal_id}
                          href={`/anime/${anime.mal_id}`}
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-start gap-3 px-2 py-2 hover:bg-secondary rounded-lg transition-colors group"
                        >
                          <div className="w-10 h-14 rounded overflow-hidden flex-shrink-0 bg-secondary">
                            <img
                              src={anime.images.jpg.image_url}
                              alt={anime.title}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">
                              {anime.title}
                            </p>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                              <span className="uppercase">{anime.type || 'TV'}</span>
                              <span>•</span>
                              <span>{anime.year || 'N/A'}</span>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                    <button
                      onClick={() => handleSubmitSearch()}
                      className="w-full text-center text-xs font-medium text-muted-foreground bg-secondary/50 py-2 hover:bg-secondary hover:text-primary transition-colors border-t border-border"
                    >
                      View all results
                    </button>
                  </div>
                )}
              </form>

              <ThemeToggle />

              <div className="relative user-dropdown-area">
                {authLoaded ? (
                  session ? (
                    <>
                      <button
                        className="w-9 h-9 rounded-full bg-secondary hover:bg-secondary/80 flex items-center justify-center transition-colors border border-border"
                        title="User menu"
                        onClick={() => setIsUserDropdownOpen(v => !v)}
                      >
                        <User className="w-4 h-4 text-foreground" />
                      </button>
                      {isUserDropdownOpen && (
                        <div className="absolute right-0 top-full mt-2 w-48 bg-card border border-border rounded-xl shadow-lg overflow-hidden z-50 animate-in slide-in-from-top-2">
                          <Link
                            href="/dashboard"
                            onClick={() => setIsUserDropdownOpen(false)}
                            className="flex items-center gap-2 px-4 py-2 hover:bg-primary/10 transition-colors"
                          >
                            <LayoutDashboard size={18} /> Dashboard
                          </Link>
                          <Link
                            href="/settings"
                            onClick={() => setIsUserDropdownOpen(false)}
                            className="flex items-center gap-2 px-4 py-2 hover:bg-primary/10 transition-colors"
                          >
                            <Settings size={18} /> Settings
                          </Link>
                          <button
                            onClick={handleLogout}
                            className="flex items-center gap-2 w-full text-left px-4 py-2 text-red-500 hover:bg-red-500/10 transition-colors border-t border-border/50"
                          >
                            <LogOut size={18} />
                            <span>Logout</span>
                          </button>
                        </div>
                      )}
                    </>
                  ) : (
                    <Link
                      href="/login"
                      className="flex items-center gap-1.5 text-sm font-medium bg-primary text-primary-foreground px-4 py-1.5 rounded-full hover:bg-primary/90 transition-colors shadow-sm"
                    >
                      <LogIn size={16} /> Login
                    </Link>
                  )
                ) : (
                  <div className="w-9 h-9 rounded-full bg-secondary/40 flex items-center justify-center border border-border">
                    <Loader2 size={14} className="animate-spin text-muted-foreground" />
                  </div>
                )}
              </div>
            </div>

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

          {isOpen && (
            <div className="md:hidden mt-2 space-y-2 px-2 pb-4 animate-in slide-in-from-top-5 bg-card border-t border-border pt-4">
              {menuItems.map(item => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`block px-3 py-2 rounded-md transition-colors flex items-center gap-3 font-medium ${
                    pathname === item.href
                      ? 'bg-secondary text-foreground'
                      : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
                  }`}
                  onClick={() => setIsOpen(false)}
                >
                  <item.icon size={18} /> {item.label}
                </Link>
              ))}

              {session && (
                <>
                  <Link
                    href="/my-list"
                    className="block px-3 py-2 rounded-md transition-colors flex items-center gap-3 font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                    onClick={() => setIsOpen(false)}
                  >
                    <List size={18} /> My List
                  </Link>
                  <div className="h-px bg-border my-2" />
                  <Link
                    href="/dashboard"
                    className="block px-3 py-2 rounded-md transition-colors flex items-center gap-3 font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                    onClick={() => setIsOpen(false)}
                  >
                    <LayoutDashboard size={18} /> Dashboard
                  </Link>
                  <Link
                    href="/settings"
                    className="block px-3 py-2 rounded-md transition-colors flex items-center gap-3 font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                    onClick={() => setIsOpen(false)}
                  >
                    <Settings size={18} /> Settings
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 w-full text-left px-3 py-2 rounded-md text-red-500 hover:bg-red-500/10"
                  >
                    <LogOut size={18} />
                    <span>Logout</span>
                  </button>
                </>
              )}

              {!session && authLoaded && (
                <Link
                  href="/login"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 px-3 py-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                >
                  <LogIn size={18} />
                  <span>Login</span>
                </Link>
              )}
            </div>
          )}
        </div>
      </nav>

      {/* Mobile search overlay */}
      {mobileSearchOpen && (
        <div className="fixed inset-0 z-60 flex items-start justify-center p-4 md:hidden">
          <div className="w-full max-w-xl bg-card border border-border rounded-xl shadow-lg overflow-hidden">
            <div className="flex items-center gap-2 p-3 border-b border-border">
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  handleSubmitSearch()
                  setMobileSearchOpen(false)
                }}
                className="flex-1"
              >
                <div className="flex items-center gap-2 bg-input border border-border rounded-md px-3 py-2 w-full">
                  <Search size={18} className="text-muted-foreground" />
                  <input
                    autoFocus
                    type="text"
                    placeholder="Search anime..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-transparent outline-none text-sm w-full placeholder:text-muted-foreground"
                  />
                  {isDesktop && searchLoading && (
                    <Loader2 size={16} className="animate-spin text-primary" />
                  )}
                </div>
              </form>

              <button
                aria-label="Close search"
                onClick={() => setMobileSearchOpen(false)}
                className="p-2 rounded-md hover:bg-secondary transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {searchQuery.trim() !== '' && (
              <div className="max-h-72 overflow-auto">
                {searchLoading ? (
                  <div className="p-4 flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 size={16} className="animate-spin" />
                    <span>Searching…</span>
                  </div>
                ) : (
                  <>
                    {results.length > 0 ? (
                      <div className="p-2 space-y-1">
                        {results.map(anime => (
                          <Link
                            key={anime.mal_id}
                            href={`/anime/${anime.mal_id}`}
                            onClick={() => {
                              setMobileSearchOpen(false)
                              setDropdownOpen(false)
                            }}
                            className="flex items-start gap-3 px-3 py-2 hover:bg-secondary rounded-md transition-colors group"
                          >
                            <div className="w-12 h-16 rounded overflow-hidden flex-shrink-0 bg-secondary">
                              <img
                                src={anime.images.jpg.image_url}
                                alt={anime.title}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">
                                {anime.title}
                              </p>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                                <span className="uppercase">{anime.type || 'TV'}</span>
                                <span>•</span>
                                <span>{anime.year || 'N/A'}</span>
                              </div>
                            </div>
                          </Link>
                        ))}
                      </div>
                    ) : (
                      <div className="p-4 text-sm text-muted-foreground">No results</div>
                    )}
                  </>
                )}
              </div>
            )}

            {searchQuery.trim() !== '' && !searchLoading && (
              <div className="border-t border-border p-2 text-center">
                <button
                  onClick={() => {
                    handleSubmitSearch()
                    setMobileSearchOpen(false)
                  }}
                  className="w-full text-xs font-medium bg-secondary/50 py-2 rounded-md hover:bg-secondary transition-colors"
                >
                  View all results
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}

export default Navbar
