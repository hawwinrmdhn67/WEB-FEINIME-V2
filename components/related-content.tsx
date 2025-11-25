import Link from 'next/link'
import { Link2, Book as BookIcon, Tv, ExternalLink } from 'lucide-react'
import { Relation } from '@/lib/api' // Pastikan impor tipe data Relation sudah benar

// --- KOMPONEN RELATED CONTENT (Grid Layout) ---
export const RelatedContent = ({ relations }: { relations: Relation[] }) => {
    if (!relations || relations.length === 0) return null
    
    return (
        <section className="px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-foreground mb-4 border-l-4 border-primary pl-3 flex items-center gap-2">
                Related Content
            </h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {relations.map((rel, index) => (
                    // Card Content: Removed tabIndex to fix hydration mismatch
                    <div 
                        key={index} 
                        className="bg-card rounded-lg overflow-hidden flex flex-col shadow-sm hover:shadow-md transition-shadow z-10 
                                   focus:outline-none focus:ring-0 focus:ring-offset-0"
                    >
                        
                        {/* Header Kategori */}
                        <div className="bg-secondary/30 px-4 py-2 flex items-center gap-2">
                            <Link2 size={16} className="text-primary" />
                            <span className="font-bold text-sm text-foreground uppercase tracking-wide">{rel.relation}</span>
                        </div>

                        {/* List Item */}
                        <div className="p-2 flex flex-col gap-1">
                            {rel.entry.map((entry) => {
                                
                                // Item link classes: Ensures no focus ring
                                const commonClasses = "flex items-center justify-between gap-2 p-2 rounded-md hover:bg-secondary/50 transition-colors group focus:outline-none focus:ring-0 focus:ring-offset-0"
                                const textClasses = "text-sm font-medium text-muted-foreground group-hover:text-primary transition-colors line-clamp-1"

                                // 1. ANIME
                                if (entry.type === 'anime') {
                                    return (
                                        <Link key={entry.mal_id} href={`/anime/${entry.mal_id}`} className={commonClasses}>
                                            <div className="flex items-center gap-2 overflow-hidden">
                                                <Tv size={14} className="text-blue-500 shrink-0" />
                                                <span className={textClasses}>{entry.name}</span>
                                            </div>
                                            <span className="text-[10px] font-bold text-blue-500 bg-blue-500/20 px-1.5 py-0.5 rounded dark:bg-blue-500/10">TV</span>
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
                                            <span className="text-[10px] font-bold text-green-500 bg-green-500/20 px-1.5 py-0.5 rounded dark:bg-green-500/10">Manga</span>
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
                                            <span className="text-[10px] uppercase text-muted-foreground/70 bg-secondary px-1.5 py-0.5 rounded">
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