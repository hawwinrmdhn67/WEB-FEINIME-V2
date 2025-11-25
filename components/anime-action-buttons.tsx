'use client'

import { Play, Share2, Check, X, Bookmark } from 'lucide-react'
import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useAnimeList } from '../app/context/AnimeListContext'

interface AnimeActionButtonsProps {
  animeId: number
  title: string
  imageUrl: string
  totalEpisodes: number | null
  trailerUrl?: string | null
}

interface ToastMessage {
  id: number
  text: string
  type: 'success' | 'error' | 'info'
}

export default function AnimeActionButtons({ 
  animeId, 
  title,
  imageUrl,
  totalEpisodes,
  trailerUrl 
}: AnimeActionButtonsProps) {
  
  const { myList, addToMyList, removeFromMyList } = useAnimeList()
  const isFavorite = myList.some(item => item.mal_id === animeId)

  const [shareStatus, setShareStatus] = useState<'idle' | 'copied'>('idle')
  const [toasts, setToasts] = useState<ToastMessage[]>([])

  // ===================== TOAST HANDLER =====================
  const showToast = (text: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Date.now()
    setToasts(prev => [...prev, { id, text, type }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000)
  }

  // ===================== TOGGLE FAVORITE =====================
  const toggleFavorite = () => {
    if (isFavorite) {
      removeFromMyList(animeId)
      showToast('Removed from My List', 'error')
    } else {
      addToMyList({
        mal_id: animeId,
        title: title,
        images: { jpg: { image_url: imageUrl } },
        episodes: totalEpisodes
      }, 'Plan to Watch') 

      showToast('Added to My List', 'success')
    }
  }

  // ===================== SHARE HANDLER =====================
  const handleShare = async () => {
    const currentUrl = window.location.href
    try {
      if (navigator.share) {
        await navigator.share({ title: `Watch ${title} on Feinime`, url: currentUrl })
        setShareStatus('idle')
      } else {
        await navigator.clipboard.writeText(currentUrl)
        setShareStatus('copied')
        setTimeout(() => setShareStatus('idle'), 3000)
        showToast('Link copied to clipboard!', 'success')
      }
    } catch {
      setShareStatus('idle')
    }
  }

  // ===================== BUTTON STYLE =====================
  const baseButtonClass =
    "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-10 px-4 py-2"

  const primaryBtnClass =
    `${baseButtonClass} gap-2 bg-primary text-primary-foreground shadow hover:bg-primary/90`

  const disabledBtnClass =
    `${baseButtonClass} gap-2 bg-muted text-muted-foreground cursor-not-allowed opacity-70`

  const glassButtonStyle =
    `${baseButtonClass} gap-2 border border-input backdrop-blur-sm transition-colors shadow-sm text-foreground bg-background/60 hover:bg-primary hover:text-primary-foreground dark:hover:bg-white/20 dark:hover:text-white`

  const shareButtonClasses =
    shareStatus === 'copied'
      ? `${baseButtonClass} gap-2 bg-green-500 text-white border border-green-500 hover:bg-green-600`
      : glassButtonStyle

  return (
    <>
      {/* ===================== TOAST CONTAINER ===================== */}
      <div className="fixed top-20 right-6 z-50 flex flex-col gap-2 max-w-xs">
        <AnimatePresence>
          {toasts.map(t => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 50 }}
              className="px-4 py-3 rounded-lg shadow-lg border text-sm font-medium flex items-center gap-3"
              style={{
                background: 'var(--card)',
                color: 'var(--card-foreground)',
              }}
            >
              {/* ICON BERDASARKAN TYPE */}
              {t.type === 'success' && <Check size={18} className="text-green-500" />}
              {t.type === 'error' && <X size={18} className="text-red-500" />}
              {t.type === 'info' && <Check size={18} className="text-blue-500" />}

              <span>{t.text}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* ===================== BUTTONS ===================== */}
      <div className="flex flex-wrap gap-3 mt-4 justify-center md:justify-start w-full">

        {/* TRAILER */}
        {trailerUrl ? (
          <button 
            className={primaryBtnClass} 
            onClick={() => window.open(trailerUrl, '_blank')}
          >
            <Play size={18} /> Watch Trailer
          </button>
        ) : (
          <button disabled className={disabledBtnClass}>
            <Play size={18} /> No Trailer
          </button>
        )}

        {/* ADD TO LIST */}
        <button 
          className={`${glassButtonStyle} ${isFavorite ? 'text-green-500 border-green-200 dark:border-green-900 hover:bg-green-50 dark:hover:bg-green-900/20' : ''}`} 
          onClick={toggleFavorite}
        >
          {isFavorite ? (
            <>
              <Bookmark size={18} className="fill-green-500" /> Added to List
            </>
          ) : (
            <>
              <Bookmark size={18} /> Add to My List
            </>
          )}
        </button>

        {/* SHARE */}
        <button className={shareButtonClasses} onClick={handleShare} disabled={shareStatus === 'copied'}>
          {shareStatus === 'copied' ? <Check size={18} /> : <Share2 size={18} />}
          {shareStatus === 'copied' ? 'Copied!' : 'Share'}
        </button>
      </div>
    </>
  )
}
