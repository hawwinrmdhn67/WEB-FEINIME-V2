'use client'

import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'
import { getAnimeCharacters, Character } from '@/lib/api'

interface Props {
  animeId: number
}

export function CharacterList({ animeId }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [characters, setCharacters] = useState<Character[]>([])
  const [loading, setLoading] = useState(false)
  const [hasLoaded, setHasLoaded] = useState(false)

  useEffect(() => {
    if (!containerRef.current || hasLoaded) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return

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
      <h2 className="text-2xl font-bold mb-6 border-l-4 border-primary pl-3">
        Characters
      </h2>

      {/* ⏳ Skeleton */}
      {loading && <CharactersSkeleton />}

      {/* 📄 Data */}
      {!loading && characters.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {characters.map((char, index) => (
            <CharacterCard
              key={char.character.mal_id}
              char={char}
              priority={index === 0}
            />
          ))}
        </div>
      )}
    </section>
  )
}

/* ===========================
   CARD
=========================== */

function CharacterCard({
  char,
  priority,
}: {
  char: Character
  priority?: boolean
}) {
  const va =
    char.voice_actors.find(v => v.language === 'Japanese') ??
    char.voice_actors[0]

  return (
    <div
      className="
        group
        bg-card/80 backdrop-blur
        border border-black/10 dark:border-white/10
        rounded-2xl
        overflow-hidden
        hover:shadow-md transition-all
      "
    >
      {/* Image */}
      <div className="relative aspect-[3/4] overflow-hidden">
        <Image
          src={char.character.images.jpg.image_url}
          alt={char.character.name}
          fill
          priority={priority}
          loading={priority ? 'eager' : 'lazy'}
          sizes="(max-width: 768px) 50vw, 15vw"
          className="object-cover group-hover:scale-105 transition-transform duration-300"
        />

        <RoleBadge role={char.role} />
      </div>

      {/* Info */}
      <div className="p-3">
        <p
          className="text-sm font-bold text-foreground truncate"
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
}

/* ===========================
   BADGE
=========================== */

function RoleBadge({ role }: { role: string }) {
  const isMain = role === 'Main'

  return (
    <span
      className={`
        absolute top-2 right-2
        text-[10px] font-bold
        px-2 py-1 rounded-full
        ${
          isMain
            ? 'bg-primary text-primary-foreground'
            : 'bg-black/60 text-white backdrop-blur-sm'
        }
      `}
    >
      {role}
    </span>
  )
}

/* ===========================
   SKELETON
=========================== */

function CharactersSkeleton() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
      {Array.from({ length: 12 }).map((_, i) => (
        <div
          key={i}
          className="aspect-[3/4] bg-muted animate-pulse rounded-2xl"
        />
      ))}
    </div>
  )
}
