'use client'

import React from 'react'

export type SkeletonType =
  | 'home-hero'       // Banner Besar (Home)
  | 'home'            // Carousel Horizontal
  | 'page-header'     // Judul Halaman (Title + Subtitle) -> Trending, Popular, MyList, Activity, Search
  | 'header-section'  // Judul Section (Title + View All) -> Home Sections
  | 'header-side'     // Judul Sidebar (Icon + Title + Link) -> Home Sidebar
  | 'trending'        // List Sidebar (Vertical: Rank + Image + Text)
  | 'trending-header' // Alias page-header
  | 'activity'        // List Activity (Icon Bulat + Text + Time)
  | 'seasonal'        // Grid 6 Kolom
  | 'popular'         // Grid 6 Kolom
  | 'search'          // Grid 5 Kolom
  | 'my-list'         // Grid 5 Kolom
  | 'genres'          // Grid 6 Kolom

interface SkeletonLoaderProps {
  type: SkeletonType
  count?: number
  subtitleClassName?: string // Opsional: Untuk mengatur lebar subtitle header secara manual
}

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({ 
  type, 
  count = 6,
  subtitleClassName 
}) => {

  // =========================
  // HELPER: GRID COLUMNS
  // Mengatur jumlah kolom berdasarkan tipe halaman
  // =========================
  const gridCols =
    type === 'search' || type === 'my-list' || type === 'home'
      ? 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5' // 5 Kolom
      : 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6' // 6 Kolom (Default)

  // =========================
  // 1. HOME HERO (Banner Besar - Compact Version)
  // =========================
  if (type === 'home-hero') {
    return (
      <div className="flex flex-col gap-4 h-full">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="flex flex-col sm:flex-row bg-card rounded-xl overflow-hidden border border-border/50 animate-pulse h-full shadow-sm">
            {/* Image Area */}
            <div className="w-full sm:w-5/12 h-48 sm:h-auto aspect-[16/9] sm:aspect-auto bg-muted dark:bg-muted/70 rounded-t-xl sm:rounded-l-xl sm:rounded-r-none shrink-0" />
            
            {/* Content Area */}
            <div className="flex-1 p-4 flex flex-col gap-2">
              <div className="h-4 bg-muted dark:bg-muted/70 rounded w-16 mb-1" /> {/* Badge */}
              
              <div className="space-y-1.5 mb-2">
                 <div className="h-6 bg-muted dark:bg-muted/70 rounded w-11/12" /> {/* Title 1 */}
                 <div className="h-6 bg-muted dark:bg-muted/70 rounded w-3/4" />  {/* Title 2 */}
              </div>
              
              <div className="flex gap-2 mb-2">
                <div className="h-3.5 bg-muted dark:bg-muted/70 rounded w-10" />
                <div className="h-3.5 bg-muted dark:bg-muted/70 rounded w-10" />
                <div className="h-3.5 bg-muted dark:bg-muted/70 rounded w-10" />
              </div>
              
              <div className="space-y-1.5 flex-1">
                <div className="h-3.5 w-full bg-muted dark:bg-muted/70 rounded" />
                <div className="h-3.5 w-5/6 bg-muted dark:bg-muted/70 rounded" />
              </div>
              
              <div className="h-8 bg-muted dark:bg-muted/70 rounded w-28 mt-auto self-start" /> {/* Button */}
            </div>
          </div>
        ))}
      </div>
    )
  }

  // =========================
  // 2. HOME CAROUSEL (Horizontal)
  // =========================
  if (type === 'home') {
    return (
      <div className="flex gap-4 sm:gap-6 overflow-x-hidden px-4 sm:px-6 lg:px-8 py-10">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="flex-shrink-0 w-[60vw] sm:w-60 md:w-72 rounded-xl overflow-hidden bg-card border border-border/50 animate-pulse shadow-sm">
            <div className="relative w-full aspect-[2/3] bg-muted dark:bg-muted/70">
              <div className="absolute top-2 left-2 h-5 w-16 bg-background/30 rounded-full" />
              <div className="absolute top-2 right-2 h-5 w-14 bg-background/30 rounded-full" />
              <div className="absolute bottom-0 left-0 w-full p-4 space-y-2">
                <div className="h-5 w-3/4 bg-background/40 rounded" />
              </div>
            </div>
            <div className="p-3 flex flex-col gap-2 border-t border-border/40 bg-card">
              <div className="h-4 w-24 bg-muted dark:bg-muted/70 rounded" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  // =========================
  // 3. PAGE HEADER
  // =========================
  if (type === 'page-header' || type === 'trending-header') {
    return (
      // UBAH: 'items-center md:items-start' MENJADI 'items-start'
      <div className="flex flex-col gap-3 mb-10 items-start animate-pulse">
         
         {/* Main Title */}
         <div className="h-8 md:h-10 w-48 sm:w-64 bg-muted dark:bg-muted/70 rounded-lg" />
         
         {/* Subtitle */}
         <div 
            className={`h-4 bg-muted dark:bg-muted/70 rounded-lg ${subtitleClassName || 'w-64 sm:w-96'}`} 
         />
      </div>
    )
  }

  // =========================
  // 4. SECTION HEADER (Judul Section Home + View All)
  // Dipakai di: Home (Season Now, All Time Popular)
  // =========================
  if (type === 'header-section') {
    return (
      <div className="flex items-center justify-between mb-6">
        {/* Title (Kiri) */}
        <div className="h-8 md:h-9 w-40 sm:w-64 bg-muted dark:bg-muted/70 rounded animate-pulse" />
        {/* View All (Kanan) */}
        <div className="h-5 w-20 bg-muted dark:bg-muted/70 rounded animate-pulse" />
      </div>
    )
  }

  // =========================
  // 5. SIDEBAR HEADER (Icon + Title + Link)
  // Dipakai di: Home Sidebar (Top Charts)
  // =========================
  if (type === 'header-side') {
    return (
      <div className="flex items-center justify-between mb-4 px-1">
        <div className="flex items-center gap-2">
           <div className="h-5 w-5 bg-muted dark:bg-muted/70 rounded animate-pulse" />
           <div className="h-6 w-32 bg-muted dark:bg-muted/70 rounded animate-pulse" />
        </div>
        <div className="h-4 w-16 bg-muted dark:bg-muted/70 rounded animate-pulse" />
      </div>
    )
  }

  // =========================
  // 6. SIDEBAR LIST (List Item Vertical)
  // Dipakai di: Home Sidebar Content
  // =========================
  if (type === 'trending') {
    return (
      <div className="flex flex-col gap-3">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="flex gap-4 items-center p-3 rounded-xl bg-card border border-border/50 animate-pulse">
            {/* Rank Number */}
            <div className="w-6 h-6 flex items-center justify-center">
               <div className="w-4 h-6 bg-muted dark:bg-muted/70 rounded" />
            </div>
            {/* Image Thumbnail */}
            <div className="w-12 h-16 bg-muted dark:bg-muted/70 rounded-md shrink-0" />
            {/* Info */}
            <div className="flex-1 space-y-2 min-w-0">
              <div className="h-4 w-3/4 bg-muted dark:bg-muted/70 rounded" />
              <div className="flex gap-2">
                 <div className="h-3 w-8 bg-muted dark:bg-muted/70 rounded" />
                 <div className="h-3 w-12 bg-muted dark:bg-muted/70 rounded" />
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  // =========================
  // 7. ACTIVITY LIST (Icon Bulat + Text + Time)
  // Dipakai di: Activity Page
  // =========================
  if (type === 'activity') {
    return (
      <div className="flex flex-col gap-3">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 p-3 rounded-lg border border-border/40 bg-card/50 animate-pulse">
            {/* Icon Circle */}
            <div className="w-10 h-10 rounded-full bg-muted dark:bg-muted/70 shrink-0" />
            
            {/* Text Lines */}
            <div className="flex-1 min-w-0 space-y-2">
              <div className="h-3 w-1/4 bg-muted dark:bg-muted/70 rounded" />
              <div className="h-4 w-1/2 bg-muted dark:bg-muted/70 rounded" />
            </div>

            {/* Time (Right side) */}
            <div className="h-3 w-16 bg-muted dark:bg-muted/70 rounded pl-2 border-l border-border/50" />
          </div>
        ))}
      </div>
    )
  }

  // =========================
  // 8. DEFAULT GRID (Universal Card)
  // Dipakai di: Seasonal Page, Popular Page, Search, My List
  // =========================
  return (
    <div className={`grid ${gridCols} gap-4 md:gap-6`}>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="flex flex-col rounded-xl overflow-hidden bg-card border border-border/50 animate-pulse"
        >
          {/* Image Aspect 2/3 */}
          <div className="w-full aspect-[2/3] bg-muted dark:bg-muted/70 rounded-t-xl" />

          {/* Card Body */}
          <div className="p-3 flex flex-col gap-2">
            <div className="h-4 bg-muted dark:bg-muted/70 rounded w-3/4" />
            <div className="h-4 bg-muted dark:bg-muted/70 rounded w-1/2" />
            
            <div className="flex justify-between items-center mt-1">
              <div className="h-3 w-12 bg-muted dark:bg-muted/70 rounded" />
              <div className="h-3 w-16 bg-muted dark:bg-muted/70 rounded-full" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}