'use client'

import Image from 'next/image'
import { Star, ExternalLink } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { getAnimeReviews, Review } from '@/lib/api'

export const ReviewsSection = ({ animeId }: { animeId: number }) => {
  const containerRef = useRef<HTMLDivElement | null>(null)

  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(false)
  const [hasLoaded, setHasLoaded] = useState(false)

  useEffect(() => {
    if (!containerRef.current || hasLoaded) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setLoading(true)

          getAnimeReviews(animeId)
            .then(data => {
              setReviews((data ?? []).slice(0, 6)) // limit biar ringan
            })
            .finally(() => {
              setLoading(false)
              setHasLoaded(true)
              observer.disconnect()
            })
        }
      },
      {
        rootMargin: '200px',
        threshold: 0.1,
      }
    )

    observer.observe(containerRef.current)
    return () => observer.disconnect()
  }, [animeId, hasLoaded])

  return (
    <section
      ref={containerRef}
      className="px-4 sm:px-6 lg:px-8"
    >
      <h2 className="text-2xl font-bold text-foreground mb-4 border-l-4 border-primary pl-3 flex items-center gap-2">
        Reviews
        {reviews.length > 0 && (
          <span className="text-sm font-normal text-muted-foreground">
            ({reviews.length} displayed)
          </span>
        )}
      </h2>

      {/* Skeleton */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="bg-card rounded-xl p-5 space-y-4 animate-pulse"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-muted" />
                <div className="space-y-2">
                  <div className="h-3 w-24 bg-muted rounded" />
                  <div className="h-2 w-16 bg-muted rounded" />
                </div>
              </div>

              <div className="space-y-2">
                <div className="h-3 w-full bg-muted rounded" />
                <div className="h-3 w-5/6 bg-muted rounded" />
                <div className="h-3 w-4/6 bg-muted rounded" />
              </div>

              <div className="h-3 w-24 bg-muted rounded" />
            </div>
          ))}
        </div>
      )}

      {/* Data */}
      {!loading && reviews.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {reviews.map((review, idx) => (
            <div
              key={idx}
              className="bg-card rounded-xl p-5 flex flex-col gap-4 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="relative w-10 h-10 rounded-full overflow-hidden bg-muted">
                    <Image
                      src={review.user.images.jpg.image_url || '/placeholder.svg'}
                      alt={review.user.username}
                      fill
                      loading="lazy"
                      className="object-cover"
                    />
                  </div>

                  <div>
                    <p className="text-sm font-bold text-foreground">
                      {review.user.username}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(review.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1 bg-secondary/50 px-2 py-1 rounded text-sm font-bold text-primary">
                  <Star size={14} className="fill-current" />
                  {review.score}
                </div>
              </div>

              <div className="text-sm text-muted-foreground leading-relaxed line-clamp-4 relative">
                {review.review}
                <div className="absolute bottom-0 left-0 w-full h-6 bg-gradient-to-t from-background to-transparent" />
              </div>

              <a
                href={review.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-primary font-semibold hover:underline flex items-center gap-1 mt-auto"
              >
                Read Full Review <ExternalLink size={10} />
              </a>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
