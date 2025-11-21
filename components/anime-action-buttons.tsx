'use client'

import { Button } from '@/components/ui/button'
import { Play, Heart, Share2 } from 'lucide-react'

interface AnimeActionButtonsProps {
  animeId: number
  trailerUrl: string | null | undefined
}

export default function AnimeActionButtons({ animeId, trailerUrl }: AnimeActionButtonsProps) {
  
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Check out this Anime!',
        url: window.location.href
      })
    } else {
      navigator.clipboard.writeText(window.location.href)
      alert('Link copied to clipboard!')
    }
  }

  const glassButtonStyle = `
    gap-2 border-input backdrop-blur-sm transition-colors shadow-sm
    text-foreground bg-background/60
    hover:bg-primary hover:text-primary-foreground
    dark:hover:bg-white/20 dark:hover:text-white
  `

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

      {/* Share */}
      <Button 
        variant="outline" 
        className={glassButtonStyle}
        onClick={handleShare}
      >
        <Share2 size={18} /> Share
      </Button>
    </div>
  )
}
