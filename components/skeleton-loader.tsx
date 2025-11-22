'use client'

import React from 'react'

export type SkeletonType = 'home' | 'trending' | 'seasonal' | 'popular' | 'search' | 'genres'

interface SkeletonLoaderProps {
  type: SkeletonType
  count?: number
}

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({ type, count = 6 }) => {
  // Helper: untuk grid layout
  const isGridLayout = ['seasonal', 'popular', 'search'].includes(type)

  // GRID columns sesuai tipe
  const gridCols = type === 'search'
    ? 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5'
    : 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6'

  if (type === 'home') {
    return (
      <div className="flex flex-col gap-6">
        {Array.from({ length: count }).map((_, i) => (
          // Penyesuaian responsif pada elemen kontainer 'home'
          <div 
            key={i} 
            className="flex flex-col sm:flex-row bg-card rounded-xl overflow-hidden border border-border/50 animate-pulse 
                       h-auto sm:h-64" // Tinggi di mobile diatur otomatis, di sm ke atas tetap 64
          >
            {/* Placeholder Gambar: Di mobile mengambil lebar penuh, dengan rasio tertentu */}
            <div 
              className="w-full sm:w-5/12 h-48 sm:h-auto bg-muted dark:bg-muted/70 
                         rounded-t-xl sm:rounded-l-xl sm:rounded-r-none" // Penyesuaian border radius di mobile dan sm+
            />
            {/* Konten Placeholder */}
            <div className="flex-1 p-4 sm:p-5 flex flex-col gap-3">
              <div className="h-4 bg-muted dark:bg-muted/70 rounded w-1/3" />
              <div className="h-6 bg-muted dark:bg-muted/70 rounded w-3/4" />
              <div className="flex gap-2 mt-2">
                <div className="h-4 bg-muted dark:bg-muted/70 rounded w-12" />
                <div className="h-4 bg-muted dark:bg-muted/70 rounded w-16" />
                <div className="h-4 bg-muted dark:bg-muted/70 rounded w-20" />
              </div>
              <div className="flex-1 h-12 bg-muted dark:bg-muted/70 rounded mt-2" />
              <div className="h-9 bg-muted dark:bg-muted/70 rounded w-32 mt-auto self-start" /> {/* self-start agar rata kiri */}
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (type === 'trending') {
    return (
      <div className="flex flex-col gap-3">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="flex gap-4 items-center p-3 rounded-xl bg-card border border-border/50 animate-pulse">
            <span className="w-6 h-6 bg-muted dark:bg-muted/70 rounded" />
            <div className="w-12 h-16 rounded-md bg-muted dark:bg-muted/70" />
            <div className="flex-1 h-4 bg-muted dark:bg-muted/70 rounded" />
          </div>
        ))}
      </div>
    )
  }

  // GRID layout: seasonal, popular, search
  return (
    <div className={`grid ${gridCols} gap-4 md:gap-6`}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex flex-col gap-2 animate-pulse bg-card p-2 rounded-lg">
          <div className="w-full aspect-[2/3] bg-muted dark:bg-muted/70 rounded-lg" />
          <div className="h-4 bg-muted dark:bg-muted/70 rounded w-3/4 mt-2" />
          <div className="h-3 bg-muted dark:bg-muted/70 rounded w-1/2" />
          <div className="flex gap-2 mt-1">
            <div className="h-3 bg-muted dark:bg-muted/70 rounded w-6" />
            <div className="h-3 bg-muted dark:bg-muted/70 rounded w-10" />
          </div>
        </div>
      ))}
    </div>
  )
}