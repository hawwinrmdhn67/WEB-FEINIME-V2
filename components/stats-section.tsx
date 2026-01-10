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

      {/* GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatsItem
          label="Watching"
          value={stats.watching}
          icon={<Eye size={22} />}
          color="blue"
        />
        <StatsItem
          label="Completed"
          value={stats.completed}
          icon={<CheckCircle size={22} />}
          color="green"
        />
        <StatsItem
          label="On Hold"
          value={stats.on_hold}
          icon={<PauseCircle size={22} />}
          color="orange"
        />
        <StatsItem
          label="Dropped"
          value={stats.dropped}
          icon={<XCircle size={22} />}
          color="red"
        />
        <StatsItem
          label="Plan to Watch"
          value={stats.plan_to_watch}
          icon={<Clock size={22} />}
          color="purple"
        />
      </div>
    </section>
  )
}

function StatsItem({
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
    blue: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30',
    green: 'bg-green-100 text-green-600 dark:bg-green-900/30',
    orange: 'bg-orange-100 text-orange-600 dark:bg-orange-900/30',
    red: 'bg-red-100 text-red-600 dark:bg-red-900/30',
    purple: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30',
  }

  return (
    <div className="bg-card border border-black/10 dark:border-white/10 rounded-2xl px-6 py-5 w-full h-full">
      <div className="flex items-center gap-4">
        <div className={`p-3 rounded-full ${colorMap[color]}`}>
          {icon}
        </div>

        <div>
          <p className="text-xs uppercase font-bold text-muted-foreground">
            {label}
          </p>
          <p className="text-base md:text-lg font-semibold text-foreground tabular-nums">
            {value.toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  )
}