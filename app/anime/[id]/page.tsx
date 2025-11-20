import { 
  getAnimeDetail, 
  getAnimeCharacters, 
  getAnimeReviews, 
  getAnimeStatistics,
  Anime, 
  Relation, 
  Character, 
  Review, 
  Statistics 
} from '@/lib/api'
import { Navbar } from '@/components/navbar'
import Image from 'next/image'
import Link from 'next/link'
import {
  Star,
  Calendar,
  Film,
  BookOpen,
  Activity,
  ExternalLink,
  Users,
  Eye,
  CheckCircle,
  PauseCircle,
  XCircle,
  Clock,
  Link2, 
  Book as BookIcon, 
  Tv 
} from 'lucide-react'
import { notFound } from 'next/navigation'
import AnimeActionButtons from '@/components/anime-action-buttons'

interface AnimePageProps {
  params: Promise<{ id: string }>
}

// --- KOMPONEN RELATED CONTENT (Grid Layout) ---
const RelatedContent = ({ relations }: { relations: Relation[] }) => {
  if (!relations || relations.length === 0) return null
  
  return (
    <section className="px-4 sm:px-6 lg:px-8">
      <h2 className="text-2xl font-bold text-foreground mb-4 border-l-4 border-primary pl-3 flex items-center gap-2">
        Related Content
      </h2>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {relations.map((rel, index) => (
          <div key={index} className="bg-card border border-border rounded-xl overflow-hidden flex flex-col shadow-sm hover:shadow-md transition-shadow">
            
            {/* Header Kategori */}
            <div className="bg-secondary/30 px-4 py-2 border-b border-border flex items-center gap-2">
              <Link2 size={16} className="text-primary" />
              <span className="font-bold text-sm text-foreground uppercase tracking-wide">{rel.relation}</span>
            </div>

            {/* List Item */}
            <div className="p-2 flex flex-col gap-1">
              {rel.entry.map((entry) => {
                
                const commonClasses = "flex items-center justify-between gap-2 p-2 rounded-md hover:bg-secondary/50 transition-colors group"
                const textClasses = "text-sm font-medium text-muted-foreground group-hover:text-primary transition-colors line-clamp-1"

                // 1. ANIME
                if (entry.type === 'anime') {
                  return (
                    <Link key={entry.mal_id} href={`/anime/${entry.mal_id}`} className={commonClasses}>
                      <div className="flex items-center gap-2 overflow-hidden">
                        <Tv size={14} className="text-blue-500 shrink-0" />
                        <span className={textClasses}>{entry.name}</span>
                      </div>
                      <span className="text-[10px] font-bold text-blue-500/70 bg-blue-500/10 px-1.5 py-0.5 rounded">TV</span>
                    </Link>
                  )
                } 
                
                // 2. MANGA
                else if (entry.type === 'manga') {
                  return (
                    <Link key={entry.mal_id} href={`/manga/${entry.mal_id}`} className={commonClasses}>
                      <div className="flex items-center gap-2 overflow-hidden">
                        <BookIcon size={14} className="text-green-500 shrink-0" />
                        <span className={textClasses}>{entry.name}</span>
                      </div>
                      <span className="text-[10px] font-bold text-green-500/70 bg-green-500/10 px-1.5 py-0.5 rounded">Manga</span>
                    </Link>
                  )
                }

                // 3. EXTERNAL
                else {
                  return (
                    <a key={entry.mal_id} href={entry.url} target="_blank" rel="noopener noreferrer" className={commonClasses}>
                      <div className="flex items-center gap-2 overflow-hidden">
                        <ExternalLink size={14} className="text-muted-foreground shrink-0" />
                        <span className={textClasses}>{entry.name}</span>
                      </div>
                      <span className="text-[10px] uppercase text-muted-foreground/70 bg-secondary px-1.5 py-0.5 rounded border border-border">
                        {entry.type}
                      </span>
                    </a>
                  )
                }
              })}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

// --- KOMPONEN CHARACTER LIST ---
const CharacterList = ({ characters }: { characters: Character[] }) => {
  if (!characters || characters.length === 0) return null

  return (
    <section className="px-4 sm:px-6 lg:px-8">
      <h2 className="text-2xl font-bold text-foreground mb-4 border-l-4 border-primary pl-3 flex items-center gap-2">
        Characters <span className="text-sm font-normal text-muted-foreground">({characters.length})</span>
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {characters.map((char) => {
          const va = char.voice_actors.find((v) => v.language === 'Japanese') || char.voice_actors[0]
          return (
            <div key={char.character.mal_id} className="group relative bg-card rounded-lg overflow-hidden border border-border shadow-sm hover:shadow-md transition-all">
              <div className="relative aspect-[3/4] w-full overflow-hidden">
                <Image 
                  src={char.character.images.jpg.image_url} 
                  alt={char.character.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                  sizes="(max-width: 768px) 50vw, 15vw"
                />
                <div className="absolute top-2 right-2">
                  <span className={`text-[10px] font-bold px-2 py-1 rounded-full shadow-sm ${
                    char.role === 'Main' ? 'bg-primary text-primary-foreground' : 'bg-black/60 text-white backdrop-blur-sm'
                  }`}>
                    {char.role}
                  </span>
                </div>
              </div>
              <div className="p-3">
                <p className="font-bold text-sm text-foreground line-clamp-1" title={char.character.name}>
                  {char.character.name}
                </p>
                {va && (
                  <div className="mt-1 flex items-center justify-between text-xs text-muted-foreground">
                    <span className="truncate max-w-[80%]" title={va.person.name}>{va.person.name}</span>
                    <span className="text-[9px] border border-border px-1 rounded opacity-70">JP</span>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}

// --- KOMPONEN STATISTICS ---
const StatsSection = ({ stats }: { stats: Statistics | null }) => {
  if (!stats) return null
  const formatNumber = (num: number) => new Intl.NumberFormat('en-US').format(num)

  return (
    <section className="px-4 sm:px-6 lg:px-8">
      <h2 className="text-2xl font-bold text-foreground mb-4 border-l-4 border-primary pl-3">Statistics</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <div className="bg-card border border-border p-4 rounded-xl flex flex-col items-center text-center hover:border-blue-500/50 transition-colors">
          <Eye className="text-blue-500 mb-2" size={24} />
          <span className="text-xs text-muted-foreground uppercase font-bold">Watching</span>
          <span className="text-lg font-bold text-foreground">{formatNumber(stats.watching)}</span>
        </div>
        <div className="bg-card border border-border p-4 rounded-xl flex flex-col items-center text-center hover:border-green-500/50 transition-colors">
          <CheckCircle className="text-green-500 mb-2" size={24} />
          <span className="text-xs text-muted-foreground uppercase font-bold">Completed</span>
          <span className="text-lg font-bold text-foreground">{formatNumber(stats.completed)}</span>
        </div>
        <div className="bg-card border border-border p-4 rounded-xl flex flex-col items-center text-center hover:border-yellow-500/50 transition-colors">
          <PauseCircle className="text-yellow-500 mb-2" size={24} />
          <span className="text-xs text-muted-foreground uppercase font-bold">On Hold</span>
          <span className="text-lg font-bold text-foreground">{formatNumber(stats.on_hold)}</span>
        </div>
        <div className="bg-card border border-border p-4 rounded-xl flex flex-col items-center text-center hover:border-red-500/50 transition-colors">
          <XCircle className="text-red-500 mb-2" size={24} />
          <span className="text-xs text-muted-foreground uppercase font-bold">Dropped</span>
          <span className="text-lg font-bold text-foreground">{formatNumber(stats.dropped)}</span>
        </div>
        <div className="bg-card border border-border p-4 rounded-xl flex flex-col items-center text-center hover:border-purple-500/50 transition-colors">
          <Clock className="text-purple-500 mb-2" size={24} />
          <span className="text-xs text-muted-foreground uppercase font-bold">Plan to Watch</span>
          <span className="text-lg font-bold text-foreground">{formatNumber(stats.plan_to_watch)}</span>
        </div>
      </div>
    </section>
  )
}

// --- KOMPONEN REVIEWS ---
const ReviewsSection = ({ reviews }: { reviews: Review[] }) => {
  if (!reviews || reviews.length === 0) return null

  return (
    <section className="px-4 sm:px-6 lg:px-8">
      <h2 className="text-2xl font-bold text-foreground mb-4 border-l-4 border-primary pl-3 flex items-center gap-2">
        Reviews <span className="text-sm font-normal text-muted-foreground">({reviews.length} displayed)</span>
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {reviews.map((review, idx) => (
          <div key={idx} className="bg-card border border-border rounded-xl p-5 flex flex-col gap-4 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-3">
                <div className="relative w-10 h-10 rounded-full overflow-hidden bg-muted">
                  <Image 
                    src={review.user.images.jpg.image_url || '/placeholder.svg'} 
                    alt={review.user.username}
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <p className="text-sm font-bold text-foreground">{review.user.username}</p>
                  <p className="text-xs text-muted-foreground">{new Date(review.date).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="flex items-center gap-1 bg-secondary/50 px-2 py-1 rounded text-sm font-bold text-primary">
                <Star size={14} className="fill-current" /> {review.score}
              </div>
            </div>
            <div className="text-sm text-muted-foreground leading-relaxed line-clamp-4 relative">
              {review.review}
              <div className="absolute bottom-0 left-0 w-full h-6 bg-gradient-to-t from-card to-transparent"></div>
            </div>
            <a href={review.url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary font-semibold hover:underline flex items-center gap-1 mt-auto">
              Read Full Review <ExternalLink size={10} />
            </a>
          </div>
        ))}
      </div>
    </section>
  )
}


// --- PAGE COMPONENT UTAMA ---
export default async function AnimePage({ params }: AnimePageProps) {
  const resolvedParams = await params
  const { id } = resolvedParams
  const animeId = parseInt(id)
  
  if (isNaN(animeId)) notFound()

  const [anime, characters, reviews, stats] = await Promise.all([
    getAnimeDetail(animeId).catch(() => null),
    getAnimeCharacters(animeId).catch(() => []),
    getAnimeReviews(animeId).catch(() => []),
    getAnimeStatistics(animeId).catch(() => null)
  ])

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

  return (
    <main className="min-h-screen bg-background overflow-x-hidden">

      <div className="fixed top-0 left-0 w-full z-50">
        <Navbar />
      </div>

      {/* HERO */}
      <div className="relative h-112 md:h-128 w-full overflow-hidden">
        <Image src={imageUrl} alt="Anime background" fill className="object-cover blur-sm opacity-60 dark:opacity-40" quality={80} priority />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent"></div>
      </div>

      {/* INFO HEADER */}
      <div className="relative z-20 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-32 md:-mt-48 grid grid-cols-1 md:grid-cols-3 gap-8 pb-12">
        
        {/* POSTER IMAGE (FIXED ASPECT RATIO) */}
        <div className="relative w-full max-w-[240px] mx-auto md:mx-0">
          <div className="shadow-2xl rounded-lg overflow-hidden border-4 border-background group transition-transform duration-500 hover:scale-105 bg-card">
            <Image 
              src={imageUrl} 
              alt={anime.title} 
              /* FIX IMAGE RATIO HERE */
              width={0}
              height={0}
              sizes="(max-width: 768px) 100vw, 300px"
              className="w-full h-auto object-cover" 
              priority 
            />
          </div>
        </div>

        <div className="md:col-span-2 text-center md:text-left flex flex-col justify-end gap-4 pb-2">
          <div>
            <h1 className="text-3xl md:text-5xl font-extrabold text-foreground drop-shadow-md leading-tight mb-1">{anime.title}</h1>
            <p className="text-lg text-muted-foreground font-medium">{titleEnglish}</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-2">
            <div className="flex flex-col items-center md:items-start bg-card/80 backdrop-blur-sm p-3 rounded-lg border border-border shadow-sm">
              <div className="flex items-center gap-1 text-sm text-muted-foreground mb-1"><Star size={14} className="text-yellow-500"/> Rating</div>
              <span className="text-lg font-bold text-foreground">{score}</span>
            </div>
            <div className="flex flex-col items-center md:items-start bg-card/80 backdrop-blur-sm p-3 rounded-lg border border-border shadow-sm">
              <div className="flex items-center gap-1 text-sm text-muted-foreground mb-1"><Film size={14} className="text-blue-500"/> Episodes</div>
              <span className="text-lg font-bold text-foreground">{episodes}</span>
            </div>
            <div className="flex flex-col items-center md:items-start bg-card/80 backdrop-blur-sm p-3 rounded-lg border border-border shadow-sm">
              <div className="flex items-center gap-1 text-sm text-muted-foreground mb-1"><BookOpen size={14} className="text-red-500"/> Source</div>
              <span className="text-lg font-bold text-foreground">{source}</span>
            </div>
            <div className="flex flex-col items-center md:items-start bg-card/80 backdrop-blur-sm p-3 rounded-lg border border-border shadow-sm">
              <div className="flex items-center gap-1 text-sm text-muted-foreground mb-1"><Calendar size={14} className="text-purple-500"/> Year</div>
              <span className="text-lg font-bold text-foreground">{year}</span>
            </div>
          </div>
          <AnimeActionButtons animeId={animeId} trailerUrl={trailerUrl} />
        </div>
      </div>

      {/* MAIN CONTENT BODY */}
      <div className="relative max-w-6xl mx-auto mt-4 space-y-12 pb-20">

        {/* Genres */}
        {genres.length > 0 && (
          <div className="px-4 sm:px-6 lg:px-8 flex flex-wrap gap-2">
            {genres.map((genre) => (
              <span key={genre.mal_id} className="px-4 py-1.5 bg-secondary text-secondary-foreground font-medium text-sm rounded-full hover:bg-secondary/80 transition-colors cursor-default">
                {genre.name}
              </span>
            ))}
          </div>
        )}

        {/* Synopsis */}
        <section className="px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-foreground mb-4 border-l-4 border-primary pl-3">Synopsis</h2>
          <p className="text-muted-foreground leading-relaxed whitespace-pre-line text-base md:text-lg">
            {synopsis}
          </p>
        </section>

        {/* Airing Details */}
        <section className="px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-foreground mb-4 border-l-4 border-primary pl-3">Airing Details</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-card/50 p-6 rounded-xl border border-border">
            <div className='flex items-center gap-3'>
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-full text-green-600 dark:text-green-400">
                <Activity size={20} />
              </div>
              <div><p className="text-xs text-muted-foreground uppercase font-bold">Status</p><p className="text-foreground font-medium">{status}</p></div>
            </div>
            <div className='flex items-center gap-3'>
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-full text-blue-600 dark:text-blue-400">
                <Calendar size={20} />
              </div>
              <div><p className="text-xs text-muted-foreground uppercase font-bold">Aired From</p><p className="text-foreground font-medium">{airedFrom}</p></div>
            </div>
            <div className='flex items-center gap-3'>
              <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-full text-orange-600 dark:text-orange-400">
                <Calendar size={20} />
              </div>
              <div><p className="text-xs text-muted-foreground uppercase font-bold">Aired To</p><p className="text-foreground font-medium">{airedTo}</p></div>
            </div>
          </div>
        </section>

        <StatsSection stats={stats} />
        <CharacterList characters={characters as Character[]} />
        <ReviewsSection reviews={reviews} />
        <RelatedContent relations={relations} />

      </div>
      {/* Responsive Footer */}
      <footer className="border-t border-border bg-card mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">

          {/* Flex container utama */}
          <div className="flex flex-col md:flex-row justify-between items-center md:items-start gap-6 md:gap-12">

            {/* Brand */}
            <div className="text-center md:text-left">
              <span className="font-bold text-xl tracking-tight">Feinime</span>
            </div>

            {/* Navigation Links */}
            <nav className="flex flex-wrap justify-center md:justify-start gap-4 md:gap-6 text-sm text-muted-foreground">
              {['Home', 'Popular', 'Trending', 'About', 'Contact', 'FAQ'].map((item) => (
                <a
                  key={item}
                  href="#"
                  className="hover:text-primary transition-colors"
                >
                  {item}
                </a>
              ))}
            </nav>

            {/* Social Icons */}
            <div className="flex justify-center md:justify-start items-center gap-4">
              <a
                href="#"
                className="text-muted-foreground hover:text-[#1DA1F2] transition-colors"
              >
                <span className="sr-only">Twitter</span>
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M23.954 4.569c-.885.389-1.83.654-2.825.775 1.014-.611 1.794-1.574 2.163-2.723-.951.564-2.005.974-3.127 1.195-.897-.955-2.178-1.55-3.594-1.55-2.717 0-4.92 2.204-4.92 4.917 0 .39.045.765.127 1.124-4.087-.205-7.72-2.164-10.148-5.144-.424.722-.666 1.561-.666 2.475 0 1.708.87 3.214 2.188 4.099-.807-.025-1.566-.248-2.229-.616v.061c0 2.385 1.693 4.374 3.946 4.827-.413.111-.849.171-1.296.171-.314 0-.615-.03-.916-.086.631 1.953 2.445 3.376 4.604 3.416-1.68 1.319-3.809 2.105-6.102 2.105-.396 0-.779-.023-1.158-.067 2.189 1.402 4.768 2.217 7.548 2.217 9.051 0 14-7.496 14-13.986 0-.21 0-.42-.015-.63 1.009-.73 1.884-1.64 2.584-2.675z" />
                </svg>
              </a>
              <a
                href="#"
                className="text-muted-foreground hover:text-[#5865F2] transition-colors"
              >
                <span className="sr-only">Discord</span>
                <svg className="w-5 h-5" viewBox="0 0 71 55" fill="currentColor">
                  <path d="M60.1 4.55A59 59 0 0 0 46.92 0c-.65 1.14-1.39 2.59-1.9 3.74a42 42 0 0 0-17 0C27.5 2.6 26.76 1.15 26.1 0A58.8 58.8 0 0 0 10.9 4.55C2.68 19.28.08 33.43 1.3 47.36c11.04 8.16 21.56 6.06 21.56 6.06 1.44-1.84 2.56-3.78 3.44-5.7-6.16-1.84-8.52-4.52-8.52-4.52.72.48 1.44.92 2.16 1.3 4.92 2.52 10.12 3.78 15.44 3.78s10.52-1.26 15.44-3.78c.72-.38 1.44-.82 2.16-1.3 0 0-2.36 2.68-8.52 4.52.88 1.92 2 3.86 3.44 5.7 0 0 10.52 2.1 21.56-6.06 1.22-13.92-1.38-28.07-9.6-42.8ZM24.76 37.34c-3.12 0-5.68-2.82-5.68-6.28 0-3.46 2.52-6.28 5.68-6.28 3.18 0 5.74 2.82 5.68 6.28 0 3.46-2.5 6.28-5.68 6.28Zm21.48 0c-3.12 0-5.68-2.82-5.68-6.28 0-3.46 2.52-6.28 5.68-6.28 3.18 0 5.74 2.82 5.68 6.28 0 3.46-2.5 6.28-5.68 6.28Z" />
                </svg>
              </a>
            </div>

          </div>

          {/* COPYRIGHT */}
          <div className="border-t border-border mt-8 pt-6 text-center text-muted-foreground text-sm">
            <p>Feinime © 2025. All rights reserved.</p>
          </div>

        </div>
      </footer>
    </main>
  )
}