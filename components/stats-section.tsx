import { Eye, CheckCircle, PauseCircle, XCircle, Clock } from 'lucide-react'
import { Statistics } from '@/lib/api' // Pastikan impor tipe data Statistics sudah benar

// --- KOMPONEN STATISTICS ---
export const StatsSection = ({ stats }: { stats: Statistics | null }) => {
    if (!stats) return null
    const formatNumber = (num: number) => new Intl.NumberFormat('en-US').format(num)

    return (
        <section className="px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-foreground mb-4 border-l-4 border-primary pl-3">Statistics</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {/* Card Stat: Added no-ring/no-outline focus styles */}
                <div className="bg-card p-4 rounded-xl flex flex-col items-center text-center transition-colors shadow-sm hover:shadow-md focus:outline-none focus:ring-0 focus:ring-offset-0 z-10 gpu-accelerate">
                    <Eye className="text-blue-500 mb-2" size={24} />
                    <span className="text-xs text-muted-foreground uppercase font-bold">Watching</span>
                    <span className="text-lg font-bold text-foreground">{formatNumber(stats.watching)}</span>
                </div>
                <div className="bg-card p-4 rounded-xl flex flex-col items-center text-center transition-colors shadow-sm hover:shadow-md focus:outline-none focus:ring-0 focus:ring-offset-0 z-10 gpu-accelerate">
                    <CheckCircle className="text-green-500 mb-2" size={24} />
                    <span className="text-xs text-muted-foreground uppercase font-bold">Completed</span>
                    <span className="text-lg font-bold text-foreground">{formatNumber(stats.completed)}</span>
                </div>
                <div className="bg-card p-4 rounded-xl flex flex-col items-center text-center transition-colors shadow-sm hover:shadow-md focus:outline-none focus:ring-0 focus:ring-offset-0 z-10 gpu-accelerate">
                    <PauseCircle className="text-yellow-500 mb-2" size={24} />
                    <span className="text-xs text-muted-foreground uppercase font-bold">On Hold</span>
                    <span className="text-lg font-bold text-foreground">{formatNumber(stats.on_hold)}</span>
                </div>
                <div className="bg-card p-4 rounded-xl flex flex-col items-center text-center transition-colors shadow-sm hover:shadow-md focus:outline-none focus:ring-0 focus:ring-offset-0 z-10 gpu-accelerate">
                    <XCircle className="text-red-500 mb-2" size={24} />
                    <span className="text-xs text-muted-foreground uppercase font-bold">Dropped</span>
                    <span className="text-lg font-bold text-foreground">{formatNumber(stats.dropped)}</span>
                </div>
                <div className="bg-card p-4 rounded-xl flex flex-col items-center text-center transition-colors shadow-sm hover:shadow-md focus:outline-none focus:ring-0 focus:ring-offset-0 z-10 gpu-accelerate">
                    <Clock className="text-purple-500 mb-2" size={24} />
                    <span className="text-xs text-muted-foreground uppercase font-bold">Plan to Watch</span>
                    <span className="text-lg font-bold text-foreground">{formatNumber(stats.plan_to_watch)}</span>
                </div>
            </div>
        </section>
    )
}