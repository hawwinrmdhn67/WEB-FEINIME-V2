'use client'

import { SkeletonLoader } from './skeleton-loader'

interface SkeletonGridProps {
  count?: number
  type?: 'trending' | 'search' | 'popular' | 'seasonal'
}

export function SkeletonGrid({ count = 8, type = 'trending' }: SkeletonGridProps) {
  // Tentukan grid columns sesuai type
  const getGridCols = () => {
    switch (type) {
      case 'search':
      case 'trending':
        return 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5'
      case 'popular':
      case 'seasonal':
        return 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6'
      default:
        return 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5'
    }
  }

  return (
    <div className={`grid ${getGridCols()} gap-4 md:gap-6`}>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonLoader key={i} type={type === 'trending' ? 'trending' : 'search'} />
      ))}
    </div>
  )
}
