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
  ExternalLink
} from 'lucide-react'
import { notFound } from 'next/navigation'
import { Footer } from '@/components/feinime-footer'

interface MangaPageProps {
  params: Promise<{ id: string }>
}

export default async function MangaPage({ params }: MangaPageProps) {
  const resolvedParams = await params
  const { id } = resolvedParams
  const mangaId = parseInt(id)

  if (isNaN(mangaId)) notFound()

  // Fetch Data
  const manga = await getMangaDetail(mangaId)
  if (!manga) notFound()

  // Data Formatting
  const imageUrl = manga.images?.jpg?.large_image_url || '/placeholder.svg'
  const titleEnglish = manga.title_english || '-'
  const score = manga.score != null ? manga.score.toFixed(1) : 'N/A'
  const chapters = manga.chapters ?? '?'
  const volumes = manga.volumes ?? '?'
  const status = manga.status || '-'
  const genres = manga.genres ?? []
  
  const authors = manga.authors && manga.authors.length > 0 
    ? manga.authors.map((a) => a.name).join(', ') 
    : 'Unknown Author'

  const synopsis = manga.synopsis || 'No synopsis available.'
  const malUrl = manga.url 

  const publishedFrom = manga.published?.from
    ? new Date(manga.published.from).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
    : '?'
  const publishedTo = manga.published?.to
    ? new Date(manga.published.to).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
    : (status === 'Publishing' ? 'Ongoing' : '?')

  // STYLE GLASSMORPHISM (Sama seperti tombol Add to Favorites)
  const glassButtonStyle = `
    gap-2 border-input backdrop-blur-sm transition-colors shadow-sm
    text-foreground bg-background/60
    hover:bg-primary hover:text-primary-foreground
    dark:hover:bg-white/20 dark:hover:text-white
  `

  return (
    <main className="min-h-screen bg-background overflow-x-hidden">
      <div className="fixed top-0 left-0 w-full z-50">
        <Navbar />
      </div>

      {/* HERO BACKGROUND */}
      <div className="relative h-112 md:h-128 w-full overflow-hidden">
        <Image
          src={imageUrl}
          alt="Manga background"
          fill
          className="object-cover blur-sm opacity-60 dark:opacity-40"
          quality={80}
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent"></div>
      </div>

      {/* CONTENT WRAPPER */}
      <div className="relative z-20 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-32 md:-mt-48 grid grid-cols-1 md:grid-cols-3 gap-8 pb-12">

        {/* POSTER (BORDER REMOVED) */}
        <div className="relative w-48 md:w-64 mx-auto md:mx-0">
          <div className="shadow-2xl rounded-lg overflow-hidden group transition-transform duration-500 hover:scale-105">
            <Image src={imageUrl} alt={manga.title} width={300} height={450} className="w-full h-auto" priority />
          </div>
        </div>

        {/* INFO */}
        <div className="md:col-span-2 text-center md:text-left flex flex-col justify-end gap-4 pb-2">
          
          {/* Titles */}
          <div>
            <h1 className="text-3xl md:text-5xl font-extrabold text-foreground drop-shadow-md leading-tight mb-1">
              {manga.title}
            </h1>
            <p className="text-lg text-muted-foreground font-medium">{titleEnglish}</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-2">
            <div className="flex flex-col items-center md:items-start bg-card/80 backdrop-blur-sm p-3 rounded-lg border border-border shadow-sm">
              <div className="flex items-center gap-1 text-sm text-muted-foreground mb-1"><Star size={14} className="text-yellow-500"/> Rating</div>
              <span className="text-lg font-bold text-foreground">{score}</span>
            </div>
            <div className="flex flex-col items-center md:items-start bg-card/80 backdrop-blur-sm p-3 rounded-lg border border-border shadow-sm">
              <div className="flex items-center gap-1 text-sm text-muted-foreground mb-1"><Book size={14} className="text-blue-500"/> Chapters</div>
              <span className="text-lg font-bold text-foreground">{chapters} Ch / {volumes} Vol</span>
            </div>
            <div className="flex flex-col items-center md:items-start bg-card/80 backdrop-blur-sm p-3 rounded-lg border border-border shadow-sm">
              <div className="flex items-center gap-1 text-sm text-muted-foreground mb-1"><Users size={14} className="text-red-500"/> Author</div>
              <span className="text-lg font-bold text-foreground truncate max-w-[120px]" title={authors}>{authors}</span>
            </div>
            <div className="flex flex-col items-center md:items-start bg-card/80 backdrop-blur-sm p-3 rounded-lg border border-border shadow-sm">
              <div className="flex items-center gap-1 text-sm text-muted-foreground mb-1"><Activity size={14} className="text-green-500"/> Status</div>
              <span className="text-lg font-bold text-foreground">{status}</span>
            </div>
          </div>

          {/* ACTION BUTTON (UPDATED STYLE) */}
          <div className="flex flex-wrap gap-3 mt-4 justify-center md:justify-start">
            {malUrl && (
              <a href={malUrl} target="_blank" rel="noopener noreferrer">
                <Button variant="outline" className={glassButtonStyle}>
                  <ExternalLink size={18} /> View on MyAnimeList
                </Button>
              </a>
            )}
          </div>
          
        </div>
      </div>

      {/* DETAILS SECTION */}
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

        {/* Publishing Details */}
        <section className="px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-foreground mb-4 border-l-4 border-primary pl-3">Publishing Info</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-card/50 p-6 rounded-xl border border-border">
            <div className='flex items-center gap-3'>
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-full text-green-600 dark:text-green-400">
                <BookOpen size={20} />
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase font-bold">Status</p>
                <p className="text-foreground font-medium">{status}</p>
              </div>
            </div>
            <div className='flex items-center gap-3'>
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-full text-blue-600 dark:text-blue-400">
                <Calendar size={20} />
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase font-bold">Published From</p>
                <p className="text-foreground font-medium">{publishedFrom}</p>
              </div>
            </div>
            <div className='flex items-center gap-3'>
              <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-full text-orange-600 dark:text-orange-400">
                <Calendar size={20} />
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase font-bold">Published To</p>
                <p className="text-foreground font-medium">{publishedTo}</p>
              </div>
            </div>
          </div>
        </section>
      </div>
     <Footer />
    </main>
  )
}