import React from 'react'

export function AiringItem({
  label,
  value,
  icon,
  color,
}: {
  label: string
  value: string
  icon: React.ReactNode
  color: 'green' | 'blue' | 'orange'
}) {
  const colorMap = {
    green: 'bg-green-100 text-green-600 dark:bg-green-900/30',
    blue: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30',
    orange: 'bg-orange-100 text-orange-600 dark:bg-orange-900/30',
  }

  return (
    <div className="flex items-center gap-4 min-w-0">
      <div className={`p-3 rounded-full ${colorMap[color]}`}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground uppercase font-bold">
          {label}
        </p>
        <p className="text-base md:text-lg font-semibold text-foreground truncate">
          {value}
        </p>
      </div>
    </div>
  )
}

export function AiringDivider() {
  return (
    <div className="hidden sm:block h-10 w-px bg-border dark:bg-white/10" />
  )
}
