import Link from 'next/link'
import { Link2, Book as BookIcon, Tv, ExternalLink } from 'lucide-react'
import { Relation } from '@/lib/api'

export const RelatedContent = ({ relations }: { relations: Relation[] }) => {
  if (!relations.length) return null

  return (
    <section className="px-4 sm:px-6 lg:px-8">
      <h2 className="text-2xl font-bold mb-4 border-l-4 border-primary pl-3 flex items-center gap-2">
        Related Content
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {relations.map((rel, index) => (
          <div
            key={index}
            className="bg-card rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow z-10"
          >
            <div className="bg-secondary/30 px-4 py-2 flex items-center gap-2">
              <Link2 size={16} className="text-primary" />
              <span className="font-bold text-sm uppercase">
                {rel.relation}
              </span>
            </div>

            <div className="p-2 flex flex-col gap-1">
              {rel.entry.map(entry => {
                const base =
                  'flex items-center justify-between gap-2 p-2 rounded-md hover:bg-secondary/50 transition group'

                if (entry.type === 'anime') {
                  return (
                    <Link
                      key={entry.mal_id}
                      href={`/anime/${entry.mal_id}`}
                      className={base}
                    >
                      <div className="flex items-center gap-2 overflow-hidden">
                        <Tv size={14} className="text-blue-500" />
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

                if (entry.type === 'manga') {
                  return (
                    <Link
                      key={entry.mal_id}
                      href={`/manga/${entry.mal_id}`}
                      className={base}
                    >
                      <div className="flex items-center gap-2 overflow-hidden">
                        <BookIcon size={14} className="text-green-500" />
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

                return (
                  <a
                    key={entry.mal_id}
                    href={entry.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={base}
                  >
                    <div className="flex items-center gap-2 overflow-hidden">
                      <ExternalLink size={14} />
                      <span className="text-sm truncate">
                        {entry.name}
                      </span>
                    </div>
                  </a>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
