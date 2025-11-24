import Image from 'next/image'
import { Star, ExternalLink } from 'lucide-react'
import { Review } from '@/lib/api' // Pastikan impor tipe data Review sudah benar

// --- KOMPONEN REVIEWS ---
export const ReviewsSection = ({ reviews }: { reviews: Review[] }) => {
    if (!reviews || reviews.length === 0) return null

    return (
        <section className="px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-foreground mb-4 border-l-4 border-primary pl-3 flex items-center gap-2">
                Reviews <span className="text-sm font-normal text-muted-foreground">({reviews.length} displayed)</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {reviews.map((review, idx) => (
                    // Card Review: Added no-ring/no-outline focus styles
                    <div key={idx} className="bg-card rounded-xl p-5 flex flex-col gap-4 hover:shadow-md transition-shadow shadow-sm focus:outline-none focus:ring-0 focus:ring-offset-0 z-10 gpu-accelerate">
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
                            <div className="absolute bottom-0 left-0 w-full h-6 bg-gradient-to-t from-background to-transparent"></div>
                        </div>
                        {/* Link: focus:outline-none already present */}
                        <a href={review.url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary font-semibold hover:underline flex items-center gap-1 mt-auto focus:outline-none">
                            Read Full Review <ExternalLink size={10} />
                        </a>
                    </div>
                ))}
            </div>
        </section>
    )
}