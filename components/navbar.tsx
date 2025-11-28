// components/navbar.tsx
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

function UserDropdown({ onLogout, onNavigate }: { onLogout: () => void; onNavigate: () => void }) {
  return (
    <div className="absolute right-0 top-full mt-2 w-48 bg-card border border-border rounded-xl shadow-lg overflow-hidden z-50 animate-in slide-in-from-top-2">
      <Link href="/dashboard" onClick={onNavigate} className="flex items-center gap-2 px-4 py-2 hover:bg-primary/10 transition-colors">
        <LayoutDashboard size={18} /> Dashboard
      </Link>
      <Link href="/settings" onClick={onNavigate} className="flex items-center gap-2 px-4 py-2 hover:bg-primary/10 transition-colors">
        <Settings size={18} /> Settings
      </Link>
      <button onClick={onLogout} className="flex items-center gap-2 w-full text-left px-4 py-2 text-red-500 hover:bg-red-500/10 transition-colors border-t border-border/50">
        <LogOut size={18} /> Logout
      </button>
    </div>
  )
}

export function Navbar(): JSX.Element {
  const router = useRouter()
  const pathname = usePathname()
  const isDesktop = useIsDesktop() // <-- hook

  // UI state
  const [isOpen, setIsOpen] = useState(false)
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [results, setResults] = useState<Anime[]>([])
  const [searchLoading, setSearchLoading] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)

  // auth state
  const [session, setSession] = useState<Session | null>(null)
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [authLoaded, setAuthLoaded] = useState(false)
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false)

  // toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([])

  // refs for toast dedupe/debounce
  const lastToastRef = useRef<{ text: string; ts: number } | null>(null)
  const authToastTimerRef = useRef<number | null>(null)

  const showToast = (text: string, type: ToastMessage['type'] = 'success') => {
    const now = Date.now()
    if (lastToastRef.current && lastToastRef.current.text === text && (now - lastToastRef.current.ts) < 2000) {
      return
    }
    lastToastRef.current = { text, ts: now }
    const id = Date.now() + Math.floor(Math.random() * 1000)
    setToasts(prev => [...prev, { id, text, type }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000)
  }

  const scheduleAuthToast = (text: string, type: ToastMessage['type'] = 'success', delay = 400) => {
    try {
      if (authToastTimerRef.current) {
        window.clearTimeout(authToastTimerRef.current)
        authToastTimerRef.current = null
      }
    } catch { /* ignore */ }

    try {
      authToastTimerRef.current = window.setTimeout(() => {
        showToast(text, type)
        authToastTimerRef.current = null
      }, delay)
    } catch {
      showToast(text, type)
    }
  }

  // refs
  const abortControllerRef = useRef<AbortController | null>(null)
  const dropdownRef = useRef<HTMLDivElement | null>(null)

  // prevent toast flash on initial mount
  const initialAuthHandledRef = useRef(false)

  // global toast event listener (so pages can dispatch to Navbar)
  useEffect(() => {
    function handler(e: Event) {
      try {
        const d = (e as CustomEvent).detail
        if (d && d.text) showToast(d.text, d.type || 'success')
      } catch {
        // ignore
      }
    }
    window.addEventListener('feinime:toast', handler as EventListener)
    return () => window.removeEventListener('feinime:toast', handler as EventListener)
  }, [])

  // Initialize auth and subscribe (client-side only)
  useEffect(() => {
    let mounted = true
    let unsubRef: any = null

    async function initAuth() {
      const sb = getBrowserSupabase()
      if (!sb) {
        // no client available (e.g. build/SSR) -> mark loaded and bail
        if (mounted) setAuthLoaded(true)
        return
      }

      // try to run session-from-url helper if present (OAuth redirect flows)
      try {
        const maybeFn = (sb.auth as any)?.getSessionFromUrl
        if (typeof maybeFn === 'function') await maybeFn.call(sb.auth)
      } catch {
        // ignore
      }

      try {
        const { data } = await sb.auth.getSession()
        if (!mounted) return
        setSession(data.session ?? null)
        setUser(data.session?.user ?? null)

        // pending login flag handling
        try {
          if (typeof window !== 'undefined' && window.localStorage && data.session) {
            const pending = window.localStorage.getItem('feinime:show_login_toast')
            if (pending === '1') {
              showToast('Login successful', 'success')
              window.localStorage.removeItem('feinime:show_login_toast')
            }
          }
        } catch {}
        // handle pending logout fallback
        try {
          if (typeof window !== 'undefined' && window.localStorage) {
            const pendingLogout = window.localStorage.getItem('feinime:show_logout_toast_fallback')
            if (pendingLogout === '1') {
              window.localStorage.removeItem('feinime:show_logout_toast_fallback')
              scheduleAuthToast('Logout successful', 'info')
            }
          }
        } catch {}
      } catch {
        // fallback: try getUser
        try {
          const { data: u } = await sb.auth.getUser()
          if (!mounted) return
          setSession(null)
          setUser(u.user ?? null)
        } catch {
          if (!mounted) return
          setSession(null)
          setUser(null)
        }
      } finally {
        if (mounted) setAuthLoaded(true)
      }

      // subscribe to auth changes
      try {
        const listener = sb.auth.onAuthStateChange((event, s) => {
          setSession(s ?? null)
          setUser((s as any)?.user ?? null)

          const checkAndConsumeLoginFlag = (): boolean => {
            try {
              if (typeof window !== 'undefined' && window.localStorage) {
                const pending = window.localStorage.getItem('feinime:show_login_toast')
                if (pending === '1') {
                  window.localStorage.removeItem('feinime:show_login_toast')
                  showToast('Login successful', 'success')
                  return true
                }
              }
            } catch {}
            return false
          }

          // avoid flash during initial auth load
          if (!initialAuthHandledRef.current) {
            initialAuthHandledRef.current = true
            return
          }

          if (event === 'SIGNED_IN' || event === 'USER_UPDATED') {
            const consumed = checkAndConsumeLoginFlag()
            if (!consumed) scheduleAuthToast('Login successful', 'success')
          } else if (event === 'SIGNED_OUT') {
            try {
              if (typeof window !== 'undefined' && window.localStorage) {
                const suppr = window.localStorage.getItem('feinime:suppress_logout_toast')
                if (suppr === '1') {
                  window.localStorage.removeItem('feinime:suppress_logout_toast')
                  return
                }
              }
            } catch {}
            scheduleAuthToast('Logout successful', 'info')
          } else if (event === 'PASSWORD_RECOVERY') {
            scheduleAuthToast('Password recovery requested', 'info')
          }
        })

        unsubRef = (listener as any)?.data?.subscription ?? (listener as any)?.subscription ?? listener
      } catch {
        // ignore subscribe errors
      }
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

  // search effect (debounced)
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
    }, 500)

    return () => {
      clearTimeout(id)
      controller.abort()
    }
  }, [searchQuery])

  // close dropdowns on outside click
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
    // prefer runtime client
    const sb = getBrowserSupabase()
    try {
      if (sb) {
        await sb.auth.signOut()
      } else {
        // fallback: attempt signout via no-op (we still remove local state)
      }
    } catch (err) {
      console.error('logout error', err)
    } finally {
      // local cleanup so UI updates immediately
      try {
        setSession(null)
        setUser(null)
        setIsUserDropdownOpen(false)
        if (typeof window !== 'undefined') {
          try { localStorage.removeItem('supabase.auth.token') } catch {}
          try { sessionStorage.clear() } catch {}
          try { window.localStorage.removeItem('feinime:show_login_toast') } catch {}
          try { window.localStorage.removeItem('feinime:suppress_logout_toast') } catch {}
        }
      } catch {}
      // schedule fallback via localStorage flag (survives navigation)
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          window.localStorage.setItem('feinime:show_logout_toast_fallback', '1')
        }
      } catch {}
      try { router.replace('/') } catch {}
      try { scheduleAuthToast('Logout successful', 'info') } catch {}
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
                <Link key={item.href} href={item.href} className={`flex items-center gap-2 text-sm font-medium transition-colors ${pathname === item.href ? 'text-primary' : 'text-muted-foreground hover:text-primary'}`}>
                  <item.icon size={16} />
                  {item.label}
                </Link>
              ))}
              {session && <Link href="/my-list" className={`flex items-center gap-2 text-sm font-medium ${pathname === '/my-list' ? 'text-primary' : 'text-muted-foreground hover:text-primary'}`}><List size={16} /> My List</Link>}
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
                  {/* Spinner only on desktop */}
                  {isDesktop && searchLoading && <Loader2 size={16} className="animate-spin text-primary" />}
                </div>

                {dropdownOpen && results.length > 0 && (
                  <div ref={dropdownRef} className="absolute top-full right-0 mt-2 w-72 bg-card border border-border rounded-xl shadow-xl overflow-hidden z-50 animate-in slide-in-from-top-2">
                    <div className="p-2 space-y-1">
                      {results.map(anime => (
                        <Link key={anime.mal_id} href={`/anime/${anime.mal_id}`} onClick={() => setDropdownOpen(false)} className="flex items-start gap-3 px-2 py-2 hover:bg-secondary rounded-lg transition-colors group">
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
                    <button onClick={() => handleSubmitSearch()} className="w-full text-center text-xs font-medium text-muted-foreground bg-secondary/50 py-2 hover:bg-secondary hover:text-primary transition-colors border-t border-border">View all results</button>
                  </div>
                )}
              </form>

              <ThemeToggle />

              <div className="relative user-dropdown-area">
                {authLoaded ? (
                  session ? (
                    <>
                      <button className="w-9 h-9 rounded-full bg-secondary hover:bg-secondary/80 flex items-center justify-center transition-colors border border-border" title="User menu" onClick={() => setIsUserDropdownOpen(v => !v)}>
                        <User className="w-4 h-4 text-foreground" />
                      </button>
                      {isUserDropdownOpen && <UserDropdown onLogout={handleLogout} onNavigate={() => setIsUserDropdownOpen(false)} />}
                    </>
                  ) : (
                    <Link href="/login" className="flex items-center gap-1.5 text-sm font-medium bg-primary text-primary-foreground px-4 py-1.5 rounded-full hover:bg-primary/90 transition-colors shadow-sm">
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
              <button className="p-2 hover:bg-secondary rounded-lg transition-colors" onClick={() => setMobileSearchOpen(true)}><Search className="w-6 h-6" /></button>
              <ThemeToggle />
              <button className="p-2 hover:bg-secondary rounded-lg transition-colors text-foreground" onClick={() => setIsOpen(!isOpen)}>{isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}</button>
            </div>
          </div>

          {isOpen && (
            <div className="md:hidden mt-2 space-y-2 px-2 pb-4 animate-in slide-in-from-top-5 bg-card border-t border-border pt-4">
              {menuItems.map(item => (
                <Link key={item.href} href={item.href} className={`block px-3 py-2 rounded-md transition-colors flex items-center gap-3 font-medium ${pathname === item.href ? 'bg-secondary text-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'}`} onClick={() => setIsOpen(false)}>
                  <item.icon size={18} /> {item.label}
                </Link>
              ))}

              {session && (
                <>
                  <Link href="/my-list" className="block px-3 py-2 rounded-md transition-colors flex items-center gap-3 font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/50" onClick={() => setIsOpen(false)}>
                    <List size={18} /> My List
                  </Link>
                  <div className="h-px bg-border my-2" />
                  <Link href="/dashboard" className="block px-3 py-2 rounded-md transition-colors flex items-center gap-3 font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/50" onClick={() => setIsOpen(false)}>
                    <LayoutDashboard size={18} /> Dashboard
                  </Link>
                  <Link href="/settings" className="block px-3 py-2 rounded-md transition-colors flex items-center gap-3 font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/50" onClick={() => setIsOpen(false)}>
                    <Settings size={18} /> Settings
                  </Link>
                  <button onClick={handleLogout} className="block w-full text-left px-3 py-2 rounded-md text-red-500 hover:bg-red-500/10"> <LogOut size={18} /> Logout</button>
                </>
              )}

              {!session && authLoaded && (
                <Link href="/login" className="block px-3 py-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary/50" onClick={() => setIsOpen(false)}>
                  <LogIn size={18} /> Login
                </Link>
              )}
            </div>
          )}
        </div>
      </nav>

      {/* Mobile search overlay — tampilkan hanya saat mobileSearchOpen true */}
      {mobileSearchOpen && (
        <div className="fixed inset-0 z-60 flex items-start justify-center p-4 md:hidden">
          <div className="w-full max-w-xl bg-card border border-border rounded-xl shadow-lg overflow-hidden">
            <div className="flex items-center gap-2 p-3 border-b border-border">
              <form
                onSubmit={(e) => {
                  handleSubmitSearch(e)
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
                  {/* spinner NOT shown in mobile because isDesktop === false */}
                  {isDesktop && searchLoading && <Loader2 size={16} className="animate-spin text-primary" />}
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

            {/* Show results area ONLY after user mulai mengetik */}
            {searchQuery.trim() !== '' && (
              <div className="max-h-72 overflow-auto">
                {/* Saat sedang loading: tampilkan indikator searching */}
                {searchLoading ? (
                  <div className="p-4 flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 size={16} className="animate-spin" />
                    <span>Searching…</span>
                  </div>
                ) : (
                  // Setelah loading selesai: tampilkan hasil atau pesan No results
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
                              <img src={anime.images.jpg.image_url} alt={anime.title} className="w-full h-full object-cover" />
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
                    ) : (
                      <div className="p-4 text-sm text-muted-foreground">No results</div>
                    )}
                  </>
                )}
              </div>
            )}

            {/* View all results — hanya tampil setelah user mengetik dan loading selesai */}
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
