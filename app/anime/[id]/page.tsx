import { 
    getAnimeDetail, 
    getAnimeCharacters, 
    getAnimeReviews, 
    getAnimeStatistics,
    Anime, // Import Type
} from '@/lib/api'
import { Navbar } from '@/components/navbar'
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

// Import komponen anak dari lokasi yang diasumsikan
import { RelatedContent } from '@/components/related-content'
import { CharacterList } from '@/components/character-list'
import { ReviewsSection } from '@/components/review-section'
import { StatsSection } from '@/components/stats-section'
import { Footer } from "@/components/feinime-footer";


interface AnimePageProps {
    params: Promise<{ id: string }>
}

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

    // Data Formatting
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

    // Style helper for info cards
    const infoCardStyle = "flex flex-col items-center md:items-start bg-card/80 backdrop-blur-sm p-3 rounded-lg shadow-sm focus:outline-none z-10"

    return (
        <main className="min-h-screen bg-background overflow-x-hidden">

            <div className="fixed top-0 left-0 w-full z-50">
                <Navbar />
            </div>

            {/* HERO */}
            <div className="relative h-112 md:h-128 w-full overflow-hidden">
                <Image src={imageUrl} alt="Anime background" fill className="object-cover blur-sm opacity-60 dark:opacity-30 gpu-accelerate" quality={80} priority />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent"></div>
            </div>

            {/* INFO HEADER */}
            <div className="relative z-20 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-32 md:-mt-48 grid grid-cols-1 md:grid-cols-3 gap-8 pb-12">
                
                {/* POSTER IMAGE (FIXED ASPECT RATIO) */}
                <div className="relative w-full max-w-[240px] mx-auto md:mx-0 aspect-[2/3]">
                    {/* Poster Card: No tabIndex or focus ring on the wrapper */}
                    <div 
                        className="shadow-2xl rounded-lg overflow-hidden group transition-transform duration-500 hover:scale-105 bg-card h-full w-full focus:outline-none focus:ring-0 focus:ring-offset-0 gpu-accelerate"
                    >
                        <Image 
                            src={imageUrl} 
                            alt={anime.title} 
                            fill 
                            sizes="(max-width: 768px) 100vw, 300px"
                            className="object-cover w-full h-full rounded-lg" 
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
                        {/* Info Card - Rating */}
                        <div className={infoCardStyle}>
                            <div className="flex items-center gap-1 text-sm text-muted-foreground mb-1"><Star size={14} className="text-yellow-500"/> Rating</div>
                            <span className="text-lg font-bold text-foreground">{score}</span>
                        </div>
                        {/* Info Card - Episodes */}
                        <div className={infoCardStyle}>
                            <div className="flex items-center gap-1 text-sm text-muted-foreground mb-1"><Film size={14} className="text-blue-500"/> Episodes</div>
                            <span className="text-lg font-bold text-foreground">{episodes}</span>
                        </div>
                        {/* Info Card - Source */}
                        <div className={infoCardStyle}>
                            <div className="flex items-center gap-1 text-sm text-muted-foreground mb-1"><BookOpen size={14} className="text-red-500"/> Source</div>
                            <span className="text-lg font-bold text-foreground">{source}</span>
                        </div>
                        {/* Info Card - Year */}
                        <div className={infoCardStyle}>
                            <div className="flex items-center gap-1 text-sm text-muted-foreground mb-1"><Calendar size={14} className="text-purple-500"/> Year</div>
                            <span className="text-lg font-bold text-foreground">{year}</span>
                        </div>
                    </div>
                    <AnimeActionButtons animeId={animeId} trailerUrl={trailerUrl} title={''} imageUrl={''} totalEpisodes={null} />
                </div>
            </div>

            {/* MAIN CONTENT BODY */}
            <div className="relative max-w-6xl mx-auto mt-4 space-y-12 pb-20">

                {/* Genres */}
                {genres.length > 0 && (
                    <div className="px-4 sm:px-6 lg:px-8 flex flex-wrap gap-2">
                        {genres.map((genre) => (
                            <span key={genre.mal_id} className="px-4 py-1.5 bg-secondary text-secondary-foreground font-medium text-sm rounded-full hover:bg-secondary/80 transition-colors cursor-default focus:outline-none">
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
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-card/50 p-6 rounded-xl">
                        <div className='flex items-center gap-3 focus:outline-none'>
                            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-full text-green-600 dark:text-green-400">
                                <Activity size={20} />
                            </div>
                            <div><p className="text-xs text-muted-foreground uppercase font-bold">Status</p><p className="text-foreground font-medium">{status}</p></div>
                        </div>
                        <div className='flex items-center gap-3 focus:outline-none'>
                            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-full text-blue-600 dark:text-blue-400">
                                <Calendar size={20} />
                            </div>
                            <div><p className="text-xs text-muted-foreground uppercase font-bold">Aired From</p><p className="text-foreground font-medium">{airedFrom}</p></div>
                        </div>
                        <div className='flex items-center gap-3 focus:outline-none'>
                            <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-full text-orange-600 dark:text-orange-400">
                                <Calendar size={20} />
                            </div>
                            <div><p className="text-xs text-muted-foreground uppercase font-bold">Aired To</p><p className="text-foreground font-medium">{airedTo}</p></div>
                        </div>
                    </div>
                </section>

                <StatsSection stats={stats} />
                <CharacterList characters={characters} />
                <ReviewsSection reviews={reviews} />
                <RelatedContent relations={relations} />

            </div>
        <Footer />
    </main>
    )
}