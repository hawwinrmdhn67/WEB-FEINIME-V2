import { Statistics } from '@/lib/api'
import { Eye, CheckCircle, PauseCircle, XCircle, Clock } from 'lucide-react'

export const StatsSection = ({ stats }: { stats: Statistics | null }) => {
    if (!stats) return null
    const formatNumber = (num: number) => new Intl.NumberFormat('en-US').format(num)

    return (
        <section className="px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-foreground mb-4 border-l-4 border-primary pl-3">Statistics</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                <StatItem icon={Eye} label="Watching" value={stats.watching} color="text-blue-500" />
                <StatItem icon={CheckCircle} label="Completed" value={stats.completed} color="text-green-500" />
                <StatItem icon={PauseCircle} label="On Hold" value={stats.on_hold} color="text-yellow-500" />
                <StatItem icon={XCircle} label="Dropped" value={stats.dropped} color="text-red-500" />
                <StatItem icon={Clock} label="Plan to Watch" value={stats.plan_to_watch} color="text-purple-500" />
            </div>
        </section>
    )
}

// Helper Component untuk item statistik agar tidak duplikasi kode
const StatItem = ({ icon: Icon, label, value, color }: any) => (
    <div className="bg-card p-4 rounded-xl flex flex-col items-center text-center transition-colors shadow-sm hover:shadow-md focus:outline-none z-10 gpu-accelerate">
        <Icon className={`${color} mb-2`} size={24} />
        <span className="text-xs text-muted-foreground uppercase font-bold">{label}</span>
        <span className="text-lg font-bold text-foreground">{new Intl.NumberFormat('en-US').format(value)}</span>
    </div>
)