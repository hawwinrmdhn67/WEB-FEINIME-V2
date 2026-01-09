 'use client'

import { useEffect, useState } from 'react'
import {
  Eye,
  CheckCircle,
  PauseCircle,
  XCircle,
  Clock,
} from 'lucide-react'
import { getAnimeStatistics } from '@/lib/api'

interface Props {
  animeId: number
}

interface Stats {
  watching: number
  completed: number
  on_hold: number
  dropped: number
  plan_to_watch: number
}

export function StatsSection({ animeId }: Props) {
  const [stats, setStats] = useState<Stats | null>(null)

  useEffect(() => {
    getAnimeStatistics(animeId).then(res => {
      if (!res) return

      setStats({
        watching: res.watching ?? 0,
        completed: res.completed ?? 0,
        on_hold: res.on_hold ?? 0,
        dropped: res.dropped ?? 0,
        plan_to_watch: res.plan_to_watch ?? 0,
      })
    })
  }, [animeId])

  if (!stats) return null

  return (
    <section className="px-4 sm:px-6 lg:px-8">
      <h2 className="text-2xl font-bold mb-6 border-l-4 border-primary pl-3">
        Statistics
      </h2>

      {/* 🔥 FIX SEJAJAR */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <StatCard
          label="Watching"
          value={stats.watching}
          icon={<Eye size={18} />}
          color="blue"
        />
        <StatCard
          label="Completed"
          value={stats.completed}
          icon={<CheckCircle size={18} />}
          color="green"
        />
        <StatCard
          label="On Hold"
          value={stats.on_hold}
          icon={<PauseCircle size={18} />}
          color="orange"
        />
        <StatCard
          label="Dropped"
          value={stats.dropped}
          icon={<XCircle size={18} />}
          color="red"
        />
        <StatCard
          label="Plan to Watch"
          value={stats.plan_to_watch}
          icon={<Clock size={18} />}
          color="purple"
        />
      </div>
    </section>
  )
}

function StatCard({
  label,
  value,
  icon,
  color,
}: {
  label: string
  value: number
  icon: React.ReactNode
  color: 'blue' | 'green' | 'orange' | 'red' | 'purple'
}) {
  const colorMap = {
    blue: 'bg-blue-500/10 text-blue-500',
    green: 'bg-green-500/10 text-green-500',
    orange: 'bg-orange-500/10 text-orange-500',
    red: 'bg-red-500/10 text-red-500',
    purple: 'bg-purple-500/10 text-purple-500',
  }

  return (
    <div
      className="
        bg-card/80 backdrop-blur
        border border-black/10 dark:border-white/10
        rounded-2xl
        px-6 py-5
        min-h-[110px]
        flex items-center
      "
    >
      <div className="flex items-center gap-4 min-w-0">
        <div className={`p-3 rounded-full ${colorMap[color]}`}>
          {icon}
        </div>

        <div className="min-w-0">
          <p className="text-xs text-muted-foreground uppercase font-bold">
            {label}
          </p>
          <p className="text-base md:text-lg font-semibold text-foreground tabular-nums truncate">
            {value.toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  )
}
