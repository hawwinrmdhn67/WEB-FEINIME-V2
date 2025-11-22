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