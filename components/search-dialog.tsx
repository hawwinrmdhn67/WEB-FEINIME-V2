'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Search } from 'lucide-react'

export function SearchDialog() {
  const [query, setQuery] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim()) return

    router.push(`/search?q=${encodeURIComponent(query)}`)
    setIsOpen(false)
  }

  useEffect(() => {
    const handleKeydown = (e: KeyboardEvent) => {
      const isCtrlOrCmd = e.ctrlKey || e.metaKey

      if (e.key === 'k' && isCtrlOrCmd) {
        e.preventDefault()
        setIsOpen(true)
      }

      if (e.key === 'Escape') setIsOpen(false)
    }

    window.addEventListener('keydown', handleKeydown)
    return () => window.removeEventListener('keydown', handleKeydown)
  }, [])

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Dialog Search */}
      <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 w-full max-w-xl px-4">
        {isOpen && (
          <form
            onSubmit={handleSearch}
            className="bg-card border border-border rounded-lg shadow-xl"
          >
            <div className="flex items-center gap-3 px-4 py-3">
              <Search size={18} className="text-muted-foreground" />

              <input
                autoFocus
                type="text"
                placeholder="Search anime... (Ctrl+K)"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="flex-1 bg-transparent outline-none text-foreground placeholder:text-muted-foreground"
              />
            </div>
          </form>
        )}
      </div>

      {/* Search Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="text-muted-foreground hover:text-foreground transition-colors"
        title="Press Ctrl+K to search"
      >
        <Search size={20} />
      </button>
    </>
  )
}
