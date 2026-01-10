import { getAnimeDetail } from '@/lib/api'
import Image from 'next/image'
import {
  Star,
  Calendar,
  Film,
  BookOpen,
  Activity,
} from 'lucide-react'
import { notFound } from 'next/navigation'
import AnimeActionButtons from '@/components/anime-action-buttons'
import { Footer } from '@/components/feinime-footer'
import { CharacterList } from '@/components/character-list'
import { ReviewsSection } from '@/components/review-section'
import { StatsSection } from '@/components/stats-section'
import { RelatedContent } from '@/components/related-content'

interface AnimePageProps {
  params: Promise<{ id: string }>
}

export default async function AnimePage({ params }: AnimePageProps) {
  const { id } = await params
  const animeId = Number(id)
  if (Number.isNaN(animeId)) notFound()

  const anime = await getAnimeDetail(animeId).catch(() => null)
  if (!anime) notFound()

  const imageUrl = anime.images?.jpg?.large_image_url || '/placeholder.svg'
  const titleEnglish = anime.title_english || '-'
  const score = anime.score != null ? anime.score.toFixed(1) : 'N/A'
  const episodes = anime.episodes ?? '?'
  const source = anime.source || '-'
  const status = anime.status || '-'
  const year = anime.year ?? '?'
  const trailerUrl = anime.trailer?.url
  const genres = anime.genres ?? []
  const synopsis = anime.synopsis || 'No synopsis available.'
  const relations = anime.relations ?? []

  const airedFrom = anime.aired?.from
    ? new Date(anime.aired.from).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
    : '?'
  const airedTo = anime.aired?.to
    ? new Date(anime.aired.to).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
    : (status === 'Currently Airing' ? 'Ongoing' : '?')

  const infoCardStyle =
    'flex flex-col items-center md:items-start bg-card/80 backdrop-blur-sm p-3 rounded-lg shadow-sm z-10'

  return (
    <main className="min-h-screen bg-background overflow-x-hidden">

      {/* HERO */}
      <div className="relative h-112 md:h-128 w-full overflow-hidden">
        <Image
          src={imageUrl}
          alt="Anime background"
          fill
          className="object-cover blur-sm opacity-60 dark:opacity-30"
          quality={70}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
      </div>

      {/* INFO HEADER */}
      <div className="relative z-20 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-32 md:-mt-48 grid grid-cols-1 md:grid-cols-3 gap-8 pb-12">
        {/* POSTER */}
        <div className="relative w-full max-w-[240px] mx-auto md:mx-0 aspect-[2/3]">
          <div className="shadow-2xl rounded-lg overflow-hidden bg-card h-full w-full">
            <Image
              src={imageUrl}
              alt={anime.title}
              fill
              sizes="(max-width: 768px) 100vw, 300px"
              className="object-cover rounded-lg"
              priority
            />
          </div>
        </div>

        <div className="md:col-span-2 text-center md:text-left flex flex-col justify-end gap-4 pb-2">
          <div>
            <h1 className="text-3xl md:text-5xl font-extrabold mb-1">
              {anime.title}
            </h1>
            <p className="text-lg text-muted-foreground font-medium">
              {titleEnglish}
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-2">
          <div className={infoCardStyle}>
            <div className="flex items-center gap-1 text-xs font-bold uppercase tracking-wide text-muted-foreground mb-1">
              <Star size={14} className="text-yellow-500" />
              Rating
            </div>
            <span className="text-lg font-bold">{score}</span>
          </div>

          <div className={infoCardStyle}>
            <div className="flex items-center gap-1 text-xs font-bold uppercase tracking-wide text-muted-foreground mb-1">
              <Film size={14} className="text-blue-500" />
              Episodes
            </div>
            <span className="text-lg font-bold">{episodes}</span>
          </div>

          <div className={infoCardStyle}>
            <div className="flex items-center gap-1 text-xs font-bold uppercase tracking-wide text-muted-foreground mb-1">
              <BookOpen size={14} className="text-red-500" />
              Source
            </div>
            <span className="text-lg font-bold">{source}</span>
          </div>

          <div className={infoCardStyle}>
            <div className="flex items-center gap-1 text-xs font-bold uppercase tracking-wide text-muted-foreground mb-1">
              <Calendar size={14} className="text-purple-500" />
              Year
            </div>
            <span className="text-lg font-bold">{year}</span>
          </div>
        </div>

          <AnimeActionButtons
            animeId={animeId}
            trailerUrl={trailerUrl}
            title={anime.title}
            imageUrl={imageUrl}
            totalEpisodes={anime.episodes ?? null}
          />
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
                className="px-4 py-1.5 bg-secondary text-secondary-foreground font-medium text-sm rounded-full"
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

        {/* AIRING DETAILS */}
        <section className="px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold text-foreground mb-4 border-l-4 border-primary pl-3">
            Airing Details
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            
            {/* STATUS */}
            <div className="bg-card border border-black/10 dark:border-white/10 rounded-2xl px-6 py-5">
            <AiringItem
                label="Status"
                value={status}
                icon={<Activity size={22} />}
                color="green"
            />
            </div>

            {/* AIRED FROM */}
            <div className="bg-card border border-black/10 dark:border-white/10 rounded-2xl px-6 py-5">
            <AiringItem
                label="Aired From"
                value={airedFrom}
                icon={<Calendar size={22} />}
                color="blue"
            />
            </div>

            {/* AIRED TO */}
            <div className="bg-card border border-black/10 dark:border-white/10 rounded-2xl px-6 py-5">
            <AiringItem
                label="Aired To"
                value={airedTo}
                icon={<Calendar size={22} />}
                color="orange"
            />
            </div>

        </div>
        </section>

        {/* CLIENT FETCH */}
        <StatsSection animeId={animeId} />
        <CharacterList animeId={animeId} />
        <ReviewsSection animeId={animeId} />
        <RelatedContent relations={relations} />
      </div>

      <Footer />
    </main>
  )
}

function InfoRow({ label, value, icon }: any) {
  return (
    <div className="flex items-center gap-3">
      <div className="p-2 bg-muted rounded-full">{icon}</div>
      <div>
        <p className="text-xs text-muted-foreground uppercase font-bold">
          {label}
        </p>
        <p className="font-medium">{value}</p>
      </div>
    </div>
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
