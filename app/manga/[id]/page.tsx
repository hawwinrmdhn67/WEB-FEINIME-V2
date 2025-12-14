import { getMangaDetail } from '@/lib/api'
import { Navbar } from '@/components/navbar'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import {
  Star,
  Calendar,
  Book,
  Users,
  Activity,
  BookOpen,
  ExternalLink,
} from 'lucide-react'
import { notFound } from 'next/navigation'
import { Footer } from '@/components/feinime-footer'

interface MangaPageProps {
  params: Promise<{ id: string }>
}

export default async function MangaPage({ params }: MangaPageProps) {
  const { id } = await params
  const mangaId = Number(id)
  if (Number.isNaN(mangaId)) notFound()

  const manga = await getMangaDetail(mangaId).catch(() => null)
  if (!manga) notFound()

  /* ================= FORMAT DATA ================= */
  const imageUrl = manga.images?.jpg?.large_image_url || '/placeholder.svg'
  const titleEnglish = manga.title_english || '-'
  const score = manga.score != null ? manga.score.toFixed(1) : 'N/A'
  const chapters = manga.chapters ?? '?'
  const volumes = manga.volumes ?? '?'
  const status = manga.status || '-'
  const genres = manga.genres ?? []

  const authors =
  manga.authors?.map(a => a.name).join(', ') || 'Unknown Author'

  const synopsis = manga.synopsis || 'No synopsis available.'
  const malUrl = manga.url

  const publishedFrom = manga.published?.from
    ? new Date(manga.published.from).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : '?'

  const publishedTo = manga.published?.to
    ? new Date(manga.published.to).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : status === 'Publishing'
    ? 'Ongoing'
    : '?'

  const infoCardStyle =
    'flex flex-col items-center md:items-start bg-card/80 backdrop-blur-sm p-3 rounded-lg border border-border shadow-sm'

  const glassButtonStyle = `
    gap-2 border-input backdrop-blur-sm transition-colors shadow-sm
    text-foreground bg-background/60
    hover:bg-primary hover:text-primary-foreground
    dark:hover:bg-white/20 dark:hover:text-white
  `

  /* ================= RENDER ================= */
  return (
    <main className="min-h-screen bg-background overflow-x-hidden">
      <div className="fixed top-0 left-0 w-full z-50">
        <Navbar />
      </div>

      {/* HERO */}
      <div className="relative h-112 md:h-128 w-full overflow-hidden">
        <Image
          src={imageUrl}
          alt="Manga background"
          fill
          className="object-cover blur-sm opacity-60 dark:opacity-40"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
      </div>

      {/* HEADER */}
      <div className="relative z-20 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-32 md:-mt-48 grid grid-cols-1 md:grid-cols-3 gap-8 pb-12">
        {/* POSTER */}
        <div className="relative w-full max-w-[240px] mx-auto md:mx-0 aspect-[2/3]">
          <div className="shadow-2xl rounded-lg overflow-hidden bg-card h-full w-full">
            <Image
              src={imageUrl}
              alt={manga.title}
              fill
              className="object-cover rounded-lg"
              priority
            />
          </div>
        </div>

        {/* INFO */}
        <div className="md:col-span-2 text-center md:text-left flex flex-col justify-end gap-4 pb-2">
          <div>
            <h1 className="text-3xl md:text-5xl font-extrabold mb-1">
              {manga.title}
            </h1>
            <p className="text-lg text-muted-foreground font-medium">
              {titleEnglish}
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-2">
            <div className={infoCardStyle}>
              <div className="flex items-center gap-1 text-sm text-muted-foreground mb-1">
                <Star size={14} className="text-yellow-500" /> Rating
              </div>
              <span className="text-lg font-bold">{score}</span>
            </div>

            <div className={infoCardStyle}>
              <div className="flex items-center gap-1 text-sm text-muted-foreground mb-1">
                <Book size={14} className="text-blue-500" /> Chapters
              </div>
              <span className="text-lg font-bold">
                {chapters} Ch / {volumes} Vol
              </span>
            </div>

            <div className={infoCardStyle}>
              <div className="flex items-center gap-1 text-sm text-muted-foreground mb-1">
                <Users size={14} className="text-red-500" /> Author
              </div>
              <span
                className="text-lg font-bold truncate block w-full min-w-0"
                title={authors}
              >
                {authors}
              </span>
            </div>

            <div className={infoCardStyle}>
              <div className="flex items-center gap-1 text-sm text-muted-foreground mb-1">
                <Activity size={14} className="text-green-500" /> Status
              </div>
              <span className="text-lg font-bold">{status}</span>
            </div>
          </div>

          {malUrl && (
            <div className="flex justify-center md:justify-start mt-4">
              <a href={malUrl} target="_blank" rel="noopener noreferrer">
                <Button variant="outline" className={glassButtonStyle}>
                  <ExternalLink size={18} />
                  View on MyAnimeList
                </Button>
              </a>
            </div>
          )}
        </div>
      </div>

      {/* BODY */}
      <div className="relative max-w-6xl mx-auto mt-4 space-y-12 pb-20">
        {/* GENRES */}
        {genres.length > 0 && (
          <div className="px-4 sm:px-6 lg:px-8 flex flex-wrap gap-2">
            {genres.map(g => (
              <span
                key={g.mal_id}
                className="px-4 py-1.5 bg-secondary text-secondary-foreground text-sm rounded-full"
              >
                {g.name}
              </span>
            ))}
          </div>
        )}

        {/* SYNOPSIS */}
        <section className="px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold mb-4 border-l-4 border-primary pl-3">
            Synopsis
          </h2>
          <p className="text-muted-foreground whitespace-pre-line text-base md:text-lg">
            {synopsis}
          </p>
        </section>

        {/* PUBLISHING INFO */}
        <section className="px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold mb-4 border-l-4 border-primary pl-3">
            Publishing Info
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            
            {/* STATUS */}
            <div className="bg-card border border-black/10 dark:border-white/10 rounded-2xl px-6 py-5">
              <AiringItem
                label="Status"
                value={status}
                icon={<BookOpen size={22} />}
                color="green"
              />
            </div>

            {/* PUBLISHED FROM */}
            <div className="bg-card border border-black/10 dark:border-white/10 rounded-2xl px-6 py-5">
              <AiringItem
                label="Published From"
                value={publishedFrom}
                icon={<Calendar size={22} />}
                color="blue"
              />
            </div>

            {/* PUBLISHED TO */}
            <div className="bg-card border border-black/10 dark:border-white/10 rounded-2xl px-6 py-5">
              <AiringItem
                label="Published To"
                value={publishedTo}
                icon={<Calendar size={22} />}
                color="orange"
              />
            </div>

          </div>
        </section>

      </div>

      <Footer />
    </main>
  )
}

function AiringItem({
  label,
  value,
  icon,
  color,
}: {
  label: string
  value: string
  icon: React.ReactNode
  color: 'green' | 'blue' | 'orange'
}) {
  const colorMap = {
    green: 'bg-green-100 text-green-600 dark:bg-green-900/30',
    blue: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30',
    orange: 'bg-orange-100 text-orange-600 dark:bg-orange-900/30',
  }

  return (
    <div className="flex items-center gap-4 min-w-0">
      <div className={`p-3 rounded-full ${colorMap[color]}`}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground uppercase font-bold">
          {label}
        </p>
        <p className="text-base md:text-lg font-semibold text-foreground truncate">
          {value}
        </p>
      </div>
    </div>
  )
}

