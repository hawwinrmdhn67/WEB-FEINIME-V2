import { Navbar } from '@/components/navbar'
import { SkeletonLoader } from '@/components/skeleton-loader'

export default function Loading() {
  return (
    <main className="min-h-screen bg-background text-foreground flex flex-col">

      <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">

        {/* HEADER */}
        <SkeletonLoader type="page-header" />

        {/* GENRE ICONS */}
        <div className="flex flex-wrap gap-2 mb-12 mt-6">
          {Array.from({ length: 36 }).map((_, i) => (
            <div
              key={i}
              className="h-9 w-24 rounded-full bg-muted animate-pulse"
            />
          ))}
        </div>

        {/* TITLE */}
        <div className="h-6 w-52 bg-muted animate-pulse rounded mb-6" />

        {/* GRID */}
        <SkeletonLoader type="genres" count={12} />

        {/* PAGINATION */}
        <div className="flex justify-center gap-4 mt-12">
          <div className="h-10 w-28 rounded-md bg-muted animate-pulse" />
          <div className="h-4 w-20 bg-muted animate-pulse self-center rounded" />
          <div className="h-10 w-28 rounded-md bg-muted animate-pulse" />
        </div>
      </div>

      <SkeletonLoader type="footer" />
    </main>
  )
}
