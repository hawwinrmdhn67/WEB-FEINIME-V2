'use client'

import { Button } from '@/components/ui/button'
import { Play, Heart, Share2 } from 'lucide-react'
import { useState } from 'react' // Import useState

interface AnimeActionButtonsProps {
  animeId: number
  trailerUrl: string | null | undefined
}

export default function AnimeActionButtons({ animeId, trailerUrl }: AnimeActionButtonsProps) {
  // State untuk melacak status berbagi/copy
  const [shareStatus, setShareStatus] = useState<'idle' | 'copied'>('idle')

  const handleShare = async () => {
    const currentUrl = window.location.href
    const animeTitle = 'Check out this Anime!' // Menggunakan judul umum atau bisa ambil dari props jika ada

    try {
      if (navigator.share) {
        // Web Share API (Mobile/Desktop Modern)
        await navigator.share({
          title: animeTitle,
          url: currentUrl,
        })
        setShareStatus('idle') // Jika share berhasil atau dibatalkan, kembali ke idle
      } else if (navigator.clipboard) {
        // Fallback: Copy ke Clipboard (Desktop)
        await navigator.clipboard.writeText(currentUrl)
        setShareStatus('copied')
        
        // Reset status setelah 3 detik
        setTimeout(() => {
          setShareStatus('idle')
        }, 3000)
      } else {
        // Fallback paling dasar
        alert('Link copied to clipboard: ' + currentUrl)
      }
    } catch (error) {
      console.error('Error sharing or copying:', error)
      setShareStatus('idle')
    }
  }

  // Gaya untuk tombol non-primer
  const glassButtonStyle = `
    gap-2 border-input backdrop-blur-sm transition-colors shadow-sm
    text-foreground bg-background/60
    hover:bg-primary hover:text-primary-foreground
    dark:hover:bg-white/20 dark:hover:text-white
  `
  
  // Gaya khusus untuk tombol Share (berdasarkan status)
  const shareButtonClasses = shareStatus === 'copied'
    ? 'bg-green-500 text-white border-green-500 hover:bg-green-600'
    : glassButtonStyle

  return (
    <div className="flex flex-wrap gap-3 mt-4 justify-center md:justify-start">
      
      {/* Trailer Button */}
      {trailerUrl ? (
        <Button 
          className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90 shadow-md" 
          onClick={() => window.open(trailerUrl, '_blank')}
        >
          <Play size={18} /> Watch Trailer
        </Button>
      ) : (
        <Button disabled className="gap-2 bg-muted text-muted-foreground cursor-not-allowed opacity-70">
          <Play size={18} /> No Trailer
        </Button>
      )}

      {/* Add to Favorites */}
      <Button 
        variant="outline" 
        className={glassButtonStyle} 
        onClick={() => alert('Added to favorites (Demo)')}
      >
        <Heart size={18} /> Add to Favorites
      </Button>

      {/* Share Button (dengan feedback visual) */}
      <Button 
        variant="outline" 
        className={shareButtonClasses} // Menggunakan kelas yang disesuaikan
        onClick={handleShare}
        disabled={shareStatus === 'copied'} // Menonaktifkan tombol saat status 'copied'
      >
        <Share2 size={18} /> 
        {/* Teks dinamis berdasarkan status */}
        {shareStatus === 'copied' ? 'Copied!' : 'Share'}
      </Button>
    </div>
  )
}