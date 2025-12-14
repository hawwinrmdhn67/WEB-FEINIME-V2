'use client'

import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'
import { getAnimeCharacters, Character } from '@/lib/api'

export const CharacterList = ({ animeId }: { animeId: number }) => {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [characters, setCharacters] = useState<Character[]>([])
  const [loading, setLoading] = useState(false)
  const [hasLoaded, setHasLoaded] = useState(false)

  useEffect(() => {
    if (!containerRef.current || hasLoaded) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setLoading(true)

          getAnimeCharacters(animeId)
            .then(data => {
              setCharacters((data ?? []).slice(0, 12))
            })
            .finally(() => {
              setLoading(false)
              setHasLoaded(true)
              observer.disconnect()
            })
        }
      },
      {
        rootMargin: '200px', // load sedikit sebelum kelihatan
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
      <h2 className="text-2xl font-bold text-foreground mb-4 border-l-4 border-primary pl-3">
        Characters
      </h2>

      {/* Skeleton */}
      {loading && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              className="aspect-[3/4] bg-muted animate-pulse rounded-lg"
            />
          ))}
        </div>
      )}

      {/* Data */}
      {!loading && characters.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {characters.map((char, index) => {
            const va =
              char.voice_actors.find(v => v.language === 'Japanese') ??
              char.voice_actors[0]

            return (
              <div
                key={char.character.mal_id}
                className="group bg-card rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all"
              >
                <div className="relative aspect-[3/4] overflow-hidden">
                  <Image
                    src={char.character.images.jpg.image_url}
                    alt={char.character.name}
                    fill
                    priority={index === 0}
                    loading={index === 0 ? 'eager' : 'lazy'}
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    sizes="(max-width: 768px) 50vw, 15vw"
                  />

                  <span
                    className={`absolute top-2 right-2 text-[10px] font-bold px-2 py-1 rounded-full ${
                      char.role === 'Main'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-black/60 text-white backdrop-blur-sm'
                    }`}
                  >
                    {char.role}
                  </span>
                </div>

                <div className="p-3">
                  <p
                    className="font-bold text-sm text-foreground line-clamp-1"
                    title={char.character.name}
                  >
                    {char.character.name}
                  </p>

                  {va && (
                    <div className="mt-1 flex items-center justify-between text-xs text-muted-foreground">
                      <span className="truncate max-w-[80%]">
                        {va.person.name}
                      </span>
                      <span className="text-[9px] opacity-70">
                        JP
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </section>
  )
}
