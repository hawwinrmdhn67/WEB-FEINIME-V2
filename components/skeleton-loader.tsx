'use client'

import React from 'react'

export type SkeletonType =
  | 'home-hero'
  | 'home'
  | 'page-header'
  | 'header-section'
  | 'header-side'
  | 'trending'
  | 'trending-header'
  | 'activity'
  | 'seasonal'
  | 'popular'
  | 'search'
  | 'my-list'
  | 'genres'
  | 'stats'
  | 'reviews'
  | 'characters'
  | 'related'
  | 'footer'

interface SkeletonLoaderProps {
  type: SkeletonType
  count?: number
  subtitleClassName?: string
}

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  type,
  count = 6,
  subtitleClassName
}) => {

  const gridCols =
    type === 'search' || type === 'my-list' || type === 'home'
      ? 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5'
      : 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6'

  if (type === 'home-hero') {
    return (
      <div className="flex flex-col gap-4 h-full">
        {Array.from({ length: count }).map((_, i) => (
          <div
            key={i}
            className="flex flex-col sm:flex-row bg-card rounded-xl overflow-hidden border border-border/50 animate-pulse h-full shadow-sm"
          >
            <div className="w-full sm:w-5/12 h-48 sm:h-auto bg-muted dark:bg-muted/70" />
            <div className="flex-1 p-4 flex flex-col gap-2">
              <div className="h-4 w-20 bg-muted/80 rounded mb-2" />
              <div className="h-6 w-3/4 bg-muted/80 rounded" />
              <div className="h-6 w-1/2 bg-muted/80 rounded" />
              <div className="flex gap-3 mt-3">
                <div className="h-3 w-10 bg-muted/80 rounded" />
                <div className="h-3 w-12 bg-muted/80 rounded" />
                <div className="h-3 w-9 bg-muted/80 rounded" />
              </div>
              <div className="flex-1 space-y-2 mt-3">
                <div className="h-3 w-full bg-muted/80 rounded" />
                <div className="h-3 w-4/6 bg-muted/80 rounded" />
              </div>
              <div className="h-8 w-28 bg-muted/80 rounded mt-auto" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (type === 'home') {
    return (
      <div className="flex gap-4 sm:gap-6 overflow-x-hidden px-4 sm:px-6 lg:px-8 py-10">
        {Array.from({ length: count }).map((_, i) => (
          <div
            key={i}
            className="flex-shrink-0 w-[60vw] sm:w-60 md:w-72 rounded-xl bg-card border border-border/50 animate-pulse shadow-sm"
          >
            <div className="w-full aspect-[2/3] bg-muted/80 rounded-t-xl" />
            <div className="p-3">
              <div className="h-4 w-24 bg-muted/80 rounded" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (type === 'page-header' || type === 'trending-header') {
    return (
      <div className="flex flex-col gap-3 mb-10 animate-pulse items-start">
        <div className="h-8 w-48 bg-muted/80 rounded-lg" />
        <div className={`h-4 bg-muted/80 rounded-lg ${subtitleClassName || "w-64"}`} />
      </div>
    )
  }

  if (type === 'header-section') {
    return (
      <div className="flex items-center justify-between mb-6">
        <div className="h-8 w-40 bg-muted/80 rounded" />
        <div className="h-5 w-20 bg-muted/80 rounded" />
      </div>
    )
  }

  if (type === 'header-side') {
    return (
      <div className="flex items-center justify-between mb-4 px-1">
        <div className="flex items-center gap-2">
          <div className="h-5 w-5 bg-muted/80 rounded" />
          <div className="h-6 w-32 bg-muted/80 rounded" />
        </div>
        <div className="h-4 w-16 bg-muted/80 rounded" />
      </div>
    )
  }

  if (type === 'trending') {
    return (
      <div className="flex flex-col gap-3">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="flex gap-3 p-3 rounded-xl bg-card border border-border/50 animate-pulse">
            <div className="w-5 h-6 bg-muted/80 rounded" />
            <div className="w-12 h-16 bg-muted/80 rounded-md" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-3/4 bg-muted/80 rounded" />
              <div className="h-3 w-1/2 bg-muted/80 rounded" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (type === 'activity') {
    return (
      <div className="flex flex-col gap-4">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 p-3 bg-card border border-border/40 rounded-xl animate-pulse">
            <div className="w-10 h-10 bg-muted/80 rounded-full" />
            <div className="flex-1 space-y-2">
              <div className="h-3 w-1/4 bg-muted/80 rounded" />
              <div className="h-3 w-1/2 bg-muted/80 rounded" />
            </div>
            <div className="h-3 w-12 bg-muted/80 rounded" />
          </div>
        ))}
      </div>
    )
  }

  if (type === 'stats') {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="p-4 bg-card/60 border border-border/40 rounded-xl animate-pulse">
            <div className="h-4 w-32 bg-muted/80 rounded mb-3" />
            <div className="h-6 w-20 bg-muted/80 rounded mb-4" />
            <div className="space-y-2">
              <div className="h-3 w-full bg-muted/80 rounded" />
              <div className="h-3 w-5/6 bg-muted/80 rounded" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (type === 'reviews') {
    return (
      <div className="flex flex-col gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="p-4 bg-card/50 border border-border/40 rounded-xl animate-pulse">
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 rounded-full bg-muted/80" />
              <div className="flex-1 space-y-3">
                <div className="h-4 w-1/3 bg-muted/80 rounded" />
                <div className="h-3 w-full bg-muted/80 rounded" />
                <div className="h-3 w-4/5 bg-muted/80 rounded" />
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (type === 'characters') {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 animate-pulse">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="p-3 flex flex-col items-center bg-card border border-border/50 rounded-xl">
            <div className="w-24 h-24 rounded-lg bg-muted/80 mb-3" />
            <div className="h-4 w-3/4 bg-muted/80 rounded mb-1" />
            <div className="h-3 w-1/2 bg-muted/80 rounded" />
          </div>
        ))}
      </div>
    )
  }

  if (type === 'related') {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 animate-pulse">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-card border border-border/50 rounded-xl overflow-hidden">
            <div className="w-full aspect-[2/3] bg-muted/80" />
            <div className="p-3 space-y-2">
              <div className="h-4 w-3/4 bg-muted/80 rounded" />
              <div className="h-3 w-1/2 bg-muted/80 rounded" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (type === 'footer') {
    return (
      <footer className="bg-surface border-t border-border mt-auto text-sm animate-pulse">
        <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 py-10 sm:py-12">

          {/* GRID */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-y-10 gap-x-8 lg:gap-12 w-full">

            {/* BRAND */}
            <div className="col-span-2 lg:col-span-2 space-y-4 flex flex-col items-start mr-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-muted/80 border border-border/50" />
                <div className="h-5 w-36 bg-muted/80 rounded" />
              </div>

              <div className="space-y-2 max-w-xs">
                <div className="h-3 w-56 bg-muted/80 rounded" />
                <div className="h-3 w-48 bg-muted/80 rounded" />
                <div className="h-3 w-40 bg-muted/80 rounded" />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <div className="w-8 h-8 rounded-lg bg-muted/80 border border-border" />
                <div className="w-8 h-8 rounded-lg bg-muted/80 border border-border" />
                <div className="w-8 h-8 rounded-lg bg-muted/80 border border-border" />
              </div>
            </div>

            {/* COLUMN 1 */}
            <div>
              <div className="h-4 w-24 bg-muted/80 rounded mb-4" />
              <div className="space-y-2">
                <div className="h-3 w-20 bg-muted/80 rounded" />
                <div className="h-3 w-20 bg-muted/80 rounded" />
                <div className="h-3 w-20 bg-muted/80 rounded" />
                <div className="h-3 w-16 bg-muted/80 rounded" />
              </div>
            </div>

            {/* COLUMN 2 */}
            <div>
              <div className="h-4 w-24 bg-muted/80 rounded mb-4" />
              <div className="space-y-2">
                <div className="h-3 w-20 bg-muted/80 rounded" />
                <div className="h-3 w-20 bg-muted/80 rounded" />
                <div className="h-3 w-20 bg-muted/80 rounded" />
                <div className="h-3 w-16 bg-muted/80 rounded" />
              </div>
            </div>

            {/* COLUMN 3 */}
            <div>
              <div className="h-4 w-24 bg-muted/80 rounded mb-4" />
              <div className="space-y-2">
                <div className="h-3 w-20 bg-muted/80 rounded" />
                <div className="h-3 w-20 bg-muted/80 rounded" />
                <div className="h-3 w-20 bg-muted/80 rounded" />
                <div className="h-3 w-16 bg-muted/80 rounded" />
              </div>
            </div>

            {/* COLUMN 4 */}
            <div>
              <div className="h-4 w-24 bg-muted/80 rounded mb-4" />
              <div className="space-y-2">
                <div className="h-3 w-20 bg-muted/80 rounded" />
                <div className="h-3 w-20 bg-muted/80 rounded" />
                <div className="h-3 w-20 bg-muted/80 rounded" />
                <div className="h-3 w-16 bg-muted/80 rounded" />
              </div>
            </div>
          </div>

          {/* BOTTOM SECTION */}
          <div className="mt-12 pt-8 border-t border-border">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="h-3 w-56 bg-muted/80 rounded" />
              <div className="h-3 w-40 bg-muted/80 rounded" />
            </div>
          </div>

        </div>
      </footer>
    )
  }

  return (
    <div className={`grid ${gridCols} gap-4 md:gap-6`}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-card border border-border/50 rounded-xl animate-pulse overflow-hidden">
          <div className="w-full aspect-[2/3] bg-muted/80" />
          <div className="p-3 space-y-2">
            <div className="h-4 w-3/4 bg-muted/80 rounded" />
            <div className="h-4 w-1/2 bg-muted/80 rounded" />
            <div className="flex justify-between pt-1">
              <div className="h-3 w-12 bg-muted/80 rounded" />
              <div className="h-3 w-16 bg-muted/80 rounded-full" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
