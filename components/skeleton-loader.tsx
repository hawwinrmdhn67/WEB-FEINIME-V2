// File: skeleton-loader.tsx
'use client'

import React from 'react'

// ========================
// 1. Hero Carousel Skeleton
// ========================
// Mengikuti bentuk HorizontalCard: Lebar responsif & Scrollable look
export function HeroSkeleton() {
  return (
    <div className="w-full mt-4 sm:mt-8 mb-8">
      {/* Header Title Dummy */}
      <div className="h-8 w-48 bg-muted rounded mb-4 ml-4 sm:ml-8 animate-pulse" />

      {/* Container Scroll Horizontal Palsu */}
      <div className="flex gap-3 sm:gap-5 md:gap-6 overflow-hidden pb-8 px-4 sm:px-6 lg:px-8">
        {Array(5).fill(0).map((_, i) => (
          <div 
            key={i} 
            className="
              flex-shrink-0 animate-pulse bg-muted rounded-2xl 
              /* Class ini SAMAKAN dengan HorizontalCard di carousel */
              w-[75vw] sm:w-60 md:w-72 aspect-[2/3]
            "
          >
            <div className="h-full w-full flex flex-col justify-end p-4 space-y-2">
              {/* Title Placeholder */}
              <div className="h-6 bg-gray-400/30 rounded w-3/4" />
              {/* Subtitle Placeholder */}
              <div className="h-4 bg-gray-400/30 rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ========================
// 2. Grid Card Skeleton
// ========================
// Mengikuti bentuk AnimeCard: Aspect Ratio 2:3 + Metadata bawah
export function SkeletonCard() {
  return (
    <div className="flex flex-col h-full animate-pulse">
      {/* Image Wrapper: Aspect Ratio 2:3 */}
      <div className="relative w-full aspect-[2/3] bg-muted rounded-xl overflow-hidden">
        <div className="absolute inset-0 flex justify-center items-center text-muted-foreground/20 text-2xl">
          🎬
        </div>
      </div>

      {/* Content Wrapper */}
      <div className="p-3 flex flex-col gap-2 border-t border-border/50">
        {/* Title */}
        <div className="h-4 bg-muted rounded w-11/12" />
        <div className="h-4 bg-muted rounded w-2/3" />
        
        {/* Metadata (Episode/Type) */}
        <div className="flex justify-between mt-2">
          <div className="h-3 bg-muted rounded w-10" />
          <div className="h-3 bg-muted rounded w-8" />
        </div>
      </div>
    </div>
  )
}

// ========================
// 3. Grid Skeleton Layout
// ========================
// Grid system DISAMAKAN dengan page.tsx agar tidak ada layout shift
export function SkeletonGrid({ count = 10 }: { count?: number }) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
      {/* Header Section Dummy */}
      <div className="h-8 w-40 bg-muted rounded mb-4 animate-pulse" />

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 md:gap-6">
        {Array(count).fill(0).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    </div>
  )
}