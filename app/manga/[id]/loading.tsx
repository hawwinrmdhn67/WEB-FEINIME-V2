'use client'

import { Navbar } from '@/components/navbar'
import { SkeletonLoader } from '@/components/skeleton-loader'

export default function LoadingMangaPage() {
  return (
    <main className="min-h-screen bg-background overflow-x-hidden animate-pulse">

      {/* NAVBAR */}
      <div className="fixed top-0 left-0 w-full z-50">
        <Navbar />
      </div>

      {/* HERO BACKGROUND SKELETON */}
      <div className="relative h-112 md:h-128 w-full overflow-hidden">
        <div className="w-full h-full bg-muted dark:bg-muted/50 blur-sm opacity-60" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
      </div>

      {/* HEADER CONTENT */}
      <div className="relative z-20 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 
                      -mt-32 md:-mt-48 grid grid-cols-1 md:grid-cols-3 gap-8 pb-12">

        {/* POSTER */}
        <div className="relative w-48 md:w-64 mx-auto md:mx-0">
          <div className="w-full aspect-[2/3] bg-muted rounded-xl shadow-2xl" />
        </div>

        {/* INFO SECTION */}
        <div className="md:col-span-2 flex flex-col justify-end gap-5">

          {/* Titles */}
          <div className="space-y-3">
            <div className="h-10 w-3/4 bg-muted rounded-lg" />
            <div className="h-6 w-1/2 bg-muted rounded-lg" />
          </div>

          {/* Info Grid (Rating - Chapters - Author - Status) */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-card/80 p-4 rounded-lg shadow border border-border">
                <div className="h-4 w-20 bg-muted rounded mb-2" />
                <div className="h-6 w-14 bg-muted rounded" />
              </div>
            ))}
          </div>

          {/* MAL Button */}
          <div className="flex gap-4">
            <div className="w-48 h-10 bg-muted rounded-lg" />
          </div>
        </div>
      </div>

      {/* BODY */}
      <div className="relative max-w-6xl mx-auto mt-4 space-y-12 pb-20">

        {/* GENRES */}
        <div className="px-4 sm:px-6 lg:px-8 flex flex-wrap gap-2">
          <div className="h-8 w-24 bg-muted rounded-full" />
          <div className="h-8 w-20 bg-muted rounded-full" />
          <div className="h-8 w-28 bg-muted rounded-full" />
        </div>

        {/* SYNOPSIS */}
        <section className="px-4 sm:px-6 lg:px-8">
          <div className="h-8 w-40 bg-muted rounded mb-4" />
          <div className="space-y-3">
            <div className="h-4 w-full bg-muted rounded" />
            <div className="h-4 w-full bg-muted rounded" />
            <div className="h-4 w-5/6 bg-muted rounded" />
          </div>
        </section>

        {/* PUBLISHING INFO */}
        <section className="px-4 sm:px-6 lg:px-8">
          <div className="h-8 w-56 bg-muted rounded mb-4" />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-card/50 p-6 rounded-xl border border-border">
            {[1, 2, 3].map((x) => (
              <div key={x} className="flex items-center gap-3">
                <div className="w-10 h-10 bg-muted rounded-full" />
                <div className="space-y-1">
                  <div className="h-3 w-24 bg-muted rounded" />
                  <div className="h-4 w-28 bg-muted rounded" />
                </div>
              </div>
            ))}
          </div>
        </section>

      </div>

      {/* FOOTER SKELETON (gunakan SkeletonLoader agar konsisten dengan halaman lain) */}
      <SkeletonLoader type="footer" />
    </main>
  )
}
