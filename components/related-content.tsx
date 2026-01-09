'use client'

import Link from 'next/link'
import {
  Link2,
  Book as BookIcon,
  Tv,
  ExternalLink,
} from 'lucide-react'
import { Relation } from '@/lib/api'

interface Props {
  relations: Relation[]
}

export function RelatedContent({ relations }: Props) {
  if (!relations.length) return null

  return (
    <section className="px-4 sm:px-6 lg:px-8">
      <h2 className="text-2xl font-bold mb-6 border-l-4 border-primary pl-3 flex items-center gap-2">
        Related Content
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {relations.map((rel, index) => (
          <RelationCard key={index} relation={rel} />
        ))}
      </div>
    </section>
  )
}

/* ===========================
   CARD
=========================== */

function RelationCard({ relation }: { relation: Relation }) {
  return (
    <div
      className="
        bg-card/80 backdrop-blur
        border border-black/10 dark:border-white/10
        rounded-2xl
        overflow-hidden
        hover:shadow-md transition-shadow
      "
    >
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 bg-secondary/40">
        <Link2 size={16} className="text-primary shrink-0" />
        <span className="text-sm font-bold uppercase tracking-wide">
          {relation.relation}
        </span>
      </div>

      {/* Content */}
      <div className="p-3 flex flex-col gap-1">
        {relation.entry.map(entry => (
          <RelationItem key={entry.mal_id} entry={entry} />
        ))}
      </div>
    </div>
  )
}

/* ===========================
   ITEM
=========================== */

function RelationItem({
  entry,
}: {
  entry: Relation['entry'][number]
}) {
  const baseClass =
    'flex items-center justify-between gap-3 px-3 py-2 rounded-lg ' +
    'hover:bg-secondary/60 transition-colors group'

  // ANIME
  if (entry.type === 'anime') {
    return (
      <Link href={`/anime/${entry.mal_id}`} className={baseClass}>
        <div className="flex items-center gap-2 min-w-0">
          <Tv size={14} className="text-blue-500 shrink-0" />
          <span className="text-sm truncate">
            {entry.name}
          </span>
        </div>
        <span className="text-[10px] font-bold text-blue-500">
          TV
        </span>
      </Link>
    )
  }

  // MANGA
  if (entry.type === 'manga') {
    return (
      <Link href={`/manga/${entry.mal_id}`} className={baseClass}>
        <div className="flex items-center gap-2 min-w-0">
          <BookIcon size={14} className="text-green-500 shrink-0" />
          <span className="text-sm truncate">
            {entry.name}
          </span>
        </div>
        <span className="text-[10px] font-bold text-green-500">
          Manga
        </span>
      </Link>
    )
  }

  // EXTERNAL / OTHER
  return (
    <a
      href={entry.url}
      target="_blank"
      rel="noopener noreferrer"
      className={baseClass}
    >
      <div className="flex items-center gap-2 min-w-0">
        <ExternalLink size={14} className="shrink-0" />
        <span className="text-sm truncate">
          {entry.name}
        </span>
      </div>
    </a>
  )
}
