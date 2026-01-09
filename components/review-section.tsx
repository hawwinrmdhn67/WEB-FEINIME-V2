'use client'

import Image from 'next/image'
import { Star, ExternalLink } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { getAnimeReviews, Review } from '@/lib/api'

interface Props {
  animeId: number
}

export function ReviewsSection({ animeId }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null)

  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(false)
  const [hasLoaded, setHasLoaded] = useState(false)

  useEffect(() => {
    if (!containerRef.current || hasLoaded) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return

        setLoading(true)

        getAnimeReviews(animeId)
          .then(data => {
            setReviews((data ?? []).slice(0, 6))
          })
          .finally(() => {
            setLoading(false)
            setHasLoaded(true)
            observer.disconnect()
          })
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
    <section ref={containerRef} className="px-4 sm:px-6 lg:px-8">
      <h2 className="text-2xl font-bold mb-6 border-l-4 border-primary pl-3 flex items-center gap-2">
        Reviews
        {reviews.length > 0 && (
          <span className="text-sm font-normal text-muted-foreground">
            ({reviews.length})
          </span>
        )}
      </h2>

      {/* ⏳ Skeleton */}
      {loading && <ReviewsSkeleton />}

      {/* 📄 Data */}
      {!loading && reviews.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {reviews.map((review, idx) => (
            <ReviewCard key={idx} review={review} />
          ))}
        </div>
      )}
    </section>
  )
}

/* ===========================
   COMPONENTS
=========================== */

function ReviewCard({ review }: { review: Review }) {
  return (
    <div
      className="
        bg-card/80 backdrop-blur
        border border-black/10 dark:border-white/10
        rounded-2xl
        p-5
        flex flex-col gap-4
        hover:shadow-md transition-shadow
      "
    >
      {/* Header */}
      <div className="flex justify-between items-start gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <Avatar
            src={review.user.images.jpg.image_url}
            alt={review.user.username}
          />

          <div className="min-w-0">
            <p className="text-sm font-bold truncate">
              {review.user.username}
            </p>
            <p className="text-xs text-muted-foreground">
              {new Date(review.date).toLocaleDateString()}
            </p>
          </div>
        </div>

        {review.score != null && (
          <RatingBadge score={review.score} />
        )}
      </div>

      {/* Content */}
      <p className="text-sm text-muted-foreground leading-relaxed line-clamp-4">
        {review.review}
      </p>

      {/* Action */}
      <a
        href={review.url}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-auto inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
      >
        Read Full Review
        <ExternalLink size={12} />
      </a>
    </div>
  )
}

function Avatar({ src, alt }: { src?: string; alt: string }) {
  return (
    <div className="relative w-10 h-10 rounded-full overflow-hidden bg-muted shrink-0">
      <Image
        src={src || '/placeholder.svg'}
        alt={alt}
        fill
        sizes="40px"
        loading="lazy"
        className="object-cover"
      />
    </div>
  )
}

function RatingBadge({ score }: { score: number }) {
  return (
    <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-secondary text-primary text-xs font-bold">
      <Star size={14} className="fill-current" />
      {score}
    </div>
  )
}

/* ===========================
   SKELETON
=========================== */

function ReviewsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="bg-card/80 rounded-2xl p-5 space-y-4 animate-pulse"
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

          <div className="h-3 w-28 bg-muted rounded" />
        </div>
      ))}
    </div>
  )
}
